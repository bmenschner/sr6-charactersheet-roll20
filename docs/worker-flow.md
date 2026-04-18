# Worker Recompute Flow

## Module
- `core/constants.js`: Feldlisten (Attribute, Fertigkeiten, Matrix-Handlungen)
- `core/helpers.js`: Parsing/Mapping-Helfer
- `core/guards.js`: sichere `setAttrs`-Hilfen
- `core/register.js`: Event-Registrierung + Recompute-Orchestrierung
- `compute/attributes.js`: Attribut-Gesamtwerte
- `compute/skills.js`: Fertigkeits-Gesamtwerte
- `compute/combat.js`: abgeleitete Kern-/Kampfwerte
- `compute/magic.js`: Magie-spezifische Ableitungen
- `compute/matrix.js`: Matrix-Handlungs-Gesamtwerte
- `compute/rigging.js`: Rigging-Compute-Slot (aktuell no-op)
- `ui/defaults.js`: Open-State Defaults (Tab/Edit-Modi)
- `ui/legacy.js`: Legacy-Normalisierung

## Ablauf bei Aenderung
1. Roll20 `change:*` Event feuert
2. `register.js` ruft `recomputeAll()` auf
3. `recomputeAll()` sammelt benoetigte Keys via `getAttrs`
4. Compute-Module schreiben in ein gemeinsames `updates`-Objekt
5. `setAttrsSilent(...)` schreibt Updates zurueck

## Ablauf bei `sheet:opened`
1. Tab auf `allgemein`
2. Edit-Modi auf Listenansicht
3. Legacy-Checkbox-Wert normalisieren
4. Komplett-Recompute

## Regel
- Neue berechnete Felder in das passende `compute/<domain>.js` legen.
- `recomputeAll` bleibt Orchestrator (Single Source of Compute Flow).
