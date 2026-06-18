"use strict";
/* SCREEN · Route Detail — hero, stat grid, timeline itinerary, rec machines */

function viewRoute(app){
  const r=route(app.s.routeId);
  const stat=(l,v)=>`<div style="flex:1;text-align:center;padding:16px 6px"><div style="font-family:${F.g};font-weight:700;font-size:22px;color:${C.sun}">${v}</div><div style="font-family:${F.m};font-size:9px;letter-spacing:.12em;color:${C.faint};margin-top:3px">${l}</div></div>`;
  return `<div style="padding-bottom:120px">
    <div style="position:relative;height:380px;overflow:hidden">
      <div class="heroimg" style="${bgImg(r.photo,r.grad)}"></div><div class="sweep"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,17,13,.45),transparent 40%,#17110D)"></div>
      <div style="position:absolute;top:56px;left:20px"><div class="press" data-act="back" style="width:44px;height:44px;border:1px solid ${C.line};display:flex;align-items:center;justify-content:center;background:rgba(23,17,13,.5);backdrop-filter:blur(8px)">${chevL()}</div></div>
      <div style="position:absolute;bottom:22px;left:24px;right:24px">${eyebrow('// '+r.region+' · '+r.terrain,C.amber)}
        <div style="font-family:${F.s};font-size:44px;line-height:1;margin-top:6px">${r.name}</div></div>
    </div>
    <div style="padding:0 24px">
      <div style="display:flex;border:1px solid ${C.line};background:${C.surf};margin-top:-1px">${stat('DAYS',r.days)}<div style="width:1px;background:${C.line}"></div>${stat('DISTANCE',r.km+'km')}<div style="width:1px;background:${C.line}"></div>${stat('PEAK',r.alt)}</div>
      <p style="font-family:${F.g};font-size:15px;line-height:1.65;color:${C.dim};margin:24px 0 8px">${r.blurb}</p>
      <div style="margin:22px 0 14px">${eyebrow('// DAY BY DAY',C.sun)}</div>
      <div style="position:relative;padding-left:4px">
        ${r.legs.map((l,i)=>`<div style="display:flex;gap:16px;position:relative">
          <div style="display:flex;flex-direction:column;align-items:center">
            <div style="width:13px;height:13px;border-radius:50%;border:2px solid ${C.ember};background:#17110D;margin-top:4px;z-index:2"></div>
            ${i<r.legs.length-1?`<div style="width:2px;flex:1;background:linear-gradient(${C.ember},${C.line})"></div>`:''}
          </div>
          <div style="padding-bottom:${i<r.legs.length-1?'26px':'4px'};flex:1">
            <div style="display:flex;justify-content:space-between;align-items:baseline">
              <span style="font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.sun}">${l.d}</span>
              <span style="font-family:${F.m};font-size:10px;color:${C.faint}">${l.km} KM</span></div>
            <div style="font-family:${F.s};font-size:21px;line-height:1.15;margin:4px 0 5px">${l.t}</div>
            <div style="font-family:${F.g};font-size:13px;color:${C.dim};line-height:1.55">${l.n}</div>
          </div></div>`).join('')}
      </div>
      <div style="margin:24px 0 14px">${eyebrow('// RECOMMENDED MACHINES',C.sun)}</div>
      ${r.bikes.map(id=>{const b=bike(id);return `<div class="press" data-act="bike" data-id="${b.id}" style="display:flex;gap:14px;align-items:center;padding:13px 0;border-bottom:1px solid ${C.line2}">
        <div style="width:78px;height:58px;overflow:hidden;border:1px solid ${C.line};${bgImg(b.photo,b.grad)}"></div>
        <div style="flex:1"><div style="font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.faint}">${b.maker}</div>
          <div style="font-family:${F.s};font-size:20px;line-height:1.1">${b.name}</div>
          <div style="font-family:${F.m};font-size:10px;color:${C.dim};margin-top:2px">${b.type} · ${stars(b.rating)}</div></div>
        <div style="text-align:right"><div style="font-family:${F.g};font-weight:600;color:${C.sun}">${rupee(b.price)}</div><div style="font-family:${F.m};font-size:9px;color:${C.faint}">/DAY</div></div>
      </div>`;}).join('')}
    </div>
    ${bottomBtn('FIND A BIKE FOR THIS ROUTE →','routebike')}
  </div>`;
}
