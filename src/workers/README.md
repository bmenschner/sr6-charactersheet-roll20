# Worker Structure

Die Worker sind jetzt entlang der Zielarchitektur aufgeteilt:

- `src/workers/core/`
  - `constants.js`
  - `helpers.js`
  - `guards.js`
  - `register.js` (Event-Registrierung + Recompute-Orchestrierung)
- `src/workers/compute/`
  - `attributes.js`
  - `skills.js`
  - `combat.js`
  - `magic.js`
  - `matrix.js`
  - `rigging.js`
- `src/workers/ui/`
  - `defaults.js`
  - `legacy.js`

Eingebunden wird alles über:
- `src/html/partials/workers/sheet-worker.html`

Include-Reihenfolge ist wichtig:
1. core (constants/helpers/guards)
2. compute (attributes/skills/combat/magic/matrix/rigging)
3. ui (defaults/legacy)
4. core/register
