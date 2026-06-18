/** Home — the ASHVA fleet as cinematic cards. Scales to any screen via rs()/vs()
 *  and real safe-area insets; photos degrade to gradient if they fail to load. */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { CinematicImage } from '../components/CinematicImage';
import { C, type, F, radius } from '../theme';
import { rs, vs } from '../responsive';
import { BIKES, Bike } from '../data';

export function HomeScreen({ onSelect }: { onSelect: (bike: Bike) => void }) {
  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.kicker}>GOLDEN HOUR HIGHWAY</Text>
          <Text style={styles.title}>Find your ride</Text>
        </View>

        {BIKES.map((b) => (
          <Press key={b.id} accessibilityLabel={`View ${b.maker} ${b.name}`} onPress={() => onSelect(b)} style={styles.cardWrap}>
            <CinematicImage uri={b.photo} grad={b.grad} style={styles.card}>
              <View style={styles.cardBody}>
                <Text style={styles.cardKicker}>{b.kicker}</Text>
                <Text style={styles.cardMaker}>{b.maker}</Text>
                <Text style={styles.cardName}>{b.name}</Text>
                <View style={styles.cardRow}>
                  <Text style={styles.price}>₹{b.price.toLocaleString('en-IN')}<Text style={styles.perDay}> /day</Text></Text>
                  <Text style={styles.rating}>★ {b.rating} · {b.rides} rides</Text>
                </View>
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
  cardWrap: { marginBottom: vs(16) },
  card: { height: vs(230), borderRadius: radius.lg, borderWidth: 1, borderColor: C.line },
  cardBody: { padding: rs(18) },
  cardKicker: { color: C.ink, fontSize: type.caption, fontFamily: F.mono, letterSpacing: rs(2), opacity: 0.9 },
  cardMaker: { color: C.dim, fontSize: type.label, marginTop: vs(8), letterSpacing: rs(1) },
  cardName: { color: C.ink, fontFamily: F.serif, fontSize: rs(28) },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: vs(10) },
  price: { color: C.ink, fontSize: type.h3, fontWeight: '700' },
  perDay: { color: C.dim, fontSize: type.label, fontWeight: '400' },
  rating: { color: C.amber, fontSize: type.label },
});
