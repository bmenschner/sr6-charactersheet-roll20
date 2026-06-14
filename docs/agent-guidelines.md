# docs/agent-guidelines.md

# Agent Guidelines

Diese Datei ergänzt `AGENTS.md`.

`AGENTS.md` ist der verbindliche Kurzvertrag für alle Aufgaben. Dieses Dokument erklärt typische Arbeitsweisen, Entscheidungsmuster, Prüffragen und Beispiele für Änderungen an diesem Roll20-Character-Sheet.

Wenn `AGENTS.md` und dieses Dokument voneinander abweichen, gilt `AGENTS.md`.

---

## Ziel dieses Dokuments

Dieses Projekt ist ein deutsches Shadowrun-6-Character-Sheet für Roll20. Dadurch gelten andere Prioritäten als bei einer normalen Web-App:

1. Roll20-Kompatibilität
2. stabile Charakterdaten
3. nachvollziehbare SR6-Mechanik
4. kleine, überprüfbare Änderungen
5. erst danach Code-Ästhetik oder moderne Webarchitektur

Diese Guidelines sollen helfen, Änderungen sicher einzuordnen und typische Agentenfehler zu vermeiden.

---

## Empfohlener Arbeitsablauf

### 1. Auftrag einordnen

Vor Änderungen klären:

```text
Was soll wirklich geändert werden?
Ist es Bugfix, Feature, UI, Styling, Roll-Logik, Compute, i18n oder Tooling?
Welche SR6-Domäne ist betroffen?
Sind persistente Roll20-Felder betroffen?
Muss output/ neu generiert werden?
Welche Tests oder Builds sind nötig?
```

### 2. Bestehende Patterns suchen

Vor neuen Strukturen immer vorhandene Muster prüfen:

```text
src/html/
src/css/
src/workers/
src/i18n/
docs/architecture.md
docs/path-map.md
```

Nicht neue Patterns einführen, wenn ein bestehendes Projektmuster ausreicht.

### 3. Minimalen Patch planen

Eine gute Änderung ist klein, lokal nachvollziehbar und ändert nur den benötigten Bereich.

Vermeiden:

```text
- nebenbei Dateien formatieren
- alte TODOs aufräumen
- output/ direkt editieren
- Feldnamen schöner machen
- große Dateien neu organisieren
- Buildsystem modernisieren
```

### 4. Source ändern

Grundregel:

```text
src/ ändern
output/ generieren
```

Nicht:

```text
output/ manuell ändern
```

### 5. Build und Prüfung

Nach Source-Änderungen:

```bash
npm run build
```

Bei Include-Änderungen:

```bash
npm run lint:includes
```

Bei CSS-Modul-Änderungen:

```bash
npm run lint:css-modules
```

Wenn ein Test nicht ausgeführt wurde, muss das klar gesagt werden.

---

## Entscheidungshilfe: Welche Dateien sind betroffen?

### UI oder Struktur

Typisch betroffen:

```text
src/html/charactersheet.html
src/html/components/**
src/html/partials/**
src/i18n/**
src/css/**
```

Prüfen:

```text
Braucht der sichtbare Text i18n?
Gibt es neue Inputs?
Sind die Inputs gespeichert oder temporär?
Gibt es passende Worker?
Sind Tabs oder Sections betroffen?
Sind RollTemplates betroffen?
```

### Styling

Typisch betroffen:

```text
src/css/modules/**
src/css/themes/**
src/css/modules/manifest.json
```

Prüfen:

```text
Ist das CSS-Modul registriert?
Sind Selektoren zu global?
Sind RollTemplates betroffen?
Wird Roll20-eigenes Styling unbeabsichtigt überschrieben?
Ist die Änderung auf den gewünschten Bereich begrenzt?
```

### Compute-Logik

Typisch betroffen:

```text
src/workers/compute/**
src/workers/core/register.js
src/workers/core/**
```

Prüfen:

```text
Welche Eingaben?
Welche Ausgaben?
Welche Trigger?
Gibt es manuelle Overrides?
Gibt es Recompute-Schleifen?
Wird ein Wert unnötig oft geschrieben?
Kann der Recompute gezielter sein?
```

### Roll-Logik

Typisch betroffen:

```text
src/workers/rolls/**
src/html/** Roll-Buttons oder RollTemplates
src/i18n/**
```

Prüfen:

```text
Welche Attribute bilden den Pool?
Welche Modifikatoren greifen?
Ist Edge beteiligt?
Ist die Chat-Ausgabe konsistent?
Sind Template-Felder optional oder Pflicht?
Werden Charakterwerte dauerhaft geändert?
```

### i18n

Typisch betroffen:

```text
src/i18n/**
output/translation.json
```

Prüfen:

```text
Gibt es bereits einen passenden Key?
Ist der neue Key semantisch benannt?
Sind alle unterstützten Sprachen ergänzt?
Sind UI- und RollTemplate-Texte konsistent?
```

