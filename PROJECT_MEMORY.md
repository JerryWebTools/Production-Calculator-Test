# Production Calculator — Project Memory
Updated: 2026-11-26
Status: Implementation authorized in TEST ONLY. Production must remain unchanged until explicit approval.
Repositories: JerryWebTools/Production-Calculator-Test (TEST); JerryWebTools/Production-Calculator (PRODUCTION).
Current TEST app uses F=2.2046 LB/KG. Preserve working line-specific math.

## User-approved scope
- Quick Seed Calculator is the reference for appearance, terminology, Results, Pack All, Calculation Breakdown, and How Was This Calculated? across Line 1, 3, 4, Stand Alone, Bulk.
- Net Seed Weight / EA means before overpack and chemical; Fill Weight / EA includes applicable factors. Show Total Seed Required / Seed to Treat appropriately; KG and LB outputs.
- Commercial regular sample 5 KG; Parent/Basic default 1.5 KG (formerly 3); retain custom samples.
- Pack All collapsed until Available Seed entered; full units, extras/shortfall, remaining. Add Pack All to Line 1 Treat Only.
- Quick Calculator: remove Last Calculation; compact horizontal KG/LB converter above display, editable left, swap center, yellow result right, tap to use; toggle converter changes display height ONLY, keypad and toolbar stay fixed; responsive iPhone 17 and Pro Max. Unit Converter default LB -> KG. Maintain Use/Undo/History.
- Full EN/ES translation including Quick Seed. Games language independently persisted; expand trivia bank (300+ proposed, exact size not confirmed), randomize and avoid recent repeats.

## Bulk Line
- Bulk receives treated or untreated seed, no treater, no tote tare (variable by tote). Orders in KG/LB/KS/MS; PC required for KS/MS; EA quantity. Pack Exact, Pack All, uniform tote weights, optional partial.
- Commercial corn overpack 1%; legumes 0.5%; parent 0.5% or special 0%. Treated corn chemical normal 1%, shrunken 1.2% when applicable, modeling existing chemical weight; avoid double counting.
- Legumes Export generally 1000 KG NET per tote (1005 KG fill with 0.5% overpack). Domestic NET per tote may be KS, 2000 LB, 2500 LB, etc. Convert to KG for scale target; original order unit remains visible.
- Normal specified-order scale Fill Weight: round UP to whole KG, show unrounded math in breakdown. Pack All suggestion: round DOWN to whole KG.
- Pack All: begin with 700 KG as advisory initial corn fill reference (normal and shrunken). Suggest number of totes from available seed, allow +/- number and manual fill weight adjustments, recalc totals, uniform fill, minimize partial totes; first tote is physical capacity test. Clear 'suggested' vs 'operator adjusted' labels; warnings for capacity/insufficient seed. Prefer Quick Seed compact structure, not two separate auto/manual modes. Estimated capacity is not a hard maximum.
- Real corn tote fill observations: shrunken 807, 778, 773, 720, 640, 610, 666.5, 592, 665 KG; normal 780, 800.5, 531, 797 KG. Observed weights are not guaranteed max capacities.
- Commercial sample 5 KG taken from available seed during packing. Handle sample > available gracefully.
- PO1: untreated commercial export peas, 30000 KG net, 30 x 1000 net, 0.5% overpack -> 30 x 1005 fill +5 sample = 30155 KG required.
- PO2: untreated commercial export peas, 29741 KG net, 29 x 1005 fill plus partial 741 x 1.005=744.705 fill +5 sample = 29894.705 KG.
- PO3: treated commercial shrunken corn, 60 EA x 5MS, PC 3896, overpack 1%, chem 1.2%, sample 5KG. Use existing Stand Alone formula and F=2.2046. App currently rounds total up to 35706 KG.
- PO4: untreated commercial shrunken corn, order 3123.5 KG net, available 3120.5 KG, actual 4 x 778 KG fill, sample 5 KG, remaining 3.5 KG. Unresolved whether historical 778 included overpack; DO NOT assume.
- Check distinctions: user-entered fill weight is final scale target including overpack, vs net weight; avoid double counting. Preserve precision in breakdown.

