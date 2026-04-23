# Worker Structure

Die Worker sind jetzt entlang der Zielarchitektur aufgeteilt:

- `src/workers/core/`
  - `constants.js`
  - `helpers.js`
  - `guards.js`
  - `register.js` (Event-Registrierung + Recompute-Orchestrierung)
- `src/workers/rolls/`
  - `definitions.js` (zentrale Rolltypen, Titellogik, Feldreihenfolge, Popup-Felder inkl. Zahlen/Dropdowns)
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
2. rolls (definitions/context/display/compute/probe/popup/edge/index)
3. compute (attributes/skills/header-monitor/combat/magic/matrix/rigging)
4. ui (defaults/monitor-cascade)
5. core/register
