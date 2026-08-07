const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintTemplates.jsx', 'utf8');

const t2Start = content.indexOf('export const Template2 =');
const t3Start = content.indexOf('export const Template3 =');

const preT2 = content.substring(0, t2Start);
const postT2 = content.substring(t3Start);

const newT2 = `export const Template2 = (props) => {
  const { previewInvoice, parsedItems, totalQty, totalTaxable, totalFinal, qrCodeUrl, headerSettings, footerSettings, tableSettings, transactionType2, allPrintSettings } = props;
  
  // Custom Purple for HisabKitab theme
  const themeColor = '#5c238b';
  
  return (
    <div className="w-full flex flex-col font-sans text-[11px] bg-white border border-gray-400 p-2 box-border min-h-[100%]">
      {/* Centered Header */}
      <div className="w-full text-center py-2 px-2">
        <h2 className="text-[20px] font-bold uppercase">{previewInvoice?.customer?.name || 'COMPANY NAME'}</h2>
        <p className="text-gray-600 mt-1 uppercase text-[10px]">{previewInvoice?.customer?.address || 'COMPANY ADDRESS, CITY, STATE, PINCODE'}</p>
        <p className="text-gray-600 text-[10px]">Tel: {previewInvoice?.customer?.phone || '9999999999'} | Email: {previewInvoice?.customer?.email || 'email@example.com'}</p>
      </div>
      
      {/* Purple Title Bar */}
      <div className="w-full text-white text-center py-1 font-bold uppercase tracking-widest text-[13px] mb-2" style={{ backgroundColor: themeColor }}>
        {transactionType2 === 'Income Transaction' ? 'TAX INVOICE' : transactionType2}
      </div>
      
      {/* Invoice Details */}
      <div className="flex justify-between px-4 py-2 border-b border-gray-300">
        <div className="flex flex-col gap-1 w-1/2">
          <span className="font-bold" style={{ color: themeColor }}>Party Details:</span>
          <span className="font-bold uppercase">{previewInvoice?.customer?.name || 'CUSTOMER NAME'}</span>
          <span className="text-gray-600 uppercase text-[10px] leading-tight">{previewInvoice?.customer?.address || 'Customer Address'}</span>
          <span className="font-bold mt-1 text-[10px]">GSTIN: {previewInvoice?.customer?.gstin || ''}</span>
        </div>
        <div className="flex flex-col gap-1 text-right w-1/2">
          <div className="flex justify-end gap-2"><span className="font-bold text-gray-500">Invoice No:</span> <span className="font-bold">{previewInvoice?.invoiceNo || 'INV-001'}</span></div>
          <div className="flex justify-end gap-2"><span className="font-bold text-gray-500">Invoice Date:</span> <span className="font-bold">{previewInvoice?.date ? new Date(previewInvoice.date).toLocaleDateString('en-GB') : ''}</span></div>
        </div>
      </div>
      
      {/* Items Table */}
      <div className="w-full px-2 mt-4 flex-1">
        <table className="w-full text-center border-collapse text-[10px]">
          <thead>
            <tr className="text-white" style={{ backgroundColor: themeColor }}>
              <th className="p-1.5 border border-[#5c238b] font-medium w-[40px]">SN</th>
              <th className="p-1.5 border border-[#5c238b] font-medium text-left">Item Name</th>
              <th className="p-1.5 border border-[#5c238b] font-medium w-[70px]">HSN/SAC</th>
              <th className="p-1.5 border border-[#5c238b] font-medium w-[50px]">Qty</th>
              <th className="p-1.5 border border-[#5c238b] font-medium w-[70px]">Rate</th>
              <th className="p-1.5 border border-[#5c238b] font-medium w-[60px]">Dis.</th>
              <th className="p-1.5 border border-[#5c238b] font-medium w-[90px] text-right">Taxable</th>
              <th className="p-1.5 border border-[#5c238b] font-medium w-[100px] text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {parsedItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="p-1.5 border-l border-r border-gray-200">{idx + 1}</td>
                <td className="p-1.5 border-r border-gray-200 text-left font-bold">{item.name}</td>
                <td className="p-1.5 border-r border-gray-200">{item.hsn || '-'}</td>
                <td className="p-1.5 border-r border-gray-200">{item.qty}</td>
                <td className="p-1.5 border-r border-gray-200">₹ {Number(item.rate).toFixed(2)}</td>
                <td className="p-1.5 border-r border-gray-200">₹ {Number(item.discount).toFixed(2)}</td>
                <td className="p-1.5 border-r border-gray-200 text-right">₹ {Number(item.taxableValue).toFixed(2)}</td>
                <td className="p-1.5 border-r border-gray-200 text-right">₹ {Number(item.totalAmount).toFixed(2)}</td>
              </tr>
            ))}
            {/* Empty padding rows */}
            <tr className="h-[80px]">
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200"></td>
                <td className="border-r border-gray-200"></td>
                <td></td>
            </tr>
            <tr className="bg-gray-50 font-bold border-b border-t border-gray-200">
              <td colSpan="3" className="p-1.5 text-center border-l border-r border-gray-200">Total</td>
              <td className="p-1.5 border-r border-gray-200">{totalQty.toFixed(2)}</td>
              <td colSpan="2" className="p-1.5 border-r border-gray-200"></td>
              <td className="p-1.5 border-r border-gray-200 text-right">₹ {totalTaxable.toFixed(2)}</td>
              <td className="p-1.5 border-r border-gray-200 text-right text-[12px]" style={{ color: themeColor }}>₹ {totalFinal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Footer Area (Matching the image) */}
      <div className="w-full mt-4 flex flex-col">
        
        {/* Tax Breakup Table */}
        <div className="w-full px-2 mb-4">
          <table className="w-full text-center border-collapse text-[10px]">
            <thead>
              <tr className="text-white" style={{ backgroundColor: themeColor }}>
                <th className="p-1 border border-[#5c238b] font-medium w-[40px]">SN</th>
                <th className="p-1 border border-[#5c238b] font-medium">HSN/SAC</th>
                <th className="p-1 border border-[#5c238b] font-medium">Taxable Amount</th>
                <th className="p-1 border border-[#5c238b] font-medium">GST(%)</th>
                <th className="p-1 border border-[#5c238b] font-medium">CGST</th>
                <th className="p-1 border border-[#5c238b] font-medium">SGST</th>
                <th className="p-1 border border-[#5c238b] font-medium">IGST</th>
                <th className="p-1 border border-[#5c238b] font-medium">Total Tax</th>
              </tr>
            </thead>
            <tbody>
              {/* Example Single Row mapping; in real app this maps over tax summaries */}
              <tr className="border-b border-gray-200 text-[9px]">
                <td className="p-1">1</td>
                <td className="p-1">-</td>
                <td className="p-1">₹ {totalTaxable.toFixed(2)}</td>
                <td className="p-1">5</td>
                <td className="p-1">₹ {previewInvoice?.totalCgst ? Number(previewInvoice.totalCgst).toFixed(2) : '0.00'}</td>
                <td className="p-1">₹ {previewInvoice?.totalSgst ? Number(previewInvoice.totalSgst).toFixed(2) : '0.00'}</td>
                <td className="p-1">₹ {previewInvoice?.totalIgst ? Number(previewInvoice.totalIgst).toFixed(2) : '0.00'}</td>
                <td className="p-1">₹ {previewInvoice?.totalGstAmount ? Number(previewInvoice.totalGstAmount).toFixed(2) : '0.00'}</td>
              </tr>
              <tr className="font-bold border-b border-gray-200 text-[10px]">
                <td colSpan="2" className="p-1.5 text-center">Total</td>
                <td className="p-1.5">₹ {totalTaxable.toFixed(2)}</td>
                <td className="p-1.5"></td>
                <td className="p-1.5">₹ {previewInvoice?.totalCgst ? Number(previewInvoice.totalCgst).toFixed(2) : '0.00'}</td>
                <td className="p-1.5">₹ {previewInvoice?.totalSgst ? Number(previewInvoice.totalSgst).toFixed(2) : '0.00'}</td>
                <td className="p-1.5">₹ {previewInvoice?.totalIgst ? Number(previewInvoice.totalIgst).toFixed(2) : '0.00'}</td>
                <td className="p-1.5">₹ {previewInvoice?.totalGstAmount ? Number(previewInvoice.totalGstAmount).toFixed(2) : '0.00'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Gray Container for Bank, Terms, Narration & Sign */}
        <div className="w-full bg-[#f8f9fa] flex flex-col p-4 rounded-sm mt-auto relative min-h-[220px]">
          
          <div className="font-bold text-[12px] mb-2 text-gray-800">Bank & Payment Details :</div>
          <div className="flex w-full mb-6 text-[10px]">
            <div className="flex flex-col w-[200px]">
              <div className="flex mb-1"><span className="w-[80px] text-gray-600">Bank Name:</span> <span className="font-bold text-gray-800">{previewInvoice?.bankName || allPrintSettings?.bankDetails?.bankName || 'Prime Bank'}</span></div>
              <div className="flex"><span className="w-[80px] text-gray-600">IFSC Code:</span> <span className="font-bold text-gray-800">{previewInvoice?.bankIfsc || allPrintSettings?.bankDetails?.bankIfsc || 'UTIBXXXXX'}</span></div>
            </div>
            <div className="flex flex-col">
              <div className="flex mb-1"><span className="w-[80px] text-gray-600">Bank A/C:</span> <span className="font-bold text-gray-800">{previewInvoice?.bankAccountNo || allPrintSettings?.bankDetails?.bankAccountNo || '1120XXXXXX'}</span></div>
              <div className="flex"><span className="w-[80px] text-gray-600">Branch:</span> <span className="font-bold text-gray-800 uppercase">{previewInvoice?.bankBranch || allPrintSettings?.bankDetails?.bankBranch || 'ALTHAN'}</span></div>
            </div>
          </div>

          <div className="flex w-full">
            {/* Terms and conditions */}
            <div className="w-1/2 pr-4 flex flex-col">
              <div className="font-bold text-[11px] text-gray-800 mb-1">Terms and conditions:</div>
              <div className="text-[9px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                {previewInvoice?.terms || 'Payment Terms: This section defines when payment is due. It may specify the number of days allowed for payment.\\n\\nLate Payment: Outlines the consequences of late payment, such as late fees or interest charges.'}
              </div>
            </div>
            
            {/* Narration */}
            <div className="w-1/2 pl-4 flex flex-col">
              <div className="font-bold text-[11px] text-gray-800 mb-1">Narration :</div>
              <div className="text-[9px] text-gray-600">
                {previewInvoice?.notes || footerSettings?.labelThankYouNote || 'Computer generated invoice signature not required.'}
              </div>
            </div>
          </div>

          {/* Bottom aligned items */}
          <div className="flex justify-between items-end absolute bottom-4 left-4 right-4">
            <div className="text-[9px] text-gray-500">
              Powered By HisabKitab
            </div>
            <div className="font-bold text-[11px] text-gray-800 flex flex-col items-center">
              <div className="mb-8"></div>
              <span>For {previewInvoice?.customer?.name || 'Jenifer Enterprise'}:</span>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('os_frontend/src/pages/PrintTemplates.jsx', preT2 + newT2 + postT2);
console.log('Template2 rebuilt');
