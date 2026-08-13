# Release Builds

## Current Repository State

The project uses Expo prebuild and ignores generated `ios/` and `android/` folders. There is no `eas.json` profile in the repository and no release script in `package.json`. Release signing, build profiles, and store metadata must therefore be configured before a production release.

## Pre-release Checklist

- [ ] Replace development backend URLs with production HTTPS URLs.
- [ ] Confirm REST, AI, and SignalR path conventions.
- [ ] Restrict and rotate ArcGIS client credentials as required.
- [ ] Remove test accounts, test media, debug messages, and temporary files.
- [ ] Review Android permissions and remove unused foreground-service declarations if not required.
- [ ] Verify iOS permission descriptions.
- [ ] Decide whether settings persistence, voucher sharing, email delivery, and push notifications are production requirements.
- [ ] Test permissions and core flows on supported Android and iOS versions.
- [ ] Complete privacy policy, data retention, deletion, and support information.
- [ ] Capture a release regression report using `docs/development/testing.md`.

## Application Identity

`app.json` currently uses the earlier `Mock-Sdk-RN` name, slug, scheme, bundle identifier, and Android package. Renaming these values changes installed-app identity and deep links. Treat it as a deliberate migration, update permission text and store metadata, and test fresh installation and upgrade behavior.

## Native Build

For local platform builds:

```bash
npx expo prebuild --clean
npx expo run:android
npx expo run:ios
```

Do not run both platform commands on a machine that does not support the target platform. Preserve credentials outside the repository.

## Store and Signing Preparation

Before publishing, configure:

- Android application ID, signing key, version code, and release artifact.
- iOS bundle identifier, team signing, provisioning, version, and build number.
- App icons, splash assets, privacy declarations, and permission explanations.
- Production API, ArcGIS, and notification configuration.
- Crash reporting and support contact, if required by the project.

Never commit keystores, certificates, provisioning profiles, private keys, or production secrets.

## Known Release Risks

- No centralized handling exists for expired sessions outside the AI flow.
- Settings are not reliably persisted.
- AI and standard API URL construction differs.
- Route-service environment configuration is not currently passed to route solving.
- Voucher sharing and confirmed email delivery are not implemented/proven by the frontend.
- The project has no automated test or release pipeline documented in the repository.
