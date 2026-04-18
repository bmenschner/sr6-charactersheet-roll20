# SR6 Roll20 Character Sheet (Lokalworkflow)

## Source und Output
- Source of Truth:
  - `src/html/charactersheet.html`
  - `src/html/partials/**/*` (modulare HTML-Blöcke, per Include eingebunden)
  - `src/css/modules/**/*` (modulare Styles, gebündelt via `manifest.json`)
  - `src/workers/modules/**/*` (modulare Worker-Logik)
  - `src/i18n/translation.json`
  - `src/assets/images/*`
- Generierter Output:
  - `output/charactersheet.html`
  - `output/charactersheet.css`
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
- `output/translation.json` (flaches Key-Value-Format)

## Neue Box hinzufügen (Kurzablauf)
1. Neue Partial-Datei in einem passenden Unterordner anlegen, z. B. `src/html/partials/allgemein/neue-box.html`.
2. Block in `src/html/charactersheet.html` einhängen:
   - `<!-- BEGIN BLOCK: Neue Box -->`
   - `<!-- @include partials/allgemein/neue-box.html -->`
   - `<!-- END BLOCK: Neue Box -->`
3. Prüfen: `npm run lint:includes`
4. Bauen: `npm run build`

## Architektur-Doku
- `CONTRIBUTING.md`
- `docs/architecture.md`
- `docs/adding-a-box.md`
- `docs/worker-flow.md`
- `docs/ui-patterns.md`

Hinweis: Dieses Repository aktualisiert Roll20 nicht über Git-Sync, sondern nur lokal über Upload.

## Referenzen
- https://wiki.roll20.net/Character_Sheets
- https://wiki.roll20.net/Building_Character_Sheets
- https://wiki.roll20.net/Character_Sheet_Enhancement
- https://wiki.roll20.net/Custom_Sheet_Sandbox
- https://wiki.roll20.net/Character_Sheet/API
