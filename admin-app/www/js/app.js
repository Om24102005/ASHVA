"use strict";
/* ASHVA Admin · standalone state machine */

const ATKEY = 'ashva.admin.token';

class AdminApp {
  constructor() {
    this.s = {
      screen: 'login',
      adminToken: null,
      adminEmail: '',
      adminPw: '',
      flash: null,
      admin: {
        stats: null,
        fleet: null,
        bookings: null,
        users: null,
        kyc: null,
        addBike: {},
        photoFile: null,
        photoPreview: null,
      },
      // Transient state for the per-bike photo-replace flow. We keep
      // `photoBusyAssetId` so the fleet card can show a spinner on the
      // bike currently being updated and a disabled state on the rest
      // of the UI. `photoProgress` is the integer 0-100 reported by the
      // XHR upload's onprogress event (or null when no upload is in
      // flight). Screens read both to render a real progress bar.
      photoBusyAssetId: null,
      photoProgress: null,
    };
    this._prev = null;
    this._flashTimer = null;

    // restore token
    try { this.s.adminToken = localStorage.getItem(ATKEY) || null; } catch { /* ignore */ }
    if (this.s.adminToken) {
      this.s.screen = 'admin';
    }

    document.getElementById('app').addEventListener('click', e => this.onClick(e));
    document.getElementById('app').addEventListener('input', e => this.onInput(e));
    this.render();
    if (this.s.adminToken) this.mount();
  }

  render() {
    const el = document.getElementById('app');
    const views = {
      login: viewLogin,
      admin: viewAdmin,
      adminfleet: viewAdminFleet,
      adminaddbike: viewAdminAddBike,
      adminbookings: viewAdminBookings,
      adminusers: viewAdminUsers,
      adminkyc: viewAdminKyc,
    };
    const fn = views[this.s.screen];
    if (!fn) return;
    el.innerHTML = fn(this);
    // wire file inputs after render
    this.mount();
  }

  mount() {
    // Wire the add-bike form's photo input. The per-card photo picker
    // is created on demand by openCardPhotoPicker() — see below.
    const photoIn = document.getElementById('photoFileIn');
    if (photoIn) {
      photoIn.addEventListener('change', e => this.onPhotoChange(e));
    }

    // load data for screens that need it
    const tok = this.s.adminToken;
    if (!tok) return;
    const sc = this.s.screen;
    if (sc === 'admin' && !this.s.admin.stats) this.loadStats();
    if (sc === 'adminfleet' && !this.s.admin.fleet) this.loadFleet();
    if (sc === 'adminbookings' && !this.s.admin.bookings) this.loadBookings();
    if (sc === 'adminusers' && !this.s.admin.users) this.loadUsers();
    if (sc === 'adminkyc' && !this.s.admin.kyc) this.loadKyc();
  }

  go(screen) {
    this._prev = this.s.screen;
    this.s.screen = screen;
    this.render();
  }

  back() {
    const dest = this._prev || 'admin';
    this._prev = null;
    this.s.screen = dest;
    this.render();
  }

  onInput(e) {
    const id = e.target && e.target.id;
    if (!id) return;
    if (id === 'adminEmailIn') { this.s.adminEmail = e.target.value; return; }
    if (id === 'adminPwIn') { this.s.adminPw = e.target.value; return; }
    if (id.startsWith('ab_')) {
      const key = id.slice(3);
      this.s.admin.addBike[key] = e.target.value;
    }
  }

  onPhotoChange(e) {
    const file = e.target && e.target.files && e.target.files[0];
    if (!file) return;
    this.s.admin.photoFile = file;
    const reader = new FileReader();
    reader.onload = ev => {
      this.s.admin.photoPreview = ev.target.result;
      this.render();
    };
    reader.readAsDataURL(file);
  }

  flash(msg, col) {
    if (this._flashTimer) clearTimeout(this._flashTimer);
    this.s.flash = { msg, col: col || C.sun };
    this.render();
    this._flashTimer = setTimeout(() => {
      this.s.flash = null;
      this._flashTimer = null;
      this.render();
    }, 3000);
  }

