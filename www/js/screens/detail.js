"use strict";
/* SCREEN · Bike Detail — hero, 6-cell spec grid, about, features, included
 *
 * Availability rules (server status values: 'available' | 'booked' |
 * 'maintenance' | 'retired'):
 *   • 'maintenance' / 'offline' / 'retired' → CTA becomes a disabled
 *     "NOT AVAILABLE" block with no data-act so the click handler can't
 *     fire, and pointer-events:none for touch users.
 *   • Anything else ("available" / "booked") → keep the existing orange
 *     "CONFIGURE THIS BIKE →" CTA that opens the booking flow.
 *
 * Resilience rules (so a newly-admin-added bike never falls into a
 * silently-broken state):
 *   • Every section is always rendered, even if its backing field is
 *     empty. We show a "coming soon" placeholder instead of dropping
 *     the section — admins can tell at a glance which fields are
 *     unfilled, and users never see a half-empty page.
 *   • Missing `b.photo` falls back to a visible "PHOTO COMING SOON"
 *     badge over the gradient (instead of a silent dark slab). The
 *     hero gradient is always present.
 *   • `b.about` missing → "Description coming soon." in the same
 *     paragraph style.
 *   • `b.features` empty → a single styled placeholder pill instead of
 *     the previous "Details coming soon." inline text. */

