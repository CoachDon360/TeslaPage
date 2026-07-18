# CoachDon CarPlay 1.0 Beta

This is a complete replacement package for the existing GitHub Pages repository.

## What is preserved
- CoachDon CarPlay remains the home launcher (`index.html`)
- Existing Home, Restaurants, Entertainment, and Real Estate pages remain intact
- Existing icon files remain included

## What changed
- `radio.html` is now the redesigned CoachDon Radio app
- All station names are white
- Music uses 2004 iPod blue
- Disney uses soft red script and a yellow divider
- Podcasts use purple and include only:
  - The Ramsey Show
  - Insight for Living
  - Southeast Christian
  - Brian Buffini
- The Radio Home button returns to CoachDon CarPlay
- Radio uses new cache-busted filenames:
  - `radio-v4.css?v=4.0.1`
  - `radio-v4.js?v=4.0.1`

## Upload instructions
Delete the existing repository files, then upload every file from this package into the repository root.

Do not create or upload an `apps` folder. This package intentionally uses a flat structure because it is easier to upload through GitHub.

After GitHub Pages finishes publishing:
1. Open the normal CoachDon CarPlay URL.
2. Confirm the launcher appears.
3. Tap Radio.
4. Confirm all station names are white and the Podcasts section has four entries.


## Final UI color update
- Disney word: `#F2C94C`
- Disney divider: `#D65A54`
- Play button: `#F2C94C`
- Volume slider: `#F2C94C`
- Cache version bumped to `4.0.2`


## Mint Disney UI update
- Disney label and divider: `#3DD9C5`
- Disney label uses a Walt-inspired script fallback stack
- Disney label font size: `21px`, matching Music
- Gold play button and volume slider remain unchanged
- Cache version bumped to `4.0.3`
