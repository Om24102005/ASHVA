"use strict";
/* SCREEN · Home — cinematic staggered hero, parallax, premium garage
 *
 * Two parallel fleet slices:
 *   AVAIL  = bikes the user can book right now  (status==='available').
 *            Drives the hero carousel, the hero progress bars, and the
 *            "X ready" counter.
 *   GARAGE = the full fleet excluding 'retired' only — keeps
 *            'maintenance' and 'offline' bikes visible so admins can see
 *            the whole fleet at a glance. Garage list rows for those
 *            non-bookable bikes are rendered greyed-out with an OFFLINE
 *            badge but remain clickable so the user can still inspect
 *            the spec sheet (detail.js handles the "NOT AVAILABLE"
 *            state on its own). */

function heroSpec(i,AVAIL){
  const src=AVAIL&&AVAIL.length?AVAIL:BIKES.filter(x=>x.status==='available');
  const b=src[i]||BIKES[i];
  return `<div style="display:flex;gap:7px;margin-bottom:16px">
    <div style="flex:1;padding:9px 10px;background:rgba(23,17,13,.4);border:1px solid ${C.line};backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="font-family:${F.m};font-size:8.5px;letter-spacing:.18em;color:${C.faint};margin-bottom:3px">ENGINE</div>
      <div style="font-family:${F.g};font-weight:600;font-size:13px;color:${C.ink}">${b.engine}</div>
    </div>
    <div style="flex:1;padding:9px 10px;background:rgba(23,17,13,.4);border:1px solid ${C.line};backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="font-family:${F.m};font-size:8.5px;letter-spacing:.18em;color:${C.faint};margin-bottom:3px">POWER</div>
      <div style="font-family:${F.g};font-weight:600;font-size:13px;color:${C.ink}">${b.power}</div>
    </div>
    <div style="flex:1;padding:9px 10px;background:rgba(23,17,13,.4);border:1px solid ${C.line};backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)">
      <div style="font-family:${F.m};font-size:8.5px;letter-spacing:.18em;color:${C.faint};margin-bottom:3px">RANGE</div>
      <div style="font-family:${F.g};font-weight:600;font-size:13px;color:${C.ink}">${b.range}</div>
    </div>
  </div>`;
}

function heroBlock(i,AVAIL){
  const src=AVAIL&&AVAIL.length?AVAIL:BIKES.filter(x=>x.status==='available');
  const b=src[i]||BIKES[i];
  return `<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px">
    <div style="min-width:0;flex:1">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
        <span style="width:24px;height:1px;background:${C.ember}"></span>
        <span style="font-family:${F.m};font-size:9.5px;letter-spacing:.26em;color:${C.amber}">${b.kicker}</span>
        <span style="font-family:${F.m};font-size:9.5px;letter-spacing:.26em;color:${C.faint}">· ${b.maker}</span>
      </div>
      <div style="font-family:${F.s};font-size:42px;line-height:.95;margin:2px 0 4px;color:${C.ink};letter-spacing:-.5px">${b.name}</div>
      <div style="font-family:${F.g};font-size:13px;font-style:italic;color:${C.dim};letter-spacing:.1px">${b.tag}</div>
    </div>
    <div style="text-align:right;flex-shrink:0;padding-left:14px">
      <div style="font-family:${F.g};font-weight:700;font-size:22px;color:${C.sun};letter-spacing:-.3px">${rupee(b.price)}</div>
      <div style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint};margin-top:3px">${stars(b.rating)} · PER DAY</div>
    </div>
  </div>
  ${heroSpec(i,src)}
  <div class="press" data-act="bike" data-id="${b.id}" style="display:flex;align-items:center;justify-content:center;gap:14px;padding:16px;background:${C.ember};color:#fff;font-family:${F.m};font-size:12px;letter-spacing:.22em;position:relative;overflow:hidden">
    <span>VIEW MACHINE</span>
    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"><path d="M1 5h15M12 1l4 4-4 4"/></svg>
    <div style="position:absolute;top:0;left:-100%;width:60%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent);animation:heroShine 3.2s infinite"></div>
  </div>`;
}

