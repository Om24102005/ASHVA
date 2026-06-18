/** KYC — Booking Step 3. Capture a government ID + photos natively and upload to
 *  ASHVA. Ported from www/js/screens/kyc.js. No DigiLocker / no third party —
 *  documents are verified in-house. Adds native camera capture with a thumbnail
 *  preview + retake/remove per slot before submit. */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { C, type, F, radius } from '../theme';
import { rs, vs, ms } from '../responsive';
import { API } from '../api';

type DocType = 'aadhaar' | 'pan' | 'passport' | 'driving_licence' | 'voter_id';
type SlotKey = 'front' | 'back' | 'selfie';

const KYC_DOCS: [DocType, string][] = [
  ['aadhaar', 'Aadhaar'],
  ['pan', 'PAN'],
  ['passport', 'Passport'],
  ['driving_licence', 'Driving Licence'],
  ['voter_id', 'Voter ID'],
];

const SLOTS: { key: SlotKey; label: string }[] = [
  { key: 'front', label: 'DOCUMENT FRONT' },
  { key: 'back', label: 'DOCUMENT BACK' },
  { key: 'selfie', label: 'SELFIE' },
];

/** Inline per-type validation. Returns a hint to show + whether the value is OK. */
function validateId(docType: DocType, raw: string): { hint: string; valid: boolean } {
  const v = raw.trim();
  switch (docType) {
    case 'aadhaar': {
      const digits = v.replace(/\s/g, '');
      return { hint: 'Aadhaar — 12 digits', valid: /^\d{12}$/.test(digits) };
    }
    case 'pan':
      return { hint: 'PAN — ABCDE1234F', valid: /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.toUpperCase()) };
    case 'passport':
      return { hint: 'Passport — e.g. A1234567', valid: /^[A-Z][0-9]{7}$/.test(v.toUpperCase()) };
    case 'driving_licence':
      return { hint: 'Driving Licence number', valid: v.length >= 8 };
    case 'voter_id':
      return { hint: 'Voter ID (EPIC) number', valid: v.length >= 8 };
    default:
      return { hint: 'ID number', valid: v.length > 0 };
  }
}

