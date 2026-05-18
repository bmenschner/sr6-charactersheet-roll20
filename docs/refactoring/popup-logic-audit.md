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
- `src/workers/rolls/definitions.js`
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

## Audit-Befund 2026-05-18

Dieser Stand ist eine Inventur. Er enthaelt noch keinen Cleanup.

### Aktuelle Architektur

Die sichtbaren Rollbuttons im HTML verwenden weiterhin ueberwiegend `&{template:default}` als Triggerformat.
Das ist aktuell kein Widerspruch zum eigenen Rolltemplate:

- `runSuccessProbeRoll()` liest das Button-Template aus `eventInfo.htmlAttributes.value`.
- `parseTemplateFields()` und `parsePoolAttributeFromFields()` extrahieren daraus Kontext und Poolquelle.
- `resolveRollDefinition()` waehlt daraus ein Probenmodell.
- Bei aktivem eigenen Popup wird danach `runSuccessProbeFromContext()` ausgefuehrt.
- Die finale Chat-Ausgabe wird in `buildSr6ProbeMessage()` als `&{template:sr6probe}` erzeugt.
- Der Roll20-Fallback bleibt nur aktiv, wenn `sr6_setting_popup_mods` auf `roll20` steht.

Damit sind die HTML-Templates derzeit vor allem ein transportables Trigger-/Kontextformat.
Ein direkter Umbau aller HTML-Buttons auf `template:sr6probe` waere deshalb riskant und ist nicht der erste Cleanup-Schritt.

### Aktive Rollmodelle

Folgende Modelle sind im Code aktiv bzw. relevant:

| Modell / Definition | Status | Hinweis |
| --- | --- | --- |
| `attribute_probe` | Behalten | Attributprobe inklusive `Attribut x2` |
| `skill_probe` | Behalten | Standardmodell fuer Aktionsfertigkeiten mit Attributauswahl, Spezialisierung und Expertise |
| `initiative_probe` | Behalten | Sonderwurf `Basis + W6`; nicht Teil des Popup-Cleanups |
| `defense_probe` | Behalten | Gemeinsames Modell fuer Verteidigung/Widerstand mit Vergleichswerten |
| `combat_attack_probe` | Behalten | Waffen-/Kampfmodell mit Pool, Angriffswert, Schaden und Waffenlayout |
| `spell_probe` | Behalten | Zauber plus Entzug und Zauberbeschreibung |
| `summoning_probe` | Behalten | Beschwoeren, Geister-Gegenprobe, Dienste, Entzug, optional Besessenheit |
| `equipment_probe` | Behalten | Ausruestungswurf mit optionalem Bezug und `Stufe x2` |
| `rigging_vehicle_probe` | Behalten | Fahrzeug-/Drohnenprobe mit Modus und Drohnenwaffenkontext |
| `matrix_action` | Behalten | Matrixhandlung mit getrennter Probe/Verteidigung |
| `value_probe` | Uebergangspfad | Fuer explizite Kernwert-/Einzelwertproben; nicht weiter ausbauen |
| `weapon` | Alt-/Fallbackpfad | Nur als Sicherheitsnetz fuer waffenfoermige Restfaelle |
| `fallback` | Alt-/Fallbackpfad | Letztes Sicherheitsnetz fuer nicht gemappte Proben |

### Popup-Zustaende

Pro Popup-Slot existieren derzeit mehrere Zustandsgruppen:

- `active`: robuste Sichtbarkeits-Sperre gegen leere graue Slots
- `visible`: historischer Sichtbarkeits-Toggle
- `is_number`, `is_text`, `is_select`, `is_checkbox`: Typsteuerung
- `requires_previous_checkbox`: Abhaengigkeit vom vorherigen Checkbox-Slot
- `option_<set>`: Auswahl des konkreten Select-Option-Sets
- `value_*`: Eingabewert je Typ bzw. Select-Set

Bewertung:

| Zustand | Entscheidung | Begruendung |
| --- | --- | --- |
| `active` | Behalten | Aktuell wichtigste Absicherung gegen leere sichtbare Slots |
| `visible` | Noch unklar | Wird weiterhin fuer alte CSS-Ketten genutzt; nicht vorschnell entfernen |
| Typ-Toggles | Behalten | Roll20-kompatible CSS-Steuerung ohne JavaScript-DOM-Zugriff |
| Option-Toggles | Behalten | Noetig, weil alle Selects im Markup existieren und per CSS umgeschaltet werden |
| Dependency-Toggles | Behalten | Wird fuer `Objektwiderstand` nach `Besessenheit` genutzt |
| Slot-Werte | Behalten | Werden durch `buildPopupResetPayload()` zurueckgesetzt |

