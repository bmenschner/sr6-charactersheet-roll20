#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcHtmlDir = path.join(rootDir, 'src', 'html');
const entryFile = path.join(srcHtmlDir, 'charactersheet.html');
const INCLUDE_PATTERN = /<!--\s*@include\s+([^\s]+)\s*-->/g;

function normalize(filePath) {
  return path.resolve(filePath);
}

function assertInsideSrcHtml(filePath) {
  const normalized = normalize(filePath);
  if (!normalized.startsWith(srcHtmlDir + path.sep)) {
    throw new Error(`Include outside src/html is not allowed: ${path.relative(rootDir, normalized)}`);
  }
  return normalized;
}

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
