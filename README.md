# CoachDon Radio — Tesla QA Prototype

This is a single-page, Tesla-browser-friendly radio interface based on the approved mockup.

## What is included
- Vertical station menu
- One consistent font family
- Colored station names
- No channel numbers or 181.FM branding
- Separate Disney section
- Large, clean station panel
- Minimal now-playing area
- Bottom playback controls
- Larger Tesla-friendly station touch targets
- Favorites stored from the bottom player heart
- Responsive layout for desktop and Tesla browser sizes
- Clear on-screen message when a stream URL fails or still needs to be added

## Important QA note
The interface is ready to test. Live-stream URLs can change, and some providers block browser playback or require a different HTTPS endpoint. The Disney entries are intentionally marked for stream setup until the exact current URLs are confirmed.

## GitHub Pages deployment
1. Open your Radio repository on GitHub.
2. Remove old prototype files if this is a replacement.
3. Upload `index.html`, `styles.css`, and `app.js` into the repository root.
4. Open **Settings → Pages**.
5. Select **Deploy from a branch**, branch **main**, folder **/(root)**.
6. Save and wait for the published link.
7. Open the link in the Tesla browser while parked.

## Tesla QA checklist
- Confirm the entire page fits without browser zoom.
- Scroll the station menu.
- Tap every station.
- Check that station changes are immediate.
- Test Play/Pause.
- Test Next/Previous.
- Test volume.
- Favorite two stations, reload the page, and confirm hearts remain.
- Note every station that says `COULD NOT CONNECT`.
- Check whether the Home button returns to CoachDon CarPlay.
- Test in both daylight and darkness.

## Editing a stream
Open `app.js`, find the station, and replace its `stream` value.

Example:
```js
{"id":"soul","name":"Soul", ... ,"stream":"https://new-stream-address.mp3"}
```

## QA revision 2
- Removed the animated equalizer bars.
- Increased each station row to a larger touch target.
- Removed hearts from the station list so the whole row is easier to tap.
- Slightly increased station-name size.
