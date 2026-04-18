# SR6 Sheet Architektur

## Verzeichnisstruktur
- `src/html/`
  - Entry: `charactersheet.html`
  - Teilblaecke: `partials/**`
- `src/css/modules/`
  - modulare Styles (Reihenfolge via `manifest.json`)
- `src/workers/core/, src/workers/compute/, src/workers/ui/`
  - modularer Sheet-Worker-Code
- `src/i18n/translation.json`
  - DE/EN/FR Quelle
- `output/`
  - generierte Upload-Dateien fuer Roll20 Sandbox

## Build-Pipeline
1. Include-Lint (`npm run lint:includes`)
2. HTML Include-Aufloesung -> `output/charactersheet.html`
3. CSS-Modulbundle aus `src/css/modules/manifest.json` -> `output/charactersheet.css`
4. i18n:
   - `translation.full.json` (voll)
   - `translation.json` (flat, Roll20-kompatibel)
5. statische Assets -> `output/assets/images`

## Include-Roots
Include-Dateien duerfen nur in diesen Roots liegen:
- `src/html`
- `src/i18n`
- `src/workers`

## Designentscheidung
- Roll20 braucht weiterhin eine finale Einzel-CSS/HTML im Output.
- Im Source arbeiten wir modular; der Build fuegt zusammen.
