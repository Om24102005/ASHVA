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
      // On iOS the plugin must use the iOS OAuth client (GIDClientID in Info.plist),
      // NOT the web client — Google rejects custom-scheme redirects for WEB clients.
      // So do NOT pass clientId here; let the native layer read GIDClientID. The web
      // client is still used server-side as serverClientId (capacitor.config) for token audience.
      G.initialize({ scopes: ['profile', 'email'], grantOfflineAccess: false });
    } catch (e) {
      /* ignore */
    }
  });
})();
