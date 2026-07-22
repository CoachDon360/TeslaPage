ATMOUSEPHERES — FINAL ARTWORK CODE BUILD

CONTENTS
- atmousepheres.html
- atmousepheres.css
- atmousepheres.js
- atmousepheres-final.png

WHAT THIS BUILD DOES
- Uses the exact approved final artwork.
- Adds responsive clickable hotspots to all eight cards.
- Updates the lower player title and subtitle when a card is selected.
- Makes previous, play/pause, next, volume, and home controls interactive.
- Supports arrow keys, Enter, and Space on a keyboard.
- Scales to Safari, Tesla Browser, tablets, and phones.
- Includes visible focus and selection feedback.

DEPLOYMENT
1. Unzip the package.
2. Upload all four files to the ROOT of your GitHub Pages repository.
3. Replace older AtMOUSEpheres files with these.
4. Link your Disney icon to:
   atmousepheres.html
5. Commit the changes.
6. Refresh Safari or clear the Tesla browser cache if an old version remains.

ADDING STREAMS OR SUBPAGES
Open atmousepheres.js and edit the destinations object.

Example stream:
"Classic Attractions": {
  streamUrl: "https://example.com/live.mp3",
  pageUrl: ""
}

Example category page:
"Classic Attractions": {
  streamUrl: "",
  pageUrl: "classic-attractions.html"
}

The page is fully functional now; final live audio links can be added without
changing the visual design.