## Release protocol
1. Inspect actual TEST source and compare with PRODUCTION as necessary.
2. Implement incrementally only in TEST; avoid clobbering existing TEST experimental features.
3. Run regression tests including above POs, unit conversions, samples, modes, iPhone responsive, offline.
4. Keep PROJECT_MEMORY.md updated as changes land.
5. Only promote to PRODUCTION after user tests and explicitly approves.

## Design governance — added 2026-11-20
- Mandatory reference: `DESIGN_SYSTEM.md`; assistant workflow: `AGENTS.md`; implementation history: `CHANGELOG.md`.
- Consistency is a hard requirement. Quick Seed Calculator's **entire accent-colored input and results panels** are the visual reference for new tools, not merely colored buttons or isolated result tiles.
- PO Weight Calculator is in TEST. Agreed: PO Required (KG), four starting Gross/Tare rows, calculated per-box Net, Add Box before Total Net, one displayed decimal, prominent KG and smaller LB, last-box PO/Return, reset confirmation.
- PO Weight Calculator's most recent full-panel accent styling is implemented but **not yet visually approved** by user. Avoid describing it as complete until checked.
- User requires one change at a time, checking existing code and approved demo first; no unrelated edits.
- Bulk Line is paused. No promotion to production without explicit user approval.
- This documentation update does not change app behavior, CSS, JS, or calculations.

## PO Weight Calculator progress — 2026-11-20
- User approved overall green accent full-panel design shown in screenshots.
- User approved Calculation Breakdown layout with KG primary and LB smaller beneath; implemented in TEST, pending visual verification on iPhone.
- Seven breakdown rows and one-decimal display retained; no formula change.

- 2026-11-20: Breakdown typography refinement in TEST only (labels 16–17px, KG 18–19px, LB 13px; improved spacing). Awaiting user visual approval; math unchanged.

- 2026-11-20: Implemented PO Weight Calculator EN/ES translation in TEST using existing Settings language; syntax checked, user mobile approval pending. No formula changes.

- 2026-11-20: Terminology rule for PO Weight Calculator: English `NET`, Spanish `Neto` (including totals, cards, breakdown and messages). Implemented in TEST; user verification pending.

- 2026-11-21: User authorized TEST-only Yellow accent `#FACC15` and a third `OLED Black` theme, retaining Dark and Light. Added OLED theme variables (`--bg:#000000`, near-black panels/inputs), Settings option, cache refresh. No formula changes. JS syntax verified; browser/mobile visual approval pending.

- 2026-11-21 approved Settings design: Appearance has Light/Dark only; Accent Color has seven visual swatches, including Yellow `#FACC15` and true Black `#000000`. The prior OLED Black third appearance was a misunderstanding and removed. TEST implementation pending user visual confirmation; preserve EN/ES and saved settings.

- 2026-11-21: Yellow `#FACC15` accent requires near-black text (`#111827`) on yellow surfaces; other accent colors keep white text. TEST-only CSS implementation; user visual approval pending.

- 2026-11-21: PO Weight Calculator TEST: user approved right-aligned Gross/Tare/Net weights and one-decimal auto-format for Gross/Tare on blur, with comma grouping. Implemented, pending user mobile verification; formulas unchanged.

- 2026-11-21: TEST What's New advanced to Build 17, bilingual announcement for PO weight alignment and automatic one-decimal formatting; pending user verification.

- 2026-11-21: Quick Seed label approved as TOTAL SEED REQUIRED / SEMILLA TOTAL REQUERIDA regardless of treatment status; TEST-only results/breakdown/guide and Build 18 announcement updated; user verification pending.

- 2026-11-21: User approved expanding Quick Seed Calculation Breakdown Order Details with Overpack, Chemical, Samples and optional Bag Tare; TEST Build 19 implemented, awaiting user visual verification. Formulas unchanged.

- 2026-11-21: Quick Seed breakdown headings increased 14→17px in TEST, Build 20 What's New; awaiting user approval.

