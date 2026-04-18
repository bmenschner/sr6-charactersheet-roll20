# Refactoring Checklist (Status)

## Phase 1: Stabilisieren
- [x] Aktuellen Stand auf Branch `refactoring` isoliert
- [x] Build/Lint als Baseline genutzt (`npm run lint:includes`, `npm run build`)

## Phase 2: Konventionen
- [x] `CONTRIBUTING.md` mit Naming- und Workflow-Regeln angelegt

## Phase 3: CSS modularisieren
- [x] `src/css/modules/` eingefuehrt
- [x] `manifest.json` fuer feste Lade-Reihenfolge eingefuehrt
- [x] Build auf CSS-Bundling aus Modulen umgestellt
- [x] `lint:css-modules` fuer Manifest-/Modul-Konsistenz eingefuehrt

## Phase 4: Worker modularisieren
- [x] `src/workers/core/`, `src/workers/compute/`, `src/workers/ui/` eingefuehrt
- [x] Worker in Core/Compute/UI-Module nach Domaenen gesplittet
- [x] `sheet-worker.html` auf modulare Includes umgestellt

## Phase 5: Wiederverwendbare Muster
- [x] bestehende HTML-Partial-Struktur beibehalten und dokumentiert
- [x] UI-Pattern-Doku fuer Team-Weiterentwicklung erstellt

## Phase 6: Tech Debt reduzieren
- [x] Monolithische Build-Logik in CSS-Bundling erweitert
- [x] Include-Roots sauber auf `src/html`, `src/i18n`, `src/workers` begrenzt

## Phase 7: Doku/Onboarding
- [x] `docs/architecture.md`
- [x] `docs/adding-a-box.md`
- [x] `docs/worker-flow.md`
- [x] `docs/ui-patterns.md`
- [x] `src/css/modules/README.md`
- [x] `src/workers/README.md`
