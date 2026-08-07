const fs = require('fs');
const content = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8');

const startMarker = '{/* 1. Header Section */}';
const endMarker = ') : (';
const a4Start = content.indexOf(startMarker);
const a4End = content.indexOf(endMarker, a4Start);

if (a4Start === -1 || a4End === -1) {
    console.error('Markers not found');
    process.exit(1);
}

let a4Block = content.substring(a4Start, a4End);
// Remove the '</div>' at the very end which belongs to the wrapping div in PrintSetting
const lastDiv = a4Block.lastIndexOf('</div>');
a4Block = a4Block.substring(0, lastDiv).trim();

const fileContent = `import React from 'react';

export const Template1 = ({
  previewInvoice, parsedItems, totalQty, totalTaxable, totalFinal, qrCodeUrl, 
  allPrintSettings, headerSettings, tableSettings, footerSettings, 
  customization, transactionType, transactionType2
}) => {
  return (
    <>
      ${a4Block}
    </>
  );
};
`;

fs.writeFileSync('os_frontend/src/pages/PrintTemplates.jsx', fileContent);
console.log('Successfully created Template1 in PrintTemplates.jsx');
