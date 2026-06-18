"use strict";
/* ============================================================
   ASHVA · native bridge (Capacitor)
   Detects iOS / Android native shell and wires:
   - body class for full-screen + safe-area CSS
   - StatusBar style (light icons on the espresso canvas)
   - SplashScreen hide on ready
   - Android hardware / gesture BACK -> router back()/exit
   On the desktop browser this is a no-op (keeps the phone frame).
   ============================================================ */
(function(){
  const Cap = window.Capacitor;
  const isNative = !!(Cap && Cap.isNativePlatform && Cap.isNativePlatform());
  const plat = (Cap && Cap.getPlatform && Cap.getPlatform()) || 'web';
  const root = document.documentElement;
  root.classList.add('plat-' + plat);
  if(!isNative){ return; }            // desktop / plain web -> framed preview, nothing to do
  root.classList.add('native');

  const P = (Cap && Cap.Plugins) || {};
  const run = ()=>{
    // status bar: light content over the dark canvas; let it overlay on Android too
    try{
      if(P.StatusBar){
        P.StatusBar.setStyle({ style:'DARK' });          // Dark = light icons (for dark bg)
        if(plat === 'android'){
          P.StatusBar.setOverlaysWebView({ overlay:true });
          if(P.StatusBar.setBackgroundColor) P.StatusBar.setBackgroundColor({ color:'#00000000' });
        }
      }
    }catch(e){}
    // dismiss native splash only AFTER the first frame paints (no blank flash)
    try{
      if(P.SplashScreen && P.SplashScreen.hide){
        requestAnimationFrame(()=>requestAnimationFrame(()=>{ try{ P.SplashScreen.hide(); }catch(e){} }));
      }
    }catch(e){}
    // Android hardware/gesture back -> in-app navigation, exit only at a root tab
    try{
      if(P.App && P.App.addListener){
        P.App.addListener('backButton', ()=>{
          const a = window.ashva;
          if(a && a.s.stack && a.s.stack.length){ a.back(); }
          else if(a && a.s.screen !== 'home' && a.s.screen !== 'auth'){ a.tab('home'); }
          else if(P.App.exitApp){ P.App.exitApp(); }
        });
      }
    }catch(e){}
  };
  if(document.readyState !== 'loading') run();
  else document.addEventListener('DOMContentLoaded', run);
})();
