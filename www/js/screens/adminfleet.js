"use strict";
/* SCREEN · Admin Fleet Management */

function viewAdminFleet(app){
  const fleet=app.s.admin.fleet;

  function statusBadge(s){
    if(s==='available')return {dot:C.green,label:'AVAILABLE',col:C.green};
    if(s==='booked')return {dot:C.amber,label:'BOOKED',col:C.amber};
    if(s==='maintenance')return {dot:C.red,label:'OFFLINE',col:C.red};
    return {dot:C.faint,label:s.toUpperCase(),col:C.faint};
  }

  return `<div style="padding-bottom:120px;background:${C.base}">
    ${topbar('FLEET MANAGEMENT')}

    <div style="padding:18px 24px 8px">
      ${eyebrow('// ALL BIKES',C.amber)}
      <div style="font-family:${F.g};font-size:12px;color:${C.faint};margin-top:4px">Toggle availability · edit pricing</div>
    </div>

    ${!fleet?`<div style="padding:60px 24px;text-align:center;font-family:${F.m};font-size:11px;letter-spacing:.18em;color:${C.faint}">LOADING FLEET…</div>`:
    fleet.length===0?`<div style="padding:60px 24px;text-align:center;font-family:${F.g};font-size:14px;color:${C.faint}">No bikes in fleet.</div>`:
    `<div style="padding:0 24px;display:flex;flex-direction:column;gap:10px">
      ${fleet.map(a=>{
        const sb=statusBadge(a.status);
        const specs=a.specs||{};
        return `<div style="background:${C.surf};border:1px solid ${C.line};padding:16px">
          <div style="display:flex;align-items:flex-start;gap:14px">
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <div style="width:8px;height:8px;border-radius:50%;background:${sb.dot}"></div>
                <span style="font-family:${F.m};font-size:8px;letter-spacing:.2em;color:${sb.col}">${sb.label}</span>
                ${a.status==='available'||a.status==='maintenance'?`<span style="font-family:${F.m};font-size:8px;color:${C.faint};margin-left:auto">${a.slug}</span>`:''}
              </div>
              <div style="font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.faint}">${a.maker||'—'}</div>
              <div style="font-family:${F.s};font-size:20px;line-height:1.1">${a.name}</div>
              <div style="font-family:${F.g};font-size:12px;color:${C.dim};margin-top:3px">
                ${[specs.engine,specs.power,specs.range].filter(Boolean).join(' · ')||a.type}
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-family:${F.g};font-weight:600;color:${C.sun}">${rupee(Number(a.price_per_day))}</div>
              <div style="font-family:${F.m};font-size:8px;color:${C.faint}">/DAY</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:14px">
            ${a.status==='available'?
              `<div class="press" data-act="flttoggle" data-id="${a.id}" data-to="maintenance" style="flex:1;text-align:center;padding:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.red}">SET OFFLINE</div>`:
              a.status==='maintenance'?
              `<div class="press" data-act="flttoggle" data-id="${a.id}" data-to="available" style="flex:1;text-align:center;padding:10px;background:rgba(46,160,67,.1);border:1px solid rgba(46,160,67,.3);font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.green}">SET AVAILABLE</div>`:
              `<div style="flex:1;text-align:center;padding:10px;background:${C.well};border:1px solid ${C.line};font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.faint}">${a.status.toUpperCase()}</div>`
            }
            <div class="press" data-act="fltedit" data-id="${a.id}" style="width:44px;display:flex;align-items:center;justify-content:center;background:${C.well};border:1px solid ${C.line}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`}

    ${bottomBtn('+ ADD NEW BIKE','adminaddbike')}
  </div>`;
}
