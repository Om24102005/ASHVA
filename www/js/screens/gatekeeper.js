"use strict";
/* SCREEN · Gatekeeper — compulsory verify of the missing contact channel.
   entered via email -> verify phone; via phone -> verify email. */
function viewGatekeeper(app){
  const g=app.s.gk;
  const isPhone=g.step==='phone';
  const keys=['1','2','3','4','5','6','7','8','9','','0','⌫'];

  let body;
  if(!g.challengeId){
    const input=isPhone
      ?`<span style="font-family:${F.g};font-weight:600;color:${C.dim};font-size:16px;padding-right:10px;border-right:1px solid ${C.line};margin-right:12px">+91</span><input id="gkIn" inputmode="numeric" maxlength="10" placeholder="98765 43210" value="${g.val}" style="flex:1;background:none;border:none;outline:none;color:${C.ink};font-family:${F.g};font-size:16px;font-weight:500;letter-spacing:1px">`
      :`<input id="gkIn" inputmode="email" placeholder="you@example.in" value="${g.val}" style="flex:1;background:none;border:none;outline:none;color:${C.ink};font-family:${F.g};font-size:16px;font-weight:500">`;
    body=`
      <div class="stg" style="animation-delay:.1s;display:flex;align-items:center;padding:16px 18px;background:${C.surf};border:1px solid ${C.line};margin-bottom:14px">${input}</div>
      <div id="gkSendBtn" class="stg press" data-act="gksend" style="animation-delay:.15s;text-align:center;padding:17px;background:${C.ember};color:#fff;font-family:${F.m};font-size:12px;letter-spacing:.18em">SEND VERIFICATION CODE</div>`;
  }else{
    body=`
      <div class="stg" style="animation-delay:.05s;font-family:${F.g};font-size:13px;color:${C.dim};margin-bottom:6px">Code sent to <span style="color:${C.ink};font-weight:600">${g.dest}</span></div>
      <div class="stg press" data-act="gkchange" style="animation-delay:.05s;font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.sun};margin-bottom:24px">‹ EDIT ${isPhone?'NUMBER':'EMAIL'}</div>
      <div id="gkCells" class="stg" style="animation-delay:.1s;display:flex;gap:8px;margin-bottom:30px">${otpCellsView(g.otp)}</div>
      <div class="stg" style="animation-delay:.15s;display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        ${keys.map(k=>k===''?'<div></div>':`<div class="press" data-act="gkkey" data-k="${k}" style="padding:18px;text-align:center;font-family:${F.g};font-weight:500;font-size:22px;color:${C.ink};background:${C.surf};border:1px solid ${C.line2}">${k}</div>`).join('')}
      </div>`;
  }

  return `<div style="position:relative;min-height:844px;padding:90px 26px 40px">
    <div class="stg" style="display:flex;align-items:center;gap:12px;margin-bottom:36px">${crest(30)}<span style="font-family:${F.m};font-weight:700;letter-spacing:.42em;font-size:15px">ASHVA</span></div>
    <div class="stg" style="align-self:flex-start;border:1px solid ${C.amber};display:inline-block;padding:5px 10px;margin-bottom:14px">
      <span style="font-family:${F.m};font-size:10px;letter-spacing:.18em;color:${C.amber}">STEP REQUIRED</span></div>
    <h1 class="stg" style="animation-delay:.05s;font-family:${F.s};font-weight:400;font-size:40px;line-height:1.04;margin-bottom:12px">Verify your<br><span style="font-style:italic;color:${C.ember}">${isPhone?'phone.':'email.'}</span></h1>
    <p class="stg" style="animation-delay:.08s;font-family:${F.g};font-size:14px;color:${C.dim};line-height:1.6;margin-bottom:28px;max-width:340px">${isPhone
      ? 'You signed up with email — add a mobile number so we can reach you about your ride.'
      : 'You signed up with your phone — add an email so we can send booking receipts.'}</p>
    ${body}
    <div class="press" data-act="gkskip" style="text-align:center;margin-top:22px;font-family:${F.m};font-size:11px;letter-spacing:.12em;color:${C.sun}">SKIP FOR NOW →</div>
    <div class="press" data-act="signout" style="text-align:center;margin-top:16px;font-family:${F.g};font-size:12px;color:${C.faint}">Use a different account · Sign out</div>
  </div>`;
}
