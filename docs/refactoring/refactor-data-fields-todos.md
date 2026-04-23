# Refactor Data Fields Todos

## Abschlussphase fuer diesen Refactor

- [x] `combat_attack_probe` als klares Referenzmodell kurz final dokumentieren
  Ergebnis: Das Modell ist in der Refactor-Matrix als Referenz fuer globale und Repeating-Fern-/Nahkampfpfade festgehalten; die Trennung von `Pool`, `Angriffswert`, `Schaden` sowie `Munition`/`Attribut`/`Schadenstyp` ist dort explizit beschrieben.
- [x] `Allgemein` in der Doku final als Spiegel/Ansicht festschreiben
  Ergebnis: `Allgemein` ist fuer diesen Refactor auf Attribute, Initiative und die Uebersichtsbox fuer `Fertigkeiten`, `Magie`, `Matrix` und `Eigene` reduziert. Kampf, Verteidigung, Schadenswiderstand und das Test-Popup sind dort entfernt.
- [x] Verbleibende generische Fallback-Proben einmal final inventarisieren und als bewusste Rest-Sicherheitsnetze markieren
  Ergebnis: Die Live-Buttons des Sheets haengen ueberwiegend an expliziten Modellen; `value`, `weapon` und `fallback` sind in Matrix und Code ausdruecklich als Rest-Sicherheitsnetze eingeordnet. Zusaetzliche Matrix-/Rigging-Vergleichswerte sind vor den breiteren Sammelpfaden explizit gefasst.
- [ ] Letzten Sammeltest fuer die zentralen Rollarten durchziehen und den Refactor danach als abgeschlossen markieren
  Abschluss-Checkliste:
  1. `attribute_probe x2`
  2. Basis- und Repeating-`skill_probe`
  3. Initiative: physisch, astral, matrix, rigging
  4. Kampf: Fernkampf, Nahkampf, Verteidigung (Physisch), Schadenswiderstand (Physisch)
  5. Magie-Kernwerte
  6. Matrix- und Rigging-Kernwerte
  7. Rituale ohne Wuerfel

## Fuer diesen Refactor erreicht

- [x] `attribute_probe` als explizites Modell verankert
  Stand: eigener Modellpfad vorhanden; `Attribut x2` ist als erster echter Pilot in `Allgemein > Attribute > Gesamtwert` umgesetzt und in Roll20 bestaetigt.
- [x] `initiative_probe` als explizites Modell verankert
  Stand: Initiativwuerfe mit `Basis / W6 / Gesamt` laufen ueber ein eigenes Modell; physische, astrale, Matrix- und Rigging-Initiative nutzen getrennte Basisfelder; Matrix und Rigging werden aus dem Modus abgeleitet.
- [x] `skill_probe` fuer Basis- und Repeating-Skill-Faelle stabilisiert
  Stand: gemeinsamer `skill_probe`-Builder deckt Basisfertigkeiten, Wissens-/Sprachfertigkeiten sowie Soft-Faelle ab; die Repeating-Handler funktionieren in Roll20.
- [x] `spell_probe` als eigener Magiepfad formuliert
  Stand: Zauber nutzen jetzt ein eigenes Popup- und Outputmodell mit `Spruchzauberei`-Probe, modifiziertem Entzug und separatem Entzugswiderstand.
- [x] `defense_probe` als wiederverwendbares Modell formuliert
  Stand: physische Kampf-Faelle, allgemeine Verteidigungs-/Widerstandsfaelle sowie Matrix-/Rigging-Defensivfaelle und astrale Magie-Faelle laufen ueber denselben Modellgedanken.
- [x] Kampf-UI und Popup auf die Trennung `Wuerfelpool` vs. `Angriffswert` vs. `Verteidigungswert` vs. `Schaden` gezogen
  Stand: Kampf ist funktional auf diese Trennung gebracht; die fachliche Grundstruktur ist bestaetigt.
- [x] Nahkampf-Angriffswerte als bewusst manuelle Endwerte festgelegt
  Ergebnis: reichweitenabhaengige Nahkampfwerte bleiben Endwerte; die primaere Nahkampfprobe liest `Fertigkeit` und `Attribut` der primaeren Waffe; Nahkampfwaffen fuehren zusaetzlich `Schadenstyp`.
- [x] Numerische Kernwert-Inputs in `Magie`, `Matrix`, `Rigging` und den offensichtlichen Teilen von `Ausruestung` auf `number` umgestellt
  Stand: die klaren numerischen Primaerwerte sind aus dem alten `text`-Muster herausgezogen.
- [x] Generische Altpfade deutlich reduziert
  Stand: `magic_value`, `matrix_value` und `rigging_value` greifen als explizite `value_probe`-Pfade; zusaetzliche Matrix-/Rigging-Vergleichswerte sind vor den breiteren Sammelpfaden explizit gefasst.
- [x] Rituale fuer diesen Refactor bewusst auf reine Datenfelder ohne Wuerfel zurueckgefuehrt

## Bewusst spaeter, nicht Blocker fuer den Abschluss

- Rigging-Sonderfaelle wie hineingesprungen per Kabel/WiFi oder weitere spezialisierte Modi gegen das Grundregelwerk nachschaerfen
- Exakte Formeln aller Kampf-Kalkulationsfelder inkl. spaeterer Sonderfaelle aus Ausruestung, Bodytech oder Magie weiter verfeinern
- Pruefen, welche Werte projektweit wirklich einen Dreiklang `Grundwert / Modifikator / Gesamtwert` brauchen
- Spezialisierung und Expertise je Rollart im Popup weiter vereinheitlichen
- Weitere theoretische `attribute_probe x2`-Anwendungsfaelle mappen
- Weitere Spezialfaelle vom `skill_probe` abspalten, falls spaeter wirklich noetig
- Rollenwahl fuer `Primaere Panzerung`, `Sekundaere Panzerung`, `Helm` und `Schild` UX-seitig weiter verfeinern
- Repeating-Waffenwerte spaeter noch feiner darauf pruefen, welche Felder eigene Dreiklaenge brauchen
- Popup-Profile der restlichen Rollarten auf denselben Explizitheitsgrad ziehen
- Weitere numerische Primaerwerte in anderen Randbereichen projektweit bereinigen
