# AR Display Size Visualizer

I built this because I couldn't tell if a bigger monitor would actually fit my desk, or how much bigger a 65" TV really is compared to my current one. Spec sheets give you inches and a ratio, but that doesn't tell you anything until you're standing in front of it. This does that part for you: point your phone's camera at your desk or wall, and it shows you a life-size outline of the monitor or TV you're considering, right there in the room.

It's a small website you run on your own computer and open on your phone. No app to install, no account, nothing sent anywhere over the internet — it only needs your home wifi.

## How it works, in short

1. Open the page on your phone (in Chrome, on Android).
2. Point the camera at a desk, floor, or wall.
3. Tap the surface once it's detected, pick a size from the list, and a rectangle the exact physical size of that monitor or TV appears there.
4. Move it, tilt it, or stand it up so it lines up with a monitor you already have, to compare directly.

That's it. It's not a 3D model of a monitor, just a correctly-sized flat rectangle with a label — enough to answer "how big is this, actually?"

## Sizes it comes with

| Category | Sizes |
|---|---|
| PC Monitors 16:9 | 24", 27", 32" |
| PC Monitors 16:10 | 24", 27", 32" |
| Ultrawide 21:9 | 29", 34", 38" |
| Super Ultrawide 32:9 | 49", 57" |
| TVs 16:9 | 43", 55", 65", 75", 85" |

## What you need

- An Android phone that supports Chrome's AR mode (most phones from the last several years do). iPhones and other browsers aren't supported — this relies on a feature only Chrome for Android has right now.
- A computer on the same wifi network as your phone, to run the small local server.
- No internet connection is needed beyond that — everything the page needs is stored locally, so it works fine even with your wifi disconnected from the internet.

## Setting it up

1. Generate a local certificate (a one-time step your phone needs to trust the connection):
   ```
   node generate-cert.js
   ```
2. Start the server:
   ```
   node server.js
   ```
   It'll be running at port `8443`. Find your computer's local IP address (on Windows, run `ipconfig` and look for the IPv4 address under your wifi adapter).
3. On your phone, on the same wifi, open `https://<your-computer's-ip>:8443` in Chrome.
   - You'll see a warning because the certificate is self-signed — tap **Advanced → Proceed**. This is expected and safe on your own network.
   - If you don't want to see that warning each time, you can install `cert.pem` on the phone as a trusted certificate (Settings → Security → Encryption & credentials → Install a certificate).

No installs, no dependencies, nothing to download — the server is a few lines of plain Node.js, and everything the page needs is already included in this repo.

## Using it

**Placing it down**
1. Tap **Start AR** and allow camera access.
2. Point at a desk, floor, or wall until a white ring shows up — that means it's found a surface.
3. Tap the screen to place the rectangle there. It locks in place so you don't accidentally knock it around while adjusting things.
4. Change the size from the dropdown any time — it resizes without you needing to re-place it.

**Lining it up with your actual monitor**
- **Stand Up**: it starts lying flat like it's sitting on the desk. Hold the pitch button to tilt it upright.
- Move it left/right, up/down, closer/farther, and rotate it on any axis, until it lines up with the real monitor in front of you.
- Tap a button for a small nudge, or hold it down to keep moving continuously.
- **Change Surface** unlocks it so you can tap somewhere else instead.
- **Reset** clears everything so you can start over.

If your phone or browser can't run this, it'll tell you directly instead of just showing a blank screen.

## For anyone who wants to look under the hood

This is a static site: `public/index.html`, `public/app.js`, and `public/presets.js`, using [Three.js](https://threejs.org/) and the browser's [WebXR](https://immersiveweb.dev/) API (`immersive-ar` session with hit-testing) to do the camera/AR/rendering work. `server.js` is a minimal Node `https` static file server — no framework, no build step, no package manager involved anywhere.

Display sizes aren't hard-coded, they're computed from diagonal inches + aspect ratio through one small formula in `presets.js`, so adding a new size or category is a one-line change. `node test.js` checks that formula against known reference values. The actual AR/camera behavior can only be verified on a real phone — there's no way to test WebXR in CI or a headless browser.

The whole thing is done using AI. the spec file is also included (could be outdated), could help understand the vision of the project more clearly. 

## What this isn't

Not a native app, not a realistic 3D monitor model, not something with accounts or tracking or ads, not meant to be hosted publicly — it's a personal tool for figuring out if a display fits, built to run on your own network for whoever wants to use it.

## Using or changing this yourself

Everything here is free to use, copy, or modify for your own needs — take it, change it, point it at your own use case.
