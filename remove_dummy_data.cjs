const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8');

// The A4 parsedItems starts with `const parsedItems = previewInvoice?.items?.length > 0`
// and ends with `];`
// I'll replace the block manually.
const a4StartIdx = content.indexOf('const parsedItems = previewInvoice?.items?.length > 0');
if(a4StartIdx !== -1) {
    const a4EndIdx = content.indexOf('];', a4StartIdx);
    const newParsedItems = `const parsedItems = (previewInvoice?.items || []).map(i => ({
        name: i.product?.name || i.name || 'Unknown',
        qty: i.quantity || 1,
        rate: i.price || 0,
        mrp: i.mrp || 0,
        discount: i.discount1 || 0,
        discount2: i.discount2 || 0,
        hsn: i.hsn || '',
        taxableValue: i.amount || 0,
        totalAmount: i.amount || 0,
        desc: ''
    }));`;
    content = content.substring(0, a4StartIdx) + newParsedItems + content.substring(a4EndIdx + 2);
}

// Thermal items map block
const thermalStartIdx = content.indexOf('{(previewInvoice?.items?.length > 0 \\n                  ? previewInvoice.items.map(i => ({');
if (thermalStartIdx !== -1) {
    const thermalEndIdx = content.indexOf(').map((item, idx) => (', thermalStartIdx);
    if (thermalEndIdx !== -1) {
        const newThermalMap = `{(previewInvoice?.items || []).map(i => ({
                      name: i.product?.name || i.name || 'Unknown',
                      qty: i.quantity || 1,
                      rate: i.price || 0,
                      discount: i.discount1 || 0,
                      taxableValue: i.amount || 0,
                      totalAmount: i.amount || 0,
                      desc: ''
                    })).map((item, idx) => (`;
        content = content.substring(0, thermalStartIdx) + newThermalMap + content.substring(thermalEndIdx + ').map((item, idx) => ('.length);
    }
}

// Thermal totals fallback
const totalsStartIdx = content.indexOf('const items = previewInvoice?.items?.length > 0 \\n                  ? previewInvoice.items.map(i => ({ qty: i.quantity || 1, taxableValue: i.amount || 0, totalAmount: i.amount || 0 }))\\n                  : [{ qty: 10.00, taxableValue: 6286.00, totalAmount: 7806.08 }];');
if (totalsStartIdx !== -1) {
    const newTotals = `const items = (previewInvoice?.items || []).map(i => ({ qty: i.quantity || 1, taxableValue: i.amount || 0, totalAmount: i.amount || 0 }));`;
    const totalsEndIdx = totalsStartIdx + 'const items = previewInvoice?.items?.length > 0 \n                  ? previewInvoice.items.map(i => ({ qty: i.quantity || 1, taxableValue: i.amount || 0, totalAmount: i.amount || 0 }))\n                  : [{ qty: 10.00, taxableValue: 6286.00, totalAmount: 7806.08 }];'.length;
    content = content.substring(0, totalsStartIdx) + newTotals + content.substring(totalsEndIdx);
} else {
    // try removing newlines / whitespaces mismatch
    content = content.replace(/const items = previewInvoice\?\.items\?\.length > 0[\s\S]*?\? previewInvoice\.items\.map[\s\S]*?: \[\{ qty: 10\.00, taxableValue: 6286\.00, totalAmount: 7806\.08 \}\];/, `const items = (previewInvoice?.items || []).map(i => ({ qty: i.quantity || 1, taxableValue: i.amount || 0, totalAmount: i.amount || 0 }));`);
}

