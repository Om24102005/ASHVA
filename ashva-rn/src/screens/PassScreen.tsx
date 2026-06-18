/** Ride Pass — booking-confirmed boarding-pass ticket: confirmation header,
 *  cinematic bike strip, booking reference, faux QR block, deposit + terms, and
 *  start/home actions. Ported from www/js/screens/pass.js. Presentational: no
 *  nav, all sizing through rs()/vs()/ms(), photo degrades to gradient. */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { CinematicImage } from '../components/CinematicImage';
import { C, type, F, radius } from '../theme';
import { rs, vs, ms } from '../responsive';
import { Bike } from '../data';

/** Deterministic-looking fallback reference so the pass always reads complete. */
const fallbackRef = () => {
  const code = Math.abs(Math.round(Date.now() / 1000)) % 10000;
  return 'ASH-' + String(code).padStart(4, '0');
};

/** A faux QR: a fixed grid of cells lit by a deterministic hash of the ref so
 *  it looks like a real scannable code without pulling in a QR library. */
function FauxQR({ seed }: { seed: string }) {
  const N = 9;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const cells = [];
  for (let i = 0; i < N * N; i++) {
    const r = Math.floor(i / N);
    const c = i % N;
    // Always paint the three finder squares (corners) so it reads as a QR.
    const corner =
      (r < 3 && c < 3) || (r < 3 && c > N - 4) || (r > N - 4 && c < 3);
    const finder = corner && (r === 0 || r === 2 || c === 0 || c === 2 || (r === 1 && c === 1) || (r > N - 4 && (r === N - 1 || r === N - 3)) || (c > N - 4 && (c === N - 1 || c === N - 3)));
    h = (h * 1103515245 + 12345) >>> 0;
    const on = corner ? finder : (h >> ((i % 16) + 8)) & 1;
    cells.push(<View key={i} style={[styles.qrCell, on ? styles.qrCellOn : null]} />);
  }
  return <View style={styles.qr}>{cells}</View>;
}

