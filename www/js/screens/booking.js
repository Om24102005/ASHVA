"use strict";
/* SCREEN · Booking Step 1 — pickup hub, June-2026 date strip, duration stepper */

function viewBooking(app){
  const bk=app.s.bk;const b=bike(bk.bikeId);
  const dates=[];for(let d=1;d<=30;d++)dates.push(d);
  return `<div style="padding-bottom:120px">
    ${topbar('CONFIGURE · STEP 1')}${progress(0)}
    ${bikeStrip(b)}
    <div style="padding:8px 24px">
      ${eyebrow('// PICKUP HUB',C.sun)}
      <div style="margin:14px 0 28px;display:flex;flex-direction:column;gap:9px">
        ${HUBS.map(h=>{const a=bk.hub===h.id;return `<div class="press" data-act="hub" data-h="${h.id}" style="display:flex;align-items:center;gap:14px;padding:15px;background:${a?'rgba(226,84,42,.08)':C.surf};border:1px solid ${a?C.ember:C.line}">
          <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${a?C.ember:C.faint};display:flex;align-items:center;justify-content:center">${a?`<div style="width:9px;height:9px;border-radius:50%;background:${C.ember}"></div>`:''}</div>
          <div style="flex:1"><div style="font-family:${F.g};font-weight:600;font-size:15px">${h.id}</div><div style="font-family:${F.m};font-size:10px;color:${C.faint};margin-top:2px">${h.sub}</div></div>
          <div style="font-family:${F.m};font-size:11px;color:${C.dim}">${h.km}</div></div>`;}).join('')}
      </div>
      ${eyebrow('// START DATE · JUNE 2026',C.sun)}
    </div>
    <div class="noscroll" style="display:flex;gap:9px;overflow-x:auto;padding:14px 24px 4px">
      ${dates.map(d=>{const a=bk.date===d;const dow=['S','M','T','W','T','F','S'][d%7];return `<div class="press" data-act="date" data-d="${d}" style="min-width:50px;text-align:center;padding:13px 0;background:${a?C.ember:C.surf};border:1px solid ${a?C.ember:C.line};color:${a?'#fff':C.ink}">
        <div style="font-family:${F.m};font-size:9px;color:${a?'rgba(255,255,255,.7)':C.faint}">${dow}</div>
        <div style="font-family:${F.g};font-weight:600;font-size:18px;margin-top:3px">${d}</div></div>`;}).join('')}
    </div>
    <div style="padding:24px">
      ${eyebrow('// DURATION',C.sun)}
      <div style="display:flex;align-items:center;justify-content:space-between;margin:14px 0 8px;padding:6px;background:${C.surf};border:1px solid ${C.line}">
        <div class="press" data-act="dur" data-v="-1" style="width:54px;height:54px;display:flex;align-items:center;justify-content:center;font-size:28px;color:${C.ink};background:${C.well}">−</div>
        <div style="text-align:center"><div style="font-family:${F.g};font-weight:700;font-size:30px">${bk.days}<span style="font-size:14px;color:${C.faint};font-weight:400"> days</span></div></div>
        <div class="press" data-act="dur" data-v="1" style="width:54px;height:54px;display:flex;align-items:center;justify-content:center;font-size:26px;color:${C.ink};background:${C.well}">+</div>
      </div>
      <div style="text-align:center;font-family:${F.m};font-size:11px;letter-spacing:.08em;color:${C.dim};margin-top:14px">${dlabel(bk.date)} → ${dlabel(bk.date+bk.days)} · 2026</div>
    </div>
    ${bottomBtn('ADD GEAR →','gearnext')}
  </div>`;
}
