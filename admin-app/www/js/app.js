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
    // wire file input after render
    this.mount();
  }

  mount() {
    // wire photo file input
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
    if (act === 'adminlogin') { this.login(); return; }
    if (act === 'adminout') { this.signOut(); return; }
    if (act === 'adminfleet') { this.s.admin.fleet = null; this.go('adminfleet'); return; }
    if (act === 'adminbookings') { this.s.admin.bookings = null; this.go('adminbookings'); return; }
    if (act === 'adminusers') { this.s.admin.users = null; this.go('adminusers'); return; }
    if (act === 'adminkyc') { this.s.admin.kyc = null; this.go('adminkyc'); return; }
    if (act === 'adminaddbike') { this.s.admin.addBike = {}; this.s.admin.photoFile = null; this.s.admin.photoPreview = null; this.go('adminaddbike'); return; }

    if (act === 'flttoggle') { this.toggleAsset(el.dataset.id, el.dataset.to); return; }
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

  async addBike() {
    const f = this.s.admin.addBike || {};
    if (!f.maker || !f.name || !f.pricePerDay) {
      this.flash('Manufacturer, name and price are required.', C.red);
      return;
    }

    let photoUrl = f.photoUrl || '';

    // upload photo if file selected
    if (this.s.admin.photoFile) {
      const fd = new FormData();
      fd.append('photo', this.s.admin.photoFile);
      const up = await API.adminUploadPhoto(this.s.adminToken, fd);
      if (up.ok && up.data && up.data.url) {
        photoUrl = up.data.url;
      }
      // ponytail: if upload fails, fall through to URL field or empty — non-blocking
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