## Quick Seed Calculator — checkpoint through TEST Build 35 (2026-11-26)
- Build 35 is the last user-approved visual checkpoint in the conversation. TEST only; no production promotion authorized. Archived chats are not a substitute for this repository record.
- Three operation modes: Treating Only, Treating & Packing (default), Packing Only. Treating Only disables chemical input and omits chemical/fill/tare details. Seed requirement always excludes chemical and bag tare. Packing Only supports untreated seed with chemical 0%.
- Quick Seed uses exact 2.2046226218487757 LB/KG internally; do not replace other lines' existing F=2.2046 without explicit review. Build 35 displays 2.20462 with approximate-equals symbol in conversion explanations only.
- KS/MS convert seeds via PC (seeds/LB); KG/LB direct. Base seed per EA + overpack = seed per EA; chemical percentage applies to seed plus overpack; fill includes chemical; gross adds tare. Total required seed = ceil(seed per EA × EA + samples), whole KG; show LB equivalent. Keep full precision internally.
- Pack All available seed is measured BEFORE chemical. Reserve samples, floor remaining available seed / seed per EA, compare full EA with order, show remaining seed, seed used and total fill. Chemical changes fill, not available seed requirement. If available < samples, warn and show zero available for packing; if insufficient for one bag after samples, zero bags without that warning.
- Regression case: 100 KS, PC 2500, 100 EA, overpack 1%, chemical 1%, samples 5 KG, tare .100 KG: net 18.144 KG/EA, seed+overpack 18.325, fill 18.508, gross 18.608, total seed required 1838 KG (raw 1837.513). Treating Only, Treating & Packing and Packing Only tested successfully.
- Pack All regression tests passed: 1838 KG -> 100 EA, remaining .487 KG; 1800 -> 97 EA, remaining 17.462; 1900 -> 103 EA, remaining 7.511; 1900 with chemical 0% -> 103 EA, fill 1887.489 KG; 3 KG with samples 5 -> zero EA and warning; 20 KG with samples 5 -> zero EA, 15 KG remaining, no warning.
- Auto Save draft key production-calculator-quick-seed-draft-v1. Home Screen iPhone PWA restored draft after full close; Safari opened separately and did not share that draft (Safari persistence itself not tested). Reset cancel preserves values; confirm clears draft and values, reopening does not restore old draft. Both tested and approved. Build 30 red warning dialog approved.
- Build 31 Pack All short bilingual instruction and dynamic gray Example/Ejemplo placeholder using calculated total KG; user verified.
- Build 32 Saved Orders separate from Line 3, operator-entered name or order number, open/delete, duplicate-name replacement confirmation, device-local storage key production-calculator-quick-seed-saved-orders-v1. Save fields, operation and unit; recalculate on open. Quick Calculator shortcut on right side of Results heading, where Reset previously was; Reset remains beside Enter Order Details. Back should return to Quick Seed without losing inputs. End-to-end save/open/delete and shortcut navigation not explicitly confirmed in conversation; test before promotion. Verify bilingual labels and theme behavior.
- Build 33 grouped Calculation Breakdown and How Was This Calculated? together before Saved Orders; expandable matching cards with icons/subtitles. Build 34 unified black section backgrounds, subtle blue borders, blue inner details. Build 35 compact mobile breakdown columns and shorter displayed conversion factor; user approved appearance. Preserve consistent visual language across sections and existing settings; verify other accent/light themes before promotion. Build 34 style changes isolated in CSS block, Build 33 recoverable from Git history.
- Spanish terminology: Net Seed = Semilla neta, Overpack = Sobrellenado, Fill Weight = Peso de llenado. Technical units KG/LB/KS/MS/PC/EA remain. Maintain complete EN/ES support; new saved-order and explanation labels still require explicit bilingual regression.
- Every TEST release increments LOCAL_TEST_BUILD, RELEASE_KEY, bilingual releaseNotes, index.html build labels and asset cache-busters, version.json and sw.js cache name. Verify actual deployed build rather than assuming GitHub Pages has refreshed.
- Next: continue user-directed incremental changes, verify pending functional and bilingual/theme tests, keep Bulk paused unless requested. Do not modify Production without explicit approval.
