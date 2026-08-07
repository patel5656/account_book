const fs = require('fs');
const file = 'c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx';
let content = fs.readFileSync(file, 'utf8');

// Add State
const stateToAdd = `
  const [isFooterSettingsOpen, setIsFooterSettingsOpen] = useState(false);
  const [footerSettings, setFooterSettings] = useState({
    showQrCode: true,
    showHsnSummary: false,
    showCurrentOutstanding: false,
    outstandingPosition: 'After this Transaction',
    showPaymentDetails: true,
    labelTermsAndConditions: 'Terms And Conditions',
    labelThankYouNote: 'Thank You Note'
  });
`;

if (!content.includes('isFooterSettingsOpen')) {
  content = content.replace(
    'const [isHeaderSettingsOpen, setIsHeaderSettingsOpen] = useState(false);',
    'const [isHeaderSettingsOpen, setIsHeaderSettingsOpen] = useState(false);\n' + stateToAdd
  );
}

// Update MenuItem
content = content.replace(
  '<MenuItem label="Footer Settings" />',
  '<MenuItem label="Footer Settings" onClick={() => setIsFooterSettingsOpen(true)} />'
);

// Update Preview
// 1. Payment Details label:
content = content.replace(
  '<div className="w-full text-[#1f2937] leading-tight mb-4 mt-2" style={{ fontSize: `${customization.footerContentsFontSize}px` }}>\n                <div className="font-bold mb-3" style={{ fontSize: `${customization.footerHeadingsFontSize}px` }}>\n                  Payment Details:',
  '{footerSettings.showPaymentDetails && (\n              <div className="w-full text-[#1f2937] leading-tight mb-4 mt-2" style={{ fontSize: `${customization.footerContentsFontSize}px` }}>\n                <div className="font-bold mb-3" style={{ fontSize: `${customization.footerHeadingsFontSize}px` }}>\n                  Payment Details:'
);
content = content.replace(
  'methods (e.g., credit card bank transfer, PayPal) and any associated fees for certain payment methods.</div>\n              </div>',
  'methods (e.g., credit card bank transfer, PayPal) and any associated fees for certain payment methods.</div>\n              </div>\n            )}'
);

// 2. Terms and conditions label:
content = content.replace(
  '<div className="font-bold mb-1" style={{ fontSize: `${customization.footerTermsFontSize}px` }}>Terms and conditions:</div>',
  '<div className="font-bold mb-1" style={{ fontSize: `${customization.footerTermsFontSize}px` }}>{footerSettings.labelTermsAndConditions || "Terms and conditions"}:</div>'
);

// 3. QR Code visibility:
// We need to wrap: <div className="w-16 h-16 opacity-80"> ... </div>
content = content.replace(
  /<div className="w-16 h-16 opacity-80">[\s\S]*?<\/svg>\n\s*<\/div>/,
  '{footerSettings.showQrCode && (\n                $& \n              )}'
);

// 4. Thank you note label:
content = content.replace(
  'Thank you for choosing us, visit again.',
  '{footerSettings.labelThankYouNote || "Thank you for choosing us, visit again."}'
);

