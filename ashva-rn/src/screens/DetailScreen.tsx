/** Bike Detail — cinematic hero, 6-cell spec grid, about, equipped, included,
 *  sticky price + CTA. Faithful 1:1 RN port of www/js/screens/detail.js.
 *  Sharp corners, 1px borders, mono uppercase labels — matches HomeScreen DS. */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { CinematicImage } from '../components/CinematicImage';
import { Eyebrow } from '../components/chrome';
import { C, F } from '../theme';
import { rs, vs } from '../responsive';
import { INCLUDED, Bike } from '../data';

const rupee = (n: number) => '₹' + n.toLocaleString('en-IN');

/** detail.js chevL() — back chevron, 1.8 stroke, round caps. */
function ChevL() {
  return (
    <Svg width={rs(22)} height={rs(22)} viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M15 5l-7 7 7 7" />
    </Svg>
  );
}

/** helpers.js check() — 16px green tick, 2.4 stroke. */
function Check() {
  return (
    <Svg width={rs(16)} height={rs(16)} viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12.5l4.5 4.5L19 6" />
    </Svg>
  );
}

const SPECS: { label: string; key: keyof Bike }[] = [
  { label: 'ENGINE', key: 'engine' },
  { label: 'POWER', key: 'power' },
  { label: 'TORQUE', key: 'torque' },
  { label: 'TOP SPEED', key: 'top' },
  { label: 'WEIGHT', key: 'weight' },
  { label: 'RANGE', key: 'range' },
];

