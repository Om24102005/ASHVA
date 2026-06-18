"use strict";
/* SCREEN · Home — auto-advancing swipeable hero, routes rail, garage list */

function heroText(i){const b=BIKES[i];
  const tile=(l,v)=>`<div style="flex:1;padding:9px 11px;background:rgba(23,17,13,.42);border:1px solid ${C.line};backdrop-filter:blur(6px)"><div style="font-family:${F.m};font-size:8.5px;letter-spacing:.1em;color:${C.faint}">${l}</div><div style="font-family:${F.g};font-weight:600;font-size:14px;margin-top:2px">${v}</div></div>`;
  return `<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:14px">
      <div>${eyebrow('// '+b.kicker+' · '+b.maker,C.amber)}
        <div style="font-family:${F.s};font-size:38px;line-height:1;margin:6px 0 4px">${b.name}</div>
        <div style="font-family:${F.g};font-size:13px;font-style:italic;color:${C.dim}">${b.tag}</div></div>
      <div style="text-align:right;flex-shrink:0"><div style="font-family:${F.g};font-weight:700;font-size:20px;color:${C.sun}">${rupee(b.price)}</div><div style="font-family:${F.m};font-size:9px;color:${C.dim}">${stars(b.rating)}</div></div>
    </div>
    <div style="display:flex;gap:7px;margin-bottom:14px">${tile('ENGINE',b.engine)}${tile('POWER',b.power)}${tile('RANGE',b.range)}</div>
    <div class="press" data-act="bike" data-id="${b.id}" style="text-align:center;padding:15px;background:${C.ember};color:#fff;font-family:${F.m};font-size:12px;letter-spacing:.18em">VIEW BIKE →</div>`;
}