export function PassScreen({
  bike,
  reference,
  hub,
  onStartTrip,
  onHome,
}: {
  bike?: Bike;
  reference?: string;
  hub?: string;
  onStartTrip: () => void;
  onHome: () => void;
}) {
  const ref = reference || fallbackRef();
  const pickup = hub || 'Manali';

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeCheck}>✓</Text>
          </View>
          <Text style={styles.eyebrow}>// BOOKING CONFIRMED</Text>
          <Text style={styles.title}>
            You’re going{'\n'}
            <Text style={styles.titleEmber}>riding.</Text>
          </Text>
        </View>

        <View style={styles.ticket}>
          {bike ? (
            <CinematicImage uri={bike.photo} grad={bike.grad} style={styles.strip}>
              <LinearGradient
                colors={['rgba(23,17,13,0.2)', 'rgba(23,17,13,0.85)']}
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.confirmTag}>
                <Text style={styles.confirmTagText}>✓ CONFIRMED</Text>
              </View>
              <View style={styles.stripBody}>
                <Text style={styles.stripMaker}>{bike.maker}</Text>
                <Text style={styles.stripName}>{bike.name}</Text>
              </View>
            </CinematicImage>
          ) : null}

          <View style={styles.detailRow}>
            <View style={styles.detailCell}>
              <Text style={styles.cellLabel}>PICKUP HUB</Text>
              <Text style={styles.cellValue}>{pickup}</Text>
            </View>
            <View style={[styles.detailCell, styles.detailCellRight]}>
              <Text style={styles.cellLabel}>BIKE</Text>
              <Text style={styles.cellValue}>{bike ? bike.name : '—'}</Text>
            </View>
          </View>

          <View style={styles.tearRow}>
            <View style={[styles.notch, styles.notchLeft]} />
            <View style={styles.dashes} />
            <View style={[styles.notch, styles.notchRight]} />
          </View>

          <View style={styles.qrRow}>
            <View style={styles.qrPlate}>
              <FauxQR seed={ref} />
            </View>
            <View style={styles.qrInfo}>
              <Text style={styles.cellLabel}>BOOKING REF</Text>
              <Text style={styles.refText}>{ref}</Text>
              <View style={styles.paidRow}>
                <Text style={styles.paidCheck}>✓</Text>
                <Text style={styles.paidText}>CONFIRMED · PAID</Text>
              </View>
              <Text style={styles.deposit}>
                ₹15,000 refundable deposit{'\n'}blocked on pickup.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.terms}>
          <Text style={styles.termsHead}>// KEY TERMS</Text>
          {[
            '₹15,000 refundable deposit, released within 7 days of return.',
            'Carry a valid licence — verified at the pickup hub.',
            'Fuel returned at the same level you received it.',
            'Free cancellation up to 24 hours before pickup.',
          ].map((t) => (
            <View key={t} style={styles.termRow}>
              <Text style={styles.termBullet}>✓</Text>
              <Text style={styles.termText}>{t}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Press accessibilityLabel="Start trip now" onPress={onStartTrip} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>START RIDE NOW →</Text>
          </Press>
          <Press accessibilityLabel="Back to home" onPress={onHome} style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>BACK TO HOME</Text>
          </Press>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: vs(48) },

  header: { alignItems: 'center', paddingHorizontal: rs(24), paddingTop: vs(20), paddingBottom: vs(26) },
  badge: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(72) / 2,
    backgroundColor: 'rgba(46,160,67,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(46,160,67,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: vs(18),
  },
  badgeCheck: { color: C.green, fontSize: ms(34), lineHeight: ms(38) },
  eyebrow: { color: C.green, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(2) },
  title: { color: C.ink, fontFamily: F.serif, fontSize: rs(38), lineHeight: rs(40), textAlign: 'center', marginTop: vs(10) },
  titleEmber: { color: C.ember, fontStyle: 'italic' },

  ticket: { marginHorizontal: rs(24), backgroundColor: C.surf, borderWidth: 1, borderColor: C.line },

  strip: { height: vs(170), justifyContent: 'flex-end' },
  confirmTag: {
    position: 'absolute',
    top: vs(14),
    right: rs(14),
    paddingVertical: vs(6),
    paddingHorizontal: rs(11),
    backgroundColor: 'rgba(46,160,67,0.85)',
  },
  confirmTagText: { color: '#fff', fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.4) },
  stripBody: { paddingHorizontal: rs(18), paddingBottom: vs(14) },
  stripMaker: { color: C.amber, fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(2) },
  stripName: { color: C.ink, fontFamily: F.serif, fontSize: ms(28), lineHeight: ms(30) },

  detailRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line },
  detailCell: { flex: 1, padding: rs(14) },
  detailCellRight: { borderLeftWidth: 1, borderLeftColor: C.line },
  cellLabel: { color: C.faint, fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.5) },
  cellValue: { color: C.ink, fontFamily: F.grotesk, fontWeight: '600', fontSize: ms(15), marginTop: vs(4) },

  tearRow: { height: vs(34), justifyContent: 'center', position: 'relative' },
  notch: {
    position: 'absolute',
    top: '50%',
    marginTop: -rs(13),
    width: rs(26),
    height: rs(26),
    borderRadius: rs(13),
    backgroundColor: C.base,
    borderWidth: 1,
    borderColor: C.line,
  },
  notchLeft: { left: -rs(13) },
  notchRight: { right: -rs(13) },
  dashes: { marginHorizontal: rs(14), borderTopWidth: 2, borderStyle: 'dashed', borderTopColor: C.line },

  qrRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: rs(22), paddingTop: vs(8), paddingBottom: vs(24) },
  qrPlate: { backgroundColor: '#F4EBDD', padding: rs(8) },
  qr: { width: rs(96), height: rs(96), flexDirection: 'row', flexWrap: 'wrap' },
  qrCell: { width: '11.11%', height: '11.11%' },
  qrCellOn: { backgroundColor: '#17110D' },
  qrInfo: { flex: 1, marginLeft: rs(18) },
  refText: { color: C.ink, fontFamily: F.grotesk, fontWeight: '700', fontSize: ms(22), letterSpacing: rs(1), marginTop: vs(3), marginBottom: vs(12) },
  paidRow: { flexDirection: 'row', alignItems: 'center' },
  paidCheck: { color: C.green, fontSize: ms(13), marginRight: rs(8) },
  paidText: { color: C.green, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(1) },
  deposit: { color: C.faint, fontFamily: F.mono, fontSize: rs(9), lineHeight: ms(14), marginTop: vs(8) },

  terms: { paddingHorizontal: rs(24), paddingTop: vs(24) },
  termsHead: { color: C.sun, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(2), marginBottom: vs(6) },
  termRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: vs(11),
    borderBottomWidth: 1,
    borderBottomColor: C.line2,
  },
  termBullet: { color: C.sun, fontSize: ms(13), marginRight: rs(12), marginTop: vs(1) },
  termText: { flex: 1, color: C.dim, fontFamily: F.grotesk, fontSize: type.label, lineHeight: ms(20) },

  actions: { paddingHorizontal: rs(24), paddingTop: vs(24), gap: vs(11) },
  primaryBtn: { paddingVertical: vs(17), backgroundColor: C.ember, borderRadius: radius.sm, alignItems: 'center' },
  primaryText: { color: '#fff', fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(2) },
  secondaryBtn: {
    paddingVertical: vs(17),
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  secondaryText: { color: C.ink, fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(2) },
});
