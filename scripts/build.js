#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const outputDir = path.join(rootDir, 'output');
const outputImagesDir = path.join(outputDir, 'assets', 'images');

const SOURCE_FILES = [
  { from: path.join(srcDir, 'html', 'charactersheet.html'), to: path.join(outputDir, 'charactersheet.html') },
  { from: path.join(srcDir, 'css', 'charactersheet.css'), to: path.join(outputDir, 'charactersheet.css') },
  { from: path.join(srcDir, 'i18n', 'translation.json'), to: path.join(outputDir, 'translation.full.json') }
];

const ASSET_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif']);

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyFile(fromPath, toPath) {
  ensureDir(path.dirname(toPath));
  fs.copyFileSync(fromPath, toPath);
  const fromRel = path.relative(rootDir, fromPath);
  const toRel = path.relative(rootDir, toPath);
  console.log(`[build] copied ${fromRel} -> ${toRel}`);
}

function copyMainSources() {
  SOURCE_FILES.forEach(({ from, to }) => {
    if (!fs.existsSync(from)) {
      throw new Error(`Missing source file: ${path.relative(rootDir, from)}`);
    }
    copyFile(from, to);
  });
}

function writeRoll20CompatibilityFiles() {
  const i18nSource = path.join(srcDir, 'i18n', 'translation.json');

  const i18nRaw = fs.readFileSync(i18nSource, 'utf8');
  const i18n = JSON.parse(i18nRaw);
  const de = i18n.de && typeof i18n.de === 'object' ? i18n.de : i18n;

  const translationTarget = path.join(outputDir, 'translation.json');
  ensureDir(path.dirname(translationTarget));
  fs.writeFileSync(translationTarget, `${JSON.stringify(de, null, 2)}\n`, 'utf8');
  console.log(`[build] wrote ${path.relative(rootDir, translationTarget)} (flat roll20 format)`);
}

function copyStaticAssets() {
  ensureDir(outputImagesDir);
  const srcEntries = fs.readdirSync(srcDir, { withFileTypes: true });

  srcEntries
    .filter((entry) => entry.isFile())
    .filter((entry) => ASSET_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .forEach((entry) => {
      const fromPath = path.join(srcDir, entry.name);
      const toPath = path.join(outputImagesDir, entry.name);
      copyFile(fromPath, toPath);
    });
}

function runBuild() {
  console.log('[build] start');
  ensureDir(outputDir);
  copyMainSources();
  writeRoll20CompatibilityFiles();
  copyStaticAssets();
  console.log('[build] done');
}

if (require.main === module) {
  try {
    runBuild();
  } catch (error) {
    console.error(`[build] error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { runBuild };