// Add Drawer UI
const drawerUI = `
      {/* Footer Settings Drawer */}
      {isFooterSettingsOpen && (
        <div className="absolute top-0 right-0 h-full w-[400px] bg-[#ffffff] shadow-[-4px_0_15px_rgba(0,0,0,0.05)] z-40 flex flex-col border-l border-[#e5e7eb] animate-slide-in-right">
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e7eb]">
            <h2 className="text-[18px] font-bold text-[#1f2937]">Footer Settings</h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={async () => {
                  setIsFooterSettingsOpen(false);
                }}
                className="bg-[#4b0082] hover:bg-[#3b0066] text-[#ffffff] px-4 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors"
              >
                Save
              </button>
              <button onClick={() => setIsFooterSettingsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-[#ffffff]">
            
            <div className="flex flex-col gap-4">
              <h3 className="text-[14px] font-bold text-[#1f2937]">Show / Hide</h3>
              
              <div className="flex items-center justify-between">
                <div className="text-[13px] text-[#4b5563] font-medium">QR Code</div>
                <button 
                  onClick={() => setFooterSettings(prev => ({ ...prev, showQrCode: !prev.showQrCode }))}
                  className={\`w-9 h-5 rounded-full relative transition-colors \${footerSettings.showQrCode ? 'bg-[#4b0082]' : 'bg-gray-200 border border-gray-300'}\`}
                >
                  <div className={\`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-all \${footerSettings.showQrCode ? 'left-[18px]' : 'left-[2px]'}\`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[13px] text-[#4b5563] font-medium">HSN Summary</div>
                <button 
                  onClick={() => setFooterSettings(prev => ({ ...prev, showHsnSummary: !prev.showHsnSummary }))}
                  className={\`w-9 h-5 rounded-full relative transition-colors \${footerSettings.showHsnSummary ? 'bg-[#4b0082]' : 'bg-gray-200 border border-gray-300'}\`}
                >
                  <div className={\`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-all \${footerSettings.showHsnSummary ? 'left-[18px]' : 'left-[2px]'}\`}></div>
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[13px] text-[#4b5563] font-medium">Current Outstanding</div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <select 
                      value={footerSettings.outstandingPosition}
                      onChange={(e) => setFooterSettings(prev => ({ ...prev, outstandingPosition: e.target.value }))}
                      className="appearance-none bg-white border border-gray-300 text-gray-700 py-1 pl-3 pr-8 rounded text-[12px] leading-tight focus:outline-none focus:border-purple-500"
                    >
                      <option>After this Transaction</option>
                      <option>Before this Transaction</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFooterSettings(prev => ({ ...prev, showCurrentOutstanding: !prev.showCurrentOutstanding }))}
                    className={\`w-9 h-5 rounded-full relative transition-colors \${footerSettings.showCurrentOutstanding ? 'bg-[#4b0082]' : 'bg-gray-200 border border-gray-300'}\`}
                  >
                    <div className={\`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-all \${footerSettings.showCurrentOutstanding ? 'left-[18px]' : 'left-[2px]'}\`}></div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-[13px] text-[#4b5563] font-medium">Payment Details</div>
                <button 
                  onClick={() => setFooterSettings(prev => ({ ...prev, showPaymentDetails: !prev.showPaymentDetails }))}
                  className={\`w-9 h-5 rounded-full relative transition-colors \${footerSettings.showPaymentDetails ? 'bg-[#4b0082]' : 'bg-gray-200 border border-gray-300'}\`}
                >
                  <div className={\`absolute top-[2px] w-4 h-4 rounded-full bg-white shadow-sm transition-all \${footerSettings.showPaymentDetails ? 'left-[18px]' : 'left-[2px]'}\`}></div>
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-2">
              <h3 className="text-[14px] font-bold text-[#1f2937]">Footer Labels</h3>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={footerSettings.labelTermsAndConditions}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, labelTermsAndConditions: e.target.value }))}
                  placeholder="Terms And Conditions"
                  className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
                <input 
                  type="text" 
                  value={footerSettings.labelThankYouNote}
                  onChange={(e) => setFooterSettings(prev => ({ ...prev, labelThankYouNote: e.target.value }))}
                  placeholder="Thank You Note"
                  className="w-1/2 border border-gray-300 rounded-md px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

          </div>
          
          <div className="p-4 border-t border-[#e5e7eb] flex items-center gap-3">
             <button 
                onClick={() => setIsFooterSettingsOpen(false)}
                className="bg-[#4b0082] hover:bg-[#3b0066] text-[#ffffff] px-6 py-2 rounded-[4px] text-[13px] font-medium transition-colors"
              >
                Save
              </button>
              <button 
                onClick={() => setIsFooterSettingsOpen(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-[4px] text-[13px] font-medium transition-colors"
              >
                Back
              </button>
          </div>
        </div>
      )}
`;

if (!content.includes('Footer Settings Drawer')) {
  content = content.replace(
    '{/* Customization Drawer */}',
    drawerUI + '\n      {/* Customization Drawer */}'
  );
}

fs.writeFileSync(file, content);
console.log("Drawer added!");
