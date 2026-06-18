"use strict";
/* SCREEN · Active-Trip HUD — live clock, speedo arc, RPM bar, telemetry */

function tripStat(id,l,v){return `<div style="flex:1;text-align:center;padding:16px 6px"><div id="${id}" style="font-family:${F.g};font-weight:700;font-size:22px;color:${C.ink}">${v}</div><div style="font-family:${F.m};font-size:8.5px;letter-spacing:.1em;color:${C.faint};margin-top:4px">${l}</div></div>`;}

function viewTrip(app){
  const cf=app.s.confirmed;const b=cf?cf.bike:bike('him');
  return `<div style="min-height:844px;background:radial-gradient(120% 80% at 50% 0%,#241710,#17110D 70%)">
    <div style="padding:58px 24px 0;display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="width:9px;height:9px;border-radius:50%;background:${C.red};animation:blink 1s infinite"></span>
        <span style="font-family:${F.m};font-size:11px;letter-spacing:.18em;color:${C.ink}">LIVE RIDE</span></div>
      <div id="tripClock" style="font-family:${F.m};font-size:14px;font-weight:500;letter-spacing:.1em;color:${C.dim}">00:00:00</div>
    </div>
    <div style="text-align:center;padding:6px 24px 0">
      <div style="font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.faint};margin-top:6px">${b.maker} · ${b.name}</div>
    </div>
    <div style="position:relative;width:280px;height:200px;margin:18px auto 0">
      <svg width="280" height="200" viewBox="0 0 280 200">
        <circle cx="140" cy="140" r="110" fill="none" stroke="rgba(244,235,221,.08)" stroke-width="14" stroke-linecap="round" pathLength="100" stroke-dasharray="66.6 100" transform="rotate(147 140 140)"/>
        <circle id="speedArc" cx="140" cy="140" r="110" fill="none" stroke="${C.ember}" stroke-width="14" stroke-linecap="round" pathLength="100" stroke-dasharray="0 100" transform="rotate(147 140 140)" style="transition:stroke-dasharray .35s ease,stroke .35s ease"/>
      </svg>
      <div style="position:absolute;top:74px;left:0;right:0;text-align:center">
        <div id="speedVal" style="font-family:${F.g};font-weight:700;font-size:64px;line-height:1">0</div>
        <div style="font-family:${F.m};font-size:11px;letter-spacing:.2em;color:${C.faint};margin-top:-2px">KM / H</div>
      </div>
    </div>
    <div style="padding:0 34px;margin-top:4px">
      <div style="display:flex;justify-content:space-between;font-family:${F.m};font-size:9px;letter-spacing:.1em;color:${C.faint};margin-bottom:7px"><span>RPM</span><span id="rpmVal">0</span></div>
      <div style="height:8px;background:rgba(244,235,221,.08);overflow:hidden"><div id="rpmBar" style="height:100%;width:0%;background:linear-gradient(90deg,${C.amber},${C.ember});transition:width .3s ease"></div></div>
    </div>
    <div style="display:flex;margin:26px 24px 0;border:1px solid ${C.line};background:${C.surf}">
      ${tripStat('tKm','KM TODAY','0.0')}<div style="width:1px;background:${C.line}"></div>
      ${tripStat('tAvg','AVG KM/H','0')}<div style="width:1px;background:${C.line}"></div>
      ${tripStat('tFuel','RANGE','100%')}
    </div>
    <div style="display:flex;gap:11px;padding:22px 24px 0">
      <div class="press" data-act="sos" style="flex:1;display:flex;align-items:center;justify-content:center;gap:9px;padding:16px;border:1px solid ${C.red};color:${C.red};font-family:${F.m};font-size:12px;letter-spacing:.14em">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${C.red}" stroke-width="2"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/><path d="M12 7v6M12 16.5v.5" stroke-linecap="round"/></svg>SOS</div>
      <div class="press" data-act="hazard" style="flex:1;display:flex;align-items:center;justify-content:center;gap:9px;padding:16px;border:1px solid ${C.amber};color:${C.amber};font-family:${F.m};font-size:12px;letter-spacing:.14em">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="${C.amber}" stroke-width="2" stroke-linejoin="round"><path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17v.5" stroke-linecap="round"/></svg>HAZARD</div>
    </div>
    <div style="padding:14px 24px 30px">
      <div class="press" data-act="endride" style="text-align:center;padding:17px;background:${C.ink};color:#17110D;font-family:${F.m};font-size:12px;letter-spacing:.16em;font-weight:700">END RIDE</div>
    </div>
  </div>`;
}

function mountTrip(app){
  const t0=Date.now();let km=0,speed=0,sumS=0,n=0,fuel=100;
  const clock=$('#tripClock'),sv=$('#speedVal'),arc=$('#speedArc'),rb=$('#rpmBar'),rv=$('#rpmVal'),tk=$('#tKm'),ta=$('#tAvg'),tf=$('#tFuel');
  const tick=()=>{
    const target=40+Math.sin(Date.now()/3200)*38+Math.random()*30;
    speed+=(target-speed)*0.18;speed=Math.max(0,Math.min(118,speed));
    const sp=Math.round(speed);
    km+=speed/3600;n++;sumS+=speed;fuel=Math.max(2,fuel-0.05);
    const rpm=Math.round(1500+speed*62+Math.random()*200);
    if(sv)sv.textContent=sp;
    if(arc){arc.style.strokeDasharray=(speed/118*66.6).toFixed(1)+' 100';arc.style.stroke=speed>95?C.red:speed>70?C.sun:C.ember;}
    if(rb)rb.style.width=Math.min(100,rpm/9500*100)+'%';
    if(rv)rv.textContent=rpm.toLocaleString('en-IN');
    if(tk)tk.textContent=km.toFixed(1);
    if(ta)ta.textContent=Math.round(sumS/n);
    if(tf)tf.textContent=Math.round(fuel)+'%';
    if(clock){const s=Math.floor((Date.now()-t0)/1000);const hh=String(Math.floor(s/3600)).padStart(2,'0'),mm=String(Math.floor(s/60)%60).padStart(2,'0'),ss=String(s%60).padStart(2,'0');clock.textContent=`${hh}:${mm}:${ss}`;}
  };
  tick();const iv=setInterval(tick,1000);app.timers.push(iv);
}
