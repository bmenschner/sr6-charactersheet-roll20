#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');
const htmlDir = path.join(srcDir, 'html');
const i18nDir = path.join(srcDir, 'i18n');
const workersDir = path.join(srcDir, 'workers');
const cssDir = path.join(srcDir, 'css');
const cssModulesDir = path.join(cssDir, 'modules');
const cssManifestPath = path.join(cssModulesDir, 'manifest.json');
const srcImagesDir = path.join(srcDir, 'assets', 'images');
const outputDir = path.join(rootDir, 'output');
const outputImagesDir = path.join(outputDir, 'assets', 'images');
const htmlSourcePath = path.join(htmlDir, 'charactersheet.html');
const htmlTargetPath = path.join(outputDir, 'charactersheet.html');
const cssTargetPath = path.join(outputDir, 'charactersheet.css');
const INCLUDE_PATTERN = /<!--\s*@include\s+([^\s]+)\s*-->/g;
const INCLUDE_ROOTS = [htmlDir, i18nDir, workersDir];

const SOURCE_FILES = [
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

function isInsideRoot(filePath, rootPath) {
  const normalizedFilePath = path.resolve(filePath);
  const normalizedRootPath = path.resolve(rootPath);
  return (
    normalizedFilePath === normalizedRootPath ||
    normalizedFilePath.startsWith(normalizedRootPath + path.sep)
  );
}

function assertAllowedIncludePath(filePath) {
  if (!INCLUDE_ROOTS.some((rootPath) => isInsideRoot(filePath, rootPath))) {
    throw new Error(
      `Include outside allowed roots is not allowed: ${path.relative(rootDir, filePath)}`
    );
  }
}

// Resolves nested includes from src/html and allowed sibling roots while preventing loops/path escapes.
function resolveHtmlIncludes(filePath, stack = []) {
  const normalizedPath = path.resolve(filePath);
  const fileRel = path.relative(rootDir, normalizedPath);

  if (stack.includes(normalizedPath)) {
    const loop = [...stack, normalizedPath]
      .map((entry) => path.relative(rootDir, entry))
      .join(' -> ');
    throw new Error(`Include loop detected: ${loop}`);
  }

  if (!fs.existsSync(normalizedPath)) {
    throw new Error(`Missing html source file: ${fileRel}`);
  }

  const nextStack = [...stack, normalizedPath];
  const fileBody = fs.readFileSync(normalizedPath, 'utf8');
  return fileBody.replace(INCLUDE_PATTERN, (_, includeRef) => {
    const includePath = path.resolve(path.dirname(normalizedPath), includeRef);
    assertAllowedIncludePath(includePath);

    return resolveHtmlIncludes(includePath, nextStack);
  });
}

// Builds the single Roll20 HTML artifact from the modular source structure.
function buildCharactersheetHtml() {
  const htmlOutput = resolveHtmlIncludes(htmlSourcePath);
  ensureDir(path.dirname(htmlTargetPath));
  fs.writeFileSync(htmlTargetPath, htmlOutput, 'utf8');
  console.log(`[build] wrote ${path.relative(rootDir, htmlTargetPath)} (html includes resolved)`);
}

function getCssModuleOrder() {
  if (!fs.existsSync(cssManifestPath)) {
    return [path.join(cssDir, 'charactersheet.css')];
  }

  const manifestRaw = fs.readFileSync(cssManifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);
  const order = Array.isArray(manifest.order) ? manifest.order : [];

  if (order.length === 0) {
    throw new Error('CSS manifest has no entries: src/css/modules/manifest.json');
  }

  return order.map((entry) => path.join(cssModulesDir, entry));
}

// Builds the final Roll20 stylesheet from ordered css modules.
function buildCharactersheetCss() {
  const modulePaths = getCssModuleOrder();

  const parts = modulePaths.map((modulePath) => {
    if (!fs.existsSync(modulePath)) {
      throw new Error(`Missing css module: ${path.relative(rootDir, modulePath)}`);
    }

    const moduleBody = fs.readFileSync(modulePath, 'utf8').trimEnd();
    const moduleRel = path.relative(rootDir, modulePath);
    return `/* BEGIN MODULE: ${moduleRel} */\n${moduleBody}\n/* END MODULE: ${moduleRel} */`;
  });

  const cssOutput = `${parts.join('\n\n')}\n`;
  ensureDir(path.dirname(cssTargetPath));
  fs.writeFileSync(cssTargetPath, cssOutput, 'utf8');
  console.log(`[build] wrote ${path.relative(rootDir, cssTargetPath)} (css modules bundled)`);
}

// Copies direct source artifacts that are not composed (full i18n source dump).
function copyMainSources() {
  SOURCE_FILES.forEach(({ from, to }) => {
    if (!fs.existsSync(from)) {
      throw new Error(`Missing source file: ${path.relative(rootDir, from)}`);
    }
    copyFile(from, to);
  });
}

// Writes Roll20-compatible flat translation.json (de fallback) next to full translation file.
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

// Copies static image assets into output/assets/images for upload workflows.
function copyStaticAssets() {
  if (!fs.existsSync(srcImagesDir)) {
    return;
  }

  ensureDir(outputImagesDir);
  const srcEntries = fs.readdirSync(srcImagesDir, { withFileTypes: true });

  srcEntries
    .filter((entry) => entry.isFile())
    .filter((entry) => ASSET_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .forEach((entry) => {
      const fromPath = path.join(srcImagesDir, entry.name);
      const toPath = path.join(outputImagesDir, entry.name);
      copyFile(fromPath, toPath);
    });
}

// Main local build pipeline.
function runBuild() {
  console.log('[build] start');
  ensureDir(outputDir);
  buildCharactersheetHtml();
  buildCharactersheetCss();
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
