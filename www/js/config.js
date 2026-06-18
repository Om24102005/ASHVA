"use strict";
/* ASHVA runtime config.
   Point this at your running backend.
   - iOS Simulator:   http://localhost:4000
   - Physical iPhone: your Mac's LAN IP, e.g. http://192.168.1.15:4000
   (find it: `ipconfig getifaddr en0`)
   Optionally set GOOGLE_WEB_CLIENT_ID for Capacitor Google sign-in. */
window.ASHVA = {
  API: 'http://172.20.10.3:4000',
  GOOGLE_WEB_CLIENT_ID: '994367484524-mbck2l7i6656411ki3l0nrtfjq817dev.apps.googleusercontent.com'
};