function viewDetail(app){
  const b=bike(app.s.bikeId);
  const fav=app.s.fav.has(b.id);
  const isUnavailable=b.status==='offline'||b.status==='maintenance'||b.status==='retired';
  const hasPhoto=!!(b.photo&&String(b.photo).trim());
  const hasAbout=!!(b.about&&String(b.about).trim());
  const feats=Array.isArray(b.features)?b.features.filter(f=>f&&String(f).trim()):[];
  const hasFeatures=feats.length>0;
  const cell=(l,v)=>`<div style="padding:16px 14px;background:${C.surf};border:1px solid ${C.line2}"><div style="font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.faint}">${l}</div><div style="font-family:${F.g};font-weight:600;font-size:18px;margin-top:4px">${v||'—'}</div></div>`;
  return `<div style="padding-bottom:120px">
    <div style="position:relative;height:430px;overflow:hidden">
      <div class="heroimg" style="${hasPhoto?bgImg(b.photo,b.grad):'background:'+b.grad}"></div>
      ${!hasPhoto?`<div style="position:absolute;top:24px;right:24px;display:flex;align-items:center;gap:6px;padding:7px 12px;background:rgba(23,17,13,.7);border:1px solid ${C.amber}66;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);font-family:${F.m};font-size:9px;letter-spacing:.22em;color:${C.amber}">
        <span style="width:6px;height:6px;border-radius:50%;background:${C.amber}"></span>
        PHOTO COMING SOON
      </div>`:''}
      <div class="sweep"></div>
      <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(23,17,13,.5),transparent 35%,transparent 55%,#17110D)"></div>
      <div style="position:absolute;top:56px;left:20px;right:20px;display:flex;justify-content:space-between">
        <div class="press" data-act="back" style="width:44px;height:44px;border:1px solid ${C.line};display:flex;align-items:center;justify-content:center;background:rgba(23,17,13,.5);backdrop-filter:blur(8px)">${chevL()}</div>
        <div class="press" data-act="fav" data-id="${b.id}" style="width:44px;height:44px;border:1px solid ${C.line};display:flex;align-items:center;justify-content:center;background:rgba(23,17,13,.5);backdrop-filter:blur(8px)">${heart(fav)}</div>
      </div>
      <div style="position:absolute;bottom:24px;left:24px;right:24px">
        ${eyebrow('// '+(b.kicker||'MACHINE')+' · '+(b.maker||'—'),C.amber)}
        <div style="font-family:${F.s};font-size:44px;line-height:1;margin:6px 0 4px">${b.name||'—'}</div>
        <div style="font-family:${F.g};font-size:14px;font-style:italic;color:${C.dim}">${b.tag||''}</div>
      </div>
    </div>
    <div style="padding:6px 24px 0">
      <div style="display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid ${C.line};font-family:${F.m};font-size:11px;letter-spacing:.08em;color:${C.dim}">
        <span>${stars(b.rating)}</span><span style="color:${C.faint}">·</span><span>${b.rides||0} RIDES</span><span style="color:${C.faint}">·</span>
        ${isUnavailable
          ?`<span style="display:flex;align-items:center;gap:6px;color:${C.red}"><span style="width:7px;height:7px;border-radius:50%;background:${C.red}"></span>NOT AVAILABLE</span>`
          :`<span style="display:flex;align-items:center;gap:6px;color:${C.green}"><span style="width:7px;height:7px;border-radius:50%;background:${C.green};animation:pulse 1.8s infinite"></span>AVAILABLE</span>`}
      </div>
      <div class="stg" style="animation-delay:.05s;display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin:22px 0">
        ${cell('ENGINE',b.engine)}${cell('POWER',b.power)}${cell('TORQUE',b.torque)}${cell('TOP SPEED',b.top)}${cell('WEIGHT',b.weight)}${cell('RANGE',b.range)}
      </div>
      <div class="stg" style="animation-delay:.1s">
        ${eyebrow('// ABOUT THIS MACHINE',C.sun)}
        ${hasAbout
          ?`<p style="font-family:${F.g};font-size:15px;line-height:1.65;color:${C.dim};margin:12px 0 26px">${b.about}</p>`
          :`<p style="font-family:${F.g};font-size:14px;line-height:1.65;color:${C.faint};margin:12px 0 26px;font-style:italic">Description coming soon.</p>`}
      </div>
      <div class="stg" style="animation-delay:.15s">
        ${eyebrow('// EQUIPPED',C.sun)}
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 26px">
          ${hasFeatures
            ?feats.map(f=>`<span style="padding:9px 14px;background:${C.surf};border:1px solid ${C.line};font-family:${F.m};font-size:10.5px;letter-spacing:.06em;color:${C.dim}">${f}</span>`).join('')
            :`<span style="padding:9px 14px;background:${C.surf};border:1px dashed ${C.line};font-family:${F.m};font-size:10.5px;letter-spacing:.06em;color:${C.faint}">No features listed yet.</span>`}
        </div>
      </div>
      <div class="stg" style="animation-delay:.2s">${eyebrow('// INCLUDED FREE',C.sun)}
        <div style="margin:14px 0 10px">${INCLUDED.map(x=>`<div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid ${C.line2}">${check()}<span style="font-family:${F.g};font-size:14px;color:${C.ink}">${x}</span></div>`).join('')}</div></div>
    </div>
    <div style="position:fixed;bottom:0;left:0;right:0;max-width:390px;margin:0 auto;padding:16px 24px calc(30px + env(safe-area-inset-bottom));background:linear-gradient(transparent,#17110D 30%);display:flex;align-items:center;gap:16px;z-index:35">
      <div><div style="font-family:${F.g};font-weight:700;font-size:24px;color:${C.sun}">${rupee(b.price)}<span style="font-size:12px;color:${C.faint};font-weight:400"> /day</span></div></div>
      ${isUnavailable
        /* Disabled CTA: no data-act so the global click handler ignores it,
           pointer-events:none so taps fall through, dimmed styling to make
           the disabled state visually obvious. */
        ?`<div aria-disabled="true" style="flex:1;text-align:center;padding:17px;background:${C.surf};border:1px solid ${C.line};color:${C.faint};font-family:${F.m};font-size:12px;letter-spacing:.16em;pointer-events:none;cursor:not-allowed;opacity:.7">NOT AVAILABLE</div>`
        :`<div class="press" data-act="configure" data-id="${b.id}" style="flex:1;text-align:center;padding:17px;background:${C.ember};color:#fff;font-family:${F.m};font-size:12px;letter-spacing:.16em">CONFIGURE THIS BIKE →</div>`}
    </div>
  </div>`;
}
