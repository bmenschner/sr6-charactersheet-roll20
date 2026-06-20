# Pfadkarte fuer manuelle Ticketarbeit

## Schnelleinstieg (HTML)
- Einstieg aller Panels: `src/html/charactersheet.html`
- Tab-Einstiege:
  - Fertigkeiten: `src/html/partials/tabs/fertigkeiten/index.html`
  - Kampf: `src/html/partials/tabs/kampf/index.html`
  - Magie: `src/html/partials/tabs/magie/index.html`
  - Matrix: `src/html/partials/tabs/matrix/index.html`
  - Rigging: `src/html/partials/tabs/rigging/index.html`
  - Ausruestung: `src/html/partials/tabs/ausruestung/index.html`
  - Biographie: `src/html/partials/tabs/biographie/index.html`
  - Einstellungen: `src/html/partials/tabs/einstellungen/index.html`

## Unterbereiche (Beispiele)
- Attribute & Fertigkeiten / Attribute: `src/html/partials/tabs/fertigkeiten/sections/00-attribute.html`
- Attribute & Fertigkeiten / Fertigkeiten: `src/html/partials/tabs/fertigkeiten/sections/01-fertigkeiten.html`
- Attribute & Fertigkeiten / Zusatzboxen: `src/html/partials/tabs/fertigkeiten/sections/02-zusatzboxen-layout.html`
- Kampf / Kernwerte: `src/html/partials/tabs/kampf/sections/01-kernwerte.html`
- Kampf / Fernkampf: `src/html/partials/tabs/kampf/sections/02-fernkampf.html`
- Kampf / Nahkampf: `src/html/partials/tabs/kampf/sections/03-nahkampf.html`
- Kampf / Panzerung: `src/html/partials/tabs/kampf/sections/04-panzerung.html`
- Matrix / Geraete: `src/html/partials/tabs/matrix/sections/02-geraete.html`
- Matrix / Handlungen: `src/html/partials/tabs/matrix/sections/04-handlungen.html`
- Ausruestung / Ausruestung: `src/html/partials/tabs/ausruestung/sections/01-ausruestung.html`

## Grosse Tabs in Sections (Punkt 2)
- Magie: `src/html/partials/tabs/magie/kernwerte.html` -> `src/html/partials/tabs/magie/sections/*`
- Matrix: `src/html/partials/tabs/matrix/kernwerte.html` -> `src/html/partials/tabs/matrix/sections/*`
- Rigging: `src/html/partials/tabs/rigging/kernwerte.html` -> `src/html/partials/tabs/rigging/sections/*`
- Ausruestung: `src/html/partials/tabs/ausruestung/kernwerte.html` -> `src/html/partials/tabs/ausruestung/sections/*`
- Biographie: `src/html/partials/tabs/biographie/kernwerte.html` -> `src/html/partials/tabs/biographie/sections/*`

Hinweis:
- Legacy-Alias-Pfade wurden entfernt. Bitte nur `src/html/partials/tabs/**` verwenden.
- `Allgemein` ist kein aktiver interner Sheet-Tab mehr. Historische Dateien unter `src/html/partials/tabs/allgemein/**` gelten nur, wenn sie explizit ueber `@include` eingebunden sind.
- Wissensfertigkeiten, Sprachfertigkeiten, Talentsofts und Wissens-/Sprachsofts werden aktuell ueber `sections/02-zusatzboxen-layout.html` eingebunden.
- Roll-only UI fuer automatisch berechnete Werte liegt aktuell in Kampf, Magie, Matrix und Rigging. Relevante Einstiege sind die jeweiligen `sections/*` der Tabs.
- Matrix-Handlungen mit getrennten Proben-/Verteidigungs-Modifikatoren liegen in `src/html/partials/tabs/matrix/sections/04-handlungen.html`.

## Schnelleinstieg (CSS)
- Modulmanifest (Reihenfolge): `src/css/modules/manifest.json`
- Attribute & Fertigkeiten:
  - `src/css/modules/tabs/fertigkeiten/index.css`
- Weitere Tab-Startpunkte:
  - `src/css/modules/tabs/kampf/index.css`
  - `src/css/modules/tabs/magie/index.css`
  - `src/css/modules/tabs/matrix/index.css`
  - `src/css/modules/tabs/rigging/index.css`
  - `src/css/modules/tabs/ausruestung/index.css`
  - `src/css/modules/tabs/biographie/index.css`
  - `src/css/modules/tabs/einstellungen/index.css`
- Shared Listenansicht:
  - `src/css/modules/30-list-overview.css`
  - `src/css/modules/31-list-zauber.css`
  - `src/css/modules/32-list-repeating-shared.css`
- Shared Stepper- und Roll-Mod-Patterns:
  - `src/css/modules/00-foundation.css`
  - `src/css/modules/40-layout-and-tab-sections.css`
  - `src/css/modules/32-list-repeating-shared.css`


## Schnelleinstieg (Worker / Rolls)
- Worker-Entry und Include-Reihenfolge: `src/workers/sheet_workers.js`
- Roll-Definition Registry: `src/workers/rolls/definitions/registry.js`
- Roll-Definition Runtime/Resolver: `src/workers/rolls/definition-resolver.js`
- Gemeinsame Definitionen und Popup-Optionen:
  - `src/workers/rolls/definitions/shared.js`
  - `src/workers/rolls/definitions/popup-options.js`
  - `src/workers/rolls/definitions/popup-fields.js`
  - `src/workers/rolls/definitions/builders.js`
  - `src/workers/rolls/definitions/validation.js`
- Fachliche Roll-Definitionen:
  - Kampf: `src/workers/rolls/definitions/combat.js`
  - Magie: `src/workers/rolls/definitions/magic.js`
  - Matrix: `src/workers/rolls/definitions/matrix.js`
  - Rigging: `src/workers/rolls/definitions/rigging-rolls.js`
  - Fertigkeiten: `src/workers/rolls/definitions/skills-rolls.js`
  - Ausruestung: `src/workers/rolls/definitions/equipment-rolls.js`
  - Fallback/Core: `src/workers/rolls/definitions/core.js`, `src/workers/rolls/definitions/fallback.js`
- Domain-Helfer fuer Wertquellen:
  - Ausruestung: `src/workers/rolls/definitions/equipment.js`
  - Rigging: `src/workers/rolls/definitions/rigging.js`
  - Fertigkeiten: `src/workers/rolls/definitions/skills.js`
- Roll-only-Modifikator-Pipeline:
  - Kontext laden: `src/workers/rolls/context.js`
  - Pool fuer Wurf additiv anpassen: `src/workers/rolls/probe.js`
  - Ergebnis berechnen: `src/workers/rolls/compute.js`
  - Template-Zeilen ausgeben: `src/workers/rolls/display.js`
- Number-Stepper:
  - Worker-Action: `src/workers/rolls/number-stepper.js`
  - Einbindung/Recompute: `src/workers/core/register.js`
  - HTML-Nutzung in Kampf/Magie/Matrix/Rigging und Repeating Rows

## Build-Output fuer Sandbox
- `output/charactersheet.html`
- `output/charactersheet.css`
- `output/sheet_workers.js`
- `output/translation.json`
