# Permissions & Privacy

## Permissions

| Permission | Used For | Current Behavior |
| --- | --- | --- |
| Location | Position display and routes | Watched in the foreground while Explore is open and permission is granted |
| Camera | Mission photos, onboarding profile photo, AI attachments | Mission verification currently requires camera photos |
| Photo Library | Account/onboarding profile photo and AI attachments | Mission verification does not currently provide a gallery option |
| Microphone | AI voice messages | Requested when recording starts |

## If You Deny Access

- **Location:** You can still browse the map and details, but current-location and route features need a location fix.
- **Camera:** Mission photo capture cannot continue. Gallery selection is not a mission fallback in this build.
- **Photos:** Account profile selection and AI gallery attachments are unavailable; camera actions can still work if camera access is allowed.
- **Microphone:** AI text and image messages still work, but voice recording does not.

Location can open system settings if the device no longer allows another prompt. Camera, photo, and microphone flows may show an alert and require you to open settings manually.

The installed app can still appear under the older name `Mock-Sdk-RN` in device settings because the current native app identity has not yet been renamed to EGYXplore.

## Data Sent to Services

- **Account:** Registration and profile fields are sent to the application service. Phone and email are read-only in the current profile editor.
- **Mission photos:** Camera images are converted and sent to the application service for verification.
- **AI conversations:** Message text, recent conversation context, a conversation reference when available, images, image formats, audio, and audio format can be sent to the assistant service. Chat history is retrieved from the service.
- **Map search:** The app first searches configured map layers. If needed, the search text is sent to an external map place-search service.
- **Routes:** Current and destination coordinates are sent to the map route service when a route is requested.
- **Remote assistant images:** Images returned by the assistant may be loaded through an external image-processing service before display.

## Data Stored on the Device

- The login session and cached user profile are stored using the platform secure-storage facility.
- Temporary itinerary selections are stored locally under the signed-in account. They are not automatically shared across devices.
- Some settings exist only in memory and can reset after restarting the app.

## Manage Permissions

Open the app's entry under your device's application settings and change Location, Camera, Photos, or Microphone access. The exact menu differs by device and may list the app as `Mock-Sdk-RN` in the current build.

## Privacy Policy Status

Retention periods, deletion procedures, external-provider terms, and legal rights must be defined by the final project privacy policy. This user guide does not establish those guarantees.
