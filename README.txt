AtMOUSEpheres Split-Screen Build
=================================

WHAT THIS BUILD DOES
- Keeps the station launcher visible on the left.
- Opens the immersive now-playing experience on the right.
- Uses the uploaded Sorcerer Radio and DParkRadio artwork.
- Places each channel name below the icon in white.
- Removes the left-panel volume slider, as requested.
- Includes direct browser-playable radio streams where a stable public URL
  could be verified.

CHANNELS INCLUDED
Sorcerer Radio
Atmospheres
Loop’d
Rope Drop
DPark Main
Background
Guest TV (Resort TV)
Holiday / Main Street

IMPORTANT STREAM NOTE
Seven direct streams are included. Sorcerer Radio's current public pages list
Loop’d as an active channel, but a stable direct stream endpoint was not
publicly exposed during this build. The Loop’d tile and player are fully wired;
only its stream value remains blank in app.js rather than inserting a guessed
or unreliable address.

DEPLOYMENT
Upload these files together to the root of your TeslaPages repository:
- index.html
- styles.css
- app.js
- sorcerer-radio-icon.png
- dparkradio-icon.png

If your existing CarPlay home page must remain index.html, rename this build's
index.html to atmousepheres.html before uploading and update the Home link in
index.html accordingly.