// And let's fix hardcoded Fallbacks in A4
content = content.replace(/previewInvoice\?\.ackNo \|\| '162314701183939'/g, 'previewInvoice?.ackNo || \'\'');
content = content.replace(/previewInvoice\?\.ackDate \? new Date\(previewInvoice\.ackDate\)\.toLocaleDateString\('en-GB'\) : '18-08-2023'/g, 'previewInvoice?.ackDate ? new Date(previewInvoice.ackDate).toLocaleDateString(\'en-GB\') : \'\'');
content = content.replace(/previewInvoice\?\.irn \|\| '3183488b0385a8206fbe'/g, 'previewInvoice?.irn || \'\'');
content = content.replace(/previewInvoice\?\.bankName \|\| allPrintSettings\?\.bankDetails\?\.bankName \|\| 'Axis Bank'/g, 'previewInvoice?.bankName || allPrintSettings?.bankDetails?.bankName || \'\'');
content = content.replace(/previewInvoice\?\.bankIfsc \|\| allPrintSettings\?\.bankDetails\?\.bankIfsc \|\| 'UTIB0002996'/g, 'previewInvoice?.bankIfsc || allPrintSettings?.bankDetails?.bankIfsc || \'\'');
content = content.replace(/previewInvoice\?\.bankAccountNo \|\| allPrintSettings\?\.bankDetails\?\.bankAccountNo \|\| '9674563210258'/g, 'previewInvoice?.bankAccountNo || allPrintSettings?.bankDetails?.bankAccountNo || \'\'');
content = content.replace(/previewInvoice\?\.bankBranch \|\| allPrintSettings\?\.bankDetails\?\.bankBranch \|\| 'ALTHAN'/g, 'previewInvoice?.bankBranch || allPrintSettings?.bankDetails?.bankBranch || \'\'');
content = content.replace(/previewInvoice\?\.bankAccountName \|\| allPrintSettings\?\.bankDetails\?\.bankAccountName \|\| 'Nishit'/g, 'previewInvoice?.bankAccountName || allPrintSettings?.bankDetails?.bankAccountName || \'\'');
content = content.replace(/previewInvoice\?\.upiId \|\| allPrintSettings\?\.bankDetails\?\.upiId \|\| '9000000000@axisbank'/g, 'previewInvoice?.upiId || allPrintSettings?.bankDetails?.upiId || \'\'');
content = content.replace(/previewInvoice\?\.amountInWords \|\| 'Nine Thousand Two Hundred and Seventy Rupees Only'/g, 'previewInvoice?.amountInWords || \'\'');
content = content.replace(/previewInvoice\?\.paymentMode \|\| '02-09-2025 - 310 - Default Bank'/g, 'previewInvoice?.paymentMode || \'\'');
content = content.replace(/previewInvoice\?\.totalAmount \? Number\(previewInvoice\.totalAmount\)\.toFixed\(2\) : \(totalFinal \+ 0\.10\)\.toFixed\(2\)/g, 'previewInvoice?.totalAmount ? Number(previewInvoice.totalAmount).toFixed(2) : totalFinal.toFixed(2)');
content = content.replace(/previewInvoice\?\.roundOff \? Number\(previewInvoice\.roundOff\)\.toFixed\(2\) : '0\.10'/g, 'previewInvoice?.roundOff ? Number(previewInvoice.roundOff).toFixed(2) : \'0.00\'');
content = content.replace(/previewInvoice\?\.terms \|\| 'Payment Terms:[\\s\\S]*?time\.'/g, 'previewInvoice?.terms || \'\'');
content = content.replace(/previewInvoice\?\.notes \|\| footerSettings\.labelThankYouNote \|\| 'Narration simply dummy[\\s\\S]*?book\.'/g, 'previewInvoice?.notes || footerSettings.labelThankYouNote || \'\'');

