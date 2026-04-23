# SR6 Sheet Architektur

## Verzeichnisstruktur
- `src/html/`
  - Entry: `charactersheet.html`
  - Teilblaecke: `partials/**`
  - Shell-Kopfbereich (flat): `partials/shell/kopfbereich*.html`
- `src/css/modules/`
  - modulare Styles (Reihenfolge via `manifest.json`)
  - Shell-Header-Module: `shell/kopfbereich-layout.css`, `shell/kopfbereich-monitor.css`, `shell/kopfbereich-edge.css`
- `src/workers/core/, src/workers/compute/, src/workers/rolls/, src/workers/ui/`
  - modularer Sheet-Worker-Code
  - Monitor-Header-Compute: `workers/compute/header-monitor.js`
- `src/i18n/translation.json`
  - DE/EN/FR Quelle
- `output/`
  - generierte Upload-Dateien fuer Roll20 Sandbox

## Build-Pipeline
1. Include-Lint (`npm run lint:includes`)
2. HTML Include-Aufloesung -> `output/charactersheet.html`
3. CSS-Modulbundle aus `src/css/modules/manifest.json` -> `output/charactersheet.css`
4. Worker-Bundle aus `src/workers/sheet_workers.js` -> `output/sheet_workers.js`
5. i18n:
   - `translation.full.json` (voll)
   - `translation.json` (flat, Roll20-kompatibel)
6. statische Assets -> `output/assets/images`

## Include-Roots
Include-Dateien duerfen nur in diesen Roots liegen:
- `src/html`
- `src/i18n`
- `src/workers`

## Designentscheidung
- Roll20 braucht weiterhin eine finale Einzel-CSS/HTML im Output.
- Im Source arbeiten wir modular; der Build fuegt zusammen.
- Kopfbereich-Dateien bleiben bewusst flach im Shell-Ordner (`kopfbereich-*.html`), damit Tickets ohne Include-Navigation schnell auffindbar sind.
