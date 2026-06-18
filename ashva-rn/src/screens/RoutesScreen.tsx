/** Routes — large photo route cards (curated expeditions list).
 *  Faithful RN port of www/js/screens/routes.js (sharp, editorial, cinematic);
 *  mirrors HomeScreen's route-rail card look as full-width vertical cards.
 *  Scales via rs()/vs() (390 base); photos degrade to gradient if they fail. */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { CinematicImage } from '../components/CinematicImage';
import { Eyebrow } from '../components/chrome';
import { C, F } from '../theme';
import { rs, vs } from '../responsive';
import { ROUTES, Route } from '../data';

export function RoutesScreen({ onOpen }: { onOpen: (route: Route) => void }) {
  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.head}>
          <Eyebrow>{'// EXPEDITIONS'}</Eyebrow>
          <Text style={styles.title}>
            Curated{'\n'}
            <Text style={styles.titleEm}>routes.</Text>
          </Text>
          <Text style={styles.sub}>
            Four rides, hand-mapped by ASHVA scouts. Bike, gear and permits sorted.
          </Text>
        </View>

        {/* CARDS */}
        <View style={styles.list}>
          {ROUTES.map((r) => (
            <Press key={r.id} accessibilityLabel={`View ${r.name}`} onPress={() => onOpen(r)}>
              <CinematicImage uri={r.photo} grad={r.grad} style={styles.card}>
                <View style={styles.overlay} />
                {/* top tags */}
                <View style={styles.tags}>
                  <View style={styles.tag}>
                    <Text style={styles.tagTerrain}>{r.terrain}</Text>
                  </View>
                  {r.alt !== 'Sea level' && (
                    <View style={styles.tag}>
                      <Text style={styles.tagAlt}>{'▲ ' + r.alt}</Text>
                    </View>
                  )}
                </View>
                {/* bottom text */}
                <View style={styles.cardBody}>
                  <Eyebrow color={C.dim}>{'// ' + r.region}</Eyebrow>
                  <Text style={styles.name}>{r.name}</Text>
                  <View style={styles.stats}>
                    <Text style={styles.stat}>{r.days} DAYS</Text>
                    <Text style={styles.stat}>{r.km} KM</Text>
                    <Text style={styles.stat}>{r.bikes.length} BIKES</Text>
                  </View>
                </View>
              </CinematicImage>
            </Press>
          ))}
        </View>
        <View style={{ height: vs(20) }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { paddingHorizontal: rs(24), paddingTop: vs(64), paddingBottom: vs(8) },
  title: { fontFamily: F.serif, fontSize: rs(38), lineHeight: rs(39), color: C.ink, marginTop: vs(4) },
  titleEm: { fontFamily: F.serif, fontStyle: 'italic', color: C.ember },
  sub: { fontFamily: F.grotesk, fontSize: rs(13), color: C.dim, marginTop: vs(10), lineHeight: rs(20) },

  list: { paddingHorizontal: rs(24), paddingVertical: vs(22), gap: vs(16) },
  card: { height: vs(230), borderWidth: 1, borderColor: C.line },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(23,17,13,0.4)' },

  tags: { position: 'absolute', top: vs(16), left: rs(16), flexDirection: 'row', gap: rs(8) },
  tag: { paddingHorizontal: rs(10), paddingVertical: vs(5), backgroundColor: 'rgba(23,17,13,0.55)', borderWidth: 1, borderColor: C.line },
  tagTerrain: { fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.2), color: C.amber },
  tagAlt: { fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.2), color: C.dim },

  cardBody: { position: 'absolute', left: rs(18), right: rs(18), bottom: vs(18) },
  name: { fontFamily: F.serif, fontSize: rs(32), lineHeight: rs(32), color: C.ink, marginTop: vs(5), marginBottom: vs(10) },
  stats: { flexDirection: 'row', gap: rs(18) },
  stat: { fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(0.7), color: C.dim },
});
