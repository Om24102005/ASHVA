/** Garage / Profile — the rider's account hub. Ported from www/js/screens/garage.js
 *  but wired to REAL session.user values (no fabricated stats); empty data shows
 *  honest zeros / "Add your details" rather than mock names. Presentational. */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { C, type, F, radius } from '../theme';
import { rs, vs, ms } from '../responsive';

export function GarageScreen({ session, onSignOut }: { session: any; onSignOut: () => void }) {
  const user = session?.user ?? {};
  const displayName: string = (user.displayName || '').trim();
  const email: string = user.contact?.email || '';
  const phone: string = user.contact?.phone || '';
  const initial = (displayName || email || '?').charAt(0).toUpperCase();

  // Real, truthful stats — fall back to honest zeros when there's no data.
  const rides = Number(user.stats?.rides ?? 0) || 0;
  const states = Number(user.stats?.states ?? 0) || 0;
  const rating = user.stats?.rating != null ? Number(user.stats.rating) : null;

  const kycStatus: string = user.kyc?.status || 'Not started';
  const kycVerified = /verified|approved|complete/i.test(kycStatus);

  const [notifications, setNotifications] = useState<boolean>(user.prefs?.notifications ?? true);
  const [offlineMaps, setOfflineMaps] = useState<boolean>(user.prefs?.offlineMaps ?? false);

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.headerBody}>
            <Text style={styles.name} numberOfLines={1}>
              {displayName || 'Add your details'}
            </Text>
            <Text style={styles.contact} numberOfLines={1}>
              {email || phone || 'No contact on file'}
            </Text>
          </View>
        </View>

        {/* Stats — real values, zeros when empty */}
        <View style={styles.stats}>
          <Stat value={String(rides)} label="RIDES" />
          <View style={styles.statDivider} />
          <Stat value={String(states)} label="STATES" />
          <View style={styles.statDivider} />
          <Stat value={rating != null ? rating.toFixed(2) : '—'} label="RIDER ★" />
        </View>

        {/* Account / contact */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <InfoRow label="Name" value={displayName || 'Add your details'} muted={!displayName} />
          <InfoRow label="Email" value={email || 'Not added'} muted={!email} divider />
          <InfoRow label="Phone" value={phone || 'Not added'} muted={!phone} divider />
        </View>

        {/* KYC status */}
        <Text style={styles.sectionLabel}>VERIFICATION</Text>
        <View style={styles.card}>
          <View style={styles.kycRow}>
            <View style={styles.kycBody}>
              <Text style={styles.rowLabel}>KYC status</Text>
              <Text style={styles.rowSub}>Documents · licence · Aadhaar</Text>
            </View>
            <View style={[styles.badge, kycVerified ? styles.badgeOk : styles.badgePending]}>
              <Text style={[styles.badgeText, { color: kycVerified ? C.green : C.amber }]}>
                {kycStatus}
              </Text>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.card}>
          <ToggleRow
            label="Ride alerts & safety"
            sub="Push notifications for trips and SOS"
            value={notifications}
            onValueChange={setNotifications}
          />
          <ToggleRow
            label="Offline map packs"
            sub="Download routes for no-signal stretches"
            value={offlineMaps}
            onValueChange={setOfflineMaps}
            divider
          />
        </View>

        {/* Sign out — subtle / destructive */}
        <Press accessibilityLabel="Sign out" onPress={onSignOut} style={styles.signOut}>
          <Text style={styles.signOutText}>SIGN OUT</Text>
        </Press>

        <Text style={styles.footer}>ASHVA · v1.0 · MADE IN INDIA</Text>
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

function ToggleRow({
  label,
  sub,
  value,
  onValueChange,
  divider,
}: {
  label: string;
  sub: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  divider?: boolean;
}) {
  return (
    <View style={[styles.toggleRow, divider && styles.rowDivider]}>
      <View style={styles.toggleBody}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowSub}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: C.line, true: C.ember }}
        thumbColor={C.ink}
        ios_backgroundColor={C.line}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: rs(20), paddingTop: vs(8), paddingBottom: vs(24) },

  header: { flexDirection: 'row', alignItems: 'center', gap: rs(16), marginBottom: vs(22) },
  avatar: {
    width: rs(72),
    height: rs(72),
    borderRadius: rs(72) / 2,
    backgroundColor: C.ember,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: F.serif, fontSize: rs(32) },
  headerBody: { flex: 1 },
  name: { color: C.ink, fontFamily: F.serif, fontSize: rs(28) },
  contact: { color: C.dim, fontSize: type.label, fontFamily: F.mono, marginTop: vs(6) },

  stats: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surf,
    borderRadius: radius.md,
    marginBottom: vs(24),
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: vs(18), paddingHorizontal: rs(6) },
  statDivider: { width: 1, backgroundColor: C.line },
  statValue: { color: C.sun, fontFamily: F.grotesk, fontWeight: '700', fontSize: ms(24) },
  statLabel: {
    color: C.faint,
    fontFamily: F.mono,
    fontSize: type.caption,
    letterSpacing: rs(1),
    marginTop: vs(4),
  },

  sectionLabel: {
    color: C.faint,
    fontFamily: F.mono,
    fontSize: type.caption,
    letterSpacing: rs(2),
    marginBottom: vs(8),
  },
  card: {
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surf,
    borderRadius: radius.md,
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
  infoValue: { color: C.ink, fontSize: type.body, flexShrink: 1, textAlign: 'right' },
  infoValueMuted: { color: C.faint },

  rowDivider: { borderTopWidth: 1, borderTopColor: C.line2 },
  rowLabel: { color: C.ink, fontFamily: F.grotesk, fontWeight: '600', fontSize: type.body },
  rowSub: { color: C.faint, fontFamily: F.mono, fontSize: type.caption, marginTop: vs(2) },

  kycRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(14),
    gap: rs(12),
  },
  kycBody: { flex: 1 },
  badge: { paddingHorizontal: rs(10), paddingVertical: vs(5), borderRadius: radius.sm, borderWidth: 1 },
  badgeOk: { borderColor: C.green, backgroundColor: 'rgba(46,160,67,0.12)' },
  badgePending: { borderColor: C.amber, backgroundColor: 'rgba(243,169,59,0.12)' },
  badgeText: { fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(0.5) },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: vs(12),
    gap: rs(12),
  },
  toggleBody: { flex: 1 },

  signOut: {
    alignItems: 'center',
    paddingVertical: vs(16),
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: radius.md,
    marginTop: vs(4),
  },
  signOutText: { color: C.red, fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(2) },

  footer: {
    color: C.faint,
    fontFamily: F.mono,
    fontSize: type.caption,
    letterSpacing: rs(3),
    textAlign: 'center',
    marginTop: vs(24),
  },
});
