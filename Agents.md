# AGENTS.md

## Project context
This repository contains a Roll20 Character Sheet project.

Treat this as a Roll20 sheet project, not as a normal website or app frontend.
All changes must respect Roll20 character sheet conventions, platform limitations, and naming requirements.

Primary implementation source:
- `src/html/charactersheet.html`
- `src/css/charactersheet.css`
- `src/i18n/translation.json`

Generated/exported output:
- `output/assets/charactersheet.html`
- `output/assets/charactersheet.css`
- `output/assets/images/*`

Documentation/supporting files:
- `docs/*`
- `readme.md`
- `roll20-checklist.md`

## Source of truth
- Treat `src/` as the source of truth.
- Prefer editing files in `src/` unless the task explicitly requires changing generated/exported output.
- Do not manually edit files in `output/assets/` unless the task is specifically about export artifacts or output verification.
- If a change is made in `src/`, assume the corresponding `output/` file may need regeneration/syncing.
- Do not treat `.codex` as project source code or documentation.

## File responsibilities
- `src/html/charactersheet.html` contains the Roll20 sheet markup.
- `src/css/charactersheet.css` contains Roll20 sheet styling.
- `src/i18n/translation.json` contains translatable UI strings and labels.
- `output/assets/` contains deployable or generated assets for Roll20 usage.
- `docs/` contains reference material, notes, or project documentation.
- `roll20-checklist.md` is a helper document, not the implementation source of truth.

## Core working rules
- Keep diffs small and localized.
- Reuse existing patterns before introducing new structures.
- Prefer conservative Roll20-compatible changes over generic frontend best practices.
- Do not introduce frameworks, build tools, preprocessors, or external dependencies unless already present in the repository.
- Do not refactor unrelated sections.
- Do not rename important fields unless explicitly required.

## HTML rules
When editing `src/html/charactersheet.html`:
- Preserve Roll20-compatible markup patterns.
- Preserve all `name="attr_*"` conventions.
- Preserve all `name="act_*"` roll button conventions.
- Do not rename repeating section identifiers unless explicitly required.
- Do not rename attributes that may be referenced by roll templates, macros, or sheetworkers.
- Keep markup explicit and easy to inspect.
- Prefer extending existing sections over rewriting them.

## CSS rules
When editing `src/css/charactersheet.css`:
- Write CSS for Roll20 sheet rendering, not for a general-purpose website.
- Prefer scoped selectors tied to the sheet structure.
- Avoid broad resets and overly generic selectors.
- Preserve existing naming conventions and selector patterns.
- Prefer small targeted fixes over layout rewrites.
- Be cautious with advanced CSS unless the project already uses it and it is clearly appropriate for Roll20 Character Sheet Enhancement.

## i18n rules
When editing `src/i18n/translation.json`:
- Add or update translation keys when user-facing text changes.
- Reuse existing translation key naming patterns.
- Do not remove existing keys unless the related UI is truly removed.
- Keep translation structure consistent and predictable.
- If UI text is added in HTML, check whether it should be moved to translations.
- Avoid hardcoding new visible strings in HTML when the project already uses translation keys for similar text.

## Output rules
- Do not treat `output/assets/charactersheet.html` and `output/assets/charactersheet.css` as the preferred edit targets.
- If output files differ from `src/`, prefer fixing the source unless the task explicitly says otherwise.
- When relevant, mention that output artifacts may need regeneration or manual sync after source edits.
- Do not silently update generated files without noting it.

## Roll20-specific safety checks
Before finishing any change, verify:
- edited fields still use correct `attr_` names
- roll buttons still use correct `act_` names and references
- repeating section names remain unchanged unless explicitly requested
- existing Roll20 references are still valid
- user-facing text changes are reflected in `translation.json` when appropriate
- no generic web-app assumption was introduced by mistake

## Debugging priorities
When investigating a problem:
1. Check attribute names
2. Check roll button references
3. Check repeating section structure
4. Check translation key usage
5. Check CSS selectors and visibility/layout issues
6. Check whether `output/` is stale compared with `src/`

Prefer the simplest Roll20-compatible fix.

## Documentation behavior
- Update `readme.md` only if the task affects setup, usage, workflow, or repository structure.
- Update `roll20-checklist.md` only if the task changes rollout, QA, export, or publishing expectations.
- Use `docs/` only for project documentation tasks, not as the default place for implementation changes.

## What to avoid
- Do not convert this project into a generic frontend architecture
- Do not add React, Vue, Tailwind, or unrelated tooling
- Do not rename Roll20 fields casually
- Do not manually edit generated output unless required
- Do not hardcode lots of new visible text if translations are already part of the project
- Do not make large CSS rewrites for small visual fixes

## Preferred change style
- small patches
- source-first edits
- backwards-compatible field naming
- conservative CSS
- explicit Roll20 awareness
- translation-aware UI changes

## Output expectations
When making changes:
- briefly explain what changed
- list touched files
- state whether changes were made in `src/`, `output/`, or both
- mention any Roll20-specific risks
- mention whether output regeneration/sync may be required