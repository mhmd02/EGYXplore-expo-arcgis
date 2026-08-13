# Trips & Itineraries

## Key Terms

- **Itinerary:** A temporary list of selected destinations stored locally on this device for the signed-in account.
- **Saved trip:** A trip successfully stored by the application service.
- **Completed trip:** A saved trip marked as finished. Its destinations cannot be edited, but the trip can still be deleted.

## Browse Destinations

1. Open **Sanctuaries**.
2. Browse destination cards or use the category filters.
3. Tap **Add to Itinerary** on a card, or open a destination and use its itinerary action.

The card action changes to **✓ Added**. On a destination detail page it changes to **Added to Itinerary**. Tap it again to remove the destination.

Your temporary itinerary is device-local and account-specific. It does not automatically synchronize across devices.

## Create a Trip

1. Add at least one destination.
2. Open the trip-creation action in the Sanctuaries header.
3. In **Trip Details**, enter a trip name. Budget, companions, start date, and end date are optional.
4. In **Chosen (number)**, review the selected destinations.
5. Drag stops to reorder them during initial trip creation.
6. Remove a stop with its remove control, or use **Clear all**.
7. Tap **Save Trip**.

Validation prevents saving when the title is empty or longer than 100 characters, budget is negative/non-numeric, companions are not a whole number from 1 to 100, or the end date is before the start date. The application service can apply additional checks.

Saving successfully shows the trip name and stop count. The temporary itinerary is cleared, and **View my trips** opens the saved-trip list.

## Empty Itinerary

Opening trip creation with no destinations shows **No destinations yet** and a **Browse destinations** action. The action returns to the previous screen.

## View Saved Trips

Open the saved-trips action in the Sanctuaries header. A trip card can show its title, status, dates, stop count, companions, and budget. The list has loading, error, empty, and retry states. Pull-to-refresh is available on this saved-trip list.

## View Trip Details

Tap a saved trip. The detail page can show the title, status, date range, stop count, budget, companions, and itinerary stops with their order and destination information.

## Edit Trip Destinations

For an uncompleted saved trip:

1. Tap **Edit itinerary**.
2. Remove existing stops or add available destinations.
3. Tap **Save** or **Cancel**.

Saved-trip editing does not provide the same drag-to-reorder control as initial trip creation. A saved trip must contain at least one destination; removing the final stop causes saving to fail.

Completed trips cannot be edited.

## Complete a Trip

Open an uncompleted trip and tap **Mark completed**. If the request succeeds, the app shows the returned XP and any newly unlocked badges. A completed trip cannot be edited, but it can still be deleted.

## Delete a Trip

Tap **Delete trip** on the trip detail page and confirm. Deletion is intended to be permanent from the app's perspective.

## If Something Goes Wrong

- Check your connection when destinations, saved trips, or trip details fail to load.
- Use **Try again** where it appears or pull to refresh the saved-trip list.
- Read the inline error after saving, updating, completing, or deleting.
- Keep at least one destination before saving itinerary changes.
