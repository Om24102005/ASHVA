/** Bookings — faithful RN port of www/js/screens/bookings.js (sharp, editorial).
 *  Header eyebrow + serif title, then ACTIVE / PAST sections. Loads REAL
 *  bookings from API.bookings() — no fabricated history. Handles loading
 *  (ActivityIndicator), error (message + Retry), and a genuine empty state for
 *  new users ("No rides yet"). Active rows are tappable → onOpenTrip(booking). */
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { Eyebrow } from '../components/chrome';
import { C, F } from '../theme';
import { rs, vs } from '../responsive';
import { API } from '../api';

type Booking = {
  reference?: string;
  asset?: { name?: string } | null;
  status?: string;
  startTs?: number | string | null;
  endTs?: number | string | null;
  totalAmount?: number | null;
  [k: string]: any;
};

const ACTIVE_STATES = ['pending', 'confirmed', 'upcoming', 'active', 'ongoing'];

function isActive(b: Booking): boolean {
  return ACTIVE_STATES.includes((b.status || '').toLowerCase());
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
  return '₹' + Number(v).toLocaleString('en-IN');
}

/** Sharp booking row: reference + asset name (serif), status, dates, total. */
function BookingRow({ booking, onPress }: { booking: Booking; onPress?: () => void }) {
  const name = booking.asset?.name || 'Ride';
  const ref = booking.reference || '—';
  const status = (booking.status || '').toUpperCase() || '—';
  const active = isActive(booking);

  const body = (
    <View style={styles.row}>
      <View style={styles.rowHead}>
        <View style={styles.rowHeadText}>
          <Text style={styles.rowRef}>{ref}</Text>
          <Text style={styles.rowName} numberOfLines={1}>{name}</Text>
        </View>
        <Text style={[styles.status, { color: active ? C.amber : C.green }]}>{status}</Text>
      </View>
      <View style={styles.rowMeta}>
        <Text style={styles.metaDates}>{fmtRange(booking)}</Text>
        <Text style={styles.metaTotal}>{fmtMoney(booking.totalAmount)}</Text>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Press accessibilityLabel={`Open booking ${ref}`} onPress={onPress} style={styles.rowWrap}>
        {body}
      </Press>
    );
  }
  return <View style={styles.rowWrap}>{body}</View>;
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
      const list = res.data && res.data.bookings;
      setBookings(Array.isArray(list) ? list : []);
    } else {
      setError((res.error && res.error.message) || 'Could not load your bookings.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const active = bookings.filter(isActive);
  const past = bookings.filter((b) => !isActive(b));

  return (
    <Screen edges={{ top: false, bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* header */}
        <View style={styles.head}>
          <Eyebrow color={C.faint}>{'// YOUR RIDES'}</Eyebrow>
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
              <Text style={styles.retryTxt}>RETRY</Text>
            </Press>
          </View>
        ) : bookings.length === 0 ? (
          /* genuine empty state — new user, no fabricated history */
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No rides yet</Text>
            <Text style={styles.emptyBody}>
              The high passes are waiting. Pick a machine and point it at the horizon.
            </Text>
          </View>
        ) : (
          <View style={styles.body}>
            {/* ACTIVE */}
            <Eyebrow color={C.faint} style={styles.section}>ACTIVE</Eyebrow>
            {active.length === 0 ? (
              <View style={styles.sectionEmpty}>
                <Text style={styles.sectionEmptyTxt}>No active rides booked yet.</Text>
              </View>
            ) : (
              active.map((b, i) => (
                <BookingRow key={b.reference || `active-${i}`} booking={b} onPress={() => onOpenTrip(b)} />
              ))
            )}

            {/* PAST */}
            <Eyebrow color={C.faint} style={styles.sectionPast}>PAST</Eyebrow>
            {past.length === 0 ? (
              <View style={styles.sectionEmpty}>
                <Text style={styles.sectionEmptyTxt}>No past rides yet.</Text>
              </View>
            ) : (
              past.map((b, i) => (
                <BookingRow key={b.reference || `past-${i}`} booking={b} />
              ))
            )}
          </View>
        )}

        <View style={{ height: vs(28) }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: vs(64) },

  // header — padding:0 24px 16px; serif 38px
  head: { paddingHorizontal: rs(24), paddingBottom: vs(16) },
  title: { fontFamily: F.serif, fontSize: rs(38), lineHeight: rs(39), color: C.ink, marginTop: vs(4) },

  body: { paddingHorizontal: rs(24) },

  // section eyebrows
  section: { marginBottom: vs(14) },
  sectionPast: { marginBottom: vs(14), marginTop: vs(28) },

  // states
  center: { paddingVertical: vs(80), paddingHorizontal: rs(24), alignItems: 'center', justifyContent: 'center' },
  errorText: { color: C.dim, fontFamily: F.grotesk, fontSize: rs(13), textAlign: 'center', lineHeight: rs(21), marginBottom: vs(18) },
  retry: { paddingVertical: vs(14), paddingHorizontal: rs(28), backgroundColor: C.ember },
  retryTxt: { color: '#fff', fontFamily: F.mono, fontSize: rs(11), letterSpacing: rs(2.4) },

  // empty — dashed 1px box (source No-rides treatment, square corners)
  empty: { marginHorizontal: rs(24), paddingVertical: vs(60), paddingHorizontal: rs(30), alignItems: 'center', borderWidth: 1, borderColor: C.line, borderStyle: 'dashed' },
  emptyTitle: { fontFamily: F.serif, fontSize: rs(26), color: C.ink, marginBottom: vs(8), textAlign: 'center' },
  emptyBody: { fontFamily: F.grotesk, fontSize: rs(13), color: C.faint, lineHeight: rs(21), textAlign: 'center' },

  sectionEmpty: { paddingVertical: vs(22), paddingHorizontal: rs(16), borderWidth: 1, borderColor: C.line, borderStyle: 'dashed', marginBottom: vs(11) },
  sectionEmptyTxt: { fontFamily: F.grotesk, fontSize: rs(13), color: C.faint, textAlign: 'center' },

  // booking row — sharp, 1px C.line border, surf bg, margin-bottom:11px
  rowWrap: { marginBottom: vs(11) },
  row: { backgroundColor: C.surf, borderWidth: 1, borderColor: C.line },
  rowHead: { flexDirection: 'row', alignItems: 'center', padding: rs(14), borderBottomWidth: 1, borderBottomColor: C.line },
  rowHeadText: { flex: 1, minWidth: 0 },
  rowRef: { fontFamily: F.mono, fontSize: rs(9.5), letterSpacing: rs(1), color: C.faint },
  rowName: { fontFamily: F.serif, fontSize: rs(19), lineHeight: rs(21), color: C.ink, marginTop: vs(3) },
  status: { fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1), marginLeft: rs(10) },

  rowMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: vs(12), paddingHorizontal: rs(14) },
  metaDates: { fontFamily: F.mono, fontSize: rs(10.5), letterSpacing: rs(0.6), color: C.dim, flex: 1 },
  metaTotal: { fontFamily: F.grotesk, fontWeight: '600', fontSize: rs(13), color: C.ink, marginLeft: rs(10) },
});
