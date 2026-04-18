# Pfadkarte fuer manuelle Ticketarbeit

## Schnelleinstieg (HTML)
- Einstieg aller Panels: `src/html/charactersheet.html`
- Tab-Einstiege:
  - Allgemein: `src/html/partials/tabs/allgemein/index.html`
  - Fertigkeiten: `src/html/partials/tabs/fertigkeiten/index.html`
  - Kampf: `src/html/partials/tabs/kampf/index.html`
  - Magie: `src/html/partials/tabs/magie/index.html`
  - Matrix: `src/html/partials/tabs/matrix/index.html`
  - Rigging: `src/html/partials/tabs/rigging/index.html`
  - Ausruestung: `src/html/partials/tabs/ausruestung/index.html`
  - Biographie: `src/html/partials/tabs/biographie/index.html`
  - Einstellungen: `src/html/partials/tabs/einstellungen/index.html`

## Unterbereiche (Beispiele)
- Allgemein / Attribute: `src/html/partials/tabs/allgemein/attribute.html`
- Allgemein / Fertigkeiten: `src/html/partials/tabs/allgemein/fertigkeiten.html`
- Kampf / Fernkampf: `src/html/partials/tabs/kampf/fernkampf.html`
- Kampf / Nahkampf: `src/html/partials/tabs/kampf/nahkampf.html`
- Kampf / Panzerung: `src/html/partials/tabs/kampf/panzerung.html`

## Grosse Tabs in Sections (Punkt 2)
- Magie: `src/html/partials/tabs/magie/kernwerte.html` -> `src/html/partials/tabs/magie/sections/*`
- Matrix: `src/html/partials/tabs/matrix/kernwerte.html` -> `src/html/partials/tabs/matrix/sections/*`
- Rigging: `src/html/partials/tabs/rigging/kernwerte.html` -> `src/html/partials/tabs/rigging/sections/*`
- Ausruestung: `src/html/partials/tabs/ausruestung/kernwerte.html` -> `src/html/partials/tabs/ausruestung/sections/*`

Legacy-Aliase bestehen weiterhin:
- `src/html/partials/allgemein/*` -> `tabs/allgemein/*`
- `src/html/partials/kampf/*` -> `tabs/kampf/*`
- `src/html/partials/tabs/*-kern.html` -> `tabs/<tab>/kernwerte.html`

## Schnelleinstieg (CSS)
- Modulmanifest (Reihenfolge): `src/css/modules/manifest.json`
- Allgemein / Attribute Listenansicht:
  - `src/css/modules/tabs/allgemein/attribute.css`
- Weitere Tab-Startpunkte:
  - `src/css/modules/tabs/fertigkeiten/index.css`
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

## Build-Output fuer Sandbox
- `output/charactersheet.html`
- `output/charactersheet.css`
- `output/sheet_workers.js`
- `output/translation.json`