function viewHome(app){
  const AVAIL=BIKES.filter(b=>b.status==='available');
  const GARAGE=BIKES.filter(b=>b.status!=='retired');
  if(!GARAGE.length)return `<div style="padding:120px 24px;text-align:center;font-family:${F.m};font-size:11px;letter-spacing:.2em;color:${C.faint}">NO BIKES AVAILABLE</div>`;
  const b=AVAIL[0]||GARAGE[0];
  const b2=AVAIL[1]||AVAIL[0]||GARAGE[1]||GARAGE[0]||b;
  const bars=AVAIL.map((_,i)=>`<div class="press" data-act="herobar" data-i="${i}" style="flex:1;height:2.5px;background:rgba(244,235,221,.22);overflow:hidden;position:relative">
    <div class="hbarfill" data-i="${i}" style="position:absolute;top:0;left:0;height:100%;width:0%;background:linear-gradient(90deg,${C.amber},${C.ember})"></div>
  </div>`).join('');
  const dots=AVAIL.map((_,i)=>`<div class="hdot press" data-act="herobar" data-i="${i}" style="width:${i===0?'18px':'6px'};height:2px;background:${i===0?C.ink:'rgba(244,235,221,.3)'};transition:width .4s cubic-bezier(.16,1,.3,1),background .4s ease"></div>`).join('');
  /* Hero: shown only when at least one bike is currently bookable. Otherwise
     a slim fleet-update banner takes its place so the page still has
     visual weight at the top and the user knows it's a temporary state. */
  const heroSection=AVAIL.length?`<div id="hero" style="position:relative;height:560px;overflow:hidden;touch-action:pan-y;background:${C.base}">
      <div id="hbgA" class="heroimg" style="${bgImg(b.photo,b.grad)};transform:scale(1.06);will-change:transform,opacity"></div>
      <div id="hbgB" class="heroimg" style="${bgImg(b2.photo,b2.grad)};opacity:0;transform:scale(1.06);will-change:transform,opacity;transition:opacity .9s ease"></div>
      <div class="sweep"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,17,13,.35) 0%,rgba(23,17,13,.12) 18%,transparent 42%,rgba(23,17,13,.45) 70%,rgba(23,17,13,.85) 88%,#17110D 100%)"></div>
      <div style="position:absolute;inset:0;background:radial-gradient(60% 40% at 50% 65%,transparent,rgba(23,17,13,.35) 100%);pointer-events:none"></div>

      <div style="position:absolute;top:58px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center;z-index:3">
        <div style="display:flex;align-items:center;gap:10px">
          ${crest(26)}
          <div>
            <div style="font-family:${F.m};font-weight:700;letter-spacing:.36em;font-size:13px;color:${C.ink}">ASHVA</div>
            <div style="font-family:${F.m};font-size:7.5px;letter-spacing:.32em;color:${C.faint};margin-top:2px">EST · INDIA</div>
          </div>
        </div>
        <div class="press" data-act="reload" style="display:flex;align-items:center;gap:7px;padding:7px 12px;background:rgba(23,17,13,.55);border:1px solid ${C.line};backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)">
          <span style="width:7px;height:7px;border-radius:50%;background:${C.green};box-shadow:0 0 8px ${C.green};animation:pulse 1.8s infinite"></span>
          <span style="font-family:${F.m};font-size:10px;letter-spacing:.16em;color:${C.dim}">MANALI · HP</span>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </div>
      </div>

      <div style="position:absolute;top:130px;left:24px;z-index:3">
        <div style="font-family:${F.m};font-size:9px;letter-spacing:.42em;color:${C.faint};writing-mode:vertical-rl;transform:rotate(180deg)">DISCOVERY · 2026</div>
      </div>

      <div style="position:absolute;left:24px;right:24px;bottom:30px;z-index:3">
        <div id="dots" style="display:flex;gap:6px;margin-bottom:14px;align-items:center">${dots}</div>
        <div id="bars" style="display:flex;gap:5px;margin-bottom:18px">${bars}</div>
        <div id="heroText">${heroBlock(0,AVAIL)}</div>
      </div>
    </div>`:`<div style="position:relative;padding:110px 24px 70px;text-align:center;background:${C.surf};border-bottom:1px solid ${C.line}">
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px">
        <span style="width:18px;height:1px;background:${C.ember}"></span>
        <span style="font-family:${F.m};font-size:9.5px;letter-spacing:.28em;color:${C.amber}">// FLEET UPDATE</span>
        <span style="width:18px;height:1px;background:${C.ember}"></span>
      </div>
      <div style="font-family:${F.s};font-size:30px;line-height:1;color:${C.ink}">All machines offline</div>
      <div style="font-family:${F.g};font-size:13px;color:${C.faint};margin-top:8px;font-style:italic">Our fleet is being serviced — scroll to inspect any machine.</div>
    </div>`;
  return `<div style="background:${C.base}">
    ${heroSection}

    <div style="padding:30px 24px 6px">
      <div class="press" data-act="nav" data-to="routes" style="display:flex;align-items:center;gap:12px;padding:15px 18px;background:${C.surf};border:1px solid ${C.line};margin-bottom:32px;position:relative;overflow:hidden">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        <span style="font-family:${F.g};font-size:14px;color:${C.faint};flex:1">Search bikes, routes, cities…</span>
        <span style="font-family:${F.m};font-size:8.5px;letter-spacing:.22em;color:${C.faint};padding:4px 7px;background:${C.well};border:1px solid ${C.line}">⌘ K</span>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:20px">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="width:18px;height:1px;background:${C.ember}"></span>
            <span style="font-family:${F.m};font-size:9.5px;letter-spacing:.28em;color:${C.amber}">CURATED RIDES</span>
          </div>
          <div style="font-family:${F.s};font-size:30px;line-height:1">Legendary routes</div>
          <div style="font-family:${F.g};font-size:12px;color:${C.dim};margin-top:4px;font-style:italic">Four pilgrimages every rider owes themselves.</div>
        </div>
        <span class="press" data-act="nav" data-to="routes" style="font-family:${F.m};font-size:10px;letter-spacing:.18em;color:${C.sun};padding-bottom:4px">ALL ROUTES ›</span>
      </div>
    </div>

    <div class="noscroll" style="display:flex;gap:14px;overflow-x:auto;padding:0 24px 32px;scroll-snap-type:x mandatory;-webkit-overflow-scrolling:touch">
      ${ROUTES.map(r=>`<div class="press" data-act="route" data-id="${r.id}" style="position:relative;min-width:240px;height:300px;scroll-snap-align:start;overflow:hidden;border:1px solid ${C.line};flex-shrink:0;${bgImg(r.photo,r.grad)}">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,17,13,0) 0%,rgba(23,17,13,.15) 50%,rgba(23,17,13,.92) 100%)"></div>
        <div style="position:absolute;top:16px;left:16px;display:flex;gap:6px;align-items:center">
          <span style="padding:5px 10px;background:rgba(23,17,13,.7);border:1px solid ${C.line};backdrop-filter:blur(8px);font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.amber}">${r.terrain}</span>
          <span style="padding:5px 10px;background:rgba(23,17,13,.7);border:1px solid ${C.line};backdrop-filter:blur(8px);font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.dim}">${r.alt}</span>
        </div>
        <div style="position:absolute;top:18px;right:18px;font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint}">${String(ROUTES.indexOf(r)+1).padStart(2,'0')}</div>
        <div style="position:absolute;bottom:18px;left:18px;right:18px">
          <div style="font-family:${F.m};font-size:9px;letter-spacing:.24em;color:${C.amber};margin-bottom:4px">// ${r.region}</div>
          <div style="font-family:${F.s};font-size:28px;line-height:1.02;margin:4px 0 10px">${r.name}</div>
          <div style="display:flex;gap:14px;font-family:${F.m};font-size:10px;letter-spacing:.12em;color:${C.dim}"><span>${r.days} DAYS</span><span>·</span><span>${r.km} KM</span></div>
        </div></div>`).join('')}
    </div>

    <div style="padding:6px 24px 0">
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:18px">
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="width:18px;height:1px;background:${C.ember}"></span>
            <span style="font-family:${F.m};font-size:9.5px;letter-spacing:.28em;color:${C.amber}">// THE GARAGE</span>
          </div>
          <div style="font-family:${F.s};font-size:30px;line-height:1">${GARAGE.length} machine${GARAGE.length===1?'':'s'}</div>
          <div style="font-family:${F.g};font-size:12px;color:${C.dim};margin-top:4px;font-style:italic">Tap any machine to inspect the spec sheet.</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint}">FLEET STATUS</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:6px">
            <span style="width:7px;height:7px;border-radius:50%;background:${AVAIL.length?C.green:C.faint};box-shadow:0 0 6px ${AVAIL.length?C.green:C.faint}"></span>
            <span style="font-family:${F.g};font-weight:600;font-size:14px;color:${AVAIL.length?C.ink:C.faint}">${AVAIL.length} ready${AVAIL.length===GARAGE.length?'':' · '+(GARAGE.length-AVAIL.length)+' offline'}</span>
          </div>
        </div>
      </div>
    </div>
    <div style="padding:0 24px">
      ${GARAGE.map((b,i)=>{
        const offline=b.status==='maintenance'||b.status==='offline'||b.status==='retired';
        return `<div class="press" data-act="bike" data-id="${b.id}" style="display:flex;gap:16px;align-items:center;padding:16px 0;border-bottom:1px solid ${C.line2};position:relative;${offline?'opacity:.5;filter:grayscale(1);':''}">
        <div style="position:absolute;left:-24px;right:-24px;top:0;bottom:0;background:rgba(226,84,42,.04);opacity:0;transition:opacity .25s ease;pointer-events:none" class="garage-row-hover"></div>
        <div style="width:96px;height:72px;flex-shrink:0;overflow:hidden;border:1px solid ${C.line};position:relative;${bgImg(b.photo,b.grad)}">
          <div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 50%,rgba(23,17,13,.6))"></div>
          ${offline
            ?`<div style="position:absolute;top:6px;left:6px;padding:3px 6px;background:rgba(239,68,68,.18);border:1px solid rgba(239,68,68,.4);font-family:${F.m};font-size:8px;letter-spacing:.16em;color:${C.red}">OFFLINE</div>`
            :`<div style="position:absolute;top:6px;left:6px;padding:3px 6px;background:rgba(23,17,13,.7);font-family:${F.m};font-size:8px;letter-spacing:.16em;color:${C.amber}">${String(i+1).padStart(2,'0')}</div>`}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-family:${F.m};font-size:9px;letter-spacing:.2em;color:${C.faint}">${b.maker}</div>
          <div style="font-family:${F.s};font-size:22px;line-height:1.1;margin:2px 0 4px">${b.name}</div>
          <div style="display:flex;gap:8px;font-family:${F.m};font-size:9.5px;color:${C.dim};letter-spacing:.1em">
            <span>${b.kicker}</span><span style="color:${C.faint}">·</span><span>${b.power}</span><span style="color:${C.faint}">·</span><span style="color:${C.amber}">★</span><span style="color:${C.dim}">${b.rating}</span>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-family:${F.g};font-weight:600;font-size:17px;color:${offline?C.faint:C.sun}">${rupee(b.price)}</div>
          <div style="font-family:${F.m};font-size:9px;color:${C.faint};letter-spacing:.16em;margin-top:2px">${offline?'NOT AVAILABLE':'PER DAY'}</div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.6" style="margin-left:2px"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`;
      }).join('')}
    </div>

    <div style="text-align:center;padding:42px 24px 14px">
      <div style="font-family:${F.m};font-size:9px;letter-spacing:.4em;color:${C.faint};margin-bottom:6px">— RIDE FREE · RIDE FAR —</div>
      <div style="font-family:${F.s};font-size:14px;font-style:italic;color:${C.dim}">The road is calling.</div>
    </div>
  </div>`;
}

/* ---- live behaviour: crossfade slideshow, parallax, progress, swipe ---- */
function setHero(app,i,user){
  const AVAIL=BIKES.filter(b=>b.status==='available');
  if(!AVAIL.length)return;
  app.hi=i%AVAIL.length;const b=AVAIL[app.hi];
  const A=$('#hbgA'),B=$('#hbgB');
  if(A&&B){
    const showB=B.style.opacity!=='0'&&B.style.opacity!=='';
    const paint=showB?A:B,other=showB?B:A;
    paint.style.backgroundImage=`url('${b.photo}'),${b.grad}`;
    paint.style.opacity='1';other.style.opacity='0';
    /* parallax reset */
    paint.style.transform='scale(1.10) translateY(0px)';
    other.style.transform='scale(1.06) translateY(0px)';
    requestAnimationFrame(()=>{
      paint.style.transition='transform 4.8s cubic-bezier(.16,1,.3,1)';
      paint.style.transform='scale(1.16) translateY(-14px)';
    });
  }
  const txt=$('#heroText');
  if(txt){
    txt.style.animation='none';
    txt.offsetHeight;
    txt.innerHTML=heroBlock(app.hi,AVAIL);
    txt.style.animation='rise .55s cubic-bezier(.16,1,.3,1)';
  }
  const dots=document.querySelectorAll('.hdot');
  dots.forEach((d,k)=>{
    d.style.width=k===app.hi?'18px':'6px';
    d.style.background=k===app.hi?C.ink:'rgba(244,235,221,.3)';
  });
  AVAIL.forEach((_,k)=>{const f=document.querySelector('.hbarfill[data-i="'+k+'"]');if(!f)return;
    f.style.transition='none';f.style.width='0%';f.offsetHeight;
    if(k<app.hi){f.style.transition='none';f.style.width='100%';}
    else if(k>app.hi){f.style.transition='none';f.style.width='0%';}
    else{f.style.transition='width 4.8s linear';f.style.width='100%';}
  });
  if(user)startHeroTimer(app);
}
function startHeroTimer(app){
  if(app.heroIv)clearInterval(app.heroIv);
  const _avLen=BIKES.filter(b=>b.status==='available').length;
  if(!_avLen)return;
  app.heroIv=setInterval(()=>setHero(app,app.hi+1,false),4800);
  app.timers.push(app.heroIv);
}
function mountHome(app){
  app.hi=0;
  setHero(app,0,false);
  const hero=$('#hero');if(!hero)return;
  startHeroTimer(app);

  /* hover feedback for garage rows (press fallback on touch) */
  document.querySelectorAll('[data-act="bike"]').forEach(r=>{
    const hover=r.querySelector('.garage-row-hover');if(!hover)return;
    r.addEventListener('pointerenter',()=>{hover.style.opacity='1';});
    r.addEventListener('pointerleave',()=>{hover.style.opacity='0';});
  });

  /* swipe */
  let sx=0,sy=0,dragging=false;
  const _avLen=BIKES.filter(b=>b.status==='available').length||1;
  hero.addEventListener('pointerdown',e=>{if(e.target.closest('[data-act="herobar"]')||e.target.closest('[data-act="bike"]'))return;sx=e.clientX;sy=e.clientY;dragging=true;});
  hero.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)){if(dx<0)setHero(app,app.hi+1,true);else setHero(app,app.hi-1+_avLen,true);}});

  /* vertical parallax on scroll within hero (subtle) */
  const A=$('#hbgA'),B=$('#hbgB');
  hero.addEventListener('pointermove',e=>{
    if(!dragging||!A)return;
    const dy=e.clientY-sy;
    const t=`scale(1.16) translateY(${dy*0.15}px)`;
    if(B.style.opacity!=='0')B.style.transform=t;else A.style.transform=t;
  });
}
