# In-App Indicators

EGYXplore currently implements visual indicators inside the app. This version does not register for operating-system push notifications.

## Mission and Reward Dots

- A small dot can appear on **Missions** when a newly added mission is received while the app has a live connection.
- A small dot can appear on **Rewards** when a newly added reward is received.
- Opening the related tab clears its dot.

Updated or deleted content does not create the same new-item dot.

## Itinerary Count

The **Sanctuaries** tab uses a map icon with a red numbered badge. The number is the count of destinations in your temporary itinerary. It is not a notification count.

Completed mission and redeemed reward totals are shown inside their screens or account statistics, not as tab-bar count badges.

## Disable Dots

Open **Account** → **Settings** and switch mission or reward indicators off. The setting hides the dot only; content still updates while the app is connected.

These preferences are held in memory and can reset when the app restarts.

## App Closed or Disconnected

The dots depend on the app being active and connected to live content updates. This version does not provide device push alerts while the app is closed. After reconnecting, the app attempts to refresh content, but a missed event does not necessarily create a dot.
