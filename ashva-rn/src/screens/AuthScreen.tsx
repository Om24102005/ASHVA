/** Auth — email|mobile OTP + Google one-tap. Faithful RN port of www/js/screens/auth.js
 *  (hero image, serif headline, sharp segments/inputs/buttons). Real OTP TextInput
 *  with one-time-code autofill; Google via expo-auth-session. */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { CinematicImage } from '../components/CinematicImage';
import { Press } from '../components/Press';
import { Crest, Eyebrow } from '../components/chrome';
import { C, F } from '../theme';
import { rs, vs } from '../responsive';
import { API } from '../api';
import { CONFIG } from '../config';
import { ROUTES } from '../data';

WebBrowser.maybeCompleteAuthSession();
const IOS_CLIENT_ID = '994367484524-8f2ffl0gegqlcqe2mi9tkho2rbgqi7ul.apps.googleusercontent.com';

type Mode = 'email' | 'mobile';

function GoogleG() {
  return (
    <Svg width={rs(19)} height={rs(19)} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.3 17.6 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16z" />
      <Path fill="#FBBC05" d="M10.4 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.8-6.1C.9 15.9 0 19.8 0 23.5s.9 7.6 2.6 10.9l7.8-6.1z" />
      <Path fill="#34A853" d="M24 47c6.2 0 11.5-2 15.3-5.5l-7.1-5.5c-2 1.4-4.6 2.2-8.2 2.2-6.4 0-11.7-3.8-13.6-9.1l-7.8 6.1C6.5 41.6 14.6 47 24 47z" />
    </Svg>
  );
}

