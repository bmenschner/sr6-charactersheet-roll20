# Refactor Data Fields Matrix

## Zielregel

Fuer jeden fachlichen Wert existiert genau **eine gemeinsame Datenquelle**.

Fuer Popup- und Rolltemplate-Logik gilt zusaetzlich:

- Wir modellieren **einheitliche Probenmodelle**
- Diese Modelle werden **pro Tab mit unterschiedlichen Feldquellen und Kontexten** gefuettert
- Tabs sind damit **Kontext und Feldmapping**, aber nicht mehr die eigentliche Logikschicht

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

## Zielarchitektur fuer Popup und Rolltemplate

Die Popup- und Rolltemplate-Logik soll kuenftig entlang weniger **Probenmodelle** organisiert werden.

Dabei gilt:

- `Allgemein` ist **kein eigenes Popup-/Rolltemplate-Ziel**
- `Allgemein` bleibt nur Uebersicht/Spiegel fuer Datenfelder
- die eigentliche Logik sitzt in wiederverwendbaren Modellen

### Aktive Probenmodelle

| Probenmodell | Fachliche Grundlogik | Typische Popup-Felder | Typische Output-Felder | Tab-spezifische Feldquellen |
| --- | --- | --- | --- | --- |
| `attribute_probe` | `Attribut` oder `Attribut x2` `+- Modifikator` | `Modifikator`, spaeter optional `x2`/Variante | `Attribut`, `Wert`, `Pool`, `Erfolge`, `Details` | Attributsname und Poolquelle je nach Probe |
| `skill_probe` | `Attribut + Fertigkeitsgrundwert + Modifikator + Spezialisierung/Expertise` | `Skill-Modifikator`, `Attribut`, `Spezialisierung`, `Expertise` | `Attribut`, `Attribut-Wert`, `Fertigkeitswert`, `Pool`, `Erfolge`, `Details` | Attribut-, Fertigkeits- und Poolquelle je Tab/Fall |
| `initiative_probe` | `Basis + W6` | keine Standard-Popup-Modifikatoren | `Basis`, `W6`, `Gesamt` | physische, astrale, Matrix- und Rigging-Initiative |
| `defense_probe` | `Attribut + Fertigkeit +- Modifikator` nach SR6-Grundlogik | `Modifikator`, kontextabhaengige Vergleichswerte wie `Verteidigungswert` | `Wert`, Vergleichswert, `Pool`, `Erfolge`, `Details` | pro Tab andere Attribut-/Fertigkeitsquellen, z. B. `Kampf`, `Matrix`, spaeter weitere |
| `combat_attack_probe` | Angriffsprobe mit getrennten Ebenen fuer `Pool`, `Angriffswert`, `Schaden` | `Skill-Modifikator`, `Angriffswert-Modifikator`, `Schadens-Modifikator`, `Munition`, `Spezialisierung`, `Expertise` | `Waffe`, `Angriffswert`, `Pool`, `Erfolge`, `Schaden`, `Reichweite`, `Munition`, `Munitionshinweis`, `Berechnung` | Nah-/Fernkampfwerte, Waffenkontext, Munitionsquelle, Reichweite |
| `spell_probe` | `Spruchzauberei` plus separater Entzug | Skill-, Angriffswert-, Schadens-, Flaechen-, Hochdrehen- und Entzugsmodifikatoren | Zauber, Pool, Erfolge, Schaden, modifizierter Entzug, Entzugsschaden inkl. Schadenstyp, Beschreibung, weitere Werte | Magie-Zauber |
| `summoning_probe` | `Beschwoeren + Magie` gegen `Kraftstufe x 2`, Dienste aus Nettoerfolgen, Entzug aus Geister-Erfolgen | `Geistertyp`, `Beschwoeren-Modifikator`, `Entzug-Modifikator`, `Besessenheit`, `Objektwiderstand` | Geist, Typ, Stufe, Geistertyp, Pool, Erfolge, Geist-Pool, Geist-Erfolge, Nettoerfolge, erhaltene Dienste, entstandener Entzug, Entzugsschaden | Magie-Geister |
| `value_probe` | einzelner Wert als Probe oder Vergleichswert | Standard-Modifikator, teils Matrix-Zugriff/Overwatch | Wert, Pool, Erfolge, Details | Magie-, Matrix-, Rigging- und Fallback-Werte |
| `matrix_action` | Matrixhandlung mit getrennter Probe und Verteidigung | Verteidigungsquelle in der Handlungszeile; keine Standard-Popup-Pflicht | Handlung, Probe, Verteidigung, Pool, Erfolge, Details | Matrix-Handlungen |

### Aktuelles Mapping auf diese Zielmodelle

| Aktuelle Definition / Gruppe | Zielmodell | Aktueller Status | Bemerkung |
| --- | --- | --- | --- |
| `attribute` | `attribute_probe` | Modell aktiv in erster Nutzung | Eigenes Modell und Pool-Multiplikator sind im Code verankert; erster echter `Attribut x2`-Pilot ist bei `Attribute & Fertigkeiten > Attribute > Gesamtwert` umgesetzt und in Roll20 bestaetigt |
| `initiative` | `initiative_probe` | Modell aktiv in erster Nutzung | Initiativwuerfe mit `Basis / W6 / Gesamt` laufen nicht mehr ueber den generischen Fallback, sondern ueber ein eigenes Initiativmodell; physische, astrale, Matrix- und Rigging-Initiative nutzen getrennte Basisfelder. Matrix- und Rigging-Initiative leiten Basis und `W6` jetzt aus dem Modus ab |
| `skill` | `skill_probe` | Modell aktiv und in Roll20 bestaetigt | Aktionsfertigkeiten nutzen jetzt ein Attribut-Dropdown im Popup; Primaerattribut ist vorausgewaehlt, Sekundaerattribute koennen je Fertigkeit gewaehlt werden; der Pool wird aus gewaehltem Attribut plus Fertigkeitswert berechnet. Spezialisierungen addieren `+2`, Expertisen addieren `+3`; Expertise ersetzt den Spezialisierungsbonus und addiert ihn nicht zusaetzlich |
| `knowledge_skill`, `language_skill`, `talentsoft_skill`, `knowledge_language_soft_skill`, `generic_skill` | Fachspezifische Sondermodelle neben `skill_probe` | Issue-12-Pruefung fuer Attribute & Fertigkeiten abgeschlossen | Wissens-/Sprachfelder und Wissens-/Sprachsofts nutzen Erinnerungsvermoegen (`Logik + Intuition`) als Wuerfelpool; Talentsofts nutzen `gewaehltes Attribut + Stufe + Modifikator` |
| `spell` | `spell_probe` | Modell aktiv in erster echter Nutzung | Zauber und der Kernwerte-Wurf `Spruchzauberei` laufen jetzt ueber ein eigenes Modell mit `Spruchzauberei`-Probe, modifiziertem Entzug, Entzugsschaden-Typ und separatem Entzugswiderstand; das Popup fuehrt Skill-, Angriffswert-, Schadens-, Flaechen-, Hochdrehen- und Entzugsmodifikatoren explizit |
| `summoning` | `summoning_probe` | Modell aktiv in erster Nutzung | Geister koennen aus der Geisterliste heraus beschworen werden: Hauptprobe `Beschwoeren + Magie`, Gegenpool `Kraftstufe x 2`, Dienste aus Nettoerfolgen, Entzug aus Geister-Erfolgen; Geistertyp wird im Popup aus den Grundregelwerk-Geisterarten plus Beschuetzergeister, Helfergeister, Pflanzengeister und Ratgebergeister gewaehlt |
| `matrix_action` | `matrix_action` | Modell aktiv und auf Regelwerksmapping umgestellt | Matrix-Handlungen nutzen jetzt getrennte Proben- und Verteidigungswerte aus `SR6_MATRIX_ACTION_RULES`; variable Verteidigungen werden in der Handlungszeile gewaehlt |
| `physical_defense`, `physical_damage_resistance`, `general_defense`, `general_damage_resistance`, `astral_defense`, `astral_damage_resistance`, `matrix_defense`, `matrix_damage_resistance`, `matrix_biofeedback_damage_resistance`, `rigging_matrix_defense`, `rigging_matrix_damage_resistance`, `rigging_biofeedback_damage_resistance` | `defense_probe` | Modell aktiv in Nutzung | Gemeinsamer Builder existiert und wird bereits fuer Kampf sowie allgemeine, magische, Matrix- und Rigging-Defensivfaelle verwendet |
| `combat_ranged_core_attack`, `combat_melee_core_attack`, `combat_ranged_weapon`, `combat_melee_weapon`, `ranged_weapon`, `melee_weapon` | `combat_attack_probe` | Am besten modelliert | Gemeinsames Kampf-Popup und gemeinsamer Weapon-Outputpfad bereits vorhanden |
| `magic_value`, `matrix_value`, `rigging_value`, `value` | `value_probe` | Modell jetzt explizit, aber noch Uebergangspfad | Magie-, Matrix- und Rigging-Kernwerte laufen jetzt ueber explizite `value_probe`-Pfade statt direkt ueber den generischen Catch-all; der verbleibende generische `value`-Pfad bleibt vorerst technisches Sicherheitsnetz |
| `weapon`, `fallback` | Kein Zielmodell | Technischer Alt-/Fallbackpfad | Langfristig nur noch als Sicherheitsnetz, nicht als eigentliche Architektur |

## Arbeitsregel fuer diesen Refactor

1. Zuerst Fachwerte inventarisieren und typisieren.
2. Dann pro Fachwert die gemeinsame Datenquelle festlegen.
3. Danach HTML, Worker und Popup-Zuordnungen angleichen.
4. Offene Formel- und Popup-Fragen separat als TODO fuehren, damit sie den Strukturumbau nicht blockieren.

## Projektweite Matrix nach Tabs

Diese Matrix beschreibt weiterhin die **fachlichen Datenbereiche** je Tab.
Sie ist **nicht** mehr die Zielstruktur fuer Popup- und Rolltemplate-Logik.

## Aktueller Stand zu Issue 12

Issue 12 (`Attributszuordnung und Berechnungen`) setzt auf dem abgeschlossenen Datenfeld-Refactor auf.
Nach den bisherigen Issue-12-Schritten gilt:

- `Allgemein` ist keine operative Pflegeflaeche fuer Attribute, Fertigkeiten, Kampf, Verteidigung oder Schadenswiderstand mehr.
- Attribute und Aktionsfertigkeiten werden im Tab `Attribute & Fertigkeiten` gepflegt.
- Gemeinsame Datenquellen fuer Attribute und Fertigkeiten bleiben unveraendert:
  - `sr6_attr_<name>_grundwert/modifikator/gesamtwert`
  - `sr6_skill_<name>_grundwert/modifikator/gesamtwert`
