# UI Patterns

## Box-Grundstruktur
- `.sr6-charactersheet-box`
- `.sr6-charactersheet-box-title`
- `.sr6-charactersheet-box-content`

## Standard-Feld
- `.sr6-charactersheet-field`
- `<span>` Label + `<input|select>`

## Attribut/Fertigkeit-Muster
- `.sr6-charactersheet-attr-field`
- `.sr6-charactersheet-attr-values`
- 3 Werte: Grundwert / Modifikator / Gesamtwert
- optional Dice via `.sr6-charactersheet-field-input-with-dice`

## Repeating-Muster
- `fieldset.repeating_<name>`
- `.sr6-foundry-item`
- Editiermodus-Checkbox pro Section (`sr6_*_edit_mode`)
- Listenansicht-Regeln ueber `:has(.sr6-editable-section-mode:not(:checked))`

## Responsive
- Zentrale Breakpoints in CSS-Modulen beibehalten
- Keine punktuellen Ad-hoc-Media-Queries in HTML-Partials
