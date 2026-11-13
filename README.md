# Production Calculator · v2.5 TEST · Build 9

TEST-only branch. Do not merge into Production v2.4.

- Four-tool toolbar: History, Converter ON/OFF, Unit Converter, Percent Calculator.
- Unit Converter opens Standard Units; Seed Converter is a nested option.
- Percent Calculator modes: Add, Subtract, Find, What %, % Change, Reverse %. Use Result transfers full precision to main calculator.
- Main calculator percentage: + and − use percentage of the first operand, × and ÷ use fractional percentage.
- Clear active-panel indicators, adaptive number sizes, and mobile transfer-button spacing.

## QA before merging
1. 50 + 10% = 55; 50 - 10% = 45; 50 × 10% = 5; 50 ÷ 10% = 500.
2. 1400 − (250 LB → KG using Use) = 1286.60; test button visibility on iPhone.
3. Check Percent Calculator six modes, Use Result, Undo, History.
4. Unit Converter defaults to Standard Units; Seed Converter Back returns to Standard Units.
5. Confirm converter OFF, selected panel, long numbers, other production lines, and accent color.
