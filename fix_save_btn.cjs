const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8');

const targetStr = `              <button 
                type="button"
                onClick={async () => {
                  const success = await handleDownloadPdf(true);
                  if (success) {
                    setIsInvoiceTemplateModalOpen(false);
                    alert('Print Template saved and downloaded successfully!');
                  }
                }}
                className="bg-[#4F46E5] hover:bg-[#4338ca] text-[#ffffff] px-8 py-2 rounded-[6px] text-[20px] font-bold transition-colors shadow-sm"
              >
                Save
              </button>`;

const replacementStr = `              <button 
                type="button"
                onClick={() => {
                  setIsInvoiceTemplateModalOpen(false);
                  alert('Template format saved successfully!');
                }}
                className="bg-[#4F46E5] hover:bg-[#4338ca] text-[#ffffff] px-8 py-2 rounded-[6px] text-[20px] font-bold transition-colors shadow-sm"
              >
                Save
              </button>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('os_frontend/src/pages/PrintSetting.jsx', content);
  console.log('Replaced exact string successfully!');
} else {
  console.log('Target string not found in PrintSetting.jsx!');
}