- Issue 12 prueft schrittweise, ob alle sichtbaren Attributszuordnungen dieselben Quellen verwenden und ob berechnete Felder klar als berechnet/manuell angepasst erkennbar werden.
- Besonders relevant fuer Issue 12 sind alle Felder, die aus Attributen und/oder Fertigkeiten abgeleitet werden, aber in der UI nicht immer als berechnet erkennbar sind.
- Aktionsfertigkeiten, Attributsproben, Wissens-/Sprach-/Soft-Felder, Talentsofts, Kampfwerte, Magie-Kernwerte und Matrix-Handlungen sind in diesem Sinne umgesetzt und in der Sandbox bzw. per Code-/Formelabgleich bestaetigt.

| Tab | Fachbereich | Haupt-Wertetypen | Gemeinsame Datenquellen / Muster | Refactor-Status |
| --- | --- | --- | --- | --- |
| Allgemein | Uebersicht / Spiegel | Kontext- und Uebersichtswerte | bestehende Quellen aus den Fach-Tabs | Nach Refactor bewusst keine primaere Pflegeflaeche fuer Attribute, Fertigkeiten oder Kampfwerte |
| Attribute & Fertigkeiten | Attribute | Attribut | `sr6_attr_<name>_grundwert/modifikator/gesamtwert` | Dreiklang vorhanden, numerische Inputs aktiv; Attributsproben und `Attribut x2` sind bestaetigt |
| Attribute & Fertigkeiten | Aktionsfertigkeiten | Fertigkeit | `sr6_skill_<name>_grundwert/modifikator/gesamtwert`, `sr6_skill_<name>_spezialisierung`, `sr6_skill_<name>_expertise` | Dreiklang vorhanden, numerische Inputs aktiv; gemeinsame Quelle fuer alle Skill-Proben; Spezialisierung/Expertise sind in UI, Popup und Poolberechnung umgesetzt |
| Attribute & Fertigkeiten | Wissens-/Sprach-/Soft-Felder | Spezialtyp / Kontextwert / Ersatz-Fertigkeitswert | `sr6_wissensfertigkeit_*`, `sr6_sprachfertigkeit_*`, `sr6_talentsoft_*`, `sr6_wissenssprachsoft_*` | Fachlich getrennt: Wissens-/Sprachfertigkeiten und Wissens-/Sprachsofts wuerfeln auf Erinnerungsvermoegen; Talentsofts wuerfeln auf gewaehltes Attribut + Stufe + Modifikator |
| Kampf | Kernwerte | Kalkulationsfeld, Einzelwert | `sr6_combat_*`, `sr6_verteidigung_*`, `sr6_schadenswiderstand_*` | Issue-12-Pruefung abgeschlossen: `Fernkampfangriff`, `Nahkampfangriff`, `Verteidigung (Physisch)`, `Schadenswiderstand (Physisch)`, `Verteidigungswert` laufen berechnet; `Verteidigungswert` bleibt bewusst Vergleichswert ohne Rollbutton |
| Kampf | Fernkampfwaffen / Nahkampfwaffen | Einzelwert, Kontextwert, berechneter Waffen-Pool | `repeating_sr6fernkampfwaffen_*`, `repeating_sr6nahkampfwaffen_*` | Issue-12-Pruefung abgeschlossen: `Schaden` ist ein numerischer Einzelwert; `Angriffswert` bleibt reichweitenabhaengiger Waffenwert; Waffen-Rollbuttons nutzen je Waffenzeile einen berechneten Pool inkl. passender Spezialisierung/Expertise und zeigen Reichweite/Angriffswert nur als Rolltemplate-Kontext |
| Kampf | Panzerung | Einzelwert / Kontextwert | `repeating_sr6panzerung_*`, `sr6_combat_*` | Issue-12-Pruefung abgeschlossen: Panzerungsrollen werden direkt in `Kampf > Panzerung` zugewiesen; primaere, sekundaere Panzerung, Helm und Schild zaehlen additiv zum Verteidigungswert |
| Magie | Kernwerte | Attribut, Kalkulationsfeld, Einzelwert | `sr6_magic_*`, Attribute-/Skill-Bezug aus `sr6_attr_*` und `sr6_skill_*` | Issue-12-Pruefung abgeschlossen: Spruchzauberei, Beschwoeren, Entzugswiderstand und Astralkampfwerte laufen als dokumentierte Sonderformeln; `A. Verteidigungswert` bleibt bewusst `Intuition + Modifikator` |
| Magie | Zauber / Rituale / Foki / Geister | Einzelwert, Kontextwert, teils eigene Probenlogik | `repeating_sr6zauber_*`, `repeating_sr6rituale_*`, `repeating_sr6foki_*`, `repeating_sr6geister_*` | `Zauber` laufen jetzt ueber ein eigenes `spell_probe`-Modell; `Rituale` bleiben fuer diesen Refactor bewusst Datenfelder ohne Wuerfel |
| Matrix | Kernwerte | Einzelwert, Kalkulationsfeld, Vergleichswert | `sr6_matrix_*` | Issue-12-Pruefung abgeschlossen: ASDF und Overwatch bleiben manuelle Matrix-/Geraetewerte; Matrix-Initiative wird aus Modus abgeleitet; Angriffswert/Verteidigungswert sind Vergleichswerte ohne Rollbutton |
| Matrix | Handlungen | Probe, Verteidigung, Kontextwert | `sr6_matrix_handlung_<name>_probe_wert`, `sr6_matrix_handlung_<name>_verteidigung_auswahl`, `sr6_matrix_handlung_<name>_verteidigung_wert`; Legacy-Dreiklang bleibt kompatibel | Regelwerksmapping umgesetzt: `Handlung`, `Probe`, `Verteidigung` mit getrennten Rollbuttons |
| Matrix | Geraete / Programme / Zubehoer / Komplexe Strukturen / Sprites | Einzelwert / Kontextwert | `repeating_sr6matrixgeraete_*`, `repeating_sr6programme_*`, etc. | Erst nach Gesamtklassifikation verfeinern |
| Rigging | Kernwerte | Einzelwert, Kalkulationsfeld, Vergleichswert | `sr6_rigging_*` | Issue-12-Pruefung abgeschlossen: Riggerkonsolenwerte bleiben manuelle Geraetewerte; Rigging-Initiative wird aus Modus abgeleitet; Angriffswert/Verteidigungswert sind Vergleichswerte ohne Rollbutton |
| Rigging | Fahrzeuge / Programme / Zubehoer / Agenten / Manoever | Einzelwert / Kontextwert | `repeating_sr6fahrzeuge_*`, `repeating_sr6agenten_*`, `repeating_sr6manoever_*` | Fahrzeuge/Drohnen sind inventarisiert: Werte sind aktuell reine Datenfelder; regelkonforme Fahrzeug-/Drohnenproben brauchen spaeter eigene Rollmodelle statt pauschalem Dreiklang |
| Ausruestung | Ausruestung / Cyberware / Bioware | Einzelwert / Kontextwert | `repeating_sr6ausruestung_*`, `repeating_sr6cyberware_*`, `repeating_sr6bioware_*` | Ueberwiegend Einzel-/Kontextwerte; kein pauschaler Dreiklang ohne fachliche Not |
| Leben | Personendaten / SIN / Lebensstil / Connections / Beschreibung | Einzelwert / Kontextwert | `sr6_bio_*`, `repeating_sr6sin_*`, `repeating_sr6lebensstil_*`, `repeating_sr6connections_*`, Textfelder | Tab technisch unter `biographie`; kein kuenstlicher Dreiklang ohne fachliche Not |

## Bereits bestaetigte Referenzmodelle

### 1. Attribute

Kanonisches Schema:

- `sr6_attr_<name>_grundwert`
- `sr6_attr_<name>_modifikator`
- `sr6_attr_<name>_gesamtwert`

Status:

- bereits vorhanden
- in `Attribute & Fertigkeiten > Attribute` gepflegt
- an anderen Stellen nur spiegeln, nicht duplizieren
- numerische Inputs bereits umgestellt
- erster bestaetigter `attribute_probe x2`-Pilot ist bei den `Gesamtwert`-Wuerfeln vorhanden

### 2. Fertigkeiten

Kanonisches Schema:

- `sr6_skill_<name>_grundwert`
- `sr6_skill_<name>_modifikator`
- `sr6_skill_<name>_gesamtwert`

Status:

- bereits vorhanden
- in `Attribute & Fertigkeiten > Fertigkeiten` genutzt
- dieselbe Quelle in allen Ansichten beibehalten
- numerische Inputs bereits umgestellt
- Primaer- und Sekundaerattribute werden im Popup ueber ein Attribut-Dropdown abgebildet
- Spezialisierung und Expertise werden je Fertigkeit gespeichert und koennen direkt aus der Listenansicht gewuerfelt werden
- Spezialisierung addiert `+2` Wuerfel, Expertise addiert `+3` Wuerfel
- Wird Expertise genutzt, wird Spezialisierung nicht zusaetzlich addiert

### 3. Attributsproben

Kanonisches Schema:

- `sr6_attrprobe_<name>`

Status:

- im Bereich `Attribute & Fertigkeiten > Attribute` unterhalb der Attribute ergaenzt
- als normale Proben mit Rollbutton umgesetzt
- aktuelle Proben:
  - `Erinnerungsvermoegen = Logik + Intuition`
  - `Heben/Tragen = Konstitution + Willenskraft`
  - `Menschenkenntnis = Willenskraft + Intuition`
  - `Selbstbeherrschung = Willenskraft + Charisma`

### 4. Wissens-, Sprach- und Soft-Felder

Kanonische Regel fuer Wissens-/Sprachwuerfe:

- Wissensfertigkeiten, Sprachfertigkeiten und Wissens-/Sprachsofts wuerfeln auf `Erinnerungsvermoegen`
- `Erinnerungsvermoegen = Logik + Intuition`

Talentsofts:

- Talentsofts ersetzen Aktionsfertigkeiten fachlich als Soft-Fertigkeit
- Formel: `gewaehltes Attribut + Stufe + Modifikator = Gesamtwert`
- das Attribut wird per Dropdown aus den verwendeten Attributen gewaehlt

Status:

