# Environment Configuration

## Create the Local File

```bash
cp .env.example .env
```

`.env` is ignored by Git. Do not commit real values.

| Variable | Required By | Notes |
| --- | --- | --- |
| `EXPO_PUBLIC_API_BASE` | REST, SignalR, AI | Backend origin without a trailing `/api` |
| `EXPO_PUBLIC_ARCGIS_API_KEY` | Explore | Client-visible ArcGIS API key |
| `EXPO_PUBLIC_ARCGIS_LICENSE_KEY` | Explore | Client-visible ArcGIS Runtime Lite license |
| `EXPO_PUBLIC_ARCGIS_DESTINATIONS_URL` | Explore | Destination FeatureServer layer URL |
| `EXPO_PUBLIC_ARCGIS_BRANCHES_URL` | Explore | Branch FeatureServer layer URL |
| `EXPO_PUBLIC_ARCGIS_UTILITIES_URL` | Explore | Utilities FeatureServer layer URL |
| `EXPO_PUBLIC_ARCGIS_DESTINATIONS_PORTAL_ID` | Reserved | Present in config but unused by current map code |
| `EXPO_PUBLIC_ARCGIS_ROUTE_SERVICE_URL` | Reserved | Present in config but not passed to route solving |

## Backend Address Rules

Most API modules normalize the configured origin and request `${origin}/api/...`. SignalR uses `${origin}/notificationHub`. `api/aiApi.js` is different: it uses the configured origin directly for `/AiChat/...` requests. Configure the backend to support that layout, or align the implementation before release.

For local development:

- Android emulator: commonly `http://10.0.2.2:5217`
- iOS Simulator: commonly `http://localhost:5217`
- Physical device: use a reachable LAN HTTPS address or tunnel

`localhost` on a phone refers to the phone, not the development machine.

## Public Values

Every `EXPO_PUBLIC_*` value is included in the built client. Never place database passwords, private API secrets, signing credentials, or unrestricted service credentials in `.env` under this prefix. Restrict ArcGIS keys to required services/apps where possible and rotate exposed values.

## Refresh Rules

- JavaScript-only environment changes: stop Metro and run `npx expo start --dev-client --clear`.
- Changes to native plugins, `app.json`, or native dependencies: regenerate/rebuild the native app.
- `npx expo prebuild --clean` deletes generated `ios/` and `android/` folders. Preserve intentional manual native changes first.
