# Roll20 CSE Checklist (SR6)

Stand: 2026-04-15

## Quellen (Kern)
- https://wiki.roll20.net/Character_Sheets
- https://wiki.roll20.net/Building_Character_Sheets
- https://wiki.roll20.net/Character_Sheet_Enhancement
- https://wiki.roll20.net/Character_Sheet/API
- https://help.roll20.net/hc/en-us/articles/360037773393-Building-Character-Sheets
- https://help.roll20.net/hc/en-us/articles/360037773413-Intro-to-Sheet-Development

## Entscheidung
Wir arbeiten CSE-first.

Begruendung:
- CSE ist der moderne Standard fuer neue Sheets.
- Legacy-Verhalten (z. B. automatisches `sheet-`-Prepending) soll nicht als Basis angenommen werden.

## Harte CSE-Regeln fuer dieses Projekt
1. Keine Legacy-only Annahmen in CSS/HTML.
2. Klassen-Naming konsistent und modular.
3. Attributnamen strikt, eindeutig, worker-freundlich.
4. IDs nur gezielt verwenden.
5. Sichtbarer Text perspektivisch i18n-faehig halten.

## Ist-Stand (aktuell)
- CSE-first kompatible Struktur: teilweise vorhanden
- Einheitliche Klassenstruktur: in Arbeit
- Attributschema `attr_sr6_<...>`: noch offen (teilweise alte Namen aktiv)
- i18n-Key-only Labels: noch offen (derzeit teils hardcoded)
- Worker/API-Abgleich: noch offen (noch kein `sheet_workers.js` im aktiven Output-Pfad)

## Konkrete naechste Schritte
1. HTML/CSS Klassen auf finales Schema `sr6-charactersheet-*` migrieren (Alias-Phase ohne Bruch).
2. Attributnamen auf `attr_sr6_<modul>_<bereich>_<feld>[_teil]` umstellen.
3. Roll-Buttons/Wuerfel-Buttons an `Character_Sheet/API`-Flow anbinden.
4. i18n-Keys in sichtbaren Labels vorbereiten (DE primar, EN/FR parallel).
5. Wenn `sheet.json` eingefuehrt wird: CSE explizit halten (`legacy: false`).

## Hinweis zu Legacy vs CSE
Bei Widerspruechen zwischen alter Wiki-Doku und CSE-Verhalten gilt fuer dieses Projekt: CSE-first, dann ggf. gezielte Legacy-Kompatibilitaet.
