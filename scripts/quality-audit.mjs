/**
 * Dependency-free project quality audit for SightSteps.
 * Run: npm run audit
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import questions from '../src/data/questions.js';
import translations from '../src/data/i18n.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
let passed = 0;
let failed = 0;
function check(ok, description) {
  if (ok) passed += 1;
  else {
    failed += 1;
    console.error(`FAIL: ${description}`);
  }
}
function read(path) {
  return readFileSync(join(root, path), 'utf8');
}
function collect(dir) {
  return readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory() ? collect(path) : [path];
  });
}
function resolveLocalImport(fromFile, importPath) {
  const base = resolve(root, dirname(fromFile), importPath);
  const candidates = [base, ...['.js', '.jsx', '.mjs', '.css', '.json'].map((ext) => `${base}${ext}`),
    join(base, 'index.js'), join(base, 'index.jsx')];
  return candidates.find((candidate) => existsSync(candidate));
}
function luminance(hex) {
  const raw = hex.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(raw)) return null;
  const channels = [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16) / 255);
  const linear = channels.map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0¶»§q«^