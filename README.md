# 🤖 RoboVerse: 3D Robotics & Electronics Learning Platform

> **"Learn it. Build it. Simulate it."**

Welcome to your complete offline distribution package for **RoboVerse**. This folder contains the entire source code, native Android project, native iOS project, and live deployment links.

---

## 🌐 1. Live Deployed Website (Vercel Production)

The application is deployed live on **Vercel** with full SSL, global CDN, and live API connectivity:

- 🚀 **Official Vercel URL**: **[https://roboverse-delta.vercel.app](https://roboverse-delta.vercel.app)**
- 🎛️ **3D Circuit Workbench**: `https://roboverse-delta.vercel.app/workbench`
- 🤖 **Rituu AI Assistant Station**: `https://roboverse-delta.vercel.app/rituu`
- 📊 **Student Dashboard & 3D Passport**: `https://roboverse-delta.vercel.app/dashboard`
- 🛒 **TechSavyyy Hardware Store**: `https://roboverse-delta.vercel.app/store`
- 🏆 **Hackathons Hub**: `https://roboverse-delta.vercel.app/hackathons`
- 📍 **Nearby Component Shops Radar**: `https://roboverse-delta.vercel.app/shops`
- 🔐 **Admin Control Center**: `https://roboverse-delta.vercel.app/admin`
  - *Admin Credentials*: Email: `admin@roboverse.io` | Password: `Admin@12345`

*Alternative Tunnel URL: [https://86fac5b648019d.lhr.life](https://86fac5b648019d.lhr.life)*

---

## 📁 2. Folder Structure Inside This Package

```
RoboVerse/
├── README.md                  # This master documentation guide
├── source-code/               # Full monorepo source code
│   ├── apps/
│   │   ├── web/               # Next.js 14 Web Application (Three.js, R3F, Tailwind CSS)
│   │   ├── mobile/            # React Native with Expo SDK 51 (iOS & Android)
│   │   └── api/               # Node.js + Express + TypeScript Backend API (Prisma, Claude AI)
│   ├── packages/
│   │   ├── shared/            # Shared Zod schemas, TypeScript types, API client
│   │   ├── sim-engine/        # MNA DC circuit solver & Avr8js MCU emulator
│   │   └── ui-tokens/         # Design tokens, color palette, glassmorphism presets
│   └── package.json           # Root workspace configuration
│
├── android/                   # Native Android Project & APK Build Files
│   ├── app/                   # Android source code, AndroidManifest.xml, icons & resources
│   ├── build.gradle           # Top-level Gradle configuration
│   ├── gradlew / gradlew.bat  # Gradle wrapper binaries
│   ├── local.properties       # Android SDK configuration
│   └── README_ANDROID.md      # Step-by-step Android installation & APK guide
│
└── ios/                       # Native iOS Project & Xcode Files
    ├── RoboVerse.xcodeproj/   # Apple Xcode project file
    ├── RoboVerse/             # Native Objective-C/Swift source, Info.plist, assets
    ├── Podfile                # CocoaPods dependencies
    └── README_IOS.md          # Step-by-step iOS run & build guide
```

---

## 📱 3. Mobile Apps (Android & iOS)

### Android:
- Check inside the **`android/`** folder for the native Gradle project.
- To run or build the debug/release APK locally:
  ```bash
  cd ~/Desktop/RoboVerse/android
  ./gradlew assembleDebug
  ```
  The generated APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

### iOS:
- Check inside the **`ios/`** folder for the complete Xcode project and CocoaPods configuration.
- To open and run in Xcode:
  ```bash
  cd ~/Desktop/RoboVerse/ios
  pod install
  open RoboVerse.xcodeproj
  ```

### Instant Mobile Preview with Expo Go (Easiest way!):
Both Android and iOS can be previewed instantly without compiling native code:
```bash
cd ~/Desktop/RoboVerse/source-code/apps/mobile
npm install
npx expo start
```
Scan the displayed QR code with the **Expo Go** app on your phone!

---

## 💻 4. Running the Complete Monorepo Locally

### Prerequisites:
- Node.js >= 18
- npm >= 9

### Step 1: Install Dependencies
```bash
cd ~/Desktop/RoboVerse/source-code
npm install
```

### Step 2: Start the Backend API (Port 4000)
```bash
cd apps/api
npm run dev
# Swagger Docs available at http://localhost:4000/api/docs
```

### Step 3: Start the Web App (Port 3000)
```bash
cd apps/web
npm run dev
# App available at http://localhost:3000
```

### Step 4: Run Automated Tests
```bash
npm test
# 40 / 40 passing tests across API and Simulation Engine
```
