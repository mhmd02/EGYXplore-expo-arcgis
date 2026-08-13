# EGYXplore Navigation Architecture

This document outlines the routing, navigation hierarchy, and layout structure of the EGYXplore mobile application. It details how Expo Router is utilized to manage the app's complex flow.

## Full Route Tree

EGYXplore uses file-based routing through the Expo Router package shipped on the Expo SDK 57 package line.

```text
app/
├── _layout.jsx                       # Root Layout (Stack + 7 Providers)
├── index.jsx                         # Entry / Auth Gate
├── (auth)/                           # Unauthenticated Stack
│   ├── _layout.jsx                   # Auth Stack (Login / Register)
│   ├── login.jsx
│   └── register.jsx
├── (onboarding)/                     # Onboarding Stack
│   ├── _layout.jsx                   # Onboarding Guard
│   ├── step1.jsx
│   └── step2.jsx
└── (main)/                           # Authenticated Tabs
    ├── _layout.jsx                   # Bottom Tab Navigator
    ├── explore.jsx                   # 🧭 Explore (ArcGIS Map)
    ├── (account)/                    # 👤 Account Stack
    │   ├── _layout.jsx               # Account stack configuration
    │   ├── index.jsx                 # Account Overview
    │   ├── personal-info.jsx
    │   └── settings.jsx
    ├── mission/                      # 🏅 Missions Stack
    │   ├── _layout.jsx               # Mission stack configuration
    │   ├── index.jsx                 # Mission List
    │   ├── completedMissions.jsx
    │   └── [id].jsx                  # Mission Detail (dynamic)
    ├── reward/                       # 🎁 Rewards Stack
    │   ├── _layout.jsx               # Reward stack configuration
    │   ├── index.jsx                 # Reward Catalog
    │   ├── completedRewards.jsx
    │   └── [id].jsx                  # Reward Detail (dynamic)
    └── trips/                        # 🗺️ Trips Stack
        ├── _layout.jsx               # Trips stack configuration
        ├── index.jsx                 # Destinations Catalog
        ├── [id].jsx                  # Destination Detail (dynamic)
        ├── ai.jsx                    # AI Assistant
        ├── create.jsx                # Review & Create Trip
        └── my-trips/
            ├── index.jsx             # Saved Trips List
            └── [tripId].jsx          # Trip Route Detail (dynamic)
```

## Navigation Flow Diagram

The flowchart below visualizes the primary navigation pathways a user can take through the application.

```mermaid
flowchart TD
    Start((App Launch)) --> AuthCheck{Auth Check\n(app/index.jsx)}
    
    AuthCheck -->|Unauthenticated| Landing[Landing Page]
    Landing --> LoginStack[(auth)/login\n(auth)/register]
    LoginStack --> Onboarding[(onboarding)]
    
    AuthCheck -->|Authenticated| MainTabs
    Onboarding --> MainTabs
    
    subgraph MainTabs[Main Application - Bottom Tabs]
        Explore[🧭 Explore Tab]
        Trips[🗺️ Sanctuaries/Trips Tab]
        Missions[🏅 Missions Tab]
        Rewards[🎁 Rewards Tab]
        Account[👤 Account Tab]
    end
    
    Trips --> TripDetails[Destination Detail]
    Trips --> AIChat[AI Assistant]
    Trips --> MyTrips[Saved Trips]
    
    Missions --> MissionDetail[Mission Detail]
    Missions --> CompletedMissions[Completed Missions]
    
    Rewards --> RewardDetail[Reward Detail]
    Rewards --> CompletedRewards[Completed Rewards]
    
    Account --> Settings[Settings]
    Account --> PersonalInfo[Personal Info]
```

## Route Groups Explained

Expo Router uses parentheses `( )` to create route groups. These groups allow us to group files logically and apply specific layouts without adding segments to the URL.

- **`(auth)`**: A layout route group that wraps unauthenticated screens (Login, Register). It does not appear in the URL path.
- **`(main)`**: A layout route group that contains the authenticated area of the app, primarily initializing the Bottom Tab Navigator.
- **`(account)`**: A nested group within the main tabs, used to structure the account-related sub-screens.
- Standard folders like **`trips/`**, **`mission/`**, and **`reward/`** correspond directly to URL segments in the routing scheme.

## Route Protection

Navigation flow is guarded using the locally restored authentication state.

- **Root `index.jsx`**: Acts as a gateway. Authenticated users are immediately redirected to `/(main)/explore`.
- **`(main)/_layout.jsx`**: Protects the core application tabs. If accessed by an unauthenticated user, it forcefully redirects them to `/(auth)/login`.
- **`(onboarding)/_layout.jsx`**: Similarly protects the onboarding flow, redirecting unauthenticated users back to `/login`.

These guards check whether `user` and `token` exist in `UserContext`; they do not independently validate token expiration.

## Dynamic Routes

Dynamic routing is used extensively for detail views, utilizing Expo Router's bracket syntax `[id]`.

- `trips/[id].jsx`: Renders the detailed view of a destination, fetching data based on the `id`.
- `mission/[id].jsx`: Resolves a mission by ID from the missions already loaded in `ContentContext`.
- `reward/[id].jsx`: Resolves a reward by ID from the rewards already loaded in `ContentContext`.
- `trips/my-trips/[tripId].jsx`: Loads the full route and metadata for a previously saved trip.

## Floating-Styled Tab Bar

The application uses the standard Expo Router `Tabs` navigator with custom floating styles.

- **Styling**: Features extreme rounded corners (`borderRadius: 50`) and is positioned above the system navigation bar using absolute positioning.
- **Dynamic Badges**: The tab bar supports dynamic visual indicators:
  - A draft count badge on the Trips tab if a user is actively planning.
  - Notification dots on the Missions and Rewards tabs for new activities.
- **Theme-Aware**: The custom tab bar is fully integrated with the app's theming system, adapting colors smoothly for light and dark modes.

## Stack Animations

The Trips, Missions, Rewards, and Account stacks configure `animation: 'slide_from_right'` for their feature-detail transitions. The Auth and Onboarding stacks do not explicitly configure this animation.
