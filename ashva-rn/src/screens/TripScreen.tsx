/** Trip — live "ride HUD". Ported from www/js/screens/trip.js. Presentational:
 *  no nav, all sizing through rs()/vs()/ms(). A LinearGradient stands in for the
 *  map (expo-linear-gradient has no radial; the dominant teal/ember carries the
 *  look), with a faux route line laid over it. Speed / distance / ETA tick live
 *  via setInterval — the same telemetry feel the web prototype faked.
 *
 *  SAFETY FIX vs. the original: the web SOS fired on a single tap, trivially
 *  mis-tapped at speed. Here the first press arms an inline "Confirm SOS?" state;
 *  only the second press (within a short window) triggers, firing a Warning
 *  notification haptic so the rider feels it land. */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Press } from '../components/Press';
import { C, type, F, radius } from '../theme';
import { rs, vs, ms } from '../responsive';
import { Bike } from '../data';

const TEAL_GRAD = ['#10231f', '#1f6f74', '#17110D'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

export function TripScreen({ bike, onBack }: { bike?: Bike; onBack: () => void }) {
  const grad = bike?.grad ?? TEAL_GRAD;

  // Live telemetry, driven the same way the web prototype's tick() was.
  const t0 = React.useRef(Date.now()).current;
  const speedRef = React.useRef(0);
  const kmRef = React.useRef(0);
  const sumRef = React.useRef(0);
  const nRef = React.useRef(0);

  const [speed, setSpeed] = React.useState(0);
  const [km, setKm] = React.useState(0);
  const [avg, setAvg] = React.useState(0);
  const [eta, setEta] = React.useState('00:00');
  const [clock, setClock] = React.useState('00:00:00');

  React.useEffect(() => {
    const tick = () => {
      const target = 40 + Math.sin(Date.now() / 3200) * 38 + Math.random() * 30;
      let s = speedRef.current + (target - speedRef.current) * 0.18;
      s = Math.max(0, Math.min(118, s));
      speedRef.current = s;

      kmRef.current += s / 3600;
      nRef.current += 1;
      sumRef.current += s;

      const remainingKm = Math.max(0, 84 - kmRef.current); // mock leg length
      const etaMin = s > 1 ? Math.round((remainingKm / s) * 60) : 0;

      setSpeed(Math.round(s));
      setKm(kmRef.current);
      setAvg(Math.round(sumRef.current / nRef.current));
      setEta(`${pad(Math.floor(etaMin / 60))}:${pad(etaMin % 60)}`);

      const elapsed = Math.floor((Date.now() - t0) / 1000);
      setClock(`${pad(Math.floor(elapsed / 3600))}:${pad(Math.floor(elapsed / 60) % 60)}:${pad(elapsed % 60)}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [t0]);

  const speedColor = speed > 95 ? C.red : speed > 70 ? C.sun : C.ember;
  const speedPct = Math.min(100, (speed / 118) * 100);

  // SOS confirm state: idle -> armed -> sent.
  const [sosState, setSosState] = React.useState<'idle' | 'armed' | 'sent'>('idle');
  const armTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => () => {
    if (armTimer.current) clearTimeout(armTimer.current);
  }, []);

  const onSos = () => {
    if (sosState === 'idle') {
      setSosState('armed');
      if (armTimer.current) clearTimeout(armTimer.current);
      armTimer.current = setTimeout(() => setSosState('idle'), 4000); // auto-disarm
      return;
    }
    if (sosState === 'armed') {
      if (armTimer.current) clearTimeout(armTimer.current);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
      setSosState('sent');
    }
  };

  return (
    <Screen edges={{ top: true, bottom: false }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header: live indicator + back, with running clock */}
        <View style={styles.head}>
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE RIDE</Text>
          </View>
          <Text style={styles.clock}>{clock}</Text>
          <Press accessibilityLabel="End trip view" onPress={onBack} style={styles.closeBtn}>
            <Text style={styles.closeX}>✕</Text>
          </Press>
        </View>

        <Text style={styles.bikeName}>
          {bike ? `${bike.maker} · ${bike.name}` : 'ASHVA · LIVE FLEET'}
        </Text>

        {/* Map area — gradient placeholder with a faux route line feel */}
        <View style={styles.map}>
          <LinearGradient colors={grad as any} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={['rgba(23,17,13,0.55)', 'transparent', 'rgba(23,17,13,0.7)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          {/* faux route line — a diagonal ember thread with waypoints */}
          <View style={styles.route} />
          <View style={[styles.way, styles.wayStart]} />
          <View style={[styles.way, styles.wayEnd]}>
            <View style={styles.wayPulse} />
          </View>
          <View style={styles.mapTag}>
            <Text style={styles.mapTagText}>NH-3 · MANALI CORRIDOR</Text>
          </View>
        </View>

        {/* Primary readout: SPEED */}
        <View style={styles.speedBlock}>
          <Text style={[styles.speedVal, { color: speedColor }]}>{speed}</Text>
          <Text style={styles.speedUnit}>KM / H</Text>
          <View style={styles.speedTrack}>
            <View style={[styles.speedFill, { width: `${speedPct}%`, backgroundColor: speedColor }]} />
          </View>
        </View>

        {/* Secondary readouts: DISTANCE · AVG · ETA */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statVal}>{km.toFixed(1)}</Text>
            <Text style={styles.statLabel}>DISTANCE · KM</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{avg}</Text>
            <Text style={styles.statLabel}>AVG KM/H</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.stat}>
            <Text style={styles.statVal}>{eta}</Text>
            <Text style={styles.statLabel}>ETA · H:M</Text>
          </View>
        </View>

        {/* Safety controls */}
        <View style={styles.controls}>
          <Press
            accessibilityLabel={
              sosState === 'idle'
                ? 'SOS emergency'
                : sosState === 'armed'
                ? 'Confirm SOS emergency'
                : 'SOS sent'
            }
            haptic={false}
            onPress={onSos}
            style={[
              styles.ctrl,
              styles.sos,
              ...(sosState === 'armed' ? [styles.sosArmed] : []),
              ...(sosState === 'sent' ? [styles.sosSent] : []),
            ]}
          >
            <Text style={[styles.ctrlText, styles.sosText, sosState === 'sent' && styles.sosSentText]}>
              {sosState === 'idle' ? 'SOS' : sosState === 'armed' ? 'CONFIRM SOS?' : 'SOS SENT ✓'}
            </Text>
          </Press>

          <Press accessibilityLabel="Flag a road hazard" onPress={() => {}} style={[styles.ctrl, styles.hazard]}>
            <Text style={[styles.ctrlText, styles.hazardText]}>⚠ HAZARD</Text>
          </Press>
        </View>

        {sosState === 'armed' && (
          <Text style={styles.sosHint}>Press again within 4s to alert emergency contacts.</Text>
        )}

        <View style={{ height: vs(28) }} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: rs(20), paddingTop: vs(6) },

  head: { flexDirection: 'row', alignItems: 'center', marginBottom: vs(4) },
  liveRow: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: rs(9), height: rs(9), borderRadius: rs(9) / 2, backgroundColor: C.red, marginRight: rs(9) },
  liveText: { color: C.ink, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(3) },
  clock: { flex: 1, color: C.dim, fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(1.5), marginLeft: rs(14) },
  closeBtn: {
    width: rs(40),
    height: rs(40),
    minHeight: rs(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surf,
  },
  closeX: { color: C.ink, fontSize: ms(16) },

  bikeName: { color: C.faint, fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(2), marginTop: vs(6), marginBottom: vs(14) },

  map: {
    height: vs(190),
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  route: {
    position: 'absolute',
    left: '12%',
    right: '12%',
    top: '50%',
    height: rs(3),
    backgroundColor: C.ember,
    borderRadius: rs(3),
    transform: [{ rotate: '-14deg' }],
    opacity: 0.9,
  },
  way: {
    position: 'absolute',
    width: rs(12),
    height: rs(12),
    borderRadius: rs(12) / 2,
    borderWidth: rs(2),
    borderColor: C.ink,
  },
  wayStart: { left: '11%', top: '64%', backgroundColor: C.surf },
  wayEnd: { right: '11%', top: '30%', backgroundColor: C.ember, alignItems: 'center', justifyContent: 'center' },
  wayPulse: { width: rs(4), height: rs(4), borderRadius: rs(2), backgroundColor: C.ink },
  mapTag: {
    position: 'absolute',
    left: rs(14),
    bottom: rs(14),
    paddingVertical: vs(5),
    paddingHorizontal: rs(10),
    backgroundColor: 'rgba(23,17,13,0.7)',
    borderWidth: 1,
    borderColor: C.line,
  },
  mapTagText: { color: C.dim, fontFamily: F.mono, fontSize: rs(8.5), letterSpacing: rs(1.5) },

  speedBlock: { alignItems: 'center', marginTop: vs(22) },
  speedVal: { fontFamily: F.grotesk, fontWeight: '700', fontSize: rs(78), lineHeight: rs(82) },
  speedUnit: { color: C.faint, fontFamily: F.mono, fontSize: type.caption, letterSpacing: rs(4), marginTop: vs(-2) },
  speedTrack: {
    width: '70%',
    height: vs(6),
    marginTop: vs(16),
    backgroundColor: C.line,
    borderRadius: vs(6) / 2,
    overflow: 'hidden',
  },
  speedFill: { height: '100%', borderRadius: vs(6) / 2 },

  stats: {
    flexDirection: 'row',
    marginTop: vs(26),
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surf,
  },
  stat: { flex: 1, alignItems: 'center', paddingVertical: vs(16), paddingHorizontal: rs(6) },
  statDiv: { width: 1, backgroundColor: C.line },
  statVal: { color: C.ink, fontFamily: F.grotesk, fontWeight: '700', fontSize: ms(22) },
  statLabel: { color: C.faint, fontFamily: F.mono, fontSize: rs(8.5), letterSpacing: rs(1.2), marginTop: vs(4) },

  controls: { flexDirection: 'row', marginTop: vs(22) },
  ctrl: {
    flex: 1,
    paddingVertical: vs(16),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlText: { fontFamily: F.mono, fontSize: type.label, letterSpacing: rs(2) },

  sos: { borderColor: C.red, marginRight: rs(11) },
  sosText: { color: C.red },
  sosArmed: { backgroundColor: 'rgba(239,68,68,0.14)' },
  sosSent: { backgroundColor: C.red, borderColor: C.red },
  sosSentText: { color: C.ink },

  hazard: { borderColor: C.amber },
  hazardText: { color: C.amber },

  sosHint: { color: C.faint, fontFamily: F.mono, fontSize: rs(9.5), letterSpacing: rs(0.6), textAlign: 'center', marginTop: vs(10) },
});
