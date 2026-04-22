# Refactor Data Fields Matrix

## Zielregel

Fuer jeden fachlichen Wert existiert genau **eine gemeinsame Datenquelle**.

Jeder Fachwert wird zuerst einem Wertetyp zugeordnet:

- **Attribut**
- **Fertigkeit**
- **Kalkulationsfeld**
- **Einzelwert / Kontextwert**

Wo fachlich sinnvoll, wird der Wert im Standardmodell gefuehrt:

- `Grundwert`
- `Modifikator`
- `Gesamtwert`

Wird derselbe fachliche Wert in mehreren Tabs angezeigt, dann lesen und schreiben alle diese UI-Felder dieselbe Datenquelle.

Tabs sind dabei **keine Quelle**, sondern nur unterschiedliche Ansichten derselben Datenfelder.

## Arbeitsregel fuer diesen Refactor

1. Zuerst Fachwerte inventarisieren und typisieren.
2. Dann pro Fachwert die gemeinsame Datenquelle festlegen.
3. Danach HTML, Worker und Popup-Zuordnungen angleichen.
4. Offene Formel- und Popup-Fragen separat als TODO fuehren, damit sie den Strukturumbau nicht blockieren.

## Projektweite Matrix nach Tabs

| Tab | Fachbereich | Haupt-Wertetypen | Gemeinsame Datenquellen / Muster | Refactor-Status |
| --- | --- | --- | --- | --- |
| Allgemein | Attribute | Attribut | `sr6_attr_<name>_grundwert/modifikator/gesamtwert` | Bereits als Dreiklang vorhanden, technisch auf numerische Inputs umstellen |
| Allgemein | Fertigkeiten (Uebersicht) | Fertigkeit | `sr6_skill_<name>_grundwert/modifikator/gesamtwert` | Spiegel auf Fertigkeiten-Tab, technisch auf numerische Inputs umstellen |
| Allgemein | Kampf | Kalkulationsfeld, Einzelwert | Kampf-Kalkulationsfelder und Kontextwerte unter `sr6_combat_*` | Erste Kernwerte teils berechnet, Gesamtmodell fuer alle Kampfwerte weiter offen |
| Allgemein | Verteidigung | Kalkulationsfeld | `sr6_verteidigung_<name>_grundwert/modifikator/gesamtwert` | Dreiklang vorhanden, Formeln spaeter gegen Regelwerk finalisieren |
| Allgemein | Schadenswiderstand | Kalkulationsfeld | `sr6_schadenswiderstand_<name>_grundwert/modifikator/gesamtwert` | Dreiklang vorhanden, Formeln spaeter gegen Regelwerk finalisieren |
| Fertigkeiten | Aktionsfertigkeiten | Fertigkeit | `sr6_skill_<name>_grundwert/modifikator/gesamtwert` | Bereits als Dreiklang vorhanden, technisch auf numerische Inputs umstellen |
| Fertigkeiten | Wissens-/Sprach-/Soft-Felder | Fertigkeit / Spezialtyp | `sr6_wissensfertigkeit_*`, `sr6_sprachfertigkeit_*`, `sr6_talentsoft_*`, `sr6_wissenssprachsoft_*` | Dreiklang vorhanden, numerische Inputs umstellen; Fachtyp spaeter scharfziehen |
| Kampf | Kernwerte | Kalkulationsfeld, Einzelwert | `sr6_combat_*`, `sr6_verteidigung_*`, `sr6_schadenswiderstand_*` | `Fernkampfangriff`, `Nahkampfangriff`, `Verteidigung (Physisch)`, `Schadenswiderstand (Physisch)`, `Verteidigungswert` laufen jetzt berechnet; Panzerungsrollen werden direkt in `Kampf > Panzerung` zugewiesen |
| Kampf | Fernkampfwaffen / Nahkampfwaffen | Einzelwert, Kontextwert, spaeter ggf. Kalkulationsfeld | `repeating_sr6fernkampfwaffen_*`, `repeating_sr6nahkampfwaffen_*` | `Schaden` ist ein numerischer Einzelwert; `Angriffswert` sitzt aktuell in den reichweitenabhaengigen Zahlenfeldern und bleibt vorerst daran gekoppelt |
| Kampf | Panzerung | Einzelwert / Kontextwert | `repeating_sr6panzerung_*`, `sr6_combat_*` | Kein erzwungener Dreiklang ohne fachliche Not |
| Magie | Kernwerte | Attribut, Kalkulationsfeld, Einzelwert | `sr6_magic_*`, teilweise Attribute-/Skill-Bezug | Noch projektweit typisieren, nicht blind umbenennen |
| Magie | Zauber / Rituale / Foki / Geister | Einzelwert, Kontextwert, spaeter teils Kalkulationsfeld | `repeating_sr6zauber_*`, `repeating_sr6rituale_*`, `repeating_sr6foki_*`, `repeating_sr6geister_*` | Typisierung offen, Popup spaeter darauf ausrichten |
| Matrix | Kernwerte | Einzelwert, Kalkulationsfeld | `sr6_matrix_*` | Kernwerte spaeter typisieren, aktuell nicht pauschal in Dreiklang zwingen |
| Matrix | Handlungen | Kalkulationsfeld | `sr6_matrix_handlung_<name>_grundwert/modifikator/gesamtwert` | Bereits gutes Referenzmodell, numerische Inputs umstellen |
| Matrix | Geraete / Programme / Zubehoer / Komplexe Strukturen / Sprites | Einzelwert / Kontextwert | `repeating_sr6matrixgeraete_*`, `repeating_sr6programme_*`, etc. | Erst nach Gesamtklassifikation verfeinern |
| Rigging | Kernwerte | Einzelwert, Kalkulationsfeld | `sr6_rigging_*` | Formel- und Typpruefung noch offen |
| Rigging | Fahrzeuge / Programme / Zubehoer / Agenten / Manoever | Einzelwert / Kontextwert | `repeating_sr6fahrzeuge_*`, `repeating_sr6agenten_*`, `repeating_sr6manoever_*` | Kein pauschaler Dreiklang ohne fachliche Bestaetigung |
| Ausruestung | Ausruestung / Cyberware / Bioware / SIN / Lebensstil | Einzelwert / Kontextwert | `repeating_sr6ausruestung_*`, `repeating_sr6cyberware_*`, etc. | Ueberwiegend Einzel-/Kontextwerte, spaeter fachlich selektiv pruefen |
| Leben | Personendaten / SIN / Lebensstil / Connections / Beschreibung | Einzelwert / Kontextwert | `sr6_bio_*`, `repeating_sr6connections_*`, Textfelder | Kein kuenstlicher Dreiklang ohne fachliche Not |

