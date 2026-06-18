"use strict";
/* SCREEN · Booking Step 3 — custom KYC. Capture a govt ID + photos, upload to
   ASHVA (stored in MinIO), track review status. No DigiLocker / no third party. */

const KYC_DOCS=[
  ['aadhaar','Aadhaar'],['pan','PAN'],['driving_licence','Driving Licence'],
  ['passport','Passport'],['voter_id','Voter ID']
];
const KYC_STATUS={
  not_started:['Not started',C.faint], pending:['Pending',C.amber],
  in_review:['In review',C.sun], approved:['Approved',C.green], rejected:['Rejected',C.red]
};

function viewKyc(app){
  const k=app.s.kyc;

  if(k.record&&['in_review','pending','approved'].includes(k.record.status)){
    const st=KYC_STATUS[k.record.status]||KYC_STATUS.in_review;
    const docLabel=(KYC_DOCS.find(d=>d[0]===k.record.docType)||['','ID'])[1];
    return `<div style="padding-bottom:120px">
      ${topbar('IDENTITY · STEP 3')}${progress(2)}
      <div style="padding:18px 24px 6px">
        <h2 style="font-family:${F.s};font-size:28px;line-height:1.05;margin-bottom:8px">Identity<br><span style="font-style:italic;color:${C.ember}">submitted.</span></h2>
      </div>
      <div style="margin:14px 24px;padding:20px;background:${C.surf};border:1px solid ${C.line}">
        <div style="display:flex;justify-content:space-between;align-items:center">
          ${eyebrow('// KYC VERIFICATION',C.sun)}
          <div style="display:flex;align-items:center;gap:7px;border:1px solid ${st[1]};padding:5px 10px">
            <span style="width:7px;height:7px;border-radius:50%;background:${st[1]}"></span>
            <span style="font-family:${F.m};font-size:10px;letter-spacing:.1em;color:${st[1]}">${st[0].toUpperCase()}</span></div>
        </div>
        <div style="font-family:${F.s};font-size:22px;margin-top:12px">${docLabel}</div>
        <div style="font-family:${F.g};font-size:13px;color:${C.dim}">•••• ${String(k.record.idNumber).slice(-4)}</div>
        <div style="display:flex;gap:8px;margin-top:14px">
          ${(k.record.documents||[]).map(d=>`<div style="width:62px;height:62px;border:1px solid ${C.line};background-image:url('${d.storageUrl}');background-size:cover;background-position:center"></div>`).join('')}
        </div>
        <div style="display:flex;align-items:center;gap:10px;margin-top:16px;padding:12px;background:rgba(46,160,67,.1);border:1px solid rgba(46,160,67,.35)">
          ${check(C.green,17)}<span style="font-family:${F.g};font-size:13px;color:${C.green}">Submitted — our team reviews within 24h. You can continue.</span></div>
      </div>
      ${bottomBtn('CONTINUE TO PAYMENT →','paynext',false)}
    </div>`;
  }

  const tile=(p,label)=>{
    const got=k.docs[p];
    return `<div class="press" data-act="kycpic" data-p="${p}" style="flex:1;text-align:center">
      <div style="width:100%;aspect-ratio:1;border:1px ${got?'solid':'dashed'} ${got?C.ember:C.line};background:${C.well};${got?`background-image:url('${got.url}');background-size:cover;background-position:center`:''};display:flex;align-items:center;justify-content:center">
        ${got?'':`<span style="font-family:${F.s};font-size:28px;color:${C.faint}">+</span>`}</div>
      <div style="font-family:${F.m};font-size:9px;letter-spacing:.1em;color:${C.dim};margin-top:6px">${label}</div>
    </div>`;
  };

  return `<div style="padding-bottom:130px">
    ${topbar('IDENTITY · STEP 3')}${progress(2)}
    <div style="padding:18px 24px 6px">
      <h2 style="font-family:${F.s};font-size:28px;line-height:1.05;margin-bottom:8px">Verify your<br><span style="font-style:italic;color:${C.ember}">identity.</span></h2>
      <p style="font-family:${F.g};font-size:13px;color:${C.dim};line-height:1.6">Indian law requires a valid government ID to rent. ASHVA verifies it in-house — your documents stay yours.</p>
    </div>
    <div style="padding:14px 24px">
      ${eyebrow('// DOCUMENT TYPE',C.sun)}
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin:12px 0 18px">
        ${KYC_DOCS.map(([key,label])=>{const on=k.docType===key;return `<div class="press" data-act="kycdoc" data-t="${key}" style="padding:9px 14px;border:1px solid ${on?C.ember:C.line};background:${on?'rgba(226,84,42,.08)':'transparent'};font-family:${F.m};font-size:10px;letter-spacing:.06em;color:${on?C.ember:C.dim}">${label}</div>`;}).join('')}
      </div>
      <div style="display:flex;align-items:center;padding:14px 16px;background:${C.surf};border:1px solid ${C.line};margin-bottom:12px">
        <input id="kycName" placeholder="Full name (as on ID)" value="${k.fullName||''}" style="flex:1;background:none;border:none;outline:none;color:${C.ink};font-family:${F.g};font-size:15px">
      </div>
      <div style="display:flex;align-items:center;padding:14px 16px;background:${C.surf};border:1px solid ${C.line};margin-bottom:18px">
        <input id="kycId" placeholder="ID number" value="${k.idNumber||''}" autocapitalize="characters" style="flex:1;background:none;border:none;outline:none;color:${C.ink};font-family:${F.g};font-size:15px;letter-spacing:1px">
      </div>
      ${eyebrow('// DOCUMENT PHOTOS',C.sun)}
      <div style="display:flex;gap:12px;margin:12px 0 8px">
        ${tile('front','FRONT')}${tile('back','BACK')}${tile('selfie','SELFIE')}
      </div>
      <div id="kycSubmitBtn" class="press" data-act="kycsubmit" style="text-align:center;padding:16px;margin-top:14px;background:${C.ember};color:#fff;font-family:${F.m};font-size:12px;letter-spacing:.16em">SUBMIT FOR VERIFICATION</div>
      <div style="display:flex;align-items:flex-start;gap:10px;margin-top:16px;font-family:${F.g};font-size:11.5px;color:${C.faint};line-height:1.6">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.6" style="flex-shrink:0;margin-top:1px"><rect x="5" y="11" width="14" height="9" rx="1"/><path d="M8 11V8a4 4 0 018 0v3"/></svg>
        <span>Encrypted upload · reviewed by ASHVA · never shared with third parties.</span>
      </div>
    </div>
    ${bottomBtn(app.s.bk.verified?'CONTINUE TO PAYMENT →':'🔒 SUBMIT KYC TO CONTINUE','paynext',!app.s.bk.verified)}
  </div>`;
}
