# SR6 Roll20 Character Sheet - Implementation Plan v1

## Product Scope

Goal: build a full-scope Roll20 character sheet inspired by the official SR6 sheet.

Scope includes:
- Core identity and metatype data
- Full attributes and derived stats
- Skills and specializations
- Combat, armor, initiative, damage monitors
- Magic system (tradition, spells, rituals, spirits, foci, drain)
- Matrix system (persona, devices, cyberdeck, programs, matrix conditions)
- Resonance system (stream, complex forms, sprites, fading)
- Gear, cyberware/bioware, qualities, contacts, notes
- Tri-lingual UI support: German, English, French

## Architecture

Deliverables:
- `sheet.json`: metadata, tabs, workers, defaults
- `character_sheet.html`: semantic structure, reusable section blocks
- `character_sheet.css`: SR6-inspired visual system, responsive behavior
- `sheet_workers.js`: deterministic calculations and roll prep
- `translation.json`: i18n key map, DE/EN/FR ready labels
- Roll templates for combat, skill tests, magic tests, matrix tests

Design principles:
- Keep sheet-worker dependencies explicit and minimal
- Use prefix-based attribute naming for maintainability
- Separate display labels from rule attributes via i18n keys
- Support archetype-specific sections without breaking generic flow

## Phased Delivery

### Phase 0 - Foundation

Output:
- Repository skeleton and lint/format setup
- Naming convention and attribute dictionary v1
- i18n key strategy and locale coverage matrix

Acceptance:
- All planned attributes have unique names
- Layout skeleton renders in Roll20 without console errors

### Phase 1 - Core Rules Engine

Output:
- Character identity + primary attributes
- Derived stats and limit calculations
- Condition monitors, edge, movement, defense blocks
- Base roll buttons and unified roll template

Acceptance:
- Manual test character can roll attribute tests
- Derived fields update correctly after attribute changes

### Phase 2 - Skills and Combat

Output:
- Skill lists with specializations and modifiers
- Weapon repeating section with attack/damage/AP workflow
- Armor and soak helper values

Acceptance:
- Skill and combat rolls output consistent chat template payloads
- Repeating rows remain stable on add/remove/reorder

### Phase 3 - Magic

Output:
- Tradition, magic rating, drain tracking
- Spells, rituals, summoning/binding related entries
- Foci and magical notes sections

Acceptance:
- Magic rolls can be executed from spell rows
- Drain and magic-related derived values update as expected

### Phase 4 - Matrix and Resonance

Output:
- Matrix persona values and matrix initiative
- Device/deck/program tracking
- Technomancer fields: resonance, complex forms, sprites, fading

Acceptance:
- Matrix and resonance archetypes are fully playable from sheet controls
- No worker conflicts between magic and matrix/resonance sections

### Phase 5 - Polish and Release

Output:
- DE/EN/FR label completeness check
- Accessibility pass and mobile usability tuning
- Documentation and release checklist

Acceptance:
- All visible labels use i18n keys
- Critical workflows pass smoke tests in all three languages

## i18n Strategy (DE/EN/FR)

Approach:
- Use neutral key namespace: `ui.*`, `section.*`, `field.*`, `roll.*`
- Avoid hardcoded text in HTML and templates
- Add fallback behavior for missing strings

Quality gates:
- New visible text requires an i18n key in same PR
- Locale parity check before release candidate

## Risks and Mitigations

Risk:
- Official sheet visual identity copied too closely.
Mitigation:
- Keep a "clearly inspired, not copied" UI style with original spacing, iconography, and CSS token system.

Risk:
- Worker dependency loops and performance issues.
Mitigation:
- Use one-way compute graph and throttle costly recalculations.

Risk:
- Full scope complexity delays first playable version.
Mitigation:
- Maintain strict phase gates with playable checkpoints.

## Immediate Next Steps

1. Confirm and freeze attribute dictionary v1 from `roll20-sr6-field-matrix-v1.csv`.
2. Scaffold the Roll20 file set (`sheet.json`, `character_sheet.html`, `character_sheet.css`, `sheet_workers.js`, `translation.json`).
3. Implement Phase 1 first vertical slice end-to-end with tests.
