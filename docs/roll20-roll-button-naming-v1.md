# SR6 Roll20 Rollbutton Naming v1

## Ziel
Konsistente globale Ansteuerung fuer alle Wuerfel-Buttons im SR6-Sheet.

## Verbindliches Schema

`type="action"` und `name="act_probe"`

Beispiele:
- `type="action" name="act_probe"` (Attributwurf)
- `type="action" name="act_probe"` (Fernkampf)
- `type="action" name="act_probe"` (Matrixhandlung)

## Regeln

1. Jeder Wuerfelbutton nutzt immer `type="action"` und `name="act_probe"`.
2. Der gewuerfelte Kontext steht ausschliesslich im `value`-Template (`Pool`, `Erfolge`, Kontextfelder).
3. Keine tab-spezifischen Buttonnamen mehr (`roll_*` ist veraltet).
4. `value` muss weiterhin konsistent auf bestehende `@{attr_*}`-Felder verweisen.
5. Ausgabe laeuft global ueber das Rolltemplate `sr6probe`.

## Rollausgabe (aktuell)

- Einheitlich ueber `&{template:sr6probe}`.
- Titel wird kontextsensitiv abgeleitet (z. B. Attributname statt generischem Testnamen).
- Felder wie `Pool`, `Erfolge` und `Details` nutzen das globale SR6-Dice-Styling.

## Qualitaetscheck

Bei neuen Rollbuttons immer pruefen:
- Button ist `type="action"` mit `name="act_probe"`.
- `value` enthaelt gueltige `Pool`- und `Erfolge`-Felder.
- `Erfolge` verwendet die globale Erfolgslogik (`d6>5` im Template, Auswertung im Worker).
- Kontextfelder (falls vorhanden) nutzen `@{...}`-Referenzen auf bestehende Attribute.
- Keine neuen `roll_*`-Buttons einfuehren.

## Referenzen (Rolltemplates)
- https://wiki.roll20.net/Roll_Templates
- https://help.roll20.net/hc/en-us/articles/360037257334-How-to-Make-Roll-Templates
