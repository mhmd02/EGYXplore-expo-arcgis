# EGYXplore Architecture Overview

This document provides a comprehensive overview of the EGYXplore mobile application architecture, detailing the technology stack, system design, state management, authentication flows, and key design decisions. It is intended for project reviewers and developers to understand the core structural foundations of the application.

## Tech Stack

The application leverages a modern, robust technology stack tailored for cross-platform mobile development and rich geographic features.

- **React Native (0.86.0)**: The core framework for building the native iOS and Android application.
- **Expo SDK 57**: Provides managed tooling and APIs.
- **Expo Router (Expo SDK 57 package line)**: File-based routing for React Native, simplifying navigation.
- **expo-arcgis (^0.3.3)**: Wraps the native ArcGIS Maps SDK for advanced mapping capabilities.
- **@microsoft/signalr (^10.0.0)**: Enables negotiated real-time communication with the backend hub.
- **expo-secure-store**: Used for encrypted on-device storage (JWT tokens).
- **react-hook-form + zod**: Manages form state and validation schemas.
- **Expo Modules**: `expo-location`, `expo-image-picker`, `expo-audio`, `expo-file-system`.
- **Backend**: ASP.NET Core MVC (REST API).

## System Architecture

The following diagram illustrates the high-level architecture of the EGYXplore system, showing the interaction between the mobile app layers, backend infrastructure, and external services.

```mermaid
flowchart TD
    subgraph Mobile App
        UI[UI Layer\n(Screens & Components)]
        State[State Layer\n(7 Context Providers)]
        API[API Layer\n(fetch modules)]
        Realtime[SignalR Hook]
        
        UI <--> State
        State <--> API
        State <--> Realtime
    end

    subgraph Backend Services
        NET[ASP.NET Core Controllers]
        Services[Business Logic / Services]
        DB[(SQL Database)]
        
        API <-->|REST API| NET
        NET <--> Services
        Services <--> DB
    end
    
    subgraph External & Real-Time Services
        ArcGIS[ArcGIS Runtime SDK]
        SignalR[SignalR Hub]
        AIChat[AI Chat Service]
        
        UI <-->|Native Map Rendering| ArcGIS
        Realtime <-->|Negotiated SignalR transport| SignalR
        API <-->|Multipart request / JSON response| AIChat
    end
```

## Root Layout & Provider Hierarchy

The application state is managed using React Context API. The root of the application currently wraps all routes in seven providers.

```jsx
<ThemeProvider>
  <UserProvider>
    <ProgressProvider>
      <SettingsProvider>
        <UriProvider>
          <ContentProvider>
            <TripDraftProvider>
              {/* App Routes */}
            </TripDraftProvider>
          </ContentProvider>
        </UriProvider>
      </SettingsProvider>
    </ProgressProvider>
  </UserProvider>
</ThemeProvider>
```

### Why Provider Order Matters
Part of the nesting order is required because some inner providers consume outer context:
- `ContentProvider` relies on the authentication token managed by `UserProvider` to fetch secure content.
- `TripDraftProvider` relies on the `userId` exposed by `UserProvider` to associate drafted trips with the correct user.
- `ProgressProvider` also consumes the token from `UserProvider`.
- `ThemeProvider` is placed at the top so all rendered UI can consume the active theme; the other providers do not currently depend on it.

## Entry Point & Auth Gate

The frontend uses local authentication-state guards to control navigation. Backend authorization remains responsible for validating the JWT on protected requests.

- **`app/index.jsx`**: Acts as the initial entry point. It checks for the presence of a `token` and `user` object from the `UserContext`.
  - If authenticated: Automatically redirects the user to `/(main)/explore`.
  - If not authenticated: Renders the landing page displaying "Sign in" and "Sign up" buttons.
- **`app/(main)/_layout.jsx`**: The authenticated layout redirects to `/(auth)/login` when the local `user` or `token` value is absent. It does not validate token expiry itself.
- **`app/(onboarding)/_layout.jsx`**: Similarly enforces authentication. Unauthenticated users attempting to access onboarding are redirected to `/login`.

## Session Persistence

User sessions are maintained securely on the device across app restarts.

- **Encrypted Storage**: The JWT token is persisted using `expo-secure-store`, ensuring it is encrypted on-device.
- **Initialization**: On application boot, the `UserProvider` reads the token and serialized user data from `expo-secure-store` to rehydrate the context state.
- **Profile Refresh**: The application automatically fetches the latest user profile from the `/MobileAccount/profile` endpoint on every app start, ensuring local state remains synchronized with backend changes.
- **Current limitation**: If startup profile refresh fails, the cached user and token remain in local state. Most API modules do not globally clear the session on HTTP 401; the AI screen handles its authentication error explicitly.

## Design Decisions

- **Context API over Redux**: Selected for simplicity. The application requires 7 modular domains of state. Context API provides a straightforward, boilerplate-free way to manage this without the overhead of Redux.
- **Native fetch over Axios**: The native `fetch` API is lightweight and perfectly sufficient for the application's REST needs. Using it avoids an additional third-party dependency.
- **Expo Router over React Navigation**: Expo Router brings file-based routing to React Native. It offers a simpler mental model (folders map to routes) and built-in deep linking, which is cleaner than manually configuring React Navigation stacks.
- **Custom Dev Builds for expo-arcgis**: `expo-arcgis` includes native code that is not bundled with Expo Go. A custom development build, produced with EAS Build or local prebuild, is therefore required.

## Scope and Limitations

- The diagram represents the frontend's observed contracts with the ASP.NET Core API. Backend controller, service, database, and SignalR publication details should be verified against the backend repository.
- The app currently relies on local presence of cached authentication data for route guarding; it has no centralized interceptor for expired tokens.
- API requests have no shared timeout, cancellation, retry, or offline queue.
- The AI API uses a different base-URL construction from the other REST modules; see `docs/integrations/backend-api.md`.
