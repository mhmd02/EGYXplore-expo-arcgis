# Explore & Search

Explore contains a map initially centered on Cairo. It shows the configured destination and branch markers. The exact places available depend on the map data currently provided to the app.

## Map Layers

- **Landmarks:** Destination markers.
- **Branches:** Tourism branch markers.

Use the **Landmarks** and **Branches** controls below the search bar to show or hide each layer. The map itself supports normal map gestures such as moving and zooming when available on your device.

## Search

1. Tap the search bar.
2. Enter at least two characters to see local suggestions.
3. Suggestions can be labeled **Landmark** or **Branch** and are limited to the first five matches.
4. Tap a suggestion, or submit the search to continue.

The app first searches its destination and branch data. If there is no local match, it may use place search to find a general location. A general searched place shows a note that it is a searched place rather than full tourism details.

## Open a Popup

Tap a marker to open its popup. A destination popup can show its name, governorate, category, and ticket price. A branch popup can show its name, address, and contact number. Missing information may appear as `Unknown City`, `No Phone Provided`, or another unavailable-value message.

## Popup Actions

- **Details:** Opens the separate destination details page.
- **Navigate:** Requests and displays a route from your current location. It does not open turn-by-turn navigation.
- **Add:** Adds a destination to the temporary itinerary. If it is already there, the action can remove it and shows its stop number.

General searched places and branches have a **Navigate** action, but not destination-detail or itinerary actions.

## Current Location

Tap the location button to move the map to your current position. Location access and an available GPS fix are required. If the app is still waiting for a fix, it shows a waiting message rather than moving immediately.

## Routes

Routes need both a destination and a current location. If location access is denied, location services are off, there is no GPS fix, the network is unavailable, or no route is found, no route line will be displayed. The Navigate button remains visible, but it cannot produce a route without a starting point.

## Map Loading States

The screen can show:

- A map-loading message.
- A map error message.
- A message that map layers are not configured.

If the map or markers do not load, check your connection and see [Troubleshooting](./troubleshooting.md).

[Next: Destinations & Branches](./destinations-and-branches.md)
