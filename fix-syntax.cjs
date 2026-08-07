const fs = require('fs');
const file = 'c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx';
let content = fs.readFileSync(file, 'utf8');

// The exact string in the file right now is:
// className={`w-full max-w-[420px] flex flex-col items-center shrink-0 ${transactionType === "Glass Template" ? "bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl p-6 relative overflow-hidden" : "bg-[#ffffff] shadow-sm p-2"}`

content = content.replace(
  '`w-full max-w-[420px] flex flex-col items-center shrink-0 ${transactionType === "Glass Template" ? "bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl p-6 relative overflow-hidden" : "bg-[#ffffff] shadow-sm p-2"}`',
  '`w-full max-w-[420px] flex flex-col items-center shrink-0 ${transactionType === "Glass Template" ? "bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] rounded-2xl p-6 relative overflow-hidden" : "bg-[#ffffff] shadow-sm p-2"}`}'
);

fs.writeFileSync(file, content);
console.log("Syntax error fixed");