- Wissens-/Sprachfelder zeigen keinen eigenen Dreiklang mehr, sondern den Wert aus Erinnerungsvermoegen
- Talentsofts haben Attributsauswahl, Stufe, Modifikator und berechneten Gesamtwert
- Sandbox-Test fuer diesen Bereich ist bestanden

### 5. Matrix-Handlungen

Aktuelles Schema:

- `sr6_matrix_handlung_<name>_probe_wert`
- `sr6_matrix_handlung_<name>_verteidigung_auswahl`
- `sr6_matrix_handlung_<name>_verteidigung_wert`

Legacy-/Kompatibilitaetsschema:

- `sr6_matrix_handlung_<name>_grundwert`
- `sr6_matrix_handlung_<name>_modifikator`
- `sr6_matrix_handlung_<name>_gesamtwert`

Status:

- bereits vorhanden
- auf Regelwerksmapping aus Probe und Verteidigung umgestellt
- die sichtbare Matrix-Handlungsansicht nutzt `Handlung`, `Probe`, `Verteidigung`
- Probe und Verteidigung haben getrennte berechnete Werte und getrennte Rollbuttons
- variable Verteidigungsformeln werden direkt in der Matrix-Handlungszeile gewaehlt
- `A-Z` ist die Standardansicht; `Gast`, `User` und `Admin` sortieren zunaechst aktive und danach inaktive Handlungen
- der alte Dreiklang wird weiterhin berechnet, aber nicht mehr als primaere Matrix-Handlungsansicht verwendet

### 6. Verteidigung / Schadenswiderstand

Kanonisches Schema:

- `sr6_verteidigung_<name>_grundwert/modifikator/gesamtwert`
- `sr6_schadenswiderstand_<name>_grundwert/modifikator/gesamtwert`

Status:

- bereits vorhanden
- muessen fachlich noch gegen finale Formeln und Popup-Profile gespiegelt werden
- numerische Inputs bereits umgestellt

### 7. Erste berechnete Kampf-Kernwerte

Aktueller technischer Stand:

- `sr6_combat_fernkampfangriff_grundwert = gewaehlte Fernkampf-Fertigkeit + sr6_attr_geschicklichkeit_gesamtwert`
- `sr6_combat_projektilwaffen_grundwert = sr6_skill_athletik_gesamtwert + sr6_attr_geschicklichkeit_gesamtwert`
- `sr6_combat_nahkampfangriff_grundwert = gewaehlte Nahkampf-Fertigkeit + gewaehltes Nahkampf-Attribut`
- `sr6_verteidigung_physisch_grundwert = sr6_attr_reaktion_gesamtwert + sr6_attr_intuition_gesamtwert`
- `sr6_schadenswiderstand_physisch_grundwert = sr6_attr_konstitution_gesamtwert`
- `sr6_combat_verteidigungswert_grundwert = sr6_attr_konstitution_gesamtwert + sr6_combat_primaere_panzerung + sr6_combat_sekundaere_panzerung + sr6_combat_helm + sr6_combat_schild`

Dabei gilt jeweils:

- `gesamtwert = grundwert + modifikator`
- bestehende Legacy-Gesamtfelder fuer die Kampfangriffe werden aktuell synchron gehalten, damit Roll- und Popup-Bindings kompatibel bleiben
- `Primäre Panzerung`, `Sekundäre Panzerung`, `Helm` und `Schild` werden technisch als numerische Bonuswerte fuer die Berechnung gespeichert; ihre Zuweisung erfolgt direkt ueber die Rollenwahl in `Kampf > Panzerung`
- Bei `Exotische Waffen` wird als Fertigkeitsanteil `sr6_skill_exotische_waffen_gesamtwert` verwendet.

## Phase 1: Zielmatrix fuer Kampf-Formeln

Diese Matrix trennt bewusst:

- **Wuerfelpool / Probe**
- **Angriffswert**
- **Verteidigungswert**
- **Schaden**

Das ist fuer den weiteren Refactor wichtig, weil diese Begriffe im Sheet aktuell teilweise noch nebeneinanderlaufen, im Regelwerk aber unterschiedliche Aufgaben haben.

| Fachwert | Wertetyp | Ziel-Formel / Regel | Quelle im Sheet | Status |
| --- | --- | --- | --- | --- |
| `Fernkampfangriff` | Kalkulationsfeld | gewaehlte Fernkampf-Fertigkeit (`Feuerwaffen`, `Projektilwaffen` via `Athletik`, oder `Exotische Waffen`) + `Geschicklichkeit (Gesamtwert)` | `sr6_combat_fernkampfangriff_grundwert/modifikator/gesamtwert` | Code ist auf Fertigkeitsauswahl ausgelegt; fachliche Attributszuordnung bleibt fuer Issue 12 pruefbar |
| `Projektilwaffen` | Kalkulationsfeld | `Athletik (Gesamtwert) + Geschicklichkeit (Gesamtwert)` | `sr6_combat_projektilwaffen_grundwert/modifikator/gesamtwert` | Eigener Kernwert vorhanden |
| `Nahkampfangriff` | Kalkulationsfeld | `gewaehlte Nahkampf-Fertigkeit (Gesamtwert) + gewaehltes Attribut der primaeren Nahkampfwaffe` | `sr6_combat_nahkampfangriff_grundwert/modifikator/gesamtwert` | Im Sheet jetzt an `Fertigkeit` und `Attribut` der primaeren Nahkampfwaffe gekoppelt |
| `Verteidigung (Physisch)` | Kalkulationsfeld | `Reaktion (Gesamtwert) + Intuition (Gesamtwert)` | `sr6_verteidigung_physisch_grundwert/modifikator/gesamtwert` | Regel und Code sind konsistent |
| `Schadenswiderstand (Physisch)` | Kalkulationsfeld | `Konstitution (Gesamtwert)` | `sr6_schadenswiderstand_physisch_grundwert/modifikator/gesamtwert` | Regel und Code sind konsistent |
| `Verteidigungswert` | Kalkulationsfeld | `Konstitution (Gesamtwert) + Verteidigungswertbonus durch Panzerung und Ausruestung` | `sr6_combat_verteidigungswert_grundwert/modifikator/gesamtwert` | Im Sheet aktuell umgesetzt als `Konstitution + Primaer + Sekundaer + Helm + Schild`; dieser Sheet-Stand bleibt bewusst erhalten |
| `Fernkampfwaffen: Angriffswert` | Kontextwert / Waffenwert | reichweitenabhaengige Waffenwerte `S. Nah / Nah / Mittel / Weit / S. Weit`; kein eigener Wuerfelpool | `repeating_sr6fernkampfwaffen_*` | Bewusst kein Dreiklang; Werte werden pro Waffe gepflegt |
| `Nahkampfwaffen: Angriffswert` | Kontextwert / Waffenwert | Waffen-Angriffswert pro Reichweite; das Sheet behandelt die eingetragenen Werte weiterhin als Endwerte | `repeating_sr6nahkampfwaffen_*` | Die Waffe fuehrt jetzt zusaetzlich `Schadenstyp` und das verwendete `Attribut`; die Reichweitenwerte bleiben vorerst manuell gepflegte Endwerte |
| `Fernkampfwaffen: Waffen-Pool` | Kalkulationsfeld je Repeating-Zeile | `Geschicklichkeit (Gesamtwert) + gewaehlte Fernkampf-Fertigkeit + passender Spezialisierungs-/Expertisebonus`; `Projektilwaffen` nutzt `Athletik`, `Exotische Waffen` nutzt `Exotische Waffen`, sonst `Feuerwaffen` | `repeating_sr6fernkampfwaffen_*_sr6_fernkampf_pool` | Wird versteckt berechnet und von allen Reichweiten-Rollbuttons der jeweiligen Waffe als Pool verwendet; Waffentyp wird gegen Spezialisierung/Expertise der verwendeten Fertigkeit abgeglichen |
| `Nahkampfwaffen: Waffen-Pool` | Kalkulationsfeld je Repeating-Zeile | `gewaehltes Attribut + gewaehlte Nahkampf-Fertigkeit + passender Spezialisierungs-/Expertisebonus`; `Exotische Waffen` nutzt `Exotische Waffen`, sonst `Nahkampf` | `repeating_sr6nahkampfwaffen_*_sr6_nahkampf_pool` | Wird versteckt berechnet und von allen Reichweiten-Rollbuttons der jeweiligen Waffe als Pool verwendet; Waffentyp wird gegen Spezialisierung/Expertise der verwendeten Fertigkeit abgeglichen |
| `Fernkampfwaffen: Schaden` | Einzelwert | numerischer Einzelwert; kann durch Munition oder Popup modifiziert werden | `repeating_sr6fernkampfwaffen_*` | Festgelegt |
| `Nahkampfwaffen: Schaden` | Einzelwert | numerischer Einzelwert mit zusaetzlichem `Schadenstyp`-Kontext | `repeating_sr6nahkampfwaffen_*` | Festgelegt; `Schadenstyp` wird getrennt gefuehrt |
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

### Stand der generischen Roll-Fallbacks

Die heutigen Live-Buttons des Sheets laufen mittlerweile ueberwiegend ueber explizite Modelle:

- `attribute_probe`
- `skill_probe`
- `initiative_probe`
- `defense_probe`
- `combat_attack_probe`
- `value_probe`
- `matrix_action`
- `spell_probe`

Die generischen Definitionen `value`, `weapon` und `fallback` bleiben damit vor allem als technisches Sicherheitsnetz erhalten.
Sie werden aktuell nicht mehr als eigentliche Zielarchitektur behandelt.

Einzelne Restfaelle werden dabei schrittweise aus den breiteren Sammelpfaden herausgezogen.
Aktueller Stand:

- `Matrix`- und `Rigging`-`Angriffswert` sowie `Verteidigungswert` haben jetzt eigene explizite Resolver-Faelle vor dem allgemeineren `matrix_value` / `rigging_value`

### Referenzmodell `combat_attack_probe`

`combat_attack_probe` ist fuer diesen Refactor das Referenzmodell fuer kampforientierte Waffen- und Angriffswuerfe.

Es deckt aktuell diese vier Formen ab:

- globale Fernkampfprobe
- globale Nahkampfprobe
- Fernkampfwaffen als Repeating-/Kontextfaelle
- Nahkampfwaffen als Repeating-/Kontextfaelle

Gemeinsame Eigenschaften:

- verwendet das Waffen-Layout im Rolltemplate
- trennt bewusst `Pool`, `Angriffswert` und `Schaden`
- fuehrt Waffenkontext wie `Waffe`, `Reichweite` und je nach Fall `Munition`, `Attribut`, `Schadenstyp`
- kann abgeleitete Anzeigezeilen fuer `Angriffswert` und `Schaden` ausgeben

