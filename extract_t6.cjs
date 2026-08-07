const fs = require('fs');

const printSettingPath = 'os_frontend/src/pages/PrintSetting.jsx';
const printTemplatesPath = 'os_frontend/src/pages/PrintTemplates.jsx';

const content = fs.readFileSync(printSettingPath, 'utf8');
const lines = content.split('\n');

const t6Lines = lines.slice(477, 746);
const t6Content = t6Lines.join('\n');

const t6Component = `
export const Template6 = (props) => {
  const { 
    previewInvoice, parsedItems, totalQty, totalTaxable, totalFinal, qrCodeUrl, 
    allPrintSettings, headerSettings, tableSettings, footerSettings, customization, 
    transactionType, transactionType2, companyProfile
  } = props;

  const getFormatStyles = () => { return { width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }; };

  return (
${t6Content}
  );
};
`;

fs.appendFileSync(printTemplatesPath, t6Component, 'utf8');

const newLines = [...lines.slice(0, 477), "             <Template6 {...templateProps} />", ...lines.slice(746)];

for (let i = 0; i < newLines.length; i++) {
    let line = newLines[i];
    if (line.includes("import { Template1, Template2, Template3, Template4, Template5")) {
        newLines[i] = line.replace("Template5 }", "Template5, Template6 }");
    } else if (line.includes("{['Template1', 'Template2', 'Template3', 'Template4', 'Template5'].map")) {
        newLines[i] = line.replace("'Template5']", "'Template5', 'Template6']");
    } else if (line.includes("{selectedTemplate === 'Template5' && <Template5 {...templateProps} />}")) {
        newLines.splice(i + 1, 0, "                {selectedTemplate === 'Template6' && <Template6 {...templateProps} />}");
    }
}

fs.writeFileSync(printSettingPath, newLines.join('\n'), 'utf8');
console.log('Successfully extracted Template6 using Node.js!');
