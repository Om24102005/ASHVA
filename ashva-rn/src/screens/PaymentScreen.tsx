/** Payment — Booking Step 4. Presentational: parent supplies the fare total and
 *  (optional) refundable deposit; we surface the deposit UP FRONT for trust,
 *  let the rider pick a method, then simulate a ~1.2s charge before onPaid().
 *  Ported from www/js/screens/payment.js. */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { C, type, F, radius } from '../theme';
import { rs, vs } from '../responsive';
import { METHODS } from '../data';

const rupee = (n: number) => '₹' + n.toLocaleString('en-IN');

export function PaymentScreen({
  amount,
  deposit = 15000,
  onPaid,
  onBack,
}: {
  amount: number;
  deposit?: number;
  onPaid: () => void;
  onBack: () => void;
}) {
  const [method, setMethod] = useState(METHODS[0].id);
  const [busy, setBusy] = useState(false);

  function pay() {
    if (busy) return;
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      onPaid();
    }, 1200);
  }

  return (
    <Screen style={styles.root}>
      <View style={styles.topbar}>
        <Press accessibilityLabel="Go back" onPress={onBack} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </Press>
        <Text style={styles.step}>PAYMENT · STEP 4</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>// AMOUNT SUMMARY</Text>

        <View style={styles.summary}>
          <View style={styles.row}>
            <View>
              <Text style={styles.rowLabel}>Total due</Text>
              <Text style={styles.rowSub}>Incl. all taxes</Text>
            </View>
            <Text style={styles.total}>{rupee(amount)}</Text>
          </View>

          <View style={[styles.row, styles.depositRow]}>
            <View style={styles.depositLeft}>
              <Text style={styles.rowLabel}>Refundable deposit</Text>
              <Text style={styles.rowSub}>Held against the bike · returned after drop-off</Text>
            </View>
            <Text style={styles.depositVal}>{rupee(deposit)}</Text>
          </View>
        </View>

        <Text style={styles.eyebrow}>// PAYMENT METHOD</Text>
        <View style={styles.methods}>
          {METHODS.map((m) => {
            const active = method === m.id;
            return (
              <Press
                key={m.id}
                accessibilityLabel={`Pay with ${m.id}`}
                onPress={() => setMethod(m.id)}
                style={[styles.method, active && styles.methodOn]}
              >
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{m.id}</Text>
                  <Text style={styles.methodDesc}>{m.d}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioOn]}>
                  {active && <View style={styles.radioDot} />}
                </View>
              </Press>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={`Pay ${rupee(amount)}`} busy={busy} onPress={pay} />
        <Text style={styles.trust}>Secured by ASHVA · 256-bit encryption</Text>
      </View>
    </Screen>
  );
}

function PrimaryButton({ label, onPress, busy }: { label: string; onPress: () => void; busy?: boolean }) {
  return (
    <Press accessibilityLabel={label} onPress={() => { if (!busy) onPress(); }} style={styles.btnWrap}>
      <View style={[styles.btn, busy && styles.btnOff]}>
        {busy ? <ActivityIndicator color={C.base} /> : <Text style={styles.btnTxt}>{label}</Text>}
      </View>
    </Press>
  );
}

const styles = StyleSheet.create({
  root: { paddingHorizontal: rs(24) },
  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: vs(8) },
  back: { width: rs(40), height: rs(40), alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: C.ink, fontSize: rs(30), lineHeight: rs(30) },
  step: { color: C.dim, fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(2) },

  scroll: { paddingBottom: vs(24) },
  eyebrow: { color: C.sun, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(2), marginTop: vs(20), marginBottom: vs(12) },

  summary: { backgroundColor: C.surf, borderWidth: 1, borderColor: C.line, borderRadius: radius.md, paddingHorizontal: rs(18), paddingVertical: vs(4) },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: vs(16) },
  rowLabel: { color: C.ink, fontSize: type.body, fontWeight: '600' },
  rowSub: { color: C.faint, fontFamily: F.mono, fontSize: type.caption, marginTop: vs(3) },
  total: { color: C.sun, fontSize: type.h1, fontWeight: '700' },

  depositRow: { borderTopWidth: 1, borderTopColor: C.line2 },
  depositLeft: { flex: 1, paddingRight: rs(16) },
  depositVal: { color: C.ink, fontSize: type.h3, fontWeight: '600' },

  methods: { gap: vs(9) },
  method: { flexDirection: 'row', alignItems: 'center', gap: rs(14), padding: rs(15), backgroundColor: C.surf, borderWidth: 1, borderColor: C.line, borderRadius: radius.sm },
  methodOn: { backgroundColor: 'rgba(226,84,42,0.08)', borderColor: C.ember },
  methodInfo: { flex: 1 },
  methodName: { color: C.ink, fontSize: type.body, fontWeight: '600' },
  methodDesc: { color: C.faint, fontFamily: F.mono, fontSize: type.caption, marginTop: vs(2) },
  radio: { width: rs(20), height: rs(20), borderRadius: radius.pill, borderWidth: 2, borderColor: C.faint, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: C.ember },
  radioDot: { width: rs(9), height: rs(9), borderRadius: radius.pill, backgroundColor: C.ember },

  footer: { paddingTop: vs(10), paddingBottom: vs(8) },
  btnWrap: {},
  btn: { backgroundColor: C.ember, borderRadius: radius.pill, paddingVertical: vs(16), alignItems: 'center' },
  btnOff: { backgroundColor: 'rgba(226,84,42,0.25)' },
  btnTxt: { color: C.base, fontSize: type.h3, fontWeight: '700' },
  trust: { color: C.faint, fontFamily: F.mono, fontSize: type.caption, textAlign: 'center', marginTop: vs(12) },
});