Fernkampf-Auspraegung:

- Popup mit Sicht, Bewegung, Modifikator und Munition
- `Munition` bleibt kontextrelevant

Nahkampf-Auspraegung:

- Popup mit Sicht, Bewegung, Modifikator und `Attribut`
- `Attribut` kann im Popup als Fallback den Attributanteil des Pools umschalten
- `Schadenstyp` wird getrennt mitgefuehrt

Damit ist `combat_attack_probe` fuer diesen Refactor funktional gesetzt; spaetere Arbeiten betreffen vor allem die Regelwerkspruefung einzelner Attributs-/Fertigkeitszuordnungen und UX-Feinschliff.

### Bestaetigter Abschlussstand fuer Kampf

Der Kampfbereich ist fuer Issue 12 funktional abgeschlossen:

- `Fernkampfangriff`, `Nahkampfangriff`, `Verteidigung (Physisch)` und `Schadenswiderstand (Physisch)` laufen als Wuerfelpool-Proben
- `Verteidigungswert` bleibt ein Vergleichswert und wird nicht als Probe behandelt
- reichweitenabhaengige Waffenwerte in Fern- und Nahkampf bleiben Angriffswert-Kontextwerte
- Waffen-Rollbuttons in Fern- und Nahkampf nutzen je Waffenzeile einen berechneten Pool; Reichweitenwerte werden im Rolltemplate als `Angriffswert` ausgegeben
- `Schaden` bleibt ein numerischer Einzelwert
- Nahkampf fuehrt zusaetzlich `Schadenstyp` und `Attribut`
- der globale `Nahkampfangriff` liest `Fertigkeit` und `Attribut` der primaeren Nahkampfwaffe
- die Nahkampf-Popups fuehren `Attribut` als Fallback und koennen den Attributanteil des Pools vor dem Wurf umschalten
- `Projektilwaffen` ist als eigener Kernwert vorhanden und verwendet `Geschicklichkeit + Athletik`.
- `Exotische Waffen` wird in Kampfberechnungen als eigene Fertigkeitsauswahl beruecksichtigt.
- Waffen-Rollbuttons beruecksichtigen passende Spezialisierung (+2) oder Expertise (+3), wenn Waffentyp und Spezialisierung/Expertise 1:1 uebereinstimmen. Expertise ersetzt den Spezialisierungsbonus und wird nicht zusaetzlich zu +2 gestapelt.

Nicht Teil dieses Kampf-Abschlusses sind spaetere allgemeine UX-Feinarbeit und die projektweite Popup-Konsolidierung.

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

`Schaden` ist dabei jetzt fachlich als **bewusster numerischer Einzelwert** eingeordnet. Die reichweitenabhaengigen Waffenfelder repraesentieren den **Angriffswert** und bleiben deshalb getrennt von `Schaden` und vom berechneten Waffen-Pool.

### 2. Spiegel zwischen Allgemein und Fach-Tab

Historisch erschienen mehrere Werte in:

- `Allgemein`
- Fach-Tab (`Fertigkeiten`, `Kampf`, etc.)

Nach dem UI-Refactor ist `Allgemein` deutlich reduziert. Fuer verbleibende Spiegel gilt weiterhin:

- niemals neue Parallelattribute anlegen
- immer dieselbe Datenquelle aus dem Fach-Tab verwenden
- Issue 12 prueft vor allem, ob Attributszuordnungen und Berechnungsfelder diese Regel sichtbar einhalten

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

1. **Gemeinsame Datenquellen fuer Attribute/Fertigkeiten erhalten**
2. **Attributszuordnungen sichtbarer Proben gegen Regelwerk und UI pruefen**
3. **Berechnete Felder und manuelle Eingriffe sichtbar kennzeichnen**
4. **Popup- und Rolltemplate-Profile nur nach gezieltem Audit weiter vereinheitlichen**
5. **Repeating- und Kontextwerte selektiv nachziehen**

## Naechste konkreten Umbauten

1. Issue 12: Attributszuordnung, Berechnungsfelder und Indikatoren pruefen
2. Bestehende Dreiklaenge in Folgearbeiten fachlich gegen Regelwerk pruefen
3. Popup-Logik separat nach `docs/refactoring/popup-logic-audit.md` auditieren
4. Offene Kampf- und Waffen-Sonderfaelle separat ueber GitHub-Issues und Refactor-Doku nachhalten

## Issue-12 Startmatrix

Fuer Issue 12 sollte zuerst keine neue Logik gebaut werden. Startpunkt ist eine Inventur:

| Bereich | Prueffrage | Erwartung |
| --- | --- | --- |
| Attribute & Fertigkeiten / Attribute | Nutzen alle Attributanzeigen `sr6_attr_<name>_grundwert/modifikator/gesamtwert`? | Keine parallelen Attributquellen |
| Attribute & Fertigkeiten / Fertigkeiten | Nutzen alle Aktionsfertigkeiten `sr6_skill_<name>_grundwert/modifikator/gesamtwert`? | Keine parallelen Skillquellen |
| Wissens-/Sprach-/Soft-Felder | Ist klar, welche Felder eigene Werte fuehren und welche Attributszuordnung fuer Proben gilt? | Offene Attributszuordnungen explizit dokumentieren |
| Kampf-Kernwerte | Sind Attributs- und Fertigkeitsanteile sichtbar/nachvollziehbar? | Berechnete Felder markieren; manuelle Modifikatoren klar trennen |
| Magie-Kernwerte | Sind Traditionsattribute, Astralkampfwerte und Entzug sauber auf Attribute/Fertigkeiten abgebildet? | Berechnete Felder markieren; Attributsquellen pruefen |
| Matrix-/Rigging-Kernwerte | Sind Modus, Matrixattribute und abgeleitete Initiative/Defensivwerte nachvollziehbar? | Berechnete Felder markieren; manuelle Geraetewerte getrennt halten |
| Matrix-Handlungen | Sind Grundwert, Modifikator und Gesamtwert fachlich ausreichend oder braucht es Attributs-/Fertigkeitsmapping? | Abgeschlossen: Matrix-Handlungen nutzen jetzt getrenntes Probe-/Verteidigungs-Mapping; Legacy-Dreiklang bleibt nur kompatibel |

### Regelwerksgrundlage fuer Issue 12

Aus dem Grundregelwerk ergibt sich fuer die naechste Pruefung:

- Der normale Wuerfelpool entsteht in den meisten Faellen aus `Attribut + Fertigkeit`.
- Beide Werte werden addiert und ergeben die Anzahl der zu werfenden W6.
- `5` und `6` zaehlen als Erfolge.
- Modifikatoren veraendern den Wuerfelpool situationsabhaengig.
- Fertigkeiten haben ein Primaerattribut; wenn ein sekundaeres verknuepftes Attribut angegeben ist, kann dieses fuer passende Kontextfaelle verwendet werden.
- Manche Proben sind Sonderfaelle und nutzen zwei Attribute, dasselbe Attribut doppelt oder eigene Werte.
- Initiative ist ein Sonderfall: Sie nutzt einen Initiativewert plus Initiativewuerfel und addiert die Augenzahlen statt Erfolge zu zaehlen.

Fuer das Sheet bedeutet das als Zielmodell:

```text
Attribut (Grundwert + Modifikator)
+ Fertigkeit (Grundwert + Modifikator)
+ Situations-/Popup-Modifikator
= Wuerfelpool
```

Die technische Basis ist bereits vorhanden:

- `sr6_attr_<name>_gesamtwert = sr6_attr_<name>_grundwert + sr6_attr_<name>_modifikator`
- `sr6_skill_<name>_gesamtwert = sr6_skill_<name>_grundwert + sr6_skill_<name>_modifikator`
- `buildProbeComputation()` wuerfelt den finalen Pool als W6 und zaehlt `die >= 5` als Erfolg
- der Zustandsmonitor wird als globaler Poolmodifikator beruecksichtigt
- Popup-Modifikatoren werden erst beim Wurf auf den Pool addiert

### Issue-12 Pruefbefund Probenmodelle

