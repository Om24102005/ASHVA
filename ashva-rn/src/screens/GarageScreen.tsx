/** Garage / Profile — the rider's account hub. Faithful RN port of the original
 *  web design (www/js/screens/garage.js): gradient circular avatar with serif
 *  initial, tier badge, stats row, square-bordered menu rows with chevrons, a
 *  bordered "SIGN OUT", and the crest footer. Wired to REAL session.user values
 *  (no fabricated stats) — empty data shows honest zeros / "Not added". */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { Eyebrow, Crest } from '../components/chrome';
import { C, F } from '../theme';
import { rs, vs } from '../responsive';

/* Chevron — the › on every navigable row (matches the web stroke chevron). */
function Chevron() {
  return (
    <Svg width={rs(16)} height={rs(16)} viewBox="0 0 24 24" fill="none" stroke={C.faint} strokeWidth={1.8}>
      <Path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/* Documents icon — square bordered box glyph (from gIcon('documents')). */
function DocIcon() {
  return (
    <Svg width={rs(20)} height={rs(20)} viewBox="0 0 24 24" fill="none" stroke={C.sun} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M5 3h14v18H5z" />
      <Path d="M8 8h8M8 12h8M8 16h5" />
    </Svg>
  );
}

/* Loyalty / club star (from gIcon('loyalty')). */
function StarIcon() {
  return (
    <Svg width={rs(20)} height={rs(20)} viewBox="0 0 24 24" fill="none" stroke={C.sun} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3l3 6 7 .8-5 4.7L18 21l-6-3.5L6 21l1-7.5-5-4.7L9 9z" />
    </Svg>
  );
}

/* Preferences cog (from gIcon('prefs')). */
function PrefsIcon() {
  return (
    <Svg width={rs(20)} height={rs(20)} viewBox="0 0 24 24" fill="none" stroke={C.sun} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 9a3 3 0 100 6 3 3 0 000-6z" />
      <Path d="M12 2v3M12 19v3M4 12H1M23 12h-3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" />
    </Svg>
  );
}

export function GarageScreen({
  session,
  onSignOut,
  onOpenKyc,
  onOpenMembership,
}: {
  session: any;
  onSignOut: () => void;
  onOpenKyc?: () => void;
  onOpenMembership?: () => void;
}) {
  const user = session?.user ?? {};
  const displayName: string = (user?.displayName || '').trim();
  const email: string = user?.contact?.email || '';
  const phone: string = user?.contact?.phone || '';
  const initial = (displayName || email || '?').charAt(0).toUpperCase();

  // Real, truthful stats — fall back to honest zeros when there's no data.
  const rides = Number(user?.stats?.rides ?? 0) || 0;
  const states = Number(user?.stats?.states ?? 0) || 0;
  const rating = user?.stats?.rating != null ? Number(user.stats.rating) : null;

  const tier: string = (user?.tier || user?.membership?.tier || '').trim();

  const kycStatus: string = user?.kyc?.status || 'Not started';
  const kycVerified = /verified|approved|complete/i.test(kycStatus);

  const [notifications, setNotifications] = useState<boolean>(user?.prefs?.notifications ?? true);
  const [offlineMaps, setOfflineMaps] = useState<boolean>(user?.prefs?.offlineMaps ?? false);

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile header — gradient circular avatar + name + tier badge */}
        <View style={styles.header}>
          <LinearGradient
            colors={[C.ember, C.amber]}
            start={{ x: 0.15, y: 0 }}
            end={{ x: 0.85, y: 1 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>{initial}</Text>
          </LinearGradient>
          <View style={styles.headerBody}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName || 'Add your details'}
            </Text>
            {tier ? (
              <View style={styles.tierBadge}>
                <Svg width={rs(12)} height={rs(12)} viewBox="0 0 24 24" fill={C.amber}>
                  <Path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" />
                </Svg>
                <Text style={styles.tierText}>{tier.toUpperCase()} TIER</Text>
              </View>
            ) : (
              <Text style={styles.contact} numberOfLines={1}>
                {email || phone || 'No contact on file'}
              </Text>
            )}
          </View>
        </View>

        {/* Stats — real values, honest zeros when empty */}
        <View style={styles.stats}>
          <Stat value={String(rides)} label="RIDES" />
          <View style={styles.statDivider} />
          <Stat value={String(states)} label="STATES" />
          <View style={styles.statDivider} />
          <Stat value={rating != null ? rating.toFixed(2) : '—'} label="RIDER ★" />
        </View>

        {/* Account / contact */}
        <Eyebrow style={styles.sectionLabel}>ACCOUNT</Eyebrow>
        <View style={styles.card}>
          <InfoRow label="Name" value={displayName || 'Add your details'} muted={!displayName} />
          <InfoRow label="Email" value={email || 'Not added'} muted={!email} divider />
          <InfoRow label="Phone" value={phone || 'Not added'} muted={!phone} divider />
        </View>

        {/* Verification — KYC row, navigable when onOpenKyc provided */}
        <Eyebrow style={styles.sectionLabel}>VERIFICATION</Eyebrow>
        <View style={styles.card}>
          <Press
            accessibilityLabel="Open KYC verification"
            onPress={() => onOpenKyc?.()}
            disabled={!onOpenKyc}
            style={styles.menuRow}
          >
            <View style={styles.iconBox}>
              <DocIcon />
            </View>
            <View style={styles.menuBody}>
              <Text style={styles.rowLabel}>Documents</Text>
              <Text style={styles.rowSub}>KYC · licence · Aadhaar</Text>
            </View>
            <View style={[styles.badge, kycVerified ? styles.badgeOk : styles.badgePending]}>
              <Text style={[styles.badgeText, { color: kycVerified ? C.green : C.amber }]}>
                {kycStatus.toUpperCase()}
              </Text>
            </View>
            {onOpenKyc ? <Chevron /> : null}
          </Press>
        </View>

        {/* ASHVA Club membership row */}
        {onOpenMembership ? (
          <>
            <Eyebrow style={styles.sectionLabel}>MEMBERSHIP</Eyebrow>
            <View style={styles.card}>
              <Press accessibilityLabel="ASHVA Club membership" onPress={onOpenMembership} style={styles.menuRow}>
                <View style={styles.iconBox}>
                  <StarIcon />
                </View>
                <View style={styles.menuBody}>
                  <Text style={styles.rowLabel}>ASHVA Club</Text>
                  <Text style={styles.rowSub}>Member pricing · priority bikes · concierge</Text>
                </View>
                <Text style={styles.clubCta}>{tier ? 'MANAGE' : 'JOIN'}</Text>
                <Chevron />
              </Press>
            </View>
          </>
        ) : null}

        {/* Preferences — RN Switch toggles, local state */}
        <Eyebrow style={styles.sectionLabel}>PREFERENCES</Eyebrow>
        <View style={styles.card}>
          <View style={styles.menuRow}>
            <View style={styles.iconBox}>
              <PrefsIcon />
            </View>
            <View style={styles.menuBody}>
              <Text style={styles.rowLabel}>Ride alerts & safety</Text>
              <Text style={styles.rowSub}>Push notifications for trips and SOS</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: C.line, true: C.ember }}
              thumbColor={C.ink}
              ios_backgroundColor={C.line}
            />
          </View>
          <View style={[styles.menuRow, styles.rowDivider]}>
            <View style={styles.iconBox}>
              <PrefsIcon />
            </View>
            <View style={styles.menuBody}>
              <Text style={styles.rowLabel}>Offline map packs</Text>
              <Text style={styles.rowSub}>Download routes for no-signal stretches</Text>
            </View>
            <Switch
              value={offlineMaps}
              onValueChange={setOfflineMaps}
              trackColor={{ false: C.line, true: C.ember }}
              thumbColor={C.ink}
              ios_backgroundColor={C.line}
            />
          </View>
        </View>

        {/* Sign out — bordered, destructive red */}
        <Press accessibilityLabel="Sign out" onPress={onSignOut} style={styles.signOut}>
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </Press>

        {/* Crest footer */}
        <View style={styles.footer}>
          <Crest size={rs(28)} color={C.faint} />
          <Text style={styles.footerText}>ASHVA · v1.0 · MADE IN INDIA</Text>
        </View>
        <View style={{ height: vs(28) }} />
      </ScrollView>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({
  label,
  value,
  muted,
  divider,
}: {
  label: string;
  value: string;
  muted?: boolean;
  divider?: boolean;
}) {
  return (
    <View style={[styles.infoRow, divider && styles.rowDivider]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.infoValue, muted && styles.infoValueMuted]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: rs(24), paddingTop: vs(16), paddingBottom: vs(24) },

  header: { flexDirection: 'row', alignItems: 'center', gap: rs(16), marginBottom: vs(22) },
  avatar: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(72) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: F.serif, fontSize: rs(32) },
  headerBody: { flex: 1, minWidth: 0 },
  name: { color: C.ink, fontFamily: F.serif, fontSize: rs(28), lineHeight: rs(29) },
  contact: { color: C.dim, fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(1), marginTop: vs(6) },
  tierBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: rs(6),
    marginTop: vs(6),
    paddingHorizontal: rs(11),
    paddingVertical: vs(5),
    backgroundColor: 'rgba(243,169,59,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(243,169,59,0.4)',
  },
  tierText: { color: C.amber, fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1.4) },

  stats: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surf,
    marginBottom: vs(24),
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: vs(18), paddingHorizontal: rs(6) },
  statDivider: { width: 1, backgroundColor: C.line },
  statValue: { color: C.sun, fontFamily: F.grotesk, fontWeight: '700', fontSize: rs(24) },
  statLabel: { color: C.faint, fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1), marginTop: vs(4) },

  sectionLabel: { marginBottom: vs(8) },
  card: {
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surf,
    paddingHorizontal: rs(16),
    marginBottom: vs(24),
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(14),
    gap: rs(12),
  },
  infoValue: { color: C.ink, fontFamily: F.grotesk, fontSize: rs(15), flexShrink: 1, textAlign: 'right' },
  infoValueMuted: { color: C.faint },

  rowDivider: { borderTopWidth: 1, borderTopColor: C.line2 },
  rowLabel: { color: C.ink, fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(15) },
  rowSub: { color: C.faint, fontFamily: F.mono, fontSize: rs(10), marginTop: vs(2) },

  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(15),
    paddingVertical: vs(16),
  },
  iconBox: {
    width: rs(40),
    height: rs(40),
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  menuBody: { flex: 1, minWidth: 0 },

  badge: { paddingHorizontal: rs(10), paddingVertical: vs(5), borderWidth: 1 },
  badgeOk: { borderColor: C.green, backgroundColor: 'rgba(46,160,67,0.12)' },
  badgePending: { borderColor: C.amber, backgroundColor: 'rgba(243,169,59,0.12)' },
  badgeText: { fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(0.8) },

  clubCta: { color: C.amber, fontFamily: F.mono, fontSize: rs(11), letterSpacing: rs(1.2) },

  signOut: {
    alignItems: 'center',
    paddingVertical: vs(16),
    borderWidth: 1,
    borderColor: C.line,
    marginTop: vs(4),
  },
  signOutText: { color: C.red, fontFamily: F.mono, fontSize: rs(11), letterSpacing: rs(2.4) },

  footer: {
    alignItems: 'center',
    gap: vs(10),
    marginTop: vs(24),
  },
  footerText: { color: C.faint, fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(3) },
});
