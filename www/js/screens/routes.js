"use strict";
/* SCREEN · Routes list — large photo route cards */

function viewRoutes(app){
  return `<div style="padding:64px 0 0">
    <div style="padding:0 24px 8px">${eyebrow('// EXPEDITIONS')}<h1 style="font-family:${F.s};font-size:38px;line-height:1.02;margin-top:4px">Curated<br><span style="font-style:italic;color:${C.ember}">routes.</span></h1>
      <p style="font-family:${F.g};font-size:13px;color:${C.dim};margin-top:10px;line-height:1.5">Four rides, hand-mapped by ASHVA scouts. Bike, gear and permits sorted.</p></div>
    <div style="padding:22px 24px;display:flex;flex-direction:column;gap:16px">
      ${ROUTES.map((r,i)=>`<div class="press stg" data-act="route" data-id="${r.id}" style="animation-delay:${.05*i}s;position:relative;height:230px;overflow:hidden;border:1px solid ${C.line};${bgImg(r.photo,r.grad)}">
        <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,17,13,0) 0%,rgba(23,17,13,.05) 35%,rgba(23,17,13,.65) 72%,rgba(23,17,13,.92) 100%)"></div>
        <div class="sweep"></div>
        <div style="position:absolute;top:16px;left:16px;display:flex;gap:8px">
          <span style="padding:5px 10px;background:rgba(23,17,13,.55);border:1px solid ${C.line};font-family:${F.m};font-size:9px;letter-spacing:.12em;color:${C.amber}">${r.terrain}</span>
          ${r.alt!=='Sea level'?`<span style="padding:5px 10px;background:rgba(23,17,13,.55);border:1px solid ${C.line};font-family:${F.m};font-size:9px;letter-spacing:.12em;color:${C.dim}">▲ ${r.alt}</span>`:''}
        </div>
        <div style="position:absolute;bottom:18px;left:18px;right:18px">
          ${eyebrow('// '+r.region,C.dim)}
          <div style="font-family:${F.s};font-size:32px;line-height:1;margin:5px 0 10px">${r.name}</div>
          <div style="display:flex;gap:18px;font-family:${F.m};font-size:10px;letter-spacing:.06em;color:${C.dim}"><span>${r.days} DAYS</span><span>${r.km} KM</span><span>${r.bikes.length} BIKES</span></div>
        </div></div>`).join('')}
    </div></div>`;
}