function viewHome(app){
  const b=BIKES[0];
  const bars=BIKES.map((_,i)=>`<div class="press" data-act="herobar" data-i="${i}" style="flex:1;height:2.5px;background:rgba(244,235,221,.25);overflow:hidden"><div class="hbarfill" data-i="${i}" style="height:100%;width:0%;background:${C.ink}"></div></div>`).join('');
  return `<div>
    <div id="hero" style="position:relative;height:548px;overflow:hidden;touch-action:pan-y">
      <div id="hbgA" class="heroimg" style="${bgImg(b.photo,b.grad)}"></div>
      <div id="hbgB" class="heroimg" style="${bgImg(BIKES[1].photo,BIKES[1].grad)};opacity:0;transition:opacity .9s ease"></div>
      <div class="sweep"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,17,13,.55) 0%,transparent 22%,transparent 42%,rgba(23,17,13,.6) 72%,#17110D 99%)"></div>
      <div style="position:absolute;top:58px;left:24px;right:24px;display:flex;justify-content:space-between;align-items:center">
        <div style="display:flex;align-items:center;gap:9px">${crest(24)}<span style="font-family:${F.m};font-weight:700;letter-spacing:.36em;font-size:13px">ASHVA</span></div>
        <div style="display:flex;align-items:center;gap:7px;padding:7px 12px;background:rgba(23,17,13,.5);border:1px solid ${C.line};backdrop-filter:blur(8px)">
          <span style="width:7px;height:7px;border-radius:50%;background:${C.green};animation:pulse 1.8s infinite"></span>
          <span style="font-family:${F.m};font-size:10px;letter-spacing:.12em;color:${C.dim}">MANALI · HP</span></div>
      </div>
      <div style="position:absolute;left:24px;right:24px;bottom:30px">
        <div id="bars" style="display:flex;gap:5px;margin-bottom:18px">${bars}</div>
        <div id="heroText">${heroText(0)}</div>
      </div>
    </div>
    <div style="padding:22px 24px 10px">
      <div class="press" data-act="nav" data-to="routes" style="display:flex;align-items:center;gap:12px;padding:15px 18px;background:${C.surf};border:1px solid ${C.line};margin-bottom:30px">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.8" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        <span style="font-family:${F.g};font-size:14px;color:${C.faint}">Search bikes, routes, cities…</span></div>

      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px">
        <div>${eyebrow('CURATED RIDES')}<div style="font-family:${F.s};font-size:25px;margin-top:3px">Legendary routes</div></div>
        <span class="press" data-act="nav" data-to="routes" style="font-family:${F.m};font-size:10px;letter-spacing:.12em;color:${C.sun}">ALL ›</span>
      </div>
    </div>
    <div class="noscroll" style="display:flex;gap:14px;overflow-x:auto;padding:0 24px 30px;scroll-snap-type:x mandatory">
      ${ROUTES.map(r=>`<div class="press" data-act="route" data-id="${r.id}" style="position:relative;min-width:230px;height:290px;scroll-snap-align:start;overflow:hidden;border:1px solid ${C.line};${bgImg(r.photo,r.grad)}">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,17,13,.1),rgba(23,17,13,.85))"></div>
        <div style="position:absolute;top:14px;left:14px;padding:5px 9px;background:rgba(23,17,13,.6);border:1px solid ${C.line};font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.amber}">${r.terrain}</div>
        <div style="position:absolute;bottom:16px;left:16px;right:16px">
          ${eyebrow('// '+r.region,C.dim)}
          <div style="font-family:${F.s};font-size:26px;line-height:1.05;margin:4px 0 8px">${r.name}</div>
          <div style="display:flex;gap:14px;font-family:${F.m};font-size:10px;letter-spacing:.08em;color:${C.dim}"><span>${r.days} DAYS</span><span>${r.km} KM</span></div>
        </div></div>`).join('')}
    </div>

    <div style="padding:0 24px">
      <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:16px">
        <div>${eyebrow('// THE GARAGE')}<div style="font-family:${F.s};font-size:25px;margin-top:3px">Five machines</div></div>
        <span style="font-family:${F.m};font-size:10px;letter-spacing:.12em;color:${C.faint}">${BIKES.length} READY</span>
      </div>
      ${BIKES.map(b=>`<div class="press" data-act="bike" data-id="${b.id}" style="display:flex;gap:15px;align-items:center;padding:13px 0;border-bottom:1px solid ${C.line2}">
        <div style="width:84px;height:64px;flex-shrink:0;overflow:hidden;border:1px solid ${C.line};${bgImg(b.photo,b.grad)}"></div>
        <div style="flex:1;min-width:0">
          <div style="font-family:${F.m};font-size:9px;letter-spacing:.16em;color:${C.faint}">${b.maker}</div>
          <div style="font-family:${F.s};font-size:20px;line-height:1.1;margin:1px 0 3px">${b.name}</div>
          <div style="display:flex;gap:10px;font-family:${F.m};font-size:9.5px;color:${C.dim}"><span>${b.kicker}</span><span>·</span><span>${b.power}</span><span>·</span><span>${stars(b.rating)}</span></div>
        </div>
        <div style="text-align:right">
          <div style="font-family:${F.g};font-weight:600;font-size:16px;color:${C.sun}">${rupee(b.price)}</div>
          <div style="font-family:${F.m};font-size:9px;color:${C.faint};letter-spacing:.1em">PER DAY</div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.8" style="margin-left:4px"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>`).join('')}
    </div>
    <div style="text-align:center;padding:34px 24px 10px;font-family:${F.m};font-size:9px;letter-spacing:.3em;color:${C.faint}">— RIDE FREE · RIDE FAR —</div>
  </div>`;
}

/* ---- live behaviour: crossfade slideshow, progress bars, swipe ---- */
function setHero(app,i,user){
  app.hi=i;const b=BIKES[i];
  const A=$('#hbgA'),B=$('#hbgB');
  if(A&&B){
    const showA=B.style.opacity!=='0';            // if B visible, paint A next
    const paint=showA?A:B,other=showA?B:A;
    paint.style.backgroundImage=`url('${b.photo}'),${b.grad}`;
    paint.style.opacity='1';other.style.opacity='0';
  }
  const txt=$('#heroText');
  if(txt){txt.style.animation='none';txt.offsetHeight;txt.innerHTML=heroText(i);txt.style.animation='rise .6s cubic-bezier(.16,1,.3,1)';}
  BIKES.forEach((_,k)=>{const f=document.querySelector('.hbarfill[data-i="'+k+'"]');if(!f)return;
    if(k<i){f.style.transition='none';f.style.width='100%';}
    else if(k>i){f.style.transition='none';f.style.width='0%';}
    else{f.style.transition='none';f.style.width='0%';f.offsetHeight;f.style.transition='width 4.8s linear';f.style.width='100%';}
  });
  if(user)startHeroTimer(app);
}
function startHeroTimer(app){
  if(app.heroIv)clearInterval(app.heroIv);
  app.heroIv=setInterval(()=>setHero(app,(app.hi+1)%BIKES.length,false),4800);
  app.timers.push(app.heroIv);
}
function mountHome(app){
  app.hi=0;
  setHero(app,0,false);
  const hero=$('#hero');if(!hero)return;
  startHeroTimer(app);
  let sx=0,sy=0,dragging=false;
  hero.addEventListener('pointerdown',e=>{if(e.target.closest('[data-act="herobar"]')||e.target.closest('[data-act="bike"]'))return;sx=e.clientX;sy=e.clientY;dragging=true;});
  hero.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy)){if(dx<0)setHero(app,(app.hi+1)%BIKES.length,true);else setHero(app,(app.hi-1+BIKES.length)%BIKES.length,true);}});
}