| Probenmodell / Bereich | Aktueller Stand | Issue-12-Befund | Naechster Schritt |
| --- | --- | --- | --- |
| `attribute_probe` | Nutzt einen Attribut-Gesamtwert als Pool; optional `Attribut x2`; Popup-Modifikator wird addiert | Fuer reine Attributproben und `Attribut x2` passend; kein Standardmodell fuer `Attribut + Fertigkeit` | Beibehalten, aber klar als Attribut-/Sonderprobe behandeln |
| `skill_probe` | Aktionsfertigkeiten nutzen ein Attribut-Dropdown im Popup; Popup-Skill-Modifikator, Spezialisierung und Expertise werden addiert | Fuer Aktionsfertigkeiten jetzt regelkonform als `gewaehltes Attribut + Fertigkeitswert + Modifikatoren` umgesetzt; Sandbox-Test und Matrix-Abgleich bestanden | Fuer Wissens-/Sprach-/Soft-Felder separat entscheiden, ob und welche Attributszuordnung gewuenscht ist |
| Attribute & Fertigkeiten / Aktionsfertigkeiten | `grundwert + modifikator = gesamtwert` bleibt der Fertigkeitswert; der Rollbutton baut daraus plus gewaehltem Attribut den Pool | Datenquelle ist korrekt und wird im Popup zur vollstaendigen Standardprobe erweitert | Beibehalten; keine parallelen Skillquellen einfuehren |
| Wissens-/Sprach-/Soft-Felder | Wissens-/Sprach-/Wissenssprachsofts zeigen `Name` und den berechneten `Wert = Erinnerungsvermoegen`; Talentsofts berechnen `Attribut + Stufe + Modifikator` | Erinnerungsvermoegen ist als Attributsprobe `Logik + Intuition` umgesetzt; Talentsofts sind eigener Ersatz-Fertigkeitsfall | Wissen/Sprache bleibt ohne eigenen Dreiklang; Talentsofts optional spaeter um Soft-Typ/Aktionsfertigkeit erweitern |
| `combat_attack_probe` / Kampf-Kernwerte | Fernkampf, Projektilwaffen und Nahkampf berechnen bereits `Attribut + Fertigkeit + Modifikator` in den Kernwerten | Grundmechanik passt fuer die globalen Kampf-Kernwerte; Waffen-Rollbuttons muessen weiterhin gegen dieselbe Poolquelle geprueft werden | Waffen-Sonderfaelle separat ueber vorhandene Kampf-/Waffen-Issues nachziehen |
| `spell_probe` / Zauber | Spruchzauberei nutzt `Magie + Hexerei/Zauberpool + Modifikatoren`; Entzug laeuft getrennt als `Zauber-Entzug + Popup-Anpassungen - Entzugswiderstands-Erfolge` | Passt als magischer Sonderfall: eigener Hauptwurf plus Entzugswiderstand; Entzugsschaden wird als `Betäubung` oder `Körperlich` ausgewiesen; Kernwerte-Button nutzt dasselbe Popup wie konkrete Zauber | Zauber-Sonderregeln, die nicht aus den aktuellen Feldern ableitbar sind, bleiben ueber `Entzug-Modifikator` oder spaetere Zusatzfelder zu erfassen |
| `summoning_probe` / Geister | Beschwoeren nutzt `Magie + Beschwoeren + Modifikatoren`; Geist widersteht mit `Kraftstufe x 2`; Entzug entspricht den Geister-Erfolgen plus Entzugsmodifikator | Regelkonformer Herbeirufen-Sonderfall fuer Dienste und Entzug; Popup bietet Erd-, Feuer-, Luft-, Menschen-, Tier- und Wassergeister sowie Beschuetzergeister, Helfergeister, Pflanzengeister und Ratgebergeister | `Besessenheit` aktiviert eine einfache Objektwiderstands-Gegenprobe: `Geist-Erfolge aus Kraftstufe x 2 - Objektwiderstand-Erfolge`, Minimum 0; Verbannen braucht eigene Aktion, weil Entzug dort anders skaliert |
| Magie-Kernwerte / Astralkampf | Mehrere Werte sind berechnete Sonderfaelle aus Attributen/Fertigkeiten, z. B. Waffenloser Kampf aus `Astral + Willenskraft` | Issue-12-Pruefung abgeschlossen; Formeln sind einzeln dokumentiert | Beibehalten; keine pauschale Standardprobe erzwingen |
| Magie gesamt | Magie-Kernwerte, Zauber, Geister und Rituale sind fachlich fuer Issue 12 abgeschlossen | Regelwerksmechanik und Popup-Anforderungen sind umgesetzt bzw. bewusst abgegrenzt | Das Rolltemplate bleibt als globale Aufgabe fuer alle Wuerfeloptionen offen und wird nicht mehr als Magie-spezifischer Block gefuehrt |
| `defense_probe` | Nutzt berechnete Verteidigungs-/Widerstandswerte als Pool und zeigt Vergleichswerte | Verteidigung und Widerstand sind Sonderfaelle; nicht blind in `Attribut + Fertigkeit` pressen | Jede Verteidigungsart gegen Regelwerk pruefen, aber Modell als Sonderprobe beibehalten |
| `matrix_action` | Matrix-Handlungen nutzen `SR6_MATRIX_ACTION_RULES` fuer Probe und Verteidigung; variable Verteidigungen werden in der Handlungszeile gewaehlt | Regelwerksmapping ist umgesetzt; Probe und Verteidigung sind getrennt rollbar | Restfaelle mit Zielwerten wie `Pilot`, `Geraetestufe` oder `Cyberware-Geraetestufe` spaeter als eigene Zielwertfelder entscheiden |
| Matrix-/Rigging-Kernwerte | Matrixattribute/Geraetewerte sind teils manuelle Werte; Initiative nutzt Modus-Sonderlogik | Issue-12-Pruefung abgeschlossen; ASDF-/Riggerkonsolenwerte bleiben manuell, Initiative ist berechnet, Angriffs-/Verteidigungswerte sind Vergleichswerte | Beibehalten; keine pauschale Dreiklang-Umstellung |
| `initiative_probe` | Nutzt `Basis + W6` und addiert Augenzahlen | Regelkonformer Sonderfall, nicht Teil von `Attribut + Fertigkeit` | Beibehalten |
| `value_probe` / Fallback | Nutzt Einzelwerte als Pool oder Vergleichswert | Technisches Sicherheitsnetz, kein fachliches Zielmodell fuer Standardproben | Nicht weiter ausbauen; Restfaelle gezielt in echte Modelle ueberfuehren |

### Issue-12 Pruefbefund Magie-Kernwerte

Grundlage fuer die Magie-Kernwerte ist das Regelwerksmuster aus Magieprobe, Entzug und Astralkampf. Magische Fertigkeitsproben sind keine einfachen Einzelwerte, sondern verwenden `Magie` plus die passende Fertigkeit; Astralkampfwerte bleiben dokumentierte Sonderformeln.

| Feld | Soll-Formel | Sheet-Quelle | Status / Hinweis |
| --- | --- | --- | --- |
| `Magie` | `Magie/Resonanz + Modifikator` | `sr6_attr_magie_resonanz_gesamtwert + sr6_magic_magie_modifikator` | Berechneter Magie-Kernwert |
| `Hexerei` / `Zauberpool` | `Hexerei + Modifikator` | `sr6_skill_hexerei_gesamtwert + sr6_magic_zauberpool_modifikator` | Komponentenwert fuer Spruchzauberei |
| `Spruchzauberei` | `Magie + Hexerei + Modifikator` | `sr6_magic_magie + sr6_magic_zauberpool + sr6_magic_spruchzauberei_modifikator` | Regelwerksnaher Zauberpool |
| `Beschwoeren` | `Magie + Beschwoeren + Modifikator` | `sr6_magic_magie + sr6_skill_beschwoeren_gesamtwert + sr6_magic_beschwoeren_modifikator` | Von reinem Fertigkeitswert auf Magieprobe umgestellt |
| `Entzugswiderstand` | `Traditionsattribut + Willenskraft + Modifikator` | `Wert(sr6_magic_traditionsattribut_1) + sr6_attr_willenskraft_gesamtwert + sr6_magic_entzug_widerstand_modifikator` | `Traditionsattribut 2` wird nicht mehr verwendet und ist aus der UI entfernt |
| `Waffenloser Kampf` | `Astral + Willenskraft + Modifikator` | `sr6_skill_astral_gesamtwert + sr6_attr_willenskraft_gesamtwert + sr6_magic_waffenloser_kampf_modifikator` | Astralkampf-Sonderformel |
| `A. Verteidigung` | `Logik + Intuition + Modifikator` | `sr6_attr_logik_gesamtwert + sr6_attr_intuition_gesamtwert + sr6_magic_astrale_verteidigung_modifikator` | Astrale Verteidigungsprobe |
| `A. Schadenswiderstand` | `Willenskraft + Modifikator` | `sr6_attr_willenskraft_gesamtwert + sr6_magic_astraler_schadenswiderstand_modifikator` | Astraler Schadenswiderstand |
| `A. Angriffswert` | `Magie + Traditionsattribut + Modifikator` | `sr6_attr_magie_resonanz_gesamtwert + Wert(sr6_magic_traditionsattribut_1) + sr6_magic_astralkampf_angriffswert_modifikator` | Astralkampf-Vergleichswert |
| `A. Verteidigungswert` | `Intuition + Modifikator` | `sr6_attr_intuition_gesamtwert + sr6_magic_astralkampf_verteidigungswert_modifikator` | Bewusste Sheet-Entscheidung; natuerliche Panzerung/Panzerungseffekte werden nicht als eigene Felder gefuehrt |

### Issue-12 Pruefbefund Matrix-/Rigging-Kernwerte

Matrix- und Rigging-Kernwerte enthalten bewusst mehr manuelle Geraete- und Vergleichswerte als klassische `Attribut + Fertigkeit`-Proben. ASDF-Werte, Riggerkonsolenwerte, Angriffswert, Verteidigungswert und Overwatch sind daher keine Dreiklaenge. Gewuerfelt werden nur echte Proben-/Widerstandswerte; Initiative bleibt ein eigener Sonderwurf.

| Bereich | Feld | Soll-Logik | Sheet-Quelle | Status / Hinweis |
| --- | --- | --- | --- | --- |
| Matrix | `Angriff`, `Schleicher`, `Datenverarbeitung`, `Firewall` | Manuelle Matrixattribute des aktiven Geraets / der Persona | `sr6_matrix_angriff`, `sr6_matrix_schleicher`, `sr6_matrix_datenverarbeitung`, `sr6_matrix_firewall` | Bleiben manuelle Einzelwerte |
| Matrix | `Overwatch` | Manuell gefuehrter Overwatch-Wert | `sr6_matrix_overwatch` | Kein Standard-Wuerfelpool |
| Matrix | `Matrix-Initiative` | AR: `Reaktion + Intuition + 1W6`; VR: `Datenverarbeitung + Intuition + 2W6/3W6` | `sr6_matrix_modus`, `sr6_matrix_datenverarbeitung`, Attribute `Reaktion`, `Intuition` | Regelkonformer Initiative-Sonderfall |
| Matrix | `Angriffswert`, `Verteidigungswert` | Vergleichswerte fuer Edge-/Kontextvergleich | `sr6_matrix_angriffswert`, `sr6_matrix_verteidigungswert` | Keine Rollbuttons mehr |
| Matrix | `Matrix Verteidigung`, `Matrix Schadenswiderstand`, `Biofeedback Schadenswiderstand` | Proben-/Widerstandswerte, die im Rolltemplate den Verteidigungswert als Vergleichswert zeigen | `sr6_matrix_verteidigung`, `sr6_matrix_schadenswiderstand`, `sr6_matrix_biofeedback_schadenswiderstand` | Bleiben rollbar als Sonderproben |
| Rigging | `Angriff`, `Schleicher`, `Datenverarbeitung`, `Firewall`, `Overwatch` | Manuelle Riggerkonsolen-/Matrixwerte | `sr6_rigging_*` | Bleiben manuelle Einzelwerte |
| Rigging | `Rigging-Initiative` | AR: `Reaktion + Intuition + 1W6`; VR im aktuellen Sheet: `Datenverarbeitung + Intuition + 2W6/3W6` | `sr6_rigging_modus`, `sr6_rigging_datenverarbeitung`, Attribute `Reaktion`, `Intuition` | Passt fuer WiFi-/Riggerkonsolen-VR; hineingesprungen per Kabel ohne Riggerkonsole wird aktuell nicht separat modelliert |
| Rigging | `Angriffswert`, `Verteidigungswert` | Vergleichswerte fuer Fahrzeug-/Rigging-Kontext | `sr6_rigging_angriffswert`, `sr6_rigging_verteidigungswert` | Keine Rollbuttons mehr |
| Rigging | `Matrix Verteidigung`, `Matrix Schadenswiderstand`, `Biofeedback Schadenswiderstand` | Proben-/Widerstandswerte, die im Rolltemplate den Verteidigungswert als Vergleichswert zeigen | `sr6_rigging_matrix_verteidigung`, `sr6_rigging_matrix_schadenswiderstand`, `sr6_rigging_biofeedback_schadenswiderstand` | Bleiben rollbar als Sonderproben |

