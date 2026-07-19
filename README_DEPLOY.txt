COACHDONXM v11.1 — CACHE-PROOF RELAY BUILD

WHY THIS EXISTS
Your console proved the site was still loading the old metadata.js.
That old file still calls player.181fm.com and status-json.xsl directly.

This package uses completely new filenames, so Safari/Tesla cannot confuse
them with the old cached files.

UPLOAD THESE FIVE FILES TO THE SAME FOLDER:

radio.html
coachdon-v11.css
stations-v11.js
metadata-relay-v11.js
app-v11.js

IMPORTANT
Do not rename the four uniquely named asset files.

TEST URL
radio.html?v=11.1.0

WHAT THE CONSOLE SHOULD SHOW
It should NOT contain:
player.181fm.com
status-json.xsl
icecast181

The metadata request should instead go to:
https://coachdon-metadata.74p875syc7.workers.dev/metadata?station=181-70s

Expected lower-panel status:
CHECKING METADATA
then
LIVE METADATA
