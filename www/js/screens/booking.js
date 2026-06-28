"use strict";
/* SCREEN · Booking Step 1 — premium hub selector, calendar date picker, telemetry summary */

function viewBooking(app){
  const bk=app.s.bk;const b=bike(bk.bikeId);
  /* Defense in depth: if the booking screen is reached for a bike that
     has just been set offline (deep link, back stack, race with the SSE
     event), bounce the user to the detail screen instead of letting
     them walk through the full flow and only fail at the payment step.
     The detail CTA itself is already disabled for offline bikes — this
     only fires in edge cases. */
  if(b&&(b.status==='maintenance'||b.status==='offline'||b.status==='retired')){
    app.flash('This machine is currently offline',C.red);
    app.go('detail',{bikeId:bk.bikeId});
    return '<div></div>';
  }
  const today=new Date().toISOString().slice(0,10);
  const endD=dateAddDays(bk.date,bk.days);
  const bikeTotal=b.price*bk.days;
  const gearDaily=gearPerDay(app);
  const gearTotal=gearDaily*bk.days;
  const subtotal=bikeTotal+gearTotal;
  const platform=subtotal>0?Math.round(subtotal*.06):0;
  const gst=Math.round(subtotal*.18);
  const grand=subtotal+platform+gst;
  const selHub=HUBS.find(h=>h.id===bk.hub)||HUBS[0];

  return `<div style="padding-bottom:140px;background:${C.base}">
    ${topbar('CONFIGURE · STEP 1')}
    ${progress(0)}

    <div style="padding:0 24px 6px">
      ${eyebrow('// YOUR MACHINE',C.sun)}
    </div>
    ${bikeStrip(b)}

    <div style="padding:6px 24px 12px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="width:18px;height:1px;background:${C.ember}"></span>
        ${eyebrow('PICKUP HUB',C.amber)}
      </div>
      <div style="font-family:${F.s};font-size:24px;line-height:1;margin-top:4px">Where the road begins</div>
    </div>

    <div style="padding:0 24px;display:flex;flex-direction:column;gap:10px">
      ${HUBS.map(h=>{const a=bk.hub===h.id;return `<div class="press" data-act="hub" data-h="${h.id}" style="position:relative;display:flex;align-items:center;gap:14px;padding:16px 16px;background:${a?`linear-gradient(135deg,rgba(226,84,42,.12),rgba(243,169,59,.04))`:C.surf};border:1px solid ${a?C.ember:C.line};overflow:hidden">
        ${a?`<div style="position:absolute;top:0;left:0;bottom:0;width:3px;background:${C.ember}"></div>`:''}
        <div style="width:42px;height:42px;flex-shrink:0;border:1px solid ${a?C.ember:C.line};display:flex;align-items:center;justify-content:center;background:${a?'rgba(226,84,42,.1)':C.well}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${a?C.ember:C.faint}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.2-7-12a7 7 0 0114 0c0 4.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-family:${F.g};font-weight:600;font-size:16px;color:${C.ink}">${h.id}</span>
            ${a?`<span style="font-family:${F.m};font-size:8.5px;letter-spacing:.22em;color:${C.ember};padding:3px 6px;background:rgba(226,84,42,.1);border:1px solid ${C.ember}">SELECTED</span>`:''}
          </div>
          <div style="font-family:${F.g};font-size:12px;color:${C.faint};margin-top:3px;font-style:italic">${h.sub}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint}">${h.km}</div>
          <div style="display:flex;justify-content:flex-end;margin-top:6px">
            <div style="width:18px;height:18px;border-radius:50%;border:1.5px solid ${a?C.ember:C.faint};display:flex;align-items:center;justify-content:center">${a?`<div style="width:8px;height:8px;border-radius:50%;background:${C.ember}"></div>`:''}</div>
          </div>
        </div>
      </div>`;}).join('')}
    </div>

    <div style="padding:28px 24px 14px">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="width:18px;height:1px;background:${C.ember}"></span>
            ${eyebrow('START DATE',C.amber)}
          </div>
          <div style="font-family:${F.s};font-size:24px;line-height:1">${dateLabel(bk.date)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint}">WINDOW</div>
          <div style="font-family:${F.g};font-weight:600;font-size:14px;color:${C.sun};margin-top:3px">${dateLabel(bk.date)} – ${dateLabel(endD)}</div>
        </div>
      </div>
      <div style="position:relative;display:flex;align-items:center;gap:14px;padding:16px 18px;background:${C.surf};border:1px solid ${C.ember}">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${C.ember}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="1.5"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
        <div style="flex:1">
          <div style="font-family:${F.m};font-size:9px;letter-spacing:.16em;color:${C.faint};margin-bottom:3px">PICKUP DATE</div>
          <div style="font-family:${F.g};font-weight:600;font-size:16px;color:${C.ink}">${dateLabel(bk.date)}</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
        <input type="date" id="datePicker" value="${bk.date}" min="${today}" style="position:absolute;inset:0;opacity:0;cursor:pointer;width:100%;height:100%;border:none;-webkit-appearance:none">
      </div>
    </div>

    <div style="padding:24px">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
        <span style="width:18px;height:1px;background:${C.ember}"></span>
        ${eyebrow('DURATION',C.amber)}
      </div>
      <div style="font-family:${F.s};font-size:24px;line-height:1;margin-bottom:14px">${bk.days} day${bk.days===1?'':'s'} on the road</div>

      <div style="display:flex;align-items:stretch;justify-content:space-between;margin-bottom:18px;padding:6px;background:${C.surf};border:1px solid ${C.line}">
        <div class="press" data-act="dur" data-v="-1" style="width:60px;display:flex;align-items:center;justify-content:center;font-size:30px;color:${bk.days>1?C.ink:C.faint};background:${C.well};font-family:${F.g};font-weight:300;cursor:${bk.days>1?'pointer':'not-allowed'}">−</div>
        <div style="text-align:center;flex:1;display:flex;flex-direction:column;justify-content:center">
          <div style="font-family:${F.g};font-weight:700;font-size:34px;line-height:1;color:${C.ink}">${bk.days}<span style="font-size:13px;color:${C.faint};font-weight:400;letter-spacing:.12em;margin-left:6px">DAYS</span></div>
          <div style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.dim};margin-top:6px">${dateLabel(bk.date)} → ${dateLabel(endD)}</div>
        </div>
        <div class="press" data-act="dur" data-v="1" style="width:60px;display:flex;align-items:center;justify-content:center;font-size:28px;color:${bk.days<30?C.ink:C.faint};background:${C.well};font-family:${F.g};font-weight:300">+</div>
      </div>
    </div>

    <div style="margin:6px 24px 0;padding:18px 18px;background:${C.surf};border:1px solid ${C.line}">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        ${eyebrow('// TELEMETRY · LIVE PRICING',C.amber)}
        <span style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.green}">● LIVE</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:9px">
        <div style="display:flex;justify-content:space-between;font-family:${F.g};font-size:13px">
          <span style="color:${C.dim}">${b.name} · ${bk.days}d</span>
          <span style="color:${C.ink};font-weight:500">${rupee(bikeTotal)}</span>
        </div>
        ${gearDaily>0?`<div style="display:flex;justify-content:space-between;font-family:${F.g};font-size:13px">
          <span style="color:${C.dim}">Gear add-ons · ${bk.days}d</span>
          <span style="color:${C.ink};font-weight:500">${rupee(gearTotal)}</span>
        </div>`:''}
        <div style="display:flex;justify-content:space-between;font-family:${F.g};font-size:13px">
          <span style="color:${C.dim}">Platform fee · 6%</span>
          <span style="color:${C.dim}">${rupee(platform)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;font-family:${F.g};font-size:13px">
          <span style="color:${C.dim}">GST · 18%</span>
          <span style="color:${C.dim}">${rupee(gst)}</span>
        </div>
        <div style="height:1px;background:${C.line};margin:6px 0 2px"></div>
        <div style="display:flex;justify-content:space-between;align-items:flex-end">
          <span style="font-family:${F.m};font-size:10px;letter-spacing:.18em;color:${C.faint}">ESTIMATED TOTAL</span>
          <span style="font-family:${F.s};font-size:30px;color:${C.sun};line-height:1">${rupee(grand)}</span>
        </div>
        <div style="font-family:${F.g};font-size:11px;color:${C.faint};font-style:italic;margin-top:4px">Fuel, helmets & roadside assist included.</div>
      </div>
    </div>

    <div style="padding:18px 24px 0">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:${C.surf};border:1px solid ${C.line}">
        <div style="display:flex;align-items:center;gap:10px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${C.green}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.2-7-12a7 7 0 0114 0c0 4.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>
          <span style="font-family:${F.g};font-size:12px;color:${C.ink}">${selHub.id} pickup</span>
        </div>
        <span style="font-family:${F.m};font-size:10px;letter-spacing:.16em;color:${C.faint}">FREE TRANSFER</span>
      </div>
    </div>

    ${bottomBtn('ADD GEAR & CONTINUE →','gearnext')}
  </div>`;
}