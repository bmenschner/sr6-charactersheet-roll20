# SR6 Roll20 Live Check v1

## Ziel
Praktischer Smoke-Test direkt in Roll20 fuer:
- i18n (DE/EN/FR)
- Rollbuttons (Attribut, Fernkampf, Nahkampf)
- Sheet-Worker (Totals + `sr6_derived_*`)

## Setup
1. Aktuellen Stand aus `main` laden.
2. Sheet in Roll20 oeffnen.
3. Browser-Konsole offen halten (Fehler sichtbar).

## Test 1: i18n Umschaltung
1. Tab `Einstellungen` oeffnen.
2. Sprache `DE` -> `EN` -> `FR` wechseln.
3. Pruefen:
- Tab-Namen aktualisieren sich.
- Bereichstitel aktualisieren sich.
- Feldlabels aktualisieren sich.
4. Seite neu laden.
5. Pruefen:
- Gewaehlte Sprache bleibt erhalten (localStorage).

## Test 2: Attribut-Worker
1. In `Allgemein` bei mindestens 3 Attributen `Grundwert` und `Modifikator` setzen.
2. Pruefen:
- `Gesamtwert` wird sofort korrekt berechnet.
3. Seite neu laden.
4. Pruefen:
- Werte bleiben konsistent.

## Test 3: Derived Worker Werte
1. Werte fuer `Reaktion`, `Intuition`, `Konstitution`, `Willenskraft`, `Edge` setzen.
2. Pruefen ueber DevTools/Attribute:
- `sr6_derived_initiative_basis`
- `sr6_derived_verteidigung_basis`
- `sr6_derived_koerperlicher_monitor_max`
- `sr6_derived_geistiger_monitor_max`
- `sr6_derived_edge_basis`
3. Aenderungen an Ausgangsattributen pruefen (Derived-Werte aktualisieren mit).

## Test 4: Rollbuttons
1. Attribut-Wuerfel bei 2 Attributen ausloesen.
2. Fernkampf-Wuerfel (S. Nah / Nah / Mittel / Weit / S. Weit) ausloesen.
3. Nahkampf-Wuerfel ausloesen.
4. Pruefen Chat-Ausgabe:
- Attribut-Test: Name/Pool/Erfolge vorhanden.
- Fernkampf-Test: Name + `Waffe` + `Modus` + Pool/Erfolge vorhanden.
- Nahkampf-Test: Name + `Waffe` + Pool/Erfolge vorhanden.

## Test 5: Regression Tabs/Layout
1. Alle 9 Tabs einmal wechseln.
2. Breite unter 800px testen.
3. Pruefen:
- Allgemein-Boxen stapeln untereinander.
- Einstellungen-Tab zeigt Sprachumschalter korrekt.
- Keine Ueberlagerungsfehler mit Roll20-Navigation.

## Abnahmekriterium
- Keine JS-Fehler in der Konsole.
- i18n, Worker und Rolls verhalten sich wie erwartet.
- Keine offensichtlichen Layout-Regressions.
