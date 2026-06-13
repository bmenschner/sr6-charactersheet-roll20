# AGENTS.override.md — src/html

## Zweck

Diese Datei gilt für Änderungen unter `src/html/**`.

Hier liegen Sheet-Struktur, Tabs, Sections, Inputs, Buttons, RollTemplates und HTML-Partials.

Roll20-kompatibles Markup und stabile Feldnamen haben Vorrang vor moderner Web-App-Struktur.

---

## Grundregeln

- Bestehende Include-Struktur respektieren.
- Keine großen HTML-Blöcke unnötig duplizieren.
- Keine bestehenden `attr_*`, `act_*`, `roll_*` oder `repeating_*`-Namen ohne ausdrückliche Freigabe ändern.
- Neue sichtbare Texte über `src/i18n/**` abbilden.
- Neue Inputs eindeutig als gespeichert, berechnet oder temporär einordnen.
- Neue Buttons mit passenden `act_*`- oder `roll_*`-Namen versehen.
- Keine Framework-, Web-Component- oder SPA-Annahmen einführen.
- Roll20-kompatibles statisches HTML bevorzugen.

---

## Neue Inputs

Vor dem Ergänzen eines Inputs klären:

```text
Ist der Wert persistent?
Ist der Wert berechnet?
Ist der Wert nur temporär für einen Roll?
Gibt es einen Default?
Gibt es Worker-Logik?
Gibt es bestehende Charakterdaten, die betroffen sind?

Persistente Felder verwenden attr_*.

Nicht persistente UI-Hilfszustände müssen klar als solche erkennbar sein.

Buttons

Bei neuen Buttons klären:

Ist es ein Action Button?
Ist es ein Roll Button?
Welche Worker-Logik reagiert darauf?
Welche RollTemplate-Ausgabe entsteht?

Regeln:

Action Buttons mit act_*.
Roll Buttons mit roll_*.
Keine Logik nur im Buttonnamen verstecken.
Passende Worker-Registrierung prüfen.
Repeating Sections

Bei repeating_*-Änderungen besonders vorsichtig sein.

Regeln:

Namen bestehender repeating sections nicht ändern.
Feldnamen innerhalb bestehender repeating sections nicht ohne Migrationspfad ändern.
Keine feste Anzahl von Rows voraussetzen.
UI muss mit leeren und teilweise ausgefüllten Rows funktionieren.
Manuelle Werte pro Row nicht unbeabsichtigt durch berechnete Werte ersetzen.
RollTemplates

RollTemplate-Änderungen immer gegen Roll-Logik prüfen.

Vor Änderungen klären:

Welche Rolls verwenden das Template?
Welche Felder sind Pflicht?
Welche Felder sind optional?
Wie sieht die Ausgabe bei Minimalwerten aus?
Wie sieht die Ausgabe bei Edge-, Glitch- oder Sonderfällen aus?

Keine bestehenden Template-Feldnamen ohne Prüfung ändern.

i18n

Neue sichtbare Texte brauchen Translation-Keys.

Nicht hardcoden:

<label>Angriff</label>

Besser:

<label data-i18n="combat.attack"></label>

Nur technische Werte oder bewusst nicht lokalisierte interne Marker dürfen ohne i18n bleiben.

Prüfung

Bei Änderungen unter src/html/** mindestens prüfen:

npm run lint:includes
npm run build

Wenn nicht ausgeführt, in der Antwort begründen.

Zusätzlich Roll20-Sandbox-Prüfung nennen, falls HTML, Inputs, Buttons, Tabs oder Templates betroffen sind.