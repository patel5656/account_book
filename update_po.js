
const fs = require('fs');

let po = fs.readFileSync('src/pages/PurchaseOrder.jsx', 'utf8');
let pi = fs.readFileSync('src/pages/PurchaseInvoice.jsx', 'utf8');

const statesToAdd = \
  const [remark, setRemark] = useState('');
  const [isTaxIncluded, setIsTaxIncluded] = useState(false);
  const [manualFreightAmt, setManualFreightAmt] = useState('');
  const [manualFreightGst, setManualFreightGst] = useState('');
  const [manualTcsPercent, setManualTcsPercent] = useState('');
  const [manualTcsAmt, setManualTcsAmt] = useState('');
  const [manualDiscPercent, setManualDiscPercent] = useState('');
  const [manualDiscAmount, setManualDiscAmount] = useState('');
  const [showSummaryDiscDropdown, setShowSummaryDiscDropdown] = useState(false);
\;

if (!po.includes('setManualTcsAmt')) {
  po = po.replace('const [dateFilter, setDateFilter] = useState(\\'Today\\');', 'const [dateFilter, setDateFilter] = useState(\\'Today\\');\\n' + statesToAdd);
}

const piCalcStart = '// Calculation Logic';
const piCalcEnd = 'const allColumnIds = [';
const calcBlock = pi.substring(pi.indexOf(piCalcStart), pi.indexOf(piCalcEnd));

const poCalcStart = '// Calculation Logic per Row & Totals';
const poCalcEnd = 'const allColumnIds = [';
let oldCalcBlock = '';
if (po.includes(poCalcStart)) {
  oldCalcBlock = po.substring(po.indexOf(poCalcStart), po.indexOf(poCalcEnd));
} else {
  // If we already replaced it, the start is piCalcStart
  oldCalcBlock = po.substring(po.indexOf(piCalcStart), po.indexOf(poCalcEnd));
}

po = po.replace(oldCalcBlock, calcBlock + '\\n  const grandFinalAmount = finalCalculatedAmount;\\n  const grandBaseAmount = baseAmount;\\n  const grandTotalDiscAmount = appliedDiscAmount;\\n  const grandTotalQty = totalQty;\\n\\n  ');

const piFooterStart = '        {/* Calculations and Footer Area */}';
const piFooterEnd = '      {/* Fixed Bottom Action Bar */}';
const footerBlock = pi.substring(pi.indexOf(piFooterStart), pi.indexOf(piFooterEnd));

const poFooterStart = '        {/* Calculations and Footer Area */}';
const poFooterEnd = '      {/* Fixed Bottom Action Bar */}';
const oldFooterBlock = po.substring(po.indexOf(poFooterStart), po.indexOf(poFooterEnd));

po = po.replace(oldFooterBlock, footerBlock);

fs.writeFileSync('src/pages/PurchaseOrder.jsx', po);
console.log('Update Complete.');

