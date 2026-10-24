# Production Calculator v2.2

Static, mobile-friendly production calculator. No build step, login, server, or external dependencies. Upload `index.html`, `app.js`, and `styles.css` to the repository root and serve with GitHub Pages.

## Included
- Line 1 — Treat Only
- Line 3 — Treat Only / Treat & Pack (Normal Corn, Shrunken Corn, Peas, Spinach, Other)
- Line 4 — Treat Only / Treat & Pack (Peas, Beans)
- Stand Alone — Pack Only, Treated/Untreated, Bag Tare (KG/LB, 3 decimals)
- Bulk Line — Coming Soon placeholder
- Crop and seed-type formula settings, locally saved, with confirmation and restore defaults
- Extra EA suggestion and direct override for Lines 3 and 4
- Regular and custom samples (G/KG/LB/KS)
- Detailed Saved Calculations with View Details, Load, Delete, and local persistence

## Calculation rules
- 1 KG = 2.2046 LB; base KS weight = KS × 1000 ÷ PC ÷ 2.2046.
- Commercial overpack 1%, Parent/Basic 0.5%; Spinach 0.5% in Line 3 and Stand Alone.
- Normal Corn treated chemical weight 1%, Shrunken Corn 1.2%, otherwise 0% by default.
- Treat lines: seed to treat = ceil(base per EA × calculated EA × (1 + overpack) + samples). Chemical weight affects finished bag target, **not** untreated seed to treat.
- Stand Alone: net seed/bag = base × (1 + overpack) × (1 + chemical if treated); total = ceil(net seed/bag × order EA + samples); scale target = net seed/bag + tare. Tare excluded from total.
- Extra EA (Treat & Pack only) = 1 + ceil(Order EA / 100), editable.
- Samples are added after percentages.

## Data storage and privacy
- All calculations run locally in the browser.
- Formula settings and saved calculations use localStorage on the current browser/device. Clearing site data or using private browsing can remove them. No cross-device sync.
- Optional Calculation IDs are entered by users; avoid sensitive identifiers.

## Release checklist
1. Keep a backup of the prior GitHub version.
2. Test each line with known production examples before publishing.
3. Upload all three application files together; leave GitHub Pages configured as before.
4. Refresh the published site and test on mobile and desktop.

## v2.3 revised preview (2026-10-24)
- Added **Leg** as a separate Concetti pack-only line (treated/untreated selection); it shares the existing pack-only calculation approach but maintains a distinct line identifier in saved calculations.
- Kept all production line names in English in both language settings (Line 1/3/4, Leg, Stand Alone, Bulk Line).
- Applied the selected button color to the line calculation cards/boxes, not only action buttons. White text on the accent color.
- Limited the Quick Calculator to a portrait-oriented maximum width of 390px on desktop; responsive to narrow iPhone screens.
- Still a preview: confirm Leg's calculation rules and validate results against actual orders before production use.

### v2.3 tare display refinement
When Bag Tare is zero, the existing Gross Bag Weight / EA result card displays 'Enter Bag Tare to calculate' instead of a numeric weight. Net weight and all calculation formulas remain unchanged. This applies to Line 3, Line 4, Leg, and Stand Alone where bag results are shown; the same wording is used in the calculation breakdown and saved details.

## Approved compact header preview
Back and Home stay together at the left; the line and operation appear on one line in the center; Settings uses a matching outlined style at right. On smaller screens the heading font scales down without wrapping. Existing calculator behavior and cards are unchanged.
