"use strict";
/* ============================================================
   ASHVA · shared helpers — selectors, formatters, SVG, chrome
   ============================================================ */

const $=s=>document.querySelector(s);
const bike=id=>BIKES.find(b=>b.id===id);
const route=id=>ROUTES.find(r=>r.id===id);
const rupee=n=>'₹'+n.toLocaleString('en-IN');

const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function dlabel(day){let m=5,d=day;while(d>30){d-=30;m++;}return MON[m]+' '+d;}
function dateLabel(iso){const d=new Date(iso+'T00:00:00');return MON[d.getMonth()]+' '+d.getDate();}
function dateAddDays(iso,days){const d=new Date(iso+'T00:00:00');d.setDate(d.getDate()+days);return d.toISOString().slice(0,10);}

function bgImg(photo,grad){return `background-image:url('${photo}'),${grad};background-size:cover,cover;background-position:center,center`;}

/* live add-on subtotal per day */
function gearPerDay(app){let s=0;app.s.bk.gear.forEach(id=>{const g=GEAR.find(x=>x.id===id);if(g)s+=g.p;});return s;}

/* auth validity gate */
function authValid(app){const a=app.s.auth;return a.mode==='email'?/^\S+@\S+\.\S+$/.test(a.val):/^\d{10}$/.test(a.val);}

