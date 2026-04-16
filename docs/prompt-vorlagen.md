# Prompt-Vorlagen für neue SR6-Boxen

## 1) Neue Box erstellen

```text
Erstelle eine neue Box als Partial unter `src/html/partials/[tab]/[name].html`.

Vorgaben:
- Titel: [TITEL]
- Tab: [allgemein|kampf|...]
- Position im Tab: [z. B. unter Attribute, links/rechts, full width]
- Feldtyp: [attribute-style | simple-input | mixed]
- Dice-Buttons: [ja/nein, bei welchen Feldern]
- i18n-Keys: anlegen falls fehlend
- Kommentarformat:
  <!-- BEGIN BLOCK: ... -->
  <!-- END BLOCK: ... -->

Danach:
- Include in `src/html/charactersheet.html` setzen
- CSS nur minimal ergänzen, falls nötig
- `npm run build` ausführen
```

## 2) Box wie Attribute aufbauen

```text
Baue eine Box im Stil von `Attribute` mit folgenden Feldern:
- [FELD 1]
- [FELD 2]
- ...

Jedes Feld soll enthalten:
- Grundwert
- Modifikator
- Gesamtwert

Regeln:
- Name-Schema für attrs konsistent mit `sr6_[block]_[feld]_[typ]`
- Würfelbutton bei Grundwert und Gesamtwert
- i18n für Titel/Felder ergänzen
- Kommentarblöcke pro Feld
```

## 3) Kampf-Info-Box aufbauen/ändern

```text
Erstelle/ändere die Box `Wichtige Kampf-Infos` mit folgender Struktur:
- Zeile 1: [ ... ]
- Zeile 2: [ ... ]
- Zeile 3: [ ... ]
- ...

Nutze die bestehende Shadowrun-Namensgebung.
Bestehende Attr-Namen nur ändern, wenn ich es explizit sage.
`npm run build` ausführen.
```

## 4) Layout im Tab anordnen

```text
Ordne die Boxen im Tab `[TABNAME]` neu an:

Reihe 1:
- Links: [BOX A]
- Rechts: [BOX B]

Reihe 2:
- Full Width: [BOX C]

Reihe 3:
- Links: [BOX D]
- Rechts: [BOX E]

Bitte:
- Nur Struktur/CSS für Layout ändern, keine Feldnamen ändern
- Mobile-Verhalten unter 800px: untereinander
- Danach build ausführen
```

## 5) Bestehende Box erweitern

```text
Erweitere die bestehende Box `[BOXNAME]` um:
- [NEUES FELD 1]
- [NEUES FELD 2]

Anforderungen:
- Bestehende Datenfelder unverändert lassen
- Neue Felder im gleichen Stil integrieren
- i18n ergänzen (de/en/fr)
- Kommentarblöcke im gewünschten Format
- Build ausführen
```

## 6) Rückbau/Restore

```text
Stelle die Box `[BOXNAME]` auf die vorherige Variante zurück.

Quelle:
- Letzte funktionierende Struktur aus dem Repo verwenden
- Keine Änderung an anderen Boxen
- Danach `npm run build`
- Kurz auflisten, welche Dateien geändert wurden
```

