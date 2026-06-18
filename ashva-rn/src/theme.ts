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

/** System fonts for now; custom faces (Instrument Serif / Space Grotesk /
 *  JetBrains Mono) get loaded via expo-font in a later pass. */
export const F = {
  serif: 'serif',
  grotesk: 'System',
  mono: 'monospace',
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

export const radius = { sm: 10, md: 16, lg: 22, pill: 999 };
