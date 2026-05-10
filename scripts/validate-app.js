const fs = require('node:fs');
const path = require('node:path');

const requiredFiles = [
  'index.html',
  'src/main.js',
  'src/styles.css',
  'manifest.webmanifest',
  'service-worker.js',
  'icons/icon-192.svg',
  'icons/icon-512.svg',
];

const missing = requiredFiles.filter((file) => !fs.existsSync(path.join(process.cwd(), file)));
if (missing.length) {
  console.error(`Missing required PWA files: ${missing.join(', ')}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync('manifest.webmanifest', 'utf8'));
const requiredManifestFields = ['name', 'short_name', 'start_url', 'display', 'icons'];
const missingManifestFields = requiredManifestFields.filter((field) => !manifest[field]);
if (missingManifestFields.length) {
  console.error(`Manifest is missing: ${missingManifestFields.join(', ')}`);
  process.exit(1);
}

const main = fs.readFileSync('src/main.js', 'utf8');
for (const phrase of ['Scripture study', 'Prayer', 'serviceWorker', 'orderTasks']) {
  if (!main.includes(phrase)) {
    console.error(`Expected application logic to include "${phrase}".`);
    process.exit(1);
  }
}

console.log('PWA files, manifest, and faith-first planner logic validated.');
