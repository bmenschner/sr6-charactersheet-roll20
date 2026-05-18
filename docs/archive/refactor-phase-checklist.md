# Refactoring Checklist (Status)

Archivstatus: Historisches Dokument. Diese Checkliste beschreibt den abgeschlossenen initialen Struktur-Refactor und ist nicht mehr die operative Arbeitsgrundlage fuer aktuelle Tickets.

## Phase 1: Stabilisieren
- [x] Aktuellen Stand auf Branch `refactoring` isoliert
- [x] Build/Lint als Baseline genutzt (`npm run lint:includes`, `npm run build`)

## Phase 2: Konventionen
- [x] `CONTRIBUTING.md` mit Naming- und Workflow-Regeln angelegt; inzwischen als historisches Dokument nach `docs/archive/CONTRIBUTING.md` verschoben

## Phase 3: CSS modularisieren
- [x] `src/css/modules/` eingefuehrt
- [x] `manifest.json` fuer feste Lade-Reihenfolge eingefuehrt
- [x] Build auf CSS-Bundling aus Modulen umgestellt
- [x] `lint:css-modules` fuer Manifest-/Modul-Konsistenz eingefuehrt

## Phase 4: Worker modularisieren
- [x] `src/workers/core/`, `src/workers/compute/`, `src/workers/rolls/`, `src/workers/ui/` eingefuehrt
- [x] Worker in Core/Compute/Rolls/UI-Module nach Domaenen gesplittet
- [x] `sheet-worker.html` auf modulare Includes umgestellt

## Phase 5: Wiederverwendbare Muster
- [x] bestehende HTML-Partial-Struktur beibehalten und dokumentiert
- [x] UI-Pattern-Grundlagen in bestehender Projekt- und Pfad-Doku sowie CSS-/Worker-README-Dateien dokumentiert

## Phase 6: Tech Debt reduzieren
- [x] Monolithische Build-Logik in CSS-Bundling erweitert
- [x] Include-Roots sauber auf `src/html`, `src/i18n`, `src/workers` begrenzt

## Phase 7: Doku/Onboarding
- [x] `docs/architecture.md`
- [x] `docs/path-map.md`
- [x] `docs/archive/CONTRIBUTING.md`
- [x] `docs/archive/roll20-cse-checklist.md` als historische CSE-Checkliste erhalten
- [x] `src/css/modules/README.md`
- [x] `src/workers/README.md`

## Doku-Status nach Refactor

- Root-Dokumente wurden nach `docs/` verschoben, damit die Projektwurzel schlanker bleibt.
- Nicht mehr vorhandene Detaildokus wie `docs/adding-a-box.md`, `docs/worker-flow.md` und `docs/ui-patterns.md` werden nicht mehr als operative Dateien gefuehrt.
- Die operative Orientierung fuer neue Arbeiten liegt aktuell in `readme.md`, `docs/architecture.md`, `docs/path-map.md` und den Refactor-Dokumenten unter `docs/refactoring/`.
