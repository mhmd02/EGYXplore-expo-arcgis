# EGYXplore (Mock-Sdk-RN)

An Expo (SDK 57) React Native app with a **native ArcGIS map** (`expo-arcgis`).

> **Important:** This app uses native modules, so **Expo Go will not run it.**
> You must build a real dev/debug build onto a device or emulator, as described below.

---

## Running the project on Windows (from a fresh clone)

This is a complete, ordered walkthrough for setting up and running the app on a
**Windows laptop** with a **physical Android phone**. Follow it top to bottom the
first time. Later runs are much shorter (see [Day-to-day](#day-to-day-after-the-first-run)).

### 0. What you'll install (one-time)

| Tool | Why | Link |
|------|-----|------|
| **Node.js LTS (v20 or v22)** | Runs the JS tooling / Metro bundler | https://nodejs.org |
| **Git** | Clone the repo | https://git-scm.com/download/win |
| **Java JDK 17** | Compiles the Android app | https://adoptium.net (Temurin 17) |
| **Android Studio** | Provides the Android SDK, platform tools (`adb`), and an emulator | https://developer.android.com/studio |

You do **not** need to install React Native or Expo globally — they come with the project.

---

### 1. Install Node.js and Git

1. Install **Node.js LTS** — accept the default options.
2. Install **Git for Windows** — accept the defaults.
3. Open a new **PowerShell** window and verify:
   ```powershell
   node -v
   npm -v
   git --version
   ```
   You should see version numbers for all three.

---

### 2. Install Java JDK 17

1. Download **Eclipse Temurin JDK 17** (`.msi`) from https://adoptium.net.
2. During install, enable the option **"Set JAVA_HOME variable"** (Temurin's installer offers this).
3. Verify in a new PowerShell:
   ```powershell
   java -version
   ```
   It should report version `17.x`.

---

### 3. Install Android Studio and the SDK

1. Download and install **Android Studio**. On the setup wizard, keep **"Android SDK"**,
   **"Android SDK Platform"**, and **"Android Virtual Device"** checked.
2. Launch Android Studio → **More Actions ▸ SDK Manager**.
3. On the **SDK Platforms** tab, check the latest **Android 15 (API 35)** (or newer).
4. On the **SDK Tools** tab, make sure these are checked, then click **Apply** to download:
   - **Android SDK Build-Tools**
   - **Android SDK Command-line Tools (latest)**
   - **Android SDK Platform-Tools** (this provides `adb`)
   - **Android Emulator**
5. Note the **Android SDK Location** shown at the top of the SDK Manager — usually:
   ```
   C:\Users\<YourName>\AppData\Local\Android\Sdk
   ```

---

### 4. Set Android environment variables (one-time)

Windows needs to know where the SDK lives. In PowerShell (replace `<YourName>`):

```powershell
setx ANDROID_HOME "$env:LOCALAPPDATA\Android\Sdk"
setx Path "$env:Path;$env:LOCALAPPDATA\Android\Sdk\platform-tools"
```

**Close and reopen PowerShell**, then verify `adb` is found:
```powershell
adb version
```
If it prints a version, you're set. If "not recognized", double-check the SDK path in step 3.5.

---

### 5. Clone the repository

```powershell
git clone https://github.com/mhmd02/EGYXplore-expo-arcgis.git
cd EGYXplore-expo-arcgis
```

> If your friend was given the project on a different branch, check out that branch
> after cloning (e.g. `git checkout migrate-egyxplore`).

---

### 6. Install project dependencies

```powershell
npm install
```
This reads `package.json` and downloads everything the app needs (including Expo,
React Native, and `expo-arcgis`). It can take a few minutes.

---

### 7. Create the `.env` file (ArcGIS keys)

The map needs an ArcGIS API key and license. Copy the template and fill in real values:

```powershell
copy .env.example .env
```

Then open `.env` in a text editor and replace the placeholders:
```
EXPO_PUBLIC_ARCGIS_API_KEY=your_real_arcgis_api_key
EXPO_PUBLIC_ARCGIS_LICENSE_KEY=your_real_arcgis_lite_license_key
```

> Get these from the project owner or your own ArcGIS Developer account
> (https://developers.arcgis.com). **Without a real key the map will be blank.**
> The keys are baked in at build time — if you change `.env` later, rebuild (step 10).

---

### 8. Connect the Android phone

1. On the phone: **Settings ▸ About phone** → tap **Build number** 7 times to unlock
   Developer options.
2. **Settings ▸ System ▸ Developer options** → turn on **USB debugging**.
3. Plug the phone into the laptop with a USB cable.
4. On the phone, tap **Allow** on the *"Allow USB debugging?"* prompt.
5. Confirm the laptop sees it:
   ```powershell
   adb devices
   ```
   You should see your device with `device` next to it. If it says `unauthorized`,
   re-accept the prompt on the phone; if the list is empty, try a different cable/port.

> **No phone? Use an emulator instead:** In Android Studio open
> **More Actions ▸ Virtual Device Manager**, create a device (e.g. Pixel 7, API 35),
> and start it. `adb devices` will then list the running emulator.

---

### 9. Generate the native Android project (prebuild)

The `android/` folder is **not** part of the repo, so it must be generated once:

```powershell
npx expo prebuild --platform android
```
This creates the native `android/` project from `app.json` and the installed plugins.
(You only repeat this if native config or plugins change.)

---

### 10. First build and run

```powershell
npx expo run:android
```

This compiles the app, installs it on the connected phone/emulator, starts the Metro
bundler, and launches the app automatically. **The first build takes several minutes**
(Gradle downloads dependencies) — later builds are much faster.

When it finishes, the app opens on the phone. Grant **location permission** when asked
so the explore map works.

---

## Day-to-day (after the first run)

Once the app is installed on the device, you don't rebuild for **JavaScript** changes.
Just start the bundler and the app hot-reloads over USB:

```powershell
npx expo start --dev-client
```
Open the app on the phone; press **`r`** in the terminal to reload if needed.

**Rebuild with `npx expo run:android` only when you change:**
- native code or a native dependency,
- Expo plugins or `app.json`,
- the `.env` values.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `adb` not recognized | Redo step 4; reopen PowerShell so `Path` refreshes. |
| `SDK location not found` | Ensure `ANDROID_HOME` points to your SDK (step 4). |
| Build fails on Java version | Install **JDK 17** specifically; newer JDKs can break Gradle. |
| Map is blank | Real ArcGIS keys missing/invalid in `.env`, then rebuild (step 10). |
| Phone shows `unauthorized` in `adb devices` | Re-accept the USB debugging prompt on the phone. |
| Metro can't reach the app | Run `adb reverse tcp:8081 tcp:8081`, then reload. |
| "Voice recording coming soon" alert | Expected — audio recording is a stub, not a bug. |

---

## Project notes

- **Auth/data are mock:** the app runs on local mock state (no backend). Progress
  (missions/points/rewards) resets on app restart.
- **Expo Go is not supported** because of the native `expo-arcgis` module.
- **iOS** requires a Mac with Xcode; this guide targets Windows + Android.
