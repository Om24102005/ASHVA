"use strict";
/* SCREEN · Admin KYC Review */

function viewAdminKyc(app){
  const list=app.s.admin.kyc;

  return `<div style="padding-bottom:40px;background:${C.base}">
    ${topbar('KYC REVIEW')}

    <div style="padding:18px 24px 8px">
      ${eyebrow('// IDENTITY VERIFICATION',C.amber)}
      <div style="font-family:${F.g};font-size:12px;color:${C.faint};margin-top:4px">Pending submissions · approve or reject</div>
    </div>

    ${!list?`<div style="padding:60px 24px;text-align:center;font-family:${F.m};font-size:11px;letter-spacing:.18em;color:${C.faint}">LOADING…</div>`:
    list.length===0?`<div style="padding:60px 24px;text-align:center">
      <div style="font-family:${F.s};font-size:28px;color:${C.green};margin-bottom:10px">✓</div>
      <div style="font-family:${F.g};font-size:14px;color:${C.faint}">All KYC submissions reviewed.</div>
    </div>`:
    `<div style="padding:0 24px;display:flex;flex-direction:column;gap:12px">
      ${list.map(k=>{
        const docs=k.documents||[];
        const submitted=new Date(k.submitted_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'});
        return `<div style="background:${C.surf};border:1px solid ${C.line};padding:16px">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
            <div>
              <div style="font-family:${F.m};font-size:9px;letter-spacing:.16em;color:${C.amber}">${(k.doc_type||'').replace('_',' ').toUpperCase()}</div>
              <div style="font-family:${F.s};font-size:20px;line-height:1.1">${k.display_name||'—'}</div>
              <div style="font-family:${F.g};font-size:12px;color:${C.dim};margin-top:2px">${k.email||k.phone||'—'}</div>
            </div>
            <div style="font-family:${F.m};font-size:8px;letter-spacing:.16em;color:${k.status==='in_review'?C.amber:C.faint};padding:3px 7px;border:1px solid currentColor">${k.status.replace('_',' ').toUpperCase()}</div>
          </div>
          <div style="background:${C.well};border:1px solid ${C.line};padding:12px;margin-bottom:12px">
            <div style="font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.faint};margin-bottom:4px">ID NUMBER</div>
            <div style="font-family:${F.g};font-size:14px;color:${C.ink}">${k.id_number||'—'}</div>
            ${k.full_name?`<div style="font-family:${F.g};font-size:12px;color:${C.dim};margin-top:3px">${k.full_name}</div>`:''}
            <div style="font-family:${F.m};font-size:9px;color:${C.faint};margin-top:6px">Submitted ${submitted}</div>
          </div>
          ${docs.length>0?`<div style="display:flex;gap:8px;margin-bottom:12px;overflow-x:auto">
            ${docs.map(d=>`<div style="flex-shrink:0">
              <a href="${d.url}" target="_blank" style="display:block;width:80px;height:60px;background:${C.well};border:1px solid ${C.line};overflow:hidden">
                <img src="${d.url}" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none'">
              </a>
              <div style="font-family:${F.m};font-size:8px;color:${C.faint};margin-top:3px;text-align:center">${(d.label||'').toUpperCase()}</div>
            </div>`).join('')}
          </div>`:''}
          <div style="display:flex;gap:8px">
            <div class="press" data-act="kycverdict" data-id="${k.id}" data-v="approved" style="flex:1;text-align:center;padding:10px;background:rgba(46,160,67,.1);border:1px solid rgba(46,160,67,.3);font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.green}">APPROVE</div>
            <div class="press" data-act="kycverdict" data-id="${k.id}" data-v="in_review" style="width:44px;display:flex;align-items:center;justify-content:center;background:${C.well};border:1px solid ${C.line}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div class="press" data-act="kycverdict" data-id="${k.id}" data-v="rejected" style="flex:1;text-align:center;padding:10px;background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.red}">REJECT</div>
          </div>
        </div>`;
      }).join('')}
    </div>`}
  </div>`;
}