---

## Roll20-Feldnamen

Roll20-Feldnamen sind nicht nur technische Bezeichner, sondern Persistenzschema.

Kritische Präfixe:

```text
attr_       persistente Charakterwerte
act_        Action Buttons
roll_       Roll Buttons
repeating_  wiederholbare Sektionen
```

### Gute Änderung

```text
Neues Feld ergänzen:
attr_matrix_noise_modifier
```

mit:

```text
- Defaultwert
- Worker-Initialisierung falls nötig
- i18n-Label
- Dokumentation der Domäne
```

### Riskante Änderung

```text
attr_body -> attr_body_total
```

Problem:

```text
Bestehende Charaktere verlieren effektiv ihre gespeicherten Werte,
wenn kein Migrations-/Fallbackpfad existiert.
```

### Sichere Migration

Wenn ein Feld ersetzt werden muss:

```text
1. altes Feld weiter lesen
2. neues Feld schreiben
3. Fallback bei leerem neuen Feld
4. betroffene Worker und Rolls aktualisieren
5. alte Felder nicht sofort entfernen
```

---

## Repeating Sections

Repeating Sections müssen besonders vorsichtig behandelt werden.

Typische Risiken:

```text
- feste Anzahl von Zeilen voraussetzen
- Row-IDs hart codieren
- alte oder unvollständige Rows nicht behandeln
- viele Rows mit teuren Recompute-Kaskaden verarbeiten
- manuelle Werte pro Row überschreiben
```

Gute Worker-Logik für repeating sections:

```text
- mit null Rows umgehen
- mit teilweise ausgefüllten Rows umgehen
- nur betroffene Rows neu berechnen, wenn möglich
- Defaults defensiv setzen
- manuelle Overrides respektieren
```

---

## Recompute-Logik

Recompute-Logik soll gezielt und idempotent sein.

Vor neuer Recompute-Logik dokumentieren:

```text
Eingaben:
Ausgaben:
Trigger:
Domäne:
Mögliche Seiteneffekte:
```

Vermeiden:

```text
- globale recomputeAll-Aufrufe für kleine Änderungen
- setAttrs-Schleifen
- Schreiben unveränderter Werte, wenn vermeidbar
- Compute-Logik, die Chat-Rolls auslöst
- Compute-Logik, die UI-Zustände verändert
```

Besser:

```text
- spezifische Listener
- klare Abhängigkeitsrichtung
- kleine Compute-Funktionen
- defensive Defaults
- manuelle Overrides prüfen
```

---

## Roll-Logik

Roll-Logik soll Pools und Modifikatoren transparent machen.

Vor Änderungen an Rolls prüfen:

```text
Welcher Pool wird gebildet?
Welche Attribute und Fertigkeiten sind beteiligt?
Welche situativen Modifikatoren greifen?
Gibt es Edge-Optionen?
Gibt es Zustandsmodifikatoren?
Welche RollTemplate-Felder werden gesetzt?
Ist die Chat-Ausgabe nachvollziehbar?
```

Roll-Handler sollten:

```text
- Charakterwerte lesen
- temporäre Rollparameter berechnen
- RollTemplate-Daten erzeugen
- keine dauerhaften Charakterdaten ändern, außer ausdrücklich vorgesehen
```

Roll-Handler sollten nicht:

```text
- Persistenzfelder verdeckt überschreiben
- UI-Zustände ändern
- Compute-Logik duplizieren
- HTML-Button-Namen als Logikquelle missbrauchen
```

---

## UI vs. Spielmechanik

UI-Zustand und Spielmechanik müssen getrennt bleiben.

UI-Zustand:

```text
- aktiver Tab
- ein-/ausgeklappte Bereiche
- Anzeigeoptionen
- Hilfetext sichtbar/versteckt
```

Spielmechanik:

```text
- Würfelpool
- Schaden
- Zustandsmonitor
- Edge
- Matrixwerte
- Magiewerte
- Fahrzeugwerte
```

Nicht tun:

```text
Ein UI-Toggle überschreibt dauerhaft einen mechanischen Wert,
nur weil ein Bereich geöffnet oder geschlossen wird.
```

---

## i18n-Konventionen

Neue sichtbare Texte gehören in `src/i18n/**`.

Gute Keys:

```text
skills.firearms
combat.defense_pool
matrix.noise_modifier
rigging.vehicle_handling
```

Schlechte Keys:

```text
label1
new_text_2
left_panel_title
button_top_blue
```

Grundsatz:

```text
Key nach Bedeutung benennen, nicht nach Position oder Farbe.
```

Bei neuen Texten prüfen:

```text
- existiert bereits ein semantisch passender Key?
- muss der Text auch in RollTemplates erscheinen?
- sind alle unterstützten Sprachdateien aktualisiert?
```

