"use strict";
/* SCREEN · Admin Fleet Management
 *
 * The "camera" button on each card (`data-act="fltedit"`) opens a hidden
 * file picker (rendered once at the bottom of the screen). The chosen
 * file is uploaded to /admin/fleet/:id/photo, the row's photo_url is
 * updated server-side, and the SSE bus fires an 'asset' event so any
 * connected user panel refreshes the photo immediately.
 *
 * While a photo upload is in flight (`app.s.photoBusyAssetId` matches
 * the card's id) the action button is replaced with a real progress
 * bar fed by the XHR's onprogress event. The percentage the user sees
 * is `app.s.photoProgress` (integer 0-100), throttled to ~5% updates
 * in `app.setBikePhoto()` to avoid DOM thrash.
 */

function viewAdminFleet(app){
  const fleet=app.s.admin.fleet;

  function statusBadge(s){
    if(s==='available')return {dot:C.green,label:'AVAILABLE',col:C.green};
    if(s==='booked')return {dot:C.amber,label:'BOOKED',col:C.amber};
    if(s==='maintenance')return {dot:C.red,label:'OFFLINE',col:C.red};
    return {dot:C.faint,label:s.toUpperCase(),col:C.faint};
  }

  /* Per-card photo thumbnail. Uses the same `bgImg` cinematic layering
   * the user app uses on the home/garage rows so the look stays
   * consistent. When there's no photo yet we fall back to a dark
   * gradient with a "no photo" hint so the admin can tell at a glance
   * which bikes still need a real picture. While a photo is uploading
   * we overlay a backdrop-blurred spinner so the old photo stays
   * visible underneath (no jarring flash to a blank thumbnail). */
  function photoThumb(asset){
    const url=asset.photo_url;
    const has=!!(url&&String(url).trim());
    const isBusy=String(app.s.photoBusyAssetId||'')===String(asset.id);
    const styleBg=has?bgImg(url,'linear-gradient(160deg,#2a1e14,#17110D)'):'linear-gradient(160deg,#1c1610,#0f0b08)';
    return `<div style="position:relative;flex-shrink:0;width:84px;height:64px;border:1px solid ${C.line};background:${styleBg};background-size:cover;background-position:center;overflow:hidden">
      ${!has?`<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;font-family:${F.m};font-size:7.5px;letter-spacing:.18em;color:${C.faint}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
        NO PHOTO
      </div>`:''}
      ${isBusy?`<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(23,17,13,.55);backdrop-filter:blur(2px)">
        <span style="display:inline-block;width:18px;height:18px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite"></span>
      </div>`:''}
    </div>`;
  }

  /* The action button while a photo is uploading. Width-driven progress
   * bar (rendered as an inset <div> that grows from 0% to 100%) plus a
   * percentage label. The bar is a child of the button so it lays out
   * naturally without absolute positioning, and the percentage text
   * sits on top via a higher z-index. */
  function uploadProgress(pct){
    const p = Math.max(0, Math.min(100, Number(pct) || 0));
    return `<div style="position:relative;flex:1;height:38px;background:${C.well};border:1px solid ${C.line};overflow:hidden">
      <div style="position:absolute;left:0;top:0;bottom:0;width:${p}%;background:linear-gradient(90deg,${C.ember} 0%,${C.sun} 100%);transition:width .15s ease-out"></div>
      <div style="position:relative;z-index:1;height:100%;display:flex;align-items:center;justify-content:center;gap:8px;font-family:${F.m};font-size:10px;letter-spacing:.16em;color:#fff">
        <span style="display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite"></span>
        UPLOADING… ${p}%
      </div>
    </div>`;
  }

  return `<div style="padding-bottom:120px;background:${C.base}">
    ${topbar('FLEET MANAGEMENT',`<div class="press" data-act="reload" style="width:36px;height:36px;display:flex;align-items:center;justify-content:center"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${C.dim}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></div>`)}

    <div style="padding:18px 24px 8px">
      ${eyebrow('// ALL BIKES',C.amber)}
      <div style="font-family:${F.g};font-size:12px;color:${C.faint};margin-top:4px">Toggle availability · change photo</div>
    </div>

    ${!fleet?`<div style="padding:60px 24px;text-align:center;font-family:${F.m};font-size:11px;letter-spacing:.18em;color:${C.faint}">LOADING FLEET…</div>`:
    fleet.length===0?`<div style="padding:60px 24px;text-align:center;font-family:${F.g};font-size:14px;color:${C.faint}">No bikes in fleet.</div>`:
    `<div style="padding:0 24px;display:flex;flex-direction:column;gap:10px">
      ${fleet.map(a=>{
        const sb=statusBadge(a.status);
        const specs=a.specs||{};
        const busy=String(app.s.photoBusyAssetId||'')===String(a.id);
        const pct = busy ? (app.s.photoProgress || 0) : 0;
        return `<div style="background:${C.surf};border:1px solid ${C.line};padding:16px">
          <div style="display:flex;align-items:flex-start;gap:14px">
            ${photoThumb(a)}
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <div style="width:8px;height:8px;border-radius:50%;background:${sb.dot}"></div>
                <span style="font-family:${F.m};font-size:8px;letter-spacing:.2em;color:${sb.col}">${sb.label}</span>
                ${a.status==='available'||a.status==='maintenance'?`<span style="font-family:${F.m};font-size:8px;color:${C.faint};margin-left:auto">${a.slug}</span>`:''}
              </div>
              <div style="font-family:${F.m};font-size:9px;letter-spacing:.14em;color:${C.faint}">${a.maker||'—'}</div>
              <div style="font-family:${F.s};font-size:20px;line-height:1.1">${a.name}</div>
              <div style="font-family:${F.g};font-size:12px;color:${C.dim};margin-top:3px">
                ${[specs.engine,specs.power,specs.range].filter(Boolean).join(' · ')||a.type}
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div style="font-family:${F.g};font-weight:600;color:${C.sun}">${rupee(Number(a.price_per_day))}</div>
              <div style="font-family:${F.m};font-size:8px;color:${C.faint}">/DAY</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;margin-top:14px">
            ${busy
              ?uploadProgress(pct)
              :a.status==='available'?
              `<div class="press" data-act="flttoggle" data-id="${a.id}" data-to="maintenance" style="flex:1;text-align:center;padding:10px;background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.red}">SET OFFLINE</div>`:
              a.status==='maintenance'?
              `<div class="press" data-act="flttoggle" data-id="${a.id}" data-to="available" style="flex:1;text-align:center;padding:10px;background:rgba(46,160,67,.1);border:1px solid rgba(46,160,67,.3);font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.green}">SET AVAILABLE</div>`:
              `<div style="flex:1;text-align:center;padding:10px;background:${C.well};border:1px solid ${C.line};font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${C.faint}">${a.status.toUpperCase()}</div>`
            }
            <div class="press" data-act="fltedit" data-id="${a.id}" title="Change photo" style="width:44px;display:flex;align-items:center;justify-content:center;background:${C.well};border:1px solid ${C.line};${busy?'opacity:.5;pointer-events:none':''}">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="${C.faint}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`}

    ${bottomBtn('+ ADD NEW BIKE','adminaddbike')}

    <!-- The per-card photo picker is now created on demand by
         openCardPhotoPicker() in app.js (a fresh <input type="file">
         built per click, with a one-shot change handler). No more
         long-lived hidden input in the DOM, which avoids the
         iOS WebView bug where the second pick silently does nothing. -->
  </div>`;
}
