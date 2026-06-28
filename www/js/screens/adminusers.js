"use strict";
/* SCREEN · Admin Users */

function viewAdminUsers(app){
  const list=app.s.admin.users;

  return `<div style="padding-bottom:40px;background:${C.base}">
    ${topbar('ALL USERS',`<div class="press" data-act="reload" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${C.dim}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></div>`)}

    <div style="padding:18px 24px 8px">
      ${eyebrow('// RIDERS',C.amber)}
      <div style="font-family:${F.g};font-size:12px;color:${C.faint};margin-top:4px">Latest 500 · suspend or reactivate accounts</div>
    </div>

    ${!list?`<div style="padding:60px 24px;text-align:center;font-family:${F.m};font-size:11px;letter-spacing:.18em;color:${C.faint}">LOADING…</div>`:
    list.length===0?`<div style="padding:60px 24px;text-align:center;font-family:${F.g};font-size:14px;color:${C.faint}">No users.</div>`:
    `<div style="padding:0 24px;display:flex;flex-direction:column;gap:8px">
      ${list.map(u=>{
        const suspended=u.status==='suspended';
        const contact=u.email||u.phone||'—';
        const joined=new Date(u.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'});
        return `<div style="background:${C.surf};border:1px solid ${suspended?'rgba(239,68,68,.3)':C.line};padding:14px 16px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between">
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:7px;height:7px;border-radius:50%;background:${suspended?C.red:C.green}"></div>
                <span style="font-family:${F.g};font-weight:600;font-size:14px;color:${C.ink}">${u.display_name||'—'}</span>
              </div>
              <div style="font-family:${F.g};font-size:12px;color:${C.dim};margin-top:3px">${contact}</div>
              <div style="font-family:${F.m};font-size:9px;color:${C.faint};margin-top:3px">Joined ${joined} · ${u.booking_count||0} booking${u.booking_count!==1?'s':''}</div>
            </div>
            ${suspended?
              `<div class="press" data-act="usrstatus" data-id="${u.id}" data-s="active" style="padding:7px 12px;background:rgba(46,160,67,.1);border:1px solid rgba(46,160,67,.3);font-family:${F.m};font-size:9px;letter-spacing:.12em;color:${C.green}">ACTIVATE</div>`:
              `<div class="press" data-act="usrstatus" data-id="${u.id}" data-s="suspended" style="padding:7px 12px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);font-family:${F.m};font-size:9px;letter-spacing:.12em;color:${C.red}">SUSPEND</div>`
            }
          </div>
        </div>`;
      }).join('')}
    </div>`}
  </div>`;
}
