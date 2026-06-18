# ASHVA — Pan-India Motorcycle & Gear Rental

Premium, cinematic mobile app prototype ("Golden Hour Highway"). One web codebase, wrapped
with **Capacitor** into real native **iOS** and **Android** apps.

## Layout

```
www/                     ← the app (source of truth). Open www/index.html in any browser too.
  index.html             ← shell: device frame, status bar, ordered <script> tags
  css/styles.css         ← keyframes + the html.native full-screen / safe-area rules
  js/
    data.js helpers.js   ← data + shared helpers/chrome
    screens/*.js         ← one file per screen (auth, home, detail, booking, gear, kyc,
                           payment, pass, routes, route, bookings, trip, garage, gsub)
    app.js               ← router / state machine
    native.js            ← Capacitor bridge: status bar, splash, Android back (no-op in browser)
capacitor.config.json    ← appId com.ashva.app · appName ASHVA · webDir www
ios/                     ← generated native Xcode project (Capacitor)
android/                 ← generated native Android Studio project (Capacitor)
REN/                     ← (unrelated) default SwiftUI Xcode template you created; not used by Capacitor
```

The phone frame is for the **desktop browser** only. Inside the native app `js/native.js`
adds `html.native`, so `.device` becomes the real full screen and the OS draws the status
bar + gesture pill (safe-area insets handle notch / Dynamic Island).

## Workflow

After any edit under `www/`, push it into the native projects:

```bash
npx cap sync          # copy web assets + update native plugins (both platforms)
# or just: npx cap copy
```

## Run — iOS  (verified building on this machine · Xcode 26.5)

```bash
npx cap run ios                 # pick a simulator/device, build + launch
# or open in Xcode:
npx cap open ios                # then ⌘R   (workspace: ios/App/App.xcworkspace)
```

Headless, what was verified here:
```bash
xcodebuild -workspace ios/App/App.xcworkspace -scheme App \
  -sdk iphonesimulator -configuration Debug \
  -destination 'generic/platform=iOS Simulator' build CODE_SIGNING_ALLOWED=NO
# => ** BUILD SUCCEEDED **  → installed + launched on iPhone 17 Pro simulator
```

## Run — Android  (this machine is missing the toolchain — install first)

Needs a **JDK 17** and **Android Studio** (SDK + platform-tools). Then:

```bash
# point the build at your SDK
export ANDROID_HOME="$HOME/Library/Android/sdk"
export JAVA_HOME="$(/usr/libexec/java_home -v 17)"   # or Android Studio's bundled JBR

npx cap run android             # pick an emulator/device
# or open in Android Studio:
npx cap open android            # then Run ▶
```

If you only have Android Studio: `npx cap open android` and let it install the matching
SDK + Gradle on first sync.

## Notes
- Native plugins used: `@capacitor/status-bar`, `@capacitor/splash-screen`, `@capacitor/app`.
- Real photos come from Unsplash via `background-image`, each layered over a per-bike/route
  gradient so a failed/blocked image never looks broken (offline → gradient carries it).
- Dev deep-link in the browser: `www/index.html#home` (or `#detail`, `#trip`, `#garage`…)
  jumps straight to a screen. `window.ashva` is the live router instance.
