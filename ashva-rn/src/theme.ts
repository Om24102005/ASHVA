/** ASHVA design tokens — ported from the original web prototype's palette. */
import { ms } from './responsive';

export const C = {
  base: '#17110D',
  surf: '#1F1813',
  well: '#1a130d',
  ink: '#F4EBDD',
  dim: '#B7A793',
  // NOTE: original faint (#7C6C5C) fails WCAG contrast on base; lifted to ~4.5:1.
  faint: '#9A8979',
  ember: '#E2542A',
  sun: '#F2873E',
  amber: '#F3A93B',
  green: '#2ea043',
  red: '#ef4444',
  line: 'rgba(244,235,221,0.10)',
  line2: 'rgba(244,235,221,0.06)',
};

/** Brand faces, loaded via @expo-google-fonts in App.tsx (useFonts). Family
 *  names must match the loaded keys. Falls back to system until loaded. */
export const F = {
  serif: 'InstrumentSerif_400Regular',
  grotesk: 'SpaceGrotesk_500Medium',
  mono: 'JetBrainsMono_400Regular',
};

/** Fluid type scale — moderate-scaled so it adapts to device without ballooning. */
export const type = {
  h1: ms(34),
  h2: ms(26),
  h3: ms(20),
  body: ms(15),
  label: ms(13),
  caption: ms(11),
};

/** The original ASHVA design is SHARP — square corners, thin borders, editorial.
 *  Everything is rectangular except true circles (dots, avatars → use `pill`). */
export const radius = { sm: 0, md: 0, lg: 0, pill: 999 };

/** Letter-spacing in points for the wide mono labels/eyebrows/buttons.
 *  (Original CSS used .1em–.36em; these are the point equivalents at our sizes.) */
export const tracking = { tight: 0.5, label: 1.5, eyebrow: 2.4, wide: 3.4 };
