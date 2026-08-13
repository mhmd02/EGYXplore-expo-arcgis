# State Management Architecture

## Overview
The EGYXplore app uses the React Context API exclusively (no Redux, Zustand, or MobX). State is modularized into 7 focused providers, each responsible for a single domain.

## Provider Table

| Context | File | Responsibility | Key Exposed Values |
|---------|------|---------------|--------------------|
| ThemeContext | `context/ThemeContext.jsx` | Light/dark theme toggle | `theme`, `setTheme` |
| UserContext | `context/UserContext.jsx` | Authentication, JWT token, user profile, session persistence | `user`, `token`, `login`, `register`, `logout`, `updateUser`, `refreshProfile`, `isLoading` |
| ProgressContext | `context/ProgressContext.jsx` | Completed missions, points balance, reward redemptions | `completedIds`, `totalPoints`, `isCompleted()`, `completeMission()`, `redemptions`, `isRedeemed()`, `redeemReward()` |
| SettingsContext | `context/SettingsContext.jsx` | Legacy in-memory notification preference state; not consumed by the current settings UI | `missionAlerts`, `rewardAlerts`, `setMissionAlerts`, `setRewardAlerts` |
| UriContext | `context/UriContext.jsx` | Profile image picker state | `profileImage`, `setProfileImage`, `alertVisible`, `handleTakePhoto`, `handleChooseGallery` |
| ContentContext | `context/ContentContext.jsx` | Global missions, rewards, destinations lists + SignalR live updates and active badge preferences | `missions`, `rewards`, `destinations`, `loading`, `error`, `refetch`, `newMission`, `newReward`, notification toggles |
| TripDraftContext | `context/TripDraftContext.jsx` | Unsaved trip draft (local), saved trips (server) | `draftIds`, `draftCount`, draft actions, `savedTrips`, `refreshTrips()`, `saveTrip()`, `completeTrip()`, `deleteTrip()`, `loading`, `error` |

## Provider Nesting Order & Dependencies

```
ThemeProvider          (no dependencies)
  └─ UserProvider      (no dependencies)
      └─ ProgressProvider    (depends on UserContext for token)
          └─ SettingsProvider (no dependencies)
              └─ UriProvider  (no dependencies, uses pickImages utility)
                  └─ ContentProvider  (depends on UserContext for token, uses useNotificationHub)
                      └─ TripDraftProvider (depends on UserContext for token and user.id)
```

The nesting order ensures that providers depending on user authentication (like `ProgressProvider`, `ContentProvider`, and `TripDraftProvider`) have access to the `UserContext` and its token.

## Providers in Detail

### ThemeContext
- **Purpose**: Manages light/dark theme toggle.
- **State variables**: `theme` (String).
- **Key functions/actions**: `setTheme`.
- **Dependencies**: None.
- **Persistence mechanism**: None.
- **Loading/error states**: N/A.

### UserContext
- **Purpose**: Authentication, JWT token management, user profile, and session persistence.
- **State variables**: `user` (Object), `token` (String), `isLoading` (Boolean).
- **Key functions/actions**: `login()`, `register()`, `logout()`, `updateUser()`, `refreshProfile()`.
- **Dependencies**: None.
- **Persistence mechanism**: Restores session from `SecureStore` on mount. `login()` and `register()` save token and user to `SecureStore`. `logout()` clears `SecureStore` and resets state.
- **Loading/error states**: Uses `isLoading` during initial session restoration.
- **Details**: Refreshes profile from API on every app start. Uses `useRef` to keep `userRef.current` in sync for stale-closure safety.

### ProgressContext
- **Purpose**: Manages completed missions, points balance, and reward redemptions.
- **State variables**: `completedIds` (Array), `totalPoints` (Number), `redemptions` (Array).
- **Key functions/actions**: `isCompleted()`, `completeMission()`, `isRedeemed()`, `redeemReward()`.
- **Dependencies**: `UserContext` (for token).
- **Persistence mechanism**: Server-side persistence via API.
- **Loading/error states**: Fetches completed mission IDs, balance, and redeemed rewards on mount.
- **Details**: `completeMission()` updates local completed IDs and points after the API succeeds. `redeemReward()` updates remaining points from the server response.

### SettingsContext
- **Purpose**: Holds an older in-memory notification preference model.
- **State variables**: `missionAlerts` (Boolean), `rewardAlerts` (Boolean).
- **Key functions/actions**: `setMissionAlerts`, `setRewardAlerts`.
- **Dependencies**: None.
- **Persistence mechanism**: None.
- **Loading/error states**: N/A.
- **Current limitation**: The current settings screen and tab badges use `allowMissionsNotifications` and `allowRewardsNotifications` from `ContentContext`, not this context. The two models are disconnected.

### UriContext
- **Purpose**: Manages profile image picker state.
- **State variables**: `profileImage` (String), `alertVisible` (Boolean).
- **Key functions/actions**: `setProfileImage`, `handleTakePhoto`, `handleChooseGallery`.
- **Dependencies**: Uses `pickImages` utility.
- **Persistence mechanism**: None.
- **Loading/error states**: N/A.

### ContentContext
- **Purpose**: Manages global lists of missions, rewards, and destinations, along with SignalR live updates.
- **State variables**: `missions`, `rewards`, and `destinations` (`Array | null`), `loading` (Boolean), `error` (String/Object), `newMission` (Boolean), `newReward` (Boolean), and in-memory badge preference flags.
- **Key functions/actions**: `refetch()`.
- **Dependencies**: `UserContext` (for token), uses `useNotificationHub`.
- **Persistence mechanism**: Server-side persistence, fetched on mount.
- **Loading/error states**: Uses `loading` and `error` states. Fetches missions, rewards, destinations via `Promise.allSettled` (partial success supported).
- **Details**: Registers SignalR event handlers: `MissionAdded`, `MissionUpdated`, `MissionDeleted`, `RewardAdded`, `RewardUpdated`, `RewardDeleted`. On SignalR reconnect, silently refetches all data. Manages `newMission`/`newReward` flags for tab badge dots. A failed individual content request is represented by `null`; the global error is set when every initial content request fails.

### TripDraftContext
- **Purpose**: Manages unsaved trip draft (local) and saved trips (server).
- **State variables**: `draftIds` (Array), `draftCount` (Number), `savedTrips` (Array), `loading` (Boolean), `error` (String/null).
- **Key functions/actions**: `isInDraft()`, `toggleDraft()`, `removeFromDraft()`, `moveDraftItem()`, `clearDraft()`, `saveTrip()`, `completeTrip()`, `deleteTrip()`.
- **Dependencies**: `UserContext` (for token and `user.id`).
- **Persistence mechanism**: Draft stored locally per user via `AsyncStorage` key `trip-draft:{userId}`.
- **Loading/error states**: Manages hydration state.
- **Details**: Uses `hydratedFor` ref to prevent empty state from overwriting stored draft before hydration completes. `moveDraftItem(from, to)` allows drag-to-reorder. `saveTrip()` sends draft to server, clears local draft only on success. Dates converted via `toApiDate()` helper to avoid timezone issues.

## Custom Hooks
- `useUser()` — Enforces usage inside `UserProvider`.
- `useProgress()` — Enforces usage inside `ProgressProvider`.
- `useTripDraft()` — Enforces usage inside `TripDraftProvider`.

## Current Limitations

- Active notification badge preferences are in memory and reset when `ContentProvider` remounts.
- `SettingsContext` duplicates notification preference concepts but is not used by the current settings screen.
- Context updates can re-render every consumer of that context; no selector-based state library is used.
- Network requests are performed by provider actions without a shared cache, retry policy, or offline mutation queue.
