/** Home — auto-advancing hero carousel, routes rail, machines list.
 *  Faithful RN port of www/js/screens/home.js (sharp, editorial, cinematic). */
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { CinematicImage } from '../components/CinematicImage';
import { Crest, Eyebrow } from '../components/chrome';
import { C, F } from '../theme';
import { rs, vs } from '../responsive';
import { BIKES, ROUTES, Bike, Route } from '../data';

const rupee = (n: number) => '₹' + n.toLocaleString('en-IN');

export function HomeScreen({ onSelect, onOpenRoute }: { onSelect: (b: Bike) => void; onOpenRoute: (r: Route) => void }) {
  const [hi, setHi] = useState(0);
  const fill = useRef(new Animated.Value(0)).current;
  const b = BIKES[hi];

  useEffect(() => {
    fill.setValue(0);
    const anim = Animated.timing(fill, { toValue: 1, duration: 4800, easing: Easing.linear, useNativeDriver: false });
    anim.start();
    const t = setTimeout(() => setHi((i) => (i + 1) % BIKES.length), 4800);
    return () => { anim.stop(); clearTimeout(t); };
  }, [hi]);

  return (
    <Screen edges={{ top: false, bottom: false }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HERO */}
        <CinematicImage uri={b.photo} grad={b.grad} style={styles.hero}>
          <View style={StyleSheet.absoluteFill}>
            <View style={styles.heroOverlay} />
            {/* top bar: crest + wordmark + location chip */}
            <View style={styles.heroTop}>
              <View style={styles.brandRow}>
                <Crest size={rs(24)} />
                <Text style={styles.wordmark}>ASHVA</Text>
              </View>
              <View style={styles.locChip}>
                <View style={styles.dot} />
                <Text style={styles.locTxt}>MANALI · HP</Text>
              </View>
            </View>
            {/* bottom: bars + heroText */}
            <View style={styles.heroBottom}>
              <View style={styles.bars}>
                {BIKES.map((_, i) => (
                  <Press key={i} accessibilityLabel={`Show bike ${i + 1}`} onPress={() => setHi(i)} haptic={false} style={styles.barTrack}>
                    <View style={styles.barTrackInner}>
                      {i < hi && <View style={styles.barFull} />}
                      {i === hi && <Animated.View style={[styles.barFull, { width: fill.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />}
                    </View>
                  </Press>
                ))}
              </View>
              <View style={styles.heroTextRow}>
                <View style={{ flex: 1 }}>
                  <Eyebrow color={C.amber}>{'// ' + b.kicker + ' · ' + b.maker}</Eyebrow>
                  <Text style={styles.heroName}>{b.name}</Text>
                  <Text style={styles.heroTag}>{b.tag}</Text>
                </View>
                <View style={styles.heroPrice}>
                  <Text style={styles.priceBig}>{rupee(b.price)}</Text>
                  <Text style={styles.starline}><Text style={{ color: C.amber }}>★</Text> {b.rating}</Text>
                </View>
              </View>
              <View style={styles.tiles}>
                {([['ENGINE', b.engine], ['POWER', b.power], ['RANGE', b.range]] as const).map(([l, v]) => (
                  <View key={l} style={styles.tile}>
                    <Text style={styles.tileLabel}>{l}</Text>
                    <Text style={styles.tileVal}>{v}</Text>
                  </View>
                ))}
              </View>
              <Press accessibilityLabel={`View ${b.name}`} onPress={() => onSelect(b)} style={styles.viewBtn}>
                <Text style={styles.viewTxt}>VIEW BIKE →</Text>
              </Press>
            </View>
          </View>
        </CinematicImage>

        {/* search */}
        <View style={styles.body}>
          <View style={styles.search}>
            <Text style={styles.searchTxt}>Search bikes, routes, cities…</Text>
          </View>
          <View style={styles.sectionHead}>
            <View>
              <Eyebrow>CURATED RIDES</Eyebrow>
              <Text style={styles.sectionTitle}>Legendary routes</Text>
            </View>
            <Text style={styles.allLink}>ALL ›</Text>
          </View>
        </View>

        {/* routes rail */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.rail}>
          {ROUTES.map((r) => (
            <Press key={r.id} accessibilityLabel={`View ${r.name}`} onPress={() => onOpenRoute(r)} style={styles.railCardWrap}>
              <CinematicImage uri={r.photo} grad={r.grad} style={styles.railCard}>
                <View style={styles.railOverlay} />
                <View style={styles.railTag}><Text style={styles.railTagTxt}>{r.terrain}</Text></View>
                <View style={styles.railBody}>
                  <Eyebrow color={C.dim}>{'// ' + r.region}</Eyebrow>
                  <Text style={styles.railName}>{r.name}</Text>
                  <View style={styles.railStats}>
                    <Text style={styles.railStat}>{r.days} DAYS</Text>
                    <Text style={styles.railStat}>{r.km} KM</Text>
                  </View>
                </View>
              </CinematicImage>
            </Press>
          ))}
        </ScrollView>

        {/* machines list */}
        <View style={styles.body}>
          <View style={styles.sectionHead}>
            <View>
              <Eyebrow>{'// THE GARAGE'}</Eyebrow>
              <Text style={styles.sectionTitle}>Five machines</Text>
            </View>
            <Text style={styles.readyTxt}>{BIKES.length} READY</Text>
          </View>
          {BIKES.map((bk) => (
            <Press key={bk.id} accessibilityLabel={`View ${bk.name}`} onPress={() => onSelect(bk)} style={styles.row}>
              <CinematicImage uri={bk.photo} grad={bk.grad} style={styles.rowThumb} />
              <View style={styles.rowBody}>
                <Text style={styles.rowMaker}>{bk.maker}</Text>
                <Text style={styles.rowName}>{bk.name}</Text>
                <View style={styles.rowSpecs}>
                  <Text style={styles.rowSpec}>{bk.kicker}</Text>
                  <Text style={styles.rowSpec}>·</Text>
                  <Text style={styles.rowSpec}>{bk.power}</Text>
                  <Text style={styles.rowSpec}>·</Text>
                  <Text style={styles.rowSpec}><Text style={{ color: C.amber }}>★</Text> {bk.rating}</Text>
                </View>
              </View>
              <View style={styles.rowPrice}>
                <Text style={styles.rowPriceBig}>{rupee(bk.price)}</Text>
                <Text style={styles.rowPerDay}>PER DAY</Text>
              </View>
            </Press>
          ))}
        </View>
        <Text style={styles.footer}>— RIDE FREE · RIDE FAR —</Text>
        <View style={{ height: vs(20) }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: vs(548) },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'transparent' },
  heroTop: { position: 'absolute', top: vs(58), left: rs(24), right: rs(24), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: rs(9) },
  wordmark: { fontFamily: F.mono, fontWeight: '700', letterSpacing: rs(4.5), fontSize: rs(13), color: C.ink },
  locChip: { flexDirection: 'row', alignItems: 'center', gap: rs(7), paddingHorizontal: rs(12), paddingVertical: vs(7), backgroundColor: 'rgba(23,17,13,0.5)', borderWidth: 1, borderColor: C.line },
  dot: { width: rs(7), height: rs(7), borderRadius: rs(7) / 2, backgroundColor: C.green },
  locTxt: { fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(1.2), color: C.dim },

  heroBottom: { position: 'absolute', left: rs(24), right: rs(24), bottom: vs(30) },
  bars: { flexDirection: 'row', gap: rs(5), marginBottom: vs(18) },
  barTrack: { flex: 1, minHeight: 0 },
  barTrackInner: { height: 2.5, backgroundColor: 'rgba(244,235,221,0.25)', overflow: 'hidden' },
  barFull: { height: '100%', width: '100%', backgroundColor: C.ink },

  heroTextRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: vs(14) },
  heroName: { fontFamily: F.serif, fontSize: rs(38), lineHeight: rs(38), color: C.ink, marginTop: vs(6), marginBottom: vs(4) },
  heroTag: { fontFamily: F.grotesk, fontSize: rs(13), fontStyle: 'italic', color: C.dim },
  heroPrice: { alignItems: 'flex-end', flexShrink: 0, marginLeft: rs(10) },
  priceBig: { fontFamily: F.grotesk, fontWeight: '700', fontSize: rs(20), color: C.sun },
  starline: { fontFamily: F.mono, fontSize: rs(9), color: C.dim },

  tiles: { flexDirection: 'row', gap: rs(7), marginBottom: vs(14) },
  tile: { flex: 1, paddingVertical: vs(9), paddingHorizontal: rs(11), backgroundColor: 'rgba(23,17,13,0.42)', borderWidth: 1, borderColor: C.line },
  tileLabel: { fontFamily: F.mono, fontSize: rs(8.5), letterSpacing: rs(1), color: C.faint },
  tileVal: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(14), color: C.ink, marginTop: vs(2) },

  viewBtn: { paddingVertical: vs(15), alignItems: 'center', backgroundColor: C.ember },
  viewTxt: { color: '#fff', fontFamily: F.mono, fontSize: rs(12), letterSpacing: rs(2.2) },

  body: { paddingHorizontal: rs(24), paddingTop: vs(22) },
  search: { flexDirection: 'row', alignItems: 'center', gap: rs(12), paddingVertical: vs(15), paddingHorizontal: rs(18), backgroundColor: C.surf, borderWidth: 1, borderColor: C.line, marginBottom: vs(30) },
  searchTxt: { fontFamily: F.grotesk, fontSize: rs(14), color: C.faint },

  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: vs(16) },
  sectionTitle: { fontFamily: F.serif, fontSize: rs(25), color: C.ink, marginTop: vs(3) },
  allLink: { fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(1.2), color: C.sun },
  readyTxt: { fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(1.2), color: C.faint },

  rail: { paddingHorizontal: rs(24), gap: rs(14), paddingBottom: vs(30) },
  railCardWrap: { width: rs(230) },
  railCard: { height: vs(290), borderWidth: 1, borderColor: C.line },
  railOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(23,17,13,0.35)' },
  railTag: { position: 'absolute', top: vs(14), left: rs(14), paddingHorizontal: rs(9), paddingVertical: vs(5), backgroundColor: 'rgba(23,17,13,0.6)', borderWidth: 1, borderColor: C.line },
  railTagTxt: { fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.4), color: C.amber },
  railBody: { position: 'absolute', left: rs(16), right: rs(16), bottom: vs(16) },
  railName: { fontFamily: F.serif, fontSize: rs(26), lineHeight: rs(27), color: C.ink, marginTop: vs(4), marginBottom: vs(8) },
  railStats: { flexDirection: 'row', gap: rs(14) },
  railStat: { fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(0.8), color: C.dim },

  row: { flexDirection: 'row', alignItems: 'center', gap: rs(15), paddingVertical: vs(13), borderBottomWidth: 1, borderBottomColor: C.line2 },
  rowThumb: { width: rs(84), height: vs(64), borderWidth: 1, borderColor: C.line },
  rowBody: { flex: 1, minWidth: 0 },
  rowMaker: { fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.6), color: C.faint },
  rowName: { fontFamily: F.serif, fontSize: rs(20), lineHeight: rs(22), color: C.ink, marginVertical: vs(2) },
  rowSpecs: { flexDirection: 'row', gap: rs(10) },
  rowSpec: { fontFamily: F.mono, fontSize: rs(9.5), color: C.dim },
  rowPrice: { alignItems: 'flex-end' },
  rowPriceBig: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(16), color: C.sun },
  rowPerDay: { fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1), color: C.faint },

  footer: { textAlign: 'center', paddingHorizontal: rs(24), paddingTop: vs(34), paddingBottom: vs(10), fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(3.4), color: C.faint },
});
