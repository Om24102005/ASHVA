"use strict";
/* SCREEN · Garage sub-screens — documents, saved, payments, loyalty, contacts, preferences */

function viewGsub(app){
  const sub=app.s.gtab;
  const T={documents:'DOCUMENTS',saved:'SAVED ROUTES',payments:'PAYMENT METHODS',loyalty:'LOYALTY & TIER',contacts:'EMERGENCY CONTACTS',prefs:'PREFERENCES'}[sub];
  let body='';
  if(sub==='documents'){
    const doc=(n,id)=>`<div style="display:flex;align-items:center;gap:14px;padding:16px;background:${C.surf};border:1px solid ${C.line};margin-bottom:11px">
      <div style="width:38px;height:38px;border-radius:50%;background:rgba(46,160,67,.14);border:1px solid rgba(46,160,67,.4);display:flex;align-items:center;justify-content:center">${check(C.green,18)}</div>
      <div style="flex:1"><div style="font-family:${F.g};font-weight:600;font-size:15px">${n}</div><div style="font-family:${F.m};font-size:10px;color:${C.faint};margin-top:2px">${id}</div></div>
      <span style="font-family:${F.m};font-size:9px;letter-spacing:.1em;color:${C.green}">VERIFIED</span></div>`;
    body=`<div style="padding:14px 24px">${eyebrow('// VERIFIED VIA DIGILOCKER',C.green)}<div style="margin-top:16px">
      ${doc('Driving Licence','DL-07 2019 0034112')}${doc('Aadhaar eKYC','XXXX XXXX 4417')}${doc('Insurance KYC','Zero-dep · active')}</div>
      <div style="font-family:${F.g};font-size:11.5px;color:${C.faint};line-height:1.6;margin-top:8px">All documents are fetched live from DigiLocker at booking time. ASHVA stores only a verification token, never the document itself.</div></div>`;
  }else if(sub==='saved'){
    body=`<div style="padding:14px 24px;display:flex;flex-direction:column;gap:13px">${[ROUTES[0],ROUTES[1],ROUTES[3]].map(r=>`<div class="press" data-act="route" data-id="${r.id}" style="position:relative;height:150px;overflow:hidden;border:1px solid ${C.line};${bgImg(r.photo,r.grad)}">
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent,rgba(23,17,13,.85))"></div>
      <div style="position:absolute;top:12px;right:12px">${heart(true)}</div>
      <div style="position:absolute;bottom:14px;left:16px"><div style="font-family:${F.s};font-size:24px">${r.name}</div><div style="font-family:${F.m};font-size:10px;color:${C.dim};margin-top:3px">${r.days} DAYS · ${r.km} KM</div></div></div>`).join('')}</div>`;
  }else if(sub==='payments'){
    const card=(t,n,d,col)=>`<div style="display:flex;align-items:center;gap:14px;padding:16px;background:${C.surf};border:1px solid ${C.line};margin-bottom:11px">
      <div style="width:46px;height:32px;background:${col};display:flex;align-items:center;justify-content:center;font-family:${F.m};font-size:9px;color:#fff;letter-spacing:.05em">${t}</div>
      <div style="flex:1"><div style="font-family:${F.g};font-weight:600;font-size:15px;letter-spacing:1px">${n}</div><div style="font-family:${F.m};font-size:10px;color:${C.faint};margin-top:2px">${d}</div></div></div>`;
    body=`<div style="padding:14px 24px">
      ${card('VISA','•••• 4291','Expires 08/27',C.ember)}
      ${card('RuPay','•••• 7733','HDFC Bank',C.green)}
      ${card('UPI','arjun@okaxis','Default · PhonePe','#5b3fa0')}
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px;border:1px dashed ${C.line};margin-top:4px"><span style="font-family:${F.g};font-size:14px;color:${C.dim}">ASHVA Wallet</span><span style="font-family:${F.g};font-weight:700;font-size:18px;color:${C.sun}">₹2,400</span></div>
      <div class="press" style="text-align:center;padding:15px;margin-top:14px;border:1px solid ${C.line};font-family:${F.m};font-size:11px;letter-spacing:.14em;color:${C.sun}">+ ADD PAYMENT METHOD</div></div>`;
  }else if(sub==='loyalty'){
    body=`<div style="padding:14px 24px">
      <div style="padding:24px;background:linear-gradient(150deg,rgba(243,169,59,.12),${C.surf});border:1px solid rgba(243,169,59,.3);text-align:center">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="${C.amber}" style="margin-bottom:10px"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z"/></svg>
        <div style="font-family:${F.s};font-size:28px">Expedition Tier</div>
        <div style="font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.dim};margin-top:6px">18 RIDES · 8,640 KM LOGGED</div></div>
      <div style="margin-top:24px">
        <div style="display:flex;justify-content:space-between;font-family:${F.m};font-size:10px;letter-spacing:.1em;color:${C.dim};margin-bottom:10px"><span>EXPEDITION</span><span style="color:${C.sun}">SUMMIT</span></div>
        <div style="height:10px;background:rgba(244,235,221,.08);overflow:hidden"><div style="height:100%;width:68%;background:linear-gradient(90deg,${C.amber},${C.ember})"></div></div>
        <div style="font-family:${F.g};font-size:12px;color:${C.dim};margin-top:12px;line-height:1.6"><span style="color:${C.ink};font-weight:600">7 more rides</span> to reach Summit Tier — unlocking free gear, priority bikes and 20% off every expedition.</div></div>
      <div style="margin-top:22px">${eyebrow('// PERKS UNLOCKED',C.sun)}
        <div style="margin-top:12px">${['15% off all rentals','Free insurance upgrade','Priority pass on new bikes','Dedicated trip concierge'].map(p=>`<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid ${C.line2}">${check(C.amber)}<span style="font-family:${F.g};font-size:14px">${p}</span></div>`).join('')}</div></div></div>`;
  }else if(sub==='contacts'){
    const ct=(n,r,ph)=>`<div style="display:flex;align-items:center;gap:14px;padding:16px;background:${C.surf};border:1px solid ${C.line};margin-bottom:11px">
      <div style="width:42px;height:42px;border-radius:50%;background:${C.well};display:flex;align-items:center;justify-content:center;font-family:${F.s};font-size:18px;color:${C.sun}">${n[0]}</div>
      <div style="flex:1"><div style="font-family:${F.g};font-weight:600;font-size:15px">${n}</div><div style="font-family:${F.m};font-size:10px;color:${C.faint};margin-top:2px">${r} · ${ph}</div></div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.green}" stroke-width="1.6"><path d="M5 4h3l2 5-2 1a11 11 0 005 5l1-2 5 2v3a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z" stroke-linejoin="round"/></svg></div>`;
    body=`<div style="padding:14px 24px">
      <div style="display:flex;gap:10px;padding:14px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.3);margin-bottom:18px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.red}" stroke-width="1.8" style="flex-shrink:0"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 7v6M12 16.5v.5" stroke-linecap="round"/></svg>
        <span style="font-family:${F.g};font-size:12px;color:${C.dim};line-height:1.5">On SOS, ASHVA auto-SMSes your live location to these contacts and the nearest control room.</span></div>
      ${ct('Priya Mehra','Spouse','+91 98201 ...')}${ct('Rohit Singh','Riding buddy','+91 99102 ...')}
      <div class="press" style="text-align:center;padding:15px;border:1px solid ${C.line};font-family:${F.m};font-size:11px;letter-spacing:.14em;color:${C.sun}">+ ADD CONTACT</div></div>`;
  }else if(sub==='prefs'){
    const P=[['weather','Weather-aware routing','Reroute around storms & landslides'],['convoy','Convoy mode','Share live location with your group'],['ecall','Crash eCall','Auto-call control room on impact'],['offline','Offline map packs','Download routes for no-signal zones']];
    body=`<div style="padding:14px 24px">${P.map(p=>{const on=app.s.prefs[p[0]];return `<div style="display:flex;align-items:center;gap:14px;padding:18px 0;border-bottom:1px solid ${C.line2}">
      <div style="flex:1"><div style="font-family:${F.g};font-weight:600;font-size:15px">${p[1]}</div><div style="font-family:${F.m};font-size:10px;color:${C.faint};margin-top:3px">${p[2]}</div></div>
      <div class="press" data-act="toggle" data-k="${p[0]}" style="width:50px;height:28px;border-radius:14px;background:${on?C.ember:'rgba(244,235,221,.12)'};position:relative;transition:background .25s">
        <div style="position:absolute;top:3px;left:${on?'25px':'3px'};width:22px;height:22px;border-radius:50%;background:#fff;transition:left .25s"></div></div>
    </div>`;}).join('')}</div>`;
  }
  return `<div style="padding-bottom:40px">${topbar(T)}${body}</div>`;
}
