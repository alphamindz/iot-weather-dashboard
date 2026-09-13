# Weather Monitor ESP32 — Next.js + Firebase Dashboard

Real-time dashboard for an ESP32 weather station. The ESP32 pushes sensor
readings straight to Firebase Realtime Database — no Node.js server in the
middle — and this Next.js dashboard listens for changes live.

## Architecture

```
ESP32 sensors → ESP32 (WiFi) → Firebase Realtime Database → Next.js dashboard
                                          │
                                          └→ Cloud Function (alert thresholds)
```

- **ESP32 → Firebase**: direct writes via the `Firebase-ESP-Client` Arduino library — see `firmware/weather_station.ino`.
- **Firebase Realtime Database**: source of truth. `onValue()` listeners push every change to connected clients over a WebSocket, sub-second.
- **Cloud Functions**: `functions/index.js` watches `/sensorData` and raises an alert (logged + written to `/alerts`) on heavy rain or extreme UV — wire it up to email/push from there.
- **Next.js dashboard**: static-exported (`output: "export"`), so it deploys as plain files to Firebase Hosting. No API routes needed since the browser talks to Firebase directly.

## Expected database shape

```
/sensorData                → { temperature, humidity, windSpeed, uvIndex, rainfall, timestamp }
/status/esp32/online       → boolean
/status/esp32/lastSeen     → epoch ms
/history/<pushId>          → same shape as /sensorData, one entry per periodic push (feeds the trend chart)
/alerts/<pushId>           → written by the Cloud Function when a threshold is crossed
```

## Setup

1. **Create a Firebase project** at https://console.firebase.google.com, then enable:
   - **Realtime Database** (start in locked mode; rules are provided in `database.rules.json`)
   - **Authentication → Email/Password** (for the device account — see firmware notes below)

2. **Get your web app config**: Project settings → General → Your apps → Add app (Web). Copy the config values into `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

3. **Install dependencies and run**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000. It'll show "waiting for the first reading" until something writes to `/sensorData`.

4. **Flash the ESP32** — open `firmware/weather_station.ino` in Arduino IDE:
   - Install the **Firebase ESP Client** library (by mobizt) via Library Manager.
   - Fill in your WiFi credentials, Firebase API key, and database URL.
   - Create a dedicated Firebase Auth user for the device (Console → Authentication → Add user) and put its email/password in the sketch — don't reuse a personal login. The database rules require `auth != null` to write, so the device needs to sign in.
   - Replace `readSensors()` with your actual sensor code (DHT22 for temp/humidity, a tipping-bucket rain gauge on an interrupt, an anemometer for wind, a GUVA-S12SD or similar for UV — whatever you've wired up).

5. **Deploy Cloud Functions** (optional but recommended for alerts)
   ```bash
   npm install -g firebase-tools
   firebase login
   cp .firebaserc.example .firebaserc   # edit with your project id
   cd functions && npm install && cd ..
   firebase deploy --only functions
   ```

6. **Deploy the dashboard to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel --prod
   ```
   Add the same `NEXT_PUBLIC_FIREBASE_*` variables from `.env.local` under Project Settings → Environment Variables on Vercel (or via `vercel env add`), then redeploy. (`npm run deploy` runs `vercel --prod` directly.)

   The Firebase side (Realtime Database + Cloud Functions) stays on Firebase regardless of where the frontend is hosted — only the dashboard itself moves to Vercel.

## Security notes

- `database.rules.json` allows public **read** access (so the dashboard works without login) but requires **auth** to write — only the ESP32's device account (or your Cloud Functions, which use the Admin SDK and bypass rules entirely) can push data.
- Don't commit `.env.local` or hardcode real WiFi/Firebase credentials into the firmware file before sharing it — the placeholders are there for a reason.

## Roadmap

- **Graphs / Alerts / Settings pages** — the reference screenshot has bottom-nav tabs; this build is the single Dashboard tab. The others (a deeper history browser, an alerts feed reading `/alerts`, threshold config) are natural next screens.
- **Push notifications**: extend the Cloud Function to call FCM or an email API (SendGrid/Mailgun) instead of just logging.
- **NTP time sync on the ESP32**: the sketch currently timestamps with `millis()`; swap in `configTime()` + NTP for real wall-clock timestamps.
- **Multiple devices**: namespace the DB paths by device ID (`/devices/<id>/sensorData`) if you add a second station.
