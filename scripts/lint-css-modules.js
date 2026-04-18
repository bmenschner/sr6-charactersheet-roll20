#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const modulesDir = path.join(rootDir, 'src', 'css', 'modules');
const manifestPath = path.join(modulesDir, 'manifest.json');

function fail(message) {
  throw new Error(message);
}

function run() {
  if (!fs.existsSync(modulesDir)) {
    fail('Missing CSS modules directory: src/css/modules');
  }

  if (!fs.existsSync(manifestPath)) {
    fail('Missing CSS manifest: src/css/modules/manifest.json');
  }

  const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
  let manifest;

  try {
    manifest = JSON.parse(manifestRaw);
  } catch (error) {
    fail(`Invalid JSON in manifest: ${error.message}`);
  }

  const order = manifest && Array.isArray(manifest.order) ? manifest.order : null;
  if (!order) {
    fail('Manifest must contain an array: { "order": [...] }');
  }

  if (order.length === 0) {
    fail('Manifest order must not be empty');
  }

  const seen = new Set();
  const duplicates = new Set();
  order.forEach((entry) => {
    if (seen.has(entry)) {
      duplicates.add(entry);
    }
    seen.add(entry);
  });

  if (duplicates.size > 0) {
    fail(`Duplicate entries in manifest: ${[...duplicates].join(', ')}`);
  }

  const diskFiles = fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((name) => name.toLowerCase().endsWith('.css'))
    .sort();

  const missingFromDisk = order.filter((entry) => !diskFiles.includes(entry));
  if (missingFromDisk.length > 0) {
    fail(`Manifest references missing css modules: ${missingFromDisk.join(', ')}`);
  }

  const missingFromManifest = diskFiles.filter((fileName) => !seen.has(fileName));
  if (missingFromManifest.length > 0) {
    fail(`CSS modules not listed in manifest.order: ${missingFromManifest.join(', ')}`);
  }

  console.log(`[lint:css-modules] ok (${order.length} modules)`);
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(`[lint:css-modules] error: ${error.message}`);
    process.exit(1);
  }
}
