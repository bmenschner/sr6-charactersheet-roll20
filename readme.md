# SR6 Roll20 Character Sheet (Lokalworkflow)

## Source und Output
- Source of Truth:
  - `src/html/charactersheet.html`
  - `src/html/partials/boxes/*.html` (modulare Boxen, per Include eingebunden)
  - `src/css/charactersheet.css`
  - `src/i18n/translation.json`
- Generierter Output:
  - `output/charactersheet.html`
  - `output/charactersheet.css`
  - `output/translation.json` (flaches Roll20-Format)
  - `output/translation.full.json` (interner Vollstand DE/EN/FR)
  - `output/assets/images/*`

## Lokale Skripte
- `npm run build`
  - baut `output/charactersheet.html` aus `src/html/charactersheet.html` zusammen
    - Include-Syntax: `<!-- @include partials/boxes/datei.html -->`
  - kopiert die übrigen Source-Dateien aus `src/` nach `output/`
  - kopiert statische Bildassets aus `src/` nach `output/assets/images/`
- `npm run watch` (oder `npm run dev`)
  - beobachtet `src/` rekursiv
  - führt bei Änderungen automatisch den Build erneut aus
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

Hinweis: Dieses Repository aktualisiert Roll20 nicht über Git-Sync, sondern nur lokal über Upload.

## Referenzen
- https://wiki.roll20.net/Character_Sheets
- https://wiki.roll20.net/Building_Character_Sheets
- https://wiki.roll20.net/Character_Sheet_Enhancement
- https://wiki.roll20.net/Custom_Sheet_Sandbox
- https://wiki.roll20.net/Character_Sheet/API
