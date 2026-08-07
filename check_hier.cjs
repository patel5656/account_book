const fs = require('fs');
const content = fs.readFileSync('src/pages/BarcodePage.jsx', 'utf-8');
const lines = content.split('\n');
const printIndex = lines.findIndex(l => l.includes('qr-print-section"'));
console.log('qr-print-section is at line ' + printIndex);
let level = 0;
for (let i = printIndex; i >= 0; i--) {
  if (lines[i].includes('</div')) level++;
  if (lines[i].includes('<div')) level--;
  if (level < 0) {
    console.log('Parent at line ' + i + ': ' + lines[i].trim());
    level = 0;
  }
}
