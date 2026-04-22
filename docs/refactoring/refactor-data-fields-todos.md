# Refactor Data Fields Todos

## Offene Fachpunkte

- [ ] Exakte Formeln aller Kampf-Kalkulationsfelder festlegen und gegen das Grundregelwerk pruefen
- [ ] Entscheiden, welche Werte wirklich den Dreiklang `Grundwert / Modifikator / Gesamtwert` brauchen
- [ ] Definieren, wie Spezialisierung und Expertise je Rollart im Popup abgebildet werden
- [ ] Festlegen, welche heutigen Einzelwerte spaeter zu berechneten Werten werden sollen

## Folgearbeiten nach dem aktuellen Refactor

- [ ] Kampf-Kalkulationsfelder (`Fernkampfangriff`, `Nahkampfangriff`, `Verteidigung (Physisch)`, `Schadenswiderstand (Physisch)`) auf final bestaetigte Formeln umstellen
- [ ] Kampf-UI und Popup systematisch auf die Trennung `Wuerfelpool` vs. `Angriffswert` vs. `Verteidigungswert` vs. `Schaden` ausrichten
- [ ] Pruefen, ob die Angriffswert-Felder von Nahkampfwaffen im Sheet bereits Endwerte sind oder ob `Staerke` kuenftig noch eingerechnet werden muss
- [ ] Rollenwahl fuer `Primäre Panzerung`, `Sekundäre Panzerung`, `Helm` und `Schild` gegen die finale UX pruefen und bei Bedarf noch weiter verfeinern
- [ ] Repeating-Waffenwerte darauf pruefen, welche Felder eigene Dreiklaenge benoetigen; `Schaden` ist gesetzt, `Angriffswert` bleibt aktuell reichweitenabhaengig
- [ ] Popup-Profile nach finaler Wertetyp-Klassifikation je Rollart nachziehen
- [ ] Pruefen, welche Einzelwerte in `Magie`, `Matrix`, `Rigging`, `Ausruestung` und `Leben` wirklich numerische Primarwerte sind
