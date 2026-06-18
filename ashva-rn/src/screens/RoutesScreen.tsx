/** Routes — curated expeditions as large cinematic photo cards. Mirrors the
 *  HomeScreen card pattern; scales to any screen via rs()/vs()/ms() and real
 *  safe-area insets; photos degrade to gradient if they fail to load. */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { CinematicImage } from '../components/CinematicImage';
import { C, type, F, radius } from '../theme';
import { rs, vs } from '../responsive';
import { ROUTES, Route } from '../data';

export function RoutesScreen({ onOpen }: { onOpen: (route: Route) => void }) {
  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.kicker}>CURATED ROUTES</Text>
          <Text style={styles.title}>Where to ride</Text>
          <Text style={styles.sub}>
            Four rides, hand-mapped by ASHVA scouts. Bike, gear and permits sorted.
          </Text>
        </View>

        {ROUTES.map((r) => (
          <Press
            key={r.id}
            accessibilityLabel={`View ${r.name}`}
            onPress={() => onOpen(r)}
            style={styles.cardWrap}
          >
            <CinematicImage uri={r.photo} grad={r.grad} style={styles.card}>
              <View style={styles.tags}>
                <Text style={styles.tagTerrain}>{r.terrain}</Text>
                {r.alt !== 'Sea level' && <Text style={styles.tagAlt}>▲ {r.alt}</Text>}
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardRegion}>// {r.region}</Text>
                <Text style={styles.cardName}>{r.name}</Text>
                <View style={styles.statsRow}>
                  <Text style={styles.stat}>{r.days} DAYS</Text>
                  <Text style={styles.statDot}>·</Text>
                  <Text style={styles.stat}>{r.km} KM</Text>
                  <Text style={styles.statDot}>·</Text>
                  <Text style={styles.stat}>{r.alt}</Text>
                  <Text style={styles.statDot}>·</Text>
                  <Text style={styles.stat}>{r.terrain}</Text>
                </View>
                <Text style={styles.blurb} numberOfLines={2}>
                  {r.blurb}
                </Text>
              </View>
            </CinematicImage>
          </Press>
        ))}
        <View style={{ height: vs(28) }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: rs(20), paddingTop: vs(8) },
  head: { marginBottom: vs(18) },
  kicker: { color: C.ember, fontSize: type.caption, fontFamily: F.mono, letterSpacing: rs(2) },
  title: { color: C.ink, fontFamily: F.serif, fontSize: rs(36), marginTop: vs(4) },
  sub: { color: C.dim, fontSize: type.label, marginTop: vs(10), lineHeight: vs(20) },
  cardWrap: { marginBottom: vs(16) },
  card: { height: vs(248), borderRadius: radius.lg, borderWidth: 1, borderColor: C.line },
  tags: { position: 'absolute', top: rs(14), left: rs(14), flexDirection: 'row', gap: rs(8) },
  tagTerrain: {
    paddingVertical: vs(5),
    paddingHorizontal: rs(10),
    backgroundColor: 'rgba(23,17,13,0.55)',
    borderWidth: 1,
    borderColor: C.line,
    fontFamily: F.mono,
    fontSize: type.caption,
    letterSpacing: rs(1),
    color: C.amber,
    overflow: 'hidden',
  },
  tagAlt: {
    paddingVertical: vs(5),
    paddingHorizontal: rs(10),
    backgroundColor: 'rgba(23,17,13,0.55)',
    borderWidth: 1,
    borderColor: C.line,
    fontFamily: F.mono,
    fontSize: type.caption,
    letterSpacing: rs(1),
    color: C.dim,
    overflow: 'hidden',
  },
  cardBody: { padding: rs(18) },
  cardRegion: { color: C.dim, fontSize: type.caption, fontFamily: F.mono, letterSpacing: rs(2) },
  cardName: { color: C.ink, fontFamily: F.serif, fontSize: rs(30), marginTop: vs(5) },
  statsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: vs(10) },
  stat: { color: C.dim, fontSize: type.label, fontFamily: F.mono, letterSpacing: rs(1) },
  statDot: { color: C.faint, fontSize: type.label, marginHorizontal: rs(7) },
  blurb: { color: C.dim, fontSize: type.label, marginTop: vs(8), lineHeight: vs(18) },
});
