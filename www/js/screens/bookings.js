"use strict";
/* SCREEN · Bookings tab — Active / Past segmented, pass card + receipts */

function bkInfo(l,v){return `<div style="flex:1"><div style="font-family:${F.m};font-size:9px;letter-spacing:.1em;color:${C.faint}">${l}</div><div style="font-family:${F.g};font-weight:600;font-size:13px;margin-top:3px;color:${C.ink}">${v}</div></div>`;}

function viewBookings(app){
  const seg=app.s.seg;const cf=app.s.confirmed;
  const segBtn=(id,l)=>`<div class="press" data-act="seg" data-s="${id}" style="flex:1;text-align:center;padding:12px;font-family:${F.m};font-size:11px;letter-spacing:.12em;color:${seg===id?C.ink:C.faint};background:${seg===id?'rgba(244,235,221,.06)':'transparent'};border:1px solid ${seg===id?C.line:'transparent'}">${l}</div>`;
  let content;
  if(seg==='active'){
    content=cf?`
      <div class="stg" style="border:1px solid ${C.line};background:${C.surf}">
        <div style="position:relative;height:150px;overflow:hidden">
          <div class="heroimg" style="${bgImg(cf.bike.photo,cf.bike.grad)};animation:kb 28s ease infinite alternate"></div>
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,17,13,.15),rgba(23,17,13,.85))"></div>
          <div style="position:absolute;top:13px;left:13px;padding:6px 11px;background:rgba(226,84,42,.85);font-family:${F.m};font-size:9px;letter-spacing:.12em;color:#fff">UPCOMING</div>
          <div style="position:absolute;bottom:13px;left:16px"><div style="font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.amber}">${cf.bike.maker}</div><div style="font-family:${F.s};font-size:26px;line-height:1">${cf.bike.name}</div></div>
        </div>
        <div style="display:flex;padding:16px;gap:10px;border-bottom:1px solid ${C.line}">
          ${bkInfo('PICKUP',cf.hub)}${bkInfo('DATES',cf.range)}${bkInfo('DAYS',cf.days)}
        </div>
        <div style="display:flex">
          <div class="press" data-act="viewpass" style="flex:1;text-align:center;padding:16px;font-family:${F.m};font-size:11px;letter-spacing:.14em;color:${C.ink};border-right:1px solid ${C.line}">VIEW PASS</div>
          <div class="press" data-act="startride" style="flex:1;text-align:center;padding:16px;font-family:${F.m};font-size:11px;letter-spacing:.14em;color:${C.ember}">START RIDE →</div>
        </div>
      </div>`
      :`<div class="stg" style="text-align:center;padding:60px 30px;border:1px dashed ${C.line}">
        <div style="opacity:.5;margin-bottom:18px">${crest(46,C.faint)}</div>
        <div style="font-family:${F.s};font-size:26px;margin-bottom:8px">No rides booked yet</div>
        <p style="font-family:${F.g};font-size:13px;color:${C.faint};line-height:1.6;margin-bottom:22px">The high passes are waiting. Pick a machine and point it at the horizon.</p>
        <div class="press" data-act="nav" data-to="home" style="display:inline-block;padding:14px 28px;background:${C.ember};color:#fff;font-family:${F.m};font-size:11px;letter-spacing:.16em">EXPLORE BIKES →</div>
      </div>`;
  }else{
    const past=[
      {b:bike('him'),route:'Manali → Leh',date:'Sep 2025',km:512,ref:'ASH-4471',rt:5},
      {b:bike('ktm'),route:'Spiti Circuit',date:'Jun 2025',km:806,ref:'ASH-3120',rt:5},
      {b:bike('duc'),route:'Konkan Coast',date:'Feb 2025',km:548,ref:'ASH-2884',rt:4}
    ];
    content=past.map((p,i)=>`<div class="stg" style="animation-delay:${.05*i}s;display:flex;gap:14px;align-items:center;padding:14px;background:${C.surf};border:1px solid ${C.line};margin-bottom:11px">
      <div style="width:76px;height:60px;overflow:hidden;border:1px solid ${C.line};${bgImg(p.b.photo,p.b.grad)}"></div>
      <div style="flex:1;min-width:0">
        <div style="font-family:${F.s};font-size:19px;line-height:1.1">${p.route}</div>
        <div style="font-family:${F.m};font-size:9.5px;color:${C.faint};margin-top:3px">${p.b.name} · ${p.date}</div>
        <div style="display:flex;gap:12px;margin-top:7px;font-family:${F.m};font-size:9.5px;color:${C.dim}"><span>${p.km} KM</span><span style="color:${C.faint}">${p.ref}</span></div>
      </div>
      <div style="text-align:right"><div style="color:${C.amber};font-size:12px">${'★'.repeat(p.rt)}</div><div style="font-family:${F.m};font-size:9px;color:${C.green};margin-top:6px">COMPLETED</div></div>
    </div>`).join('');
  }
  return `<div style="padding:64px 0 0">
    <div style="padding:0 24px 16px">${eyebrow('// YOUR RIDES')}<h1 style="font-family:${F.s};font-size:38px;line-height:1.02;margin-top:4px">Bookings</h1></div>
    <div style="display:flex;gap:6px;padding:0 24px 22px">${segBtn('active','ACTIVE')}${segBtn('past','PAST')}</div>
    <div style="padding:0 24px">${content}</div>
  </div>`;
}