### Issue-12 Attributsmapping fuer Aktionsfertigkeiten

Dieses Mapping ist die Grundlage, um `skill_probe` von einem reinen Fertigkeitswurf zu einer vollstaendigen Standardprobe auszubauen.
Primaerattribute werden als Default genutzt. Das Popup zeigt ein Attribut-Dropdown mit dem Primaerattribut als Vorauswahl und zusaetzlichen Sekundaerattributen als Alternativen, wenn sie laut Fertigkeitsbeschreibung vorhanden sind.

| Fertigkeit | Primaerattribut | Primaerquelle | Sekundaerattribut | Sekundaerquelle | Kontext |
| --- | --- | --- | --- | --- | --- |
| Astral | Intuition | `sr6_attr_intuition_gesamtwert` | Willenskraft | `sr6_attr_willenskraft_gesamtwert` | Sekundaer fuer Astralkampf |
| Athletik | Geschicklichkeit | `sr6_attr_geschicklichkeit_gesamtwert` | Staerke | `sr6_attr_staerke_gesamtwert` | Sekundaer bei Kraft-/Widerstandsfaellen; Projektil-/Wurfwaffen bleiben primaer `Athletik + Geschicklichkeit` |
| Beschwoeren | Magie | `sr6_attr_magie_resonanz_gesamtwert` | - | - | Magie-/Resonanz-Feld wird hier fachlich als `Magie` gelesen |
| Biotech | Logik | `sr6_attr_logik_gesamtwert` | Intuition | `sr6_attr_intuition_gesamtwert` | Sekundaer fuer unkonventionelle/ungeplante medizinische Loesungen |
| Cracken | Logik | `sr6_attr_logik_gesamtwert` | - | - | Matrix-Sonderhandlungen koennen spaeter trotzdem eigene Mappingregeln brauchen |
| Einfluss | Charisma | `sr6_attr_charisma_gesamtwert` | Logik | `sr6_attr_logik_gesamtwert` | Sekundaer fuer sachliche Argumentation |
| Elektronik | Logik | `sr6_attr_logik_gesamtwert` | Intuition | `sr6_attr_intuition_gesamtwert` | Sekundaer fuer schnelle Bastelloesungen |
| Exotische Waffen | Geschicklichkeit | `sr6_attr_geschicklichkeit_gesamtwert` | - | - | Fuer Kampf bereits als Fertigkeitsauswahl vorgesehen |
| Feuerwaffen | Geschicklichkeit | `sr6_attr_geschicklichkeit_gesamtwert` | - | - | Fuer Kampf bereits als Fertigkeitsauswahl vorgesehen |
| Heimlichkeit | Geschicklichkeit | `sr6_attr_geschicklichkeit_gesamtwert` | - | - | Keine explizite Sekundaerquelle in der Fertigkeitsbeschreibung |
| Hexerei | Magie | `sr6_attr_magie_resonanz_gesamtwert` | - | - | Magie-/Resonanz-Feld wird hier fachlich als `Magie` gelesen |
| Mechanik | Logik | `sr6_attr_logik_gesamtwert` | Geschicklichkeit / Intuition | `sr6_attr_geschicklichkeit_gesamtwert` / `sr6_attr_intuition_gesamtwert` | Geschicklichkeit fuer Schloesser; Intuition fuer Improvisieren |
| Nahkampf | Geschicklichkeit | `sr6_attr_geschicklichkeit_gesamtwert` | - | - | Kampfwaffen duerfen bereits per Waffen-/Popup-Kontext auf Staerke wechseln; kein allgemeines Sekundaerattribut in der Fertigkeitsbeschreibung |
| Natur | Intuition | `sr6_attr_intuition_gesamtwert` | - | - | Keine explizite Sekundaerquelle in der Fertigkeitsbeschreibung |
| Steuern | Reaktion | `sr6_attr_reaktion_gesamtwert` | - | - | Fahrzeug-/Rigging-Sonderfaelle spaeter separat pruefen |
| Tasken | Resonanz | `sr6_attr_magie_resonanz_gesamtwert` | - | - | Magie-/Resonanz-Feld wird hier fachlich als `Resonanz` gelesen |
| Ueberreden | Charisma | `sr6_attr_charisma_gesamtwert` | - | - | Keine explizite Sekundaerquelle in der Fertigkeitsbeschreibung |
| Verzaubern | Magie | `sr6_attr_magie_resonanz_gesamtwert` | - | - | Magie-/Resonanz-Feld wird hier fachlich als `Magie` gelesen |
| Wahrnehmung | Intuition | `sr6_attr_intuition_gesamtwert` | Logik | `sr6_attr_logik_gesamtwert` | Sekundaer fuer Mustererkennung |

Umsetzungsregel fuer `skill_probe`:

- Der angezeigte Fertigkeitswert bleibt `sr6_skill_<name>_gesamtwert`.
- Der Standard-Wuerfelpool wird `ausgewaehltes Attribut-Gesamtwert + Fertigkeits-Gesamtwert + Popup-Modifikatoren`.
- Das Popup bietet fuer Aktionsfertigkeiten ein Attribut-Dropdown an.
- Die Dropdown-Vorauswahl ist immer das Primaerattribut der Fertigkeit.
- Die Dropdown-Optionen bestehen aus Primaerattribut plus den im Regelwerk genannten Sekundaerattributen.
- Fertigkeiten ohne Sekundaerattribut zeigen nur das Primaerattribut; das Dropdown kann dann technisch entfallen oder als nicht wechselbare Anzeige umgesetzt werden.
- Spezialisierung und Expertise bleiben Popup-Modifikatoren auf den Pool.
- Kontextfaelle werden nicht blind automatisch gewaehlt; die Auswahl erfolgt durch den Spieler im Popup.
- Magie/Resonanz nutzt technisch dasselbe Sheet-Feld, muss im Rolltemplate aber fachlich mit dem passenden Label ausgegeben werden.

Beispiel:

- `Athletik` nutzt standardmaessig `Geschicklichkeit`.
- Das Popup-Dropdown ist auf `Geschicklichkeit` vorausgewaehlt.
- Als weitere Option steht `Staerke` zur Verfuegung.
- Der Wuerfelpool wird aus der gewaehlten Attributquelle plus `sr6_skill_athletik_gesamtwert` gebildet.

### Issue-12 Attributsproben: umgesetzter Stand

Diese Proben werden wie normale Erfolgsproben behandelt, nutzen aber zwei Attribute statt `Attribut + Fertigkeit`.
Sie liegen im Tab `Attribute & Fertigkeiten` unter `Attribute`.

| Probe | Formel | Sheet-Feld |
| --- | --- | --- |
| Erinnerungsvermoegen | `Logik + Intuition` | `sr6_attrprobe_erinnerungsvermoegen` |
| Heben/Tragen | `Konstitution + Willenskraft` | `sr6_attrprobe_heben_tragen` |
| Menschenkenntnis | `Willenskraft + Intuition` | `sr6_attrprobe_menschenkenntnis` |
| Selbstbeherrschung | `Willenskraft + Charisma` | `sr6_attrprobe_selbstbeherrschung` |

### Issue-12 Wissens-/Sprach-/Soft-Felder: Pruefbefund und Umsetzung

Regelwerksquelle fuer diese Einordnung:

- Grundregelwerk S. 70: Wissens- und Sprachfertigkeiten bei der Charaktererschaffung
- Grundregelwerk S. 100: Wissensfertigkeiten und Sprachfertigkeiten
- Grundregelwerk S. 271-272: Datensofts, Talentsofts, Linguasofts und Wissenssofts
- Dauerhafter Text-Export fuer lokale Suche: `docs/Shadowrun 6D - Grundregelwerk 2024.txt`

Aktueller technischer Stand im Sheet:

- `repeating_sr6wissensfertigkeiten`, `repeating_sr6sprachfertigkeiten` und `repeating_sr6wissenssprachsofts` zeigen in der UI nur `Name` und `Wert`.
- Der angezeigte `Wert` dieser drei Bereiche wird technisch in `*_gesamtwert` gespiegelt und entspricht `Erinnerungsvermoegen = Logik + Intuition`.
- `repeating_sr6talentsofts` fuehrt `Name`, `Attribut`, `Stufe`, `Modifikator`, `Gesamtwert`; technisch bleibt die Stufe aus Kompatibilitaetsgruenden im bestehenden Feld `sr6_talentsoft_grundwert`.
- `syncRepeatingSkillTotals()` setzt Wissen/Sprache/Wissenssprachsofts auf den berechneten Erinnerungsvermoegen-Wert.
- Fuer Talentsofts berechnet `syncRepeatingSkillTotals()` `gesamtwert = gewaehltes Attribut + Stufe + Modifikator`.
- Talentsoft-Gesamtwert ist ein berechnetes Readonly-Feld; `+/-` auf Stufe oder Modifikator synchronisiert den Repeater-Gesamtwert direkt nach.
- Wissensfertigkeiten, Sprachfertigkeiten und Wissens-/Sprachsofts wuerfeln auf `Erinnerungsvermoegen`.
- Talentsofts verwenden den berechneten `gesamtwert` als Poolquelle und weisen im Rolltemplate auf die fehlende Edge-Verbesserung hin.
- Die Rollresolver ordnen diese Felder technisch weiterhin dem Rollsystem zu; fachlich sind Wissen/Sprache aber Attributsproben und keine Aktionsfertigkeitsproben.

Fachlicher Befund:

| Bereich | Regelwerkslogik | Sheet-Ist | Issue-12-Bewertung | Empfehlung |
| --- | --- | --- | --- | --- |
| Wissensfertigkeiten | Erinnerungsvermoegen fuer passende Wissens-/Erinnerungsfaelle | UI zeigt `Name` und `Wert`; Rollbutton nutzt `Logik + Intuition` | Als Attributsprobe umgesetzt | Kein eigener Dreiklang |
| Sprachfertigkeiten | Erinnerungsvermoegen fuer Verstehen-/Erinnerungsfaelle | UI zeigt `Name` und `Wert`; Rollbutton nutzt `Logik + Intuition` | Als Attributsprobe umgesetzt | Kein eigener Dreiklang |
| Talentsofts | Aktionssofts ersetzen bei passenden Fertigkeitsproben den Fertigkeitswert; Edge-Verbesserung ist dabei nicht moeglich | Attribut-Dropdown plus Stufe und Modifikator; Gesamtwert bildet den Wuerfelpool | Als eigener Talentsoft-Fall umgesetzt | Spaeter optional Soft-Typ/Aktionsfertigkeit fachlich genauer erfassen |
| Wissens-/Sprachsofts | Erinnerungsvermoegen fuer passende Wissens-/Sprachsoft-Faelle | UI zeigt `Name` und `Wert`; Rollbutton nutzt `Logik + Intuition` | Als Attributsprobe umgesetzt | Mittelfristig Soft-Typ trennen oder Dropdown fuer Wissenssoft/Linguasoft einfuehren |

