/** Booking Step 2 — gear add-ons as toggleable rows with a live ₹ total.
 *  Ported from www/js/screens/gear.js. Presentational: parent owns navigation
 *  and receives the selected gear on Continue. */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { C, type, F, radius } from '../theme';
import { rs, vs, ms } from '../responsive';
import { GEAR } from '../data';

export function GearScreen({
  days,
  onContinue,
  onBack,
}: {
  days: number;
  onContinue: (gear: { id: string; name: string; pricePerDay: number }[]) => void;
  onBack: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const chosen = GEAR.filter((g) => selected.has(g.id));
  const perDay = chosen.reduce((sum, g) => sum + g.p, 0);
  const extra = perDay * days;
  const count = chosen.length;

  const handleContinue = () =>
    onContinue(chosen.map((g) => ({ id: g.id, name: g.n, pricePerDay: g.p })));

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <View style={styles.topbar}>
        <Press accessibilityLabel="Go back" onPress={onBack} style={styles.back}>
          <Text style={styles.backArrow}>←</Text>
        </Press>
        <Text style={styles.topbarTitle}>GEAR · STEP 2</Text>
        <View style={styles.back} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.title}>
            Pack for the{'\n'}
            <Text style={styles.titleEm}>mountains.</Text>
          </Text>
          <Text style={styles.sub}>
            Premium gear, sanitised and sized on delivery. Priced per day.
          </Text>
        </View>

        {GEAR.map((g) => {
          const on = selected.has(g.id);
          return (
            <Press
              key={g.id}
              accessibilityLabel={`Add ${g.n}`}
              onPress={() => toggle(g.id)}
              style={[styles.row, on && styles.rowOn]}
            >
              <View style={styles.rowBody}>
                <Text style={styles.gearName}>{g.n}</Text>
                <Text style={styles.gearDesc}>{g.d}</Text>
                <Text style={styles.gearPrice}>
                  +₹{g.p.toLocaleString('en-IN')}
                  <Text style={styles.perDay}>/day</Text>
                </Text>
              </View>
              <View style={[styles.checkbox, on && styles.checkboxOn]}>
                {on && <Text style={styles.check}>✓</Text>}
              </View>
            </Press>
          );
        })}
        <View style={{ height: vs(28) }} />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {count} ITEM{count === 1 ? '' : 'S'} ADDED
          </Text>
          <Text style={styles.totalValue}>+₹{extra.toLocaleString('en-IN')}</Text>
        </View>
        <Press accessibilityLabel="Continue" onPress={handleContinue} style={styles.cta}>
          <Text style={styles.ctaText}>Continue →</Text>
        </Press>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(16),
    paddingVertical: vs(10),
  },
  back: { width: rs(44), height: rs(44), justifyContent: 'center', alignItems: 'center' },
  backArrow: { color: C.ink, fontSize: ms(22) },
  topbarTitle: {
    color: C.dim,
    fontFamily: F.mono,
    fontSize: type.caption,
    letterSpacing: rs(2),
  },

  scroll: { paddingHorizontal: rs(24), paddingTop: vs(8) },
  head: { marginBottom: vs(14) },
  title: { color: C.ink, fontFamily: F.serif, fontSize: ms(28), lineHeight: ms(30) },
  titleEm: { color: C.ember, fontStyle: 'italic' },
  sub: { color: C.dim, fontFamily: F.grotesk, fontSize: type.label, lineHeight: ms(20), marginTop: vs(6) },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: rs(16),
    marginBottom: vs(11),
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.md,
  },
  rowOn: { backgroundColor: 'rgba(226,84,42,0.08)', borderColor: C.ember },
  rowBody: { flex: 1 },
  gearName: { color: C.ink, fontFamily: F.grotesk, fontWeight: '600', fontSize: ms(15) },
  gearDesc: { color: C.faint, fontFamily: F.mono, fontSize: ms(10), marginTop: vs(3) },
  gearPrice: { color: C.sun, fontFamily: F.grotesk, fontWeight: '600', fontSize: ms(14), marginTop: vs(10) },
  perDay: { color: C.faint, fontWeight: '400', fontSize: ms(10) },

  checkbox: {
    width: rs(22),
    height: rs(22),
    borderWidth: 1.5,
    borderColor: C.faint,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: rs(14),
  },
  checkboxOn: { borderColor: C.ember, backgroundColor: C.ember },
  check: { color: '#fff', fontSize: ms(14), fontWeight: '700' },

  footer: {
    paddingHorizontal: rs(24),
    paddingTop: vs(16),
    paddingBottom: vs(30),
    backgroundColor: C.base,
    borderTopWidth: 1,
    borderTopColor: C.line2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: vs(12),
  },
  totalLabel: { color: C.dim, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(1.5) },
  totalValue: { color: C.sun, fontFamily: F.grotesk, fontWeight: '600', fontSize: ms(15) },
  cta: {
    backgroundColor: C.ember,
    paddingVertical: vs(17),
    alignItems: 'center',
    borderRadius: radius.md,
  },
  ctaText: { color: '#fff', fontFamily: F.mono, fontSize: ms(12), letterSpacing: rs(2) },
});
