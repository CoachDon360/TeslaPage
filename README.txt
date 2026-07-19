COACHDON RADIO — SUPER 70s METADATA WIRING FIX

Upload these three files to the ROOT of the GitHub repository:
- radio.html
- radio-v9.js
- radio-v9.css

Fixes:
- Metadata now runs from the app's actual choose() function.
- Initial station selection waits until the metadata engine is loaded.
- Selecting Super 70s immediately displays 'Checking now playing...'.
- Cinema remains deleted.
- v9 filenames force a fresh Tesla/browser load.

Expected test:
1. Select Super 70s.
2. The title should immediately say 'Checking now playing...'.
3. It will either show live artist/title or fall back to
   'SUPER 70s / Live on 181.FM' if 181.FM blocks browser access.
