# SR6 Roll20 Rollbutton Naming v1

## Ziel
Konsistente Benennung fuer alle Roll20-Buttons (`type="roll"`) im SR6-Sheet.

## Verbindliches Schema

`name="roll_<attr_sr6_key_ohne_attr_prefix>"`

Beispiele:
- `attr_sr6_attr_konstitution_grundwert` -> `roll_sr6_attr_konstitution_grundwert`
- `attr_sr6_combat_fernkampf_nah` -> `roll_sr6_combat_fernkampf_nah`
- `attr_sr6_combat_primaere_nahkampfwaffe` -> `roll_sr6_combat_primaere_nahkampfwaffe`

## Regeln

1. `roll_` ist Pflichtprefix fuer jeden Rollbutton.
2. Der Rest entspricht exakt dem Attribut-Key ohne fuehrendes `attr_`.
3. Keine Sonderformen pro Tab oder Sprache.
4. Name und gewuerfeltes Attribut muessen 1:1 zusammenpassen.

## Rollausgabe (aktuell)

- Attributwuerfe: `Attribut-Test`
- Fernkampf: `Fernkampf-Test` inkl. Kontext `Waffe` und `Modus`
- Nahkampf: `Nahkampf-Test` inkl. Kontext `Waffe`

## Qualitaetscheck

Bei neuen Rollbuttons immer pruefen:
- `name` folgt Schema.
- `value` referenziert dasselbe Attribut im Pool und Erfolge-Block.
- Kontextfelder (falls vorhanden) nutzen `@{...}`-Referenzen auf bestehende Attribute.

## Referenzen (Rolltemplates)
- https://wiki.roll20.net/Roll_Templates
- https://help.roll20.net/hc/en-us/articles/360037257334-How-to-Make-Roll-Templates
