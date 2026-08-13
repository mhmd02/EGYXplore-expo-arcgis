# Coding Guidelines

## Project Conventions

- Use `.jsx` for React Native screens and components and `.js` for non-UI modules.
- Keep route files under `app/` and shared UI under `components/`.
- Keep backend calls in `api/`; do not place raw feature API requests inside unrelated components.
- Use existing contexts before introducing another global state mechanism.
- Follow the current double-quote and trailing-comma style.
- Prefer small, focused changes and preserve existing loading/error behavior.

## API Changes

- Add a domain function to the appropriate `api/*Api.js` file.
- Include the bearer token for protected requests.
- Check both HTTP status and the response contract where applicable.
- Surface useful errors without exposing tokens, credentials, or raw private payloads.
- Update `docs/integrations/backend-api.md` when adding or changing an endpoint.
- Keep URL construction centralized; do not repeat the current AI exception in new modules.

## State Changes

- Keep screen-only state in the screen.
- Use a context when multiple routes consume or mutate the same state.
- Define initial, loading, empty, success, and error values explicitly.
- Do not silently replace valid state with empty state before asynchronous hydration completes.
- Document whether data is server-persisted, device-local, or memory-only.

## Permissions and Media

- Request permissions at the user action that needs them.
- Handle denied, cancelled, and unavailable results separately.
- Avoid reusing profile-specific permission text for AI or mission flows.
- Do not log image, audio, token, or profile payloads.
- Update `app.json` and rebuild native projects when native permission configuration changes.

## ArcGIS Changes

- Keep layer URLs and field names in `config/arcgis.js`.
- Verify the layer geometry type, spatial reference, fields, visibility, renderer, and scale behavior.
- Test feature queries, identify, search, route failure, and empty layer states.
- Rebuild the native development app after changing `expo-arcgis` or its plugin configuration.

## Documentation and Review

Update documentation in the same change when behavior changes:

- User behavior: `docs/user-guide/`
- Architecture: `docs/architecture/`
- External services: `docs/integrations/`
- Setup or release: `docs/setup/` or `docs/development/`

Before review, run `git diff --check`, inspect the diff, and verify that no `.env`, signing file, or credential is included.
