## `src/workers/AGENTS.override.md`

```md
# AGENTS.override.md — src/workers

## Zweck

Diese Datei gilt für Änderungen unter `src/workers/**`.

Hier liegen Sheet Worker, Core-Registrierung, Compute-Logik, Roll-Logik und UI-Logik.

Sheet Worker laufen in der Roll20-Umgebung, nicht in einer normalen Browser-App.

---

## Grundregeln

- Keine DOM-/Browser-APIs voraussetzen.
- Keine modernen ES-Module, Imports oder Bundler-Annahmen einführen.
- Bestehende Namespaces und Include-Reihenfolge respektieren.
- Keine Framework-Abhängigkeiten einführen.
- Keine versteckten Seiteneffekte.
- Compute-, Roll- und UI-Logik nicht unnötig vermischen.
- Bestehende Utilities wiederverwenden.
- Funktionen klein und domänennah halten.

---

## Core / Registrierung

Bei Änderungen an Event-Registrierung oder Core-Logik:

```text
Welche Attribute triggern den Handler?
Welche Werte werden geschrieben?
Kann setAttrs eine weitere Änderung auslösen?
Ist der Listener spezifisch genug?
Gibt es bestehende Initialisierungspfade?

Regeln:

Listener so spezifisch wie möglich.
Keine globalen Recompute-Kaskaden ohne klaren Grund erweitern.
Endlosschleifen durch setAttrs vermeiden.
Keine Werte schreiben, wenn sich der Zielwert nicht geändert hat, sofern sinnvoll.
Bestehende Initialisierung nicht brechen.
Compute-Logik

Compute-Funktionen sollen:

Eingaben lesen
abgeleitete Werte berechnen
Zielwerte schreiben

Compute-Funktionen sollen nicht:

Chat-Ausgaben erzeugen
Roll-Buttons auslösen
UI-Tabs umschalten
persistente manuelle Werte überschreiben

Vor neuer Compute-Logik dokumentieren:

Eingaben:
Ausgaben:
Trigger:
Domäne:
Manuelle Overrides:

Manuelle Overrides immer respektieren, wenn sie existieren.

Roll-Logik

Roll-Handler sollen:

Charakterwerte lesen
temporäre Modifikatoren berechnen
RollTemplate-Daten erzeugen
Chat-Ausgabe konsistent halten

Roll-Handler sollen nicht:

dauerhafte Charakterdaten ändern, außer ausdrücklich vorgesehen
UI-Zustände verändern
Compute-Logik duplizieren
HTML-Struktur als Logikquelle missbrauchen

Bei neuen oder geänderten Rolls prüfen:

Welche Attribute bilden den Pool?
Welche Fertigkeiten sind beteiligt?
Welche Modifikatoren greifen?
Ist Edge beteiligt?
Sind Zustandsmodifikatoren beteiligt?
Welche RollTemplate-Felder werden gesetzt?
UI-Worker

UI-Worker dürfen Anzeigezustände, Tabs, Toggles und Hilfszustände steuern.

Regeln:

Keine dauerhafte Spielmechanik in UI-Worker auslagern.
UI-Zustände von Charakterwerten trennen.
Öffnen oder Schließen eines Bereichs darf keine mechanischen Werte ändern, außer ausdrücklich vorgesehen.
Keine Roll- oder Compute-Logik in reine UI-Toggles einbauen.
Repeating Sections

Bei Workern für repeating_*:

mit null Rows umgehen
mit vielen Rows umgehen
mit alten Rows umgehen
mit unvollständigen Rows umgehen
Row-IDs nicht hart codieren
manuelle Overrides pro Row respektieren

Keine feste Anzahl von repeating rows voraussetzen.

Prüfung

Bei Änderungen unter src/workers/** mindestens prüfen:

npm run build

Wenn möglich zusätzlich Roll20-Sandbox-Test:

- betroffene Eingabefelder ändern
- abgeleitete Werte beobachten
- betroffene Roll-Buttons ausführen
- Chat-Ausgabe prüfen
- bestehende Charakterdaten prüfen

Wenn nicht ausgeführt, in der Antwort begründen.