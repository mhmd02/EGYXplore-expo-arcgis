# Technical Troubleshooting

## Metro and JavaScript

```bash
npx expo start --dev-client --clear
```

Use this after changing JavaScript environment values or when Metro serves stale code. Do not assume a cache clear replaces a native rebuild.

## Native Module Not Found

Symptoms include missing `expo-arcgis` behavior, native view errors, or a screen failing after a native dependency change.

```bash
npx expo prebuild --clean
npx expo run:android
# or
npx expo run:ios
```

Preserve manual native changes before using `--clean`.

## iOS CocoaPods

```bash
npx pod-install
npx expo run:ios
```

If a pod command is interrupted, rerun it. Inspect the first dependency error rather than only the final Xcode message.

## Android Device and Metro

```bash
adb devices
adb reverse tcp:8081 tcp:8081
```

If a physical device cannot reach the backend, use a LAN or tunnel address rather than `localhost`. Android emulators commonly reach the host through `10.0.2.2`.

## Backend Requests Fail

Check:

- `.env` contains a reachable origin.
- The backend is running and exposes `/api` routes.
- AI routes match the direct `/AiChat/...` construction used by `api/aiApi.js`.
- The device can resolve the address and certificate.
- The bearer session is still valid.
- The backend allows the request origin and payload size.

The app does not provide a shared timeout, retry, offline queue, or global 401 interceptor. A request can therefore appear to hang until the platform networking layer returns.

## ArcGIS Map or Layers Fail

Check:

- API key and license values are present and valid.
- Destination and branch URLs point to point FeatureServer layers.
- Layer fields match `config/arcgis.js`.
- ArcGIS services are reachable from the target device.
- The native app was rebuilt after changing the ArcGIS dependency or plugin.

The Explore screen reports map loading, map error, and missing configuration states. Layer-specific service failures may require native logs or direct service inspection.

## SignalR Does Not Update Content

Check the hub URL, bearer token, HTTPS/WSS transport, backend hub configuration, and event names. The client uses a finite reconnect schedule. When the connection is restored, it refetches content, but there is no persistent event queue or polling fallback.

## Media Uploads Fail

Check the relevant permission, local file availability, MIME type, image/audio size, backend request limits, and authentication. Mission photos use a different legacy file-to-base64 path from profile and AI uploads, so test each feature independently.

## Reporting a Bug

Include platform, OS, build, backend environment, account-safe reproduction steps, expected result, actual result, and redacted logs. Never include `.env`, bearer tokens, raw private media, or credentials.
