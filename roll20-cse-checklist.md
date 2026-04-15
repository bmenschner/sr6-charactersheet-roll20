# Roll20 CSE Checklist (SR6)

Stand: 2026-04-15
Ort: Root-Checkliste fuer den aktuellen Entwicklungsstand

## Ziel
Dieses Projekt wird nach moeglichst aktuellem Roll20-Standard umgesetzt: **CSE-first**.

## Referenzen
- https://wiki.roll20.net/Character_Sheets
- https://wiki.roll20.net/Building_Character_Sheets
- https://wiki.roll20.net/Character_Sheet_Enhancement
- https://wiki.roll20.net/Character_Sheet/API
- https://help.roll20.net/hc/en-us/articles/360037773393-Building-Character-Sheets
- https://help.roll20.net/hc/en-us/articles/360037773413-Intro-to-Sheet-Development

## Entscheidung
Wir arbeiten **CSE-first**.

### Was das konkret bedeutet
1. Keine Legacy-only Annahmen als Basis (z. B. implizite Klassentransformationen).
2. Modularisierte, klar benannte Klassenstruktur.
3. Eindeutige Attributnamen (`attr_...`) mit konsistentem Schema.
4. IDs nur gezielt, primär klassen- und strukturgetrieben arbeiten.
5. Sichtbarer Text perspektivisch i18n-faehig.

## Aktueller Stand (Ist)

### Bereits umgesetzt
- Tab-Architektur mit 9 Bereichen vorhanden (Allgemein, Fertigkeiten, Kampf, Magie, Matrix, Rigging, Ausruestung, Biographie, Notizen).
- Bereich "Allgemein" enthaelt die zwei Kernboxen:
  - Attribute
  - Wichtige Kampf-Infos
- Bereich "Biographie" enthaelt den Block "Persoenliche Daten".
- Responsive Verhalten fuer Allgemein-2-Spalten-Layout umgesetzt:
  - Breakpoint bei 800px (`50rem`) -> Wechsel auf 1 Spalte.
- Wuerfel-Elemente als echte klickbare HTML-Buttons angelegt (kein reines Pseudoelement mehr).

### Noch offen / in Arbeit
- Klassen-Namensmigration auf finales vereinheitlichtes Schema (`sr6-charactersheet-*`) ist gestartet: Alias-Phase (alt+neu parallel) im `output`-HTML/CSS umgesetzt, Bereinigung alter Klassen noch offen.
- Attributnamen in `output/charakterbogen.de.html` sind auf ein `attr_sr6_*`-Schema migriert (Module: `attr`, `combat`, `bio`, `monitor`). Legacy-Namen sind dort bereinigt.
- i18n-Umstellung ist begonnen, aber sichtbare Labels sind aktuell noch weitgehend hardcoded.
- Worker/API-Logik ist noch nicht final in den produktiven Output integriert.

## Verbindlicher naechster Schritt

### Schritt 1 (jetzt): Non-breaking Klassenmigration
- Neue Standardklassen zusaetzlich zu bestehenden Klassen einfuehren.
- CSS parallel auf alt + neu abbilden.
- Keine visuelle/strukturelle Regression.

### Schritt 2: Attributschema vereinheitlichen
- Zielschema: `attr_sr6_<modul>_<bereich>_<feld>[_teil]`
- Danach Roll- und Worker-Referenzen auf das neue Schema umstellen.

### Schritt 3: i18n-Konsolidierung
- Sichtbare Labels konsequent ueber i18n-Keys aufloesen.
- DE als Primaersprache, EN/FR parallel pflegen.

## Akzeptanzkriterien fuer den aktuellen Sprint
- CSE-Entscheidung klar dokumentiert.
- Root-Checkliste vorhanden und aktuell.
- Klassenmigrations-Start freigegeben.
