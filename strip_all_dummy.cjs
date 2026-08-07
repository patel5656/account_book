const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintTemplates.jsx', 'utf8');

// Replace || 'something' with || ''
// But preserve things like || '0.00', || 'TAX INVOICE', colors etc. if we want.
// Actually, it's safer to just remove all string fallbacks unless they are numbers or color codes.
content = content.replace(/\|\|\s*'([^']*)'/g, (match, p1) => {
  if (
    p1 === '0.00' || 
    p1 === '0' || 
    p1.startsWith('#') || 
    p1 === 'TAX INVOICE' || 
    p1 === 'INVOICE' || 
    p1 === '-'
  ) {
    return match;
  }
  return `|| ''`;
});

// Also replace || "something" just in case
content = content.replace(/\|\|\s*"([^"]*)"/g, (match, p1) => {
  if (
    p1 === '0.00' || 
    p1 === '0' || 
    p1.startsWith('#') || 
    p1 === 'TAX INVOICE' || 
    p1 === 'INVOICE' || 
    p1 === '-'
  ) {
    return match;
  }
  return `|| ''`;
});

// Also replace ternary fallbacks like ? '259.00' : '259.00' if they exist, but let's just do || '259.00'
content = content.replace(/:\s*'([^']*)'/g, (match, p1) => {
    // This might be risky, e.g., style={{ color: themeColor ? 'red' : 'blue' }}
    // Let's only target specific known dummy data like '259.00', '48.00', '518.00'
    if (['259.00', '48.00', '518.00', '80.00', '40.00'].includes(p1)) {
        return `: '0.00'`;
    }
    return match;
});

// And replace totalCgst || '0.00' to ensure no dummy numbers are hardcoded where variables exist 
// wait, we allowed '0.00' above. That's fine.

fs.writeFileSync('os_frontend/src/pages/PrintTemplates.jsx', content);
console.log('Stripped all dummy fallbacks from all templates!');
