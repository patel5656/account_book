const fs = require('fs');
const content = fs.readFileSync('c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx', 'utf8');

let lines = content.split('\n');
let depth = 0;
let output = [];
for (let i = 240; i < 440; i++) {
  let line = lines[i];
  if (line === undefined) continue;
  
  // Count un-closed opening tags and closing tags naively
  let opens = (line.match(/<div/g) || []).length;
  let closes = (line.match(/<\/div>/g) || []).length;
  
  if (opens > 0 || closes > 0 || line.includes('Footer Text') || line.includes('Totals') || line.includes('Table')) {
    let oldDepth = depth;
    depth += opens - closes;
    output.push(`${i+1}: [${oldDepth}->${depth}] ${line.trim()}`);
  }
}
fs.writeFileSync('parse_out.txt', output.join('\n'));
