const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8');

// 1. Add import
if (!content.includes('Template1')) {
    const importReplacement = `import React, { useState, useEffect, useRef } from 'react';
import { Template1, Template2, Template3, Template4, Template5 } from './PrintTemplates';`;
    content = content.replace(/import React, \{ useState, useEffect, useRef \} from 'react';/, importReplacement);
}

// 2. Add state selectedTemplate
const stateMarker = 'const [isSidebarOpen, setIsSidebarOpen] = useState(false);';
if (content.includes(stateMarker) && !content.includes('const [selectedTemplate, setSelectedTemplate]')) {
    content = content.replace(stateMarker, `${stateMarker}\n  const [selectedTemplate, setSelectedTemplate] = useState(localStorage.getItem('selectedTemplate') || 'Template1');\n  useEffect(() => { localStorage.setItem('selectedTemplate', selectedTemplate); }, [selectedTemplate]);`);
}

// 3. Define the props object to pass to templates
const propsDef = `
  const templateProps = {
    previewInvoice, parsedItems, totalQty, totalTaxable, totalFinal, qrCodeUrl,
    allPrintSettings, headerSettings, tableSettings, footerSettings, customization,
    transactionType, transactionType2
  };
`;

// Insert it right before "const getFormatStyles = () => {"
if (!content.includes('templateProps = {')) {
    content = content.replace('const getFormatStyles = () => {', `${propsDef}\n  const getFormatStyles = () => {`);
}

// 4. Update the A4 preview block (the left preview)
const a4PreviewStart = '{/* 1. Header Section */}';
const a4PreviewEnd = ') : ('; // Where Thermal Print block starts

const startIdx = content.indexOf(a4PreviewStart);
if (startIdx !== -1) {
    // We need to replace the entire Template1 JSX inside PrintSetting with a switch block.
    // Let's find the closing tag. The A4 block is wrapped in a `<div ref={previewRef} ... > ... </div>`.
    // Wait, the A4 block itself is just children of the <div ref={previewRef}>.
    // Instead of replacing just the inside, let's find the `ref={previewRef}` div.
    const previewDivStart = content.indexOf('<div \\n               ref={previewRef}');
    const endIdx = content.indexOf(') : (\\n          <div \\n            ref={previewRef}', previewDivStart);
    
    if (previewDivStart !== -1 && endIdx !== -1) {
        const replacement = `<div 
               ref={previewRef}
               className="bg-[#ffffff] shadow-sm shrink-0 text-[#000000] border border-black m-auto text-[11px]"
               style={{ ...getFormatStyles(), fontFamily: 'Arial, sans-serif' }}
             >
                {selectedTemplate === 'Template1' && <Template1 {...templateProps} />}
                {selectedTemplate === 'Template2' && <Template2 {...templateProps} />}
                {selectedTemplate === 'Template3' && <Template3 {...templateProps} />}
                {selectedTemplate === 'Template4' && <Template4 {...templateProps} />}
                {selectedTemplate === 'Template5' && <Template5 {...templateProps} />}
             </div>\n           `;
        content = content.substring(0, previewDivStart) + replacement + content.substring(endIdx);
    } else {
        // Fallback search
        const altStart = content.indexOf('<div \\n               ref={previewRef}');
        const altEnd = content.indexOf(') : (\\n          <div \\n            ref={previewRef}');
        if(altStart !== -1 && altEnd !== -1) {
             const replacement = `<div 
               ref={previewRef}
               className="bg-[#ffffff] shadow-sm shrink-0 text-[#000000] border border-black m-auto text-[11px]"
               style={{ ...getFormatStyles(), fontFamily: 'Arial, sans-serif' }}
             >
                {selectedTemplate === 'Template1' && <Template1 {...templateProps} />}
                {selectedTemplate === 'Template2' && <Template2 {...templateProps} />}
                {selectedTemplate === 'Template3' && <Template3 {...templateProps} />}
                {selectedTemplate === 'Template4' && <Template4 {...templateProps} />}
                {selectedTemplate === 'Template5' && <Template5 {...templateProps} />}
             </div>\n           `;
             content = content.substring(0, altStart) + replacement + content.substring(altEnd);
        }
    }
}

