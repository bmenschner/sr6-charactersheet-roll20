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
  - Roll-Definitionen: `workers/rolls/definitions/*.js` nach fachlichen Domaenen; `workers/rolls/definition-resolver.js` enthaelt Runtime-/Resolver-Helfer
  - Monitor-Header-Compute: `workers/compute/header-monitor.js`
- `src/i18n/translation.json`
  - DE/EN/FR Quelle
- `output/`
  - generierte Upload-Dateien fuer Roll20 Sandbox
- `docs/`
  - operative Projekt-, Pfad- und Refactor-Dokumentation
  - historische Dokumente unter `docs/archive/`

## Build-Pipeline
1. Include-Lint (`npm run lint:includes`)
2. HTML Include-Aufloesung -> `output/charactersheet.html`
3. CSS-Modulbundle aus `src/css/modules/manifest.json` -> `output/charactersheet.css`
4. Worker-Bundle aus `src/workers/sheet_workers.js` -> `output/sheet_workers.js`
5. i18n aus `src/i18n/translation.json` -> `output/translation.json` (flat, Roll20-kompatibel)
6. statische Assets -> `output/assets/images`

## Include-Roots
Include-Dateien duerfen nur in diesen Roots liegen:
- `src/html`
- `src/i18n`
- `src/workers`

## Designentscheidung
- Roll20 braucht weiterhin eine finale Einzel-CSS/HTML im Output.
- Im Source arbeiten wir modular; der Build fuegt zusammen.
- Roll-Definitionen werden domain-orientiert gepflegt (`combat`, `magic`, `matrix`, `rigging`, `skills`, `equipment`, `edge`/shared). Die Registry setzt daraus die Roll20-kompatible Definitionsliste zusammen.
- Kopfbereich-Dateien bleiben bewusst flach im Shell-Ordner (`kopfbereich-*.html`), damit Tickets ohne Include-Navigation schnell auffindbar sind.
- `Allgemein` ist nur noch eine reduzierte Uebersicht/Spiegel-Ansicht; operative Pflege passiert in den Fach-Tabs.
- Nicht inkludierte Alt-Partial-Dateien koennen noch im Tree liegen, sind aber keine aktive UI, solange sie nicht ueber `@include` eingebunden sind.
- Ehemalige Root-Dokumente wie `CONTRIBUTING.md` liegen im Archiv, wenn sie nicht mehr operative Arbeitsgrundlage sind.
- Historische Dokumente liegen unter `docs/archive/` und gelten nicht als operative Arbeitsgrundlage.
