const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8');

// Replace specific dummy data in PrintSetting.jsx
content = content.replace(/\|\|\s*'Walk-in Customer'/g, "|| ''");
content = content.replace(/\|\|\s*'Local'/g, "|| ''");
content = content.replace(/\|\|\s*'MA22\/2348'/g, "|| ''");
content = content.replace(/:\s*'28-05-2026'/g, ": ''");
content = content.replace(/\|\|\s*'24AADCD6XXXXXXX'/g, "|| ''");
content = content.replace(/\|\|\s*'1234567891'/g, "|| ''");
content = content.replace(/\|\|\s*'EDqARXXXXX'/g, "|| ''");
content = content.replace(/:\s*'4,365\.00'/g, ": '0.00'");
content = content.replace(/\|\|\s*'Cash \/ Bank Transfer'/g, "|| ''");
// Check for template 1 dummy data that might be there
content = content.replace(/\|\|\s*'NISHIT'/gi, "|| ''");
content = content.replace(/\|\|\s*'ABC ENTERPRISES'/gi, "|| ''");
content = content.replace(/\|\|\s*'A-406,.*?'/g, "|| ''");
content = content.replace(/\|\|\s*'9XXXXXX321 \| 9XXXXXX321'/gi, "|| ''");

fs.writeFileSync('os_frontend/src/pages/PrintSetting.jsx', content);
console.log('Cleaned dummy data from PrintSetting.jsx');