/* ---- inline SVG / chrome bits ---- */
function crest(size,col){const c=col||C.ember;return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" stroke="${c}" stroke-width="1.4"><circle cx="20" cy="20" r="18.5"/><circle cx="20" cy="20" r="12"/><circle cx="20" cy="20" r="2.4" fill="${c}" stroke="none"/><path d="M20 2v36M4.3 11l31.4 18M35.7 11L4.3 29"/></svg>`;}
function eyebrow(t,col){return `<div style="font-family:${F.m};font-size:10px;letter-spacing:.24em;color:${col||C.faint};text-transform:uppercase">${t}</div>`;}
function stars(r){return `<span style="color:${C.amber}">★</span> <span style="font-weight:600">${r}</span>`;}
function chevL(){return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>`;}
function heart(f){return `<svg width="20" height="20" viewBox="0 0 24 24" fill="${f?C.ember:'none'}" stroke="${f?C.ember:C.ink}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20S3.5 14 3.5 8.5A4.5 4.5 0 0112 6a4.5 4.5 0 018.5 2.5C20.5 14 12 20 12 20z"/></svg>`;}
function check(col,s){return `<svg width="${s||16}" height="${s||16}" viewBox="0 0 24 24" fill="none" stroke="${col||C.green}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 6"/></svg>`;}
function navIcon(n){const p={
  home:'<circle cx="12" cy="12" r="9"/><path d="M15.6 8.4l-2.1 5.1-5.1 2.1 2.1-5.1z" stroke-linejoin="round"/>',
  routes:'<circle cx="6.5" cy="18" r="2.2"/><circle cx="17.5" cy="6" r="2.2"/><path d="M8.7 18H14a3 3 0 000-6h-4a3 3 0 010-6h5.3"/>',
  book:'<path d="M3 9a2 2 0 012-2h14a2 2 0 012 2 2 2 0 000 4 2 2 0 01-2 2H5a2 2 0 01-2-2 2 2 0 000-4z"/><path d="M15 7v10" stroke-dasharray="2 2.2"/>',
  user:'<circle cx="12" cy="8.5" r="3.4"/><path d="M5.5 19.5a6.5 6.5 0 0113 0"/>'
}[n];return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;}

/* deterministic 21×21 QR-style matrix with corner finder patterns */
function qrHTML(seed){
  const n=21;let h=2166136261;for(let i=0;i<seed.length;i++){h^=seed.charCodeAt(i);h=Math.imul(h,16777619)>>>0;}
  const inBox=(r,c,r0,c0)=>r>=r0&&r<r0+7&&c>=c0&&c<c0+7;
  let cells='';
  for(let r=0;r<n;r++)for(let c=0;c<n;c++){
    let on=0,fnd=false;
    for(const[r0,c0]of[[0,0],[0,14],[14,0]]){if(inBox(r,c,r0,c0)){fnd=true;const rr=r-r0,cc=c-c0;const ring=rr===0||rr===6||cc===0||cc===6;const core=rr>=2&&rr<=4&&cc>=2&&cc<=4;on=(ring||core)?1:0;}}
    if(!fnd){const sep=((r<8&&c<8)||(r<8&&c>=13)||(r>=13&&c<8));if(sep){on=0;}else{let v=(Math.imul(r+1,73856093)^Math.imul(c+1,19349663)^h)>>>0;on=(v>>>((r*c+r+c)%23))&1;}}
    cells+=`<div style="background:${on?'#17110D':'transparent'}"></div>`;
  }
  return `<div style="display:grid;grid-template-columns:repeat(21,1fr);grid-template-rows:repeat(21,1fr);width:150px;height:150px;background:#F4EBDD;padding:8px;gap:0">${cells}</div>`;
}

/* ---- reusable chrome blocks (used by multiple screens) ---- */
function topbar(title,right){
  return `<div style="position:sticky;top:0;z-index:30;display:flex;align-items:center;justify-content:space-between;height:96px;padding:46px 18px 0;background:linear-gradient(${C.base},rgba(23,17,13,.86) 70%,transparent)">
    <div class="press" data-act="back" style="width:42px;height:42px;border:1px solid ${C.line};display:flex;align-items:center;justify-content:center;background:rgba(244,235,221,.04)">${chevL()}</div>
    <div style="font-family:${F.m};font-size:11px;letter-spacing:.22em;color:${C.dim};text-transform:uppercase">${title||''}</div>
    <div style="width:42px;height:42px;display:flex;align-items:center;justify-content:center">${right||''}</div>
  </div>`;
}
function progress(step){const labels=['CONFIGURE','GEAR','VERIFY','PAY'];
  return `<div style="padding:0 24px 6px">
    <div style="display:flex;gap:6px;margin-bottom:8px">${[0,1,2,3].map(i=>`<div style="flex:1;height:3px;background:${i<=step?C.ember:'rgba(244,235,221,.12)'}"></div>`).join('')}</div>
    <div style="display:flex;justify-content:space-between;font-family:${F.m};font-size:9px;letter-spacing:.1em">${labels.map((l,i)=>`<span style="color:${i===step?C.sun:i<step?C.dim:C.faint}">${l}</span>`).join('')}</div>
  </div>`;
}
function bikeStrip(b){return `<div style="display:flex;gap:14px;align-items:center;padding:14px;background:${C.surf};border:1px solid ${C.line};margin:18px 24px">
  <div style="width:74px;height:56px;overflow:hidden;border:1px solid ${C.line};${bgImg(b.photo,b.grad)}"></div>
  <div style="flex:1"><div style="font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.faint}">${b.maker}</div>
    <div style="font-family:${F.s};font-size:21px;line-height:1.1">${b.name}</div></div>
  <div style="text-align:right"><div style="font-family:${F.g};font-weight:600;color:${C.sun}">${rupee(b.price)}</div><div style="font-family:${F.m};font-size:9px;color:${C.faint}">/DAY</div></div>
</div>`;}
function bottomBtn(label,act,locked){
  return `<div style="position:fixed;bottom:0;left:0;right:0;max-width:390px;margin:0 auto;padding:16px 24px calc(30px + env(safe-area-inset-bottom));background:linear-gradient(transparent,#17110D 30%);z-index:35">
    <div class="press" data-act="${act}" style="text-align:center;padding:17px;background:${locked?'rgba(226,84,42,.25)':C.ember};color:${locked?'rgba(255,255,255,.4)':'#fff'};font-family:${F.m};font-size:12px;letter-spacing:.16em;pointer-events:${locked?'none':'auto'}">${label}</div></div>`;
}
