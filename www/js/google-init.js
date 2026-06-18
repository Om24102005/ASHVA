"use strict";
/* Initialize Capacitor GoogleAuth once the app loads. The web client ID comes
   from config.js (window.ASHVA.GOOGLE_WEB_CLIENT_ID). Native iOS/Android also
   read their client IDs from capacitor.config + Info.plist (see GOOGLE_SETUP.md).
   No-op (and harmless) if the plugin or client ID is absent. */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    try {
      var G = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.GoogleAuth;
      if (!G || !G.initialize) return;
      var cid = (window.ASHVA && window.ASHVA.GOOGLE_WEB_CLIENT_ID) || undefined;
      G.initialize({ clientId: cid, scopes: ['profile', 'email'], grantOfflineAccess: false });
    } catch (e) {
      /* ignore */
    }
  });
})();
