# Production Calculator — Design System
Updated: 2026-11-20
Status: Design reference for TEST. No UI code is changed by this document.

## Source of truth and precedence
1. Explicit, most recent user-approved design and behavior.
2. Working reference implementation in TEST: Quick Seed Calculator (`#quickSeed` in `index.html`, `#quickSeed .qsPanel`, `.qsField`, `.qsTotalCard`, `.qsSmallCard` in `styles.css`).
3. Shared theme variables and Settings logic in `styles.css` and `app.js`.
4. This document; if a conflict exists, stop and ask rather than invent a variant.

## Mandatory visual rules
- **CONSISTENCY IS A REQUIREMENT, not a preference.** New tools must match Quick Seed Calculator's *whole input and results panels*, not merely the buttons or a small result tile.
- Use `background:var(--accent)`, white foreground and a subtle accent-tinted border for primary input/results panels, matching `#quickSeed .qsPanel`. Keep dark, legible editable inputs inside the accent panel.
- Nested results follow `#quickSeed .qsTotalCard` / `.qsSmallCard`: slightly darker accent-derived surfaces, subtle contrast border, white text. Avoid inventing new gradients, bright headers, borders, and unrelated palettes.
- Use `--accent`, `--bg`, `--fg`, `--panel`, `--edge`, `--input`, `--muted` as appropriate. Settings updates `--accent` from `prefs.color` in `applyPrefs()` (`app.js`); `data-theme` controls light/dark. Do not hardcode a new tool's theme color.
- Compare actual Quick Seed Calculator screen with the new screen in the *same* Settings color and theme before declaring visual consistency. Do not judge solely by CSS variable usage.
- Use existing typography, radii, spacing, button and result hierarchy. Keep mobile number fields at least 16px to prevent iOS Safari auto-zoom; ensure long numbers do not wrap awkwardly. Verify narrow and wide iPhones.
- Reuse existing classes/components when safe; if scoped styles are needed, copy the reference's visual treatment and record why. Avoid stacking contradictory CSS overrides.
- Text must follow the EN/ES preference through the existing translation mechanism. Do not claim a tool is translated unless tested.

## PO Weight Calculator — currently agreed design
- Screen and Home title: PO Weight Calculator; field: PO Required (KG).
- Start with four boxes; rows: number, editable Gross, editable Tare, computed Net, remove control. No SU names.
- Net = Gross − Tare, updated live; `+ Add Box` below rows, before Total Net.
- One displayed decimal for weights in this tool. Internal calculations retain precision. KG prominent, LB smaller/secondary in Total Net. Singular/plural box counter.
- Last Box Allocation presents PO and Return results; Calculation Breakdown is expandable; Reset requires confirmation.
- Full-panel accent theme must match Quick Seed Calculator. The user has not yet approved the latest visual result; treat it as pending verification.
- Keep Bulk Line paused unless user explicitly resumes it.

## Design acceptance checklist
1. Inspect `PROJECT_MEMORY.md`, this file, `AGENTS.md`, and relevant existing source before editing.
2. Identify and name the exact existing reference component.
3. Confirm scope: one user-approved change at a time; TEST only.
4. Check Home/header/nav, full input panel, inputs, results panel, nested result cards, numbers/units, actions, and expanded details against reference.
5. Check Settings accent choices, light/dark, English/Spanish, iPhone responsive and input zoom; run available regression checks.
6. Report what was actually tested and what still requires visual user approval. Never claim browser testing based on code inspection alone.
7. Update `CHANGELOG.md` and `PROJECT_MEMORY.md` for each accepted implementation.

## Settings appearance (approved 2026-11-21)
- Separate Appearance (Light and Dark only) from Accent Color (visual swatches); do not add an OLED appearance mode without explicit authorization.
- Yellow accent `#FACC15`; Black accent true `#000000` (not gray). Preserve EN/ES and stored preferences.

- Yellow accent `#FACC15` must use near-black text on yellow backgrounds (buttons, headings, results); other accents retain their existing foregrounds. Preserve legibility of dark input fields.
