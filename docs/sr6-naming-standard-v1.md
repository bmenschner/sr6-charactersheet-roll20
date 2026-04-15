# SR6 Character Sheet Naming Standard v1

## Ziel
Eine einheitliche, modulare und wiederverwendbare Namensgebung fuer HTML-Klassen, Attributnamen (`attr_...`) und Tab-/Box-Strukturen.

Diese Konvention kombiniert:
- eure Projektidee aus `readme.md`
- aktuelle Roll20-Richtlinien (Help Center)
- den Ist-Stand aus `output/charakterbogen.de.html` und `output/charakterbogen.de.css`

## Roll20-relevante Leitlinien (zusammengefasst)

1. Attributfelder muessen mit `attr_` beginnen und eindeutig sein.
2. Attributnamen sollten konsistent lowercase sein.
3. Es gibt relevante Unterschiede zwischen Legacy (LCS) und Character Sheet Enhancement (CSE):
   - Legacy: automatisches `sheet-`-Prepending war Standard.
   - CSE: dieses Verhalten kann entfallen (Migration/Kompatibilitaet beachten).
4. IDs sind in CSE grundsaetzlich moeglich; trotzdem sollten wir IDs sparsam und zielgerichtet einsetzen (nur dort, wo sie semantisch wirklich helfen, z. B. gekoppelte Controls).

Hinweis: Teile der historischen Doku unterscheiden Legacy- und CSE-Verhalten. Unsere Konvention ist daher **CSE-first**, aber mit klaren Migrationsregeln fuer Legacy-Faelle.

## Engine-Entscheidung (verbindlich fuer dieses Projekt)

Wir arbeiten **CSE-first**.

Das bedeutet:
- Klassen werden ohne `sheet-` im Quellcode gefuehrt.
- Keine Legacy-only Workarounds als Standard.
- Wenn Legacy-Kompatibilitaet benoetigt wird, loesen wir dies gezielt in einer Kompatibilitaetsschicht.

## Namensschema (verbindlich)

### 1) Root und Layout
- Root: `sr6-charactersheet`
- Hauptbereiche:
  - `sr6-charactersheet-kopfbereich`
  - `sr6-charactersheet-menu`
  - `sr6-charactersheet-tab-<tabname>`

### 2) Boxen
- Box: `sr6-charactersheet-box-<boxname>`
- Box-Titel: `sr6-charactersheet-box-<boxname>-title`
- Box-Content: `sr6-charactersheet-box-<boxname>-content`

### 3) Felder
- Feldwrapper: `sr6-charactersheet-field`
- Feldlabel: `sr6-charactersheet-field-label`
- Feldinput: `sr6-charactersheet-field-input`
- Kombi Input + Wuerfel: `sr6-charactersheet-field-input-with-dice`
- Wuerfelbutton: `sr6-charactersheet-field-dice-button`

### 4) Utility / Layout
- Reihen:
  - `sr6-charactersheet-row`
  - `sr6-charactersheet-row-1`
  - `sr6-charactersheet-row-2`
  - `sr6-charactersheet-row-4`
  - `sr6-charactersheet-row-7`
- Allgemein-Grid: `sr6-charactersheet-tab-allgemein-grid`

## Attributnamen (`name="attr_..."`) Standard

### Grundregel
`attr_sr6_<modul>_<bereich>_<feld>[_<teil>]`

Beispiele:
- `attr_sr6_attr_konstitution_grundwert`
- `attr_sr6_attr_konstitution_modifikator`
- `attr_sr6_attr_konstitution_gesamtwert`
- `attr_sr6_combat_fernkampf_sehr_nah`
- `attr_sr6_combat_primaere_nahkampfwaffe`
- `attr_sr6_bio_strassenname`

### Vorteile
- keine Kollisionen zwischen Tabs
- klare Herkunft pro Wert
- sheet-worker-freundlich
- leichteres i18n-Mapping

## Ist -> Soll (Kernauszug)

### Klassen
- `sr6-layout` -> `sr6-charactersheet`
- `sr6-kopfbereich` -> `sr6-charactersheet-kopfbereich`
- `sr6-daten-tabs` -> `sr6-charactersheet-menu`
- `sr6-box` -> `sr6-charactersheet-box`
- `sr6-box--attribute` -> `sr6-charactersheet-box-attribute`
- `sr6-box--wichtige-kampf-infos` -> `sr6-charactersheet-box-wichtige-kampf-infos`
- `sr6-field` -> `sr6-charactersheet-field`
- `sr6-eingabe-mit-wuerfel` -> `sr6-charactersheet-field-input-with-dice`
- `sr6-wuerfelicon` -> `sr6-charactersheet-field-dice-button`

### Attribute (Beispiele)
- `attr_konstitution_grundwert` -> `attr_sr6_attr_konstitution_grundwert`
- `attr_konstitution_modifikator` -> `attr_sr6_attr_konstitution_modifikator`
- `attr_konstitution_gesamtwert` -> `attr_sr6_attr_konstitution_gesamtwert`
- `attr_primaere_nahkampfwaffe` -> `attr_sr6_combat_primaere_nahkampfwaffe`
- `attr_edge_biographie` -> `attr_sr6_bio_edge`

## Umsetzungsstrategie (empfohlen)

1. Phase A: Alias-Phase (ohne Bruch)
- Neue Klassen zusaetzlich vergeben (alte bleiben vorerst)
- CSS selektiert alt + neu parallel

2. Phase B: Attribut-Migration
- Neue `attr_sr6_...` Namen einfuehren
- Sheet Worker / Roll Buttons auf neue Namen umstellen
- Falls noetig, einmalige Migrationsroutine (Werte kopieren)

3. Phase C: Bereinigung
- Alte Klassen und alte Attributnamen entfernen
- Doku und Feldkatalog final angleichen

## Verbindliche Regeln fuer neue Elemente

- Keine neuen uneinheitlichen Kurzformen mehr (`sr6-*` ohne `-charactersheet-` in Kernkomponenten).
- Neue Felder nur im `attr_sr6_<...>`-Format.
- Neue Boxen immer ueber `sr6-charactersheet-box-<name>`.
- Neue Tabinhalte immer unter `sr6-charactersheet-tab-<name>`.
- IDs nur bei echtem Nutzen; bevorzugt klassen- und strukturgetriebene Selektoren.

## Nächster konkreter Schritt

Als naechstes wird eine **non-breaking Alias-Migration** in HTML/CSS umgesetzt:
- neue Standardklassen zusaetzlich zu den bestehenden Klassen
- keine visuelle oder funktionale Regression
- danach Schritt 2: Attribute auf `attr_sr6_...`