Entscheidung fuer Issue 12:

- Diese vier Bereiche werden nicht blind auf das Aktionsfertigkeiten-Modell hochgezogen.
- Wissens-, Sprachfelder und Wissens-/Sprachsofts nutzen Erinnerungsvermoegen als eigene Attributsprobe.
- Talentsofts sind als erster Umsetzungsblock mit konkreter Attributzuordnung umgesetzt.
- Offene Fachentscheidung fuer spaeter: ob zusaetzlich `Soft-Typ` oder `zugeordnete Aktionsfertigkeit` als eigenes Kontextfeld noetig wird.

### Issue-12 Matrix-Handlungen: Mapping und aktueller Stand

Regelwerksquelle und Soll-Grundlage fuer diese Inventur:

- `docs/Shadowrun 6D - Grundregelwerk 2024.pdf`
- Matrixhandlungen S. 179-184
- Matrixhandlungs-Uebersicht S. 330
- zusaetzliche, vom Projekt bestaetigte Matrixhandlungs-Liste fuer erweiterte Handlungen

Stand vor Umsetzung:

- Die UI zeigt `Handlung`, `Grundwert`, `Modifikator`, `Gesamtwert`.
- Der Worker berechnet `sr6_matrix_handlung_<name>_gesamtwert = grundwert + modifikator`.
- Rollbuttons wuerfeln aktuell auf `Grundwert` oder `Gesamtwert`.
- Die fachliche Probe und die Verteidigungsprobe sind nicht getrennt abgebildet.

Aktueller Stand nach Umsetzung:

- Titelzeile: `Handlung`, `Probe`, `Verteidigung`.
- Pro Zeile wird die Probe als Formel plus berechnetem Pool angezeigt, z. B. `Elektronik + Willenskraft`.
- Pro Zeile wird die Verteidigung als Formel plus berechnetem Pool oder `Keine Probe` angezeigt.
- Probe und Verteidigung bekommen jeweils eigene Rollbuttons, wenn tatsaechlich gewuerfelt wird.
- Wo das Regelwerk mehrere Verteidigungsformeln nennt, wird die Verteidigungsquelle direkt in der Matrix-Handlungszeile gewaehlt.
- Wo das Regelwerk einen festen Schwellenwert nennt, wird dieser nicht technisch modelliert; der Spieler liest die noetigen Erfolge aus dem Probenwurf ab.
- Handlungen ohne Probe bleiben als solche sichtbar und bekommen keinen Pool-Rollbutton.
- Die Aktionen sind alphabetisch in der DOM-Reihenfolge angelegt.
- Die Standardansicht ist `A-Z`; die Ansichten `Gast`, `User` und `Admin` sortieren aktive Handlungen vor inaktive Handlungen.
- Inaktive Handlungen werden in der Zugriffssortierung als ganze Zeile ausgegraut.
- Neue/ergaenzte Handlungen wie `Cyberware kontrollieren`, `Dienstverweigerung`, `Stoersender lokalisieren` und `Suendenbock` sind im Mapping vorhanden.
- Der alte Dreiklang `grundwert/modifikator/gesamtwert` bleibt als kompatibler Datenpfad erhalten, ist aber nicht mehr die primaere UI fuer Matrix-Handlungen.

