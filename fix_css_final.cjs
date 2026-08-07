const fs = require('fs');
let content = fs.readFileSync('src/pages/BarcodePage.jsx', 'utf-8');

const newStyle = `@media print {
            @page {
              size: \${activeTemplate?.pageWidth || '50mm'} \${activeTemplate?.pageHeight || '25mm'};
              margin: \${activeTemplate?.marginTop || '0mm'} \${activeTemplate?.marginRight || '0mm'} \${activeTemplate?.marginBottom || '0mm'} \${activeTemplate?.marginLeft || '0mm'};
            }
            html, body, #root {
              margin: 0 !important;
              padding: 0 !important;
              background-color: white !important;
              height: auto !important;
              min-height: 0 !important;
            }
            body * { visibility: hidden; }
            #qr-print-section, #qr-print-section * { visibility: visible; }
            
            #qr-print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: flex;
              flex-wrap: wrap;
              gap: \${activeTemplate?.labelGap || '2mm'};
              padding: 0;
              margin: 0;
            }
            .print-item {
              width: \${activeTemplate?.pageWidth || '50mm'};
              height: \${activeTemplate?.pageHeight || '25mm'};
              overflow: hidden;
              box-sizing: border-box;
              margin: 0;
              padding: 1.5mm;
              \${pageBreak === 'Yes' ? 'page-break-after: always; break-after: page;' : 'page-break-inside: avoid; break-inside: avoid;'}
            }
          }`;

content = content.replace(/@media print \{[\s\S]*?\.print-item \{[\s\S]*?\}[\s\S]*?\}/, newStyle);

fs.writeFileSync('src/pages/BarcodePage.jsx', content);
console.log('Fixed CSS');
