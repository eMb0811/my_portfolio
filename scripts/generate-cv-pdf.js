import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const htmlPath = path.join(rootDir, 'public', 'cv.html');
const pdfPath = path.join(rootDir, 'public', 'cv-mouhamed-barry.pdf');

const chromePaths = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'google-chrome',
  'chromium',
  'chromium-browser'
];

let browserPath = chromePaths.find(p => fs.existsSync(p));

if (!browserPath) {
  browserPath = 'chrome';
}

console.log(`Génération du PDF depuis ${htmlPath} vers ${pdfPath}...`);
const cmd = `"${browserPath}" --headless=new --no-sandbox --disable-gpu --run-all-compositor-stages-before-draw --no-pdf-header-footer --print-to-pdf="${pdfPath}" "file:///${htmlPath.replace(/\\/g, '/')}"`;

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('✅ PDF généré avec succès !');
} catch (error) {
  console.error('❌ Erreur lors de la génération du PDF :', error.message);
}
