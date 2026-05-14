# Combat Attack Pool Refactor

GitHub-Issue: https://github.com/bmenschner/sr6-charactersheet-roll20/issues/22

## Anlass

Im Bugfix fuer Waffen-Rollbuttons wurde sichtbar, dass die Kampfberechnung aktuell zwei technische Anforderungen vermischt:

- Kernwerte berechnen sichtbare Werte wie `Fernkampfangriff`, `Projektilwaffen` und `Nahkampfangriff`.
- Waffen-Repeater brauchen fuer Roll20-Action-Buttons pro Zeile einen konkreten, bereits aufgeloesten Poolwert.

Der kurzfristige Fix nutzt deshalb versteckte Repeater-Felder fuer den finalen Waffenpool. Das ist funktional, aber noch nicht die endgueltige Zielarchitektur.

## Ziel

Die Kampf-Angriffspools sollen in einer zentralen Resolver-Logik berechnet werden, die sowohl Kernwerte als auch Waffen-Repeater verwendet.

Dabei sollen folgende Regeln erhalten bleiben:

- Fernkampfangriff basiert auf `Geschicklichkeit + Fertigkeit + Modifikator`.
- Projektilwaffen nutzen den Kernwert `Projektilwaffen`.
- Exotische Waffen nutzen `Geschicklichkeit + Exotische Waffen`.
- Nahkampfangriff basiert auf dem gewaehlten Attribut plus Fertigkeit plus Modifikator.
- Reichweitenwerte sind Angriffswerte fuer das Rolltemplate, aber keine Wuerfelpools.

## Nicht-Ziele

- Keine Umbenennung bestehender Roll20-Attribute.
- Keine Aenderung der `repeating_` Section-Namen.
- Kein neues Popup-System.
- Kein Rewrite der Kampfseite.

## Vorgeschlagener Ansatz

1. Eine kleine zentrale Kampf-Pool-Resolver-Struktur definieren.
2. Kernwerte und Repeater-Waffen auf denselben Resolver umstellen.
3. Die versteckten Repeater-Poolfelder nur als Roll20-Bruecke behalten.
4. Alte Sonderlogik entfernen, sobald alle Kampf-Angriffe ueber den Resolver laufen.
5. Roll20-Sandbox-Test fuer Primaerwaffen, Repeater-Waffen, Projektilwaffen und Exotische Waffen durchfuehren.

## Risiken

- Roll20-Action-Buttons koennen zur Laufzeit keine komplexe bedingte Logik pro Repeater-Zeile aufloesen.
- Versteckte Poolfelder muessen deshalb sehr wahrscheinlich erhalten bleiben.
- Aenderungen an Kampf-Poolberechnung koennen Popup, Rolltemplate und Kernwerte gleichzeitig betreffen.

## Pruefkriterien

- `npm run build` ist erfolgreich.
- `output/sheet_workers.js` ist syntaktisch gueltig.
- Fernkampfwaffen wuerfeln mit dem richtigen Pool und zeigen Reichweite nur als Angriffswert.
- Nahkampfwaffen wuerfeln mit dem richtigen Pool und zeigen Reichweite nur als Angriffswert.
- Projektilwaffen verwenden den Kernwert `Projektilwaffen`.
- Exotische Waffen verwenden `Geschicklichkeit + Exotische Waffen`.
- Primaerwaffen und einzelne Repeater-Zeilen liefern konsistente Ergebnisse.
