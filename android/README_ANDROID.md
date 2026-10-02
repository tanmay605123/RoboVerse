# 🤖 RoboVerse Android Native Project & Build Guide

Welcome to the native Android distribution package for **RoboVerse**.

---

## 📂 Included Android Assets
1. **`app/`**: Android application source code, `AndroidManifest.xml` (with camera, location, and biometric permissions), resources, app icons, and launch screens.
2. **`build.gradle` & `settings.gradle`**: Configured with Android SDK 35 (Android 15 / UpsideDownCake).
3. **`gradlew` & `gradlew.bat`**: Native Gradle wrapper scripts.
4. **`local.properties`**: Path configuration pointing to the local Android SDK.

---

## 🛠️ How to Build the Android APK Locally

### Prerequisites:
- Java JDK 17 (recommended: Eclipse Temurin JDK 17)
- Android SDK installed (`~/Library/Android/sdk`)

### Step 1: Open Terminal in this folder
```bash
cd ~/Desktop/RoboVerse/android
```

### Step 2: Build the Debug APK
```bash
JAVA_HOME=~/jdk-17/Contents/Home ./gradlew assembleDebug
```
Once the build completes, your installable APK will be generated at:
```
app/build/outputs/apk/debug/app-debug.apk
```

### Step 3: Install onto Connected Android Phone
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

---

## 🚀 Instant Run with Expo Go (No Compilation Needed)
To test and run the app instantly on your phone with hot reload:
1. Install **Expo Go** from the Google Play Store on your Android phone.
2. In terminal run:
   ```bash
   cd ~/roboverse/apps/mobile
   npx expo start
   ```
3. Scan the QR code with Expo Go!
