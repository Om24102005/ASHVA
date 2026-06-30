"use strict";
/* ============================================================
   ASHVA Admin · design system — palette, fonts, gradients, helpers
   ============================================================ */

const C={base:'#17110D',surf:'#1F1813',well:'#1a130d',ink:'#F4EBDD',dim:'#B7A793',faint:'#7C6C5C',
  ember:'#E2542A',sun:'#F2873E',amber:'#F3A93B',green:'#2ea043',red:'#ef4444',
  line:'rgba(244,235,221,.1)',line2:'rgba(244,235,221,.06)'};

const F={s:"'Instrument Serif',serif",g:"'Space Grotesk',sans-serif",m:"'JetBrains Mono',monospace"};

/* per-bike cinematic gradient fallbacks */
const G={
  himalayan:"linear-gradient(160deg,rgba(42,29,18,.2),#17110D 72%),radial-gradient(120% 85% at 72% 8%,rgba(226,84,42,.55),transparent 60%),linear-gradient(160deg,#3a2a1a,#17110D)",
  livewire:"linear-gradient(160deg,rgba(16,35,31,.25),#17110D 72%),radial-gradient(120% 85% at 28% 2%,rgba(45,190,168,.5),transparent 56%),linear-gradient(160deg,#10231f,#17110D)",
  ducati:"linear-gradient(160deg,rgba(46,20,16,.2),#17110D 70%),radial-gradient(120% 85% at 76% 4%,rgba(239,68,68,.55),transparent 56%),linear-gradient(160deg,#3a1a14,#17110D)",
  r6:"linear-gradient(160deg,rgba(16,26,46,.25),#17110D 72%),radial-gradient(120% 85% at 30% 4%,rgba(86,130,245,.45),transparent 56%),linear-gradient(160deg,#101a2e,#17110D)",
  ktm:"linear-gradient(160deg,rgba(44,28,12,.2),#17110D 70%),radial-gradient(120% 85% at 72% 4%,rgba(243,169,59,.5),transparent 56%),linear-gradient(160deg,#382410,#17110D)",
};

/* ---- selectors & formatters ---- */
const $=s=>document.querySelector(s);
const rupee=n=>'₹'+n.toLocaleString('en-IN');

/* ---- inline SVG / chrome bits ---- */
function crest(size,col){const c=col||C.ember;return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" stroke="${c}" stroke-width="1.4"><circle cx="20" cy="20" r="18.5"/><circle cx="20" cy="20" r="12"/><circle cx="20" cy="20" r="2.4" fill="${c}" stroke="none"/><path d="M20 2v36M4.3 11l31.4 18M35.7 11L4.3 29"/></svg>`;}
function eyebrow(t,col){return `<div style="font-family:${F.m};font-size:10px;letter-spacing:.24em;color:${col||C.faint};text-transform:uppercase">${t}</div>`;}
function stars(r){return `<span style="color:${C.amber}">★</span> <span style="font-weight:600">${r}</span>`;}
function chevL(){return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`;}

function bgImg(photo,grad){return `background-image:url('${photo}'),${grad};background-size:cover,cover;background-position:center,center`;}

/* ---- reusable chrome blocks ----
 *
 * With capacitor's `contentInset: 'never'` + body padding using
 * `env(safe-area-inset-*)`, the body's own padding already clears the
 * iOS status bar and home indicator. The topbar no longer needs a
 * 46px magic-number top padding — it just needs a comfortable
 * breathing space below the (now-edge-to-edge) header.
 */
function topbar(title,right){
  return `<div style="position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;height:72px;padding:14px 18px 0;background:linear-gradient(${C.base},rgba(23,17,13,.86) 70%,transparent)">
    <div class="press" data-act="back" style="width:42px;height:42px;border:1px solid ${C.line};display:flex;align-items:center;justify-content:center;background:rgba(244,235,221,.04)">${chevL()}</div>
    <div style="font-family:${F.m};font-size:11px;letter-spacing:.22em;color:${C.dim};text-transform:uppercase">${title||''}</div>
    <div style="width:42px;height:42px;display:flex;align-items:center;justify-content:center">${right||''}</div>
  </div>`;
}

/* The body now applies the bottom safe-area inset globally, so the
 * floating button only needs a comfortable 16px breathing room at the
 * bottom. `env(safe-area-inset-bottom)` is left in place as a safety
 * net in case some legacy screen renders this button before the body
 * padding kicks in. */
function bottomBtn(label,act,locked){
  return `<div style="position:fixed;bottom:0;left:0;right:0;max-width:390px;margin:0 auto;padding:16px 24px calc(16px + env(safe-area-inset-bottom));background:linear-gradient(transparent,#17110D 30%);z-index:35">
    <div class="press" data-act="${act}" style="text-align:center;padding:17px;background:${locked?'rgba(226,84,42,.25)':C.ember};color:${locked?'rgba(255,255,255,.4)':'#fff'};font-family:${F.m};font-size:12px;letter-spacing:.16em;pointer-events:${locked?'none':'auto'}">${label}</div></div>`;
}
