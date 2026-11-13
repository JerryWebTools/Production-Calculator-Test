# Production Calculator · v2.5 TEST · Build 10

TEST-only: display fixes following 7/9 Build 9 operator tests. Production v2.4 is untouched.

- White high-contrast active-panel border when Accent Color is Black or Gray.
- Responsive main display measures the actual rendered digits on the device, starting large and shrinking to fit.
- Both Converter ON (70% panel) and OFF (full-width panel) are supported.
- Quick Converter input/output sizing uses actual available space; remeasure on resize.
- No production formulas or percent calculation logic changed.

## Operator QA
1. Choose Black, then Gray in Settings: selected panel must have a white border; other accent colors keep their original selection border.
2. Converter OFF: enter 1400 (large), then 123456789.12345 (progressively smaller; all digits visible).
3. Converter ON: enter 123456789.12345 in the main panel (all digits visible); also test left panel.
4. Switch ON/OFF and rotate phone; font should grow/shrink with available width.
5. Regression: 50 + 10% = 55; 1400 − (250 LB → KG) = 1286.60; Use Result, History and Undo still work.
