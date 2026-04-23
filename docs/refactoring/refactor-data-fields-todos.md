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
- [ ] `initiative_probe` als explizites Modell weiter schaerfen
  Aktueller Stand: Initiativwuerfe mit `Basis / W6 / Gesamt` laufen jetzt ueber ein eigenes Modell statt ueber den generischen Fallback; physische, astrale, Matrix- und Rigging-Initiative nutzen getrennte Basisfelder. Matrix- und Rigging-Initiative werden aus dem Modus abgeleitet.
  Offen bleibt: die verbleibenden Detailfaelle fuer Rigging wie hineingesprungen per Kabel/WiFi oder weitere spezialisierte Modi spaeter gezielt gegen das Grundregelwerk schaerfen.
- [ ] `skill_probe` weiter von generischen Altpfaden entkoppeln
  Aktueller Stand: gemeinsamer `skill_probe`-Builder traegt jetzt Basisfertigkeiten, Wissens-/Sprachfertigkeiten sowie Soft-Faelle.
  Offen bleibt: pruefen, welche heutigen Spezialfaelle spaeter noch einen echten eigenen Modellpfad brauchen und welche beim `skill_probe` bleiben koennen.
- [ ] `defense_probe` als wiederverwendbares Modell formulieren, das je Tab andere Feldquellen lesen kann
  Aktueller Stand: gemeinsamer Builder fuer physische Kampf-Faelle ist vorhanden; allgemeine Verteidigungs-/Widerstandsfaelle sowie Matrix-/Rigging-Defensivfaelle und astrale Magie-Faelle sind im Code angelegt.
- [ ] `combat_attack_probe` weiter von Altdefinitionen entkoppeln und als klares Referenzmodell dokumentieren
- [ ] Generische Altpfade wie `value`, `weapon` und `fallback` nur noch als technisches Sicherheitsnetz behandeln
  Aktueller Stand: `magic_value`, `matrix_value` und `rigging_value` greifen jetzt als explizite `value_probe`-Pfade fuer ihre Kernwertwuerfe; der verbleibende generische `value`-Pfad ist damit kleiner geworden.
- [ ] `Allgemein` nicht mehr als eigenes Popup-/Rolltemplate-Ziel behandeln, sondern nur als Spiegel/Ansicht

## Folgearbeiten nach dem aktuellen Refactor

- [ ] Kampf-Kalkulationsfelder (`Fernkampfangriff`, `Nahkampfangriff`, `Verteidigung (Physisch)`, `Schadenswiderstand (Physisch)`, `Verteidigungswert`) auf final bestaetigte Formeln umstellen
  Aktueller Stand: `Fernkampfangriff`, `Nahkampfangriff`, `Verteidigung (Physisch)`, `Schadenswiderstand (Physisch)` und `Verteidigungswert` sind im Sheet technisch berechnet; beim `Verteidigungswert` bleibt der bestaetigte Sheet-Stand `Konstitution + Primaer + Sekundaer + Helm + Schild` erhalten.
  Offen bleibt: explizite Sonderfaelle und Ausnahmen aus Ausruestung/Bodytech/Magie spaeter gezielt gegen die gewollte Sheet-Logik statt gegen eine pauschale Regelannahme modellieren.
- [ ] Allgemeine Verteidigungs-/Widerstandsfelder fuer Drohnen-/Sonderfaelle weiter schaerfen
  Aktueller Stand: `Verteidigung (Zauber - Direkt)`, `Verteidigung (Zauber - Indirekt)`, `Verteidigung (Astralkampf)`, `Schadenswiderstand (Astral)`, `Schadenswiderstand (Matrix)` und `Schadenswiderstand (Biofeedback)` sind jetzt auf die belegten Standardformeln aus dem Grundregelwerk gezogen.
  Offen bleibt: Sonderfaelle wie Drohnen/Pilot oder spezifische Matrixprogramme ohne kuenstliche Uebermodellierung sauber einhaengen.
- [ ] Kampf-UI und Popup systematisch auf die Trennung `Wuerfelpool` vs. `Angriffswert` vs. `Verteidigungswert` vs. `Schaden` ausrichten
  Aktueller Stand: Kampf ist funktional auf diese Trennung gezogen. `Fernkampfangriff`, `Nahkampfangriff`, `Verteidigung (Physisch)` und `Schadenswiderstand (Physisch)` laufen als Pools; `Verteidigungswert` bleibt Vergleichswert; reichweitenabhaengige Waffenwerte bleiben Angriffswert-Kontext; `Schaden` bleibt Einzelwert. Die Kampf-UI fuehrt diese Ebenen inzwischen sichtbar getrennt.
  Offen bleibt: Popup-Feinschliff und spaetere Layout-/UX-Politur, nicht mehr die fachliche Grundtrennung.
- [ ] Pruefen, ob die Angriffswert-Felder von Nahkampfwaffen im Sheet bereits Endwerte sind oder ob `Staerke` kuenftig noch eingerechnet werden muss
  Aktueller Stand: Die reichweitenabhaengigen Nahkampfwerte bleiben bewusst manuell gepflegte Endwerte; die primaere Nahkampfprobe liest jetzt aber `Fertigkeit` und `Attribut` der primaeren Waffe. Nahkampfwaffen fuehren zusaetzlich `Schadenstyp`.
- [ ] Rollenwahl fuer `Primäre Panzerung`, `Sekundäre Panzerung`, `Helm` und `Schild` gegen die finale UX pruefen und bei Bedarf noch weiter verfeinern
- [ ] Repeating-Waffenwerte darauf pruefen, welche Felder eigene Dreiklaenge benoetigen; `Schaden` ist gesetzt, `Angriffswert` bleibt aktuell reichweitenabhaengig
- [ ] Popup-Profile nach finaler Wertetyp-Klassifikation und Probenmodell je Rollart nachziehen
  Aktueller Stand: Kampf nutzt fuer Fern- und Nahkampf bereits getrennte Popup-Profile; Nahkampf fuehrt `Attribut` und `Schadenstyp`, Fernkampf weiterhin `Munition`. Der Nahkampf-Popup kann das Attribut als Fallback vor dem Wurf umschalten.
  Offen bleibt: die restlichen Rollarten projektweit auf denselben Explizitheitsgrad ziehen.
- [ ] Pruefen, welche Einzelwerte in `Magie`, `Matrix`, `Rigging`, `Ausruestung` und `Leben` wirklich numerische Primarwerte sind
  Aktueller Stand: numerische Kernwert-Inputs in `Magie`, `Matrix` und `Rigging` werden schrittweise vom alten `text`-Format auf `number` umgestellt.
- [ ] Verbleibende generische Fallback-Proben weiter auf explizite Fachmodelle ziehen
  Aktueller Stand: die generischen Restfaelle werden schrittweise fachlich geprueft; Rituale bleiben vorerst reine Datenfelder ohne Wuerfel.
