# SR6 Roll20 Character Sheet (Lokalworkflow)

## Source und Output
- Source of Truth:
  - `src/html/charactersheet.html`
  - `src/css/charactersheet.css`
  - `src/i18n/translation.json`
- Generierter Output:
  - `output/assets/charactersheet.html`
  - `output/assets/charactersheet.css`
  - `output/assets/translation.json`
  - `output/assets/images/*`

## Lokale Skripte
- `npm run build`
  - kopiert die Source-Dateien aus `src/` nach `output/assets/`
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
3. Roll20 Sheet Sandbox über lokalen Upload/Autouploader auf `output/assets/` aktualisieren

Hinweis: Dieses Repository aktualisiert Roll20 nicht über Git-Sync, sondern nur lokal über Upload.

## Referenzen
- https://wiki.roll20.net/Character_Sheets
- https://wiki.roll20.net/Building_Character_Sheets
- https://wiki.roll20.net/Character_Sheet_Enhancement
- https://wiki.roll20.net/Custom_Sheet_Sandbox
- https://wiki.roll20.net/Character_Sheet/API
