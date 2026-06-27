"use strict";
/* SCREEN · Route Bike Selector — all bikes scored for the current route */

function viewRouteBikes(app){
  const r=route(app.s.routeId);
  const scored=[...BIKES].map(b=>({...b,score:(b.routeScore&&b.routeScore[r.id])||0}))
    .sort((a,b)=>b.score-a.score);

  function scoreLabel(s){
    if(s>=9)return {t:'PERFECT MATCH',c:C.green};
    if(s>=7)return {t:'HIGHLY SUITED',c:C.sun};
    if(s>=5)return {t:'GOOD FIT',c:C.amber};
    if(s>=3)return {t:'MODERATE FIT',c:C.dim};
    return {t:'NOT RECOMMENDED',c:C.faint};
  }

  return `<div style="padding-bottom:40px;background:${C.base}">
    ${topbar('SELECT YOUR MACHINE')}
    <div style="padding:0 24px 18px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="width:18px;height:1px;background:${C.ember}"></span>
        ${eyebrow('// '+r.region+' · '+r.terrain,C.amber)}
      </div>
      <div style="font-family:${F.s};font-size:28px;line-height:1">${r.name}</div>
      <div style="font-family:${F.g};font-size:12px;color:${C.faint};margin-top:6px">All machines rated for this route · tap to configure</div>
    </div>

    <div style="display:flex;flex-direction:column;gap:0;padding:0 24px">
      ${scored.map((b,i)=>{
        const sl=scoreLabel(b.score);
        const isTop=i===0;
        return `<div class="press" data-act="configure" data-id="${b.id}" style="position:relative;display:flex;gap:14px;align-items:stretch;padding:16px;background:${isTop?`linear-gradient(135deg,rgba(226,84,42,.1),rgba(243,169,59,.03))`:C.surf};border:1px solid ${isTop?C.ember:C.line};margin-bottom:${i<scored.length-1?'10px':'0'}">
          ${isTop?`<div style="position:absolute;top:0;left:0;bottom:0;width:3px;background:${C.ember}"></div>`:''}
          <div style="width:84px;height:64px;overflow:hidden;border:1px solid ${isTop?C.ember:C.line};flex-shrink:0;${bgImg(b.photo,b.grad)}"></div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
              <span style="font-family:${F.m};font-size:8px;letter-spacing:.2em;color:${sl.c};background:${sl.c}22;padding:2px 6px;border:1px solid ${sl.c}44">${sl.t}</span>
              ${isTop?`<span style="font-family:${F.m};font-size:8px;letter-spacing:.18em;color:${C.ember}">#1</span>`:''}
            </div>
            <div style="font-family:${F.m};font-size:8.5px;letter-spacing:.14em;color:${C.faint}">${b.maker}</div>
            <div style="font-family:${F.s};font-size:19px;line-height:1.1">${b.name}</div>
            <div style="margin-top:8px;display:flex;align-items:center;gap:6px">
              <div style="flex:1;height:4px;background:rgba(244,235,221,.08);border-radius:2px;overflow:hidden">
                <div style="width:${b.score*10}%;height:100%;background:${sl.c};border-radius:2px"></div>
              </div>
              <span style="font-family:${F.m};font-size:11px;color:${sl.c};font-weight:600;min-width:24px;text-align:right">${b.score}/10</span>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between;flex-shrink:0">
            <div style="text-align:right">
              <div style="font-family:${F.g};font-weight:600;color:${C.sun};font-size:14px">${rupee(b.price)}</div>
              <div style="font-family:${F.m};font-size:8px;color:${C.faint}">/DAY</div>
            </div>
            <div style="font-family:${F.m};font-size:9px;letter-spacing:.12em;color:${isTop?C.ember:C.dim};padding:5px 8px;border:1px solid ${isTop?C.ember:C.line}">CONFIGURE →</div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}