// And remove dummy static rows from the Tax Table in A4
// Wait, the A4 Tax Breakup Table has hardcoded TRs:
content = content.replace(/<tbody.*?>[\s\S]*?<\/tbody>/g, (match, offset) => {
    // Only replace if it contains the hardcoded dummy rows (like ₹1,342.00)
    if (match.includes('₹1,342.00')) {
        return `<tbody>
                     <tr>
                       <td className="border-r border-black p-1">1</td>
                       <td className="border-r border-black p-1">-</td>
                       <td className="border-r border-black p-1">₹{totalTaxable.toFixed(2)}</td>
                       <td className="border-r border-black p-1">0</td>
                       <td className="border-r border-black p-1">₹0.00</td>
                       <td className="p-1">₹0.00</td>
                     </tr>
                     <tr className="border-t border-black font-bold">
                       <td colSpan="2" className="border-r border-black p-1 text-center">Total</td>
                       <td className="border-r border-black p-1">₹{totalTaxable.toFixed(2)}</td>
                       <td className="border-r border-black p-1"></td>
                       <td className="border-r border-black p-1">₹{previewInvoice?.totalIgst ? Number(previewInvoice.totalIgst).toFixed(2) : '0.00'}</td>
                       <td className="p-1">₹{previewInvoice?.totalGstAmount ? Number(previewInvoice.totalGstAmount).toFixed(2) : '0.00'}</td>
                     </tr>
                   </tbody>`;
    }
    return match;
});

// Also in Thermal layout, fix hardcoded invoice/customer data fallbacks
content = content.replace(/previewInvoice\?\.invoiceNo \|\| 'MA22\/2348'/g, 'previewInvoice?.invoiceNo || \'\'');
content = content.replace(/previewInvoice\?\.date \? new Date\(previewInvoice\.date\)\.toLocaleDateString\('en-GB'\) : '28-05-2026'/g, 'previewInvoice?.date ? new Date(previewInvoice.date).toLocaleDateString(\'en-GB\') : \'\'');
content = content.replace(/previewInvoice\?\.customer\?\.name \|\| 'Walk-in Customer'/g, 'previewInvoice?.customer?.name || \'\'');
content = content.replace(/previewInvoice\?\.customer\?\.address \|\| 'Local'/g, 'previewInvoice?.customer?.address || \'\'');
content = content.replace(/previewInvoice\?\.customer\?\.gstin \|\| '24AADCD6XXXXXXX'/g, 'previewInvoice?.customer?.gstin || \'\'');
content = content.replace(/previewInvoice\?\.customer\?\.phone \|\| '1234567891'/g, 'previewInvoice?.customer?.phone || \'\'');
content = content.replace(/previewInvoice\?\.customer\?\.pan \|\| 'EDqARXXXXX'/g, 'previewInvoice?.customer?.pan || \'\'');

content = content.replace(/previewInvoice\?\.totalCgst \? Number\(previewInvoice\.totalCgst\)\.toFixed\(2\) : '588\.88'/g, 'previewInvoice?.totalCgst ? Number(previewInvoice.totalCgst).toFixed(2) : \'\'');
content = content.replace(/previewInvoice\?\.totalSgst \? Number\(previewInvoice\.totalSgst\)\.toFixed\(2\) : '588\.88'/g, 'previewInvoice?.totalSgst ? Number(previewInvoice.totalSgst).toFixed(2) : \'\'');
content = content.replace(/previewInvoice\?\.totalIgst \? Number\(previewInvoice\.totalIgst\)\.toFixed\(2\) : '1,177\.76'/g, 'previewInvoice?.totalIgst ? Number(previewInvoice.totalIgst).toFixed(2) : \'\'');
content = content.replace(/previewInvoice\?\.tcsAmount \? Number\(previewInvoice\.tcsAmount\)\.toFixed\(2\) : '0\.00'/g, 'previewInvoice?.tcsAmount ? Number(previewInvoice.tcsAmount).toFixed(2) : \'\'');
content = content.replace(/previewInvoice\?\.totalCess \? Number\(previewInvoice\.totalCess\)\.toFixed\(2\) : '468\.75'/g, 'previewInvoice?.totalCess ? Number(previewInvoice.totalCess).toFixed(2) : \'\'');

content = content.replace(/previewInvoice\?\.totalAmount \? Number\(previewInvoice\.totalAmount\)\.toFixed\(2\) : '7,806\.00'/g, 'previewInvoice?.totalAmount ? Number(previewInvoice.totalAmount).toFixed(2) : \'0.00\'');

fs.writeFileSync('os_frontend/src/pages/PrintSetting.jsx', content);
console.log('Dummy fallbacks removed successfully!');
