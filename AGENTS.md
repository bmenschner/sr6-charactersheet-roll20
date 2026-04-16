# AGENTS.md

## 1. Kontext
Dieses Repository enthält ein Roll20 Character Sheet.

Wichtig:
- kein Build-System in Roll20
- HTML, CSS, optional `translation.json`
- feste Namenskonventionen: `attr_`, `act_`, `repeating_`
- Sandbox ist upload-basiert (kein Git-Sync)

→ Kein klassisches Frontend-Projekt

---

## 2. Struktur

Source:
- `src/html/charactersheet.html`
- `src/css/charactersheet.css`
- `src/i18n/translation.json`

Output:
- `output/assets/*` (generiert)

Docs:
- `docs/`, `readme.md`, `roll20-checklist.md`

---

## 3. Grundregeln

- Arbeite in `src/` (source of truth)
- `output/` nicht direkt bearbeiten
- kleine, sichere Änderungen
- bestehende Patterns wiederverwenden
- Roll20-Kompatibilität > moderne Web-Praktiken
- keine Frameworks / Toolchains hinzufügen

---

## 4. Workflow

src → build → output → Autouploader → Roll20

- Git = Source of Truth
- Sandbox nur über Upload aktualisieren
- keine direkte Integration mit Roll20

---

## 5. Codex-Verhalten

Arbeite immer in diesem Ablauf:
1. analysieren
2. planen
3. minimal ändern
4. prüfen
5. strukturiert antworten

---

## 6. Datei-Regeln

HTML:
- `attr_*`, `act_*`, `repeating_*` nicht ohne Grund ändern
- keine Datenpfade brechen
- erweitern statt neu bauen

CSS:
- gezielte Änderungen
- keine globalen Resets
- Struktur respektieren

i18n:
- UI-Texte in `translation.json`
- Keys wiederverwenden
- keine unnötigen Hardcodings

---

## 7. Output

- `output/` ist generiert
- Änderungen nur wenn explizit gefordert
- nach `src/` Änderungen → Build nötig

---

## 8. Safety Checks

Immer prüfen:
- Feldnamen korrekt (`attr_`, `act_`)
- repeating sections stabil
- bestehende Daten kompatibel
- translation vollständig

---

## 9. Debugging

Reihenfolge:
1. Attribute
2. Buttons
3. Repeating Sections
4. i18n
5. CSS
6. Output vs Source

---

## 10. Git

Verboten:
- `git reset --hard`
- `git clean -fd`
- force push

---

## 11. Vermeiden

- Frameworks
- große Refactors
- Feld-Umbenennungen
- Output direkt ändern
- Hardcoding statt i18n
- Browser/Profile/Logins anfassen

---

## 12. Ausgabeformat

Immer verwenden:

### Plan
- geplante Schritte

### Änderungen
- konkrete Änderungen

### Dateien
- betroffene Dateien

### Test
- wie prüfen

### Hinweise
- Risiken / Besonderheiten

---

## 13. Regel bei Unsicherheit

- weniger ändern
- Struktur respektieren
- Annahmen benennen