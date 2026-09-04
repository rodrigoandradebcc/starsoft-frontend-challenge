import { cpSync, existsSync } from 'node:fs';

const targets = [
  ['.next/static', '.next/standalone/.next/static'],
  ['public', '.next/standalone/public'],
];

if (!existsSync('.next/standalone')) {
  console.error('Build ausente. Rode "npm run build" antes de "npm start".');
  process.exit(1);
}

for (const [from, to] of targets) {
  if (existsSync(from)) cpSync(from, to, { recursive: true });
}
