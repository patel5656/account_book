const fs = require('fs');
let content = fs.readFileSync('src/pages/BarcodePage.jsx', 'utf-8');
const lines = content.split('\n');

for (let i = 850; i < 900; i++) {
  if (lines[i].includes('bg-[#f4f6f9] min-h-[calc(100vh-60px)] flex flex-col')) {
    if (!lines[i].includes('barcode-page-container')) {
      lines[i] = lines[i].replace('flex-col"', 'flex-col barcode-page-container"');
    }
  }
}
fs.writeFileSync('src/pages/BarcodePage.jsx', lines.join('\n'));
console.log('Added barcode-page-container');
