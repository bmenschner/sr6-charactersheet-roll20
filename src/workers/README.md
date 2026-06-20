# Worker Structure

Die Worker sind jetzt entlang der Zielarchitektur aufgeteilt:

- `src/workers/core/`
  - `constants.js`
  - `helpers.js`
  - `guards.js`
  - `register.js` (Event-Registrierung + Recompute-Orchestrierung)
- `src/workers/rolls/`
  - `definition-resolver.js` (Roll-Definitionsauswahl, Titellogik, Feldreihenfolge und Popup-State-Helfer)
  - `context.js` (Template/Attribut-Kontext aufbauen)
  - `display.js` (Probe-Zeilen, Titel, Chat-Template)
  - `compute.js` (Pool-, Erfolg- und Patzer-Berechnung)
  - `probe.js` (eigentliche Probe aus Kontext ausführen)
  - `popup.js` (eigenes Popup + Roll20-Fallback)
  - `edge.js` (Edge-Token-Rolls)
  - `index.js` (Roll-Event-Registrierung)
- `src/workers/compute/`
  - `attributes.js`
  - `skills.js`
  - `header-monitor.js`
  - `combat.js`
  - `magic.js`
  - `matrix.js`
  - `rigging.js`
- `src/workers/ui/`
  - `monitor-cascade.js`
  - `defaults.js`

Eingebunden wird alles über:
- `src/html/partials/workers/sheet-worker.html`

Include-Reihenfolge ist wichtig:
1. core (constants/helpers/guards)
2. rolls (definitions/*, definition-resolver, context/display/compute/probe/popup/edge/index)
3. compute (attributes/skills/header-monitor/combat/magic/matrix/rigging)
4. ui (defaults/monitor-cascade)
5. core/register

## Roll-only-Modifikatoren

Berechnete, wuerfelbare Sheet-Werte koennen einen persistenten Komfort-Modifikator fuer den Wurf fuehren:

- Feldmuster: `attr_<poolAttribute>_roll_modifikator`
- Beispiel: `attr_sr6_combat_fernkampfangriff_gesamtwert_roll_modifikator`
- Beispiel Matrix-Handlung: `attr_sr6_matrix_handlung_ausstoepseln_probe_wert_roll_modifikator`

Die Roll-Pipeline behandelt diese Felder bewusst erst im Rollpfad:

1. `rolls/context.js` laedt den berechneten Pool und den optionalen Roll-only-Modifikator.
2. `rolls/probe.js` addiert den Roll-only-Modifikator auf den Wurfpool.
3. `rolls/compute.js` berechnet Pool, Erfolge und Patzer aus dem modifizierten Rollpool.
4. `rolls/display.js` gibt die Template-Werte aus und zeigt `Wert-Modifikator` nur bei einem Wert ungleich `0`.

Reihenfolge der wirksamen Modifikatoren im Wurf:

1. berechneter Sheet-Pool
2. `*_roll_modifikator`
3. Popup-/Monitor-/Edge-Modifikatoren aus der jeweiligen Probe

Der `*_roll_modifikator` darf nicht in `compute/*` zurueckschreiben und veraendert den angezeigten berechneten Sheet-Wert nicht.
