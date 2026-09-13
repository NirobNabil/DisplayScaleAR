# AR Display Size Visualizer — Local Website Spec

## Problem Statement

I want to know how big a monitor or TV of a given size (e.g. "32-inch 16:9" or "65-inch 16:9") will actually look on my desk or wall before buying it. I don't want to install a native app — I want to open a page on my phone, point the camera at a surface, and see a rectangle at the true physical size.

## Solution

A single-page website, served locally on my home network (e.g. `node server.js` on my laptop), that I open in Chrome on my phone over wifi. It uses WebXR (Chrome for Android's AR mode) to detect surfaces, let me tap to place a flat rectangle sized to real-world meters based on a selected diagonal + aspect ratio preset, and lets me swap sizes/presets in place.

No native app, no build step beyond static files, no backend logic beyond serving files.

## User Stories

1. As a user, I want to open a URL on my phone browser and immediately start an AR session, so that I don't need to install anything.
2. As a user, I want to point my phone at a desk or wall and see the camera feed with a "tap a surface to place" hint, so that I know what to do.
3. As a user, I want to tap a detected surface and see a flat rectangle appear there, so that I can visualize a display in that spot.
4. As a user, I want the rectangle's real-world width and height to match the true physical dimensions of the selected display size, so that the comparison is meaningful.
5. As a user, I want to pick a size from a simple list (grouped by PC Monitors 16:9, PC Monitors 16:10, Ultrawide 21:9, Super Ultrawide 32:9, TVs 16:9), so that I can quickly try common sizes.
6. As a user, I want to change the selected size after placing and see the rectangle resize in place around the same anchor point, so that I can compare sizes without re-placing.
7. As a user, I want to tap a different surface to move the rectangle there, so that I can compare a desk placement vs a wall placement.
8. As a user, I want a small label on the rectangle showing the size and computed physical dimensions (e.g. "32\" 16:9 — 70.8 × 39.8 cm"), so that I can verify what's being shown.
9. As a user, I want a Reset button that clears the current placement, so that I can start over.
10. As a user, I want to be told clearly if my phone/browser doesn't support WebXR AR, so that I'm not left staring at a blank screen.
11. As a user, I want everything to work with no internet access (only my local wifi), so that this works anywhere at home.

## Implementation Decisions

- **Stack**: One static HTML file + one JS file (vanilla JS + Three.js via a single CDN-free local copy, or inline). No framework, no bundler, no build step.
- **Server**: A single trivial static file server (`node server.js` using only `http`/`fs`, or Python's `http.server` if simpler) run on the laptop. No routes, no API, no database.
- **HTTPS requirement**: WebXR requires a secure context. `localhost` is exempt but a phone hitting the laptop's LAN IP is not — the server must serve HTTPS with a self-signed cert (e.g. via `mkcert` or a generated cert checked into the repo for local dev use only). The implementer should pick whichever is less code; document the one-time step of trusting the cert on the phone in the README.
- **AR engine**: WebXR Device API, `immersive-ar` session, `hit-test` feature for surface detection, using Three.js for rendering (plane geometry + edges + a canvas-texture label). Do not use A-Frame or a heavier framework — Three.js alone is enough.
- **Size math**: Single pure function `presetToMeters(diagonalInches, aspectW, aspectH)` computing:
  - `width = diagonalInches * aspectW / sqrt(aspectW² + aspectH²) * 0.0254`
  - `height = diagonalInches * aspectH / sqrt(aspectW² + aspectH²) * 0.0254`
  - No hard-coded width/height tables — always derived from this formula.
- **Preset data**: A single flat array of `{ name, diagonalInches, aspectW, aspectH, category }` objects in one JS file, matching the categories and sizes listed in the original draft (PC Monitors 16:9, PC Monitors 16:10, Ultrawide 21:9, Super Ultrawide 32:9, TVs 16:9). Easy to extend by adding array entries.
- **State**: One rectangle exists at a time. Selecting a new preset while placed recomputes width/height around the existing anchor pose (same position/orientation), it does not move or re-anchor.
- **Placement**: Hit-test result pose on tap → create/update the mesh at that pose, oriented to match the hit-test pose's orientation (so it lies flat on horizontal or vertical surfaces as detected).
- **UI**: A bottom overlay with a `<select>` (or simple button that opens a plain list) for size, and a Reset button. No routing, no settings page, no onboarding.
- **No accounts, no analytics, no network calls beyond serving the static files.**

## Testing Decisions

- One small pure-function test file (plain `assert`-based, e.g. `node test.js`, no test framework) for `presetToMeters`, checking the known reference values from the original spec (27" 16:9 → ~59.77×33.62cm, 32" 16:9 → ~70.84×39.85cm, 34" 21:9 → ~79.50×34.07cm, 49" 32:9 → ~119.65×33.65cm, 65" 16:9 → ~143.92×80.96cm).
- No automated test for the WebXR/AR rendering path — that must be manually verified on a real phone (AR sessions cannot run in CI or headless browsers). The README should note this as a manual verification step.

## Out of Scope

- Native Android/iOS app.
- Realistic monitor/TV 3D models, bezels, stands, screen content.
- Multiple simultaneous rectangles.
- Cloud anchors, room scanning, furniture/desk auto-detection.
- Accounts, analytics, ads, external network calls.
- Portrait-orientation displays.
- Depth-based occlusion (nice-to-have only if it falls out of the WebXR API for free; do not build extra code for it).
- Public hosting/deployment — this is local-network-only, for personal use.

## Further Notes

- Target browser: Chrome for Android on an ARCore-capable phone (WebXR `immersive-ar` support). No cross-browser/iOS support needed.
- Implementer instruction: build this without spawning subagents, and stay as token-efficient as possible — this is a small, single-purpose static site, not a multi-file application. Prefer the fewest files and least code that satisfies the user stories above.
- The original draft in this file described a full native Kotlin/ARCore Android app; that approach is replaced by this simpler website since the user only needs local-wifi phone access, not an installed app.
