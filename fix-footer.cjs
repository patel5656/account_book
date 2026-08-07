const fs = require('fs');
const file = 'c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx';
let content = fs.readFileSync(file, 'utf8');

// The block starts at:
// {/* Footer Text */}
// <div className="w-full border border-[#000000] p-2 rounded-sm mb-4">

// And ends before:
// {/* QR and Thank you */}
// But we want the border box to wrap BOTH.

content = content.replace(
  '<div className="w-full border border-[#000000] p-2 rounded-sm mb-4">',
  '<!-- TEMP_BOX -->'
);

// Now we need to remove the closing </div> of that box, which is just before {/* QR and Thank you */}
content = content.replace(
  /<\/div>\s*\{\/\* QR and Thank you \*\/\}/,
  '{/* QR and Thank you */}'
);

// Now we add the opening box back, and add the closing box after "Thank you for choosing us"
content = content.replace(
  '<!-- TEMP_BOX -->',
  '<div className="w-full border border-[#000000] p-2 rounded-sm mb-4 flex flex-col">'
);

// The QR section ends right before: 
//           </div>
//         </div>
//       </div>
//       {/* Customization Drawer */}
content = content.replace(
  /Thank you for choosing us, visit again\.\n\s*<\/div>\n\s*<\/div>/,
  'Thank you for choosing us, visit again.\n              </div>\n            </div>\n            </div>' // Add one more </div> for the border box
);

fs.writeFileSync(file, content);
console.log("Updated!");
