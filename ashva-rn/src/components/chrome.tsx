/** Shared ASHVA chrome — faithful RN port of www/js/helpers.js chrome blocks.
 *  Sharp corners, 1px borders, mono uppercase labels. Used across all screens. */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Press } from './Press';
import { C, F } from '../theme';
import { rs, vs } from '../responsive';

/** The ASHVA crest — concentric rings + spokes (from helpers.js crest()). */
export function Crest({ size = 24, color = C.ember }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none" stroke={color} strokeWidth={1.4}>
      <Circle cx={20} cy={20} r={18.5} />
      <Circle cx={20} cy={20} r={12} />
      <Circle cx={20} cy={20} r={2.4} fill={color} stroke="none" />
      <Path d="M20 2v36M4.3 11l31.4 18M35.7 11L4.3 29" />
    </Svg>
  );
}

/** Mono uppercase eyebrow label (helpers.js eyebrow()). */
export function Eyebrow({ children, color = C.faint, style }: { children: React.ReactNode; color?: string; style?: TextStyle }) {
  return <Text style={[styles.eyebrow, { color }, style]}>{children}</Text>;
}

/** Sticky-style top bar: 42×42 bordered back button · mono title · right slot. */
export function Topbar({ title, onBack, right }: { title?: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <View style={styles.topbar}>
      {onBack ? (
        <Press accessibilityLabel="Go back" onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={rs(22)} color={C.ink} />
        </Press>
      ) : (
        <View style={styles.backBtn} />
      )}
      <Text style={styles.topTitle}>{(title || '').toUpperCase()}</Text>
      <View style={styles.rightSlot}>{right}</View>
    </View>
  );
}

/** Primary CTA — sharp, ember, mono uppercase, wide tracking (helpers.js bottomBtn body). */
export function CTA({ label, onPress, locked, style }: { label: string; onPress: () => void; locked?: boolean; style?: ViewStyle }) {
  return (
    <Press accessibilityLabel={label} onPress={() => { if (!locked) onPress(); }} style={style}>
      <View style={[styles.cta, locked && styles.ctaLocked]}>
        <Text style={[styles.ctaTxt, locked && styles.ctaTxtLocked]}>{label.toUpperCase()}</Text>
      </View>
    </Press>
  );
}

/** Fixed bottom CTA bar with the transparent→base fade (helpers.js bottomBtn). */
export function BottomBar({ label, onPress, locked }: { label: string; onPress: () => void; locked?: boolean }) {
  return (
    <View style={styles.bottomWrap} pointerEvents="box-none">
      <LinearGradient colors={['transparent', C.base]} style={StyleSheet.absoluteFill} />
      <CTA label={label} onPress={onPress} locked={locked} />
    </View>
  );
}

/** Funnel progress bars + labels (helpers.js progress()). step 0..3 */
export function Progress({ step }: { step: number }) {
  const labels = ['CONFIGURE', 'GEAR', 'VERIFY', 'PAY'];
  return (
    <View style={styles.progWrap}>
      <View style={styles.progBars}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={[styles.progBar, { backgroundColor: i <= step ? C.ember : 'rgba(244,235,221,0.12)' }]} />
        ))}
      </View>
      <View style={styles.progLabels}>
        {labels.map((l, i) => (
          <Text key={l} style={[styles.progLabel, { color: i === step ? C.sun : i < step ? C.dim : C.faint }]}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { fontFamily: F.mono, fontSize: rs(10), letterSpacing: rs(2.4), textTransform: 'uppercase' },

  topbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: rs(18), paddingBottom: vs(10) },
  backBtn: { width: rs(42), height: rs(42), borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(244,235,221,0.04)' },
  topTitle: { fontFamily: F.mono, fontSize: rs(11), letterSpacing: rs(2.2), color: C.dim, textTransform: 'uppercase' },
  rightSlot: { width: rs(42), height: rs(42), alignItems: 'center', justifyContent: 'center' },

  cta: { paddingVertical: vs(17), alignItems: 'center', backgroundColor: C.ember },
  ctaLocked: { backgroundColor: 'rgba(226,84,42,0.25)' },
  ctaTxt: { color: '#fff', fontFamily: F.mono, fontSize: rs(12), letterSpacing: rs(2) },
  ctaTxtLocked: { color: 'rgba(255,255,255,0.4)' },

  bottomWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: rs(24), paddingTop: vs(20), paddingBottom: vs(30) },

  progWrap: { paddingHorizontal: rs(24), paddingBottom: vs(6) },
  progBars: { flexDirection: 'row', gap: rs(6), marginBottom: vs(8) },
  progBar: { flex: 1, height: 3 },
  progLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  progLabel: { fontFamily: F.mono, fontSize: rs(9), letterSpacing: rs(1) },
});
