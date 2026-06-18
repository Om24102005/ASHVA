/**
 * Runtime config. The API base comes from an environment variable baked at
 * build time (EXPO_PUBLIC_API_URL), so the app talks to ONE stable cloud URL
 * regardless of which Wi-Fi / hotspot / cellular network the phone is on.
 *
 * Set it in ashva-rn/.env:
 *     EXPO_PUBLIC_API_URL=https://api.ashva.app
 *
 * For local dev against a tunnel you can point it at an ngrok/cloudflared URL.
 * There is intentionally NO LAN IP fallback — that is exactly what caused the
 * "works on my network only" failures.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL?.trim();

if (!API_URL) {
  // Loud in dev, harmless in prod builds where the var is always set.
  console.warn(
    '[ASHVA] EXPO_PUBLIC_API_URL is not set. Create ashva-rn/.env with your cloud API URL.',
  );
}

export const CONFIG = {
  API: API_URL || 'https://ashva-api.onrender.com',
  GOOGLE_WEB_CLIENT_ID:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    '994367484524-mbck2l7i6656411ki3l0nrtfjq817dev.apps.googleusercontent.com',
};