## Bereits bestaetigte Referenzmodelle

### 1. Attribute

Kanonisches Schema:

- `sr6_attr_<name>_grundwert`
- `sr6_attr_<name>_modifikator`
- `sr6_attr_<name>_gesamtwert`

Status:

- bereits vorhanden
- in `Allgemein > Attribute` gepflegt
- an anderen Stellen nur spiegeln, nicht duplizieren
- numerische Inputs bereits umgestellt

### 2. Fertigkeiten

Kanonisches Schema:

- `sr6_skill_<name>_grundwert`
- `sr6_skill_<name>_modifikator`
- `sr6_skill_<name>_gesamtwert`

Status:

- bereits vorhanden
- in `Fertigkeiten` und `Allgemein > Fertigkeiten` genutzt
- dieselbe Quelle in allen Ansichten beibehalten
- numerische Inputs bereits umgestellt

### 3. Matrix-Handlungen

Kanonisches Schema:

- `sr6_matrix_handlung_<name>_grundwert`
- `sr6_matrix_handlung_<name>_modifikator`
- `sr6_matrix_handlung_<name>_gesamtwert`

Status:

- bereits vorhanden
- gutes Referenzmodell fuer andere Kalkulationsfelder
- numerische Inputs bereits umgestellt

### 4. Verteidigung / Schadenswiderstand

Kanonisches Schema:

- `sr6_verteidigung_<name>_grundwert/modifikator/gesamtwert`
- `sr6_schadenswiderstand_<name>_grundwert/modifikator/gesamtwert`

Status:

- bereits vorhanden
- muessen fachlich noch gegen finale Formeln und Popup-Profile gespiegelt werden
- numerische Inputs bereits umgestellt

### 5. Erste berechnete Kampf-Kernwerte

Aktueller technischer Stand:

- `sr6_combat_fernkampfangriff_grundwert = sr6_skill_feuerwaffen_gesamtwert + sr6_attr_geschicklichkeit_gesamtwert`
- `sr6_combat_nahkampfangriff_grundwert = sr6_skill_nahkampf_gesamtwert + sr6_attr_geschicklichkeit_gesamtwert`
- `sr6_verteidigung_physisch_grundwert = sr6_attr_reaktion_gesamtwert + sr6_attr_intuition_gesamtwert`
- `sr6_schadenswiderstand_physisch_grundwert = sr6_attr_konstitution_gesamtwert`
- `sr6_combat_verteidigungswert_grundwert = sr6_attr_konstitution_gesamtwert + sr6_combat_primaere_panzerung + sr6_combat_sekundaere_panzerung + sr6_combat_helm + sr6_combat_schild`

Dabei gilt jeweils:

- `gesamtwert = grundwert + modifikator`
- bestehende Legacy-Gesamtfelder fuer die Kampfangriffe werden aktuell synchron gehalten, damit Roll- und Popup-Bindings kompatibel bleiben
- `Primäre Panzerung`, `Sekundäre Panzerung`, `Helm` und `Schild` werden technisch als numerische Bonuswerte fuer die Berechnung gespeichert; ihre Zuweisung erfolgt direkt ueber die Rollenwahl in `Kampf > Panzerung`

## Phase 1: Zielmatrix fuer Kampf-Formeln

Diese Matrix trennt bewusst:

- **Wuerfelpool / Probe**
- **Angriffswert**
- **Verteidigungswert**
- **Schaden**

Das ist fuer den weiteren Refactor wichtig, weil diese Begriffe im Sheet aktuell teilweise noch nebeneinanderlaufen, im Regelwerk aber unterschiedliche Aufgaben haben.

| Fachwert | Wertetyp | Ziel-Formel / Regel | Quelle im Sheet | Status |
| --- | --- | --- | --- | --- |
| `Fernkampfangriff` | Kalkulationsfeld | `Feuerwaffen (Gesamtwert) + Geschicklichkeit (Gesamtwert)` | `sr6_combat_fernkampfangriff_grundwert/modifikator/gesamtwert` | Regel und Code sind konsistent |
| `Nahkampfangriff` | Kalkulationsfeld | `Nahkampf (Gesamtwert) + Geschicklichkeit (Gesamtwert)` | `sr6_combat_nahkampfangriff_grundwert/modifikator/gesamtwert` | Regel und Code sind konsistent |
| `Verteidigung (Physisch)` | Kalkulationsfeld | `Reaktion (Gesamtwert) + Intuition (Gesamtwert)` | `sr6_verteidigung_physisch_grundwert/modifikator/gesamtwert` | Regel und Code sind konsistent |
| `Schadenswiderstand (Physisch)` | Kalkulationsfeld | `Konstitution (Gesamtwert)` | `sr6_schadenswiderstand_physisch_grundwert/modifikator/gesamtwert` | Regel und Code sind konsistent |
| `Verteidigungswert` | Kalkulationsfeld | `Konstitution (Gesamtwert) + Verteidigungswertbonus durch Panzerung und Ausruestung` | `sr6_combat_verteidigungswert_grundwert/modifikator/gesamtwert` | Im Sheet aktuell umgesetzt als `Konstitution + Primaer + Sekundaer + Helm + Schild`; fachlich als erster Zielzustand brauchbar |
| `Fernkampfwaffen: Angriffswert` | Kontextwert / Waffenwert | reichweitenabhaengige Waffenwerte `S. Nah / Nah / Mittel / Weit / S. Weit`; kein eigener Wuerfelpool | `repeating_sr6fernkampfwaffen_*` | Bewusst kein Dreiklang; Werte werden pro Waffe gepflegt |
| `Nahkampfwaffen: Angriffswert` | Kontextwert / Waffenwert | Waffen-Angriffswert pro Reichweite; Nahkampfwaffen addieren regeltechnisch `Staerke`, sofern der eingetragene Wert nicht bereits final ist | `repeating_sr6nahkampfwaffen_*` | Fachlich noch markieren: Das Sheet behandelt die Felder aktuell als eingegebene Endwerte |
| `Fernkampfwaffen: Schaden` | Einzelwert | numerischer Einzelwert; kann durch Munition oder Popup modifiziert werden | `repeating_sr6fernkampfwaffen_*` | Festgelegt |
| `Nahkampfwaffen: Schaden` | Einzelwert | numerischer Einzelwert; kann durch Popup modifiziert werden | `repeating_sr6nahkampfwaffen_*` | Festgelegt |
| `Munition` | Kontextwert | modifiziert je nach Munitionsart `Angriffswert` und/oder `Schaden`, nicht pauschal den Wuerfelpool | Popup + Waffenfeld | Festgelegt, aber je Munitionsart weiter verfeinerbar |

