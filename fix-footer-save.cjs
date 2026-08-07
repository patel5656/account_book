const fs = require('fs');
const file = 'c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx';
let content = fs.readFileSync(file, 'utf8');

// The top right button
content = content.replace(
  'onClick={async () => {\n                  setIsFooterSettingsOpen(false);\n                }}',
  `onClick={async () => {\n                  const success = await handleDownloadPdf(true);\n                  if (success) {\n                    setIsFooterSettingsOpen(false);\n                    alert('Footer Settings saved and PDF downloaded!');\n                  }\n                }}`
);

// The bottom button
content = content.replace(
  `onClick={() => setIsFooterSettingsOpen(false)}
                className="bg-[#4b0082] hover:bg-[#3b0066] text-[#ffffff] px-6 py-2 rounded-[4px] text-[13px] font-medium transition-colors"
              >
                Save
              </button>`,
  `onClick={async () => {\n                  const success = await handleDownloadPdf(true);\n                  if (success) {\n                    setIsFooterSettingsOpen(false);\n                    alert('Footer Settings saved and PDF downloaded!');\n                  }\n                }}
                className="bg-[#4b0082] hover:bg-[#3b0066] text-[#ffffff] px-6 py-2 rounded-[4px] text-[13px] font-medium transition-colors"
              >
                Save
              </button>`
);

fs.writeFileSync(file, content);
console.log('Footer save buttons fixed!');
