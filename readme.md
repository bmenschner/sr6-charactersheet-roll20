# SR6 Roll20 Character Sheet (Lokalworkflow)

## Source und Output
- Source of Truth:
  - `src/html/charactersheet.html`
  - `src/html/partials/**/*` (modulare HTML-Blöcke, per Include eingebunden)
    - Kopfbereich bewusst flat unter `src/html/partials/shell/kopfbereich*.html`
  - `src/css/modules/**/*` (modulare Styles, gebündelt via `manifest.json`)
    - Kopfbereich-CSS unter `src/css/modules/shell/kopfbereich-*.css`
  - `src/workers/core/**/*, src/workers/compute/**/*, src/workers/rolls/**/*, src/workers/ui/**/*` (modulare Worker-Logik)
    - Monitor-Header-Logik in `src/workers/compute/header-monitor.js`
  - `src/i18n/translation.json`
  - `src/assets/images/*`
- Generierter Output:
  - `output/charactersheet.html`
  - `output/charactersheet.css`
  - `output/sheet_workers.js`
  - `output/translation.json` (flaches Roll20-Format)
  - `output/translation.full.json` (interner Vollstand DE/EN/FR)
  - `output/assets/images/*`

## Lokale Skripte
- `npm run build`
  - führt zuerst `lint:includes` aus
  - baut danach `output/charactersheet.html` aus `src/html/charactersheet.html` zusammen
    - Include-Syntax: `<!-- @include partials/pfad/datei.html -->`
  - bündelt CSS aus `src/css/modules/manifest.json` nach `output/charactersheet.css`
  - kopiert die übrigen Source-Dateien aus `src/` nach `output/`
  - kopiert statische Bildassets aus `src/assets/images/` nach `output/assets/images/`
- `npm run lint:includes`
  - prüft Includes rekursiv auf:
    - fehlende Dateien
    - zyklische Includes
    - Includes außerhalb von `src/html`, `src/i18n`, `src/workers`
- `npm run lint:css-modules`
  - prüft das CSS-Modulmanifest auf:
    - ungültige/fehlende Einträge
    - Duplikate
    - nicht gelistete CSS-Module
- `npm run watch` (oder `npm run dev`)
  - beobachtet `src/` rekursiv
  - führt bei Änderungen automatisch den Build erneut aus
- `npm run dev`
  - führt zuerst `lint:includes` aus
  - startet danach den Watch-Modus
- `npm run browser` (optional)
  - startet Chromium lokal mit einem separaten Projekt-Profilordner:
    - `.local/chromium-profile-roll20`
  - Login und Extension-Setup bleiben manuell

## Roll20 Deploy-Flow (lokal)
1. `npm run build`
2. (optional) `npm run watch` für laufende Änderungen
3. Roll20 Sheet Sandbox über lokalen Upload/Autouploader auf `output/` aktualisieren

Für die Roll20-Sandbox verwende bevorzugt:
- `output/charactersheet.html`
- `output/charactersheet.css`
- `output/sheet_workers.js` (wenn Worker separat gepflegt/geladen werden)
- `output/translation.json` (flaches Key-Value-Format)

## Neue Box hinzufügen (Kurzablauf)
1. Neue Partial-Datei im passenden Tab-Unterordner anlegen, z. B. `src/html/partials/tabs/allgemein/sections/08-neue-box.html`.
2. Block in `src/html/charactersheet.html` einhängen:
   - `<!-- BEGIN BLOCK: Neue Box -->`
   - `<!-- @include partials/tabs/allgemein/sections/08-neue-box.html -->`
   - `<!-- END BLOCK: Neue Box -->`
3. Prüfen: `npm run lint:includes`
4. Bauen: `npm run build`

## Architektur-Doku
- `CONTRIBUTING.md`
- `docs/architecture.md`
- `docs/adding-a-box.md`
- `docs/path-map.md`
- `docs/worker-flow.md`
- `docs/ui-patterns.md`

Hinweis: Dieses Repository aktualisiert Roll20 nicht über Git-Sync, sondern nur lokal über Upload.

## Referenzen
- https://wiki.roll20.net/Character_Sheets
- https://wiki.roll20.net/Building_Character_Sheets
- https://wiki.roll20.net/Character_Sheet_Enhancement
- https://wiki.roll20.net/Custom_Sheet_Sandbox
- https://wiki.roll20.net/Character_Sheet/API
- https://wiki.roll20.net/Roll_Templates
- https://help.roll20.net/hc/en-us/articles/360037257334-How-to-Make-Roll-Templates
