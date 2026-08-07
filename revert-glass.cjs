const fs = require('fs');
const file = 'c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Revert the Right Column Preview background
content = content.replace(
  '<div className={`flex-1 overflow-y-auto p-8 flex justify-center border-l-4 border-purple-800/10 ${transactionType === "Glass Template" ? "bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100" : "bg-[#fbfbfe]"}`}>',
  '<div className="flex-1 bg-[#fbfbfe] overflow-y-auto p-8 flex justify-center border-l-4 border-purple-800/10">'
);

// 2. Revert the main paper box wrapper
content = content.replace(
  '`w-full max-w-[420px] flex flex-col items-center shrink-0 ${transactionType === "Glass Template" ? "bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl p-6 relative overflow-hidden" : "bg-[#ffffff] shadow-sm p-2"}`}',
  '"bg-[#ffffff] shadow-sm w-full max-w-[420px] p-2 flex flex-col items-center shrink-0"'
);
content = content.replace(
  '`w-full max-w-[420px] flex flex-col items-center shrink-0 ${transactionType === "Glass Template" ? "bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl p-6 relative overflow-hidden" : "bg-[#ffffff] shadow-sm p-2"}`',
  '"bg-[#ffffff] shadow-sm w-full max-w-[420px] p-2 flex flex-col items-center shrink-0"'
);


// 3. Revert the inner black border
content = content.replace(
  '<div className={`w-full flex flex-col px-1 pb-2 ${transactionType === "Glass Template" ? "border-0" : "border-2 border-black"}`}>',
  '<div className="w-full border-2 border-black flex flex-col px-1 pb-2">'
);

fs.writeFileSync(file, content);
console.log('Glass Template reverted!');
