COACHDONXM — FOUR UI FIXES (v9.0.1)

This patch is based on the approved v9 UI and does not replace or rewrite the
working radio-v9.js metadata/streaming engine.

CHANGES
1. Yacht is displayed in mixed case as “The Yacht.”
2. The Soul station is displayed simply as “Soul,” with no 181.FM reference.
3. The station name on the right side is approximately 30% smaller.
4. Metadata fields are given stable heights and all metadata animations/
   transitions are disabled to stop the Safari bounce.

UPLOAD
Upload these three loose files to the ROOT of the GitHub repository:

- radio.html
- coachdon-ui-fixes.css
- coachdon-ui-fixes.js

Replace the existing radio.html when GitHub asks.

DO NOT DELETE
Keep the existing files already in the repository:

- radio-v9.css
- radio-v9.js

After committing, refresh Safari with Command-Shift-R. In the Tesla browser,
reload the page normally. The ?v=9.0.1 references in radio.html help defeat cache.
