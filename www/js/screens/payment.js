"use strict";
/* SCREEN · Booking Step 4 — fare summary, payment methods, pay→mint */

function payIcon(id){const c=C.dim;const s=`fill="none" stroke="${c}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"`;const p={
  UPI:'<rect x="4" y="3" width="11" height="18" rx="1.5"/><path d="M16 8l4 4-4 4"/>',
  Card:'<rect x="3" y="6" width="18" height="12" rx="1.5"/><path d="M3 10h18"/>',
  Netbanking:'<path d="M4 10l8-5 8 5M5 10v8M19 10v8M9 10v8M15 10v8M3 20h18"/>',
  Wallet:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M16 12h2"/><path d="M3 9h13a2 2 0 012 2"/>'
}[id];return `<svg width="24" height="24" viewBox="0 0 24 24" ${s}>${p}</svg>`;}

function viewPayment(app){
  const bk=app.s.bk;const b=bike(bk.bikeId);
  const base=b.price*bk.days, ins=199*bk.days, gear=gearPerDay(app)*bk.days, hub=299;
  const total=base+ins+gear+hub;
  app._lastTotal=total;
  const row=(l,v,sub)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:13px 0;border-bottom:1px solid ${C.line2}">
    <div><div style="font-family:${F.g};font-size:14px;color:${C.ink}">${l}</div>${sub?`<div style="font-family:${F.m};font-size:10px;color:${C.faint};margin-top:2px">${sub}</div>`:''}</div>
    <div style="font-family:${F.g};font-weight:600;font-size:15px;color:${C.ink}">${rupee(v)}</div></div>`;
  return `<div style="padding-bottom:130px">
    ${topbar('PAYMENT · STEP 4')}${progress(3)}
    <div style="padding:18px 24px 4px">${eyebrow('// FARE SUMMARY',C.sun)}</div>
    <div style="padding:6px 24px">
      ${row(b.name,base,rupee(b.price)+' × '+bk.days+' days')}
      ${row('Insurance',ins,'₹199/day · zero-depreciation')}
      ${gear>0?row('Riding gear',gear,bk.gear.size+' items × '+bk.days+' days'):''}
      ${row('Hub handling',hub,bk.hub+' pickup')}
      <div style="display:flex;justify-content:space-between;align-items:center;padding:18px 0 6px">
        <div><div style="font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.dim}">TOTAL DUE</div><div style="font-family:${F.m};font-size:9px;color:${C.faint};margin-top:3px">Incl. all taxes</div></div>
        <div style="font-family:${F.g};font-weight:700;font-size:30px;color:${C.sun}">${rupee(total)}</div></div>
    </div>
    <div style="padding:16px 24px 4px">${eyebrow('// PAYMENT METHOD',C.sun)}</div>
    <div style="padding:12px 24px;display:flex;flex-direction:column;gap:9px">
      ${METHODS.map(m=>{const a=bk.method===m.id;return `<div class="press" data-act="method" data-m="${m.id}" style="display:flex;align-items:center;gap:14px;padding:15px;background:${a?'rgba(226,84,42,.08)':C.surf};border:1px solid ${a?C.ember:C.line}">
        ${payIcon(m.id)}
        <div style="flex:1"><div style="font-family:${F.g};font-weight:600;font-size:15px">${m.id}</div><div style="font-family:${F.m};font-size:10px;color:${C.faint};margin-top:2px">${m.d}</div></div>
        <div style="width:20px;height:20px;border-radius:50%;border:2px solid ${a?C.ember:C.faint};display:flex;align-items:center;justify-content:center">${a?`<div style="width:9px;height:9px;border-radius:50%;background:${C.ember}"></div>`:''}</div>
      </div>`;}).join('')}
    </div>
    <div style="position:fixed;bottom:0;left:0;right:0;max-width:390px;margin:0 auto;padding:16px 24px calc(30px + env(safe-area-inset-bottom));background:linear-gradient(transparent,#17110D 26%);z-index:35">
      <div id="payBtn" class="press" data-act="pay" style="text-align:center;padding:18px;background:${C.ember};color:#fff;font-family:${F.m};font-size:12px;letter-spacing:.16em">PAY ${rupee(total)}</div>
    </div>
  </div>`;
}
