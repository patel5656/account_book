const fs = require('fs');
const file = 'c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove all onFocus={(e) => e.target.select()}
content = content.replace(/onFocus=\{\(e\) => e\.target\.select\(\)\}\s*/g, '');

// 2. Change initial state of tableSettings to empty strings
content = content.replace(/thItemName: 'Item Name',/g, "thItemName: '',");
content = content.replace(/thHsnSac: 'HSN\/SAC',/g, "thHsnSac: '',");
content = content.replace(/thGst: 'GST \(%\)',/g, "thGst: '',");
content = content.replace(/thQty: 'Qty',/g, "thQty: '',");
content = content.replace(/thRate: 'Rate',/g, "thRate: '',");
content = content.replace(/thDiscount: 'Discount',/g, "thDiscount: '',");
content = content.replace(/thTaxableValue: 'Taxable Value',/g, "thTaxableValue: '',");
content = content.replace(/thTotalAmount: 'Total Amount',/g, "thTotalAmount: '',");

content = content.replace(/tlIgst: 'IGST',/g, "tlIgst: '',");
content = content.replace(/tlCgst: 'CGST',/g, "tlCgst: '',");
content = content.replace(/tlSgst: 'SGST',/g, "tlSgst: '',");
content = content.replace(/tlCess: 'Cess',/g, "tlCess: '',");
content = content.replace(/tlTcs: 'TCS',/g, "tlTcs: '',");
content = content.replace(/tlRoundOff: 'Round off',/g, "tlRoundOff: '',");

// 3. Add placeholders to the inputs in Table Settings
const inputs = [
  { val: 'thItemName', placeholder: 'Item Name' },
  { val: 'thHsnSac', placeholder: 'HSN/SAC' },
  { val: 'thGst', placeholder: 'GST (%)' },
  { val: 'thQty', placeholder: 'Qty' },
  { val: 'thRate', placeholder: 'Rate' },
  { val: 'thDiscount', placeholder: 'Discount' },
  { val: 'thTaxableValue', placeholder: 'Taxable Value' },
  { val: 'thTotalAmount', placeholder: 'Total Amount' },
  { val: 'tlIgst', placeholder: 'IGST' },
  { val: 'tlCgst', placeholder: 'CGST' },
  { val: 'tlSgst', placeholder: 'SGST' },
  { val: 'tlCess', placeholder: 'Cess' },
  { val: 'tlTcs', placeholder: 'TCS' },
  { val: 'tlRoundOff', placeholder: 'Round off' },
];

for (const inp of inputs) {
  const findRegex = new RegExp(`value=\\{tableSettings\\.${inp.val}\\}`, 'g');
  const replStr = `value={tableSettings.${inp.val}}\n                    placeholder="${inp.placeholder}"`;
  content = content.replace(findRegex, replStr);
}

// 4. Update the preview to fallback to defaults
content = content.replace(/\{tableSettings\.tlCgst\}:/g, "{tableSettings.tlCgst || 'CGST'}:");
content = content.replace(/\{tableSettings\.tlSgst\}:/g, "{tableSettings.tlSgst || 'SGST'}:");
content = content.replace(/\{tableSettings\.tlIgst\}:/g, "{tableSettings.tlIgst || 'IGST'}:");
content = content.replace(/\{tableSettings\.tlTcs\}:/g, "{tableSettings.tlTcs || 'TCS'}:");
content = content.replace(/\{tableSettings\.tlCess\}:/g, "{tableSettings.tlCess || 'Cess'}:");
content = content.replace(/\{tableSettings\.tlRoundOff\}:/g, "{tableSettings.tlRoundOff || 'Round off'}:");

fs.writeFileSync(file, content);
console.log("Updated to placeholders!");
