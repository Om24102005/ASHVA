/** Gatekeeper — compulsory verification of the missing contact channel.
 *  Ported from www/js/screens/gatekeeper.js: entered via email -> verify phone;
 *  via phone -> verify email. The `channel` prop says which one still needs
 *  verifying. Step 1 collects the destination and sends a code; step 2 takes a
 *  real 6-digit OTP (with one-time-code autofill) and verifies it. */
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { C, type, F, radius } from '../theme';
import { rs, vs, ms } from '../responsive';
import { API } from '../api';

export function GatekeeperScreen({
  session,
  channel,
  onVerified,
  onSkip,
}: {
  session: any;
  channel: 'phone' | 'email';
  onVerified: () => void;
  onSkip: () => void;
}) {
  const isPhone = channel === 'phone';

  const [dest, setDest] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const destValid = isPhone ? dest.replace(/\D/g, '').length >= 10 : /\S+@\S+\.\S+/.test(dest);
  const sentTo = isPhone ? `+91 ${dest.replace(/\D/g, '')}` : dest.trim().toLowerCase();

  async function send() {
    setErr('');
    setBusy(true);
    const r = await API.contactStart(channel, sentTo);
    setBusy(false);
    if (!r.ok) {
      setErr(r.error.message);
      return;
    }
    setChallengeId((r.data as any).challengeId);
    setCode('');
  }

  async function verify() {
    setErr('');
    setBusy(true);
    const r = await API.contactVerify(challengeId, code);
    setBusy(false);
    if (!r.ok) {
      setErr(r.error.message);
      return;
    }
    onVerified();
  }

  function editDestination() {
    setChallengeId('');
    setCode('');
    setErr('');
  }

  return (
    <Screen style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <Text style={styles.brand}>ASHVA</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeTxt}>STEP REQUIRED</Text>
          </View>

          <Text style={styles.h1}>
            Verify your{'\n'}
            <Text style={styles.h1Accent}>{isPhone ? 'phone.' : 'email.'}</Text>
          </Text>

          <Text style={styles.lede}>
            {isPhone
              ? 'You signed up with email — add a mobile number so we can reach you about your ride.'
              : 'You signed up with your phone — add an email so we can send booking receipts.'}
          </Text>

          {!challengeId ? (
            <View>
              <View style={styles.inputRow}>
                {isPhone && <Text style={styles.cc}>+91</Text>}
                <TextInput
                  style={styles.input}
                  value={dest}
                  onChangeText={setDest}
                  placeholder={isPhone ? '98765 43210' : 'you@example.in'}
                  placeholderTextColor={C.faint}
                  keyboardType={isPhone ? 'number-pad' : 'email-address'}
                  inputMode={isPhone ? 'numeric' : 'email'}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType={isPhone ? 'telephoneNumber' : 'emailAddress'}
                  maxLength={isPhone ? 11 : undefined}
                />
              </View>
              {!!err && <Text style={styles.err}>{err}</Text>}
              <PrimaryButton label="SEND VERIFICATION CODE" disabled={!destValid || busy} busy={busy} onPress={send} />
            </View>
          ) : (
            <View>
              <Text style={styles.sentHint}>
                Code sent to <Text style={styles.sentDest}>{sentTo}</Text>
              </Text>
              <Press accessibilityLabel={isPhone ? 'Edit number' : 'Edit email'} onPress={editDestination}>
                <Text style={styles.editLink}>{`‹ EDIT ${isPhone ? 'NUMBER' : 'EMAIL'}`}</Text>
              </Press>
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
              <PrimaryButton label="VERIFY" disabled={code.length < 6 || busy} busy={busy} onPress={verify} />
            </View>
          )}

          <Press accessibilityLabel="Skip for now" onPress={onSkip} style={styles.skipWrap}>
            <Text style={styles.skip}>SKIP FOR NOW →</Text>
          </Press>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function PrimaryButton({ label, onPress, disabled, busy }: { label: string; onPress: () => void; disabled?: boolean; busy?: boolean }) {
  return (
    <Press accessibilityLabel={label} onPress={() => { if (!disabled) onPress(); }} style={styles.btnWrap}>
      <View style={[styles.btn, disabled && styles.btnOff]}>
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTxt}>{label}</Text>}
      </View>
    </Press>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: rs(26) },
  flex: { flex: 1 },
  body: { paddingTop: vs(48), paddingBottom: vs(40) },
  brandRow: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(36) },
  brand: { fontFamily: F.mono, fontWeight: '700', letterSpacing: rs(6), fontSize: rs(15), color: C.ink },
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderColor: C.amber, paddingHorizontal: rs(10), paddingVertical: vs(5), marginBottom: vs(14) },
  badgeTxt: { fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(2), color: C.amber },
  h1: { fontFamily: F.serif, fontWeight: '400', fontSize: ms(40), lineHeight: ms(42), color: C.ink, marginBottom: vs(12) },
  h1Accent: { fontStyle: 'italic', color: C.ember },
  lede: { fontFamily: F.grotesk, fontSize: type.body, color: C.dim, lineHeight: type.body * 1.6, marginBottom: vs(28), maxWidth: rs(340) },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surf, borderWidth: 1, borderColor: C.line, paddingHorizontal: rs(18), paddingVertical: vs(16), marginBottom: vs(14) },
  cc: { fontFamily: F.grotesk, fontWeight: '600', color: C.dim, fontSize: rs(16), paddingRight: rs(10), marginRight: rs(12), borderRightWidth: 1, borderRightColor: C.line },
  input: { flex: 1, color: C.ink, fontFamily: F.grotesk, fontSize: rs(16), fontWeight: '500', letterSpacing: rs(1), padding: 0 },
  sentHint: { fontFamily: F.grotesk, fontSize: type.label, color: C.dim, marginBottom: vs(6) },
  sentDest: { color: C.ink, fontWeight: '600' },
  editLink: { fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(1.5), color: C.sun, marginBottom: vs(24) },
  codeInput: { color: C.ink, fontSize: rs(34), letterSpacing: rs(12), textAlign: 'center', borderWidth: 1, borderColor: C.line, backgroundColor: C.surf, paddingVertical: vs(16), marginBottom: vs(8) },
  err: { color: C.red, fontSize: type.label, marginTop: vs(4), marginBottom: vs(8) },
  btnWrap: { marginTop: vs(2) },
  btn: { backgroundColor: C.ember, paddingVertical: vs(17), alignItems: 'center', borderRadius: radius.sm },
  btnOff: { backgroundColor: 'rgba(226,84,42,0.25)' },
  btnTxt: { color: '#fff', fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(2) },
  skipWrap: { alignSelf: 'center', marginTop: vs(22) },
  skip: { fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(1.5), color: C.sun, textAlign: 'center' },
});
