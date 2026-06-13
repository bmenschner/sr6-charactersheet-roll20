# Popup-Logik Audit und Cleanup

## Ziel

Die Wuerfel-Popup-Logik soll spaeter gezielt auf Funktionsweise, Redundanzen und alte Workarounds geprueft werden.

Aktueller Stand: Das Popup funktioniert wieder stabiler, benutzt aber historisch gewachsene Slot-Zustaende und mehrere Sichtbarkeitsmechanismen. Ein sofortiger Umbau waere zu gross fuer einen kleinen Bugfix-Block.

## Warum spaeter separat?

- Das Popup ist zentral fuer Attribute, Fertigkeiten, Kampf, Zauber und weitere Proben.
- Kleine CSS- oder Worker-Aenderungen koennen Roll20-spezifische Nebenwirkungen haben.
- Alte Fixes fuer Slot-Sichtbarkeit, Select-Optionen und Reset-Verhalten muessen erst verstanden werden, bevor sie entfernt werden.
- Ziel ist kein Rewrite, sondern ein vorsichtiger Audit mit anschliessendem kleinen Cleanup.

## Zu pruefende Dateien

- `src/html/partials/runtime/roll-popup-global.html`
- `src/css/modules/50-overlays-and-roll20-tabs.css`
- `src/workers/rolls/definition-resolver.js`
- `src/workers/rolls/popup.js`
- `src/workers/rolls/probe.js`

## Pruefpunkte

### Markup

- Welche Hidden-Controls existieren pro Popup-Slot?
- Welche Slot-Zustaende sind weiterhin notwendig?
- Sind `active`, `visible`, `is_number`, `is_text`, `is_select` und `is_checkbox` alle noch fachlich notwendig?
- Gibt es doppelte oder veraltete Zustandsfelder?

### CSS

- Welche Regeln steuern die Sichtbarkeit der Popup-Felder?
- Gibt es alte Einzelfall-Hacks fuer leere Labels, Selects oder Numberfields?
- Kann die neue `slot_active`-Logik langfristig aeltere Sichtbarkeitsregeln ersetzen?
- Sind native Number-Spinner global sauber entfernt, ohne Popup-Sonderregeln zu duplizieren?

### Worker-Payload

- Ist `buildPopupResetPayload()` der eindeutige Initial-State?
- Aktiviert `buildPopupFormPayload()` nur die Slots, die wirklich gebraucht werden?
- Werden Select-Optionen, Checkboxen, Text- und Numberwerte sauber zurueckgesetzt?
- Bleiben nach Wechsel zwischen verschiedenen Rollarten alte Slotwerte sichtbar oder wirksam?

### Popup-Lifecycle

- Ist die Reihenfolge `Reset -> Payload setzen -> Popup oeffnen` stabil?
- Wird `sr6_roll_popup_open` sauber gesetzt?
- Hinterlaesst Schliessen oder erneutes Oeffnen alte Zustaende?

### Roll-Auswertung

- Werden alle Popup-Felder in `probe.js` korrekt gelesen?
- Funktionieren `affects`, `includeInTemplate`, Checkbox-Werte und Select-Werte konsistent?
- Ist `Attribut x2` wirklich nur fuer Attributproben aktiv?
- Gibt es Speziallogik, die durch die Probenmodelle redundant geworden ist?

## Testmatrix

Mindestens folgende Proben sollen im Roll20-Sandbox-Test geprueft werden:

- Attributprobe mit `Attribut x2`
- Normale Fertigkeit
- Fernkampfangriff
- Nahkampfangriff
- Zauber mit Kampfzauber-Feldern
- Zauber ohne Kampfzauber-Felder
- Matrix- oder Rigging-Probe mit Popup
- Wechsel zwischen mehreren Popup-Typen direkt nacheinander

Erwartung:

- Nur aktive Felder sind sichtbar.
- Keine grauen leeren Slots.
- Alte Slotwerte erscheinen nicht erneut.
- Rolltemplate zeigt nur relevante Popup-Felder.
- Berechnung und Erfolge bleiben unveraendert.

## Ergebnisformat des Audits

Das Audit sollte eine kleine Entscheidungsliste erzeugen:

- `Behalten`
- `Entfernen`
- `Zusammenfuehren`
- `Noch unklar`
- `Riskant fuer Roll20`

## Vorsicht

`visible` und `active` sollten nicht vorschnell zusammengelegt werden. Auch wenn `active` aktuell die robustere Sichtbarkeitsquelle ist, koennen alte Roll20-Checkbox-CSS-Mechanismen noch von `visible` oder Typ-Toggles abhaengen.

Empfohlene Reihenfolge:

1. Nur dokumentieren und inventarisieren.
2. Danach kleine Cleanup-Commits.
3. Nach jedem Cleanup `npm run build` und Roll20-Sandbox-Test.
