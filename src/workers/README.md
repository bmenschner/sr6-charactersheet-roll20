# Worker Modules

Diese Dateien werden im Build ueber `src/html/partials/workers/sheet-worker.html` per Include in einen einzigen Roll20 Worker-Scriptblock zusammengefuehrt.

Reihenfolge ist wichtig:
1. constants
2. helpers
3. recompute
4. ui-state
5. events
