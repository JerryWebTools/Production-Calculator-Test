# Instructions for coding assistants — Production Calculator
Applies to work in this repository. Read before planning or editing.

## Required reading
1. `PROJECT_MEMORY.md` — project scope, math constraints, approvals, paused work.
2. `DESIGN_SYSTEM.md` — mandatory UI patterns and acceptance checklist.
3. `CHANGELOG.md` — recent changes, known issues, pending approval.
4. Actual reference implementation in `index.html`, `styles.css`, and `app.js`; for visual changes inspect `#quickSeed` and its `.qsPanel`, `.qsField`, `.qsTotalCard` and `.qsSmallCard` styles.

## Non-negotiable workflow
- **CONSISTENCY FIRST:** reuse Quick Seed Calculator's existing full-panel design and theme system. Do not create a separate look for new tools.
- One change at a time. Do not modify unrelated screens, formulas, features, or files.
- This repository is TEST only. Never modify `JerryWebTools/Production-Calculator` (production) without separate, explicit user authorization.
- Bulk Line is paused; do not resume without explicit request.
- Compare new work with the approved demo and source code before editing. If exact demo cannot be recovered, say so and request clarification rather than claiming a match.
- Preserve working math and the `F=2.2046` KG-to-LB convention unless user explicitly changes it.
- Respect Settings theme/color/language and mobile usability. Check iPhone input font size and wrapping.
- Run appropriate syntax/regression tests; separately identify tests not performed. User visual approval is required before calling design complete.
- After each implementation update `CHANGELOG.md` and `PROJECT_MEMORY.md`, documenting exact scope, testing and pending approval.
- If instructions conflict, ask before making speculative changes.
