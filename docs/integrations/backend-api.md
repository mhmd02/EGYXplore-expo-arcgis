# Backend API Integration

This document provides a comprehensive reference for the EGYXplore mobile app backend API integration.

## Base URL Configuration

The API base URL is configured in `api/api.js`:

```javascript
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_BASE ?? 'http://localhost:5217';
const apiOrigin = configuredBaseUrl.replace(/\/+$/, '').replace(/\/api$/i, '');
export const API_BASE_URL = `${apiOrigin}/api`;
export const HUB_BASE_URL = `${apiOrigin}/notificationHub`;
```

Most domain modules import `API_BASE_URL`, but `api/aiApi.js` currently reads `EXPO_PUBLIC_API_BASE` directly and calls `/AiChat/...` without the normalized `/api` prefix. The environment value must therefore be the backend origin, and the backend must expose AI routes at that origin-level path. This is a current implementation inconsistency rather than a single shared URL policy.

## HTTP Client

The application uses the native `fetch` API for all network requests (Axios is not used).

- **Authentication**: Protected requests generally include `Authorization: Bearer <token>`. The current mission photo-verification client is an exception and sends no bearer header.
- **Error Parsing**: Error handling varies by module. Some modules parse JSON with an empty-object fallback, authentication expects JSON, destination details parse text manually, and AI errors use raw text.
- **Content-Type**: Uses `application/json` for most requests, and `multipart/form-data` for file uploads.

## Complete Endpoint Reference Table

| Area | Endpoint | Method | Auth | Request Body | Source File |
|------|----------|--------|------|-------------|-------------|
| Auth | `/MobileAccount/Register` | POST | No | Validated registration form, including `{firstName, lastName, email, password, confirmPassword, phone, country}` | `authApi.js` |
| Auth | `/MobileAccount/Login` | POST | No | `{email, password}` | `authApi.js` |
| Profile | `/MobileAccount/profile` | GET | Bearer | — | `profileApi.js` |
| Profile | `/MobileAccount/profile` | PUT | Bearer | `{firstName, lastName, country, interests[]}` | `profileApi.js` |
| Profile | `/MobileAccount/ProfilePicture` | POST | Bearer | FormData with `image` file (uses Expo SDK 57 `File` class) | `profileApi.js` |
| Content | `/MobileMission/AllMissions` | GET | Bearer | — | `contentApi.js` |
| Content | `/MobileReward/AllRewards` | GET | Bearer | — | `contentApi.js` |
| Content | `/MobileDestination/AllDest` | GET | Bearer | — | `contentApi.js` |
| Content | `/MobileDestination/GetDestinationById` | POST | Bearer | `{destinationId}` | `contentApi.js` |
| Progress | `/MobileMission/MyCompleted` | GET | Bearer | — | `progressApi.js` |
| Progress | `/MobileMission/MyBalance` | GET | Bearer | — | `progressApi.js` |
| Progress | `/MobileMission/Complete` | POST | Bearer | `{missionId, verificationPayload, verificationToken}` | `progressApi.js` |
| Progress | `/MobileReward/Redeem` | POST | Bearer | `{rewardId}` | `progressApi.js` |
| Progress | `/MobileReward/MyRedeemed` | GET | Bearer | — | `progressApi.js` |
| Trips | `/MobileTrip/CreateTrip` | POST | Bearer | `{title, startDate, endDate, budget, companions, destinationIds[]}` | `tripApi.js` |
| Trips | `/MobileTrip/MyTrips` | GET | Bearer | — | `tripApi.js` |
| Trips | `/MobileTrip/GetTripById` | POST | Bearer | `{tripId}` | `tripApi.js` |
| Trips | `/MobileTrip/UpdateTripDestinations` | POST | Bearer | `{tripId, destinationIds[]}` | `tripApi.js` |
| Trips | `/MobileTrip/CompleteTrip` | POST | Bearer | `{tripId}` | `tripApi.js` |
| Trips | `/MobileTrip/DeleteTrip` | POST | Bearer | `{tripId}` | `tripApi.js` |
| AI Chat | `/AiChat/Send` | POST | Bearer | FormData: `message`, `history` (JSON), `chatSessionId`, `imagesBase64` (JSON array), `imagesMimeTypes` (JSON array), `audioBase64`, `audioMimeType` | `aiApi.js` |
| AI Chat | `/AiChat/GetHistory` | GET | Bearer | — | `aiApi.js` |
| AI Chat | `/AiChat/GetHistorySession?id=` | GET | Bearer | Query param `id` | `aiApi.js` |
| Missions | `/MobileMission/{id}/verify-photos` | POST | No bearer header in current client | `{images: [base64strings]}` | `missionPhotoApi.js` |

## Error Handling Patterns

Every API call checks HTTP success, but error contracts are not fully standardized:

- Most calls check `response.ok`; only endpoints whose payload exposes a `success` field also inspect that field.
- Several trip and progress calls parse JSON with `.catch(() => ({}))`.
- Authentication calls expect a JSON response.
- AI errors are read as raw text.
- Descriptive `Error` objects are thrown, utilizing `result.message` or the HTTP status code.
- **AI Chat specific**: A dedicated `AiAuthenticationError` class in `aiApi.js` manages 401 Unauthorized responses.
- **Current limitation**: There is no shared fetch wrapper, timeout, cancellation, retry policy, or global 401 handler.

## File Upload Pattern (Expo SDK 57)

File uploads in EGYXplore utilize the modern pattern introduced in Expo SDK 57:

- Profile and AI uploads use `new File(uri)` from the `expo-file-system` package.
- **Profile Picture**: Creates a `File` object and appends it to a `FormData` payload.
- **AI Images**: Converted to base64 encoding using `new File(uri).base64()`.
- **AI Audio**: Processed using the same base64 conversion approach as images.
- **Mission Photos**: Use the legacy filesystem API to read images as base64 before verification.

## API Module Architecture

The API layer is organized by feature domain, with files such as `authApi.js`, `profileApi.js`, and `tripApi.js`. Most modules import URL configuration from `api.js`; `aiApi.js` is the current exception. Cross-cutting behavior such as authentication errors, response parsing, and timeouts is not centralized.

## Security and Operational Notes

- Production API and hub traffic should use HTTPS/WSS with valid certificates.
- Bearer tokens are stored using Expo SecureStore, but route guards only check local token presence.
- Request payload sizes and MIME types for base64 image/audio uploads are not constrained by the frontend API layer; backend limits must be documented and enforced.
- Email and phone are displayed as read-only in the profile editor and are not sent by the profile update endpoint.
