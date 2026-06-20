# AGENTS.md

## Zweck

Dieses Repository enthält ein deutsches **Shadowrun-6-Character-Sheet für Roll20**.

Dieses Projekt ist **keine klassische Web-App**. Änderungen müssen zuerst an Roll20-Kompatibilität, Datenstabilität und bestehender Charakterpersistenz gemessen werden.

Ziele:

* Roll20-kompatibles Sheet erhalten
* bestehende Charakterdaten nicht beschädigen
* SR6-Mechaniken nachvollziehbar abbilden
* Source-first arbeiten
* kleine, überprüfbare Änderungen bevorzugen

---

## Geltungsbereich

Diese Datei gilt global für das gesamte Repository.

Bereichsspezifische Zusatzregeln liegen in:

```text
src/html/AGENTS.override.md
src/css/AGENTS.override.md
src/workers/AGENTS.override.md
src/i18n/AGENTS.override.md
```

Ausführliche Erläuterungen und Beispiele stehen in:

```text
docs/agent-guidelines.md
```

Bei Widersprüchen gilt:

1. nähere `AGENTS.override.md`
2. diese `AGENTS.md`
3. `docs/architecture.md`
4. `docs/path-map.md`
5. aktuelle Source-Dateien unter `src/`
6. `README.md`
7. `docs/archive/**` nur historisch

---

## Wichtigste Regeln

1. **Roll20-Kompatibilität hat Vorrang vor moderner Webarchitektur.**
2. **Source-Dateien ändern, nicht generierten Output manuell bearbeiten.**
3. **Bestehende Roll20-Feldnamen nicht ohne ausdrückliche Freigabe ändern.**
4. **Keine Frameworks, keine große Toolchain-Änderung, keine unnötigen Dependencies.**
5. **Sichtbare UI-Texte über i18n pflegen.**
6. **Build ausführen oder Nichtausführung explizit nennen.**
7. **Keine Tests behaupten, die nicht ausgeführt wurden.**
8. **Kleine, domänennah begrenzte Änderungen statt großer Refactorings.**

---

## Projektstruktur

Primäre Source-Dateien:

```text
src/html/       Sheet-Struktur, Tabs, Inputs, Buttons, RollTemplates
src/css/        Styling und CSS-Module
src/workers/    Sheet Worker, Compute-, Roll- und UI-Logik
src/i18n/       Übersetzungen
src/assets/     Assets
```

Generierte Roll20-Artefakte:

```text
output/charactersheet.html
output/charactersheet.css
output/sheet_workers.js
output/translation.json
```

Regeln für `output/`:

* niemals manuell editieren
* nur durch Build aktualisieren
* wenn `output/` geändert ist, muss der Source-Change dazu existieren
* keine Patches akzeptieren, die nur generierten Output ändern

---

## Roll20-Persistenz

Roll20 speichert Charakterdaten über Feldnamen. Diese Namen sind Teil des Datenmodells.

Nicht ohne ausdrückliche Freigabe ändern:

```text
attr_*
act_*
roll_*
repeating_*
```

Besonders kritisch:

* bestehende `attr_*`-Namen
* Namen von `repeating_*`-Sektionen
* gespeicherte Checkboxen, Selects, Inputs und Textareas
* semantische Bedeutung vorhandener Felder

Wenn ein Feld ersetzt werden muss:

1. altes Feld weiter lesen
2. neues Feld schreiben
3. Fallback für bestehende Charaktere erhalten
4. Migration oder Initialisierung dokumentieren
5. alte Felder nicht ohne Freigabe entfernen

---

## Änderungskategorien

Jede Aufgabe vor der Umsetzung einordnen.

### UI-only

Beispiele:

* Layout
* Tabs
* Labels
* Hilfetexte
* Styling

Prüfen:

* keine Feldnamenänderung
* i18n berücksichtigt
* Roll20-kompatibles HTML/CSS
* keine unbeabsichtigten Auswirkungen auf andere Tabs

### Data model

Beispiele:

* neue `attr_*`-Felder
* neue gespeicherte Werte
* neue `repeating_*`-Sektionen

Prüfen:

* Rückwärtskompatibilität
* Defaults
* Initialisierung
* Migration/Fallback
* bestehende Charakterdaten

### Compute

Beispiele:

* abgeleitete Werte
* Poolberechnung
* Monitorberechnung
* Zustandsmodifikatoren

Prüfen:

* Eingabefelder
* Ausgabefelder
* Trigger
* manuelle Overrides
* Recompute-Nebenwirkungen

### Roll logic

Beispiele:

* Würfelpools
* Edge
* Glitch/Critical Glitch
* RollTemplates
* Chat-Ausgabe

Prüfen:

* sichtbare und nachvollziehbare Rollkomponenten
* keine versteckte Persistenz
* korrekte Modifikatoren
* konsistente Template-Ausgabe
* bei Rolltemplate-Infofenstern die komplette Anzeige-Pipeline prüfen: Row-Erzeugung, Gruppierung, Label-Transformation, Dedupe und final sichtbare Info-Ausgabe

