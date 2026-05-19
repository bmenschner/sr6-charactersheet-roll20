# Regel-Nachschlagewerk

Dieses Dokument sammelt kurze, projektbezogene Regelnotizen, die fuer Worker-, Popup- und Rolltemplate-Logik relevant sind. Es ersetzt nicht das Grundregelwerk, sondern haelt die im Sheet technisch abgebildeten Regelauslegungen fest.

## Schicksalswuerfel

Quelle: `docs/Shadowrun 6D - Grundregelwerk 2024.txt`, Abschnitt `Schicksalswuerfel` / SR6 S. 51.

- Ein Schicksalswuerfel ist ein W6, der optisch von normalen Wuerfeln unterscheidbar sein soll.
- Ein Erfolg auf einem Schicksalswuerfel zaehlt als 3 Erfolge.
- Eine 1 auf einem Schicksalswuerfel macht gewuerfelte normale 5en unbrauchbar.
- Eine 2, 3 oder 4 auf einem Schicksalswuerfel hat keine Sonderwirkung.
- Wenn Edge eingesetzt wird und 6en explodieren, zaehlt die erste 6 auf einem Schicksalswuerfel als 3 Erfolge; weitere Wuerfe daraus werden wie normale Wuerfel behandelt.

## Einzelgaenger

Vom Nutzer bestaetigte Regeldefinition fuer die Sheet-Logik:

- Gilt fuer Matrixhandlungen und Komplexe Formen.
- Fuegt der Probe einen eigenen Schicksalswuerfel hinzu.
- Wenn dieser Einzelgaenger-Schicksalswuerfel eine 1 zeigt, fuegt er keine Erfolge hinzu und zaehlt weiterhin gegen Patzer.
- Diese 1 annulliert aber nicht die gewuerfelten 5en.
- Andere Schicksalswuerfel aus anderen Quellen funktionieren weiterhin normal; deren 1 annulliert also weiterhin gewuerfelte 5en.

Technische Auslegung im Sheet:

- Der Einzelgaenger-Schicksalswuerfel wird separat von anderen Schicksalswuerfeln gewuerfelt.
- In der Detailanzeige steht er vor den anderen Schicksalswuerfeln.
- Nur dieser Einzelgaenger-Wuerfel ignoriert bei einer 1 die 5er-Annullierung.
