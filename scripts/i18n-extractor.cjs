// scripts/i18n-extractor.cjs
// Extraction script using @babel/parser and @babel/traverse to replace hard‑coded strings with i18next keys.

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const srcDir = path.resolve(__dirname, '..', 'src');
const enPath = path.resolve(srcDir, 'locales', 'en', 'translation.json');
const hiPath = path.resolve(srcDir, 'locales', 'hi', 'translation.json');

let enTranslations = {};
let hiTranslations = {};
if (fs.existsSync(enPath)) enTranslations = JSON.parse(fs.readFileSync(enPath, 'utf8'));
if (fs.existsSync(hiPath)) hiTranslations = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

function ensureImportAndHook(content) {
  // Ensure import of useTranslation if not present
  if (!/useTranslation/.test(content)) {
    const lines = content.split('\n');
    const reactIdx = lines.findIndex(l => l.includes('react'));
    lines.splice(reactIdx + 1, 0, "import { useTranslation } from 'react-i18next';");
    content = lines.join('\n');
  }
  // Ensure const { t } = useTranslation(); inside function component
  if (!/const\s*\{\s*t\s*\}\s*=\s*useTranslation/.test(content)) {
    const funcMatch = content.match(/function\s+\w+\s*\([^)]*\)\s*\{/);
    if (funcMatch) {
      const insertPos = funcMatch.index + funcMatch[0].length;
      content = content.slice(0, insertPos) + "\n  const { t } = useTranslation();" + content.slice(insertPos);
    }
  }
  return content;
}

function generateKey(base, index) {
  return `${base}.txt${index}`;
}

function processFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(srcDir, file);
  const baseKey = relPath.replace(/\.jsx?$/,'').replace(/[\\/]/g, '.');

  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx']
  });

  let index = 0;
  const replacements = [];

  traverse(ast, {
    JSXText(pathNode) {
      const text = pathNode.node.value.trim();
      if (!text) return;
      const key = generateKey(baseKey, index++);
      if (!(key in enTranslations)) enTranslations[key] = text;
      if (!(key in hiTranslations)) hiTranslations[key] = text;
      const start = pathNode.node.start;
      const end = pathNode.node.end;
      replacements.push({ start, end, replacement: `{t('${key}')}` });
    },
    JSXAttribute(pathNode) {
      const attr = pathNode.node;
      if (attr.value && attr.value.type === 'StringLiteral') {
        const text = attr.value.value;
        if (!text) return;
        const key = generateKey(baseKey, index++);
        if (!(key in enTranslations)) enTranslations[key] = text;
        if (!(key in hiTranslations)) hiTranslations[key] = text;
        const start = attr.value.start;
        const end = attr.value.end;
        // replace with {t('key')}
        replacements.push({ start, end, replacement: `{t('${key}')}` });
      }
    }
  });

  // Apply replacements in reverse order to keep offsets valid
  replacements.sort((a,b) => b.start - a.start);
  for (const rep of replacements) {
    code = code.slice(0, rep.start) + rep.replacement + code.slice(rep.end);
  }

  code = ensureImportAndHook(code);
  fs.writeFileSync(file, code, 'utf8');
}

const files = glob.sync(path.join(srcDir, '**', '*.jsx'));
files.forEach(processFile);

fs.writeFileSync(enPath, JSON.stringify(enTranslations, null, 2), 'utf8');
fs.writeFileSync(hiPath, JSON.stringify(hiTranslations, null, 2), 'utf8');

console.log('i18n extraction completed. Updated', files.length, 'files.');