### Reset- und Lifecycle-Befund

Aktueller Ablauf:

1. `runSuccessProbeRoll()` ermittelt Definition und Prefill-Werte.
2. Es wird `buildPopupResetPayload()` mit `sr6_roll_popup_open: "0"` gesetzt.
3. Danach wird `buildPopupPrefillPayload()` gesetzt und `sr6_roll_popup_open: "1"` aktiviert.
4. `runGlobalPopupProbeConfirm()` liest alle Slotwerte, baut `popupState`, schliesst das Popup und fuehrt den Wurf aus.

Befund:

- Der Ablauf `Reset -> Prefill -> Oeffnen` ist richtig.
- `buildPopupFormPayload()` ruft intern ebenfalls `buildPopupResetPayload()` auf.
- Dadurch gibt es eine doppelte Reset-Sicherheit: einmal vor dem Prefill-SetAttrs, einmal im Payload selbst.
- Das ist redundant, aber aktuell harmlos und wahrscheinlich stabiler fuer Roll20.

Entscheidung:

- Kurzfristig behalten.
- Spaeter kann geprueft werden, ob der doppelte Reset in einen klareren Helper zusammengefuehrt wird.

### Rolltemplate-Befund

Das eigene Rolltemplate ist `src/html/partials/runtime/rolltemplate-sr6probe.html`.

Aktueller Stand:

- `buildSr6ProbeMessage()` erzeugt `&{template:sr6probe}`.
- Es gibt Layoutvarianten ueber Flags:
  - Standardlayout
  - `weapon_layout`
  - `spell_layout`
- Wuerfeldetails werden ueber `details_dice` und `d1_v` bis `d20_v` ausgegeben.
- Der fruehere Ansatz mit `d*_t`, `d*_s` bzw. direktem Style-Markup ist nicht mehr aktiv.
- `details_markup` ist im aktuellen Code nicht mehr auffindbar.

Bewertung:

| Punkt | Entscheidung | Begruendung |
| --- | --- | --- |
| `template:sr6probe` | Behalten | Finale Ausgabe laeuft darueber |
| `template:default` in HTML | Behalten | Derzeit Trigger-/Parserformat fuer Worker |
| `details_dice` | Behalten | Roll20-kompatibler Ersatz fuer direktes Markup/Style im Template |
| `details_markup` | Entfernen, falls noch irgendwo auftaucht | Im aktuellen Code nicht mehr aktiv |
| `weapon_layout` / `spell_layout` | Behalten | Fachlich unterschiedliche Output-Strukturen |

### Erste Cleanup-Kandidaten

Diese Punkte wirken sinnvoll, aber sollten einzeln umgesetzt und getestet werden:

1. **Dokumentierter Helper fuer Popup-Reset**
   Ziel: Doppelte Reset-Logik nicht entfernen, aber klarer benennen.

2. **Fallback-Nutzung messen**
   Ziel: Alle Buttonarten inventarisieren, die aktuell noch in `weapon` oder `fallback` fallen.
   Erst danach duerfen Fallbacks reduziert werden.

3. **Rolltemplate-Kontextzeilen vereinheitlichen**
   Ziel: `label1` bis `label4`, `extra_rows`, `calc_rows`, `ammo_hints` und Sonderzeilen dokumentiert zusammenfuehren.

4. **Popup-Slot-Typen pruefen**
   Ziel: Klaeren, ob `visible` langfristig durch `active` ersetzt werden kann.
   Das ist riskant fuer Roll20 und braucht Sandbox-Test.

5. **HTML-Triggerformat bewusst belassen**
   Ziel: Keine Massenmigration der 300+ `template:default`-Buttons, solange die Worker-Pipeline diese als Kontextquelle nutzt.

### Entscheidungsliste

| Kategorie | Einordnung |
| --- | --- |
| Behalten | `active`, Typ-Toggles, Option-Toggles, Dependency-Toggles, `template:default` als Triggerformat, `template:sr6probe` als Ausgabe |
| Entfernen | Nur alte `details_markup`-/Style-Wuerfeldetail-Reste, falls sie wieder auftauchen |
| Zusammenfuehren | Reset/Payload-Initialisierung spaeter klarer kapseln |
| Noch unklar | Ob `visible` vollstaendig durch `active` ersetzt werden kann |
| Riskant fuer Roll20 | CSS-Sichtbarkeit der Slots, Massenumbau aller Button-Templates, Entfernen von Fallbacks ohne Messung |

