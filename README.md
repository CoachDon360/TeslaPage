# CoachDon Radio — Tesla QA v3

This revision implements the finalized three-section visual system:

- **Music ♪** in 2004 iPod blue
- **Disney** in a soft red script with a Mickey-button yellow divider
- **Podcasts** in purple with a simple podcast glyph
- No channel numbers
- No station clip art
- White station names
- Black station-list background
- Large Tesla-friendly touch rows
- A small play marker on the selected row
- No animated equalizer bars

## Podcasts included
- The Ramsey Show
- Insight for Living
- Southeast Christian
- Brian Buffini

The podcast entries are visually complete but intentionally marked `SETUP NEEDED` until their preferred direct episode feeds or destinations are connected.

## Upload
Replace the existing `index.html`, `styles.css`, and `app.js` in the repository root.

## Tesla QA
1. Allow GitHub Pages a minute or two to update.
2. Refresh the page in a regular browser first.
3. In the Tesla, reload the page while parked.
4. Confirm all three section headings appear correctly.
5. Confirm rows are easy to tap and the selected row displays a small triangle.
6. Test Music playback and note any streams showing `COULD NOT CONNECT`.
