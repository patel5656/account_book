const fs = require('fs');
let content = fs.readFileSync('src/pages/BarcodePage.jsx', 'utf-8');

const lines = content.split('\n');
const startIndex = lines.findIndex(l => l.includes('if (tmplElements && tmplElements.length > 0) {'));
if (startIndex !== -1) {
    const endIndex = lines.findIndex((l, i) => i > startIndex && l.includes('// Enforce Render Static Template'));
    if (endIndex !== -1) {
        lines.splice(startIndex, endIndex - startIndex);
        fs.writeFileSync('src/pages/BarcodePage.jsx', lines.join('\n'));
        console.log('Removed dynamic block');
    }
}
