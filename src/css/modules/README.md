# CSS Modules

Die finale `output/charactersheet.css` wird aus diesen Modulen in der Reihenfolge aus `manifest.json` gebaut.

Konvention:
- niedrige Prefixnummer = frueher laden
- spaetere Module duerfen fruehere Regeln gezielt ueberschreiben

## Shared Patterns

Stepper und Roll-Modifikator-Controls sind gemeinsame UI-Muster:

- `.sr6-number-stepper` mit `--minus`/`--plus` Buttons fuer persistente Zahlenfelder.
- `.sr6-charactersheet-field-input-with-dice--roll-mod` fuer berechnete Werte mit Rollbutton und `*_roll_modifikator`.
- `.sr6-roll-mod-stepper` fuer den kompakten Modifikator neben einem berechneten Basiswert.
- `.sr6-roll-mod-subtitle` fuer die kleinen Spaltenhinweise `Basis` und `Mod.`.

Layoutfixes fuer diese Patterns gehoeren in die CSS-Module, nicht direkt in `output/charactersheet.css`.
`output/charactersheet.css` bleibt reiner Build-Output.
