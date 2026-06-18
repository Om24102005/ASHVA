"use strict";
/* SCREEN · Ride Pass — boarding-pass ticket, tear-line, deterministic QR */

function viewPass(app){
  const cf=app.s.confirmed;if(!cf)return viewBookings(app);
  const b=cf.bike;
  const dcell=(l,v)=>`<div style="padding:14px"><div style="font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.faint}">${l}</div><div style="font-family:${F.g};font-weight:600;font-size:15px;margin-top:4px;color:${C.ink}">${v}</div></div>`;
  return `<div style="padding-bottom:130px">
    ${topbar('RIDE PASS','')}
    <div style="text-align:center;padding:20px 24px 26px">
      <div class="stg" style="width:72px;height:72px;border-radius:50%;background:rgba(46,160,67,.14);border:1px solid rgba(46,160,67,.5);display:flex;align-items:center;justify-content:center;margin:0 auto 18px">${check(C.green,38)}</div>
      <div class="stg" style="animation-delay:.05s">${eyebrow('// BOOKING CONFIRMED',C.green)}</div>
      <h1 class="stg" style="animation-delay:.1s;font-family:${F.s};font-size:38px;line-height:1.05;margin-top:10px">You’re going<br><span style="font-style:italic;color:${C.ember}">riding.</span></h1>
    </div>
    <div class="stg" style="animation-delay:.15s;margin:0 24px;background:${C.surf};border:1px solid ${C.line}">
      <div style="position:relative;height:170px;overflow:hidden">
        <div class="heroimg" style="${bgImg(b.photo,b.grad)};animation:kb 26s ease-in-out infinite alternate"></div>
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,17,13,.2),rgba(23,17,13,.85))"></div>
        <div style="position:absolute;top:14px;right:14px;display:flex;align-items:center;gap:6px;padding:6px 11px;background:rgba(46,160,67,.85);font-family:${F.m};font-size:9px;letter-spacing:.12em;color:#fff">${check('#fff',12)} CONFIRMED</div>
        <div style="position:absolute;bottom:14px;left:18px">
          <div style="font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.amber}">${b.maker}</div>
          <div style="font-family:${F.s};font-size:28px;line-height:1">${b.name}</div></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;border-top:1px solid ${C.line}">
        ${dcell('PICKUP HUB',cf.hub)}${dcell('RIDER',cf.rider)}
        <div style="grid-column:1/3;height:1px;background:${C.line}"></div>
        ${dcell('RIDE DATES',cf.range)}${dcell('DURATION',cf.days+' days')}
      </div>
      <div style="position:relative;height:34px">
        <div style="position:absolute;left:-13px;top:50%;transform:translateY(-50%);width:26px;height:26px;border-radius:50%;background:#17110D;border:1px solid ${C.line}"></div>
        <div style="position:absolute;right:-13px;top:50%;transform:translateY(-50%);width:26px;height:26px;border-radius:50%;background:#17110D;border:1px solid ${C.line}"></div>
        <div style="position:absolute;left:14px;right:14px;top:50%;border-top:2px dashed ${C.line}"></div>
      </div>
      <div style="display:flex;gap:18px;align-items:center;padding:8px 22px 24px">
        <div style="background:#F4EBDD;padding:0;flex-shrink:0">${qrHTML(cf.ref)}</div>
        <div style="flex:1">
          <div style="font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.faint}">BOOKING REF</div>
          <div style="font-family:${F.g};font-weight:700;font-size:22px;letter-spacing:1px;margin:3px 0 14px">${cf.ref}</div>
          <div style="display:flex;align-items:center;gap:8px;font-family:${F.m};font-size:11px;letter-spacing:.1em;color:${C.green}">${check(C.green,15)} PAID · ${rupee(cf.total)}</div>
          <div style="font-family:${F.m};font-size:9px;color:${C.faint};margin-top:8px;line-height:1.5">₹15,000 refundable deposit<br>blocked on pickup.</div>
        </div>
      </div>
    </div>
    <div style="padding:24px;display:flex;flex-direction:column;gap:11px">
      <div class="press" data-act="startride" style="text-align:center;padding:17px;background:${C.ember};color:#fff;font-family:${F.m};font-size:12px;letter-spacing:.16em">START RIDE NOW →</div>
      <div class="press" data-act="nav" data-to="bookings" style="text-align:center;padding:17px;background:${C.surf};border:1px solid ${C.line};color:${C.ink};font-family:${F.m};font-size:12px;letter-spacing:.16em">VIEW IN BOOKINGS</div>
    </div>
  </div>`;
}
