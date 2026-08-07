const fs = require('fs');
const file = 'c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'className={"bg-[#ffffff] shadow-sm w-full max-w-[420px] p-2 flex flex-col items-center shrink-0"',
  'className="bg-[#ffffff] shadow-sm w-full max-w-[420px] p-2 flex flex-col items-center shrink-0"'
);

fs.writeFileSync(file, content);
console.log('Fixed syntax error');