  onClick(e) {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;

    if (act === 'back') { this.back(); return; }
    if (act === 'reload') { this.reload(); return; }
    if (act === 'adminlogin') { this.login(); return; }
    if (act === 'adminout') { this.signOut(); return; }
    if (act === 'adminfleet') { this.s.admin.fleet = null; this.go('adminfleet'); return; }
    if (act === 'adminbookings') { this.s.admin.bookings = null; this.go('adminbookings'); return; }
    if (act === 'adminusers') { this.s.admin.users = null; this.go('adminusers'); return; }
    if (act === 'adminkyc') { this.s.admin.kyc = null; this.go('adminkyc'); return; }
    if (act === 'adminaddbike') { this.s.admin.addBike = {}; this.s.admin.photoFile = null; this.s.admin.photoPreview = null; this.s.photoBusyAssetId = null; this.s.photoProgress = null; this.go('adminaddbike'); return; }

    if (act === 'flttoggle') { this.toggleAsset(el.dataset.id, el.dataset.to); return; }
    /* "Change photo" button on a fleet card. Builds a one-shot file
     * input on the fly, opens the OS file picker, and self-cleans
     * once the user picks (or cancels). Building the input fresh
     * each time avoids the well-known iOS WebView bug where a hidden
     * <input type="file"> that's been in the DOM across renders stops
     * firing `change` on the second pick. */
    if (act === 'fltedit') { this.openCardPhotoPicker(el.dataset.id); return; }
    if (act === 'submitaddbike') { this.addBike(); return; }
    if (act === 'bkstatus') { this.bookingStatus(el.dataset.id, el.dataset.s); return; }
    if (act === 'usrstatus') { this.userStatus(el.dataset.id, el.dataset.s); return; }
    if (act === 'kycverdict') { this.kycVerdict(el.dataset.id, el.dataset.v); return; }
  }

  async login() {
    const email = this.s.adminEmail.trim();
    const pw = this.s.adminPw;
    if (!email || !pw) { this.flash('Enter email and password.', C.red); return; }
    const r = await API.adminAuth(email, pw);
    if (!r.ok) { this.flash(r.error.message, C.red); return; }
    const tok = r.data && r.data.data && r.data.data.token;
    if (!tok) { this.flash('No token received.', C.red); return; }
    this.s.adminToken = tok;
    try { localStorage.setItem(ATKEY, tok); } catch { /* ignore */ }
    this.s.adminPw = '';
    this.s.admin = { stats: null, fleet: null, bookings: null, users: null, kyc: null, addBike: {}, photoFile: null, photoPreview: null };
    this.go('admin');
  }

  signOut() {
    this.s.adminToken = null;
    try { localStorage.removeItem(ATKEY); } catch { /* ignore */ }
    this.s.admin = { stats: null, fleet: null, bookings: null, users: null, kyc: null, addBike: {}, photoFile: null, photoPreview: null };
    this.s.adminEmail = '';
    this.s.adminPw = '';
    this.go('login');
  }

  async loadStats() {
    const r = await API.adminStats(this.s.adminToken);
    if (!r.ok) { this.flash(r.error.message, C.red); return; }
    this.s.admin.stats = r.data;
    this.render();
  }

  async loadFleet() {
    const r = await API.adminFleet(this.s.adminToken);
    if (!r.ok) { this.flash(r.error.message, C.red); return; }
    this.s.admin.fleet = r.data.assets;
    this.render();
  }

  async loadBookings() {
    const r = await API.adminBookings(this.s.adminToken);
    if (!r.ok) { this.flash(r.error.message, C.red); return; }
    this.s.admin.bookings = r.data.bookings;
    this.render();
  }

  async loadUsers() {
    const r = await API.adminUsers(this.s.adminToken);
    if (!r.ok) { this.flash(r.error.message, C.red); return; }
    this.s.admin.users = r.data.users;
    this.render();
  }

  async loadKyc() {
    const r = await API.adminKyc(this.s.adminToken);
    if (!r.ok) { this.flash(r.error.message, C.red); return; }
    this.s.admin.kyc = r.data.records;
    this.render();
  }

  async toggleAsset(id, status) {
    const r = await API.adminToggle(this.s.adminToken, id, status);
    if (!r.ok) { this.flash(r.error.message, C.red); return; }
    // update local state
    const asset = this.s.admin.fleet && this.s.admin.fleet.find(a => String(a.id) === String(id));
    if (asset) asset.status = status;
    this.flash('Status updated.', C.green);
  }

