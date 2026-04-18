# Worker Recompute Flow

## Module
- `00-constants.js`: Feldlisten (Attribute, Fertigkeiten, Matrix-Handlungen)
- `10-helpers.js`: Parsing/Mapping-Helfer
- `20-recompute.js`: zentrale Ableitungen und Gesamtwerte
- `30-ui-state.js`: Open-State/Legacy-Normalisierung
- `40-events.js`: Event-Registrierung

## Ablauf bei Aenderung
1. Roll20 `change:*` Event feuert
2. `recomputeAll()` sammelt benoetigte Keys via `getAttrs`
3. Gesamtsummen und abgeleitete Werte werden berechnet
4. `setAttrs(..., { silent: true })` schreibt Updates zurueck

## Ablauf bei `sheet:opened`
1. Tab auf `allgemein`
2. Edit-Modi auf Listenansicht
3. Legacy-Checkbox-Wert normalisieren
4. Komplett-Recompute

## Regel
- Neue berechnete Felder immer in `recomputeAll` zentral halten (Single Source of Compute Truth)
