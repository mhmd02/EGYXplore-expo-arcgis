# Windows and Android Setup

## Prerequisites

- Node.js 20 or 22
- JDK 17
- Android Studio with Android SDK, Build Tools, Command-line Tools, Platform Tools, and an emulator image
- A physical Android device with USB debugging, or an Android emulator

Set `ANDROID_HOME` to the Android SDK directory and add `<ANDROID_HOME>/platform-tools` to `PATH`. Verify the device connection with:

```bash
adb devices
```

## First Run

```bash
npm install
cp .env.example .env
npx expo prebuild --platform android
npx expo run:android
```

Use a configured `.env` before the build. `expo-arcgis` is native, so Expo Go is not supported.

## Daily Development

```bash
npx expo start --dev-client
```

For an Android device connected by USB, expose Metro with:

```bash
adb reverse tcp:8081 tcp:8081
```

Rebuild with `npx expo run:android` after native dependency, plugin, or native configuration changes.

## Common Build Failures

- Wrong Java version: point `JAVA_HOME` and Gradle to JDK 17.
- `adb` missing: add Android SDK Platform Tools to `PATH` and reopen the terminal.
- Native module missing: run `npx expo prebuild --clean`, then `npx expo run:android`.
- Physical device cannot call the backend: replace `localhost` with a reachable LAN/tunnel address in `.env`.
