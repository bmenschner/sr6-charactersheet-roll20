# AGENTS.md

## 1. Projektkontext
Dieses Repository enthält ein Roll20 Character Sheet (z. B. Shadowrun 6).

Wichtige Eigenschaften von Roll20:
- kein Build-System im Zielsystem
- HTML, CSS, optional `translation.json`
- feste Namenskonventionen (`attr_`, `act_`, `repeating_`)
- Sandbox ist upload-basiert (kein Git-Sync)

Dieses Projekt ist **kein klassisches Frontend**.

---

## 2. Projektstruktur

### Source of Truth
- `src/html/charactersheet.html`
- `src/css/charactersheet.css`
- `src/i18n/translation.json`

### Generierter Output
- `output/charactersheet.html`
- `output/charactersheet.css`
- `output/assets/images/*`

### Dokumentation
- `docs/*`
- `readme.md`
- `roll20-checklist.md`

---

## 3. Grundprinzipien

- Arbeite **source-first** (`src/`)
- `output/` ist generiert → nicht direkt bearbeiten
- kleine, nachvollziehbare Änderungen
- bestehende Patterns bevorzugen
- Roll20-Kompatibilität > moderne Web-Praktiken
- keine neuen Frameworks oder Toolchains

---

## 4. Lokaler Workflow

src/ → build → output/ → Roll20 Autouploader → Sheet Sandbox

- Git ist die Source of Truth
- Sandbox wird ausschließlich über Upload aktualisiert
- Autouploader übernimmt das „Live Update“
- keine direkte Integration mit Roll20 oder Git

---

## 5. Codex-Arbeitsweise

Bei jeder Aufgabe:

1. Ist-Zustand analysieren  
2. kurzen Plan erstellen  
3. minimal-invasive Änderung durchführen  
4. Roll20-Auswirkungen berücksichtigen  
5. Ergebnis strukturiert ausgeben  

---

## 6. Dateispezifische Regeln

### HTML (`charactersheet.html`)
- `attr_*` Namen niemals leichtfertig ändern
- `act_*` Buttons korrekt lassen
- `repeating_` Sections stabil halten
- keine bestehenden Datenpfade brechen
- Erweiterung statt Rewrite

### CSS (`charactersheet.css`)
- nur Roll20-kompatible Styles
- keine globalen Resets
- kleine, gezielte Änderungen
- bestehende Struktur respektieren

### i18n (`translation.json`)
- neue UI-Texte → in i18n aufnehmen
- bestehende Keys wiederverwenden
- keine unnötigen Hardcodings
- Keys nur entfernen, wenn UI entfernt wurde

---

## 7. Output-Regeln

- `output/assets/*` ist generiert
- Änderungen nur wenn explizit gefordert
- nach `src/` Änderungen → auf notwendigen Rebuild hinweisen
- keine stillen Änderungen an Output

---

## 8. Roll20 Safety Checks (Pflicht)

Vor Abschluss immer prüfen:

- `attr_*` korrekt?
- `act_*` korrekt?
- repeating sections unverändert?
- bestehende Attribute kompatibel?
- translation keys vollständig?
- keine Web-App Annahmen eingeführt?

---

## 9. Debugging-Reihenfolge

1. Attributnamen  
2. Button-Referenzen  
3. Repeating Sections  
4. Translation Keys  
5. CSS  
6. Output vs. Source Sync  

---

## 10. Git-Regeln

Verboten:
- `git reset --hard`
- `git clean -fd`
- force push

Grundsatz:
- kleine Änderungen
- Struktur respektieren

---

## 11. Was vermieden werden muss

- Frameworks (React, Vue, etc.)
- große Refactors ohne Not
- Umbenennung von Roll20-Feldern
- direkte Bearbeitung von generiertem Output
- Hardcoding statt i18n
- Änderungen an Browser-Profilen / Sessions

---

## 12. Ausgabeformat

Bei jeder Antwort MUSS folgende Struktur verwendet werden:

### Plan
- Beschreibe die geplanten Änderungen

### Änderungen
- Liste die konkreten Änderungen auf

### Betroffene Dateien
- Nenne alle geänderten Dateien

### Test
- Beschreibe, wie die Änderungen überprüft werden können

### Hinweise
- Nenne Risiken oder wichtige Details

---

## 13. Entscheidungsregel

Wenn unsicher:
- weniger ändern statt mehr
- bestehende Struktur respektieren
- Annahmen klar benennen
