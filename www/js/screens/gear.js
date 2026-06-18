"use strict";
/* SCREEN · Booking Step 2 — gear add-ons grid with live ₹ total */

function gearIcon(id){const s=`fill="none" stroke="${C.sun}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"`;const p={
  cam:'<rect x="3" y="7" width="13" height="11" rx="1"/><path d="M16 10l5-3v10l-5-3z"/>',
  jkt:'<path d="M8 4l4 3 4-3 4 3-2 3v9H6v-9L4 7z"/><path d="M12 7v13"/>',
  comm:'<path d="M4 13a8 8 0 0116 0M4 13v3a2 2 0 002 2M20 13v3a2 2 0 01-2 2"/><circle cx="6" cy="16" r="2"/>',
  boot:'<path d="M7 3h4v9l7 4v4H7z"/><path d="M7 16h11"/>',
  bag:'<rect x="5" y="8" width="14" height="11" rx="1"/><path d="M9 8V6a3 3 0 016 0v2"/>',
  glove:'<path d="M7 11V6a1.5 1.5 0 013 0v4M10 10V5a1.5 1.5 0 013 0v5M13 10V6a1.5 1.5 0 013 0v6c0 4-2 7-6 7s-6-3-6-6l1-3"/>'
}[id];return `<svg width="26" height="26" viewBox="0 0 24 24" ${s}>${p}</svg>`;}

function viewGear(app){
  const bk=app.s.bk;
  const extra=gearPerDay(app)*bk.days;
  return `<div style="padding-bottom:140px">
    ${topbar('GEAR · STEP 2')}${progress(1)}
    <div style="padding:18px 24px 8px">
      <h2 style="font-family:${F.s};font-size:28px;line-height:1.05;margin-bottom:6px">Pack for the<br><span style="font-style:italic;color:${C.ember}">mountains.</span></h2>
      <p style="font-family:${F.g};font-size:13px;color:${C.dim};line-height:1.5">Premium gear, sanitised and sized on delivery. Priced per day.</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:11px;padding:14px 24px">
      ${GEAR.map(g=>{const on=bk.gear.has(g.id);return `<div class="press" data-act="gear" data-g="${g.id}" style="position:relative;padding:16px;background:${on?'rgba(226,84,42,.08)':C.surf};border:1px solid ${on?C.ember:C.line}">
        <div style="position:absolute;top:12px;right:12px;width:22px;height:22px;border:1.5px solid ${on?C.ember:C.faint};background:${on?C.ember:'transparent'};display:flex;align-items:center;justify-content:center">${on?check('#fff',14):''}</div>
        <div style="height:30px;display:flex;align-items:flex-end">${gearIcon(g.id)}</div>
        <div style="font-family:${F.g};font-weight:600;font-size:15px;margin-top:14px">${g.n}</div>
        <div style="font-family:${F.m};font-size:10px;color:${C.faint};margin-top:3px">${g.d}</div>
        <div style="font-family:${F.g};font-weight:600;font-size:14px;color:${C.sun};margin-top:10px">+${rupee(g.p)}<span style="font-size:10px;color:${C.faint};font-weight:400">/day</span></div>
      </div>`;}).join('')}
    </div>
    <div style="position:fixed;bottom:0;left:0;right:0;max-width:390px;margin:0 auto;padding:16px 24px calc(30px + env(safe-area-inset-bottom));background:linear-gradient(transparent,#17110D 26%);z-index:35">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;font-family:${F.m};font-size:11px;letter-spacing:.08em;color:${C.dim}">
        <span>${bk.gear.size} ITEM${bk.gear.size===1?'':'S'} ADDED</span><span style="color:${C.sun};font-family:${F.g};font-weight:600;font-size:15px;letter-spacing:0">+${rupee(extra)}</span></div>
      <div class="press" data-act="kycnext" style="text-align:center;padding:17px;background:${C.ember};color:#fff;font-family:${F.m};font-size:12px;letter-spacing:.16em">VERIFY & PAY →</div>
    </div>
  </div>`;
}
