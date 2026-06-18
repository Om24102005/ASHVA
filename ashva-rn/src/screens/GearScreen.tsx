/** Booking Step 2 — gear add-ons grid with a live ₹ total.
 *  Faithful 1:1 RN port of www/js/screens/gear.js (sharp, editorial, cinematic).
 *  Two-column grid of toggleable gear cards (icon · name · desc · +₹/day),
 *  ember selected state with a check badge, and a fixed bottom bar showing the
 *  item count + running add-on total. Parent owns navigation. */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { Topbar, Progress } from '../components/chrome';
import { C, F } from '../theme';
import { rs, vs } from '../responsive';
import { GEAR } from '../data';

const rupee = (n: number) => '₹' + n.toLocaleString('en-IN');

/** Gear glyphs — faithful port of gear.js gearIcon(). Sun-coloured, 1.6 stroke. */
function GearIcon({ id }: { id: string }) {
  const props = {
    fill: 'none' as const,
    stroke: C.sun,
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const size = rs(26);
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {id === 'cam' && (
        <>
          <Rect x={3} y={7} width={13} height={11} rx={1} {...props} />
          <Path d="M16 10l5-3v10l-5-3z" {...props} />
        </>
      )}
      {id === 'jkt' && (
        <>
          <Path d="M8 4l4 3 4-3 4 3-2 3v9H6v-9L4 7z" {...props} />
          <Path d="M12 7v13" {...props} />
        </>
      )}
      {id === 'comm' && (
        <>
          <Path d="M4 13a8 8 0 0116 0M4 13v3a2 2 0 002 2M20 13v3a2 2 0 01-2 2" {...props} />
          <Circle cx={6} cy={16} r={2} {...props} />
        </>
      )}
      {id === 'boot' && (
        <>
          <Path d="M7 3h4v9l7 4v4H7z" {...props} />
          <Path d="M7 16h11" {...props} />
        </>
      )}
      {id === 'bag' && (
        <>
          <Rect x={5} y={8} width={14} height={11} rx={1} {...props} />
          <Path d="M9 8V6a3 3 0 016 0v2" {...props} />
        </>
      )}
      {id === 'glove' && (
        <Path
          d="M7 11V6a1.5 1.5 0 013 0v4M10 10V5a1.5 1.5 0 013 0v5M13 10V6a1.5 1.5 0 013 0v6c0 4-2 7-6 7s-6-3-6-6l1-3"
          {...props}
        />
      )}
    </Svg>
  );
}

/** White check — port of helpers.js check('#fff',14). */
function Check() {
  return (
    <Svg width={rs(14)} height={rs(14)} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 12.5l4.5 4.5L19 6" />
    </Svg>
  );
}

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

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const chosen = GEAR.filter((g) => selected.has(g.id));
  const perDay = chosen.reduce((sum, g) => sum + g.p, 0);
  const extra = perDay * days; // running add-on total: Σ selected p × days
  const count = chosen.length;

  const handleContinue = () =>
    onContinue(chosen.map((g) => ({ id: g.id, name: g.n, pricePerDay: g.p })));

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <Topbar title="GEAR · STEP 2" onBack={onBack} />
      <Progress step={1} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* heading block */}
        <View style={styles.head}>
          <Text style={styles.title}>
            Pack for the{'\n'}
            <Text style={styles.titleEm}>mountains.</Text>
          </Text>
          <Text style={styles.sub}>Premium gear, sanitised and sized on delivery. Priced per day.</Text>
        </View>

        {/* 2-column gear grid */}
        <View style={styles.grid}>
          {GEAR.map((g) => {
            const on = selected.has(g.id);
            return (
              <Press
                key={g.id}
                accessibilityLabel={`Add ${g.n}`}
                onPress={() => toggle(g.id)}
                style={[styles.card, on ? styles.cardOn : styles.cardOff]}
              >
                <View style={[styles.badge, on ? styles.badgeOn : styles.badgeOff]}>{on && <Check />}</View>
                <View style={styles.iconWrap}>
                  <GearIcon id={g.id} />
                </View>
                <Text style={styles.gearName}>{g.n}</Text>
                <Text style={styles.gearDesc}>{g.d}</Text>
                <Text style={styles.gearPrice}>
                  +{rupee(g.p)}
                  <Text style={styles.perDay}>/day</Text>
                </Text>
              </Press>
            );
          })}
        </View>
      </ScrollView>

      {/* fixed bottom bar — item count + add-on total + CTA */}
      <View style={styles.footer} pointerEvents="box-none">
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            {count} ITEM{count === 1 ? '' : 'S'} ADDED
          </Text>
          <Text style={styles.totalValue}>+{rupee(extra)}</Text>
        </View>
        <Press accessibilityLabel="Verify and pay" onPress={handleContinue} style={styles.cta}>
          <Text style={styles.ctaTxt}>VERIFY & PAY →</Text>
        </Press>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: vs(160) },

  head: { paddingHorizontal: rs(24), paddingTop: vs(18), paddingBottom: vs(8) },
  title: { fontFamily: F.serif, fontSize: rs(28), lineHeight: rs(29), color: C.ink, marginBottom: vs(6) },
  titleEm: { fontStyle: 'italic', color: C.ember },
  sub: { fontFamily: F.grotesk, fontSize: rs(13), lineHeight: rs(20), color: C.dim },

  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: rs(24), paddingVertical: vs(14), gap: rs(11) },
  card: {
    width: '47%',
    flexGrow: 1,
    position: 'relative',
    padding: rs(16),
    borderWidth: 1,
  },
  cardOff: { backgroundColor: C.surf, borderColor: C.line },
  cardOn: { backgroundColor: 'rgba(226,84,42,0.08)', borderColor: C.ember },

  badge: {
    position: 'absolute',
    top: rs(12),
    right: rs(12),
    width: rs(22),
    height: rs(22),
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOff: { borderColor: C.faint, backgroundColor: 'transparent' },
  badgeOn: { borderColor: C.ember, backgroundColor: C.ember },

  iconWrap: { height: rs(30), justifyContent: 'flex-end', alignItems: 'flex-start' },
  gearName: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(15), color: C.ink, marginTop: vs(14) },
  gearDesc: { fontFamily: F.mono, fontSize: rs(10), color: C.faint, marginTop: vs(3) },
  gearPrice: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(14), color: C.sun, marginTop: vs(10) },
  perDay: { fontFamily: F.mono, fontSize: rs(10), color: C.faint, fontWeight: '400' },

  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: rs(24),
    paddingTop: vs(16),
    paddingBottom: vs(30),
    backgroundColor: C.base,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: vs(12) },
  totalLabel: { fontFamily: F.mono, fontSize: rs(11), letterSpacing: rs(0.9), color: C.dim },
  totalValue: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(15), color: C.sun },

  cta: { paddingVertical: vs(17), alignItems: 'center', backgroundColor: C.ember },
  ctaTxt: { color: '#fff', fontFamily: F.mono, fontSize: rs(12), letterSpacing: rs(1.9) },
});
