# Production Calculator TEST — Change Log
## 2026-11-21 — Quick Seed breakdown Order Details expanded
- User-approved TEST-only change: Order Details in Quick Seed Calculation Breakdown now lists Overpack (%), Chemical (%), Samples (KG), and optional Bag Tare (KG), in addition to Pack Size, PC when applicable, and EA. Empty tare displays Not entered / No ingresada; explicitly entered zero remains zero. No math changes. What's New Build 19 bilingual; mobile/browser verification pending.

## 2026-11-21 — Quick Seed universal total seed label
- User approved TOTAL SEED REQUIRED / SEMILLA TOTAL REQUERIDA for Quick Seed regardless of chemical percentage (Stand Alone may pack previously treated seed). Updated Quick Seed results, breakdown and guide labels in TEST only; formulas unchanged. What's New Build 18 bilingual. Visual verification pending.

## 2026-11-21 — What's New Build 17
- TEST-only release notes updated in `app.js` to announce PO box alignment and one-decimal blur formatting, in EN/ES. New localStorage release key makes modal appear once per device for Build 17; index asset version refreshed. Browser verification pending.

## 2026-11-21 — PO box weight input alignment and formatting
- TEST only: Gross/Tare editable inputs and Net output right-aligned. Gross/Tare use text with decimal keyboard to support grouping commas, auto-format to one decimal on blur; calculation continues on input and parser accepts commas. No formula changes. Cache refreshed; mobile verification pending.

Created: 2026-11-20

## Logging rules
- Record each future code change with date, affected files, scope, reference component, tests performed, and approval status.
- Distinguish implemented, code-checked, browser-tested, and user-approved. Do not imply one means another.
- Record commits for traceability. Production promotion requires explicit user approval.




## 2026-11-21 — Quick Seed selected unit contrast
- User screenshot identified selected KS white-on-white text under Yellow accent. Added a specific yellow-only `.qsUnitButton.qsUnitActive` rule for black text on white background, leaving inactive buttons dark on gold. Refreshed CSS cache. TEST only; browser verification pending.

## 2026-11-21 — Quick Seed unit button text correction
- User screenshot confirmed Select Unit heading was already dark, but inactive MS/KG/LB buttons retained white text. Scoped dark text to yellow-accent inactive Quick Seed unit buttons; selected white button remains dark. Cache refreshed in `index.html`. TEST only; browser confirmation pending.

## 2026-11-21 — Quick Seed Yellow contrast follow-up
- Corrected remaining pale/white hard-coded Quick Seed text on yellow surfaces: Select Unit, result explanations (`qsMeaning`), optional labels, LB values, Reset, and Pack All notes/status. Kept dark input fields and non-yellow accents unchanged.
- Updated asset cache in `index.html`. CSS source reviewed; browser/mobile visual verification pending. TEST only.

## 2026-11-21 — Yellow accent foreground contrast
- User requested dark text on the brighter Yellow `#FACC15` accent because white was hard to read.
- Scoped CSS to `data-quick-accent="yellow"` for accent-filled buttons, Quick Seed, Bulk, PO Weight Calculator, and results; left dark input text and other accent colors unchanged. Updated `index.html` asset cache.
- CSS/source inspected; browser/iPhone contrast verification pending. TEST only, no formulas changed.

## 2026-11-21 — Approved Settings redesign (corrected interpretation)
- User approved visual Appearance (Light/Dark) and Accent Color swatches (seven colors), retaining existing EN/ES language and persisted selections.
- Removed mistakenly added OLED Black appearance; previously stored `oled` falls back to Dark. Changed Black **accent** from `#3f3f46` to true black `#000000`; kept Yellow `#FACC15`.
- Files: `index.html`, `styles.css`, `app.js`; no calculator formula changes. JS syntax checked; browser/mobile visual testing pending.

## 2026-11-21 — Yellow accent and OLED Black theme
- User-authorized TEST-only appearance change: Yellow accent `#b88a00` → `#FACC15` in `app.js`.
- Added `OLED Black` as a third Theme option in `index.html`, preserving existing Dark and Light; `styles.css` uses true-black `--bg:#000000` with near-black panels/inputs and neutral borders in OLED mode.
- Refreshed asset cache query. No changes to calculations or other app functionality.
- Verification: JavaScript syntax passed; source inspected for option and variables. Browser/iPhone visual and contrast testing pending user confirmation.

## 2026-11-20 — PO Spanish terminology consistency
- User requested consistent English NET / Spanish Neto throughout PO Weight Calculator.
- Corrected Spanish static labels, dynamic totals, cards, breakdown rows, messages, and screen-reader box labels in TEST. No formulas or styling changed.
- JS syntax verified; mobile visual confirmation pending.

## 2026-11-20 — PO Weight Calculator EN/ES
- Added PO-specific static labels to the existing translation dictionary, localized dynamic results, breakdown labels, box count, input placeholders and navigation title.
- Used Settings language; retained calculations and theme. Syntax checked; iPhone/browser behavior and all translation states still require user verification.
- Scope: TEST `app.js` and asset cache version in `index.html` only.

## 2026-11-20 — PO Breakdown typography refinement
- Adjusted only CSS for the seven breakdown rows: label 16–17px, KG 18–19px, LB 13px; rebalanced available horizontal space and row padding.
- Reference: user screenshot and approved Quick Seed result hierarchy. No changes to formulas, data or translations.
- Code change applied in TEST; visual verification on iPhone remains pending.

## 2026-11-20 — PO Calculation Breakdown hierarchy
- User approved design: KG prominent on each row, LB smaller underneath, seven existing breakdown concepts retained.
- Implemented in TEST in `app.js` and `styles.css`; asset version refreshed in `index.html`.
- Code structure reviewed; mobile visual confirmation still pending. No calculation formula changes.

## 2026-11-20 — Documentation baseline
- Added `DESIGN_SYSTEM.md`, `CHANGELOG.md`, `AGENTS.md` and updated `PROJECT_MEMORY.md`.
- Purpose: make existing Quick Seed Calculator visual patterns the required reference for new tools.
- Scope: documentation only. No runtime application, CSS, or formulas changed.
- Verification: compared reference selectors and Settings theme variables in current TEST source. Mobile visual approval not part of this documentation change.

## 2026-11-20 — PO Weight Calculator theme work (historical summary)
- TEST CSS updated to color the entire PO input and results panels, using Quick Seed Calculator as the reference; last style commit `43595b7`, cache-key commit `fa6e157`.
- User had repeatedly reported that earlier attempts colored only buttons or individual result elements. **Latest visual appearance remains unapproved.**
- Display rules currently implemented: one decimal, prominent KG and smaller LB, four initial rows, computed Net per box.
- Earlier PO changes include naming, PO Required label, per-box Net, layout and iOS zoom adjustments. Do not infer that all visual details were approved.
- Bulk Line remains paused; production repository unchanged by these TEST changes.
