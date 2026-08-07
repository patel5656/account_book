const fs = require('fs');
let lines = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8').split('\\n');

const targetIdx = lines.findIndex(line => line.includes('{/* Drawer Header */}'));

if (targetIdx !== -1) {
  let startIdx = targetIdx;
  
  for (let i = targetIdx; i >= 0; i--) {
    if (lines[i].includes('              </div>')) {
      startIdx = i;
      break;
    }
  }

  const replacementLines = [
    '              </div>',
    '',
    '            </div>',
    '            ',
    '            {/* Modal Footer */}',
    '            <div className="px-6 py-4 flex gap-3 border-t border-[#e5e7eb]">',
    '              <button ',
    '                type="button"',
    '                onClick={() => {',
    '                  setIsInvoiceTemplateModalOpen(false);',
    "                  alert('Template format saved successfully!');",
    '                }}',
    '                className="bg-[#4F46E5] hover:bg-[#4338ca] text-[#ffffff] px-8 py-2 rounded-[6px] text-[20px] font-bold transition-colors shadow-sm"',
    '              >',
    '                Save',
    '              </button>',
    '              <button ',
    '                type="button"',
    '                onClick={() => setIsInvoiceTemplateModalOpen(false)}',
    '                className="bg-[#e9ecef] hover:bg-[#dde0e3] text-[#4F46E5] px-8 py-2 rounded-[6px] text-[14px] font-bold transition-colors"',
    '              >',
    '                Back',
    '              </button>',
    '            </div>',
    '',
    '          </div>',
    '        </div>',
    '      )}',
    '',
    '      {/* Header Settings Drawer */}',
    '      {isHeaderSettingsOpen && (',
    '        <div className="absolute top-0 right-0 h-full w-[400px] bg-[#ffffff] shadow-[-4px_0_15px_rgba(0,0,0,0.05)] z-40 flex flex-col border-l border-[#e5e7eb] animate-slide-in-right">',
    '          ',
    '          {/* Drawer Header */}'
  ];

  lines.splice(startIdx, targetIdx - startIdx + 1, ...replacementLines);
  
  fs.writeFileSync('os_frontend/src/pages/PrintSetting.jsx', lines.join('\\n'));
  console.log('Fixed syntax error permanently by splicing array!');
} else {
  console.log('Could not find Drawer Header');
}
