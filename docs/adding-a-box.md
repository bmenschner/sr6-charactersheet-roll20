# How To: Neue Box hinzufuegen

## 1. HTML-Partial erstellen
- Datei anlegen, z. B.:
  - `src/html/partials/<tab>/<name>.html`
- Kommentarrahmen setzen:
  - `<!-- BEGIN BLOCK: ... -->`
  - `<!-- END BLOCK: ... -->`

## 2. Im Entry einhaengen
- In `src/html/charactersheet.html` per Include einbinden:
  - `<!-- @include partials/<tab>/<name>.html -->`

## 3. Styling
- Bevorzugt bestehende Komponentenklassen wiederverwenden.
- Falls neue Regeln noetig sind:
  - passendes Modul in `src/css/modules/` erweitern
  - oder neues Modul anlegen und in `manifest.json` eintragen

## 4. Worker (nur wenn berechnete Felder)
- Berechnung in `src/workers/compute/<domain>.js`
- Events in `src/workers/core/register.js`

## 5. i18n
- Neue Labels/Sections in `src/i18n/translation.json` ergaenzen (de/en/fr)

## 6. Validierung
- `npm run lint:includes`
- `npm run build`
- Sandbox-Test in Roll20