export function DetailScreen({ bike, onBook, onBack }: { bike: Bike; onBook: () => void; onBack: () => void }) {
  return (
    <Screen edges={{ top: false, bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* HERO — photo over gradient, cinematic fade, back button, maker/name overlay */}
        <CinematicImage uri={bike.photo} grad={bike.grad} style={styles.hero}>
          <LinearGradient
            colors={['rgba(23,17,13,0.5)', 'transparent', 'transparent', C.base]}
            locations={[0, 0.35, 0.55, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heroTop}>
            <Press accessibilityLabel="Go back" onPress={onBack} style={styles.iconBtn}>
              <ChevL />
            </Press>
          </View>
          <View style={styles.heroBody}>
            <Eyebrow color={C.amber}>{'// ' + bike.kicker + ' · ' + bike.maker}</Eyebrow>
            <Text style={styles.heroName}>{bike.name}</Text>
            <Text style={styles.heroTag}>{bike.tag}</Text>
          </View>
        </CinematicImage>

        <View style={styles.content}>
          {/* meta line: stars · rides · available */}
          <View style={styles.metaRow}>
            <Text style={styles.metaStars}>
              <Text style={{ color: C.amber }}>★</Text> <Text style={styles.metaStrong}>{bike.rating}</Text>
            </Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{bike.rides} RIDES</Text>
            <Text style={styles.metaDot}>·</Text>
            <View style={styles.availRow}>
              <View style={styles.greenDot} />
              <Text style={styles.availText}>AVAILABLE</Text>
            </View>
          </View>

          {/* 3×2 spec grid */}
          <View style={styles.grid}>
            {SPECS.map((s) => (
              <View key={s.label} style={styles.cellWrap}>
                <View style={styles.cell}>
                  <Text style={styles.cellLabel}>{s.label}</Text>
                  <Text style={styles.cellValue}>{String(bike[s.key])}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* ABOUT */}
          <Eyebrow color={C.sun}>{'// ABOUT THIS MACHINE'}</Eyebrow>
          <Text style={styles.about}>{bike.about}</Text>

          {/* EQUIPPED */}
          <Eyebrow color={C.sun}>{'// EQUIPPED'}</Eyebrow>
          <View style={styles.features}>
            {bike.features.map((f) => (
              <View key={f} style={styles.feature}>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          {/* INCLUDED FREE */}
          <Eyebrow color={C.sun}>{'// INCLUDED FREE'}</Eyebrow>
          <View style={styles.included}>
            {INCLUDED.map((x) => (
              <View key={x} style={styles.includedRow}>
                <Check />
                <Text style={styles.includedText}>{x}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* sticky bottom — price + CONFIGURE CTA */}
      <View style={styles.bar} pointerEvents="box-none">
        <LinearGradient colors={['transparent', C.base]} locations={[0, 0.3]} style={StyleSheet.absoluteFill} />
        <View style={styles.barInner}>
          <Text style={styles.barPrice}>
            {rupee(bike.price)}
            <Text style={styles.barPer}> /day</Text>
          </Text>
          <Press accessibilityLabel="Configure this bike" onPress={onBook} style={styles.configBtn}>
            <Text style={styles.configText}>CONFIGURE THIS BIKE →</Text>
          </Press>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: vs(120) },

  // HERO
  hero: { height: vs(430), justifyContent: 'flex-end' },
  heroTop: { position: 'absolute', top: vs(56), left: rs(20), right: rs(20), flexDirection: 'row', justifyContent: 'space-between' },
  iconBtn: {
    width: rs(44), height: rs(44), minHeight: rs(44),
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: C.line,
    backgroundColor: 'rgba(23,17,13,0.5)',
  },
  heroBody: { paddingHorizontal: rs(24), paddingBottom: vs(24) },
  heroName: { color: C.ink, fontFamily: F.serif, fontSize: rs(44), lineHeight: rs(44), marginTop: vs(6), marginBottom: vs(4) },
  heroTag: { color: C.dim, fontFamily: F.grotesk, fontSize: rs(14), fontStyle: 'italic' },

  // CONTENT
  content: { paddingHorizontal: rs(24), paddingTop: vs(6) },

  metaRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: vs(16), borderBottomWidth: 1, borderBottomColor: C.line },
  metaStars: { fontFamily: F.mono, fontSize: rs(11), letterSpacing: rs(0.9), color: C.dim },
  metaStrong: { fontFamily: F.mono, color: C.dim },
  metaText: { fontFamily: F.mono, fontSize: rs(11), letterSpacing: rs(0.9), color: C.dim },
  metaDot: { color: C.faint, marginHorizontal: rs(8) },
  availRow: { flexDirection: 'row', alignItems: 'center', marginLeft: rs(8) },
  greenDot: { width: rs(7), height: rs(7), borderRadius: rs(7) / 2, backgroundColor: C.green, marginRight: rs(6) },
  availText: { fontFamily: F.mono, fontSize: rs(11), letterSpacing: rs(0.9), color: C.green },

  // SPEC GRID — 3 cols, 7px gutters, square cells
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginVertical: vs(22) },
  cellWrap: { width: '33.333%' },
  cell: {
    margin: rs(3.5),
    paddingVertical: vs(16), paddingHorizontal: rs(14),
    backgroundColor: C.surf, borderWidth: 1, borderColor: C.line2,
  },
  cellLabel: { fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.3), color: C.faint },
  cellValue: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(18), color: C.ink, marginTop: vs(4) },

  // ABOUT
  about: { fontFamily: F.grotesk, fontSize: rs(15), lineHeight: rs(15) * 1.65, color: C.dim, marginTop: vs(12), marginBottom: vs(26) },

  // EQUIPPED
  features: { flexDirection: 'row', flexWrap: 'wrap', marginTop: vs(14), marginBottom: vs(26) },
  feature: {
    paddingVertical: vs(9), paddingHorizontal: rs(14),
    backgroundColor: C.surf, borderWidth: 1, borderColor: C.line,
    marginRight: rs(8), marginBottom: vs(8),
  },
  featureText: { fontFamily: F.mono, fontSize: rs(10.5), letterSpacing: rs(0.63), color: C.dim },

  // INCLUDED
  included: { marginTop: vs(14), marginBottom: vs(10) },
  includedRow: { flexDirection: 'row', alignItems: 'center', gap: rs(12), paddingVertical: vs(11), borderBottomWidth: 1, borderBottomColor: C.line2 },
  includedText: { fontFamily: F.grotesk, fontSize: rs(14), color: C.ink },

  // STICKY BOTTOM
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  barInner: { flexDirection: 'row', alignItems: 'center', gap: rs(16), paddingHorizontal: rs(24), paddingTop: vs(16), paddingBottom: vs(30) },
  barPrice: { fontFamily: F.grotesk, fontWeight: '700', fontSize: rs(24), color: C.sun },
  barPer: { fontFamily: F.grotesk, fontWeight: '400', fontSize: rs(12), color: C.faint },
  configBtn: { flex: 1, paddingVertical: vs(17), backgroundColor: C.ember, alignItems: 'center' },
  configText: { color: '#fff', fontFamily: F.mono, fontSize: rs(12), letterSpacing: rs(1.9) },
});
