const fs = require('fs');
let content = fs.readFileSync('src/pages/PrintSetting.jsx', 'utf-8');
const lines = content.split('\n');

let startIdx = -1;
let endIdx = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* 1. Header Section */}')) {
    startIdx = i;
    break;
  }
}

for (let i = startIdx; i < lines.length; i++) {
  if (lines[i].includes(') : (')) {
    endIdx = i - 1;
    break;
  }
}

const templateLines = lines.slice(startIdx, endIdx);

let modalStart = -1;
let modalEnd = -1;

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('{/* Invoice Template Modal */}')) {
    modalStart = i;
    break;
  }
}

for (let i = modalStart; i < lines.length; i++) {
  if (lines[i].includes(' {/* Header Settings Drawer */}')) {
    modalEnd = i - 1;
    break;
  }
}

const newModalContent = [
  `      {/* Invoice Template Modal (Drawer) */}`,
  `      {isInvoiceTemplateModalOpen && (`,
  `        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">`,
  `          <div className="bg-[#ffffff] shadow-2xl w-[450px] h-full flex flex-col overflow-hidden animate-slide-in-right">`,
  `            `,
  `            {/* Modal Header */}`,
  `            <div className="px-6 py-4 flex items-center justify-between border-b border-[#e5e7eb]">`,
  `              <div>`,
  `                <h3 className="text-[#1f2937] font-bold text-[18px]">Invoice Format</h3>`,
  `                <p className="text-gray-500 text-[13px] mt-1">Choose the layout used when this document is printed or downloaded as PDF.</p>`,
  `              </div>`,
  `              <button onClick={() => setIsInvoiceTemplateModalOpen(false)} className="text-[#6b7280] hover:text-[#374151] transition-colors">`,
  `                <X className="w-5 h-5" strokeWidth={2} />`,
  `              </button>`,
  `            </div>`,
  `            `,
  `            {/* Modal Body */}`,
  `            <div className="flex-1 overflow-y-auto p-6 bg-[#f8f9fa] flex flex-col items-center">`,
  `              `,
  `              {/* Template Preview Container scaled down perfectly */}`,
  `              <div className="relative border-2 border-[#4F46E5] rounded-[12px] cursor-pointer bg-white overflow-hidden shadow-lg transition-all hover:shadow-xl w-full" style={{ height: '550px' }}>`,
  `                `,
  `                {/* Checkmark icon */}`,
  `                <div className="absolute top-4 right-4 w-8 h-8 bg-[#4F46E5] rounded-full flex items-center justify-center text-white shadow-md z-20">`,
  `                  <Check className="w-5 h-5" strokeWidth={3} />`,
  `                </div>`,
  ``,
  `                {/* Scaling Wrapper */}`,
  `                <div className="absolute top-0 left-0 w-[750px] origin-top-left" style={{ transform: 'scale(0.533)', height: '187%' }}>`,
  `                  {/* Actual Template Ref */}`,
  `                  <div `,
  `                    ref={invoiceRef}`,
  `                    className="bg-[#ffffff] shrink-0 text-[#000000] border-none m-0 text-[11px] w-full h-full flex flex-col"`,
  `                    style={{ ...getFormatStyles(), fontFamily: "Arial, sans-serif" }}`,
  `                  >`
].concat(templateLines).concat([
  `                  {/* Selected Footer inside the template area */}`,
  `                  <div className="w-full bg-[#4F46E5] text-[#ffffff] text-center py-4 font-bold text-[16px] tracking-widest mt-auto">`,
  `                    ** SELECTED **`,
  `                  </div>`,
  `                </div>`,
  `                </div>`,
  `              </div>`,
  `            </div>`,
  `            `,
  `            {/* Modal Footer */}`,
  `            <div className="px-6 py-4 flex gap-3 border-t border-[#e5e7eb] justify-end bg-white">`,
  `              <button `,
  `                type="button"`,
  `                onClick={async () => {`,
  `                  const success = await handleDownloadPdf(true);`,
  `                  if (success) {`,
  `                    setIsInvoiceTemplateModalOpen(false);`,
  `                    alert('Print Template saved and downloaded successfully!');`,
  `                  }`,
  `                }}`,
  `                className="bg-[#4F46E5] hover:bg-[#4338ca] text-[#ffffff] px-8 py-2 rounded-[6px] text-[16px] font-bold transition-colors shadow-sm"`,
  `              >`,
  `                Save`,
  `              </button>`,
  `              <button `,
  `                type="button"`,
  `                onClick={() => setIsInvoiceTemplateModalOpen(false)}`,
  `                className="bg-[#e9ecef] hover:bg-[#dde0e3] text-[#4F46E5] px-8 py-2 rounded-[6px] text-[14px] font-bold transition-colors"`,
  `              >`,
  `                Back`,
  `              </button>`,
  `            </div>`,
  ``,
  `          </div>`,
  `        </div>`,
  `      )}`,
  ``
]);

lines.splice(modalStart, modalEnd - modalStart, ...newModalContent);

fs.writeFileSync('src/pages/PrintSetting.jsx', lines.join('\n'));
console.log('Success: Replaced modal content with previewRef content');
