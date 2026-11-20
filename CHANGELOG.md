# Production Calculator TEST — Change Log
Created: 2026-11-20

## Logging rules
- Record each future code change with date, affected files, scope, reference component, tests performed, and approval status.
- Distinguish implemented, code-checked, browser-tested, and user-approved. Do not imply one means another.
- Record commits for traceability. Production promotion requires explicit user approval.

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
