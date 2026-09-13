# AR Display Size Visualizer

Point your phone at a desk or wall and see a true-to-scale rectangle for a monitor/TV size, over local wifi, no app install.

## Setup (one-time)

1. Generate a self-signed HTTPS cert (WebXR requires a secure context, and your phone won't accept `localhost` since it's hitting your laptop's LAN IP):
   ```
   node generate-cert.js
   ```
   This detects your LAN IP(s) and bakes them into `cert.pem`'s SAN so the cert matches.

2. Start the server:
   ```
   node server.js
   ```
   It prints the port (8443). Find your laptop's LAN IP (e.g. `ipconfig` on Windows, look for the wifi adapter's IPv4 address).

3. On your phone (same wifi), open `https://<laptop-lan-ip>:8443` in **Chrome for Android**. You'll get a certificate warning — tap **Advanced → Proceed** (or, to avoid seeing this every time: transfer `cert.pem` to the phone and install it under Settings → Security → Encryption & credentials → Install a certificate → CA certificate).

## Use

1. Tap **Start AR**, grant camera permission.
2. Point at a desk/wall until a white ring (reticle) appears on a detected surface.
3. Tap the screen to place the rectangle there.
4. Pick a different size from the dropdown — it resizes in place.
5. Tap a different surface to move it there.
6. **Reset** clears the current placement.

If your phone/browser doesn't support WebXR AR, the page tells you directly instead of showing a blank screen.

## Dev

- `node test.js` — checks `presetToMeters` against known reference sizes.
- No build step. `public/three.module.min.js` is a vendored local copy of Three.js (r160) so this works with no internet access beyond your home wifi.
- Manual-only: the AR/WebXR rendering path can't be tested in CI or headless browsers — verify on a real phone.
