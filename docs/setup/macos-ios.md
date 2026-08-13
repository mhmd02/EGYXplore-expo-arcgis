# macOS and iOS Setup

## Prerequisites

- macOS and Xcode
- Xcode Command Line Tools
- Node.js 20 or 22
- CocoaPods
- iOS Simulator or a configured physical iPhone

Install CocoaPods with Homebrew when needed:

```bash
brew install cocoapods
```

## First Run

```bash
npm install
cp .env.example .env
npx expo prebuild --platform ios
npx pod-install
npx expo run:ios
```

`expo-arcgis` requires a native development build and does not run in Expo Go. If `pod install` is interrupted, rerun `npx pod-install`.

## Daily Development

```bash
npx expo start --dev-client
```

Rebuild with `npx expo run:ios` after native dependency, plugin, pod, or native configuration changes.

## Physical Devices

A physical iPhone needs valid signing configured in Xcode. The backend must use an address reachable from the phone, and production services should use HTTPS with a valid certificate.

## Reset Generated Native Projects

```bash
npx expo prebuild --clean
```

This removes and recreates `ios/` and `android/`. Do not use it before preserving required manual native edits.