export function AuthScreen({ onAuthed }: { onAuthed: (session: any) => void }) {
  const [mode, setMode] = useState<Mode>('mobile');
  const [val, setVal] = useState('');
  const [step, setStep] = useState<'enter' | 'otp'>('enter');
  const [challengeId, setChallengeId] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const [gReq, gRes, gPrompt] = Google.useAuthRequest({ iosClientId: IOS_CLIENT_ID, webClientId: CONFIG.GOOGLE_WEB_CLIENT_ID });
  useEffect(() => {
    if (gRes?.type !== 'success') return;
    const idToken = gRes.params?.id_token || (gRes.authentication as any)?.idToken;
    if (!idToken) { setErr('Google sign-in failed.'); return; }
    (async () => {
      setBusy(true);
      const r = await API.googleSignin(idToken);
      setBusy(false);
      if (!r.ok) { setErr(r.error.message); return; }
      await API.setSession(r.data);
      onAuthed(r.data);
    })();
  }, [gRes]);

  const valid = mode === 'email' ? /^\S+@\S+\.\S+$/.test(val) : /^\d{10}$/.test(val.replace(/\D/g, ''));
  const channel = mode === 'email' ? 'email' : 'phone';
  const destination = () => (mode === 'email' ? val.trim().toLowerCase() : `+91 ${val.replace(/\D/g, '')}`);

  async function sendCode() {
    setErr(''); setBusy(true);
    const r = await API.startOtp(channel, destination());
    setBusy(false);
    if (!r.ok) { setErr(r.error.message); return; }
    setChallengeId((r.data as any).challengeId);
    setStep('otp');
  }
  async function verify() {
    setErr(''); setBusy(true);
    const r = await API.otpSignin({ channel, destination: destination(), challengeId, code, countryCode: '+91' });
    setBusy(false);
    if (!r.ok) { setErr(r.error.message); return; }
    await API.setSession(r.data);
    onAuthed(r.data);
  }

  return (
    <View style={styles.root}>
      {/* hero */}
      <View style={styles.hero}>
        <CinematicImage uri={ROUTES[0].photo} grad={ROUTES[0].grad} style={StyleSheet.absoluteFill as any}>
          <View />
        </CinematicImage>
        <LinearGradient colors={['rgba(23,17,13,0.45)', 'rgba(23,17,13,0.2)', C.base]} locations={[0, 0.3, 0.86]} style={StyleSheet.absoluteFill} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandRow}>
            <Crest size={rs(34)} />
            <Text style={styles.wordmark}>ASHVA</Text>
          </View>

          <Eyebrow color={C.sun}>{'// PAN-INDIA MOTO RENTALS'}</Eyebrow>
          <Text style={styles.h1}>The road is{'\n'}<Text style={styles.h1i}>calling.</Text></Text>

          {step === 'enter' ? (
            <View>
              <View style={styles.segRow}>
                {(['email', 'mobile'] as Mode[]).map((m) => (
                  <Press key={m} accessibilityLabel={m} onPress={() => { setMode(m); setVal(''); setErr(''); }} haptic={false} style={{ flex: 1 }}>
                    <View style={[styles.seg, mode === m && styles.segOn]}>
                      <Text style={[styles.segTxt, { color: mode === m ? C.ink : C.faint }]}>{m === 'email' ? 'EMAIL' : 'MOBILE'}</Text>
                    </View>
                  </Press>
                ))}
              </View>

              <View style={styles.inputWrap}>
                {mode === 'mobile' && <Text style={styles.cc}>+91</Text>}
                <TextInput
                  style={styles.input}
                  value={val}
                  onChangeText={(t) => setVal(mode === 'mobile' ? t.replace(/\D/g, '').slice(0, 10) : t)}
                  placeholder={mode === 'email' ? 'you@example.in' : '98765 43210'}
                  placeholderTextColor={C.faint}
                  keyboardType={mode === 'email' ? 'email-address' : 'number-pad'}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType={mode === 'email' ? 'emailAddress' : 'telephoneNumber'}
                />
              </View>

              {!!err && <Text style={styles.err}>{err}</Text>}

              <Press accessibilityLabel="Continue" onPress={() => { if (valid && !busy) sendCode(); }} style={{ marginTop: vs(4) }}>
                <View style={[styles.cta, !valid && styles.ctaOff]}>
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={[styles.ctaTxt, !valid && styles.ctaTxtOff]}>CONTINUE</Text>}
                </View>
              </Press>

              <View style={styles.orRow}><View style={styles.orLine} /><Text style={styles.orTxt}>OR</Text><View style={styles.orLine} /></View>

              <Press accessibilityLabel="Continue with Google" onPress={() => { if (gReq) gPrompt(); }} style={styles.gbtn}>
                <GoogleG />
                <Text style={styles.gtxt}>Continue with Google</Text>
              </Press>

              <Text style={styles.terms}>By continuing you agree to ASHVA’s{'\n'}Terms · Rental Policy · Privacy</Text>
            </View>
          ) : (
            <View>
              <Text style={styles.sentTo}>Code sent to <Text style={{ color: C.ink, fontWeight: '600' }}>{mode === 'mobile' ? '+91 ' + val : val}</Text></Text>
              <Press accessibilityLabel="Change contact" onPress={() => { setStep('enter'); setCode(''); setErr(''); }} haptic={false}>
                <Text style={styles.change}>‹ CHANGE</Text>
              </Press>
              <TextInput
                style={styles.otp}
                value={code}
                onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
                placeholder="••••••"
                placeholderTextColor={C.faint}
                keyboardType="number-pad"
                autoComplete="one-time-code"
                textContentType="oneTimeCode"
                maxLength={6}
                autoFocus
              />
              {!!err && <Text style={styles.err}>{err}</Text>}
              <Press accessibilityLabel="Verify" onPress={() => { if (code.length >= 4 && !busy) verify(); }}>
                <View style={[styles.cta, code.length < 4 && styles.ctaOff]}>
                  {busy ? <ActivityIndicator color="#fff" /> : <Text style={[styles.ctaTxt, code.length < 4 && styles.ctaTxtOff]}>VERIFY & CONTINUE</Text>}
                </View>
              </Press>
              <Text style={styles.resend}>Didn’t get it? <Text style={{ color: C.sun }} onPress={() => sendCode()}>Resend</Text></Text>
            </View>
          )}
          <View style={{ height: vs(40) }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.base },
  hero: { position: 'absolute', top: 0, left: 0, right: 0, height: vs(430) },
  scroll: { paddingHorizontal: rs(26), paddingTop: vs(72), paddingBottom: vs(40) },

  brandRow: { flexDirection: 'row', alignItems: 'center', gap: rs(12), marginBottom: vs(120) },
  wordmark: { fontFamily: F.mono, fontWeight: '700', letterSpacing: rs(5.5), fontSize: rs(17), color: C.ink },

  h1: { fontFamily: F.serif, fontSize: rs(50), lineHeight: rs(51), color: C.ink, marginTop: vs(14), marginBottom: vs(34) },
  h1i: { fontStyle: 'italic', color: C.ember },

  segRow: { flexDirection: 'row', gap: rs(6), marginBottom: vs(18) },
  seg: { paddingVertical: vs(11), alignItems: 'center', borderWidth: 1, borderColor: 'transparent' },
  segOn: { backgroundColor: 'rgba(244,235,221,0.06)', borderColor: C.line },
  segTxt: { fontFamily: F.mono, fontSize: rs(11), letterSpacing: rs(1.4) },

  inputWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(18), paddingVertical: vs(16), backgroundColor: C.surf, borderWidth: 1, borderColor: C.line, marginBottom: vs(14) },
  cc: { fontFamily: F.grotesk, fontWeight: '600', color: C.dim, fontSize: rs(16), paddingRight: rs(10), marginRight: rs(12), borderRightWidth: 1, borderRightColor: C.line },
  input: { flex: 1, color: C.ink, fontFamily: F.grotesk, fontWeight: '500', fontSize: rs(16) },

  err: { color: C.red, fontFamily: F.mono, fontSize: rs(11), marginBottom: vs(10) },

  cta: { paddingVertical: vs(17), alignItems: 'center', backgroundColor: C.ember },
  ctaOff: { backgroundColor: 'rgba(226,84,42,0.25)' },
  ctaTxt: { color: '#fff', fontFamily: F.mono, fontSize: rs(12), letterSpacing: rs(2.2) },
  ctaTxtOff: { color: 'rgba(255,255,255,0.4)' },

  orRow: { flexDirection: 'row', alignItems: 'center', gap: rs(14), marginVertical: vs(22) },
  orLine: { flex: 1, height: 1, backgroundColor: C.line },
  orTxt: { fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(2), color: C.faint },

  gbtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: rs(12), paddingVertical: vs(16), backgroundColor: C.surf, borderWidth: 1, borderColor: C.line },
  gtxt: { fontFamily: F.grotesk, fontWeight: '500', fontSize: rs(14), color: C.ink },

  terms: { textAlign: 'center', marginTop: vs(22), fontFamily: F.grotesk, fontSize: rs(11), color: C.faint, lineHeight: rs(19) },

  sentTo: { fontFamily: F.grotesk, fontSize: rs(13), color: C.dim, marginBottom: vs(6) },
  change: { fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(1.4), color: C.sun, marginBottom: vs(24) },
  otp: { color: C.ink, fontFamily: F.grotesk, fontSize: rs(30), letterSpacing: rs(14), textAlign: 'center', backgroundColor: C.surf, borderWidth: 1, borderColor: C.line, paddingVertical: vs(16), marginBottom: vs(16) },
  resend: { textAlign: 'center', marginTop: vs(20), fontFamily: F.grotesk, fontSize: rs(12), color: C.faint },
});
