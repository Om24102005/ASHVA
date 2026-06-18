/** ASHVA API client (RN). Mirrors www/js/api.js but uses AsyncStorage for the
 *  token and CONFIG.API (cloud URL) for the base. Every call resolves to
 *  {ok:true,data} | {ok:false,error} — never throws. */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from './config';

const TKEY = 'ashva.token';
const SKEY = 'ashva.session';

export type ApiResult<T = any> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; status?: number } };

let tokenCache: string | null = null;

export async function getToken(): Promise<string | null> {
  if (tokenCache) return tokenCache;
  tokenCache = await AsyncStorage.getItem(TKEY);
  return tokenCache;
}

export async function getSession(): Promise<any | null> {
  const raw = await AsyncStorage.getItem(SKEY);
  return raw ? JSON.parse(raw) : null;
}

export async function setSession(s: any | null): Promise<void> {
  if (s) {
    tokenCache = s.token;
    await AsyncStorage.multiSet([[TKEY, s.token], [SKEY, JSON.stringify(s)]]);
  } else {
    tokenCache = null;
    await AsyncStorage.multiRemove([TKEY, SKEY]);
  }
}

type ReqOpts = { method?: string; body?: any; form?: FormData; token?: string | null };

async function req<T = any>(path: string, opts: ReqOpts = {}): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  const token = opts.token !== undefined ? opts.token : await getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;

  let body: any = opts.body;
  if (opts.form) body = opts.form; // RN sets multipart boundary
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(body);
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const res = await fetch(CONFIG.API + path, { method: opts.method || 'GET', headers, body, signal: ctrl.signal });
    clearTimeout(timer);
    const text = await res.text();
    let data: any = null;
    if (text) { try { data = JSON.parse(text); } catch { data = { message: text }; } }
    if (!res.ok) return { ok: false, error: { code: 'HTTP', message: (data && data.message) || `Request failed (${res.status})`, status: res.status } };
    return { ok: true, data };
  } catch (e: any) {
    clearTimeout(timer);
    const ab = e && e.name === 'AbortError';
    return { ok: false, error: { code: ab ? 'TIMEOUT' : 'NETWORK', message: ab ? 'The request timed out.' : 'Network error — check your connection.' } };
  }
}

export const API = {
  base: () => CONFIG.API,
  getToken, getSession, setSession,
  startOtp: (channel: string, destination: string) => req('/auth/otp/start', { method: 'POST', body: { channel, destination } }),
  otpSignin: (p: any) => req('/auth/otp/signin', { method: 'POST', body: p }),
  googleSignin: (idToken: string) => req('/auth/signin/google', { method: 'POST', body: { idToken } }),
  contactStart: (channel: string, destination: string) => req('/contact/otp/start', { method: 'POST', body: { channel, destination } }),
  contactVerify: (challengeId: string, code: string) => req('/contact/verify', { method: 'POST', body: { challengeId, code } }),
  me: () => req('/me'),
  kycGet: () => req('/kyc'),
  kycSubmit: (form: FormData) => req('/kyc/submit', { method: 'POST', form }),
  assets: () => req('/context/assets'),
  bookingCreate: (p: any) => req('/bookings', { method: 'POST', body: p }),
  bookings: () => req('/bookings'),
};

/** gatekeeper: which contact channel still needs verifying (null = done) */
export function gateStep(user: any): 'phone' | 'email' | null {
  if (!user || !user.contact) return null;
  if (!user.contact.phoneVerified) return 'phone';
  if (!user.contact.emailVerified) return 'email';
  return null;
}
