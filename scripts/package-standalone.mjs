import { readFile, rename, stat } from 'node:fs/promises';
import { resolve } from 'node:path';

const source = resolve('release/index.html');
const target = resolve('release/GIPS.html');

await rename(source, target);

const html = await readFile(target, 'utf8');
const externalAssets = [
  ...html.matchAll(/<(?:script|img)[^>]+src=["'](?!data:)([^"']+)/gi),
  ...html.matchAll(/<link[^>]+href=["'](?!data:)([^"']+)/gi),
];

if (externalAssets.length > 0) {
  throw new Error(`Standalone package contains external assets: ${externalAssets.map((match) => match[1]).join(', ')}`);
}

const { size } = await stat(target);
console.log(`Standalone GIPS package: ${target} (${(size / 1024 / 1024).toFixed(2)} MiB)`);

// Include base64 overhead in the report: these are bytes actually shipped in HTML.
const embedded = new Map();
for (const [, mime, body] of html.matchAll(/data:([^;,"\s]+);base64,([A-Za-z0-9+/=]+)/g)) {
  const entry = embedded.get(mime) ?? { count: 0, bytes: 0 };
  entry.count += 1;
  entry.bytes += body.length;
  embedded.set(mime, entry);
}
for (const [mime, { count, bytes }] of [...embedded].sort((a, b) => b[1].bytes - a[1].bytes)) {
  console.log(`  ${mime}: ${count} assets, ${(bytes / 1024 / 1024).toFixed(2)} MiB`);
}
const sizeBudget = 9 * 1024 * 1024;
if (size > sizeBudget) {
  throw new Error(`Standalone exceeds the 9 MiB budget. Optimize new assets before shipping (${(size / 1024 / 1024).toFixed(2)} MiB).`);
}
