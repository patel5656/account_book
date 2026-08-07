const fs = require('fs');
const file = 'c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx';
let content = fs.readFileSync(file, 'utf8');

const startIdx = content.indexOf('{/* Table Settings Drawer */}');
const endIdx = content.indexOf('{/* Drawer Footer */}', startIdx);

if (startIdx !== -1 && endIdx !== -1) {
    let before = content.substring(0, startIdx);
    let target = content.substring(startIdx, endIdx);
    let after = content.substring(endIdx);
    
    target = target.split('className="w-full border-[1.5px] border-gray-300 rounded-[6px] px-3 py-2 pr-8 text-[13px] text-[#4b5563] outline-none focus:border-[#4b0082]"')
                   .join('onFocus={(e) => e.target.select()} className="w-full border-[1.5px] border-gray-300 rounded-[6px] px-3 py-2 pr-8 text-[13px] text-[#4b5563] outline-none focus:border-[#4b0082]"');
                   
    fs.writeFileSync(file, before + target + after);
    console.log("Successfully replaced!");
} else {
    console.log("Could not find drawer bounds");
}
