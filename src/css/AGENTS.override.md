## `src/css/AGENTS.override.md`

```md
# AGENTS.override.md — src/css

## Zweck

Diese Datei gilt für Änderungen unter `src/css/**`.

Hier liegen Styling, CSS-Module, Themes und RollTemplate-bezogenes Styling.

CSS muss im Roll20-Sheet-Kontext stabil bleiben.

---

## Grundregeln

- Bestehende CSS-Modulstruktur verwenden.
- Neue CSS-Module im Manifest eintragen, falls erforderlich.
- Keine unnötig globalen Selektoren.
- Roll20-eigene Klassen nicht ungezielt überschreiben.
- Keine Inline-Styles im HTML, außer es gibt einen zwingenden Roll20-Grund.
- Änderungen lokal auf den betroffenen Bereich begrenzen.
- Keine komplette visuelle Neuordnung ohne ausdrücklichen Auftrag.

---

## Selektoren

Riskant:

```css
input { ... }
button { ... }
select { ... }
.sheet-container * { ... }

Besser:

.sheet-combat-panel .sheet-defense-modifier { ... }
.sheet-matrix-section .sheet-noise-control { ... }

Selektoren sollen domänennah und begrenzt sein.

CSS-Module

Bei neuen CSS-Dateien prüfen:

Ist das Modul im Manifest registriert?
Ist die Reihenfolge relevant?
Gibt es Abhängigkeiten zu Tokens, Base-Styles oder Themes?
Sind RollTemplates betroffen?

Keine neue CSS-Datei anlegen, wenn ein bestehendes Modul semantisch passt.

Themes

Bei Theme-Änderungen prüfen:

Welche Variablen werden geändert?
Welche Tabs sind betroffen?
Sind Kontraste weiterhin ausreichend?
Sind RollTemplates betroffen?
Gibt es Seiteneffekte auf Inputs oder Buttons?

Theme-Änderungen nicht mit Layout-Refactorings vermischen.

RollTemplates

Wenn RollTemplate-CSS betroffen ist:

Welche Template-Varianten gibt es?
Wie sieht die Ausgabe mit wenigen Feldern aus?
Wie sieht die Ausgabe mit vielen Feldern aus?
Wie werden Edge-, Glitch- oder Sonderausgaben dargestellt?

RollTemplate-CSS nicht isoliert ändern, wenn dazugehörige HTML-/Worker-Felder ebenfalls angepasst werden müssen.

Prüfung

Bei Änderungen unter src/css/** mindestens prüfen:

npm run lint:css-modules
npm run build

Wenn nicht ausgeführt, in der Antwort begründen.

Bei sichtbaren Änderungen Roll20-Sandbox-Prüfung nennen.