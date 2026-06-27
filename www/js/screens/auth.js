"use strict";
/* SCREEN · Auth / Login — email|mobile, OTP keypad, Google one-tap */

function viewAuth(app){
  const a=app.s.auth;
  const hero=`<div class="heroimg" style="${bgImg(ROUTES[0].photo,G.leh)}"></div>
    <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,17,13,.35) 0%,rgba(23,17,13,.1) 25%,rgba(23,17,13,.6) 65%,#17110D 88%)"></div>
    <div class="sweep"></div>`;
  let body;
  if(a.step==='admin_pw'){
    body=`
      <div class="stg" style="animation-delay:.05s;display:flex;align-items:center;gap:10px;padding:12px 16px;background:rgba(226,84,42,.08);border:1px solid rgba(226,84,42,.2);margin-bottom:18px">
        ${crest(18,C.ember)}
        <div>
          <div style="font-family:${F.m};font-size:9px;letter-spacing:.2em;color:${C.ember}">ADMIN ACCESS</div>
          <div style="font-family:${F.g};font-size:13px;color:${C.dim}">${a.val}</div>
        </div>
      </div>
      <div class="stg" style="animation-delay:.1s;font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint};margin-bottom:6px">PASSWORD</div>
      <div class="stg" style="animation-delay:.1s;display:flex;align-items:center;padding:16px 18px;background:${C.surf};border:1px solid ${C.ember};margin-bottom:14px">
        <input id="adminPwIn" type="password" placeholder="Enter admin password" value="${a.adminPw||''}" autocomplete="current-password"
          style="flex:1;background:none;border:none;outline:none;color:${C.ink};font-family:${F.g};font-size:16px;font-weight:500">
      </div>
      <div id="adminLoginBtn" class="stg press" data-act="adminlogin" style="animation-delay:.15s;text-align:center;padding:17px;background:${C.ember};color:#fff;font-family:${F.m};font-size:12px;letter-spacing:.18em">ENTER ADMIN PANEL</div>
      <div class="stg press" data-act="achange" style="animation-delay:.2s;text-align:center;margin-top:18px;font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.faint}">‹ BACK</div>`;
  }else if(a.step==='enter'){
    const valid=authValid(app);
    const seg=(m,l)=>`<div class="press" data-act="amode" data-m="${m}" style="flex:1;text-align:center;padding:11px;font-family:${F.m};font-size:11px;letter-spacing:.14em;color:${a.mode===m?C.ink:C.faint};background:${a.mode===m?'rgba(244,235,221,.06)':'transparent'};border:1px solid ${a.mode===m?C.line:'transparent'}">${l}</div>`;
    const input=a.mode==='email'
      ?`<input id="authIn" inputmode="email" placeholder="you@example.in" value="${a.val}" style="flex:1;background:none;border:none;outline:none;color:${C.ink};font-family:${F.g};font-size:16px;font-weight:500">`
      :`<span style="font-family:${F.g};font-weight:600;color:${C.dim};font-size:16px;padding-right:10px;border-right:1px solid ${C.line};margin-right:12px">+91</span><input id="authIn" inputmode="numeric" maxlength="10" placeholder="98765 43210" value="${a.val}" style="flex:1;background:none;border:none;outline:none;color:${C.ink};font-family:${F.g};font-size:16px;font-weight:500;letter-spacing:1px">`;
    body=`
      <div class="stg" style="animation-delay:.05s;display:flex;gap:6px;margin-bottom:18px">${seg('email','EMAIL')}${seg('mobile','MOBILE')}</div>
      <div class="stg" style="animation-delay:.1s;display:flex;align-items:center;padding:16px 18px;background:${C.surf};border:1px solid ${C.line};margin-bottom:14px">${input}</div>
      <div id="contBtn" class="stg press" data-act="continue" style="animation-delay:.15s;text-align:center;padding:17px;background:${valid?C.ember:'rgba(226,84,42,.25)'};color:${valid?'#fff':'rgba(255,255,255,.4)'};font-family:${F.m};font-size:12px;letter-spacing:.18em;pointer-events:${valid?'auto':'none'}">CONTINUE</div>
      <div class="stg" style="animation-delay:.2s;display:flex;align-items:center;gap:14px;margin:22px 0;color:${C.faint}">
        <div style="flex:1;height:1px;background:${C.line}"></div><span style="font-family:${F.m};font-size:10px;letter-spacing:.2em">OR</span><div style="flex:1;height:1px;background:${C.line}"></div></div>
      <div class="stg press" data-act="google" style="animation-delay:.25s;display:flex;align-items:center;justify-content:center;gap:12px;padding:16px;background:${C.surf};border:1px solid ${C.line}">
        <svg width="19" height="19" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.3 17.6 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 7l7.1 5.5c4.2-3.9 6.6-9.6 6.6-16z"/><path fill="#FBBC05" d="M10.4 28.3c-.5-1.5-.8-3.1-.8-4.8s.3-3.3.8-4.8l-7.8-6.1C.9 15.9 0 19.8 0 23.5s.9 7.6 2.6 10.9l7.8-6.1z"/><path fill="#34A853" d="M24 47c6.2 0 11.5-2 15.3-5.5l-7.1-5.5c-2 1.4-4.6 2.2-8.2 2.2-6.4 0-11.7-3.8-13.6-9.1l-7.8 6.1C6.5 41.6 14.6 47 24 47z"/></svg>
        <span style="font-family:${F.g};font-weight:500;font-size:14px">Continue with Google</span></div>
      <div class="stg" style="animation-delay:.3s;text-align:center;margin-top:22px;font-family:${F.g};font-size:11px;color:${C.faint};line-height:1.7">By continuing you agree to ASHVA’s<br>Terms · Rental Policy · Privacy</div>`;
  }else{
    const cells=otpCellsView(a.otp);
    const keys=['1','2','3','4','5','6','7','8','9','','0','⌫'];
    body=`
      <div class="stg" style="animation-delay:.05s;font-family:${F.g};font-size:13px;color:${C.dim};margin-bottom:6px">Code sent to <span style="color:${C.ink};font-weight:600">${a.mode==='mobile'?'+91 '+a.val:a.val}</span></div>
      <div class="stg press" data-act="achange" style="animation-delay:.05s;font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.sun};margin-bottom:24px">‹ CHANGE</div>
      <div id="otpCells" class="stg" style="animation-delay:.1s;display:flex;gap:8px;margin-bottom:30px">${cells}</div>
      <div class="stg" style="animation-delay:.15s;display:grid;grid-template-columns:repeat(3,1fr);gap:10px">
        ${keys.map(k=>k===''?'<div></div>':`<div class="press" data-act="otpkey" data-k="${k}" style="padding:18px;text-align:center;font-family:${F.g};font-weight:500;font-size:22px;color:${C.ink};background:${C.surf};border:1px solid ${C.line2}">${k}</div>`).join('')}
      </div>
      <div class="stg" style="animation-delay:.2s;text-align:center;margin-top:20px;font-family:${F.g};font-size:12px;color:${C.faint}">Didn’t get it? <span class="press" data-act="resend" style="color:${C.sun}">Resend</span></div>`;
  }
  return `<div style="position:relative;min-height:844px">
    <div style="position:absolute;top:0;left:0;right:0;height:430px;overflow:hidden">${hero}</div>
    <div style="position:relative;padding:118px 26px 40px">
      <div class="stg" style="display:flex;align-items:center;gap:12px;margin-bottom:140px">${crest(34)}<span style="font-family:${F.m};font-weight:700;letter-spacing:.42em;font-size:17px">ASHVA</span></div>
      <div class="stg" style="animation-delay:.05s">${eyebrow('// PAN-INDIA MOTO RENTALS',C.sun)}</div>
      <h1 class="stg" style="animation-delay:.1s;font-family:${F.s};font-weight:400;font-size:50px;line-height:1.02;margin:14px 0 34px;letter-spacing:-.5px">The road is<br><span style="font-style:italic;color:${C.ember}">calling.</span></h1>
      ${body}
    </div></div>`;
}
