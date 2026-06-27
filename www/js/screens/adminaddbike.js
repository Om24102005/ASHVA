"use strict";
/* SCREEN · Admin Add New Bike */

function viewAdminAddBike(app){
  const f=app.s.admin.addBike||{};
  const field=(id,label,placeholder,mode)=>`
    <div style="margin-bottom:14px">
      <div style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint};margin-bottom:6px">${label}</div>
      <input id="ab_${id}" inputmode="${mode||'text'}" placeholder="${placeholder}" value="${f[id]||''}"
        style="width:100%;box-sizing:border-box;background:${C.surf};border:1px solid ${C.line};padding:14px 16px;color:${C.ink};font-family:${F.g};font-size:15px;outline:none;-webkit-appearance:none">
    </div>`;

  return `<div style="padding-bottom:120px;background:${C.base}">
    ${topbar('ADD NEW BIKE')}

    <div style="padding:18px 24px 6px">
      ${eyebrow('// NEW ASSET',C.amber)}
      <div style="font-family:${F.s};font-size:28px;line-height:1;margin-top:6px">Add to fleet</div>
    </div>

    <div style="padding:18px 24px">
      <div style="height:1px;background:${C.line};margin-bottom:20px"></div>
      ${eyebrow('// IDENTITY',C.sun)}
      <div style="height:12px"></div>
      ${field('maker','MANUFACTURER','e.g. ROYAL ENFIELD')}
      ${field('name','MODEL NAME','e.g. Himalayan 450')}
      ${field('kicker','KICKER TAG','e.g. ADVENTURE')}

      <div style="height:1px;background:${C.line};margin:8px 0 20px"></div>
      ${eyebrow('// SPECS',C.sun)}
      <div style="height:12px"></div>
      ${field('engine','ENGINE','e.g. 452cc')}
      ${field('power','POWER','e.g. 40 bhp')}
      ${field('range','RANGE','e.g. 450 km')}

      <div style="height:1px;background:${C.line};margin:8px 0 20px"></div>
      ${eyebrow('// PRICING & MEDIA',C.sun)}
      <div style="height:12px"></div>
      ${field('pricePerDay','PRICE PER DAY (₹)','e.g. 1800','decimal')}
      ${field('photoUrl','PHOTO URL','https://images.unsplash.com/…')}
    </div>

    ${bottomBtn('ADD TO FLEET →','submitaddbike')}
  </div>`;
}
