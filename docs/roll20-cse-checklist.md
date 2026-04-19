# Roll20 CSE Checklist (SR6)

Stand: 2026-04-15

## Quellen (Kern)
- https://wiki.roll20.net/Character_Sheets
- https://wiki.roll20.net/Building_Character_Sheets
- https://wiki.roll20.net/Character_Sheet_Enhancement
- https://wiki.roll20.net/Character_Sheet/API
- https://wiki.roll20.net/Roll_Templates
- https://help.roll20.net/hc/en-us/articles/360037257334-How-to-Make-Roll-Templates
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
- CSE-first kompatible Struktur: umgesetzt
- Einheitliche Klassenstruktur: modularisiert
- Attributschema `attr_sr6_<...>`: umgesetzt
- i18n-Key-only Labels: umgesetzt
- Worker/API-Abgleich: umgesetzt (`output/sheet_workers.js` wird erzeugt)

## Konkrete naechste Schritte
1. Roll- und Berechnungslogik je Tab schrittweise ausbauen.
2. i18n-Keys in sichtbaren Labels weiter konsolidieren (DE primar, EN/FR parallel).
3. Wenn `sheet.json` eingefuehrt wird: CSE explizit halten (`legacy: false`).

## Hinweis zu Legacy vs CSE
Bei Widerspruechen zwischen alter Wiki-Doku und CSE-Verhalten gilt fuer dieses Projekt: CSE-first.
