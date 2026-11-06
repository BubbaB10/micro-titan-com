// node --test tests/header-logo.test.mjs — P2 item 9 header logo restore.
// Source pins only: no network, no secrets.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const headerSrc = fs.readFileSync(path.join(root, 'app', 'components', 'VisionHeader.tsx'), 'utf8');
const cssSrc = fs.readFileSync(path.join(root, 'app', 'vision-home.css'), 'utf8');
const shellSrc = fs.readFileSync(path.join(root, 'app', 'components', 'ServicesShell.tsx'), 'utf8');
const logoPath = path.join(root, 'public', 'logo-512.png');

test('public brand logo asset exists for the header', () => {
  assert.ok(fs.existsSync(logoPath), 'public/logo-512.png must exist');
  assert.ok(fs.statSync(logoPath).size > 1000, 'logo file should be a real PNG');
});

test('vision header uses the brand logo image, not the MT text tile', () => {
  assert.match(headerSrc, /logo-512\.png/);
  assert.match(headerSrc, /mtv-brand-logo/);
  assert.match(headerSrc, /alt="Micro Titan"/);
  assert.match(headerSrc, /href="\/"/);
  assert.ok(!headerSrc.includes('>MT</span>'), 'must not render MT initials tile');
  assert.ok(!/>MT</.test(headerSrc), 'must not contain MT text mark');
});

test('vision brand tile styles host the logo image', () => {
  assert.match(cssSrc, /\.mtv-brand-logo/);
  assert.match(cssSrc, /object-fit:\s*cover/);
  assert.ok(!cssSrc.includes('linear-gradient(145deg,#773af7,#4221cf)'), 'purple MT tile gradient removed');
});

test('non-vision services header still keeps the SVG brand mark', () => {
  assert.match(shellSrc, /service-brand/);
  assert.match(shellSrc, /viewBox="243 160 653 433"/);
});
