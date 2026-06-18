/** Payment — Booking Step 4. Faithful RN port of www/js/screens/payment.js.
 *  Surfaces the fare total AND the refundable deposit UP FRONT, lets the rider
 *  pick a sharp payment method, then simulates a ~1.2s charge before onPaid().
 *  Presentational: parent supplies the fare `amount` and (optional) `deposit`.
 *  Sharp corners, 1px C.line borders, mono uppercase — matches the web design. */
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { Topbar, Eyebrow, Progress } from '../components/chrome';
import { C, F } from '../theme';
import { rs, vs } from '../responsive';
import { METHODS } from '../data';

const rupee = (n: number) => '₹' + n.toLocaleString('en-IN');

/** Per-method line icon — faithful port of payment.js payIcon(). */
function PayIcon({ id }: { id: string }) {
  const p = {
    UPI: (
      <>
        <Rect x={4} y={3} width={11} height={18} rx={1.5} />
        <Path d="M16 8l4 4-4 4" />
      </>
    ),
    Card: (
      <>
        <Rect x={3} y={6} width={18} height={12} rx={1.5} />
        <Path d="M3 10h18" />
      </>
    ),
    Netbanking: <Path d="M4 10l8-5 8 5M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18" />,
    Wallet: (
      <>
        <Rect x={3} y={6} width={18} height={13} rx={1.5} />
        <Path d="M16 12h2" />
        <Path d="M3 9h13a2 2 0 012 2" />
      </>
    ),
  }[id];
  return (
    <Svg width={rs(24)} height={rs(24)} viewBox="0 0 24 24" fill="none" stroke={C.dim} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {p}
    </Svg>
  );
}

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
    <Screen edges={{ top: true, bottom: false }}>
      <Topbar title="PAYMENT · STEP 4" onBack={onBack} />
      <Progress step={3} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* AMOUNT SUMMARY */}
        <View style={styles.eyebrowWrap}>
          <Eyebrow color={C.sun}>// AMOUNT SUMMARY</Eyebrow>
        </View>
        <View style={styles.summary}>
          <View style={styles.totalRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.totalLabel}>TOTAL DUE</Text>
              <Text style={styles.totalSub}>Incl. all taxes</Text>
            </View>
            <Text style={styles.totalVal}>{rupee(amount)}</Text>
          </View>
          <View style={styles.depositRow}>
            <View style={styles.depositLeft}>
              <Text style={styles.depositLabel}>Refundable deposit</Text>
              <Text style={styles.depositSub}>Held against the bike · returned after drop-off</Text>
            </View>
            <Text style={styles.depositVal}>{rupee(deposit)}</Text>
          </View>
        </View>

        {/* PAYMENT METHOD */}
        <View style={styles.eyebrowWrap2}>
          <Eyebrow color={C.sun}>// PAYMENT METHOD</Eyebrow>
        </View>
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
                <PayIcon id={m.id} />
                <View style={styles.methodInfo}>
                  <Text style={styles.methodName}>{m.id}</Text>
                  <Text style={styles.methodDesc}>{m.d}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioOn]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
              </Press>
            );
          })}
        </View>
      </ScrollView>

      {/* fixed bottom CTA — sharp, ember, mono uppercase (matches web bottomBtn) */}
      <View style={styles.bottomWrap} pointerEvents="box-none">
        <Press accessibilityLabel={`Pay ${rupee(amount)}`} onPress={pay} style={styles.payBtnWrap}>
          <View style={[styles.payBtn, busy && styles.payBtnBusy]}>
            {busy ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payTxt}>{`PAY ${rupee(amount)}`}</Text>
            )}
          </View>
        </Press>
        <Text style={styles.trust}>Secured by ASHVA</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: vs(150) },

  eyebrowWrap: { paddingHorizontal: rs(24), paddingTop: vs(18), paddingBottom: vs(4) },
  eyebrowWrap2: { paddingHorizontal: rs(24), paddingTop: vs(16), paddingBottom: vs(4) },

  summary: { paddingHorizontal: rs(24), paddingTop: vs(6) },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: vs(18), paddingBottom: vs(6) },
  totalLabel: { fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(1.4), color: C.dim },
  totalSub: { fontFamily: F.mono, fontSize: rs(9), color: C.faint, marginTop: vs(3) },
  totalVal: { fontFamily: F.grotesk, fontWeight: '700', fontSize: rs(30), color: C.sun },

  depositRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: vs(13), borderTopWidth: 1, borderTopColor: C.line2 },
  depositLeft: { flex: 1, paddingRight: rs(14) },
  depositLabel: { fontFamily: F.grotesk, fontSize: rs(14), color: C.ink },
  depositSub: { fontFamily: F.mono, fontSize: rs(10), color: C.faint, marginTop: vs(2) },
  depositVal: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(15), color: C.ink },

  methods: { paddingHorizontal: rs(24), paddingTop: vs(12), gap: vs(9) },
  method: { flexDirection: 'row', alignItems: 'center', gap: rs(14), padding: rs(15), backgroundColor: C.surf, borderWidth: 1, borderColor: C.line },
  methodOn: { backgroundColor: 'rgba(226,84,42,0.08)', borderColor: C.ember },
  methodInfo: { flex: 1 },
  methodName: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(15), color: C.ink },
  methodDesc: { fontFamily: F.mono, fontSize: rs(10), color: C.faint, marginTop: vs(2) },
  radio: { width: rs(20), height: rs(20), borderRadius: rs(10), borderWidth: 2, borderColor: C.faint, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: C.ember },
  radioDot: { width: rs(9), height: rs(9), borderRadius: rs(4.5), backgroundColor: C.ember },

  bottomWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: rs(24), paddingTop: vs(16), paddingBottom: vs(30) },
  payBtnWrap: {},
  payBtn: { paddingVertical: vs(18), alignItems: 'center', backgroundColor: C.ember },
  payBtnBusy: { backgroundColor: 'rgba(226,84,42,0.25)' },
  payTxt: { color: '#fff', fontFamily: F.mono, fontSize: rs(12), letterSpacing: rs(2.4) },
  trust: { fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.4), color: C.faint, textAlign: 'center', marginTop: vs(12) },
});
