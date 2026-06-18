/** Booking · Step 1 — pickup hub, day-count selector, duration stepper, fare.
 *  Faithful RN port of www/js/screens/booking.js (sharp, editorial, mono).
 *  The original hard-coded "JUNE 2026" calendar strip is replaced with a plain
 *  day-count selector (1..30) + stepper — everything else matches 1:1. */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { CinematicImage } from '../components/CinematicImage';
import { Topbar, Eyebrow, Progress, BottomBar } from '../components/chrome';
import { C, F } from '../theme';
import { rs, vs } from '../responsive';
import { HUBS, Bike } from '../data';

const rupee = (n: number) => '₹' + n.toLocaleString('en-IN');

const MIN_DAYS = 1;
const MAX_DAYS = 30;
const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

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

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Topbar title="CONFIGURE · STEP 1" onBack={onBack} />
        <Progress step={0} />

        {/* bikeStrip — thumb · maker + serif name · price /DAY */}
        <View style={styles.bikeStrip}>
          <CinematicImage uri={bike.photo} grad={bike.grad} style={styles.bikeThumb} />
          <View style={styles.bikeBody}>
            <Text style={styles.bikeMaker}>{bike.maker}</Text>
            <Text style={styles.bikeName}>{bike.name}</Text>
          </View>
          <View style={styles.bikePriceCol}>
            <Text style={styles.bikePrice}>{rupee(bike.price)}</Text>
            <Text style={styles.bikePerDay}>/DAY</Text>
          </View>
        </View>

        {/* PICKUP HUB */}
        <View style={styles.pad}>
          <Eyebrow color={C.sun}>{'// PICKUP HUB'}</Eyebrow>
          <View style={styles.hubList}>
            {HUBS.map((h) => {
              const a = hub === h.id;
              return (
                <Press
                  key={h.id}
                  accessibilityLabel={`Pick up at ${h.id}`}
                  onPress={() => setHub(h.id)}
                  style={[styles.hub, a && styles.hubOn]}
                >
                  <View style={[styles.radio, a && styles.radioOn]}>
                    {a && <View style={styles.radioDot} />}
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
          <Eyebrow color={C.sun}>{'// START DAY'}</Eyebrow>
        </View>

        {/* day-count strip (replaces fixed JUNE 2026 calendar) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateStrip}
        >
          {Array.from({ length: MAX_DAYS }, (_, i) => i + 1).map((d) => {
            const a = days === d;
            return (
              <Press
                key={d}
                accessibilityLabel={`${d} ${d === 1 ? 'day' : 'days'}`}
                onPress={() => setDays(d)}
                style={[styles.dateCell, a && styles.dateCellOn]}
              >
                <Text style={[styles.dateDow, a && styles.dateDowOn]}>{DOW[d % 7]}</Text>
                <Text style={[styles.dateNum, a && styles.dateNumOn]}>{d}</Text>
              </Press>
            );
          })}
        </ScrollView>

        {/* DURATION stepper */}
        <View style={styles.durPad}>
          <Eyebrow color={C.sun}>{'// DURATION'}</Eyebrow>
          <View style={styles.stepper}>
            <Press
              accessibilityLabel="Decrease days"
              onPress={() => setDays((d) => clamp(d - 1))}
              style={styles.stepBtn}
            >
              <Text style={styles.stepMinus}>−</Text>
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
              <Text style={styles.stepPlus}>+</Text>
            </Press>
          </View>
          <Text style={styles.durLabel}>
            {days} {days === 1 ? 'day' : 'days'} · {rupee(bike.price * days)} total
          </Text>
        </View>

        {/* spacer so the fixed CTA never overlaps content */}
        <View style={{ height: vs(120) }} />
      </ScrollView>

      <BottomBar label="ADD GEAR →" onPress={() => onContinue({ days, hub })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: vs(4) },

  // bikeStrip — margin:18px 24px, padding:14px, sharp, 1px line
  bikeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(14),
    padding: rs(14),
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    marginHorizontal: rs(24),
    marginVertical: vs(18),
  },
  bikeThumb: { width: rs(74), height: vs(56), borderWidth: 1, borderColor: C.line },
  bikeBody: { flex: 1, minWidth: 0 },
  bikeMaker: { fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.3), color: C.faint },
  bikeName: { fontFamily: F.serif, fontSize: rs(21), lineHeight: rs(23), color: C.ink },
  bikePriceCol: { alignItems: 'flex-end' },
  bikePrice: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(16), color: C.sun },
  bikePerDay: { fontFamily: F.mono, fontSize: rs(9), color: C.faint, marginTop: vs(1) },

  // PICKUP HUB block — padding:8px 24px in source
  pad: { paddingHorizontal: rs(24), paddingVertical: vs(8) },
  hubList: { flexDirection: 'column', gap: vs(9), marginTop: vs(14), marginBottom: vs(28) },
  hub: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(14),
    padding: rs(15),
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
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
  radioDot: { width: rs(9), height: rs(9), borderRadius: rs(4.5), backgroundColor: C.ember },
  hubBody: { flex: 1, minWidth: 0 },
  hubId: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(15), color: C.ink },
  hubSub: { fontFamily: F.mono, fontSize: rs(10), color: C.faint, marginTop: vs(2) },
  hubKm: { fontFamily: F.mono, fontSize: rs(11), color: C.dim },

  // date/day strip — padding:14px 24px 4px, gap:9, min-width:50
  dateStrip: { gap: rs(9), paddingHorizontal: rs(24), paddingTop: vs(14), paddingBottom: vs(4) },
  dateCell: {
    minWidth: rs(50),
    paddingVertical: vs(13),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
  },
  dateCellOn: { backgroundColor: C.ember, borderColor: C.ember },
  dateDow: { fontFamily: F.mono, fontSize: rs(9), color: C.faint },
  dateDowOn: { color: 'rgba(255,255,255,0.7)' },
  dateNum: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(18), color: C.ink, marginTop: vs(3) },
  dateNumOn: { color: '#fff' },

  // DURATION block — padding:24px
  durPad: { padding: rs(24) },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: rs(6),
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    marginTop: vs(14),
    marginBottom: vs(8),
  },
  stepBtn: {
    width: rs(54),
    height: rs(54),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.well,
  },
  stepMinus: { color: C.ink, fontSize: rs(28), lineHeight: rs(30) },
  stepPlus: { color: C.ink, fontSize: rs(26), lineHeight: rs(28) },
  stepCount: { alignItems: 'center' },
  stepDays: { fontFamily: F.grotesk, fontWeight: '700', fontSize: rs(30), color: C.ink },
  stepUnit: { fontFamily: F.grotesk, fontSize: rs(14), color: C.faint, fontWeight: '400' },
  durLabel: {
    textAlign: 'center',
    fontFamily: F.mono,
    fontSize: rs(11),
    letterSpacing: rs(0.9),
    color: C.dim,
    marginTop: vs(14),
  },
});
