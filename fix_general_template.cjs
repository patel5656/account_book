const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8');

const targetStr = `{(transactionType === 'Glass Template' || pdfFormat !== 'Thermal Print') ? (
             <div 
               ref={previewRef}`;

const replacementStr = `{transactionType === 'General Template' ? (
             <div 
               ref={previewRef}
               className="bg-[#ffffff] shadow-sm shrink-0 border border-black m-auto"
               style={{ width: '210mm', minHeight: '297mm' }}
             >
                {selectedTemplate === 'Template1' && <Template1 {...templateProps} />}
                {selectedTemplate === 'Template2' && <Template2 {...templateProps} />}
                {selectedTemplate === 'Template3' && <Template3 {...templateProps} />}
                {selectedTemplate === 'Template4' && <Template4 {...templateProps} />}
                {selectedTemplate === 'Template5' && <Template5 {...templateProps} />}
             </div>
          ) : (transactionType === 'Glass Template' || pdfFormat !== 'Thermal Print') ? (
             <div 
               ref={previewRef}`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('os_frontend/src/pages/PrintSetting.jsx', content);
console.log('Fixed Right Preview rendering for General Template!');
