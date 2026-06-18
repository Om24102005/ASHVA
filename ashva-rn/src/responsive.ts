/**
 * Device-agnostic sizing. Every dimension in the app is expressed against a
 * guideline phone (390×844, iPhone 13) and scaled to whatever screen the app
 * actually runs on — small Android phones, big Pro Max, tablets, foldables.
 *
 * - rs()  scale by width   (widths, paddings, font sizes)
 * - vs()  scale by height  (vertical rhythm, sheet heights)
 * - ms()  moderate scale   (fonts that shouldn't balloon on tablets)
 * Use the useResponsive() hook for values that must react to rotation / resize.
 */
import { Dimensions, PixelRatio, ScaledSize } from 'react-native';

const GUIDE_W = 390;
const GUIDE_H = 844;

function compute(win: ScaledSize) {
  // Treat the short edge as "width" so landscape/tablet don't distort scale.
  const shortEdge = Math.min(win.width, win.height);
  const longEdge = Math.max(win.width, win.height);
  const wFactor = shortEdge / GUIDE_W;
  const hFactor = longEdge / GUIDE_H;
  return { wFactor, hFactor, win };
}

let { wFactor, hFactor } = compute(Dimensions.get('window'));

// Keep module-level scale current if the device metrics change (rare, but cheap).
Dimensions.addEventListener('change', ({ window }) => {
  const c = compute(window);
  wFactor = c.wFactor;
  hFactor = c.hFactor;
});

/** Scale a guideline size by screen width and snap to the pixel grid. */
export const rs = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel(size * wFactor));

/** Scale a guideline size by screen height. */
export const vs = (size: number): number =>
  Math.round(PixelRatio.roundToNearestPixel(size * hFactor));

/** Moderate scale: blends true scale with the original by `factor` (default .5)
 *  so typography grows gently and never explodes on large displays. */
export const ms = (size: number, factor = 0.5): number =>
  Math.round(PixelRatio.roundToNearestPixel(size + (size * wFactor - size) * factor));

export const screen = () => Dimensions.get('window');
