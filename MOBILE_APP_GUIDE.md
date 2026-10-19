# 📱 BAGm Beauty Supply — Mobile App Setup & Deployment Guide

BAGm Beauty Supply is configured to run as both a **Progressive Web App (PWA)** and a **Native Mobile App (iOS & Android via Capacitor.js)**.

---

## 🌟 Architecture Overview

```
                      ┌──────────────────────────────┐
                      │   BAGm Next.js E-Commerce    │
                      └──────────────┬───────────────┘
                                     │
             ┌───────────────────────┼────────────────────────┐
             ▼                       ▼                        ▼
    ┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
    │  PWA (Instant)  │    │ iOS (App Store)  │    │ Android (Play Store)│
    │  Web App Shell  │    │ Xcode / Swift    │    │ Android Studio/Java │
    └─────────────────┘    └──────────────────┘    └─────────────────────┘
```

---

## 1. 🚀 Instant PWA Mode (Live Today)

Customers can install BAGm Beauty directly from their mobile browser without downloading from an app store:

### On iPhone (Safari):
1. Open `https://bagmbeautysupply.vercel.app` in Safari.
2. Tap the **Share** button (box with upward arrow) at the bottom.
3. Scroll down and tap **"Add to Home Screen"**.
4. The BAGm Beauty icon appears on their iPhone home screen and opens full-screen like a native app.

### On Android (Chrome):
1. Open `https://bagmbeautysupply.vercel.app` in Chrome.
2. An automatic **"Install BAGm Mobile App"** bottom sheet appears.
3. Tap **"Install"**. The app installs directly into the Android app drawer.

---

## 2. 🍏 Building Native iOS App for Apple App Store

### Prerequisites:
- macOS computer with **Xcode** installed (version 15+).
- Apple Developer Account ($99/year) from [developer.apple.com](https://developer.apple.com).

### Step-by-Step Build:

1. **Install Capacitor Dependencies**:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/splash-screen @capacitor/status-bar
   ```

2. **Add iOS Platform**:
   ```bash
   npx cap add ios
   ```

3. **Sync Configuration**:
   ```bash
   npx cap sync ios
   ```

4. **Open in Xcode**:
   ```bash
   npx cap open ios
   ```

5. **In Xcode**:
   - Select your Team in **Signing & Capabilities**.
   - Set Bundle Identifier: `com.bagmbeauty.app`.
   - Run on iOS Simulator or connected iPhone (Cmd + R).
   - In Xcode menu, select **Product > Archive** to build the `.ipa` and upload to **TestFlight** and the **Apple App Store**.

---

## 3. 🤖 Building Native Android App for Google Play Store

### Prerequisites:
- **Android Studio** installed (latest Hedgehog/Iguana version).
- Google Play Console Account ($25 one-time fee) from [play.google.com/console](https://play.google.com/console).

### Step-by-Step Build:

1. **Install Android Platform**:
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```

2. **Sync Configuration**:
   ```bash
   npx cap sync android
   ```

3. **Open in Android Studio**:
   ```bash
   npx cap open android
   ```

4. **In Android Studio**:
   - Run on Android Emulator or physical Android device.
   - Go to **Build > Generate Signed Bundle / APK**.
   - Choose **Android App Bundle (.aab)** for Google Play.
   - Create your keystore signature and generate the signed release `.aab`.
   - Upload the `.aab` to your Google Play Console under Production / Internal Testing.

---

## 4. 🔔 Push Notifications Setup (Optional)

To send instant notifications for order updates, MoMo payments, and flash drops:

1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS).
3. Install push plugin:
   ```bash
   npm install @capacitor/push-notifications
   npx cap sync
   ```

---

## 5. 💳 Mobile Payment Flow (Paystack & MoMo)

Mobile payments for MTN MoMo, Telecel Cash, and cards automatically open the native Paystack checkout sheet within the app and return seamlessly to `/order-confirmation/[id]`.

---

## 📁 Key Mobile Configuration Files

- `public/manifest.json`: Web app metadata, icon sizes, colors, and shortcuts.
- `public/sw.js`: Offline caching and network-first performance worker.
- `src/components/common/PWAInstallPrompt.tsx`: One-tap install prompt for mobile visitors.
- `capacitor.config.json` & `capacitor.config.ts`: Native iOS/Android bundle identifiers and server sync targets.
