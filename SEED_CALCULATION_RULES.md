# Seed Calculation Rules — Technical Reference

Status: Reference documentation only. No application formulas or behavior are changed by this file.
Scope: Quick Seed Calculator and future line-specific calculation reviews.
Privacy: Generalized operational explanation; no personal names, contact information, customer identifiers, or actual order records.

## Purpose
A seed-count order specifies a number of seeds per package (for example, 100 KS = 100,000 seeds). The packing scale measures weight rather than counting individual seeds. The calculator therefore estimates the weight needed to pack the specified number of seeds.

## Seed Count (PC)
- PC means seeds per pound (seeds/LB).
- A laboratory obtains PC before packing by weighing 1,000 seeds three times, averaging the three weights, and using the average to calculate seeds per pound.
- A new seed count is not normally performed after treatment in the described packing workflow.
- For a KS/MS order, calculate the number of seeds and divide by PC to obtain the estimated untreated seed weight in LB, then convert to KG according to the application's existing conversion convention.

## Overpack
- Overpack adds a small allowance of **additional actual seed**.
- Its purpose is to reduce the risk that weighing/packing variability results in fewer seeds in a package than the ordered seed count.
- Overpack is separate from chemical weight.

## Chemical Weight
- Treatment adds mass to the **same seeds**; it does not add seeds.
- In principle, measuring seed count again after treatment could establish the treated weight more directly.
- In the described workflow, a percentage such as 1% is used as an **estimate of the added treatment mass**, rather than measuring treated PC again.
- Under the current Quick Seed convention, estimated chemical mass is calculated on the seed weight **including overpack**.
- Chemical weight is an estimated mass adjustment for treated material, **not** an increase in seed quantity and **not** a second physical chemical addition when packing already-treated seed.

## Distinct operational quantities
1. **Untreated seed required before treatment:** seed weight plus overpack, excluding added chemical mass and bag tare.
2. **Estimated treated material required for packing:** seed weight plus overpack plus estimated treatment mass already present in treated seed; exclude bag tare.
3. **Fill Weight / EA:** target net contents on the bagger scale, according to whether the material is treated or untreated.
4. **Gross Bag Weight / EA:** Fill Weight plus empty-bag tare.

Treat-only operations need the pre-treatment seed quantity. Packing already-treated seed needs the treated material weight. Untreated packing needs the untreated fill weight. A shared Quick Seed interface must label these quantities unambiguously.

## Samples
- Samples are taken from **the same material being packed**.
- If the material is already treated, a specified sample of 5 KG means **5 KG of treated material**.
- If untreated, the sample is untreated material.
- Do **not** apply the chemical percentage again to a fixed sample mass of already-treated material.
- Define explicitly whether a requested total refers to material before treatment or already-treated material before adding samples and deciding rounding.

## Illustrative bag calculation
For 100 KS, PC = 2,500 seeds/LB, overpack = 1%, chemical weight = 1%:
1. 100,000 / 2,500 = 40 LB of untreated base seed.
2. Convert 40 LB to KG using the application's configured factor.
3. Add 1% overpack as additional seed.
4. For already-treated material, estimate a further 1% treatment weight on seed plus overpack.
5. Add bag tare only to obtain gross bag weight, not seed or treated-material requirement.

Calculations should retain full internal precision and apply the app's established display/rounding rules. The example does not authorize a change to those rules.

## Design decisions still open
- Decide how Quick Seed should present both pre-treatment seed required and already-treated material required, with clear labels.
- Agree on comparable sample handling and rounding for those two totals.
- Confirm Pack All semantics for treated material versus untreated seed before changing formulas.

## Implementation safeguards
- This document records operational meaning, **not approval to alter existing formulas**.
- Inspect and test existing line-specific behavior before any implementation.
- Preserve bilingual EN/ES display, the established unit conversion convention, and the user's TEST-only, one-change-at-a-time approval process.
- Do not modify the production repository without separate explicit authorization.
