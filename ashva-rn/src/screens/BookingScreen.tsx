/** Booking · Step 1 — pick a pickup hub and a rental duration, with a live fare
 *  preview. Ported from www/js/screens/booking.js. The original hard-coded
 *  "JUNE 2026" date strip is replaced with a plain day-count selector (1..30)
 *  plus a stepper — no fake calendar. */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { C, type, F, radius } from '../theme';
import { rs, vs, ms } from '../responsive';
import { HUBS, Bike } from '../data';

const INSURANCE_PER_DAY = 199;
const HUB_HANDLING = 299;
const MIN_DAYS = 1;
const MAX_DAYS = 30;

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

export function BookingScreen({
  bike,
  onContinue,
  onBack,
}: {
  bike: Bike;
  onContinue: (cfg: { days: number; hub: string }) => void;
  onBack: () => void;
}) {
  const [hub, setHub] = useState<string>(HUBS[0].id);
  const [days, setDays] = useState<number>(3);

  const clamp = (d: number) => Math.max(MIN_DAYS, Math.min(MAX_DAYS, d));

  const bikeTotal = bike.price * days;
  const insuranceTotal = INSURANCE_PER_DAY * days;
  const total = bikeTotal + insuranceTotal + HUB_HANDLING;

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <View style={styles.topbar}>
        <Press accessibilityLabel="Go back" onPress={onBack} style={styles.back}>
          <Text style={styles.backTxt}>‹</Text>
        </Press>
        <Text style={styles.step}>CONFIGURE · STEP 1</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.bikeStrip}>
          <Text style={styles.bikeMaker}>{bike.maker}</Text>
          <Text style={styles.bikeName}>{bike.name}</Text>
          <Text style={styles.bikePrice}>
            {inr(bike.price)}
            <Text style={styles.bikePerDay}> /day</Text>
          </Text>
        </View>

        <Text style={styles.eyebrow}>// PICKUP HUB</Text>
        <View style={styles.hubList}>
          {HUBS.map((h) => {
            const active = hub === h.id;
            return (
              <Press
                key={h.id}
                accessibilityLabel={`Pick up at ${h.id}`}
                onPress={() => setHub(h.id)}
                style={[styles.hub, active && styles.hubOn]}
              >
                <View style={[styles.radio, active && styles.radioOn]}>
                  {active && <View style={styles.radioDot} />}
                </View>
                <View style={styles.hubBody}>
                  <Text style={styles.hubId}>{h.id}</Text>
                  <Text style={styles.hubSub}>{h.sub}</Text>
                </View>
                <Text style={styles.hubKm}>{h.km}</Text>
              </Press>
            );
          })}
        </View>

        <Text style={styles.eyebrow}>// DURATION</Text>
        <View style={styles.stepper}>
          <Press
            accessibilityLabel="Decrease days"
            onPress={() => setDays((d) => clamp(d - 1))}
            style={styles.stepBtn}
          >
            <Text style={styles.stepGlyph}>−</Text>
          </Press>
          <View style={styles.stepCount}>
            <Text style={styles.stepDays}>
              {days}
              <Text style={styles.stepUnit}> days</Text>
            </Text>
          </View>
          <Press
            accessibilityLabel="Increase days"
            onPress={() => setDays((d) => clamp(d + 1))}
            style={styles.stepBtn}
          >
            <Text style={styles.stepGlyph}>+</Text>
          </Press>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayStrip}
        >
          {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((d) => {
            const active = days === d;
            return (
              <Press
                key={d}
                accessibilityLabel={`${d} ${d === 1 ? 'day' : 'days'}`}
                onPress={() => setDays(d)}
                style={[styles.dayCell, active && styles.dayCellOn]}
              >
                <Text style={[styles.dayNum, active && styles.dayNumOn]}>{d}</Text>
              </Press>
            );
          })}
        </ScrollView>

        <Text style={styles.eyebrow}>// FARE PREVIEW</Text>
        <View style={styles.fare}>
          <FareRow
            label={`${bike.name} · ${days} ${days === 1 ? 'day' : 'days'}`}
            value={inr(bikeTotal)}
          />
          <FareRow label={`Insurance · ${inr(INSURANCE_PER_DAY)}/day`} value={inr(insuranceTotal)} />
          <FareRow label="Hub handling" value={inr(HUB_HANDLING)} />
          <View style={styles.fareDivider} />
          <View style={styles.fareRow}>
            <Text style={styles.fareTotalLabel}>Total</Text>
            <Text style={styles.fareTotalValue}>{inr(total)}</Text>
          </View>
        </View>

        <View style={{ height: vs(28) }} />
      </ScrollView>

      <View style={styles.footer}>
        <Press
          accessibilityLabel="Continue to gear"
          onPress={() => onContinue({ days, hub })}
          style={styles.cta}
        >
          <Text style={styles.ctaTxt}>Continue to gear →</Text>
        </Press>
      </View>
    </Screen>
  );
}

function FareRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fareRow}>
      <Text style={styles.fareLabel}>{label}</Text>
      <Text style={styles.fareValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingBottom: vs(8),
  },
  back: { width: rs(40), height: rs(40), alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: C.ink, fontSize: rs(30), lineHeight: rs(32) },
  step: {
    color: C.dim,
    fontFamily: F.mono,
    fontSize: type.caption,
    letterSpacing: rs(2),
  },

  scroll: { paddingHorizontal: rs(24), paddingTop: vs(4) },

  bikeStrip: {
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.md,
    padding: rs(16),
    marginBottom: vs(24),
  },
  bikeMaker: { color: C.dim, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(1) },
  bikeName: { color: C.ink, fontFamily: F.serif, fontSize: rs(26), marginTop: vs(2) },
  bikePrice: { color: C.ink, fontSize: type.h3, fontWeight: '700', marginTop: vs(6) },
  bikePerDay: { color: C.dim, fontSize: type.label, fontWeight: '400' },

  eyebrow: {
    color: C.sun,
    fontFamily: F.mono,
    fontSize: type.caption,
    letterSpacing: rs(2),
    marginBottom: vs(12),
  },

  hubList: { gap: vs(9), marginBottom: vs(28) },
  hub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(14),
    padding: rs(15),
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.md,
  },
  hubOn: { backgroundColor: 'rgba(226,84,42,0.08)', borderColor: C.ember },
  radio: {
    width: rs(20),
    height: rs(20),
    borderRadius: rs(10),
    borderWidth: 2,
    borderColor: C.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: C.ember },
  radioDot: { width: rs(9), height: rs(9), borderRadius: rs(5), backgroundColor: C.ember },
  hubBody: { flex: 1 },
  hubId: { color: C.ink, fontFamily: F.grotesk, fontWeight: '600', fontSize: ms(15) },
  hubSub: { color: C.faint, fontFamily: F.mono, fontSize: type.caption, marginTop: vs(2) },
  hubKm: { color: C.dim, fontFamily: F.mono, fontSize: type.label },

  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: rs(6),
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.md,
    marginBottom: vs(14),
  },
  stepBtn: {
    width: rs(54),
    height: rs(54),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.well,
    borderRadius: radius.sm,
  },
  stepGlyph: { color: C.ink, fontSize: rs(28), lineHeight: rs(30) },
  stepCount: { alignItems: 'center' },
  stepDays: { color: C.ink, fontFamily: F.grotesk, fontWeight: '700', fontSize: ms(30) },
  stepUnit: { color: C.faint, fontSize: type.body, fontWeight: '400' },

  dayStrip: { gap: rs(9), paddingVertical: vs(4), paddingRight: rs(24), marginBottom: vs(28) },
  dayCell: {
    minWidth: rs(50),
    paddingVertical: vs(13),
    paddingHorizontal: rs(6),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.sm,
  },
  dayCellOn: { backgroundColor: C.ember, borderColor: C.ember },
  dayNum: { color: C.ink, fontFamily: F.grotesk, fontWeight: '600', fontSize: ms(18) },
  dayNumOn: { color: '#fff' },

  fare: {
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.md,
    padding: rs(16),
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(6),
  },
  fareLabel: { color: C.dim, fontSize: type.label, flex: 1, marginRight: rs(10) },
  fareValue: { color: C.ink, fontSize: type.label, fontVariant: ['tabular-nums'] },
  fareDivider: { height: 1, backgroundColor: C.line, marginVertical: vs(8) },
  fareTotalLabel: { color: C.ink, fontSize: type.h3, fontWeight: '700' },
  fareTotalValue: {
    color: C.sun,
    fontSize: type.h3,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  footer: {
    paddingHorizontal: rs(24),
    paddingTop: vs(10),
    paddingBottom: vs(24),
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.base,
  },
  cta: {
    backgroundColor: C.ember,
    borderRadius: radius.pill,
    paddingVertical: vs(16),
    alignItems: 'center',
  },
  ctaTxt: { color: C.base, fontSize: type.h3, fontWeight: '700' },
});
