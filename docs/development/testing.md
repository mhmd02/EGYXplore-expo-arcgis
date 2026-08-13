# Testing Guide

## Current Tooling

`package.json` currently provides `start`, `android`, `ios`, and `web` scripts. It does not define an automated test, lint, or type-check script. The current verification process is therefore primarily manual.

## Before Testing

1. Install dependencies with `npm install`.
2. Configure `.env`.
3. Start the backend and verify it is reachable from the target device.
4. Build a native development client.
5. Use a test account and non-sensitive test media.
6. Record the platform, app build, backend version, device, and environment.

## Authentication Checklist

- [ ] Landing screen opens.
- [ ] Registration validates required fields.
- [ ] Password rules and confirmation errors display correctly.
- [ ] Successful registration opens onboarding.
- [ ] `Skip All` opens Explore.
- [ ] Login opens Explore.
- [ ] Session restoration works after restarting the app.
- [ ] Logout clears the local session.
- [ ] AI 401 handling clears the session and shows the expiry alert.

## Explore Checklist

- [ ] Basemap loads.
- [ ] Destination and branch layers render.
- [ ] Landmarks and Branches visibility controls work.
- [ ] Local search suggestions appear after two or more characters.
- [ ] Destination and branch popups show available fields.
- [ ] Details opens the destination page.
- [ ] Add toggles the itinerary state.
- [ ] Geocoder fallback opens a searched-place popup.
- [ ] Location permission denial is handled.
- [ ] Current location centers after a GPS fix.
- [ ] Route line appears with a valid current location.
- [ ] No-route and map-error states are understandable.

## Trips Checklist

- [ ] Destination cards load and filter.
- [ ] Itinerary draft persists for the current account after restart.
- [ ] Draft is isolated between accounts.
- [ ] Initial trip stops can be reordered.
- [ ] Empty, invalid, and duplicate actions behave correctly.
- [ ] Title, budget, companions, and date validation works.
- [ ] Trip creation success clears the draft.
- [ ] Saved trips load, retry, refresh, and display empty state.
- [ ] Saved-trip destinations can be added or removed.
- [ ] Removing the final saved-trip destination is rejected.
- [ ] Trip completion updates status and returned rewards.
- [ ] Trip deletion requires confirmation and updates the list.

## Missions and Rewards Checklist

- [ ] Available missions exclude completed missions.
- [ ] Mission details show the configured requirement.
- [ ] Camera permission and cancellation are handled.
- [ ] Three photos enable verification.
- [ ] Pending, pass, and fail photo states display correctly.
- [ ] Failed photos can be retaken.
- [ ] Verification failure does not incorrectly complete a mission.
- [ ] Successful completion updates mission progress and points.
- [ ] Available rewards show balance and affordability.
- [ ] Insufficient-point rewards are locked.
- [ ] Redeemed rewards appear in history.
- [ ] Successful redemption displays the voucher code.
- [ ] Redemption failure leaves the user able to retry.

## AI Checklist

- [ ] Empty assistant state displays correctly.
- [ ] Text-only messages send.
- [ ] Image-only or audio-only messages send if supported by the service.
- [ ] Camera/gallery permission handling works.
- [ ] Multiple image attachments can be removed individually.
- [ ] Microphone permission and recording failure are handled.
- [ ] History list loads, including empty state.
- [ ] A stored session loads.
- [ ] Start New Chat clears the current view without deleting server history.
- [ ] Non-authentication errors are visible.
- [ ] Authentication expiry signs out the user.

## Account and Permission Checklist

- [ ] Profile information loads with empty/default values.
- [ ] Supported fields can be edited and saved.
- [ ] Phone and email remain read-only.
- [ ] Profile image gallery selection and upload failure work.
- [ ] Theme changes apply immediately.
- [ ] Settings confirmation is shown and persistence behavior is understood.
- [ ] Help contact and hotline actions work on a supported device.
- [ ] Location, camera, photo, and microphone denial flows are tested.

## Regression Evidence

For each release candidate, save:

- Device and OS version
- Platform and build identifier
- Backend URL/environment name
- Test account identifier without password
- Steps to reproduce failures
- Expected and actual result
- Redacted logs or screenshots