| Handlung | Sheet-Key | Vor Umsetzung | Probe | Verteidigung | Auswahl / Hinweis |
| --- | --- | --- | --- | --- | --- |
| Ausstoepseln | `ausstoepseln` | `Grundwert + Modifikator` | `Elektronik + Willenskraft` | `Charisma + Datenverarbeitung` oder `Angriff + Datenverarbeitung` | Verteidigung im Sheet waehlen |
| Bedrohungsanalyse | `bedrohungsanalyse` | `Grundwert + Modifikator` | `Elektronik + Logik` | Keine Verteidigungsprobe | Kein Verteidigungsrollbutton |
| Befehl vortaeuschen | `befehl_vortaeuschen` | `Grundwert + Modifikator` | `Cracken + Logik` | `Datenverarbeitung + Firewall` oder `Pilot + Firewall` | Verteidigung im Sheet waehlen |
| Brute Force | `brute_force` | `Grundwert + Modifikator` | `Cracken + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Angriff-verbundene Handlung; Verteidigung im Sheet waehlen |
| Cyberware kontrollieren | `cyberware_kontrollieren` | Nicht vorhanden | `Cracken + Logik` | `Willenskraft + Firewall + Cyberware-Geraetestufe` | Neue Matrixhandlung ergaenzen; Cyberware-Geraetestufe als Zielwert |
| Datei cracken | `datei_cracken` | `Grundwert + Modifikator` | `Cracken + Logik` | Keine Verteidigungsprobe | Schwelle wird nicht technisch modelliert |
| Datei editieren | `datei_editieren` | `Grundwert + Modifikator` | `Elektronik + Logik` | `Intuition + Firewall` oder `Schleicher + Firewall` | Verteidigung im Sheet waehlen |
| Datei verschluesseln | `datei_verschluesseln` | `Grundwert + Modifikator` | `Elektronik + Logik` | Keine Verteidigungsprobe | Erfolge erzeugen Verschluesselungsstufe |
| Datenbombe entschaerfen | `datenbombe_entschaerfen` | `Grundwert + Modifikator` | `Elektronik + Logik` | Keine Verteidigungsprobe | Schwelle wird nicht technisch modelliert |
| Datenbombe legen | `datenbombe_legen` | `Grundwert + Modifikator` | `Cracken + Logik` | Keine Verteidigungsprobe | Schwelle wird nicht technisch modelliert |
| Datenspike | `datenspike` | `Grundwert + Modifikator` | `Cracken + Logik` | `Datenverarbeitung + Firewall` oder `Logik + Firewall` | Angriff-verbundene Handlung; Verteidigung im Sheet waehlen |
| Dienstverweigerung | `dienstverweigerung` | Nicht vorhanden | `Cracken + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Neue Matrixhandlung ergaenzen; Verteidigung im Sheet waehlen |
| Ersticken | `ersticken` | `Grundwert + Modifikator` | `Cracken + Logik` | `Intuition + Schleicher` oder `Schleicher x2` | Verteidigung im Sheet waehlen |
| Garbage In/Garbage Out | `garbage_in_garbage_out` | `Grundwert + Modifikator` | `Cracken + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Verteidigung im Sheet waehlen |
| Geraet formatieren | `geraet_formatieren` | `Grundwert + Modifikator` | `Elektronik + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Verteidigung im Sheet waehlen |
| Geraet neu starten | `geraet_neu_starten` | `Grundwert + Modifikator` | `Elektronik + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Verteidigung im Sheet waehlen |
| Geraet steuern | `geraet_steuern` | `Grundwert + Modifikator` | `Elektronik + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Verteidigung im Sheet waehlen |
| Geraetesperre | `geraetesperre` | `Grundwert + Modifikator` | `Cracken + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Verteidigung im Sheet waehlen |
| Hineinspringen | `hineinspringen` | `Grundwert + Modifikator` | `Elektronik + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Verteidigung im Sheet waehlen |
| Hintertuer benutzen | `hintertuer_benutzen` | `Grundwert + Modifikator` | `Cracken + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Schleicher-verbundene Handlung; Verteidigung im Sheet waehlen |
| Hintertuer mit bekanntem Exploit benutzen | `hintertuer_mit_bekanntem_exploit_benutzen` | `Grundwert + Modifikator` | `Cracken + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Schleicher-verbundene Handlung; Verteidigung im Sheet waehlen |
| Host betreten/verlassen | `host_betreten_verlassen` | `Grundwert + Modifikator` | Keine Probe | Keine Verteidigungsprobe | Kein Rollbutton |
| Icon aufspueren | `icon_aufspueren` | `Grundwert + Modifikator` | `Cracken + Intuition` | `Willenskraft + Schleicher` oder `Firewall + Schleicher` | Schleicher-verbundene Handlung; Verteidigung im Sheet waehlen |
| Icon modifizieren | `icon_modifizieren` | `Grundwert + Modifikator` | `Cracken + Logik` | `Intuition + Datenverarbeitung` oder `Schleicher + Datenverarbeitung` | Verteidigung im Sheet waehlen |
| Icon veraendern | `icon_veraendern` | `Grundwert + Modifikator` | Keine Probe | Keine Verteidigungsprobe | Kein Rollbutton |
| Infrastruktur unterwandern | `infrastruktur_unterwandern` | `Grundwert + Modifikator` | `Cracken + Intuition` | `Intuition + Firewall` oder `Schleicher + Firewall` | Verteidigung im Sheet waehlen |
| Interfacemodus wechseln | `interfacemodus_wechseln` | `Grundwert + Modifikator` | Keine Probe | Keine Verteidigungsprobe | Kein Rollbutton |
| Kalibrierung | `kalibrierung` | `Grundwert + Modifikator` | `Elektronik + Logik` | Keine Verteidigungsprobe | Kein Verteidigungsrollbutton |
| Maskerade | `maskerade` | `Grundwert + Modifikator` | `Cracken + Logik` | `Intuition + Datenverarbeitung` oder `Schleicher + Datenverarbeitung` | Verteidigung im Sheet waehlen |
| Matrixattribute tauschen | `matrixattribute_austauschen` | `Grundwert + Modifikator` | Keine Probe | Keine Verteidigungsprobe | Kein Rollbutton |
| Matrixsuche | `matrixsuche` | `Grundwert + Modifikator` | `Elektronik + Intuition` | Keine Verteidigungsprobe | Kein Verteidigungsrollbutton |
| Matrixwahrnehmung | `matrixwahrnehmung` | `Grundwert + Modifikator` | `Elektronik + Intuition` | `Willenskraft + Schleicher` oder `Firewall + Schleicher` | Verteidigung im Sheet waehlen |
| Mittelsmetamensch | `mittelsmetamensch` | `Grundwert + Modifikator` | `Cracken + Logik` | `Intuition + Datenverarbeitung` oder `Schleicher + Datenverarbeitung` | Verteidigung im Sheet waehlen |
| Nachricht uebermitteln | `nachricht_uebermitteln` | `Grundwert + Modifikator` | Keine Probe | Keine Verteidigungsprobe | Kein Rollbutton |
| Overwatch-Wert bestimmen | `overwatch_wert_bestimmen` | `Grundwert + Modifikator` | `Cracken + Logik` | Keine Verteidigungsprobe | Schwelle wird nicht technisch modelliert |
| Pop-Up | `pop_up` | `Grundwert + Modifikator` | `Cracken + Logik` | `Intuition + Datenverarbeitung` oder `Schleicher + Datenverarbeitung` | Verteidigung im Sheet waehlen |
| Programm abstuerzen lassen | `programm_abstuerzen_lassen` | `Grundwert + Modifikator` | `Cracken + Logik` | `Datenverarbeitung + Geraetestufe` | Geraetestufe/Ziel-Datenverarbeitung als Zielwerte |
| Pruefsummensuche | `pruefsummensuche` | `Grundwert + Modifikator` | `Cracken + Logik` | Keine Verteidigungsprobe | Schwelle wird nicht technisch modelliert |
| Signal stoeren | `signal_stoeren` | `Grundwert + Modifikator` | `Cracken + Logik` | Keine Verteidigungsprobe | Kein Verteidigungsrollbutton |
| Sondieren | `sondieren` | `Grundwert + Modifikator` | `Cracken + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Schleicher-verbundene Handlung; Verteidigung im Sheet waehlen |
| Stalking | `stalking` | `Grundwert + Modifikator` | `Cracken + Logik` | `Willenskraft + Firewall` oder `Firewall x2` | Verteidigung im Sheet waehlen |
| Stoersender lokalisieren | `stoersender_lokalisieren` | Nicht vorhanden | `Cracken (Elektronische Kriegsfuehrung) + Logik` | Siehe Beschreibung | Neue Matrixhandlung ergaenzen; Sonderfall |
| Suendenbock | `suendenbock` | Nicht vorhanden | `Cracken + Schleicher` | `Willenskraft + Firewall` | Neue illegale Haupthandlung ergaenzen; Verteidigung ist fest |
| Teergrube | `teergrube` | `Grundwert + Modifikator` | `Cracken + Logik` | `Datenverarbeitung + Firewall` oder `Logik + Firewall` | Angriff-verbundene Handlung; Verteidigung im Sheet waehlen |
| Uebertragung abfangen | `uebertragung_abfangen` | `Grundwert + Modifikator` | `Cracken + Logik` | `Logik + Firewall` oder `Datenverarbeitung + Firewall` | Verteidigung im Sheet waehlen |
| Verstecken | `verstecken` | `Grundwert + Modifikator` | `Cracken + Intuition` | `Intuition + Datenverarbeitung` oder `Schleicher + Datenverarbeitung` | Schleicher-verbundene Handlung; Verteidigung im Sheet waehlen |
| Verzoegerter Befehl | `verzoegerter_befehl` | `Grundwert + Modifikator` | `Cracken + Logik` | `Datenverarbeitung + Firewall` oder `Pilot + Firewall` | Verteidigung im Sheet waehlen |
| Virtuelles Zielen | `virtuelles_zielen` | `Grundwert + Modifikator` | Keine Probe | Keine Verteidigungsprobe | Kein Rollbutton |
| Volle Matrixabwehr | `volle_matrixabwehr` | `Grundwert + Modifikator` | Siehe Beschreibung | Keine Verteidigungsprobe | Als Effekt-/Statushandlung modellieren, nicht als Standardroll |

Technischer Stand:

- `matrix_action` arbeitet jetzt ueber `SR6_MATRIX_ACTION_RULES`.
- Jede Matrixhandlung hat ein Mappingobjekt fuer `probe`, `defense`, `access`, `legality`, `actionType` und optionale Hinweise.
- Die sichtbare UI nutzt die neue Handlungsdarstellung; alte Felder bleiben fuer Migration/Kompatibilitaet im Hintergrund erhalten.
- Proben mit fester Schwelle haben keine eigene technische Schwellenwertlogik.
- Proben mit mehreren Verteidigungsquellen nutzen ein Dropdown in der Matrix-Handlungszeile.
- Handlungen ohne Probe erzeugen keine leeren Rollbuttons und keine irrefuehrenden Poolfelder.
- Ziel-/Gegnerwerte wie `Pilot`, `Geraetestufe` oder `Cyberware-Geraetestufe` sind bewusst noch keine automatisch berechneten Sheetwerte, solange keine passenden Zielwertfelder im Sheet existieren.

### Issue-12 Pruefbefund Rigging Fahrzeuge/Drohnen

Der Repeating-Bereich `Rigging > Fahrzeuge` ist aktuell ein Datenblock fuer Fahrzeug-/Drohnenwerte. Das passt fuer Fahrzeugdaten, ist aber noch kein vollstaendiges Probenmodell. Laut Regelwerk unterscheiden sich manuelle/AR-Steuerung, VR/hineingesprungenes Rigging und autonome Drohnen deutlich. Deshalb darf dieser Bereich nicht pauschal zu `Grundwert + Modifikator + Gesamtwert` umgebaut werden.

| Regelwerkswert / Probe | Manuell / AR | Hineingesprungen / VR | Autonome Drohne | Aktueller Sheet-Stand | Befund |
| --- | --- | --- | --- | --- | --- |
| `Initiative` | `Reaktion + Intuition + 1W6` | `Intuition + Intuition + 2W6/3W6`; bei WiFi/Riggerkonsole `Datenverarbeitung + Intuition + 2W6/3W6` | `Pilot x 2 + 3W6` | Global in Rigging-Kernwerten ueber Modus; Fahrzeugzeile hat kein eigenes Initiativefeld | Kernwert passt fuer Riggerkonsole/WiFi; autonome Drohneninitiative fehlt als eigenes Fahrzeug-/Drohnenmodell |
| `Angriffswert` | `Steuern + Sensor` | `Steuern + Sensor` | Montierte Waffe bzw. `Manoevrieren + Sensor` | Fahrzeugzeile fuehrt `Sensor`, aber keinen berechneten Angriffswert / Rollbutton | Offenes Fahrzeug-/Drohnen-Rollmodell |
| `Verteidigungswert` | `Steuern + Panzerung` | `Steuern + Panzerung` | `Manoevrieren + Panzerung` | Fahrzeugzeile fuehrt `Panzerung`, aber keinen berechneten Verteidigungswert | Offenes Vergleichswertmodell |
| `Handlingprobe` | `Steuern + Reaktion` | `Steuern + Intuition` plus ggf. Riggerkontrolle | Nicht als Standard-Pilotprobe in der Fahrzeugzeile abgebildet | Fahrzeugzeile fuehrt `Handling`, `Intervall`, `Geschwindigkeit` | Offenes Rollmodell mit Steuerungsmodus |
| `Angriffsprobe (Fahrzeug als Waffe)` | `Steuern + Reaktion` | `Steuern + Intuition` plus ggf. Riggerkontrolle | Nicht als Standard-Pilotprobe abgebildet | Kein Rollbutton | Offenes Rollmodell |
| `Angriffsprobe (Fahrzeugwaffe)` | `Mechanik + Logik` | `Mechanik + Logik` plus ggf. Riggerkontrolle | `[Waffe] Zielerfassung + Sensor` | Fahrzeugzeile fuehrt `Waffe`, aber keine Zielerfassung/Autosoft-Auswahl | Offenes Rollmodell; benoetigt zusaetzliche Datenentscheidung |
| `Verteidigungsprobe` | `Steuern + Reaktion` | `Steuern + Intuition` plus ggf. Riggerkontrolle | `Ausweichen + Pilot` | Kein Rollbutton | Offenes Rollmodell |
| `Heimlichkeit` | `Heimlichkeit + Geschicklichkeit` | `Heimlichkeit + Logik` plus ggf. Riggerkontrolle | `Stealth + Pilot` | Kein Stealth-/Autosoft-Feld in der Fahrzeugzeile | Offenes Rollmodell |
| `Wahrnehmung` | `Wahrnehmung + Intuition` | `Wahrnehmung + Sensor` | `Clearsight + Sensor` | Fahrzeugzeile fuehrt `Sensor`, aber keine Clearsight-Auswahl | Offenes Rollmodell |
| `Schadenswiderstand` | `Rumpf` | `Rumpf` | `Rumpf` | Fahrzeugzeile fuehrt `Rumpf` | Koennte spaeter als einfacher Widerstands-Rollbutton umgesetzt werden |
| `Zustandsmonitor` | `[Rumpf / 2 aufgerundet] + 8` | `[Rumpf / 2 aufgerundet] + 8` | `[Rumpf / 2 aufgerundet] + 8` | Kein berechneter Monitor in der Fahrzeugzeile | Offenes berechnetes Anzeigefeld |

Umsetzungsregel fuer spaeter:

- Fahrzeug-/Drohnenproben brauchen ein eigenes Rollmodell mit Steuerungsmodus.
- `Riggerkontrolle-Stufe` und Autosofts wie `Manoevrieren`, `Zielerfassung`, `Ausweichen`, `Stealth` und `Clearsight` duerfen nicht implizit geraten werden.
- Bestehende Felder `Handling`, `Beschleunigung`, `Intervall`, `Geschwindigkeit`, `Rumpf`, `Panzerung`, `Pilot`, `Sensor`, `Sitze`, `Waffe`, `Modus` bleiben stabile Datenfelder.
- Kurzfristig keine UI-Rollbuttons einfuehren, solange die benoetigten Autosoft-/Riggerkontrolle-Quellen nicht festgelegt sind.

## Offener Sammeltest

Der alte Datenfeld-Refactor ist funktional weitgehend abgeschlossen. Ein letzter Sammeltest bleibt als Sicherheitsnetz sinnvoll, wird aber nicht mehr als eigener alter Refactor-Block gefuehrt.

Zu pruefen:

- `attribute_probe x2`
- Basis- und Repeating-`skill_probe`
- Initiative: physisch, astral, Matrix, Rigging
- Kampf: Fernkampf, Nahkampf, Verteidigung (Physisch), Schadenswiderstand (Physisch), Waffenpools mit Spezialisierung/Expertise
- Magie-Kernwerte, Zauber, Geister und Rituale
- Matrix- und Rigging-Kernwerte
- Rolltemplate-Ausgabe global fuer alle Wuerfeloptionen
