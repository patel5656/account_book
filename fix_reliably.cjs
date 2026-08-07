const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8');

const anchor1 = '{selectedTemplate === \\'Template5\\' && <Template5 {...templateProps} />}';
const anchor2 = '{/* Header Settings Drawer */}';

const idx1 = content.indexOf(anchor1);
const idx2 = content.indexOf(anchor2);

if (idx1 !== -1 && idx2 !== -1) {
  const replacement = `${anchor1}
                 </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 flex gap-3 border-t border-[#e5e7eb]">
              <button 
                type="button"
                onClick={() => {
                  setIsInvoiceTemplateModalOpen(false);
                  alert('Template format saved successfully!');
                }}
                className="bg-[#4F46E5] hover:bg-[#4338ca] text-[#ffffff] px-8 py-2 rounded-[6px] text-[14px] font-bold transition-colors shadow-sm"
              >
                Save
              </button>
              <button 
                type="button"
                onClick={() => setIsInvoiceTemplateModalOpen(false)}
                className="bg-[#e9ecef] hover:bg-[#dde0e3] text-[#4F46E5] px-8 py-2 rounded-[6px] text-[14px] font-bold transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}

      `;
      
  content = content.substring(0, idx1) + replacement + content.substring(idx2);
  fs.writeFileSync('os_frontend/src/pages/PrintSetting.jsx', content);
  console.log('Fixed syntax error successfully!');
} else {
  console.log('Not found');
}