// 5. Update Invoice Template Modal body
const modalStart = '{/* Invoice Template Modal */}';
const modalEnd = '{/* Modal Footer */}';

const mStartIdx = content.indexOf(modalStart);
const mEndIdx = content.indexOf(modalEnd, mStartIdx);

if (mStartIdx !== -1 && mEndIdx !== -1) {
    const newModalContent = `{/* Invoice Template Modal */}
      {isInvoiceTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4 md:p-8">
          <div className="bg-[#ffffff] rounded-[6px] shadow-2xl w-full max-w-6xl h-full flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#e5e7eb]">
              <h3 className="text-[#1f2937] font-bold text-[16px]">Invoice Format</h3>
              <button onClick={() => setIsInvoiceTemplateModalOpen(false)} className="text-[#6b7280] hover:text-[#374151] transition-colors">
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#f3f4f6] flex gap-6">
              
              {/* Sidebar Template List */}
              <div className="w-[300px] flex flex-col gap-4 overflow-y-auto h-full pr-2 shrink-0">
                <h4 className="font-bold text-gray-700">Choose a Layout</h4>
                {['Template1', 'Template2', 'Template3', 'Template4', 'Template5'].map((tpl, i) => (
                    <div 
                      key={tpl} 
                      onClick={() => setSelectedTemplate(tpl)}
                      className={\`cursor-pointer border-2 rounded-lg p-2 transition-all \${selectedTemplate === tpl ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-300'}\`}
                    >
                      <div className="font-bold text-gray-700 mb-2">Template {i + 1}</div>
                      <div className="w-full h-[150px] bg-gray-100 rounded overflow-hidden relative">
                         {/* Mini Thumbnail */}
                         <div className="absolute top-0 left-0 w-[300%] h-[300%] origin-top-left scale-[0.33] pointer-events-none bg-white p-2">
                           {tpl === 'Template1' && <Template1 {...templateProps} />}
                           {tpl === 'Template2' && <Template2 {...templateProps} />}
                           {tpl === 'Template3' && <Template3 {...templateProps} />}
                           {tpl === 'Template4' && <Template4 {...templateProps} />}
                           {tpl === 'Template5' && <Template5 {...templateProps} />}
                         </div>
                      </div>
                      {selectedTemplate === tpl && <div className="text-center text-indigo-600 font-bold mt-2 text-[12px] uppercase">Selected</div>}
                    </div>
                ))}
              </div>

              {/* Live Preview Area */}
              <div className="flex-1 bg-white border border-gray-300 rounded shadow-sm overflow-hidden flex flex-col items-center justify-start p-8 overflow-y-auto">
                 <h4 className="font-bold text-gray-700 mb-6 w-full text-center">Live Preview</h4>
                 <div className="w-full max-w-[210mm] min-h-[297mm] shadow-lg bg-white border border-gray-200 p-0 pointer-events-none">
                   {selectedTemplate === 'Template1' && <Template1 {...templateProps} />}
                   {selectedTemplate === 'Template2' && <Template2 {...templateProps} />}
                   {selectedTemplate === 'Template3' && <Template3 {...templateProps} />}
                   {selectedTemplate === 'Template4' && <Template4 {...templateProps} />}
                   {selectedTemplate === 'Template5' && <Template5 {...templateProps} />}
                 </div>
              </div>

            </div>
            
            `;
    content = content.substring(0, mStartIdx) + newModalContent + content.substring(mEndIdx);
}

fs.writeFileSync('os_frontend/src/pages/PrintSetting.jsx', content);
console.log('Modified PrintSetting.jsx');
