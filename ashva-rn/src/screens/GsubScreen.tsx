/** ASHVA Membership — tiered subscription upsell. Ported & adapted from
 *  www/js/screens/gsub.js (loyalty tier + perks + prefs). Presentational:
 *  no nav, all sizing via rs()/vs()/ms(). Pick a tier, toggle add-ons,
 *  hit subscribe → onSubscribe(selectedTierId). Scrollable, dark theme. */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { C, type, F, radius } from '../theme';
import { rs, vs, ms } from '../responsive';

type Tier = {
  id: string;
  name: string;
  kicker: string;
  price: number;
  per: string;
  perks: string[];
  featured?: boolean;
};

// Tier names lifted from the source's loyalty progression
// (Expedition → Summit), with perks faithful to gsub.js "PERKS UNLOCKED".
const TIERS: Tier[] = [
  {
    id: 'expedition',
    name: 'Expedition',
    kicker: '// ENTRY TIER',
    price: 499,
    per: '/month',
    perks: [
      '15% off all rentals',
      'Free insurance upgrade',
      'ASHVA Wallet ₹2,400 credit',
      'Live DigiLocker verification',
    ],
  },
  {
    id: 'summit',
    name: 'Summit',
    kicker: '// FLAGSHIP TIER',
    price: 1499,
    per: '/month',
    featured: true,
    perks: [
      '20% off every expedition',
      'Free gear on every ride',
      'Priority pass on new bikes',
      'Dedicated trip concierge',
      'Weather-aware routing',
      'Offline map packs included',
    ],
  },
];

// Optional add-ons — ported from gsub.js preferences toggles.
const ADDONS: { k: string; title: string; sub: string }[] = [
  { k: 'weather', title: 'Weather-aware routing', sub: 'Reroute around storms & landslides' },
  { k: 'convoy', title: 'Convoy mode', sub: 'Share live location with your group' },
  { k: 'ecall', title: 'Crash eCall', sub: 'Auto-call control room on impact' },
  { k: 'offline', title: 'Offline map packs', sub: 'Download routes for no-signal zones' },
];

