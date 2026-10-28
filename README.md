# Production Calculator v2.3 — Consolidated Test Build

TEST BUILD ONLY. Upload these seven files (index.html, app.js, styles.css, brain.js, brain.css, sw.js, README.md) to the *Production-Calculator-Test* GitHub Pages repository root, not the production repo.

Based on the approved two-row iPhone header preview. Production formulas and saved-calculation storage keys retained.

Changes:
- Quick Calculator full-width, non-scrolling iPhone view; last completed calculation, persistent history (up to 200), confirmation before clear, reuse history values.
- Unit Converter: length, weight, volume, temperature, pressure. Existing 8 Quick Calculator conversions retained inside Unit Converter > Original Quick Calculator Conversions; they still display a conversion below the main number when enabled.
- Brain Break: tap the "PRODUCTION CALCULATOR" eyebrow on the Home screen five times in quick succession. Six games: Hangman, Wordle-style, Tic-Tac-Toe, Word Search, Crossword, Trivia. Records stored on the device. Easy/Medium/Hard/Progressive difficulty. Brain Break follows the language in Settings.
- PC keeps existing compact Quick Calculator width. Other production calculator screens and formulas unchanged.

TEST BEFORE PUBLISHING TO MAIN:
1. On iPhone, Quick Calculator keypad fits on screen with no vertical scrolling. Test live preview, '=' and History.
2. Close/reopen browser and check history. Reuse history result and clear with confirmation.
3. Test each Unit Converter category, reverse arrows, original conversions.
4. Home title 5 taps opens Brain Break. Test all six games and return to Home.
5. Confirm Line 3/4, Leg, Stand Alone, Pack All, Saved Calculations and Settings still work.
6. Test both iPhone Safari and desktop browsers.

Known limitations: Records/history use localStorage (per device/browser, not synced); the included service worker caches the app after the first successful online visit, but offline operation should still be tested on the actual iPhone. Wordle-style mode accepts any five-letter guess, not dictionary-validated. Word Search uses tap-start/tap-end rather than drag. Crossword currently has one introductory puzzle per language; trivia has a starter set of 15 questions. These are deliberately small, basic starter games.

## Small UI adjustment (test build 2)
The existing Converter ON/OFF button now appears directly in Quick Calculator between History and Unit Converter. It continues to control the original live conversion beneath the calculator result. The original conversion unit selection remains inside Unit Converter > Original Quick Calculator Conversions. No production formulas were changed.

## v2.3.1 Quick Calculator performance hotfix
- Prevents iOS Safari double-tap zoom on keypad buttons using touch-action manipulation and immediate touchstart handling.
- Avoids rebuilding the complete saved History list on every key press; History is rendered only while open.
- Retains mouse and keyboard click behavior and all existing production math.
- Refreshes offline service-worker cache and CSS/JS cache-busting for rollout.
- Test on the separate GitHub Pages test repository before releasing to the main repository.


## v2.4 HTML integration fix
The index.html now includes JS Studio branding, v2.4 version labels, the What's New modal and Settings button, iPhone home-screen icon metadata, and refreshed asset version tags.


## v2.4 install guide addition
- Bilingual installation instructions in Settings for iPhone/iPad Safari and Android Chrome.
- Optional dismissible browser banner (not shown when installed to Home Screen).
- QR code points to **official** Production Calculator URL, not Test.
- Copy link and What's New access in general Settings.
- Preserve Quick Calculator v2.3.1 touch handling.

## v2.4 manual Refresh App addition (TEST)
- Adds bilingual Refresh App control in general Settings.
- Checks the online HTML endpoint (no-store), asks the service worker to update, and reloads the app.
- Does not delete localStorage, saved calculations, history, or preferences.
- This is a manual reload, NOT a version comparison or a guarantee that a new version exists.
- Test on iPhone Home Screen and Safari before releasing to production.
