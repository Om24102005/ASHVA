/** Bike Detail — cinematic hero, spec grid, about, features, included, sticky
 *  book bar. Ported from www/js/screens/detail.js. Presentational: no nav, all
 *  sizing through rs()/vs()/ms(), photos degrade to gradient via CinematicImage. */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { CinematicImage } from '../components/CinematicImage';
import { C, type, F, radius } from '../theme';
import { rs, vs, ms } from '../responsive';
import { INCLUDED, Bike } from '../data';

const SPECS: { label: string; key: keyof Bike }[] = [
  { label: 'ENGINE', key: 'engine' },
  { label: 'POWER', key: 'power' },
  { label: 'TORQUE', key: 'torque' },
  { label: 'TOP SPEED', key: 'top' },
  { label: 'WEIGHT', key: 'weight' },
  { label: 'RANGE', key: 'range' },
  { label: 'TANK', key: 'tank' },
];

export function DetailScreen({
  bike,
  onBook,
  onBack,
}: {
  bike: Bike;
  onBook: () => void;
  onBack: () => void;
}) {
  return (
    <Screen edges={{ top: false, bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <CinematicImage uri={bike.photo} grad={bike.grad} style={styles.hero}>
          <LinearGradient
            colors={['rgba(23,17,13,0.5)', 'transparent', 'transparent', C.base]}
            locations={[0, 0.35, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTop}>
            <Press accessibilityLabel="Go back" onPress={onBack} style={styles.iconBtn}>
              <Text style={styles.chev}>‹</Text>
            </Press>
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.eyebrow}>// {bike.kicker} · {bike.maker}</Text>
            <Text style={styles.heroName}>{bike.name}</Text>
            <Text style={styles.heroTag}>{bike.tag}</Text>
          </View>
        </CinematicImage>

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <Text style={styles.metaStars}>★ {bike.rating}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{bike.rides} RIDES</Text>
            <Text style={styles.metaDot}>·</Text>
            <View style={styles.availRow}>
              <View style={styles.dot} />
              <Text style={styles.availText}>AVAILABLE</Text>
            </View>
          </View>

          <View style={styles.grid}>
            {SPECS.map((s) => (
              <View key={s.label} style={styles.cell}>
                <Text style={styles.cellLabel}>{s.label}</Text>
                <Text style={styles.cellValue}>{String(bike[s.key])}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>// ABOUT THIS MACHINE</Text>
          <Text style={styles.about}>{bike.about}</Text>

          <Text style={styles.section}>// EQUIPPED</Text>
          <View style={styles.features}>
            {bike.features.map((f) => (
              <View key={f} style={styles.feature}>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>// INCLUDED FREE</Text>
          <View style={styles.included}>
            {INCLUDED.map((x) => (
              <View key={x} style={styles.includedRow}>
                <Text style={styles.check}>✓</Text>
                <Text style={styles.includedText}>{x}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.bar}>
        <LinearGradient colors={['transparent', C.base]} locations={[0, 0.3]} style={StyleSheet.absoluteFill} />
        <View style={styles.barInner}>
          <View>
            <Text style={styles.barPrice}>
              ₹{bike.price.toLocaleString('en-IN')}
              <Text style={styles.barPer}> /day</Text>
            </Text>
          </View>
          <Press accessibilityLabel="Book this ride" onPress={onBook} style={styles.bookBtn}>
            <Text style={styles.bookText}>Book this ride →</Text>
          </Press>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: vs(120) },

  hero: { height: vs(430), justifyContent: 'flex-end' },
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
  heroBody: { paddingHorizontal: rs(24), paddingBottom: vs(24) },
  eyebrow: { color: C.amber, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(2) },
  heroName: { color: C.ink, fontFamily: F.serif, fontSize: rs(44), lineHeight: rs(44), marginTop: vs(6), marginBottom: vs(4) },
  heroTag: { color: C.dim, fontFamily: F.grotesk, fontSize: type.label, fontStyle: 'italic' },

  content: { paddingHorizontal: rs(24), paddingTop: vs(6) },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  metaStars: { color: C.amber, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(1) },
  metaText: { color: C.dim, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(1) },
  metaDot: { color: C.faint, marginHorizontal: rs(8) },
  availRow: { flexDirection: 'row', alignItems: 'center', marginLeft: rs(8) },
  dot: { width: rs(7), height: rs(7), borderRadius: rs(7) / 2, backgroundColor: C.green, marginRight: rs(6) },
  availText: { color: C.green, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(1) },

  grid: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: vs(22) },
  cell: {
    width: '33.33%',
    paddingVertical: vs(16),
    paddingHorizontal: rs(14),
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line2,
  },
  cellLabel: { color: C.faint, fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.5) },
  cellValue: { color: C.ink, fontFamily: F.grotesk, fontWeight: '600', fontSize: ms(18), marginTop: vs(4) },

  section: { color: C.sun, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(2) },
  about: { color: C.dim, fontFamily: F.grotesk, fontSize: type.body, lineHeight: ms(25), marginTop: vs(12), marginBottom: vs(26) },

  features: { flexDirection: 'row', flexWrap: 'wrap', marginTop: vs(14), marginBottom: vs(26) },
  feature: {
    paddingVertical: vs(9),
    paddingHorizontal: rs(14),
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    marginRight: rs(8),
    marginBottom: vs(8),
  },
  featureText: { color: C.dim, fontFamily: F.mono, fontSize: rs(10.5), letterSpacing: rs(0.6) },

  included: { marginTop: vs(14), marginBottom: vs(10) },
  includedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(11),
    borderBottomWidth: 1,
    borderBottomColor: C.line2,
  },
  check: { color: C.sun, fontSize: ms(14), marginRight: rs(12) },
  includedText: { color: C.ink, fontFamily: F.grotesk, fontSize: type.label },

  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: rs(24),
    paddingTop: vs(16),
    paddingBottom: vs(30),
  },
  barPrice: { color: C.sun, fontFamily: F.grotesk, fontWeight: '700', fontSize: ms(24) },
  barPer: { color: C.faint, fontWeight: '400', fontSize: type.label },
  bookBtn: {
    flex: 1,
    marginLeft: rs(16),
    paddingVertical: vs(17),
    backgroundColor: C.ember,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  bookText: { color: '#fff', fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(1.5) },
});