### Fachliche Klarstellung fuer Kampf

Im weiteren Refactor gilt fuer den Kampfbereich:

1. `Fernkampfangriff` und `Nahkampfangriff` sind **Wuerfelpools**, keine Angriffswerte.
2. `Angriffswert` ist bei Waffen ein **separater Waffenwert** und wird fuer den Edge-Vergleich benutzt.
3. `Verteidigung (Physisch)` ist die **Verteidigungsprobe**.
4. `Verteidigungswert` ist **kein Wuerfelpool**, sondern ein Vergleichswert gegen den Angriffswert.
5. `Schadenswiderstand (Physisch)` bleibt eine eigene Probe auf `Konstitution`.

### Auswirkungen auf den Refactor

Aus dieser Zielmatrix folgen fuer die Kampfdomäne die naechsten technischen Regeln:

- `Fernkampfangriff`, `Nahkampfangriff`, `Verteidigung (Physisch)`, `Schadenswiderstand (Physisch)` bleiben Dreiklang-Kalkulationsfelder
- `Verteidigungswert` bleibt ebenfalls ein Kalkulationsfeld, aber **kein** Roll-Pool
- reichweitenabhaengige Waffen-`Angriffswerte` bleiben vorerst **Waffen-Kontextwerte**
- Waffen-`Schaden` bleibt **numerischer Einzelwert**
- Popup-Profile muessen diese vier Ebenen kuenftig sauber auseinanderhalten:
  - Pool
  - Angriffswert
  - Verteidigungswert
  - Schaden

## Aktuelle Konfliktmuster

### 1. Einzelwert statt Standard-Dreiklang

Mehrere Kampfwerte sind aktuell nur als Einzelattribut vorhanden, z. B.:

- `sr6_combat_fernkampfangriff`
- `sr6_combat_nahkampfangriff`
- `sr6_combat_verteidigungswert`
- `sr6_combat_fernkampf_schaden`
- `sr6_combat_nahkampf_schaden`
- `sr6_fernkampf_schaden`
- `sr6_nahkampf_schaden`

`Schaden` ist dabei jetzt fachlich als **bewusster numerischer Einzelwert** eingeordnet. Die reichweitenabhaengigen Poolfelder repraesentieren derzeit den **Angriffswert** und bleiben deshalb getrennt von `Schaden`.

### 2. Spiegel zwischen Allgemein und Fach-Tab

Mehrere Werte erscheinen in:

- `Allgemein`
- Fach-Tab (`Fertigkeiten`, `Kampf`, etc.)

Dafuer muss jeweils dieselbe Datenquelle gelten. Das ist bei Attributen und Fertigkeiten bereits weitgehend erfuellt, bei Kampfwerten noch nicht abschliessend.

### 3. Repeating-Werte vs. globale Basiswerte

Es gibt zwei Ebenen, die getrennt modelliert bleiben muessen:

- globale Basis-/Kalkulationswerte
- item-spezifische Repeating-Werte

Das betrifft besonders:

- Waffen
- Panzerungen
- Fahrzeuge
- Zauber / Rituale / Foki
- Matrix-Geraete

## Umsetzungsreihenfolge fuer den Refactor

1. **Todos dokumentieren und Matrix vervollstaendigen**
2. **Bestehende numerische Dreiklang-Felder auf `input type="number"` umstellen**
3. **Attribute und Fertigkeiten als Referenzmodell stabilisieren**
4. **Kalkulationsfelder fachlich finalisieren und danach Worker-/Popup-Logik angleichen**
5. **Repeating- und Kontextwerte selektiv nachziehen**

## Naechste konkreten Umbauten

1. Attribute projektweit als numerische Eingaben fuehren
2. Fertigkeiten projektweit als numerische Eingaben fuehren
3. Bestehende Dreiklaenge in `Verteidigung`, `Schadenswiderstand` und `Matrix-Handlungen` ebenfalls numerisch fuehren
4. Offene Kampf- und Popup-Fragen ueber die TODO-Liste separat nachhalten
