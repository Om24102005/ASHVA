"use strict";
/* SCREEN · Admin Add New Bike
 *
 * The bottom submit button doubles as the upload progress bar: when a
 * photo is being uploaded (`app.s.photoBusyAssetId === 'add'`) the
 * button morphs into a width-driven progress bar driven by the XHR's
 * onprogress events. When the upload finishes the regular "ADD TO
 * FLEET" flow continues (POST to /admin/fleet) without the admin
 * needing to tap the button again.
 */

function viewAdminAddBike(app){
  const f=app.s.admin.addBike||{};
  const flash=app.s.flash;
  const preview=app.s.admin.photoPreview;
  const uploading = app.s.photoBusyAssetId === 'add';
  const pct = uploading ? (app.s.photoProgress || 0) : 0;

  const field=(id,label,placeholder,mode)=>`
    <div style="margin-bottom:14px">
      <div style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint};margin-bottom:6px">${label}</div>
      <input id="ab_${id}" inputmode="${mode||'text'}" placeholder="${placeholder}" value="${f[id]||''}"
        style="width:100%;box-sizing:border-box;background:${C.surf};border:1px solid ${C.line};padding:14px 16px;color:${C.ink};font-family:${F.g};font-size:15px;outline:none;-webkit-appearance:none">
    </div>`;

  /* While a photo is uploading we render a progress bar instead of
   * the static submit button. The bar is the same width as the bottom
   * button slot so the layout doesn't jump. We still show "ADD TO
   * FLEET" so the admin knows what's happening, with a percent
   * suffix. After the upload completes the screen re-renders and the
   * regular button reappears for the JSON POST. */
  const submitArea = uploading
    ? `<div style="position:fixed;bottom:0;left:0;right:0;max-width:390px;margin:0 auto;padding:16px 24px calc(16px + env(safe-area-inset-bottom));background:linear-gradient(transparent,#17110D 30%);z-index:35">
        <div style="position:relative;height:50px;background:${C.well};border:1px solid ${C.line};overflow:hidden">
          <div style="position:absolute;left:0;top:0;bottom:0;width:${pct}%;background:linear-gradient(90deg,${C.ember} 0%,${C.sun} 100%);transition:width .15s ease-out"></div>
          <div style="position:relative;z-index:1;height:100%;display:flex;align-items:center;justify-content:center;gap:8px;font-family:${F.m};font-size:11px;letter-spacing:.16em;color:#fff">
            <span style="display:inline-block;width:13px;height:13px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite"></span>
            UPLOADING PHOTO… ${pct}%
          </div>
        </div>
      </div>`
    : bottomBtn('ADD TO FLEET →','submitaddbike');

  return `<div style="padding-bottom:120px;background:${C.base}">
    ${topbar('ADD NEW BIKE')}

    <div style="padding:18px 24px 6px">
      ${eyebrow('// NEW ASSET',C.amber)}
      <div style="font-family:${F.s};font-size:28px;line-height:1;margin-top:6px">Add to fleet</div>
    </div>

    ${flash?`<div style="margin:0 24px 4px;padding:12px 16px;background:${flash.col}18;border:1px solid ${flash.col}44;font-family:${F.m};font-size:10px;letter-spacing:.14em;color:${flash.col};text-align:center">${flash.msg}</div>`:''}

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
      ${field('torque','TORQUE','e.g. 40 Nm')}
      ${field('topSpeed','TOP SPEED','e.g. 151 km/h')}
      ${field('weight','WEIGHT','e.g. 196 kg')}
      ${field('range','RANGE','e.g. 450 km')}

      <div style="height:1px;background:${C.line};margin:8px 0 20px"></div>
      ${eyebrow('// DESCRIPTION & FEATURES',C.sun)}
      <div style="height:12px"></div>
      <div style="margin-bottom:14px">
        <div style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint};margin-bottom:6px">ABOUT THIS BIKE</div>
        <textarea id="ab_about" placeholder="e.g. Built for the high passes, long-travel suspension…" rows="4"
          style="width:100%;box-sizing:border-box;background:${C.surf};border:1px solid ${C.line};padding:14px 16px;color:${C.ink};font-family:${F.g};font-size:15px;outline:none;-webkit-appearance:none;resize:vertical">${f.about||''}</textarea>
      </div>
      ${field('features','FEATURES (comma-separated)','e.g. Switchable ABS, TFT Display, Quickshifter')}

      <div style="height:1px;background:${C.line};margin:8px 0 20px"></div>
      ${eyebrow('// PRICING & MEDIA',C.sun)}
      <div style="height:12px"></div>
      ${field('pricePerDay','PRICE PER DAY (₹)','e.g. 1800','decimal')}

      <div style="margin-bottom:14px">
        <div style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint};margin-bottom:8px">PHOTO</div>
        ${preview?`<div style="width:100%;height:180px;overflow:hidden;border:1px solid ${C.line};margin-bottom:10px;background:${C.surf}">
          <img src="${preview}" style="width:100%;height:100%;object-fit:cover">
        </div>`:`<div style="width:100%;height:100px;border:1px dashed ${C.faint};display:flex;align-items:center;justify-content:center;margin-bottom:10px;background:${C.surf}">
          <span style="font-family:${F.m};font-size:9px;letter-spacing:.18em;color:${C.faint}">NO PHOTO SELECTED</span>
        </div>`}
        <input id="photoFileIn" type="file" accept="image/*" style="display:none">
        <label for="photoFileIn" class="press" style="display:flex;align-items:center;justify-content:center;gap:10px;padding:12px;background:${C.surf};border:1px solid ${C.line};cursor:pointer;margin-bottom:10px">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${C.dim}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
          <span style="font-family:${F.m};font-size:10px;letter-spacing:.18em;color:${C.dim}">${preview?'CHANGE PHOTO':'SELECT PHOTO'}</span>
        </label>
      </div>

      ${field('photoUrl','PHOTO URL (optional — fallback if no upload)','https://images.unsplash.com/…')}
    </div>

    ${submitArea}
  </div>`;
}
