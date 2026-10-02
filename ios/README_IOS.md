# 🍎 RoboVerse iOS Native Project & Build Guide

Welcome to the native iOS distribution package for **RoboVerse**.

---

## 📂 Included iOS Assets
1. **`RoboVerse.xcodeproj`**: Full Apple Xcode Project ready to open in Xcode.
2. **`RoboVerse/`**: Native Objective-C / Swift source code, `Info.plist`, App Icons (`Images.xcassets`), and launch screens.
3. **`Podfile`**: CocoaPods dependency definition for Expo, Three.js / Expo-GL, and Biometric Face ID frameworks.

---

## 🚀 How to Run & Build on iOS

### Option 1: Instant Run via Expo Go (No Mac / Xcode / Developer Account needed!)
1. Download **Expo Go** from the iOS App Store on your iPhone.
2. Ensure your iPhone is connected to the same Wi-Fi network as this computer (or use tunnel mode).
3. In terminal, start the project:
   ```bash
   cd ~/roboverse/apps/mobile
   npx expo start
   ```
4. Open the iOS Camera app and scan the terminal QR code to launch RoboVerse immediately!

---

### Option 2: Native Xcode Build (.app / Simulator)
If you have Xcode installed on macOS:
```bash
cd ~/Desktop/RoboVerse/ios
pod install
open RoboVerse.xcodeproj
```
Select your iOS Simulator or connected iPhone in Xcode and click **Run (⌘ + R)**.

---

### Option 3: Generate Production `.ipa` via Cloud EAS Build (Free)
Expo EAS Build automatically compiles an installable `.ipa` in the cloud without requiring a high-end local setup:
```bash
cd ~/roboverse/apps/mobile
npm install -g eas-cli
eas login
eas build --platform ios
```
This generates a direct download link and QR code for your `.ipa` distribution.
