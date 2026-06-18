# ASHVA — Google Sign-In setup

Email + phone OTP work with no extra setup. Google needs your own OAuth client
IDs from Google Cloud (I can't create those). Wiring is done — you just fill 4
placeholders, then `cap sync`.

## 1. Get OAuth client IDs (Google Cloud Console)
1. https://console.cloud.google.com → APIs & Services → **OAuth consent screen** (set it up once, External, add your email as a test user).
2. **Credentials → Create credentials → OAuth client ID**, create three:
   - **Web application** → gives you a **Web client ID** (used to verify ID tokens).
   - **iOS** → bundle id `com.ashva.app` → gives an **iOS client ID** (and its reversed form).
   - **Android** → package `com.ashva.app` + your signing SHA-1 → **Android client ID**.

## 2. Fill the 4 placeholders

| Where | Key | Put |
|---|---|---|
| [www/js/config.js](www/js/config.js) | `GOOGLE_WEB_CLIENT_ID` | **Web** client ID |
| [capacitor.config.json](capacitor.config.json) | `plugins.GoogleAuth.serverClientId` | **Web** client ID |
| [ios/App/App/Info.plist](ios/App/App/Info.plist) | `GIDClientID` | **iOS** client ID (`xxxx.apps.googleusercontent.com`) |
| [ios/App/App/Info.plist](ios/App/App/Info.plist) | `CFBundleURLSchemes` | **reversed** iOS client ID (`com.googleusercontent.apps.xxxx`) |
| `server/.env` | `GOOGLE_CLIENT_IDS` | all 3, comma-separated: `WEB,IOS,ANDROID` |

> The reversed iOS client ID = take `123-abc.apps.googleusercontent.com` → `com.googleusercontent.apps.123-abc`.

## 3. Apply + rebuild
```bash
cd /Users/omendarsingh/REN
npx cap sync ios

cd server
docker compose --env-file .env up -d   # picks up GOOGLE_CLIENT_IDS

cd ..
npx cap open ios                        # rebuild on your iPhone
```

## How it flows
Tap **Continue with Google** → native Google sheet → the app gets an **ID token**
→ POSTs it to `/auth/signin/google` → the server **verifies** it against
`GOOGLE_CLIENT_IDS` → issues your ASHVA session → gatekeeper forces phone next.

Until the placeholders are filled, the button shows *"Google sign-in needs setup —
use email or phone"* (no crash).