---

## CSS-Guidelines

CSS-Änderungen sollen lokal bleiben.

Gute CSS-Änderungen:

```text
- Modulbezogen
- klarer Klassenpräfix
- keine unnötig globalen Selektoren
- keine Roll20-Controls ungezielt überschreiben
- CSS-Modul im Manifest registriert
```

Riskante CSS-Änderungen:

```text
input { ... }
button { ... }
.sheet-container * { ... }
```

Solche Selektoren können große Teile des Sheets oder Roll20-UI unerwartet beeinflussen.

---

## HTML-Guidelines

Bei HTML-Änderungen prüfen:

```text
Ist das Element in der richtigen Domäne?
Braucht es i18n?
Ist es gespeichert, berechnet oder temporär?
Benötigt es Worker-Logik?
Benötigt es CSS?
Ist es in Roll20 gültiges Markup?
```

Keine modernen Web-App-Annahmen:

```text
- keine Web Components
- keine Client-Router
- keine Framework-Templates
- keine DOM-initialisierten Widgets
```

Roll20-kompatibles, statisches Markup bevorzugen.

---

## Build-/Output-Disziplin

`output/` ist generiert. Wenn `output/` verändert wird, muss der Build gelaufen sein.

Gute Antwort:

```text
Ausgeführt:
- npm run build

Hinweis:
- output/charactersheet.html wurde durch den Build aktualisiert.
```

Schlechte Antwort:

```text
Ich habe output/charactersheet.html direkt angepasst.
```

---

## Umgang mit Fehlern

Bei einem Bugfix:

```text
1. Fehler reproduzieren oder aus Code ableiten
2. betroffene Domäne bestimmen
3. Ursache isolieren
4. kleinsten sicheren Fix machen
5. ähnliche Fälle prüfen
6. Build ausführen
7. Roll20-Sandbox-Risiko nennen
```

Bugfixes sollen nicht mit kosmetischen Refactorings vermischt werden.

---

## Umgang mit Features

Bei einem Feature:

```text
1. Domäne bestimmen
2. Persistenzbedarf klären
3. UI ergänzen
4. i18n ergänzen
5. Compute/Roll-Logik ergänzen
6. Build ausführen
7. Roll20-Prüfschritte nennen
```

Neue Features sollen bestehende Patterns verwenden.

---

## Umgang mit Refactorings

Refactorings nur bei explizitem Auftrag.

Vorher klären:

```text
Was bleibt funktional gleich?
Welche Feldnamen bleiben stabil?
Welche Worker-Events bleiben stabil?
Welche Tests zeigen, dass Verhalten gleich bleibt?
```

Nicht als Refactoring behandeln:

```text
- Feldumbenennungen
- Datenmodelländerungen
- Roll-Logikänderungen
- UI-Neudesign
- Toolchain-Wechsel
```

Das sind eigenständige Architektur- oder Feature-Aufgaben.

---

## Beispiele für gute Agentenantworten

### Code-Änderung

```md
## Plan

- Kampf-UI um ein Feld für situativen Verteidigungsmodifikator erweitern.
- Feld persistent als neues `attr_*` ergänzen.
- Verteidigungsroll um den Modifikator erweitern.

## Änderungen

- Neues Eingabefeld im Kampfbereich ergänzt.
- i18n-Key ergänzt.
- Roll-Pool liest neuen Modifikator defensiv mit Default 0.

## Betroffene Dateien

- `src/html/...`
- `src/i18n/...`
- `src/workers/rolls/...`

## Test

Ausgeführt:
- `npm run build`

Nicht ausgeführt:
- Roll20-Sandbox-Test — kein Zugriff auf Testkampagne.

## Hinweise / Risiken

- Bestehende Charaktere erhalten Default 0.
- Kein bestehender Feldname wurde geändert.
```

### Analyse ohne Codeänderung

```md
## Befund

Die aktuelle Roll-Logik mischt Poolberechnung und Chat-Ausgabe stark.

## Risiken

Dadurch sind einzelne SR6-Mechaniken schwer isoliert testbar.

## Empfehlung

Poolberechnung als reine Hilfsfunktion extrahieren, RollTemplate-Ausgabe aber unverändert lassen.

## Nächste Schritte

Zuerst nur eine Domäne extrahieren, z. B. Kampfproben.
```

---

## Kurzcheckliste

Vor jeder finalen Antwort:

```text
[ ] Aufgabe richtig eingeordnet?
[ ] Nur relevante Dateien geändert?
[ ] Source statt Output editiert?
[ ] Keine Feldnamen unbeabsichtigt geändert?
[ ] i18n berücksichtigt?
[ ] Build ausgeführt oder Nichtausführung genannt?
[ ] Roll20-Auswirkungen beschrieben?
[ ] Risiken genannt?
```
