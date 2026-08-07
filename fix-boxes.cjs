const fs = require('fs');
const file = 'c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove border from main wrapper and reduce padding
content = content.replace(
  'className="bg-[#ffffff] border border-[#000000] shadow-sm w-full max-w-[420px] p-5 flex flex-col items-center shrink-0"',
  'className="bg-[#ffffff] shadow-sm w-full max-w-[420px] p-2 flex flex-col items-center shrink-0"'
);

// 2. Wrap the content in a border-2 box.
// Find the start of the content: {/* Header */}
content = content.replace(
  '{/* Header */}',
  '<div className="w-full border-2 border-black flex flex-col px-1 pb-2">\n            {/* Header */}'
);

// 3. Revert the Footer Text box to just normal divs
// We have:
//             {/* Footer Text */}
//             <div className="w-full border border-[#000000] p-2 rounded-sm mb-4 flex flex-col">
//               <div className="w-full text-[#1f2937] leading-tight" style={{ fontSize: `${customization.footerContentsFontSize}px` }}>
//                 <div className="font-bold mb-2" style={{ fontSize: `${customization.footerHeadingsFontSize}px` }}>

content = content.replace(
  '<div className="w-full border border-[#000000] p-2 rounded-sm mb-4 flex flex-col">\n              <div className="w-full text-[#1f2937] leading-tight"',
  '<div className="w-full text-[#1f2937] leading-tight mb-4 mt-2"'
);
content = content.replace(
  'className="font-bold mb-2"',
  'className="font-bold mb-3"'
);

// The QR code section ends with:
//               </div>
//             </div>
//             </div>
//           </div>
//         </div>
//       </div>
// We need to carefully replace the end of the QR code section.
// Instead of regex, let's do it by finding the exact string.

content = content.replace(
  /Thank you for choosing us, visit again\.\n\s*<\/div>\n\s*<\/div>\n\s*<\/div>/,
  'Thank you for choosing us, visit again.\n              </div>\n            </div>\n            </div>'
); // Keep the </div> because it now closes the NEW outer border-2 box!

// Wait! If I just keep the `</div>`, it will close the `<div className="w-full border-2 border-black flex flex-col px-1 pb-2">` perfectly!
// Let me double check how many `</div>` there were BEFORE I added the footer box.
// Originally:
//               <div className="text-[#1f2937] text-center" ...>
//                 Thank you for choosing us, visit again.
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

// In my previous script, I changed it to:
//               <div className="text-[#1f2937] text-center" ...>
//                 Thank you for choosing us, visit again.
//               </div>
//             </div>
//             </div>

// Now, I want to keep those </div>'s because one closes the QR div, and the EXTRA one closes the newly added `<div className="w-full border-2 border-black ...">`.
// So I don't need to change the end of the file at all! The `</div>` count is already exactly what I need!

fs.writeFileSync(file, content);
console.log("Rewritten layout!");
