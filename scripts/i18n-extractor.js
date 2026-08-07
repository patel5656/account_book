// scripts/i18n-extractor.js
// Simple extraction script to replace hard‑coded JSX strings with i18next keys.
// Note: This is a basic implementation and may need manual tweaks for complex cases.

import fs from 'fs';
import path from 'path';
import glob from 'glob';

const srcDir = path.resolve(__dirname, '..', 'src');
const enPath = path.resolve(srcDir, 'locales', 'en', 'translation.json');
const hiPath = path.resolve(srcDir, 'locales', 'hi', 'translation.json');

let enTranslations = {};
let hiTranslations = {};
if (fs.existsSync(enPath)) enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
if (fs.existsSync(hiPath)) hiTranslations = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

function ensureUseTranslation(fileContent) {
  if (!/useTranslation/.test(fileContent)) {
    const lines = fileContent.split('\n');
    const reactImportIdx = lines.findIndex(l => l.includes('react'));
    lines.splice(reactImportIdx + 1, 0, "import { useTranslation } from 'react-i18next';");
    return lines.join('\n');
  }
  return fileContent;
}

function processFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(srcDir, file);
  const baseKey = relPath.replace(/\.jsx?$/, '').replace(/[\\/\\\\]/g, '.');

  const regex = /\>\s*([^<>{}]+?)\s*<\//g;
  let match;
  let index = 0;
  while ((match = regex.exec(content)) !== null) {
    const original = match[1].trim();
    if (!original) continue;
    const key = `${baseKey}.txt${index}`;
    if (!(key in enTranslations)) enTranslations[key] = original;
    if (!(key in hiTranslations)) hiTranslations[key] = original;
    const newFull = `>{t('${key}')}<`;
    content = content.slice(0, match.index) + newFull + content.slice(regex.lastIndex);
    regex.lastIndex = match.index + newFull.length;
    index++;
  }

  content = ensureUseTranslation(content);

  if (!/const \{\s*t\s*\}\s*=\s*useTranslation/.test(content)) {
    const funcMatch = content.match(/function\s+\w+\s*\([^)]*\)\s*\{/);
    if (funcMatch) {
      const insertPos = funcMatch.index + funcMatch[0].length;
      content = content.slice(0, insertPos) + "\n  const { t } = useTranslation();" + content.slice(insertPos);
    }
  }

  fs.writeFileSync(file, content, 'utf8');
}

const files = glob.sync(path.join(srcDir, '**', '*.jsx'));
files.forEach(processFile);

fs.writeFileSync(enPath, JSON.stringify(enTranslations, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hiTranslations, null, 2), 'utf8');

console.log('i18n extraction completed. Updated', files.length, 'files.');
