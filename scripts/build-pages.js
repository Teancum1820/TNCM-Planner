const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const validation = spawnSync(process.execPath, [path.join('scripts', 'validate-app.js')], { stdio: 'inherit' });
if (validation.status !== 0) {
  process.exit(validation.status ?? 1);
}

const outputDir = path.join(process.cwd(), 'dist');
const filesToPublish = [
  '.nojekyll',
  'index.html',
  'manifest.webmanifest',
  'service-worker.js',
  'src',
  'icons',
];

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

for (const file of filesToPublish) {
  const from = path.join(process.cwd(), file);
  const to = path.join(outputDir, file);
  fs.cpSync(from, to, { recursive: true });
}

console.log(`GitHub Pages artifact prepared in ${path.relative(process.cwd(), outputDir)}.`);
