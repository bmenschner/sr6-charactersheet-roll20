#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { runBuild } = require('./build');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

const watchedDirs = new Map();
let rebuildTimer = null;

function scheduleBuild(reason) {
  if (rebuildTimer) {
    clearTimeout(rebuildTimer);
  }

  rebuildTimer = setTimeout(() => {
    try {
      console.log(`[watch] change detected (${reason}) -> rebuild`);
      runBuild();
    } catch (error) {
      console.error(`[watch] build failed: ${error.message}`);
    }
  }, 150);
}

function watchDirectory(dirPath) {
  if (watchedDirs.has(dirPath)) {
    return;
  }

  let watcher;
  try {
    watcher = fs.watch(dirPath, { persistent: true }, (eventType, filename) => {
      const name = filename ? filename.toString() : 'unknown';
      scheduleBuild(`${eventType}:${path.relative(rootDir, path.join(dirPath, name))}`);

      if (eventType === 'rename') {
        refreshWatchers();
      }
    });
  } catch (error) {
    console.error(`[watch] could not watch ${path.relative(rootDir, dirPath)}: ${error.message}`);
    return;
  }

  watchedDirs.set(dirPath, watcher);
}

function collectDirectories(startDir) {
  const dirs = [startDir];
  const stack = [startDir];

  while (stack.length > 0) {
    const current = stack.pop();
    const entries = fs.readdirSync(current, { withFileTypes: true });

    entries
      .filter((entry) => entry.isDirectory())
      .forEach((entry) => {
        const fullPath = path.join(current, entry.name);
        dirs.push(fullPath);
        stack.push(fullPath);
      });
  }

  return dirs;
}

function closeRemovedWatchers(validDirs) {
  for (const [dirPath, watcher] of watchedDirs.entries()) {
    if (!validDirs.has(dirPath)) {
      watcher.close();
      watchedDirs.delete(dirPath);
    }
  }
}

function refreshWatchers() {
  const allDirs = collectDirectories(srcDir);
  const validSet = new Set(allDirs);

  closeRemovedWatchers(validSet);
  allDirs.forEach(watchDirectory);
}

function start() {
  if (!fs.existsSync(srcDir)) {
    console.error('[watch] missing src directory');
    process.exit(1);
  }

  runBuild();
  refreshWatchers();

  console.log('[watch] watching src/ for changes...');
}

start();
