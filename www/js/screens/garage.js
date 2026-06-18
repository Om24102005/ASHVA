"use strict";
/* SCREEN · Garage / Profile — stats, menu rows opening sub-screens */

function gIcon(k){const s=`fill="none" stroke="${C.sun}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"`;const p={
  documents:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/>',
  saved:'<path d="M6 4h12v16l-6-4-6 4z"/>',
  payments:'<rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M3 10h18"/>',
  loyalty:'<path d="M12 3l3 6 7 .8-5 4.7L18.5 21 12 17.5 5.5 21 7 14.5l-5-4.7L9 9z"/>',
  contacts:'<path d="M16 4a4 4 0 010 8M18 20a6 6 0 00-12 0"/><circle cx="9" cy="8" r="4"/>',
  prefs:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4 12H1M23 12h-3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>'
}[k];return `<svg width="20" height="20" viewBox="0 0 24 24" ${s}>${p}</svg>`;}

function viewGarage(app){
  const stat=(v,l)=>`<div style="flex:1;text-align:center;padding:18px 6px"><div style="font-family:${F.g};font-weight:700;font-size:24px;color:${C.sun}">${v}</div><div style="font-family:${F.m};font-size:9px;letter-spacing:.1em;color:${C.faint};margin-top:4px">${l}</div></div>`;
  const menu=[['documents','Documents','KYC · licence · Aadhaar'],['saved','Saved routes','3 expeditions bookmarked'],['payments','Payment methods','2 cards · UPI · Wallet'],['loyalty','Loyalty & tier','Expedition → Summit'],['contacts','Emergency contacts','2 set · auto-SMS on SOS'],['prefs','Preferences','Ride alerts & safety']];
  return `<div style="padding:64px 0 0">
    <div style="padding:0 24px 22px;display:flex;align-items:center;gap:16px">
      <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(140deg,${C.ember},${C.amber});display:flex;align-items:center;justify-content:center;font-family:${F.s};font-size:32px;color:#fff">A</div>
      <div><div style="font-family:${F.s};font-size:28px;line-height:1.05">Arjun Mehra</div>
        <div style="display:inline-flex;align-items:center;gap:6px;margin-top:6px;padding:5px 11px;background:rgba(243,169,59,.12);border:1px solid rgba(243,169,59,.4)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="${C.amber}"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
          <span style="font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.amber}">EXPEDITION TIER</span></div></div>
    </div>
    <div style="margin:0 24px;display:flex;border:1px solid ${C.line};background:${C.surf}">${stat('18','RIDES')}<div style="width:1px;background:${C.line}"></div>${stat('9','STATES')}<div style="width:1px;background:${C.line}"></div>${stat('4.86','RIDER ★')}</div>
    <div style="padding:24px">
      ${menu.map((m,i)=>`<div class="press stg" data-act="gsub" data-sub="${m[0]}" style="animation-delay:${.04*i}s;display:flex;align-items:center;gap:15px;padding:16px 0;border-bottom:1px solid ${C.line2}">
        <div style="width:40px;height:40px;border:1px solid ${C.line};display:flex;align-items:center;justify-content:center;flex-shrink:0">${gIcon(m[0])}</div>
        <div style="flex:1"><div style="font-family:${F.g};font-weight:600;font-size:15px">${m[1]}</div><div style="font-family:${F.m};font-size:10px;color:${C.faint};margin-top:2px">${m[2]}</div></div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.8"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`).join('')}
      <div class="press" data-act="signout" style="text-align:center;padding:16px;margin-top:22px;border:1px solid ${C.line};font-family:${F.m};font-size:11px;letter-spacing:.16em;color:${C.red}">SIGN OUT</div>
      <div style="text-align:center;margin-top:24px;display:flex;flex-direction:column;align-items:center;gap:10px">${crest(28,C.faint)}<div style="font-family:${F.m};font-size:9px;letter-spacing:.3em;color:${C.faint}">ASHVA · v1.0 · MADE IN INDIA</div></div>
    </div></div>`;
}
