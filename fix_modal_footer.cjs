const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8');

const badChunk = `                 Back
              </button>
            </div>
          </div>
        </div>
      )}`;

const replacementChunk = `            {/* Modal Footer */}
            <div className="px-6 py-4 flex gap-3 border-t border-[#e5e7eb]">
              <button 
                type="button"
                onClick={() => {
                  setIsInvoiceTemplateModalOpen(false);
                  alert('Template format saved successfully!');
                }}
                className="bg-[#4F46E5] hover:bg-[#4338ca] text-[#ffffff] px-8 py-2 rounded-[6px] text-[20px] font-bold transition-colors shadow-sm"
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
      )}`;

content = content.replace(badChunk, replacementChunk);
fs.writeFileSync('os_frontend/src/pages/PrintSetting.jsx', content);
console.log('Fixed Modal Footer');
