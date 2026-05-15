# Contributing Guide (SR6 Roll20 Sheet)

## Grundprinzip
- Arbeite **source-first** in `src/`.
- `output/` ist Build-Artefakt und wird nicht direkt gepflegt.
- Keine Änderungen an Roll20-Attributnamen/Reapeating-Namen ohne zwingenden Grund.

## Benennung
- CSS-Klassen: `sr6-<bereich>-<element>[-<modifier>]`
- Worker-Funktionen:
  - `parse*/map*` fuer Helper
  - `recompute*` fuer Berechnung
  - `reset*/normalize*` fuer UI-/Migrationslogik
- Datei-/Modulnamen:
  - CSS-Module mit Prefix fuer Lade-Reihenfolge (`00-`, `10-`, ...)
  - Worker-Module nach Verantwortung (`constants`, `helpers`, `recompute`, `ui-state`, `events`)

## Build und Validierung
- Vor jedem Push mindestens:
  1. `npm run lint:includes`
  2. `npm run build`
- Bei UI-Aenderungen zusaetzlich Roll20-Sandbox Smoke-Test:
  - Tabs
  - Repeating + Add/Sortieren
  - Wuerfelbuttons
  - Listenansicht/Editieransicht

## HTML-Kommentarstandard
- Fuer neue Bloecke immer:
  - `<!-- BEGIN BLOCK: ... -->`
  - `<!-- END BLOCK: ... -->`

## Pull-Request-Hinweise
- Kleine, reviewbare Commits.
- In der Beschreibung immer nennen:
  - Was wurde geaendert?
  - Warum?
  - Wie getestet?
