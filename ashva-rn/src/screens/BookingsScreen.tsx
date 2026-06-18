/** Bookings — your rides, split into Active and Past sections. Loads real
 *  bookings from the API (no fake history); shows loading / error / empty
 *  states. Active rows are tappable to open the trip. */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { C, type, F, radius } from '../theme';
import { rs, vs } from '../responsive';
import { API } from '../api';

type Booking = {
  reference?: string;
  asset?: { name?: string } | null;
  status?: string;
  startTs?: number | string | null;
  endTs?: number | string | null;
  days?: number | null;
  totalAmount?: number | null;
  [k: string]: any;
};

const ACTIVE_STATES = ['pending', 'confirmed', 'upcoming', 'active', 'ongoing'];

function isActive(b: Booking): boolean {
  const s = (b.status || '').toLowerCase();
  return ACTIVE_STATES.includes(s);
}

function fmtDate(ts?: number | string | null): string {
  if (ts === null || ts === undefined || ts === '') return '—';
  const n = typeof ts === 'string' ? Number(ts) : ts;
  const ms = typeof n === 'number' && !Number.isNaN(n) ? (n < 1e12 ? n * 1000 : n) : NaN;
  const d = Number.isNaN(ms) ? new Date(ts as any) : new Date(ms);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtRange(b: Booking): string {
  const a = fmtDate(b.startTs);
  const z = fmtDate(b.endTs);
  if (a === '—' && z === '—') return '—';
  if (z === '—') return a;
  if (a === '—') return z;
  return `${a} → ${z}`;
}

function fmtMoney(v?: number | null): string {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
  return `₹${Number(v).toLocaleString('en-IN')}`;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.info}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function BookingRow({ booking, onPress }: { booking: Booking; onPress?: () => void }) {
  const name = booking.asset?.name || 'Ride';
  const status = (booking.status || '').toUpperCase() || '—';
  const ref = booking.reference || '—';

  const body = (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <View style={styles.cardHeadText}>
          <Text style={styles.cardName} numberOfLines={1}>{name}</Text>
          <Text style={styles.cardRef}>{ref}</Text>
        </View>
        <Text style={styles.status}>{status}</Text>
      </View>
      <View style={styles.cardMeta}>
        <Info label="DATES" value={fmtRange(booking)} />
        <Info label="DAYS" value={booking.days != null ? String(booking.days) : '—'} />
        <Info label="TOTAL" value={fmtMoney(booking.totalAmount)} />
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Press accessibilityLabel={`Open booking ${ref}`} onPress={onPress} style={styles.rowPress}>
        {body}
      </Press>
    );
  }
  return <View style={styles.rowStatic}>{body}</View>;
}

export function BookingsScreen({ onOpenTrip }: { onOpenTrip: (booking: any) => void }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await API.bookings();
    if (res.ok) {
      const list = (res.data && res.data.bookings) || [];
      setBookings(Array.isArray(list) ? list : []);
    } else {
      setError(res.error.message || 'Could not load your bookings.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = bookings.filter(isActive);
  const past = bookings.filter((b) => !isActive(b));

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <Text style={styles.kicker}>// YOUR RIDES</Text>
          <Text style={styles.title}>Bookings</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={C.ember} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <Press accessibilityLabel="Retry loading bookings" onPress={load} style={styles.retry}>
              <Text style={styles.retryText}>RETRY</Text>
            </Press>
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No rides yet</Text>
            <Text style={styles.emptyBody}>
              The high passes are waiting. Pick a machine and point it at the horizon.
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.section}>ACTIVE</Text>
            {active.length === 0 ? (
              <Text style={styles.sectionEmpty}>No active rides.</Text>
            ) : (
              active.map((b, i) => (
                <BookingRow
                  key={b.reference || `active-${i}`}
                  booking={b}
                  onPress={() => onOpenTrip(b)}
                />
              ))
            )}

            <Text style={[styles.section, styles.sectionGap]}>PAST</Text>
            {past.length === 0 ? (
              <Text style={styles.sectionEmpty}>No past rides yet.</Text>
            ) : (
              past.map((b, i) => (
                <BookingRow key={b.reference || `past-${i}`} booking={b} />
              ))
            )}
          </>
        )}

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

  center: { paddingVertical: vs(80), alignItems: 'center', justifyContent: 'center' },
  errorText: { color: C.dim, fontSize: type.body, fontFamily: F.grotesk, textAlign: 'center', marginBottom: vs(18), lineHeight: rs(22) },
  retry: { paddingVertical: vs(12), paddingHorizontal: rs(28), backgroundColor: C.ember, borderRadius: radius.sm },
  retryText: { color: '#fff', fontSize: type.caption, fontFamily: F.mono, letterSpacing: rs(2) },

  empty: { paddingVertical: vs(60), paddingHorizontal: rs(24), alignItems: 'center', borderWidth: 1, borderColor: C.line, borderStyle: 'dashed', borderRadius: radius.md },
  emptyTitle: { color: C.ink, fontFamily: F.serif, fontSize: rs(26), marginBottom: vs(8), textAlign: 'center' },
  emptyBody: { color: C.faint, fontSize: type.label, fontFamily: F.grotesk, lineHeight: rs(22), textAlign: 'center' },

  section: { color: C.faint, fontSize: type.caption, fontFamily: F.mono, letterSpacing: rs(2), marginBottom: vs(12) },
  sectionGap: { marginTop: vs(28) },
  sectionEmpty: { color: C.dim, fontSize: type.label, fontFamily: F.grotesk, marginBottom: vs(8) },

  rowPress: { marginBottom: vs(11) },
  rowStatic: { marginBottom: vs(11) },
  card: { backgroundColor: C.surf, borderWidth: 1, borderColor: C.line, borderRadius: radius.md, overflow: 'hidden' },
  cardHead: { flexDirection: 'row', alignItems: 'center', padding: rs(14), borderBottomWidth: 1, borderBottomColor: C.line },
  cardHeadText: { flex: 1, minWidth: 0 },
  cardName: { color: C.ink, fontFamily: F.serif, fontSize: rs(19), lineHeight: rs(22) },
  cardRef: { color: C.faint, fontSize: type.caption, fontFamily: F.mono, marginTop: vs(3), letterSpacing: rs(1) },
  status: { color: C.amber, fontSize: type.caption, fontFamily: F.mono, letterSpacing: rs(1), marginLeft: rs(10) },

  cardMeta: { flexDirection: 'row', padding: rs(14), gap: rs(10) },
  info: { flex: 1 },
  infoLabel: { color: C.faint, fontSize: rs(9), fontFamily: F.mono, letterSpacing: rs(1) },
  infoValue: { color: C.ink, fontFamily: F.grotesk, fontWeight: '600', fontSize: type.label, marginTop: vs(3) },
});
