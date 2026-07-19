COACHDONXM — ORGANIZED MASTER BUILD

UPLOAD ALL SIX FILES TO THE ROOT OF YOUR GITHUB REPOSITORY:

- index.html
- radio.html
- styles.css
- stations.js
- metadata.js
- app.js

Do not upload only radio.html. These files work together.

WHAT EACH FILE DOES
- index.html: Opens CoachDonXM and provides cache-busting.
- radio.html: The clean page structure. It should rarely need editing.
- styles.css: All layout, colors, typography, and responsive behavior.
- stations.js: The entire channel lineup, stream URLs, names, descriptions, and bitrates.
- metadata.js: Super 70s/181.FM and SomaFM metadata retrieval.
- app.js: Playback, favorites, controls, status indicators, fallback streams, clock, and metadata timing.

SUPER 70s
- Channel 7 is now consistently named Super 70s.
- Stream: 181-70s_128k.mp3
- Metadata checks every 20 seconds.
- Shows artist and song when 181.FM permits browser access.
- Falls back to “Live on 181.FM” when metadata is blocked.

STATUS DISPLAY
- Green: LIVE
- Yellow: CONNECTING or BUFFERING
- Red: OFFLINE
- Shows bitrate and metadata age.

IMPORTANT
This package preserves the 34-channel Road Trip lineup from the July 17 build.
Some station endpoints were already placeholders or shared streams in that saved build. This reorganization preserves them rather than inventing replacements.


VERSION 1.1 — SUPER 70s TEST
The player now reports one of these exact outcomes:
- Metadata received
- Metadata blocked by station
- Metadata request timed out
- Metadata unavailable

Laptop test:
1. Upload every file.
2. Hard refresh the page.
3. Play Channel 7 Super 70s.
4. Wait up to 20 seconds and read the status beneath the artist line.
