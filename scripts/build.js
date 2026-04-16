#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const outputAssetsDir = path.join(rootDir, 'output', 'assets');
const outputImagesDir = path.join(outputAssetsDir, 'images');

const SOURCE_FILES = [
  { from: path.join(srcDir, 'html', 'charactersheet.html'), to: path.join(outputAssetsDir, 'charactersheet.html') },
  { from: path.join(srcDir, 'css', 'charactersheet.css'), to: path.join(outputAssetsDir, 'charactersheet.css') },
  { from: path.join(srcDir, 'i18n', 'translation.json'), to: path.join(outputAssetsDir, 'translation.full.json') }
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
  const htmlSource = path.join(srcDir, 'html', 'charactersheet.html');
  const cssSource = path.join(srcDir, 'css', 'charactersheet.css');
  const i18nSource = path.join(srcDir, 'i18n', 'translation.json');

  copyFile(htmlSource, path.join(outputAssetsDir, 'character_sheet.html'));
  copyFile(cssSource, path.join(outputAssetsDir, 'character_sheet.css'));

  const i18nRaw = fs.readFileSync(i18nSource, 'utf8');
  const i18n = JSON.parse(i18nRaw);
  const de = i18n.de && typeof i18n.de === 'object' ? i18n.de : i18n;

  const translationTarget = path.join(outputAssetsDir, 'translation.json');
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
  ensureDir(outputAssetsDir);
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