  /* Triggers the OS file picker for a specific fleet card. We build a
   * fresh <input type="file"> on each click and click it programmatically
   * on the next microtask. This is more robust than reusing a hidden
   * input across renders — some iOS WebView builds (and a few Android
   * ones) stop dispatching `change` on a long-lived hidden file input
   * after the first pick. Building fresh per click also means we never
   * need to worry about the input being missing from the DOM (which is
   * the failure mode behind the "edit button does nothing" bug). */
  openCardPhotoPicker(assetId) {
    if (!assetId) { this.flash('No asset selected', C.red); return; }
    if (this.s.photoBusyAssetId) { this.flash('Another upload in progress…', C.amber); return; }

    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    // Some iOS WebViews will refuse to open the picker if the input is
    // not attached to the DOM. Hidden via opacity:0 + position:fixed
    // off-screen (rather than display:none) is the widely-recommended
    // workaround for WKWebView.
    inp.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0;width:1px;height:1px;pointer-events:none;';
    inp.dataset.assetId = String(assetId);

    const self = this;
    inp.addEventListener('change', function onPick(ev) {
      inp.removeEventListener('change', onPick);
      const file = ev.target.files && ev.target.files[0];
      try { document.body.removeChild(inp); } catch { /* may already be gone */ }
      if (!file) return; // user cancelled — silent
      self.setBikePhoto(String(assetId), file);
    });

    document.body.appendChild(inp);

    // Defer the click to the next microtask so the input is definitely
    // in the DOM when WKWebView checks, and so the synthetic click
    // isn't blocked by the same gesture that mounted us.
    const trigger = () => {
      try { inp.click(); }
      catch (err) {
        try { document.body.removeChild(inp); } catch { /* ignore */ }
        self.flash('Could not open file picker: ' + (err && err.message || 'unknown'), C.red);
      }
    };
    if (typeof queueMicrotask === 'function') queueMicrotask(trigger);
    else setTimeout(trigger, 0);
  }

  /* Uploads `file` to the server for the given asset and patches the
   * local fleet record on success. While the upload is in flight we
   * mark `photoBusyAssetId` + `photoProgress` so the card can show a
   * real "UPLOADING… 47%" progress bar. The XHR-based transport in
   * API.uploadForm() reports onprogress for every chunk so the user
   * sees bytes actually flowing, not just a static spinner.
   *
   * The SSE bus will also fire an 'asset' event the server emits after
   * the update, but we patch the local record first so the admin sees
   * an instant UI update. */
  async setBikePhoto(assetId, file) {
    if (this.s.photoBusyAssetId) { this.flash('Another upload in progress…', C.amber); return; }
    if (!file || !file.type || !file.type.startsWith('image/')) {
      this.flash('Pick an image file', C.red); return;
    }
    // 25 MB ceiling matches the server's multer limit. iPhone ProRAW
    // and HEIC images can be 12-18 MB so 25 MB gives a comfortable
    // margin. The error message is from the server's clean 413
    // response if the user picks something larger.
    if (file.size > 25 * 1024 * 1024) {
      this.flash('Image must be under 25 MB', C.red); return;
    }

    const self = this;
    this.s.photoBusyAssetId = String(assetId);
    this.s.photoProgress = 0;
    this.render();

    const fd = new FormData();
    fd.append('photo', file);

    const r = await API.adminSetPhoto(this.s.adminToken, assetId, fd, function (pct) {
      // Throttle re-renders to every ~5% so we don't thrash the DOM
      // with XHR's ~50 ms progress cadence. The final 100% lands
      // naturally just before the response returns.
      const prev = self.s.photoProgress || 0;
      if (pct === 100 || pct - prev >= 5 || pct < prev) {
        self.s.photoProgress = pct;
        self.render();
      }
    });

    this.s.photoBusyAssetId = null;
    this.s.photoProgress = null;
    if (!r.ok) {
      this.flash((r.error && r.error.message) || 'Photo upload failed', C.red);
      this.render();
      return;
    }
    // Patch the local record so the card shows the new image immediately
    // without waiting for the SSE round-trip. The server has already
    // emitted the SSE 'asset' event by the time we land here, so any
    // connected user panel will also see the change.
    const url = r.data && r.data.url;
    const asset = this.s.admin.fleet && this.s.admin.fleet.find(a => String(a.id) === String(assetId));
    if (asset && url) asset.photo_url = url;
    this.flash('Photo updated', C.green);
    this.render();
  }

