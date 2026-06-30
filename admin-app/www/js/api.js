"use strict";
/* ASHVA · API client — talks to the real backend. Token in localStorage.
   Every call resolves to {ok:true,data} or {ok:false,error}; never throws.

   Two transport layers:
     - req()               → JSON fetch, 55 s timeout, used for everything
                             that's small (OTP, status, login, etc.).
     - uploadForm()        → XHR-based multipart upload, 180 s timeout,
                             with onProgress callback. Used for photo
                             uploads where the response body is small but
                             the request body can be many MB and we need
                             to show real upload progress to the user. */
window.API = (function () {
  const base = () => (window.ASHVA && window.ASHVA.API) || 'https://ashva-api-bb5c.onrender.com';
  const TKEY = 'ashva.token', SKEY = 'ashva.session';

  function getToken() { try { return localStorage.getItem(TKEY) || null; } catch { return null; } }
  function getSession() { try { const r = localStorage.getItem(SKEY); return r ? JSON.parse(r) : null; } catch { return null; } }
  function setSession(s) {
    try {
      if (s) { localStorage.setItem(TKEY, s.token); localStorage.setItem(SKEY, JSON.stringify(s)); }
      else { localStorage.removeItem(TKEY); localStorage.removeItem(SKEY); }
    } catch { /* ignore */ }
  }

  async function req(path, opts) {
    const o = opts || {};
    const headers = {};
    const token = o.token !== undefined ? o.token : getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;
    let body = o.body;
    if (o.form) { body = o.form; /* browser sets multipart boundary */ }
    else if (body !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(body); }
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 55000);
      const res = await fetch(base() + path, { method: o.method || 'GET', headers, body, signal: ctrl.signal });
      clearTimeout(t);
      const text = await res.text();
      let data = null;
      if (text) { try { data = JSON.parse(text); } catch { data = { message: text }; } }
      if (!res.ok) return { ok: false, error: { code: 'HTTP', message: (data && data.message) || ('Request failed (' + res.status + ')'), status: res.status } };
      return { ok: true, data };
    } catch (e) {
      const ab = e && e.name === 'AbortError';
      return { ok: false, error: { code: ab ? 'TIMEOUT' : 'NETWORK', message: ab ? 'Server is starting up — wait 30 s and try again.' : 'Network error — check your connection.' } };
    }
  }

  /* Multipart upload with real progress events. Falls back gracefully:
   *   - if XHR progress isn't supported, we still call onProgress(50) once
   *     before send() so the UI shows a sensible "in flight" state;
   *   - the response is parsed as JSON and shaped exactly like req() so
   *     the caller can treat the two transports identically;
   *   - the timeout is 3 min by default (uploads take longer than JSON
   *     POSTs — a 3 MB HEIC on 4G can easily be 60-90 s end-to-end).
   *
   *   onProgress(pct) is called with an integer 0-100. It may be called
   *   many times (XHR fires progress every ~50 ms on most browsers). */
  function uploadForm(path, form, opts) {
    const o = opts || {};
    const token = o.token !== undefined ? o.token : getToken();
    const timeoutMs = o.timeoutMs || 180000;
    const onProgress = typeof o.onProgress === 'function' ? o.onProgress : function () {};
    const url = base() + path;

    return new Promise(function (resolve) {
      let xhr;
      try {
        xhr = new XMLHttpRequest();
      } catch (e) {
        resolve({ ok: false, error: { code: 'XHR_UNSUPPORTED', message: 'This browser cannot upload files.' } });
        return;
      }
      let timedOut = false;
      const timer = setTimeout(function () {
        timedOut = true;
        try { xhr.abort(); } catch { /* ignore */ }
      }, timeoutMs);

      xhr.open(o.method || 'POST', url, true);
      if (token) xhr.setRequestHeader('Authorization', 'Bearer ' + token);
      // The browser sets the multipart boundary automatically when
      // we pass a FormData — DO NOT set Content-Type manually or the
      // boundary will be missing and multer will reject the upload.
      xhr.upload.onprogress = function (ev) {
        if (!ev.lengthComputable) { onProgress(0); return; }
        const pct = Math.max(0, Math.min(100, Math.round((ev.loaded / ev.total) * 100)));
        onProgress(pct);
      };
      xhr.onerror = function () {
        clearTimeout(timer);
        if (timedOut) {
          resolve({ ok: false, error: { code: 'TIMEOUT', message: 'Upload took longer than ' + Math.round(timeoutMs/1000) + ' s. Try a smaller image or check your connection.' } });
        } else {
          resolve({ ok: false, error: { code: 'NETWORK', message: 'Network error — check your connection.' } });
        }
      };
      xhr.onload = function () {
        clearTimeout(timer);
        // Multer's file-size error is delivered as a 413 status with a
        // HTML body, not JSON. Be tolerant here so the caller can show
        // a clean message regardless of payload.
        let data = null;
        const text = xhr.responseText || '';
        if (text) {
          try { data = JSON.parse(text); }
          catch {
            // Non-JSON body — use the raw text if it's short and useful,
            // otherwise fall back to a status-based message.
            data = { message: text.length < 200 ? text : null };
          }
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ ok: true, data });
        } else {
          // Map common status codes to user-friendly messages so the
          // admin app doesn't show a generic "Request failed (413)".
          let msg = (data && data.message) || ('Upload failed (' + xhr.status + ')');
          if (xhr.status === 413) msg = 'Image is too large. Please pick a smaller one (max 25 MB).';
          else if (xhr.status === 401) msg = 'Session expired — please sign in again.';
          else if (xhr.status === 502) msg = 'Storage server unreachable. Please try again in a moment.';
          resolve({ ok: false, error: { code: 'HTTP', message: msg, status: xhr.status } });
        }
      };
      try {
        xhr.send(form);
      } catch (e) {
        clearTimeout(timer);
        resolve({ ok: false, error: { code: 'SEND_FAILED', message: 'Could not start upload: ' + (e && e.message || 'unknown') } });
      }
    });
  }

  return {
    base, getToken, getSession, setSession,
    /* internal helpers (rarely used directly by screens) */
    req, uploadForm,
    startOtp: (channel, destination) => req('/auth/otp/start', { method: 'POST', body: { channel, destination } }),
    otpSignin: (p) => req('/auth/otp/signin', { method: 'POST', body: p }),
    googleSignin: (idToken) => req('/auth/signin/google', { method: 'POST', body: { idToken } }),
    contactStart: (channel, destination) => req('/contact/otp/start', { method: 'POST', body: { channel, destination } }),
    contactVerify: (challengeId, code) => req('/contact/verify', { method: 'POST', body: { challengeId, code } }),
    me: () => req('/me'),
    kycGet: () => req('/kyc'),
    kycSubmit: (form) => req('/kyc/submit', { method: 'POST', form }),
    assets: () => req('/context/assets'),
    bookingCreate: (p) => req('/bookings', { method: 'POST', body: p }),
    bookings: () => req('/bookings'),
    adminAuth: (email, password) => req('/admin/auth', { method: 'POST', body: { email, password }, token: null }),
    adminStats: (tok) => req('/admin/stats', { token: tok }),
    adminFleet: (tok) => req('/admin/fleet', { token: tok }),
    adminToggle: (tok, id, status) => req('/admin/fleet/'+id, { method: 'PATCH', body: { status }, token: tok }),
    adminAddBike: (tok, data) => req('/admin/fleet', { method: 'POST', body: data, token: tok }),
    /* Photo upload with real progress. `onProgress` receives 0-100 and
     * is called repeatedly while bytes flow. The Promise shape matches
     * the JSON req() helpers so screens can keep their `if (!r.ok)`
     * error handling uniform. */
    adminSetPhoto: (tok, id, formData, onProgress) => uploadForm('/admin/fleet/'+id+'/photo', formData, { method: 'PATCH', token: tok, onProgress: onProgress }),
    adminBookings: (tok) => req('/admin/bookings', { token: tok }),
    adminBookingStatus: (tok, id, status) => req('/admin/bookings/'+id, { method: 'PATCH', body: { status }, token: tok }),
    adminUsers: (tok) => req('/admin/users', { token: tok }),
    adminUserStatus: (tok, id, status) => req('/admin/users/'+id, { method: 'PATCH', body: { status }, token: tok }),
    adminKyc: (tok) => req('/admin/kyc', { token: tok }),
    adminKycVerdict: (tok, id, status) => req('/admin/kyc/'+id, { method: 'PATCH', body: { status }, token: tok }),
    /* The add-bike form also uploads a photo. Routes through the same
     * XHR path so the admin sees a single "UPLOADING… 47%" indicator. */
    adminUploadPhoto: (tok, formData, onProgress) => uploadForm('/admin/fleet/upload-photo', formData, { method: 'POST', token: tok, onProgress: onProgress }),
  };
})();

/* gatekeeper: which contact channel still needs verifying (null = done) */
function gateStep(user) {
  if (!user || !user.contact) return null;
  if (!user.contact.phoneVerified) return 'phone';
  if (!user.contact.emailVerified) return 'email';
  return null;
}
