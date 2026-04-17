#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcHtmlDir = path.join(rootDir, 'src', 'html');
const srcI18nDir = path.join(rootDir, 'src', 'i18n');
const includeRoots = [srcHtmlDir, srcI18nDir];
const entryFile = path.join(srcHtmlDir, 'charactersheet.html');
const INCLUDE_PATTERN = /<!--\s*@include\s+([^\s]+)\s*-->/g;

function normalize(filePath) {
  return path.resolve(filePath);
}

function assertInsideSrcHtml(filePath) {
  const normalized = normalize(filePath);
  const isInsideAllowedRoots = includeRoots.some((rootPath) => {
    const normalizedRootPath = normalize(rootPath);
    return (
      normalized === normalizedRootPath ||
      normalized.startsWith(normalizedRootPath + path.sep)
    );
  });

  if (!isInsideAllowedRoots) {
    throw new Error(
      `Include outside allowed roots is not allowed: ${path.relative(rootDir, normalized)}`
    );
  }
  return normalized;
}

// Recursively traverses include graph and validates existence/scope/loop safety.
function walkIncludes(filePath, stack = [], stats = { files: new Set(), includes: 0 }) {
  const normalized = assertInsideSrcHtml(filePath);
  const rel = path.relative(rootDir, normalized);

  if (!fs.existsSync(normalized)) {
    throw new Error(`Missing include file: ${rel}`);
  }

  if (stack.includes(normalized)) {
    const loop = [...stack, normalized].map((entry) => path.relative(rootDir, entry)).join(' -> ');
    throw new Error(`Include loop detected: ${loop}`);
  }

  stats.files.add(normalized);
  const content = fs.readFileSync(normalized, 'utf8');
  const nextStack = [...stack, normalized];
  const includePattern = new RegExp(INCLUDE_PATTERN.source, 'g');

  let match;
  while ((match = includePattern.exec(content)) !== null) {
    const includeRef = match[1];
    const includePath = assertInsideSrcHtml(path.resolve(path.dirname(normalized), includeRef));
    stats.includes += 1;
    walkIncludes(includePath, nextStack, stats);
  }

  return stats;
}

// Lint entrypoint used in CI/local scripts before build/watch.
function run() {
  if (!fs.existsSync(entryFile)) {
    throw new Error(`Missing entry file: ${path.relative(rootDir, entryFile)}`);
  }

  const result = walkIncludes(entryFile);
  console.log(
    `[lint:includes] ok (${result.files.size} files, ${result.includes} include references)`
  );
}

if (require.main === module) {
  try {
    run();
  } catch (error) {
    console.error(`[lint:includes] error: ${error.message}`);
    process.exit(1);
  }
}
