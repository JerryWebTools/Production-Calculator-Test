# Production Calculator · v2.5 TEST · Build 8

Based on TEST Build 7 (Seed Converter). This is a TEST-only build. Do not upload to the production v2.4 repository.

## Quick Calculator changes
- Default selection is main calculator on the right.
- Compact left Quick Converter (30%) with matching INPUT and RESULT unit formatting.
- Shared keypad; tap a panel to direct number entry.
- Use → transfers the converted value without rounding intermediate math.
- Undo, persistent combined calculation/conversion history.
- Converter OFF hides the left panel and secondary conversion; main calculator expands.
- Number text scales based on available width.

## Deploy
Upload all ZIP contents to the **Production-Calculator-Test** repository root. Leave Production-Calculator (v2.4) unchanged.

## QA
1. Open Quick Calculator: right panel selected.
2. Enter 1400, tap −; tap left panel, enter 250 LB; tap Use →; tap =. Expected 1286.60.
3. Undo restores pre-result state; History lists the conversion and arithmetic.
4. Toggle Converter OFF: left panel and secondary conversion disappear; right panel expands. Toggle ON to restore.
5. Verify mobile, desktop, offline refresh, existing Seed Converter and line calculators.
