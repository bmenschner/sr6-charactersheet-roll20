# Refactor Data Fields Todos

## Offene Fachpunkte

- [ ] Exakte Formeln aller Kampf-Kalkulationsfelder festlegen und gegen das Grundregelwerk pruefen
- [ ] Entscheiden, welche Werte wirklich den Dreiklang `Grundwert / Modifikator / Gesamtwert` brauchen
- [ ] Definieren, wie Spezialisierung und Expertise je Rollart im Popup abgebildet werden
- [ ] Festlegen, welche heutigen Einzelwerte spaeter zu berechneten Werten werden sollen

## Offene Architekturpunkte fuer Popup und Rolltemplate

- [ ] `attribute_probe` als explizites Modell weiter ausbauen
  Aktueller Stand: eigenes Modell und eigener Pool-Multiplikator sind im Code verankert; ein erster `Attribut x2`-Pilot ist in `Allgemein > Attribute > Gesamtwert` umgesetzt und in Roll20 bestaetigt.
  Offen bleibt: weitere echte `x2`-Anwendungsfaelle gezielt auf dasselbe Modell mappen.
- [ ] `skill_probe` weiter von generischen Altpfaden entkoppeln
  Aktueller Stand: gemeinsamer `skill_probe`-Builder traegt jetzt Basisfertigkeiten, Wissens-/Sprachfertigkeiten sowie Soft-Faelle.
  Offen bleibt: pruefen, welche heutigen Spezialfaelle spaeter noch einen echten eigenen Modellpfad brauchen und welche beim `skill_probe` bleiben koennen.
- [ ] `defense_probe` als wiederverwendbares Modell formulieren, das je Tab andere Feldquellen lesen kann
  Aktueller Stand: gemeinsamer Builder fuer physische Kampf-Faelle ist vorhanden; erste Mappings fuer Matrix-/Rigging-Defensivfaelle und astrale Magie-Faelle sind im Code angelegt.
- [ ] `combat_attack_probe` weiter von Altdefinitionen entkoppeln und als klares Referenzmodell dokumentieren
- [ ] Generische Altpfade wie `value`, `weapon` und `fallback` nur noch als technisches Sicherheitsnetz behandeln
- [ ] `Allgemein` nicht mehr als eigenes Popup-/Rolltemplate-Ziel behandeln, sondern nur als Spiegel/Ansicht

## Folgearbeiten nach dem aktuellen Refactor

- [ ] Kampf-Kalkulationsfelder (`Fernkampfangriff`, `Nahkampfangriff`, `Verteidigung (Physisch)`, `Schadenswiderstand (Physisch)`) auf final bestaetigte Formeln umstellen
- [ ] Kampf-UI und Popup systematisch auf die Trennung `Wuerfelpool` vs. `Angriffswert` vs. `Verteidigungswert` vs. `Schaden` ausrichten
- [ ] Pruefen, ob die Angriffswert-Felder von Nahkampfwaffen im Sheet bereits Endwerte sind oder ob `Staerke` kuenftig noch eingerechnet werden muss
- [ ] Rollenwahl fuer `Primäre Panzerung`, `Sekundäre Panzerung`, `Helm` und `Schild` gegen die finale UX pruefen und bei Bedarf noch weiter verfeinern
- [ ] Repeating-Waffenwerte darauf pruefen, welche Felder eigene Dreiklaenge benoetigen; `Schaden` ist gesetzt, `Angriffswert` bleibt aktuell reichweitenabhaengig
- [ ] Popup-Profile nach finaler Wertetyp-Klassifikation und Probenmodell je Rollart nachziehen
- [ ] Pruefen, welche Einzelwerte in `Magie`, `Matrix`, `Rigging`, `Ausruestung` und `Leben` wirklich numerische Primarwerte sind
