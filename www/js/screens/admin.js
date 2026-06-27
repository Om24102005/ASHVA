"use strict";
/* SCREEN · Admin Dashboard */

function viewAdmin(app){
  const st=app.s.admin.stats;
  const statCard=(label,val,col)=>`
    <div style="flex:1;padding:18px 14px;background:${C.surf};border:1px solid ${C.line};text-align:center">
      <div style="font-family:${F.s};font-size:28px;line-height:1;color:${col||C.sun}">${val}</div>
      <div style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint};margin-top:6px">${label}</div>
    </div>`;
  const navTile=(label,sub,act,col)=>`
    <div class="press" data-act="${act}" style="padding:20px 18px;background:${C.surf};border:1px solid ${C.line};display:flex;align-items:center;justify-content:space-between">
      <div>
        <div style="font-family:${F.m};font-size:11px;letter-spacing:.2em;color:${col||C.sun}">${label}</div>
        <div style="font-family:${F.g};font-size:12px;color:${C.faint};margin-top:4px">${sub}</div>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
    </div>`;

  return `<div style="padding-bottom:40px;background:${C.base}">
    <div style="position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;height:96px;padding:46px 18px 0;background:${C.base};border-bottom:1px solid ${C.line}">
      <div style="display:flex;align-items:center;gap:10px">
        ${crest(26,C.ember)}
        <div>
          <div style="font-family:${F.m};font-weight:700;letter-spacing:.42em;font-size:13px">ASHVA</div>
          <div style="font-family:${F.m};font-size:8px;letter-spacing:.22em;color:${C.ember}">ADMIN</div>
        </div>
      </div>
      <div class="press" data-act="adminout" style="font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.faint};padding:8px 12px;border:1px solid ${C.line}">SIGN OUT</div>
    </div>

    <div style="padding:24px 24px 8px">
      ${eyebrow('// COMMAND CENTRE',C.amber)}
      <div style="font-family:${F.s};font-size:32px;line-height:1;margin-top:6px">Dashboard</div>
    </div>

    <div style="padding:16px 24px">
      <div style="display:flex;gap:10px;margin-bottom:10px">
        ${statCard('TOTAL USERS', st?st.users.toLocaleString():'—', C.sun)}
        ${statCard('BOOKINGS', st?st.bookings.toLocaleString():'—', C.amber)}
      </div>
      <div style="display:flex;gap:10px;margin-bottom:10px">
        ${statCard('REVENUE', st?('₹'+Math.round(st.revenue/1000)+'k'):'—', C.green)}
        ${statCard('KYC PENDING', st?st.kycPending:'—', st&&st.kycPending>0?C.red:C.faint)}
      </div>
      <div style="display:flex;gap:10px">
        ${statCard('AVAILABLE', st?(st.assetsAvail+'/'+st.assetsTotal):'—', C.green)}
        ${statCard('TODAY', new Date().toLocaleDateString('en-IN',{day:'2-digit',month:'short'}), C.faint)}
      </div>
    </div>

    <div style="padding:8px 24px">
      <div style="height:1px;background:${C.line};margin:12px 0 18px"></div>
      ${eyebrow('// MANAGE',C.sun)}
    </div>

    <div style="padding:0 24px;display:flex;flex-direction:column;gap:10px">
      ${navTile('FLEET','Manage bikes · availability · pricing','adminfleet',C.ember)}
      ${navTile('BOOKINGS','All reservations · status updates','adminbookings',C.sun)}
      ${navTile('USERS','Riders · accounts · suspend/activate','adminusers',C.amber)}
      ${navTile('KYC REVIEW','Pending identity verifications','adminkyc',C.green)}
    </div>
  </div>`;
}
