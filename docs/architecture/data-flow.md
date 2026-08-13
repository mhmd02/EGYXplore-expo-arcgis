# Data Flow Architecture

This document describes the major data flows in the EGYXplore application.

## 1. Login & Session Restoration

```mermaid
sequenceDiagram
    participant User
    participant App (index.jsx)
    participant UserContext
    participant SecureStore
    participant API

    Note over App: App boots
    UserContext->>SecureStore: Read token and user entries
    SecureStore-->>UserContext: stored token + user JSON
    UserContext->>API: GET /MobileAccount/profile
    alt Profile refresh succeeds
        API-->>UserContext: fresh user data
        UserContext->>SecureStore: Update cached user
    else Profile refresh fails
        API-->>UserContext: error
        Note over UserContext: Keep cached token and user
    end
    App->>App: Redirect to /(main)/explore
```

## 2. Login Flow
- User submits form
- Calls `loginUser(credentials)`
- **POST** `/MobileAccount/Login`
- Receives `{token, user}`
- Saves to `SecureStore`
- Sets state in `UserContext`
- Redirects to main app flow

## 3. Loading Content
In `ContentContext` on mount (when token is available):
- `Promise.allSettled([getMissions, getRewards, getDestinations])`
- Each request can succeed or fail independently.
- SignalR hub connects in parallel.
- On reconnect: triggers a silent refetch.

## 4. Creating a Trip

```mermaid
sequenceDiagram
    participant User
    participant App
    participant TripDraftContext
    participant AsyncStorage
    participant API

    User->>App: Browse destinations
    User->>App: Tap 'Add to Itinerary'
    App->>TripDraftContext: toggleDraft()
    TripDraftContext->>AsyncStorage: Store ID in trip-draft:{userId}
    User->>App: Navigate to /trips/create
    User->>App: Review and reorder draft stops
    App->>TripDraftContext: moveDraftItem(from, to)
    User->>App: Fill form (title, dates, budget, companions)
    App->>TripDraftContext: saveTrip()
    TripDraftContext->>API: POST /MobileTrip/CreateTrip
    API-->>TripDraftContext: Success
    TripDraftContext->>AsyncStorage: Clear local draft
    Note over App: Trip appears in My Trips
```

## 5. Completing a Mission

```mermaid
sequenceDiagram
    participant User
    participant App
    participant API
    participant ProgressContext

    User->>App: View mission details
    User->>App: Capture at least three mission photos
    App->>API: POST /MobileMission/{id}/verify-photos
    API-->>App: verificationToken + verificationPayload
    App->>ProgressContext: completeMission(id, token, payload)
    ProgressContext->>API: POST /MobileMission/Complete
    API-->>ProgressContext: Completion result and points
    Note over ProgressContext: Update completedIds and totalPoints after success
```

## 6. Redeeming a Reward
- View reward details
- Check points balance versus cost
- Call `redeemReward()`
- **POST** `/MobileReward/Redeem`
- Receive voucher code + remaining points
- Update local state in `ProgressContext`

## 7. Receiving a SignalR Notification

```mermaid
sequenceDiagram
    participant Server
    participant SignalR Hub
    participant ContentContext
    participant App

    Server->>SignalR Hub: Publish event (e.g., MissionAdded)
    SignalR Hub->>ContentContext: Deliver to connected client
    Note over ContentContext: Handler fires
    ContentContext->>ContentContext: Updates missions/rewards array in state
    ContentContext->>ContentContext: Sets newMission/newReward flag
    ContentContext->>App: Tab badge dot appears
```

## 8. Sending an AI Message
- User types message (optionally attaches images/audio).
- Images converted to base64.
- Audio converted to base64.
- FormData built.
- **POST** `/AiChat/Send`.
- JSON response rendered in chat.
- History and individual sessions are loaded through `/AiChat/GetHistory` and `/AiChat/GetHistorySession?id=`.
- The current screen sends at most the latest 16 previous messages as context.
- An AI-specific 401 error logs the user out; most other API modules do not provide the same centralized behavior.

## 9. Updating or Completing a Saved Trip

- The trip detail screen loads the selected trip through `/MobileTrip/GetTripById`.
- Destination edits are submitted to `/MobileTrip/UpdateTripDestinations`.
- Completing a trip calls `/MobileTrip/CompleteTrip` and can display returned XP or badge information.
- Deleting a trip calls `/MobileTrip/DeleteTrip` and removes it from local saved-trip state after success.

## Current Limitations

- API requests do not use a shared timeout, retry strategy, cancellation policy, or offline queue.
- Route guards depend on cached local authentication presence rather than proactive token validation.
- SignalR reconnect is finite; after the configured attempts are exhausted, a later foreground transition may attempt a fresh connection.