export function KYCScreen({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [docType, setDocType] = useState<DocType>('aadhaar');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [shots, setShots] = useState<Partial<Record<SlotKey, string>>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const { hint, valid: idValid } = validateId(docType, idNumber);
  const allShots = SLOTS.every((s) => !!shots[s.key]);
  const canSubmit = idValid && fullName.trim().length > 1 && allShots && !busy;

  async function capture(slot: SlotKey) {
    setErr('');
    const opts: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    };
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      let result: ImagePicker.ImagePickerResult;
      if (perm.granted) {
        result = await ImagePicker.launchCameraAsync(opts);
      } else {
        // Camera denied — fall back to the photo library so the flow isn't blocked.
        const lib = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!lib.granted) {
          Alert.alert(
            'Permission needed',
            'Allow camera or photo access to add your document photos.'
          );
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync(opts);
      }
      if (result.canceled || !result.assets || !result.assets[0]) return;
      setShots((prev) => ({ ...prev, [slot]: result.assets![0].uri }));
    } catch {
      setErr('Could not open the camera. Please try again.');
    }
  }

  function remove(slot: SlotKey) {
    setShots((prev) => {
      const next = { ...prev };
      delete next[slot];
      return next;
    });
  }

  async function submit() {
    if (!canSubmit) return;
    setErr('');
    setBusy(true);

    const form = new FormData();
    form.append('docType', docType);
    form.append('idNumber', idNumber.trim().toUpperCase());
    form.append('fullName', fullName.trim());
    SLOTS.forEach((s) => {
      const uri = shots[s.key];
      if (uri) {
        // RN FormData file convention — uri/name/type.
        form.append(s.key, {
          uri,
          name: `${s.key}.jpg`,
          type: 'image/jpeg',
        } as any);
      }
    });

    const r = await API.kycSubmit(form);
    setBusy(false);
    if (r.ok && (r.data as any)?.ok !== false) {
      onDone();
    } else {
      const msg =
        (!r.ok && r.error.message) ||
        (r.ok && (r.data as any)?.message) ||
        'Submission failed. Please try again.';
      setErr(msg);
    }
  }

  return (
    <Screen style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.topbar}>
          <Press accessibilityLabel="Go back" onPress={onBack} style={styles.back}>
            <Text style={styles.backTxt}>‹</Text>
          </Press>
          <Text style={styles.topTitle}>IDENTITY · STEP 3</Text>
          <View style={styles.back} />
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.h2}>
            Verify your{'\n'}
            <Text style={styles.h2Italic}>identity.</Text>
          </Text>
          <Text style={styles.lead}>
            Indian law requires a valid government ID to rent. ASHVA verifies it in-house — your
            documents stay yours.
          </Text>

          <Text style={styles.eyebrow}>// DOCUMENT TYPE</Text>
          <View style={styles.chips}>
            {KYC_DOCS.map(([key, label]) => {
              const on = docType === key;
              return (
                <Press
                  key={key}
                  accessibilityLabel={`Document type ${label}`}
                  onPress={() => {
                    setDocType(key);
                    setErr('');
                  }}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Text style={[styles.chipTxt, on && styles.chipTxtOn]}>{label}</Text>
                </Press>
              );
            })}
          </View>

          <View style={styles.field}>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full name (as on ID)"
              placeholderTextColor={C.faint}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <TextInput
              style={[styles.input, styles.inputId]}
              value={idNumber}
              onChangeText={(t) => {
                setIdNumber(t);
                setErr('');
              }}
              placeholder="ID number"
              placeholderTextColor={C.faint}
              autoCapitalize="characters"
              autoCorrect={false}
              keyboardType={docType === 'aadhaar' ? 'number-pad' : 'default'}
            />
          </View>
          <Text style={[styles.hint, idNumber.length > 0 && (idValid ? styles.hintOk : styles.hintBad)]}>
            {hint}
            {idNumber.length > 0 ? (idValid ? '  ✓' : '  — check format') : ''}
          </Text>

          <Text style={styles.eyebrow}>// DOCUMENT PHOTOS</Text>
          <View style={styles.slots}>
            {SLOTS.map((s) => {
              const uri = shots[s.key];
              return (
                <View key={s.key} style={styles.slotCol}>
                  {uri ? (
                    <View style={styles.thumbWrap}>
                      <Image source={{ uri }} style={styles.thumb} resizeMode="cover" />
                      <Press
                        accessibilityLabel={`Remove ${s.label}`}
                        onPress={() => remove(s.key)}
                        style={styles.removeBtn}
                      >
                        <Text style={styles.removeTxt}>×</Text>
                      </Press>
                      <Press
                        accessibilityLabel={`Retake ${s.label}`}
                        onPress={() => capture(s.key)}
                        style={styles.retakeBtn}
                      >
                        <Text style={styles.retakeTxt}>RETAKE</Text>
                      </Press>
                    </View>
                  ) : (
                    <Press
                      accessibilityLabel={`Capture ${s.label}`}
                      onPress={() => capture(s.key)}
                      style={styles.slotEmpty}
                    >
                      <Text style={styles.slotPlus}>+</Text>
                    </Press>
                  )}
                  <Text style={styles.slotLabel}>{s.label}</Text>
                </View>
              );
            })}
          </View>

          {!!err && <Text style={styles.err}>{err}</Text>}

          <Press
            accessibilityLabel="Submit for verification"
            onPress={submit}
            style={[styles.submit, !canSubmit && styles.submitOff]}
          >
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitTxt}>
                {err ? 'RETRY SUBMISSION' : 'SUBMIT FOR VERIFICATION'}
              </Text>
            )}
          </Press>

          <View style={styles.privacy}>
            <Text style={styles.lock}>🔒</Text>
            <Text style={styles.privacyTxt}>
              Encrypted upload · reviewed by ASHVA · never shared with third parties.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {},
  flex: { flex: 1 },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingVertical: vs(8),
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  back: { width: rs(44), alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: C.ink, fontSize: ms(28), lineHeight: ms(30) },
  topTitle: { color: C.dim, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(1.5) },

  scroll: { paddingHorizontal: rs(24), paddingTop: vs(18), paddingBottom: vs(48) },

  h2: { fontFamily: F.serif, color: C.ink, fontSize: type.h1, lineHeight: type.h1 * 1.05, marginBottom: vs(8) },
  h2Italic: { fontStyle: 'italic', color: C.ember },
  lead: { fontFamily: F.grotesk, color: C.dim, fontSize: type.label, lineHeight: type.label * 1.6 },

  eyebrow: { fontFamily: F.mono, color: C.sun, fontSize: type.caption, letterSpacing: rs(1.5), marginTop: vs(22), marginBottom: vs(10) },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: rs(8), marginBottom: vs(6) },
  chip: {
    paddingHorizontal: rs(14),
    paddingVertical: vs(9),
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.sm,
  },
  chipOn: { borderColor: C.ember, backgroundColor: 'rgba(226,84,42,0.08)' },
  chipTxt: { fontFamily: F.mono, color: C.dim, fontSize: type.label, letterSpacing: rs(0.6) },
  chipTxtOn: { color: C.ember },

  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.md,
    paddingHorizontal: rs(16),
    marginTop: vs(12),
  },
  input: { flex: 1, color: C.ink, fontFamily: F.grotesk, fontSize: type.h3, paddingVertical: vs(14) },
  inputId: { letterSpacing: rs(1) },
  hint: { fontFamily: F.mono, color: C.faint, fontSize: type.caption, marginTop: vs(6) },
  hintOk: { color: C.green },
  hintBad: { color: C.amber },

  slots: { flexDirection: 'row', gap: rs(12) },
  slotCol: { flex: 1, alignItems: 'center' },
  slotEmpty: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: C.line,
    backgroundColor: C.well,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotPlus: { fontFamily: F.serif, color: C.faint, fontSize: ms(28) },
  thumbWrap: {
    width: '100%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: C.ember,
    backgroundColor: C.well,
    overflow: 'hidden',
  },
  thumb: { width: '100%', height: '100%' },
  removeBtn: {
    position: 'absolute',
    top: rs(4),
    right: rs(4),
    width: rs(24),
    height: rs(24),
    minHeight: 0,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeTxt: { color: '#fff', fontSize: ms(16), lineHeight: ms(18) },
  retakeBtn: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 0,
    paddingVertical: vs(5),
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
  },
  retakeTxt: { color: '#fff', fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(1) },
  slotLabel: { fontFamily: F.mono, color: C.dim, fontSize: ms(9), letterSpacing: rs(1), marginTop: vs(6), textAlign: 'center' },

  err: { color: C.red, fontFamily: F.grotesk, fontSize: type.label, marginTop: vs(16) },

  submit: {
    backgroundColor: C.ember,
    borderRadius: radius.sm,
    paddingVertical: vs(16),
    alignItems: 'center',
    marginTop: vs(18),
  },
  submitOff: { backgroundColor: 'rgba(226,84,42,0.25)' },
  submitTxt: { color: '#fff', fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(2.5), fontWeight: '600' },

  privacy: { flexDirection: 'row', alignItems: 'flex-start', gap: rs(10), marginTop: vs(16) },
  lock: { fontSize: ms(13), marginTop: vs(1) },
  privacyTxt: { flex: 1, fontFamily: F.grotesk, color: C.faint, fontSize: type.caption, lineHeight: type.caption * 1.6 },
});
