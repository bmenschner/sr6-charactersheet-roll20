# Roll20 CSE Checklist (SR6)

Stand: 2026-04-16
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
- Wuerfel-Elemente als Roll20-Rollbuttons (`type="roll"`) umgesetzt und an `attr_sr6_*`-Felder gebunden.

### Noch offen / in Arbeit
- Klassen-Namensmigration auf finales vereinheitlichtes Schema (`sr6-charactersheet-*`) ist im `output`-HTML und `output`-CSS abgeschlossen (alte Alias-Klassen entfernt).
- Attributnamen in `output/charakterbogen.de.html` sind auf ein `attr_sr6_*`-Schema migriert (Module: `attr`, `combat`, `bio`, `monitor`). Legacy-Namen sind dort bereinigt.
- i18n-Umstellung ist im `output` integriert: `data-i18n`-Keys sind gesetzt, DE/EN/FR-Übersetzungen eingebunden und eine Sprachumschaltung (DE/EN/FR) mit Persistenz (`localStorage`) ist ergänzt. Live-Test in Roll20 steht noch aus.
- Worker/API-Logik ist teilweise integriert (Rollbuttons aktiv mit thematischen Testnamen, Kampf-Kontext in Chat-Ausgabe fuer Waffe/Modus, `text/worker` fuer Attribut-Gesamtwerte + zentrale `sr6_derived_*`-Basiswerte), aber noch nicht final (keine erweiterten Rolltemplates, keine weitergehenden Berechnungen fuer Kampf/Matrix/Magie).

## Verbindlicher naechster Schritt

### Schritt 1 (jetzt): Roll/API-Vertiefung
- Rollbuttons auf thematische Rolltemplates sind aufgeteilt (Attribute, Fernkampf, Nahkampf).
- Ergebnisfelder und Kontext sind in der Chat-Ausgabe eingebunden (Waffe/Modus bei Kampf).
- Konsistente Namenskonvention fuer `roll_...`-Buttons ist dokumentiert (`docs/roll20-roll-button-naming-v1.md`).
- Lesbare Roll-Ausgabe fuer `Attribut` ist umgesetzt (keine `sr6_*`-Schluessel mehr im Chat-Template-Feld `Attribut`).

### Schritt 2: Worker-Ausbau
- Abgeleitete Werte fuer zentrale Bereiche sind begonnen (`sr6_derived_*` fuer Initiative/Verteidigung/Monitor/Edge-Basis).
- Worker-Trigger fuer Attribute sind auf zentralen Recompute-Flow konsolidiert (weniger Event-Fragmentierung, geringeres Zirkularitaetsrisiko).

### Schritt 3: Roll20-Live-Check
- i18n-Umschaltung (DE/EN/FR), Rollbuttons und Worker in Roll20 praktisch testen.
- Gefundene UI-/Worker-Abweichungen im Output nachziehen.
- Testprotokoll ist vorbereitet (`docs/roll20-live-check-v1.md`).

## Akzeptanzkriterien fuer den aktuellen Sprint
- CSE-Entscheidung klar dokumentiert.
- Root-Checkliste vorhanden und aktuell.
- Klassenmigrations-Start freigegeben.