export function GsubScreen({
  onBack,
  onSubscribe,
}: {
  onBack: () => void;
  onSubscribe: (tier: string) => void;
}) {
  const [selected, setSelected] = useState<string>('summit');
  const [addons, setAddons] = useState<Record<string, boolean>>({
    weather: true,
    convoy: false,
    ecall: true,
    offline: false,
  });

  const tier = TIERS.find((t) => t.id === selected) ?? TIERS[0];

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <View style={styles.header}>
        <Press accessibilityLabel="Go back" onPress={onBack} style={styles.iconBtn}>
          <Text style={styles.chev}>‹</Text>
        </Press>
        <Text style={styles.headerTitle}>MEMBERSHIP</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={styles.eyebrow}>// LOYALTY &amp; TIER</Text>
          <Text style={styles.title}>Ride further.{'\n'}Unlock more.</Text>
          <Text style={styles.lede}>
            Pick a tier to unlock free gear, priority bikes and up to 20% off every expedition.
            Cancel anytime.
          </Text>
        </View>

        <View style={styles.tiers}>
          {TIERS.map((t) => {
            const on = t.id === selected;
            return (
              <Press
                key={t.id}
                accessibilityLabel={`Select ${t.name} tier`}
                haptic
                onPress={() => setSelected(t.id)}
                style={[styles.card, on && styles.cardOn]}
              >
                {t.featured && (
                  <LinearGradient
                    colors={['rgba(243,169,59,0.12)', C.surf]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0.8, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <View style={styles.cardHead}>
                  <View style={styles.cardHeadText}>
                    <Text style={styles.cardKicker}>{t.kicker}</Text>
                    <Text style={styles.cardName}>{t.name}</Text>
                  </View>
                  <View style={[styles.radio, on && styles.radioOn]}>
                    {on && <View style={styles.radioDot} />}
                  </View>
                </View>

                {t.featured && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>★ MOST POPULAR</Text>
                  </View>
                )}

                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{t.price.toLocaleString('en-IN')}</Text>
                  <Text style={styles.per}>{t.per}</Text>
                </View>

                <View style={styles.perks}>
                  {t.perks.map((p) => (
                    <View key={p} style={styles.perkRow}>
                      <Text style={styles.check}>✓</Text>
                      <Text style={styles.perkText}>{p}</Text>
                    </View>
                  ))}
                </View>
              </Press>
            );
          })}
        </View>

        <Text style={styles.section}>// ADD-ONS</Text>
        <View style={styles.addons}>
          {ADDONS.map((a) => (
            <View key={a.k} style={styles.addonRow}>
              <View style={styles.addonText}>
                <Text style={styles.addonTitle}>{a.title}</Text>
                <Text style={styles.addonSub}>{a.sub}</Text>
              </View>
              <Switch
                value={!!addons[a.k]}
                onValueChange={(v) => setAddons((s) => ({ ...s, [a.k]: v }))}
                trackColor={{ false: 'rgba(244,235,221,0.12)', true: C.ember }}
                thumbColor="#fff"
                ios_backgroundColor="rgba(244,235,221,0.12)"
              />
            </View>
          ))}
        </View>

        <Text style={styles.fine}>
          All documents are fetched live from DigiLocker at booking time. ASHVA stores only a
          verification token, never the document itself.
        </Text>
      </ScrollView>

      <View style={styles.bar}>
        <LinearGradient colors={['transparent', C.base]} locations={[0, 0.3]} style={StyleSheet.absoluteFill} />
        <View style={styles.barInner}>
          <View>
            <Text style={styles.barPrice}>
              ₹{tier.price.toLocaleString('en-IN')}
              <Text style={styles.barPer}> {tier.per}</Text>
            </Text>
            <Text style={styles.barTier}>{tier.name.toUpperCase()} TIER</Text>
          </View>
          <Press
            accessibilityLabel={`Subscribe to ${tier.name} tier`}
            onPress={() => onSubscribe(selected)}
            style={styles.cta}
          >
            <Text style={styles.ctaText}>Subscribe →</Text>
          </Press>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(20),
    paddingVertical: vs(10),
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
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
  headerTitle: { color: C.ink, fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(3) },

  scroll: { paddingHorizontal: rs(24), paddingTop: vs(18), paddingBottom: vs(140) },

  intro: { marginBottom: vs(24) },
  eyebrow: { color: C.amber, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(2) },
  title: { color: C.ink, fontFamily: F.serif, fontSize: rs(38), lineHeight: rs(42), marginTop: vs(10) },
  lede: { color: C.dim, fontFamily: F.grotesk, fontSize: type.body, lineHeight: ms(24), marginTop: vs(12) },

  tiers: { gap: vs(14) },
  card: {
    backgroundColor: C.surf,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.md,
    padding: rs(20),
    overflow: 'hidden',
  },
  cardOn: { borderColor: C.sun },

  cardHead: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardHeadText: { flex: 1 },
  cardKicker: { color: C.amber, fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.5) },
  cardName: { color: C.ink, fontFamily: F.serif, fontSize: ms(26), marginTop: vs(4) },

  radio: {
    width: rs(24),
    height: rs(24),
    borderRadius: rs(12),
    borderWidth: 1.5,
    borderColor: C.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: C.sun },
  radioDot: { width: rs(12), height: rs(12), borderRadius: rs(6), backgroundColor: C.sun },

  badge: {
    alignSelf: 'flex-start',
    marginTop: vs(12),
    paddingVertical: vs(5),
    paddingHorizontal: rs(10),
    backgroundColor: 'rgba(243,169,59,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(243,169,59,0.4)',
    borderRadius: radius.sm,
  },
  badgeText: { color: C.amber, fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.4) },

  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: vs(16) },
  price: { color: C.sun, fontFamily: F.grotesk, fontWeight: '700', fontSize: ms(30) },
  per: { color: C.faint, fontFamily: F.grotesk, fontSize: type.label, marginLeft: rs(6) },

  perks: { marginTop: vs(16) },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(9),
    borderTopWidth: 1,
    borderTopColor: C.line2,
  },
  check: { color: C.amber, fontSize: ms(13), marginRight: rs(12) },
  perkText: { color: C.ink, fontFamily: F.grotesk, fontSize: type.label, flex: 1 },

  section: {
    color: C.sun,
    fontFamily: F.mono,
    fontSize: type.caption,
    letterSpacing: rs(2),
    marginTop: vs(30),
    marginBottom: vs(6),
  },
  addons: { marginTop: vs(6) },
  addonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: vs(16),
    borderBottomWidth: 1,
    borderBottomColor: C.line2,
  },
  addonText: { flex: 1, marginRight: rs(14) },
  addonTitle: { color: C.ink, fontFamily: F.grotesk, fontWeight: '600', fontSize: type.label },
  addonSub: { color: C.faint, fontFamily: F.mono, fontSize: rs(10), marginTop: vs(3) },

  fine: {
    color: C.faint,
    fontFamily: F.grotesk,
    fontSize: type.caption,
    lineHeight: ms(19),
    marginTop: vs(22),
  },

  bar: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  barInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: rs(24),
    paddingTop: vs(16),
    paddingBottom: vs(34),
  },
  barPrice: { color: C.sun, fontFamily: F.grotesk, fontWeight: '700', fontSize: ms(24) },
  barPer: { color: C.faint, fontWeight: '400', fontSize: type.label },
  barTier: { color: C.dim, fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.5), marginTop: vs(3) },
  cta: {
    paddingVertical: vs(16),
    paddingHorizontal: rs(28),
    backgroundColor: C.ember,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  ctaText: { color: '#fff', fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(1.5) },
});
