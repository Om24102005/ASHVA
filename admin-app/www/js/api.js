"use strict";
/* ASHVA · API client — talks to the real backend. Token in localStorage.
   Every call resolves to {ok:true,data} or {ok:false,error}; never throws. */
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

  return {
    base, getToken, getSession, setSession,
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
    adminBookings: (tok) => req('/admin/bookings', { token: tok }),
    adminBookingStatus: (tok, id, status) => req('/admin/bookings/'+id, { method: 'PATCH', body: { status }, token: tok }),
    adminUsers: (tok) => req('/admin/users', { token: tok }),
    adminUserStatus: (tok, id, status) => req('/admin/users/'+id, { method: 'PATCH', body: { status }, token: tok }),
    adminKyc: (tok) => req('/admin/kyc', { token: tok }),
    adminKycVerdict: (tok, id, status) => req('/admin/kyc/'+id, { method: 'PATCH', body: { status }, token: tok }),
    adminUploadPhoto: (tok, formData) => req('/admin/fleet/upload-photo', { method: 'POST', form: formData, token: tok }),
  };
})();

/* gatekeeper: which contact channel still needs verifying (null = done) */
function gateStep(user) {
  if (!user || !user.contact) return null;
  if (!user.contact.phoneVerified) return 'phone';
  if (!user.contact.emailVerified) return 'email';
  return null;
}
