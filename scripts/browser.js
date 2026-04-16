#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const profileDir = path.join(rootDir, '.local', 'chromium-profile-roll20');
const startUrl = process.env.ROLL20_URL || 'https://app.roll20.net/editor/';

const candidates = [
  process.env.CHROME_BIN,
  'chromium',
  'chromium-browser',
  'google-chrome',
  'google-chrome-stable'
].filter(Boolean);

function tryLaunch(index = 0) {
  if (index >= candidates.length) {
    console.error('[browser] No Chromium executable found. Set CHROME_BIN to your local Chromium path.');
    process.exit(1);
  }

  const command = candidates[index];
  const args = [
    `--user-data-dir=${profileDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    startUrl
  ];

  const child = spawn(command, args, {
    stdio: 'ignore',
    detached: true
  });

  child.on('error', () => tryLaunch(index + 1));
  child.unref();
  console.log(`[browser] launched with ${command}`);
  console.log(`[browser] profile dir: ${path.relative(rootDir, profileDir)}`);
  console.log('[browser] login and extension setup stay manual by design.');
}

fs.mkdirSync(profileDir, { recursive: true });
tryLaunch();
