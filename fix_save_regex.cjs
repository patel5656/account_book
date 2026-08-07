const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8');

const regex = /onClick=\{async \(\) => \{\s*const success = await handleDownloadPdf\(true\);\s*if \(success\) \{\s*setIsInvoiceTemplateModalOpen\(false\);\s*alert\('Print Template saved and downloaded successfully!'\);\s*\}\s*\}\}/;

const replacement = `onClick={() => {
                  setIsInvoiceTemplateModalOpen(false);
                  alert('Template format saved successfully!');
                }}`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync('os_frontend/src/pages/PrintSetting.jsx', content);
  console.log('Regex replace success!');
} else {
  console.log('Regex failed');
}
