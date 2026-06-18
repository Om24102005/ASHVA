#!/usr/bin/env bash
# Repoint ASHVA at the Mac's CURRENT Wi-Fi IP (run whenever the network/IP changes),
# restart the API, and re-sync iOS. After this, rebuild once in Xcode (▶).
set -e
cd "$(cd "$(dirname "$0")" && pwd)"
IP="$(ipconfig getifaddr en0)"; [ -z "$IP" ] && IP="$(ipconfig getifaddr en1)"
[ -z "$IP" ] && { echo "No Wi-Fi IP — connect to Wi-Fi (or iPhone hotspot) and retry."; exit 1; }
echo "Repointing to $IP ..."
/usr/bin/sed -i '' -E "s|http://[0-9.]+:4000|http://$IP:4000|" www/js/config.js
/usr/bin/sed -i '' -E "s|http://[0-9.]+:5500|http://$IP:5500|" capacitor.config.json
/usr/bin/sed -i '' -E "s|^S3_PUBLIC_URL=.*|S3_PUBLIC_URL=http://$IP:9000|" server/.env
( cd server && docker compose --env-file .env up -d >/dev/null 2>&1 ) && echo "  api restarted"
npx cap sync ios >/dev/null 2>&1 && echo "  ios synced"
echo "Done -> http://$IP:4000 (api) · http://$IP:5500 (web)."
echo "Now: keep 'npm run dev' running, and rebuild in Xcode (Stop ▶ then ▶)."
