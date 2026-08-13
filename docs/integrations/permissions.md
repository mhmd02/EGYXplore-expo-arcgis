# Device Permissions Integration

## Overview
The app uses runtime permissions for location, photos, camera, and microphone. It also declares Android manifest permissions for audio settings and foreground services; these declarations are not all user-facing runtime prompts.

## Permissions Table

| Permission | Platform | Android Manifest Key | Used For | Requested By |
|-----------|----------|---------------------|----------|-------------|
| Fine Location | Android/iOS | `ACCESS_FINE_LOCATION` | Map location, navigation, nearby discovery | `expo-location` |
| Coarse Location | Android | `ACCESS_COARSE_LOCATION` | Fallback location | `expo-location` |
| Photo Library | Android/iOS | (runtime) | Profile pictures, mission photos, and AI image attachments | `expo-image-picker` |
| Camera | Android/iOS | (runtime) | Capturing profile pictures, mission photos, and AI image attachments | `expo-image-picker` |
| Microphone | Android/iOS | `RECORD_AUDIO` | AI assistant audio messages | `expo-audio` |
| Audio Settings | Android | `MODIFY_AUDIO_SETTINGS` | Audio recording configuration | `expo-audio` |
| Foreground Service | Android | `FOREGROUND_SERVICE` | Declared in manifest; no explicit foreground service is started by the reviewed frontend | System manifest permission |
| Foreground Service Media | Android | `FOREGROUND_SERVICE_MEDIA_PLAYBACK` | Declared in manifest; background media playback is not configured by the reviewed frontend | System manifest permission |

## Permission Declarations in app.json
From the Expo plugins configuration:
```json
[
  "expo-location",
  { "locationAlwaysAndWhenInUsePermission": "Allow Mock-Sdk-RN to use your location to explore nearby places." }
],
[
  "expo-image-picker",
  { "photosPermission": "Allow Mock-Sdk-RN to access your photos to set a profile picture." }
],
[
  "expo-audio",
  { "microphonePermission": "Allow Mock-Sdk-RN to access your microphone." }
]
```

## Android-Specific Permissions
Declared in `app.json` → `expo.android.permissions`:
```json
[
  "android.permission.ACCESS_COARSE_LOCATION",
  "android.permission.ACCESS_FINE_LOCATION",
  "android.permission.RECORD_AUDIO",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK"
]
```

## iOS-Specific Permissions
- Location: configured via expo-location plugin with custom permission message
- Photos: configured via expo-image-picker plugin with custom permission message
- Microphone: configured via expo-audio plugin with custom permission message
- iOS bundle identifier: `com.anonymous.MockSdkRN`

## Runtime Permission Flow
- Location: Explore checks existing permission on load. The request is made when the user presses the displayed Allow action.
- Photos: requested when user tries to pick an image for profile or mission.
- Camera: requested when user chooses to take a photo.
- Microphone: requested when user tries to record audio for AI assistant.

## Permission Denied Handling
When permissions are denied, the app degrades gracefully:
- Location denial: the map won't display user location; user needs to manually pan/zoom.
- Photos/Camera denial: user cannot upload custom images for profile or missions.
- Microphone denial: user cannot use voice input for the AI assistant and must rely on text typing.
Location can open system settings when the OS no longer allows another prompt. Photo/camera denial currently shows an alert without a direct settings action, while microphone denial instructs the user to change settings manually.

## Privacy Considerations
- Runtime permission prompts include user-facing descriptions, although some shared image-picker messages are currently too profile-specific.
- No background location tracking.
- Audio recording only happens on explicit user action.
- Profile pictures and mission photos are uploaded to the app's backend only.

The current data flows also include:

- Search terms sent to ArcGIS geocoding services.
- Current and destination coordinates sent to ArcGIS route services when routing is requested.
- Highest-accuracy location watching while Explore is mounted and permission is granted, using a 10-second or 3-metre update threshold.
- AI images and audio sent to the backend as base64 form fields.

Production privacy documentation should identify the backend and Esri/ArcGIS as data recipients, explain purpose and retention, and provide deletion/contact information.

## Current Limitations

- Foreground-service permissions appear broader than behavior demonstrated by the frontend and should be reviewed for necessity before release.
- Some denial messages are avatar-specific even when the shared image picker is used for AI or mission flows.
- A custom photo-library message is configured, but no custom camera permission message is present in `app.json`.
- Android/iOS limited or restricted permission states are not handled separately.