### Empfohlener naechster Schritt

Der erste technische Schritt sollte **nicht** das Rolltemplate selbst sein.

Empfehlung:

1. Eine kleine Debug-/Audit-Funktion oder temporaere Dokumentation erstellen, welche Definitionen von realen Buttons getroffen werden.
2. Damit ermitteln, ob `weapon` und `fallback` noch real genutzt werden.
3. Erst danach Fallbacks reduzieren oder einzelne Buttons explizit auf echte Modelle heben.

## Definitionstreffer im aktuellen Output

Stand: `output/charactersheet.html` gegen `output/sheet_workers.js` ausgewertet.

Gesamtzahl gefundener `act_probe`-Buttons: `267`

Wichtigster Befund:

- `weapon`: `0` Treffer
- `fallback`: `0` Treffer
- `generic_skill`: `0` Treffer
- `value`: `0` Treffer
- `combat_projectile_core_attack`: `1` Treffer

Damit sind die beiden eigentlichen Sicherheitsnetze `weapon` und `fallback` im aktuellen Sheet nicht aktiv belegt.
Sie koennen trotzdem als Sicherheitsnetz bestehen bleiben, sollten aber nicht weiter ausgebaut werden.

### Treffer nach Definition

| Definition | Treffer |
| --- | ---: |
| `matrix_action` | 73 |
| `skill_astral` | 6 |
| `skill_athletik` | 6 |
| `skill_beschwoeren` | 6 |
| `skill_biotech` | 6 |
| `skill_cracken` | 6 |
| `skill_einfluss` | 6 |
| `skill_elektronik` | 6 |
| `skill_exotische_waffen` | 6 |
| `skill_feuerwaffen` | 6 |
| `skill_heimlichkeit` | 6 |
| `skill_hexerei` | 6 |
| `skill_mechanik` | 6 |
| `skill_nahkampf` | 6 |
| `skill_natur` | 6 |
| `skill_steuern` | 6 |
| `skill_tasken` | 6 |
| `skill_ueberreden` | 6 |
| `skill_verzaubern` | 6 |
| `skill_wahrnehmung` | 6 |
| `rigging_value` | 8 |
| `attribute_pair` | 7 |
| `rigging_vehicle` | 6 |
| `matrix_value` | 5 |
| `melee_weapon` | 5 |
| `ranged_weapon` | 5 |
| `initiative` | 4 |
| `magic_value` | 4 |
| `spell` | 2 |
| `summoning` | 2 |
| `attribute` | 20 |
| alle Einzeldefinitionen mit einem Treffer | je 1 |

Einzeldefinitionen mit einem Treffer:

- `astral_damage_resistance`
- `astral_defense`
- `combat_melee_core_attack`
- `combat_ranged_core_attack`
- `equipment`
- `matrix_biofeedback_damage_resistance`
- `matrix_damage_resistance`
- `matrix_defense`
- `physical_damage_resistance`
- `physical_defense`
- `talentsoft_skill`
- `value`

### Auffaelliger Resttreffer

Der letzte echte Sammelpfad-Treffer wurde auf eine explizite Definition gehoben:

| Definition | Button | Pool |
| --- | --- | --- |
| `combat_projectile_core_attack` | `Kampf: Kernwerte` / Projektilwaffen | `sr6_combat_projektilwaffen_gesamtwert` |

Bewertung:

- Funktional bleibt der Wurf unveraendert.
- Architektonisch landet kein echter Button mehr im generischen `value`-Pfad.
- Kein Grund fuer einen Rolltemplate-Umbau.

### Konsequenz

Kein Rolltemplate-Refactor noetig.

Empfohlene Entscheidung:

- `weapon` und `fallback` als Sicherheitsnetz behalten.
- Keine Massenmigration der Buttons.
- Kein Umbau des funktionierenden Rolltemplates.
- `value`, `weapon`, `fallback` und `generic_skill` bleiben Sicherheitsnetze ohne aktuelle Treffer.

## Vorsicht

`visible` und `active` sollten nicht vorschnell zusammengelegt werden. Auch wenn `active` aktuell die robustere Sichtbarkeitsquelle ist, koennen alte Roll20-Checkbox-CSS-Mechanismen noch von `visible` oder Typ-Toggles abhaengen.

Empfohlene Reihenfolge:

1. Nur dokumentieren und inventarisieren.
2. Danach kleine Cleanup-Commits.
3. Nach jedem Cleanup `npm run build` und Roll20-Sandbox-Test.
