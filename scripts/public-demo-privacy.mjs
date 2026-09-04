import fs from 'node:fs';
import path from 'node:path';

const publicSource = path.resolve('app');
const forbidden = [
  /\bbubba\b/i,
  /\bhelen\b/i,
  /\bbilly\s+(?:w\.?\s+)?bell(?:\s+jr\.?)?\b/i,
  /billywbell/i,
];
const sourceExtensions = new Set(['.js', '.jsx', '.ts', '.tsx', '.md', '.mdx', '.json']);
const failures = [];

function scan(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      scan(fullPath);
      continue;
    }
    if (!sourceExtensions.has(path.extname(entry.name))) continue;
    const source = fs.readFileSync(fullPath, 'utf8');
    for (const pattern of forbidden) {
      if (pattern.test(source)) failures.push(`${path.relative(process.cwd(), fullPath)} matched ${pattern}`);
    }
  }
}

scan(publicSource);

if (failures.length) {
  console.error('FAIL: personal names found in public website source');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PASS: public website source contains no Bubba, Helen, Billy Bell, or billywbell references');
