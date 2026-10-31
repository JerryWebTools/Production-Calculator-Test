# Prod Calc v2.5 — Stand-Alone Operator Guide (TEST ONLY)

Based on the user-provided v2.4 Refresh ZIP. This is a **focused test build** of the first v2.5 feature, not the complete planned v2.5 release.

## Changes
- New expandable **How Was This Calculated?** section, only on Stand-Alone results.
- Seven explanations: pack-size conversion, overpack, chemical adjustment, net weight, gross weight, samples/order total, and rounding.
- Uses the **actual current calculation values**, including configured rates, seed condition, pack unit, sample values, and bag tare.
- English/Spanish guide follows language preference.
- No changes to the calculation formulas, saved history, Quick Calculator, or other lines.
- Updated CSS and cache identifier to facilitate testing.

## Test checklist
1. Upload contents (not ZIP) to **Production-Calculator-Test**. Do not update the official repo.
2. Open Stand-Alone and enter a complete order; open **How Was This Calculated?** below the result.
3. Test Normal Corn / Shrunken Corn / Peas; Treated and Untreated; Commercial and Parent/Basic.
4. Test KS, MS, LB and KG pack sizes; bag tare in KG and LB; custom samples.
5. Compare the guide totals with the existing result boxes; test Settings percentage overrides and Spanish.
6. Verify Quick Calculator and other lines still work.

## Note
The guide describes the exact calculations in this app. It is not a replacement for approved production SOPs.
