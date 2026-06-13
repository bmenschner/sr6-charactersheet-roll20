## `src/i18n/AGENTS.override.md`

```md
# AGENTS.override.md — src/i18n

## Zweck

Diese Datei gilt für Änderungen unter `src/i18n/**`.

Hier liegen Übersetzungen und Texte, die in UI oder RollTemplates verwendet werden.

Sichtbare Texte sollen nicht direkt in HTML oder Workern hardcodiert werden.

---

## Grundregeln

- Neue sichtbare UI-Texte brauchen Translation-Keys.
- Bestehende Keys wiederverwenden, wenn sie semantisch passen.
- Keys semantisch benennen, nicht nach Layoutposition.
- Keine Keys löschen, ohne alle Referenzen zu prüfen.
- RollTemplate-Texte und UI-Texte konsistent halten.
- Alle unterstützten Sprachen ergänzen oder fehlende Übersetzung klar markieren.
- Keine zufälligen neuen Key-Konventionen einführen.

---

## Key-Namen

Gute Keys:

```text
combat.attack
combat.defense_pool
skills.firearms
matrix.noise_modifier
rigging.vehicle_handling
equipment.armor_rating

Schlechte Keys:

label1
new_text_2
left_panel_button
blue_header
section_3_title

Grundsatz:

Key nach Bedeutung benennen, nicht nach Position, Farbe oder aktuellem Layout.
Neue Texte

Vor einem neuen Key prüfen:

Gibt es bereits einen passenden Key?
Ist der Text UI, RollTemplate oder Hilfetext?
Ist die Bedeutung domänenspezifisch?
Muss der Text in mehreren Bereichen wiederverwendet werden?

Keinen neuen Key anlegen, wenn ein vorhandener semantisch korrekt passt.

Entfernen oder Umbenennen von Keys

Nicht ohne Referenzprüfung:

- Keys löschen
- Keys umbenennen
- Bedeutung vorhandener Keys ändern

Vorher prüfen:

src/html/**
src/workers/**
RollTemplates
output/ nach Build

Bei Umbenennung möglichst alten Key vorerst erhalten, wenn bestehende Referenzen unsicher sind.

RollTemplates

RollTemplate-Texte besonders vorsichtig ändern.

Prüfen:

Welche Rolls verwenden den Text?
Ist der Text mechanisch relevant?
Gibt es kurze und lange Ausgabevarianten?
Muss der Text auch in UI-Labels erscheinen?

RollTemplate-Texte sollen knapp, eindeutig und konsistent sein.

Prüfung

Bei Änderungen unter src/i18n/** mindestens prüfen:

npm run build

Nach dem Build prüfen:

output/translation.json wurde generiert
neue Keys sind enthalten
keine offensichtlichen Platzhalter fehlen

Wenn nicht ausgeführt, in der Antwort begründen.