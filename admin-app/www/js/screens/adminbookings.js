"use strict";
/* SCREEN · Admin All Bookings */

function viewAdminBookings(app){
  const list=app.s.admin.bookings;

  function statusColor(s){
    if(s==='confirmed')return C.sun;
    if(s==='active')return C.green;
    if(s==='completed')return C.faint;
    if(s==='cancelled')return C.red;
    return C.dim;
  }

  return `<div style="padding-bottom:40px;background:${C.base}">
    ${topbar('ALL BOOKINGS')}

    <div style="padding:18px 24px 8px">
      ${eyebrow('// RESERVATIONS',C.amber)}
      <div style="font-family:${F.g};font-size:12px;color:${C.faint};margin-top:4px">Latest 300 · tap to change status</div>
    </div>

    ${!list?`<div style="padding:60px 24px;text-align:center;font-family:${F.m};font-size:11px;letter-spacing:.18em;color:${C.faint}">LOADING…</div>`:
    list.length===0?`<div style="padding:60px 24px;text-align:center;font-family:${F.g};font-size:14px;color:${C.faint}">No bookings yet.</div>`:
    `<div style="padding:0 24px;display:flex;flex-direction:column;gap:10px">
      ${list.map(b=>{
        const sc=statusColor(b.status);
        const d=new Date(b.created_at);
        const dateStr=d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'});
        const rider=b.display_name||(b.user_email||b.user_phone||'Unknown');
        return `<div style="background:${C.surf};border:1px solid ${C.line};padding:16px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px">
            <div>
              <div style="font-family:${F.m};font-size:9px;letter-spacing:.16em;color:${C.ember}">${b.reference}</div>
              <div style="font-family:${F.s};font-size:18px;line-height:1.1">${b.asset_maker||''} ${b.asset_name}</div>
              <div style="font-family:${F.g};font-size:12px;color:${C.dim};margin-top:2px">${rider}</div>
            </div>
            <div style="text-align:right">
              <div style="font-family:${F.m};font-size:8px;letter-spacing:.16em;color:${sc};padding:3px 7px;border:1px solid ${sc}44;background:${sc}18">${b.status.toUpperCase()}</div>
              <div style="font-family:${F.g};font-weight:600;color:${C.sun};margin-top:6px">${rupee(Number(b.total_amount))}</div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;font-family:${F.m};font-size:9px;color:${C.faint};margin-bottom:12px">
            <span>${b.hub||'—'} · ${b.days} day${b.days!==1?'s':''}</span>
            <span>${dateStr}</span>
          </div>
          ${b.status==='confirmed'||b.status==='active'?`
          <div style="display:flex;gap:8px">
            <div class="press" data-act="bkstatus" data-id="${b.id}" data-s="completed" style="flex:1;text-align:center;padding:9px;background:rgba(46,160,67,.1);border:1px solid rgba(46,160,67,.3);font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.green}">COMPLETE</div>
            <div class="press" data-act="bkstatus" data-id="${b.id}" data-s="cancelled" style="flex:1;text-align:center;padding:9px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.red}">CANCEL</div>
          </div>`:
          b.status==='pending'?`
          <div class="press" data-act="bkstatus" data-id="${b.id}" data-s="confirmed" style="text-align:center;padding:9px;background:rgba(243,169,59,.1);border:1px solid rgba(243,169,59,.3);font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.amber}">CONFIRM</div>
          `:''}
        </div>`;
      }).join('')}
    </div>`}
  </div>`;
}
