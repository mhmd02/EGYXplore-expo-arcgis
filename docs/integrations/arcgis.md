# ArcGIS Integration

This document outlines the ArcGIS integration for the EGYXplore application, detailing the switch to a native SDK and the configuration of mapping features.

## Why a Native ArcGIS Development Build?

The app uses `expo-arcgis` to render ArcGIS maps and operational feature layers through native SDK components. Because this native module is not included in Expo Go, EGYXplore requires a custom development build.

## Implemented ArcGIS Functionality

- Native basemap rendering with theme-aware light and dark basemaps
- Destination and branch `FeatureLayer` components
- Custom point renderers and scale-dependent labels
- Feature queries for local search suggestions and matching
- ArcGIS geocoding fallback for external place searches
- Map identify on tap and selected-feature highlighting
- Geometry projection to WGS84 for search navigation
- Current-location display and a two-stop route from the user to a destination
- Graphics overlays for search markers, highlights, and route geometry

The ArcGIS SDK may support additional capabilities such as offline maps, geodatabases, barriers, and broader spatial analysis. Those capabilities are not currently implemented by EGYXplore and should not be presented as delivered features.

## Configuration

The ArcGIS settings are defined in `config/arcgis.js`:

- `ARCGIS_API_KEY`: Developer API key required for authenticating with ArcGIS services.
- `ARCGIS_LICENSE_KEY`: Lite license key (e.g., `nativelite,...`) used for runtime licensing.
- `DESTINATIONS_PORTAL_ID`: Read from the environment and imported by Explore, but not currently used to construct the map.
- `FEATURE_LAYERS.destination`: URL for the feature layer displaying tourist destinations.
- `FEATURE_LAYERS.branches`: URL for the feature layer displaying related branches.
- `LAYER_FIELDS.destination`: Configured to `'English_Name'`.
- `LAYER_FIELDS.branches`: Configured to `'Name'`.
- `MAP_CENTER`: Provides the initial Cairo latitude and longitude. Explore currently uses `scale: 250000`; the configured `zoom` value is not consumed.

## Environment Variables for ArcGIS

The following environment variables are used directly by the current map:

- `EXPO_PUBLIC_ARCGIS_API_KEY`
- `EXPO_PUBLIC_ARCGIS_LICENSE_KEY`
- `EXPO_PUBLIC_ARCGIS_DESTINATIONS_URL`
- `EXPO_PUBLIC_ARCGIS_BRANCHES_URL`

The following values exist in configuration but are not currently applied by the map implementation:

- `EXPO_PUBLIC_ARCGIS_DESTINATIONS_PORTAL_ID`
- `EXPO_PUBLIC_ARCGIS_ROUTE_SERVICE_URL`

`routing.solveRoute(stops)` currently omits `routeServiceUrl`, so `expo-arcgis` falls back to its default ArcGIS World Route Service.

## ArcGIS Services Used

The application integrates with the following ArcGIS services:

1. **Feature Service (Destinations)**: Hosted on ArcGIS Online (`services3.arcgis.com`).
2. **Feature Service (Branches)**: Hosted within the same organization.
3. **Route Service**: Uses the default route service selected by `expo-arcgis`; the configured route service environment variable is not passed by the current code.

## Map Component

The production mapping interface is implemented in `app/(main)/explore.jsx`. It owns `MapSettings`, `Map`, both feature layers, `MapView`, search, geocoding, identify, current location, routing, and graphics overlays. `components/DisplayMap.jsx` is a small Santa Monica example and is not the Explore map.

## Native Build Requirement

> [!WARNING]
> Because `expo-arcgis` includes native C++/Java binaries, the EGYXplore app **CANNOT** run inside the standard Expo Go client.

Developers must follow the standard bare-workflow approach:

1. Run `npx expo prebuild` to generate the native iOS and Android projects.
2. Run `npx expo run:android` or `npx expo run:ios` to compile and launch the development builds on a simulator or physical device.
3. **Note:** Any update to the `expo-arcgis` package version necessitates a fresh native rebuild.

## Security and Privacy

- Every `EXPO_PUBLIC_*` value is embedded in the client and is extractable. ArcGIS API keys must be restricted to the required services and applications where supported, monitored for quota usage, and rotated if exposed.
- Search terms sent through geocoding are transmitted to ArcGIS services.
- Route solving sends the current coordinates and selected destination coordinates to ArcGIS services.
- While Explore is active and location access is granted, the app requests highest-accuracy updates with a 10-second or 3-metre threshold.
- Production documentation should link to the applicable Esri privacy terms and define retention, consent, and deletion expectations.

## Current Limitations

- No offline maps or geodatabase synchronization are implemented.
- Routing is a two-stop solve and does not expose travel-mode selection, barriers, or turn-by-turn tracking in the UI.
- Layer-specific load errors are not surfaced separately from the main map load state.
- The route status string is calculated in state but is not currently displayed.
