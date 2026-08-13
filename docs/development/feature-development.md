# Feature Development Guide

Use the existing architecture and integration documents for full diagrams and endpoint tables. This guide identifies the implementation entry points for common changes.

## Authentication and Profile

Primary files:

- `app/(auth)/login.jsx`
- `app/(auth)/register.jsx`
- `context/UserContext.jsx`
- `api/authApi.js`
- `api/profileApi.js`
- `schema/authSchema.js`

Keep session restore, login, registration, logout, and profile refresh in `UserContext`. Store session data through SecureStore. Phone and email are currently read-only in the profile editor.

## Onboarding

Primary files:

- `app/(onboarding)/step1.jsx`
- `app/(onboarding)/step2.jsx`
- `context/UriContext.jsx`
- `constants/pickImages.js`

Step 1 sends interests through the profile API. Step 2 can upload a profile image. Theme selection is currently in memory; do not document it as persistent without implementing persistence.

## Explore Map

Primary file: `app/(main)/explore.jsx`

Related files:

- `config/arcgis.js`
- `components/CustomPopup.jsx`
- `context/TripDraftContext.jsx`

The screen owns the ArcGIS map, destination and branch layers, labels, local layer queries, geocoding fallback, identify, map overlays, location tracking, and route drawing. Preserve these distinctions when changing behavior:

- Local feature-layer search runs before global geocoding.
- Routes require a current location and destination point.
- Navigate draws a route line; it is not turn-by-turn navigation.
- Feature-layer fields are configured in `config/arcgis.js`.

## Trips

Primary files:

- `app/(main)/trips/index.jsx`
- `app/(main)/trips/create.jsx`
- `app/(main)/trips/my-trips/index.jsx`
- `app/(main)/trips/my-trips/[tripId].jsx`
- `context/TripDraftContext.jsx`
- `api/tripApi.js`
- `schema/tripSchema.js`

The draft is persisted locally per user. Saved trips use the backend. Initial creation supports reordering; saved-trip editing supports adding/removing destinations but not reordering. Keep the minimum-one-destination validation when modifying update behavior.

## Missions and Rewards

Mission files:

- `app/(main)/mission/index.jsx`
- `app/(main)/mission/[id].jsx`
- `constants/useMissionPhotos.js`
- `api/missionPhotoApi.js`
- `api/progressApi.js`

The current mission flow takes camera photos, verifies them, then completes the mission with the returned verification payload and token. Do not add documentation or UI assumptions for gallery, audio, or location verification unless implemented.

Reward files:

- `app/(main)/reward/index.jsx`
- `app/(main)/reward/[id].jsx`
- `app/(main)/reward/completedRewards.jsx`
- `context/ProgressContext.jsx`
- `api/progressApi.js`

Redeemed rewards are filtered from the available list. Voucher sharing is currently a placeholder and email delivery is not proven by the frontend.

## AI Assistant

Primary files:

- `app/(main)/trips/ai.jsx`
- `api/aiApi.js`
- `constants/useRecordAndUploadAudio.js`
- `components/CustomChoose.jsx`

The assistant accepts text, image, and audio input. Image/audio data is converted before upload. History and sessions are loaded from the service. The AI module currently constructs its URL differently from the other API modules; resolve that inconsistency before production release.

## Settings and Notifications

Primary files:

- `app/(main)/(account)/settings.jsx`
- `context/ContentContext.jsx`
- `context/SettingsContext.jsx`
- `context/useNotificationsHub.jsx`
- `app/(main)/_layout.jsx`

The active mission/reward indicator switches are in `ContentContext`; `SettingsContext` is a separate legacy in-memory model. Neither model persists settings. SignalR events update content regardless of indicator visibility; the switches only control tab dots.

## Adding a New Feature

1. Decide whether the feature is screen-local, shared state, or server-backed.
2. Add the route under the appropriate Expo Router group.
3. Add a domain API module if a new backend contract is required.
4. Add or extend a context only when multiple screens need the state.
5. Add loading, empty, error, permission-denied, and success states.
6. Document the user flow and reviewer-facing architecture change.
7. Test authenticated, unauthenticated, offline, and repeated-action behavior.
