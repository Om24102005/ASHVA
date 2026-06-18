/** Auth — channel-agnostic OTP sign-in (phone or email). Uses a real numeric
 *  TextInput with one-time-code autofill so the OS can paste/autofill the SMS
 *  code (the original web keypad blocked that). */
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { C, type, F, radius } from '../theme';
import { rs, vs } from '../responsive';
import { API } from '../api';

type Channel = 'phone' | 'email';

export function AuthScreen({ onAuthed }: { onAuthed: (session: any) => void }) {
  const [channel, setChannel] = useState<Channel>('phone');
  const [dest, setDest] = useState('');
  const [stage, setStage] = useState<'enter' | 'code'>('enter');
  const [challengeId, setChallengeId] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const destValid = channel === 'phone' ? dest.replace(/\D/g, '').length >= 6 : /\S+@\S+\.\S+/.test(dest);

  async function sendCode() {
    setErr(''); setBusy(true);
    const destination = channel === 'phone' ? `+91 ${dest.replace(/\D/g, '')}` : dest.trim().toLowerCase();
    const r = await API.startOtp(channel, destination);
    setBusy(false);
    if (!r.ok) { setErr(r.error.message); return; }
    setChallengeId((r.data as any).challengeId);
    setStage('code');
  }

  async function verify() {
    setErr(''); setBusy(true);
    const destination = channel === 'phone' ? `+91 ${dest.replace(/\D/g, '')}` : dest.trim().toLowerCase();
    const r = await API.otpSignin({ channel, destination, challengeId, code, countryCode: '+91' });
    setBusy(false);
    if (!r.ok) { setErr(r.error.message); return; }
    await API.setSession(r.data);
    onAuthed(r.data);
  }

  return (
    <Screen style={styles.root}>
      <LinearGradient colors={['#2a1d12', C.base]} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.body}>
        <View>
          <Text style={styles.brand}>ASHVA</Text>
          <Text style={styles.tagline}>Pan-India motorcycle & gear rental.</Text>
        </View>

        {stage === 'enter' ? (
          <View>
            <View style={styles.tabs}>
              {(['phone', 'email'] as Channel[]).map((ch) => (
                <Press key={ch} accessibilityLabel={`Use ${ch}`} style={styles.tabWrap} onPress={() => { setChannel(ch); setDest(''); setErr(''); }}>
                  <View style={[styles.tab, channel === ch && styles.tabOn]}>
                    <Text style={[styles.tabTxt, channel === ch && styles.tabTxtOn]}>{ch === 'phone' ? 'Phone' : 'Email'}</Text>
                  </View>
                </Press>
              ))}
            </View>
            <View style={styles.inputRow}>
              {channel === 'phone' && <Text style={styles.cc}>+91</Text>}
              <TextInput
                style={styles.input}
                value={dest}
                onChangeText={setDest}
                placeholder={channel === 'phone' ? 'Mobile number' : 'you@email.com'}
                placeholderTextColor={C.faint}
                keyboardType={channel === 'phone' ? 'number-pad' : 'email-address'}
                autoCapitalize="none"
                autoCorrect={false}
                inputMode={channel === 'phone' ? 'numeric' : 'email'}
                textContentType={channel === 'phone' ? 'telephoneNumber' : 'emailAddress'}
              />
            </View>
            {!!err && <Text style={styles.err}>{err}</Text>}
            <PrimaryButton label="Send code" disabled={!destValid || busy} busy={busy} onPress={sendCode} />
          </View>
        ) : (
          <View>
            <Text style={styles.codeHint}>Enter the 6-digit code sent to{'\n'}<Text style={{ color: C.ink }}>{dest}</Text></Text>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              placeholderTextColor={C.faint}
              keyboardType="number-pad"
              inputMode="numeric"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              autoFocus
            />
            {!!err && <Text style={styles.err}>{err}</Text>}
            <PrimaryButton label="Verify & continue" disabled={code.length < 4 || busy} busy={busy} onPress={verify} />
            <Press accessibilityLabel="Change destination" onPress={() => { setStage('enter'); setCode(''); setErr(''); }}>
              <Text style={styles.link}>‹ Change {channel}</Text>
            </Press>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function PrimaryButton({ label, onPress, disabled, busy }: { label: string; onPress: () => void; disabled?: boolean; busy?: boolean }) {
  return (
    <Press accessibilityLabel={label} onPress={() => { if (!disabled) onPress(); }} style={styles.btnWrap}>
      <View style={[styles.btn, disabled && styles.btnOff]}>
        {busy ? <ActivityIndicator color={C.base} /> : <Text style={styles.btnTxt}>{label}</Text>}
      </View>
    </Press>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: rs(24) },
  body: { flex: 1, justifyContent: 'space-between', paddingVertical: vs(40) },
  brand: { fontFamily: F.serif, color: C.ink, fontSize: rs(48), letterSpacing: rs(4) },
  tagline: { color: C.dim, fontSize: type.body, marginTop: vs(6) },
  tabs: { flexDirection: 'row', gap: rs(10), marginBottom: vs(16) },
  tabWrap: { flex: 1 },
  tab: { borderWidth: 1, borderColor: C.line, borderRadius: radius.pill, paddingVertical: vs(10), alignItems: 'center' },
  tabOn: { backgroundColor: C.surf, borderColor: C.ember },
  tabTxt: { color: C.faint, fontSize: type.label, fontWeight: '600' },
  tabTxtOn: { color: C.ink },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.line, borderRadius: radius.md, backgroundColor: C.surf, paddingHorizontal: rs(16) },
  cc: { color: C.dim, fontSize: type.body, marginRight: rs(8) },
  input: { flex: 1, color: C.ink, fontSize: type.h3, paddingVertical: vs(14) },
  codeHint: { color: C.dim, fontSize: type.body, textAlign: 'center', marginBottom: vs(20), lineHeight: type.body * 1.5 },
  codeInput: { color: C.ink, fontSize: rs(34), letterSpacing: rs(12), textAlign: 'center', borderWidth: 1, borderColor: C.line, borderRadius: radius.md, backgroundColor: C.surf, paddingVertical: vs(16) },
  err: { color: C.red, fontSize: type.label, marginTop: vs(10) },
  link: { color: C.faint, fontSize: type.label, textAlign: 'center', marginTop: vs(18) },
  btnWrap: { marginTop: vs(18) },
  btn: { backgroundColor: C.ember, borderRadius: radius.pill, paddingVertical: vs(16), alignItems: 'center' },
  btnOff: { backgroundColor: 'rgba(226,84,42,0.25)' },
  btnTxt: { color: C.base, fontSize: type.h3, fontWeight: '700' },
});
