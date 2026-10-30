// Verifies the production bundle split after `npm run build`:
// the entry chunk carries no three.js, no 3D chunk is modulepreloaded,
// three is bundled exactly once, and the showcase entry exists.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const dist = 'dist';
const assets = join(dist, 'assets');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const js = readdirSync(assets).filter((f) => f.endsWith('.js'));
const read = (f) => readFileSync(join(assets, f), 'utf8');
const failures = [];

// Any base path (e.g. /<repo>/ on GitHub Pages) may precede assets/.
const entry = html.match(/<script[^>]+src="[^"]*?assets\/([^"]+\.js)"/)?.[1];
if (!entry) failures.push('entry script not found in index.html');
else if (read(entry).includes('WebGLRenderer')) failures.push(`entry chunk ${entry} contains WebGLRenderer`);

for (const name of ['SceneCanvas', 'ShowcaseCanvas']) {
  if (new RegExp(`modulepreload[^>]+${name}`).test(html)) failures.push(`index.html modulepreloads ${name}`);
}

const defining = js.filter((f) => /\.isWebGLRenderer=!0|this\.isWebGLRenderer=true|isWebGLRenderer=!0/.test(read(f)));
if (defining.length !== 1) failures.push(`expected WebGLRenderer defined in exactly 1 chunk, found ${defining.length}: ${defining.join(', ')}`);

if (!js.some((f) => f.startsWith('ShowcaseCanvas-'))) failures.push('ShowcaseCanvas-*.js chunk missing');

const rows = js
  .map((f) => {
    const buf = readFileSync(join(assets, f));
    return { file: f, kB: (statSync(join(assets, f)).size / 1024).toFixed(1), gzipKB: (gzipSync(buf).length / 1024).toFixed(1) };
  })
  .sort((a, b) => Number(b.kB) - Number(a.kB));
console.table(rows);

if (failures.length) {
  console.error('check-bundle FAILED:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('check-bundle OK');
