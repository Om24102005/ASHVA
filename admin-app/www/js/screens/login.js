"use strict";
/* SCREEN · Admin Login */

function viewLogin(app){
  const flash=app.s.flash;
  return `<div style="min-height:100vh;background:${C.base};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 32px calc(48px + env(safe-area-inset-bottom))">

    <div style="text-align:center;margin-bottom:48px">
      ${crest(52,C.ember)}
      <div style="font-family:${F.m};font-weight:700;letter-spacing:.52em;font-size:20px;margin-top:18px">ASHVA</div>
      <div style="font-family:${F.m};font-size:9px;letter-spacing:.36em;color:${C.ember};margin-top:6px">ADMIN PANEL</div>
    </div>

    ${flash?`<div style="width:100%;max-width:326px;padding:12px 16px;background:${flash.col}18;border:1px solid ${flash.col}44;font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${flash.col};text-align:center;margin-bottom:20px">${flash.msg}</div>`:''}

    <div style="width:100%;max-width:326px">
      <div style="margin-bottom:14px">
        <div style="font-family:${F.m};font-size:9px;letter-spacing:.22em;color:${C.faint};margin-bottom:8px">EMAIL</div>
        <input id="adminEmailIn" type="email" inputmode="email" autocomplete="email" placeholder="admin@ashva.com"
          value="${app.s.adminEmail||''}"
          style="width:100%;background:${C.surf};border:1px solid ${C.line};padding:16px;color:${C.ink};font-family:${F.g};font-size:16px;outline:none;-webkit-appearance:none">
      </div>
      <div style="margin-bottom:28px">
        <div style="font-family:${F.m};font-size:9px;letter-spacing:.22em;color:${C.faint};margin-bottom:8px">PASSWORD</div>
        <input id="adminPwIn" type="password" autocomplete="current-password" placeholder="••••••••"
          value="${app.s.adminPw||''}"
          style="width:100%;background:${C.surf};border:1px solid ${C.line};padding:16px;color:${C.ink};font-family:${F.g};font-size:16px;outline:none;-webkit-appearance:none">
      </div>
      <div class="press" data-act="adminlogin"
        style="text-align:center;padding:18px;background:${C.ember};color:#fff;font-family:${F.m};font-size:12px;letter-spacing:.2em">
        ENTER ADMIN PANEL
      </div>
    </div>

    <div style="margin-top:48px;font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.faint}">ASHVA · ADMIN ACCESS ONLY</div>
  </div>`;
}
