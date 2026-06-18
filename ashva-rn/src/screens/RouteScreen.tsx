/** Route Detail — cinematic hero, stats strip, day-by-day timeline, recommended
 *  machines, sticky CTA. Ported from www/js/screens/route.js. Presentational:
 *  no nav, all sizing through rs()/vs()/ms(), photos degrade to gradient via
 *  CinematicImage. */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { CinematicImage } from '../components/CinematicImage';
import { C, type, F, radius } from '../theme';
import { rs, vs, ms } from '../responsive';
import { BIKES, Route, Bike } from '../data';

const stars = (n: number) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

export function RouteScreen({
  route,
  onPickBike,
  onBack,
}: {
  route: Route;
  onPickBike: (bike: Bike) => void;
  onBack: () => void;
}) {
  const bikes = route.bikes
    .map((id) => BIKES.find((b) => b.id === id))
    .filter((b): b is Bike => Boolean(b));

  const STATS: { label: string; value: string }[] = [
    { label: 'DAYS', value: String(route.days) },
    { label: 'DISTANCE', value: route.km + 'km' },
    { label: 'PEAK', value: route.alt },
  ];

  return (
    <Screen edges={{ top: false, bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <CinematicImage uri={route.photo} grad={route.grad} style={styles.hero}>
          <LinearGradient
            colors={['rgba(23,17,13,0.45)', 'transparent', 'transparent', C.base]}
            locations={[0, 0.4, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTop}>
            <Press accessibilityLabel="Go back" onPress={onBack} style={styles.iconBtn}>
              <Text style={styles.chev}>‹</Text>
            </Press>
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.eyebrow}>// {route.region} · {route.terrain}</Text>
            <Text style={styles.heroName}>{route.name}</Text>
          </View>
        </CinematicImage>

        <View style={styles.content}>
          <View style={styles.statStrip}>
            {STATS.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={styles.statDiv} />}
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>

          <Text style={styles.blurb}>{route.blurb}</Text>

          <Text style={styles.section}>// DAY BY DAY</Text>
          <View style={styles.timeline}>
            {route.legs.map((l, i) => {
              const last = i === route.legs.length - 1;
              return (
                <View key={l.d} style={styles.leg}>
                  <View style={styles.rail}>
                    <View style={styles.node} />
                    {!last && <View style={styles.line} />}
                  </View>
                  <View style={[styles.legBody, !last && styles.legBodyGap]}>
                    <View style={styles.legHead}>
                      <Text style={styles.legDay}>{l.d}</Text>
                      <Text style={styles.legKm}>{l.km} KM</Text>
                    </View>
                    <Text style={styles.legTitle}>{l.t}</Text>
                    <Text style={styles.legNote}>{l.n}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Text style={styles.section}>// RECOMMENDED MACHINES</Text>
          <View style={styles.bikes}>
            {bikes.map((b) => (
              <Press
                key={b.id}
                accessibilityLabel={`Pick the ${b.name}`}
                onPress={() => onPickBike(b)}
                style={styles.bikeRow}
              >
                <CinematicImage uri={b.photo} grad={b.grad} style={styles.bikeThumb} />
                <View style={styles.bikeInfo}>
                  <Text style={styles.bikeMaker}>{b.maker}</Text>
                  <Text style={styles.bikeName}>{b.name}</Text>
                  <Text style={styles.bikeMeta}>{b.type} · {stars(b.rating)}</Text>
                </View>
                <View style={styles.bikePrice}>
                  <Text style={styles.bikeRupee}>₹{b.price.toLocaleString('en-IN')}</Text>
                  <Text style={styles.bikePer}>/DAY</Text>
                </View>
              </Press>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bar}>
        <LinearGradient colors={['transparent', C.base]} locations={[0, 0.3]} style={StyleSheet.absoluteFill} />
        <View style={styles.barInner}>
          <Press
            accessibilityLabel="Choose a bike for this route"
            onPress={() => bikes[0] && onPickBike(bikes[0])}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Choose a bike →</Text>
          </Press>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: vs(120) },

  hero: { height: vs(380), justifyContent: 'flex-end' },
  heroTop: { position: 'absolute', top: vs(56), left: rs(20), right: rs(20), flexDirection: 'row' },
  iconBtn: {
    width: rs(44),
    height: rs(44),
    minHeight: rs(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: 'rgba(23,17,13,0.5)',
  },
  chev: { color: C.ink, fontSize: ms(28), lineHeight: ms(28) },
  heroBody: { paddingHorizontal: rs(24), paddingBottom: vs(22) },
  eyebrow: { color: C.amber, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(2) },
  heroName: { color: C.ink, fontFamily: F.serif, fontSize: rs(44), lineHeight: rs(44), marginTop: vs(6) },

  content: { paddingHorizontal: rs(24) },

  statStrip: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surf,
    marginTop: vs(-1),
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: vs(16), paddingHorizontal: rs(6) },
  statDiv: { width: 1, backgroundColor: C.line },
  statValue: { color: C.sun, fontFamily: F.grotesk, fontWeight: '700', fontSize: ms(22) },
  statLabel: { color: C.faint, fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.4), marginTop: vs(3) },

  blurb: { color: C.dim, fontFamily: F.grotesk, fontSize: type.body, lineHeight: ms(25), marginTop: vs(24), marginBottom: vs(8) },

  section: { color: C.sun, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(2), marginTop: vs(22), marginBottom: vs(14) },

  timeline: { paddingLeft: rs(4) },
  leg: { flexDirection: 'row', gap: rs(16) },
  rail: { alignItems: 'center' },
  node: {
    width: rs(13),
    height: rs(13),
    borderRadius: rs(13) / 2,
    borderWidth: 2,
    borderColor: C.ember,
    backgroundColor: C.base,
    marginTop: vs(4),
  },
  line: { width: 2, flex: 1, backgroundColor: C.line, marginTop: vs(2) },
  legBody: { flex: 1, paddingBottom: vs(4) },
  legBodyGap: { paddingBottom: vs(26) },
  legHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  legDay: { color: C.sun, fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(1.4) },
  legKm: { color: C.faint, fontFamily: F.mono, fontSize: rs(10) },
  legTitle: { color: C.ink, fontFamily: F.serif, fontSize: ms(21), lineHeight: ms(24), marginTop: vs(4), marginBottom: vs(5) },
  legNote: { color: C.dim, fontFamily: F.grotesk, fontSize: ms(13), lineHeight: ms(20) },

  bikes: { marginBottom: vs(10) },
  bikeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(14),
    paddingVertical: vs(13),
    borderBottomWidth: 1,
    borderBottomColor: C.line2,
  },
  bikeThumb: { width: rs(78), height: rs(58), borderWidth: 1, borderColor: C.line },
  bikeInfo: { flex: 1 },
  bikeMaker: { color: C.faint, fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.4) },
  bikeName: { color: C.ink, fontFamily: F.serif, fontSize: ms(20), lineHeight: ms(22) },
  bikeMeta: { color: C.dim, fontFamily: F.mono, fontSize: rs(10), marginTop: vs(2) },
  bikePrice: { alignItems: 'flex-end' },
  bikeRupee: { color: C.sun, fontFamily: F.grotesk, fontWeight: '600', fontSize: ms(15) },
  bikePer: { color: C.faint, fontFamily: F.mono, fontSize: rs(9) },

  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  barInner: { paddingHorizontal: rs(24), paddingTop: vs(16), paddingBottom: vs(30) },
  cta: {
    paddingVertical: vs(17),
    backgroundColor: C.ember,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(1.5) },
});
