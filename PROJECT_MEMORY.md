# Production Calculator — Project Memory
Updated: 2026-11-20
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