### Build/Tooling

Beispiele:

* Build-Skripte
* Include-System
* CSS-Manifest
* Watch-/Dev-Tools

Prüfen:

* keine unnötige Toolchain-Komplexität
* keine neue Dependency ohne Freigabe
* `npm run build`

---

## SR6-Domänen

Bei Spielmechanik zuerst die betroffene Domäne bestimmen:

```text
Attribute
Fertigkeiten
Spezialisierungen / Expertisen
Edge
Kampf
Schaden
Zustandsmonitore
Magie
Resonanz
Matrix
Rigging
Fahrzeuge
Drohnen
Ausrüstung
Waffen
Panzerung
Biographie
Einstellungen
```

Vor Änderungen klären:

* Ist es UI, Datenmodell, Compute, Roll-Logik oder Tooling?
* Welche `attr_*`-Felder sind betroffen?
* Welche `repeating_*`-Sektionen sind betroffen?
* Gibt es manuelle Overrides?
* Wird ein Wert gespeichert, angezeigt oder nur temporär für einen Wurf verwendet?
* Hat die Änderung Auswirkungen auf andere Domänen?

Domänengrenzen nicht unbeabsichtigt vermischen, insbesondere:

* Charakterwerte vs. Fahrzeugwerte
* physischer vs. geistiger Schaden
* Zustandsmonitor vs. Zustandsmodifikator
* Ausrüstungseintrag vs. aktiver Würfelpool
* UI-Anzeige vs. Berechnungslogik
* manuelle vs. automatische Modifikatoren

---

## Build und Prüfung

Nach Source-Änderungen grundsätzlich ausführen:

```bash
npm run build
```

Bei HTML-Include-Änderungen:

```bash
npm run lint:includes
```

Bei CSS-Modul-Änderungen:

```bash
npm run lint:css-modules
```

Wenn ein erwartetes Kommando nicht ausgeführt wurde, in der Antwort explizit schreiben:

```text
Nicht ausgeführt:
- <Kommando> — <Grund>
```

Beispiel:

```text
Nicht ausgeführt:
- npm run build — Dependencies lokal nicht installiert.
- Roll20-Sandbox-Test — kein Zugriff auf Roll20-Testkampagne.
```

---

## Manuelle Roll20-Prüfung

Bei Änderungen an HTML, CSS, Workern, Rolls oder Templates nach Möglichkeit in Roll20 prüfen:

* Sheet lädt ohne Fehler
* Tabs funktionieren
* Inputs speichern Werte
* Repeating Sections funktionieren
* berechnete Werte aktualisieren sich
* Roll-Buttons erzeugen korrekte Chat-Ausgabe
* RollTemplates sehen korrekt aus
* i18n-Texte erscheinen korrekt
* bestehende Charakterdaten bleiben erhalten

Wenn kein Roll20-Test möglich war, muss das genannt werden.

---

## Abhängigkeiten und Toolchain

Nicht ohne ausdrückliche Freigabe:

* React, Vue, Svelte, Angular oder andere Frameworks einführen
* TypeScript-Migration starten
* neuen Bundler einführen
* neue Runtime-Abhängigkeiten hinzufügen
* globale Formatierung des Repositories durchführen
* Build-Konzept grundlegend ändern

Bestehende Skripte und Projektkonventionen bevorzugen.

---

## Code-Stil

* kleine, gezielte Änderungen
* bestehenden Stil respektieren
* keine unrelated cleanup changes
* keine großflächige Umformatierung
* klare, domänennahe Namen
* Kommentare nur für relevante Roll20-/SR6-Sonderfälle
* keine Debug-Ausgaben stehen lassen
* keine TODOs ohne Kontext
* keine toten Codepfade einführen

---

## Antwortformat

### Bei Code-Änderungen

```md
## Plan

- ...

## Änderungen

- ...

## Betroffene Dateien

- `path/to/file`

## Test

Ausgeführt:
- ...

Nicht ausgeführt:
- ...

## Hinweise / Risiken

- ...
```

### Bei Analyse oder Review ohne Codeänderung

```md
## Befund

...

## Risiken

...

## Empfehlung

...

## Nächste Schritte

...
```

Wenn keine Dateien geändert wurden:

```text
Keine Dateien geändert.
```

---

## Definition of Done

Eine Änderung gilt erst als abgeschlossen, wenn:

* der Scope eingehalten wurde
* nur notwendige Dateien geändert wurden
* keine Roll20-Feldnamen unbeabsichtigt geändert wurden
* i18n berücksichtigt wurde
* `npm run build` erfolgreich war oder Nichtausführung begründet wurde
* `output/` nur durch Build verändert wurde
* Roll20-Auswirkungen beschrieben wurden
* Risiken und offene Punkte genannt wurden

---

## Leitlinie

Dieses Projekt verwaltet langlebige Roll20-Charakterdaten.

Deshalb gilt:

**Stabilität, Rückwärtskompatibilität und nachvollziehbare SR6-Mechanik sind wichtiger als moderne Webarchitektur oder kosmetische Refactorings.**