  async addBike() {
    const f = this.s.admin.addBike || {};
    if (!f.maker || !f.name || !f.pricePerDay) {
      this.flash('Manufacturer, name and price are required.', C.red);
      return;
    }

    let photoUrl = f.photoUrl || '';

    // upload photo if file selected
    if (this.s.admin.photoFile) {
      const self = this;
      // Mark the add-bike screen as "uploading" so the submit button
      // can show progress. We reuse `photoBusyAssetId` (sentinel
      // value "add") and `photoProgress` for the percent.
      this.s.photoBusyAssetId = 'add';
      this.s.photoProgress = 0;
      this.render();

      const fd = new FormData();
      fd.append('photo', this.s.admin.photoFile);
      const up = await API.adminUploadPhoto(this.s.adminToken, fd, function (pct) {
        const prev = self.s.photoProgress || 0;
        if (pct === 100 || pct - prev >= 5 || pct < prev) {
          self.s.photoProgress = pct;
          self.render();
        }
      });
      this.s.photoBusyAssetId = null;
      this.s.photoProgress = null;
      if (up.ok && up.data && up.data.url) {
        photoUrl = up.data.url;
      } else if (!up.ok) {
        // Surface the upload error but still let the admin submit
        // the bike (with a missing photo). The create endpoint
        // accepts an empty photoUrl.
        this.flash('Photo upload failed: ' + (up.error && up.error.message || 'unknown') + ' — bike will be added without a photo.', C.amber);
      }
    }

    const feats = (f.features || '').split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      maker: f.maker, name: f.name, kicker: f.kicker || '',
      engine: f.engine || '', power: f.power || '', range: f.range || '',
      torque: f.torque || '', topSpeed: f.topSpeed || '', weight: f.weight || '',
      about: f.about || '', features: feats,
      pricePerDay: Number(f.pricePerDay), photoUrl,
    };

    const r = await API.adminAddBike(this.s.adminToken, payload);
    if (!r.ok) { this.flash(r.error.message, C.red); return; }
    this.flash('Bike added to fleet!', C.green);
    this.s.admin.fleet = null; // force reload next visit
    this.s.admin.addBike = {};
    this.s.admin.photoFile = null;
    this.s.admin.photoPreview = null;
    setTimeout(() => this.go('adminfleet'), 1200);
  }

  async bookingStatus(id, status) {
    const r = await API.adminBookingStatus(this.s.adminToken, id, status);
    if (!r.ok) { this.flash(r.error.message, C.red); return; }
    const bk = this.s.admin.bookings && this.s.admin.bookings.find(b => String(b.id) === String(id));
    if (bk) bk.status = status;
    this.flash('Booking updated.', C.green);
  }

  async userStatus(id, status) {
    const r = await API.adminUserStatus(this.s.adminToken, id, status);
    if (!r.ok) { this.flash(r.error.message, C.red); return; }
    const u = this.s.admin.users && this.s.admin.users.find(x => String(x.id) === String(id));
    if (u) u.status = status;
    this.flash('User updated.', C.green);
  }

  reload() {
    const sc = this.s.screen;
    if (sc === 'admin') { this.s.admin.stats = null; this.loadStats(); this.flash('Refreshed', C.green); return; }
    if (sc === 'adminfleet') { this.s.admin.fleet = null; this.loadFleet(); return; }
    if (sc === 'adminbookings') { this.s.admin.bookings = null; this.loadBookings(); return; }
    if (sc === 'adminusers') { this.s.admin.users = null; this.loadUsers(); return; }
    if (sc === 'adminkyc') { this.s.admin.kyc = null; this.loadKyc(); return; }
  }

  async kycVerdict(id, verdict) {
    const r = await API.adminKycVerdict(this.s.adminToken, id, verdict);
    if (!r.ok) { this.flash(r.error.message, C.red); return; }
    // remove from pending list on approve/reject
    if (verdict !== 'in_review' && this.s.admin.kyc) {
      this.s.admin.kyc = this.s.admin.kyc.filter(k => String(k.id) !== String(id));
    }
    this.flash('KYC verdict saved.', C.green);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new AdminApp();
});
