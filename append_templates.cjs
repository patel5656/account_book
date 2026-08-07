const fs = require('fs');
let templatesFile = fs.readFileSync('os_frontend/src/pages/PrintTemplates.jsx', 'utf8');

const t2 = `
export const Template2 = (props) => {
  const { previewInvoice, parsedItems, totalQty, totalTaxable, totalFinal, qrCodeUrl, headerSettings, footerSettings, tableSettings, transactionType2, allPrintSettings } = props;
  return (
    <div className="w-full flex flex-col font-sans text-[11px] bg-white">
      {/* Centered Header */}
      <div className="w-full text-center py-4 px-2">
        <h2 className="text-[18px] font-bold uppercase">{previewInvoice?.customer?.name || 'COMPANY NAME'}</h2>
        <p className="text-gray-600 mt-1 uppercase">{previewInvoice?.customer?.address || 'COMPANY ADDRESS, CITY, STATE, PINCODE'}</p>
        <p className="text-gray-600">Tel: {previewInvoice?.customer?.phone || '9999999999'} | Email: {previewInvoice?.customer?.email || 'email@example.com'}</p>
      </div>
      
      {/* Purple Title Bar */}
      <div className="w-full bg-[#4c3b8c] text-white text-center py-1 font-bold uppercase tracking-widest text-[13px]">
        {transactionType2 === 'Income Transaction' ? 'TAX INVOICE' : transactionType2}
      </div>
      
      {/* Invoice Details */}
      <div className="flex justify-between px-4 py-3 border-b border-gray-300">
        <div className="flex flex-col gap-1">
          <span className="font-bold text-[#4c3b8c]">Party Details:</span>
          <span className="font-bold">{previewInvoice?.customer?.name || 'CUSTOMER NAME'}</span>
          <span className="text-gray-600">{previewInvoice?.customer?.address || 'Customer Address'}</span>
          <span>GSTIN: {previewInvoice?.customer?.gstin || ''}</span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="font-bold">Invoice No: {previewInvoice?.invoiceNo || 'INV-001'}</span>
          <span className="font-bold">Invoice Date: {previewInvoice?.date ? new Date(previewInvoice.date).toLocaleDateString('en-GB') : ''}</span>
        </div>
      </div>
      
      {/* Table */}
      <div className="w-full px-2 mt-2">
        <table className="w-full text-center border-collapse text-[10px]">
          <thead>
            <tr className="bg-[#4c3b8c] text-white">
              <th className="p-1.5 border border-[#4c3b8c]">SN</th>
              <th className="p-1.5 border border-[#4c3b8c] text-left">Item Name</th>
              <th className="p-1.5 border border-[#4c3b8c]">HSN/SAC</th>
              <th className="p-1.5 border border-[#4c3b8c]">Qty</th>
              <th className="p-1.5 border border-[#4c3b8c]">Rate</th>
              <th className="p-1.5 border border-[#4c3b8c]">Dis.</th>
              <th className="p-1.5 border border-[#4c3b8c] text-right">Taxable</th>
              <th className="p-1.5 border border-[#4c3b8c] text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {parsedItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="p-1.5 border-l border-r border-gray-200">{idx + 1}</td>
                <td className="p-1.5 border-r border-gray-200 text-left font-bold">{item.name}</td>
                <td className="p-1.5 border-r border-gray-200">{item.hsn || '-'}</td>
                <td className="p-1.5 border-r border-gray-200">{item.qty}</td>
                <td className="p-1.5 border-r border-gray-200">{item.rate}</td>
                <td className="p-1.5 border-r border-gray-200">{item.discount}</td>
                <td className="p-1.5 border-r border-gray-200 text-right">{item.taxableValue}</td>
                <td className="p-1.5 border-r border-gray-200 text-right">{item.totalAmount}</td>
              </tr>
            ))}
            <tr className="bg-gray-100 font-bold border-b border-gray-200">
              <td colSpan="3" className="p-1.5 text-right border-l border-r border-gray-200">Total</td>
              <td className="p-1.5 border-r border-gray-200">{totalQty.toFixed(2)}</td>
              <td colSpan="2" className="p-1.5 border-r border-gray-200"></td>
              <td className="p-1.5 border-r border-gray-200 text-right">{totalTaxable.toFixed(2)}</td>
              <td className="p-1.5 border-r border-gray-200 text-right">{totalFinal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Taxes & Totals */}
      <div className="flex justify-between px-4 py-3 border-b border-gray-300 mt-2">
        <div className="flex flex-col gap-1 w-1/2">
          <span className="font-bold">Total In Words:</span>
          <span className="text-gray-700 italic">{previewInvoice?.amountInWords || ''}</span>
        </div>
        <div className="flex flex-col gap-1 w-1/3">
          <div className="flex justify-between"><span>Taxable Amount:</span> <span>{totalTaxable.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>CGST:</span> <span>{previewInvoice?.totalCgst || '0.00'}</span></div>
          <div className="flex justify-between"><span>SGST:</span> <span>{previewInvoice?.totalSgst || '0.00'}</span></div>
          <div className="flex justify-between"><span>IGST:</span> <span>{previewInvoice?.totalIgst || '0.00'}</span></div>
          <div className="flex justify-between font-bold text-[#4c3b8c] text-[13px] border-t border-gray-300 pt-1 mt-1">
            <span>Grand Total:</span> <span>{previewInvoice?.totalAmount || totalFinal.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex justify-between px-4 py-4">
        <div className="flex flex-col gap-2 w-2/3 pr-4">
          <span className="font-bold">Bank Details</span>
          <div className="flex gap-4 items-center bg-gray-50 p-2 rounded border border-gray-200">
            {headerSettings.showQrCode && qrCodeUrl && <img src={qrCodeUrl} alt="QR" className="w-16 h-16" />}
            <div className="flex flex-col gap-1">
              <span>Bank: {previewInvoice?.bankName || allPrintSettings?.bankDetails?.bankName}</span>
              <span>A/c No: {previewInvoice?.bankAccountNo || allPrintSettings?.bankDetails?.bankAccountNo}</span>
              <span>IFSC: {previewInvoice?.bankIfsc || allPrintSettings?.bankDetails?.bankIfsc}</span>
            </div>
          </div>
          <span className="font-bold mt-2">Terms & Conditions</span>
          <span className="text-gray-600 text-[9px]">{previewInvoice?.terms || ''}</span>
        </div>
        <div className="w-1/3 flex flex-col justify-end items-end text-center pt-8">
          <div className="border-t border-black w-3/4 pt-1 font-bold">Authorized Signatory</div>
        </div>
      </div>
    </div>
  );
};
`;

const t3 = `
export const Template3 = (props) => {
  const { previewInvoice, parsedItems, totalQty, totalTaxable, totalFinal, qrCodeUrl, headerSettings, footerSettings, tableSettings, transactionType2, allPrintSettings } = props;
  return (
    <div className="w-full flex flex-col font-sans text-[11px] bg-white border-2 border-[#14b8a6] p-2">
      {/* Header */}
      <div className="flex justify-between items-center w-full bg-[#14b8a6] text-white p-4">
        <div className="text-[24px] font-bold tracking-widest">{transactionType2 === 'Income Transaction' ? 'INVOICE' : transactionType2}</div>
        <div className="text-right">
          <h2 className="font-bold text-[16px]">{previewInvoice?.customer?.name || 'COMPANY NAME'}</h2>
          <p>{previewInvoice?.customer?.address || 'Company Address Line 1'}</p>
          <p>{previewInvoice?.customer?.phone || '1234567890'} | {previewInvoice?.customer?.email}</p>
        </div>
      </div>
      
      {/* Details */}
      <div className="flex mt-4 px-2">
        <div className="flex-1 flex flex-col gap-1">
          <span className="text-[#14b8a6] font-bold">BILL TO</span>
          <span className="font-bold text-[13px]">{previewInvoice?.customer?.name || 'CUSTOMER NAME'}</span>
          <span>{previewInvoice?.customer?.address}</span>
          <span>GSTIN: {previewInvoice?.customer?.gstin}</span>
        </div>
        <div className="flex-1 flex flex-col gap-1 items-end">
          <span className="text-[#14b8a6] font-bold">INVOICE DETAILS</span>
          <div className="flex gap-4">
            <span className="text-gray-500">Invoice No:</span> <span className="font-bold">{previewInvoice?.invoiceNo}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-500">Date:</span> <span className="font-bold">{previewInvoice?.date ? new Date(previewInvoice.date).toLocaleDateString('en-GB') : ''}</span>
          </div>
        </div>
      </div>
      
      {/* Table */}
      <div className="w-full mt-4">
        <table className="w-full text-center border-collapse text-[10px]">
          <thead>
            <tr className="bg-[#14b8a6] text-white">
              <th className="p-2 border border-[#14b8a6]">SN</th>
              <th className="p-2 border border-[#14b8a6] text-left">Description</th>
              <th className="p-2 border border-[#14b8a6]">HSN/SAC</th>
              <th className="p-2 border border-[#14b8a6]">Qty</th>
              <th className="p-2 border border-[#14b8a6]">Rate</th>
              <th className="p-2 border border-[#14b8a6]">Taxable</th>
              <th className="p-2 border border-[#14b8a6] text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {parsedItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="p-2 border-l border-r border-gray-200">{idx + 1}</td>
                <td className="p-2 border-r border-gray-200 text-left font-bold">{item.name}</td>
                <td className="p-2 border-r border-gray-200">{item.hsn || '-'}</td>
                <td className="p-2 border-r border-gray-200">{item.qty}</td>
                <td className="p-2 border-r border-gray-200">{item.rate}</td>
                <td className="p-2 border-r border-gray-200">{item.taxableValue}</td>
                <td className="p-2 border-r border-gray-200 text-right">{item.totalAmount}</td>
              </tr>
            ))}
            <tr className="bg-teal-50 font-bold border-b border-teal-200">
              <td colSpan="3" className="p-2 text-right border-l border-r border-teal-200">Total</td>
              <td className="p-2 border-r border-teal-200">{totalQty.toFixed(2)}</td>
              <td colSpan="1" className="p-2 border-r border-teal-200"></td>
              <td className="p-2 border-r border-teal-200">{totalTaxable.toFixed(2)}</td>
              <td className="p-2 border-r border-teal-200 text-right">{totalFinal.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* Taxes */}
      <div className="flex justify-end mt-4 px-2">
        <div className="w-1/3 flex flex-col gap-1 bg-teal-50 p-2 border border-teal-200 rounded">
          <div className="flex justify-between"><span>Taxable Value:</span> <span>{totalTaxable.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>CGST:</span> <span>{previewInvoice?.totalCgst || '0.00'}</span></div>
          <div className="flex justify-between"><span>SGST:</span> <span>{previewInvoice?.totalSgst || '0.00'}</span></div>
          <div className="flex justify-between"><span>IGST:</span> <span>{previewInvoice?.totalIgst || '0.00'}</span></div>
          <div className="flex justify-between font-bold text-[14px] text-[#14b8a6] border-t border-teal-300 pt-1 mt-1">
            <span>Total:</span> <span>{previewInvoice?.totalAmount || totalFinal.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex justify-between mt-6 px-2">
        <div className="w-1/2 flex flex-col gap-1">
          <span className="font-bold text-[#14b8a6]">Notes / Terms</span>
          <p className="text-gray-600 text-[9px]">{previewInvoice?.terms || ''}</p>
        </div>
        <div className="w-1/3 text-center pt-10">
          <div className="border-t border-[#14b8a6] font-bold text-[#14b8a6] pt-1">Authorized Signatory</div>
        </div>
      </div>
    </div>
  );
};
`;

const t4 = `
export const Template4 = (props) => {
  const { previewInvoice, parsedItems, totalQty, totalTaxable, totalFinal, qrCodeUrl, headerSettings, footerSettings, tableSettings, transactionType2, allPrintSettings } = props;
  return (
    <div className="w-full flex font-sans text-[11px] bg-white border border-gray-300">
      <div className="w-2 bg-[#2563eb]"></div>
      <div className="flex-1 flex flex-col p-4">
        {/* Header */}
        <div className="flex justify-between border-b-2 border-[#2563eb] pb-4 mb-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[22px] font-black text-[#2563eb] tracking-tight">{previewInvoice?.customer?.name || 'COMPANY NAME'}</h2>
            <p className="text-gray-600">{previewInvoice?.customer?.address || 'Company Address Line 1'}</p>
            <p className="text-gray-600">GSTIN: {previewInvoice?.customer?.gstin}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-[20px] font-bold text-gray-800 uppercase tracking-widest">{transactionType2 === 'Income Transaction' ? 'INVOICE' : transactionType2}</div>
            <div className="flex gap-2"><span className="text-gray-500 font-bold">INV NO:</span> <span>{previewInvoice?.invoiceNo}</span></div>
            <div className="flex gap-2"><span className="text-gray-500 font-bold">DATE:</span> <span>{previewInvoice?.date ? new Date(previewInvoice.date).toLocaleDateString('en-GB') : ''}</span></div>
          </div>
        </div>

        {/* Bill To */}
        <div className="bg-blue-50 p-3 rounded mb-4 flex">
          <div className="flex-1">
            <div className="text-[#2563eb] font-bold mb-1">BILLED TO:</div>
            <div className="font-bold text-[13px]">{previewInvoice?.customer?.name || 'Customer Name'}</div>
            <div>{previewInvoice?.customer?.address}</div>
            <div>GSTIN: {previewInvoice?.customer?.gstin}</div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full text-left border-collapse text-[10px] mb-4">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-2 text-gray-800 font-black">ITEM DESCRIPTION</th>
              <th className="py-2 text-gray-800 font-black text-center">HSN</th>
              <th className="py-2 text-gray-800 font-black text-center">QTY</th>
              <th className="py-2 text-gray-800 font-black text-right">RATE</th>
              <th className="py-2 text-gray-800 font-black text-right">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {parsedItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-2 font-bold text-gray-800">{item.name}</td>
                <td className="py-2 text-center text-gray-600">{item.hsn || '-'}</td>
                <td className="py-2 text-center text-gray-600">{item.qty}</td>
                <td className="py-2 text-right text-gray-600">{item.rate}</td>
                <td className="py-2 text-right font-bold text-gray-800">{item.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-1/2 flex flex-col gap-1 border-t-2 border-gray-800 pt-2">
            <div className="flex justify-between text-gray-600 font-bold"><span>SUBTOTAL</span> <span>{totalTaxable.toFixed(2)}</span></div>
            <div className="flex justify-between text-gray-600"><span>CGST</span> <span>{previewInvoice?.totalCgst || '0.00'}</span></div>
            <div className="flex justify-between text-gray-600"><span>SGST</span> <span>{previewInvoice?.totalSgst || '0.00'}</span></div>
            <div className="flex justify-between text-gray-600"><span>IGST</span> <span>{previewInvoice?.totalIgst || '0.00'}</span></div>
            <div className="flex justify-between font-black text-[15px] text-[#2563eb] border-t border-gray-300 pt-2 mt-1">
              <span>TOTAL</span> <span>{previewInvoice?.totalAmount || totalFinal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end mt-auto pt-4 border-t border-gray-300">
          <div className="flex flex-col gap-1 w-2/3">
            {headerSettings.showQrCode && qrCodeUrl && (
              <div className="flex items-center gap-2 mb-2">
                <img src={qrCodeUrl} alt="QR" className="w-12 h-12" />
                <span className="text-gray-500 font-bold text-[9px]">Scan to pay</span>
              </div>
            )}
            <span className="font-bold text-gray-800">TERMS</span>
            <span className="text-gray-500 text-[9px]">{previewInvoice?.terms || ''}</span>
          </div>
          <div className="w-1/3 text-center">
            <div className="border-t border-gray-400 pt-1 font-bold text-gray-800">Authorised Signatory</div>
          </div>
        </div>
      </div>
    </div>
  );
};
`;

const t5 = `
export const Template5 = (props) => {
  const { previewInvoice, parsedItems, totalQty, totalTaxable, totalFinal, qrCodeUrl, headerSettings, footerSettings, tableSettings, transactionType2, allPrintSettings } = props;
  return (
    <div className="w-full flex flex-col font-sans text-[11px] bg-white border border-[#f97316] rounded-lg overflow-hidden">
      {/* Orange Top Bar */}
      <div className="w-full h-3 bg-[#f97316]"></div>
      
      {/* Header */}
      <div className="flex justify-between p-4 pb-2 border-b border-gray-200">
        <div className="flex flex-col gap-1 w-1/2">
          <h2 className="text-[20px] font-black text-gray-800">{previewInvoice?.customer?.name || 'COMPANY NAME'}</h2>
          <p className="text-gray-600">GSTIN: {previewInvoice?.customer?.gstin}</p>
          <p className="text-gray-600">{previewInvoice?.customer?.address}</p>
          <p className="text-gray-600">Ph: {previewInvoice?.customer?.phone} | Email: {previewInvoice?.customer?.email}</p>
        </div>
        <div className="flex flex-col w-1/2 border-l border-gray-200 pl-4">
          <span className="font-black text-gray-800 mb-1">BILL TO:</span>
          <span className="font-bold">{previewInvoice?.customer?.name || 'Customer Name'}</span>
          <span className="text-gray-600">{previewInvoice?.customer?.address}</span>
          <span className="text-gray-600">GSTIN: {previewInvoice?.customer?.gstin}</span>
        </div>
      </div>

      {/* Info Bar */}
      <div className="flex justify-between p-3 bg-gray-50 border-b border-gray-200 text-[10px]">
        <div className="flex gap-2"><span className="font-bold text-gray-700">Invoice No:</span> <span>{previewInvoice?.invoiceNo}</span></div>
        <div className="flex gap-2"><span className="font-bold text-gray-700">Date:</span> <span>{previewInvoice?.date ? new Date(previewInvoice.date).toLocaleDateString('en-GB') : ''}</span></div>
      </div>

      {/* Table */}
      <div className="w-full p-4">
        <table className="w-full text-center border-collapse text-[10px]">
          <thead>
            <tr className="bg-[#f97316] text-white">
              <th className="p-2 border border-[#f97316]">SN</th>
              <th className="p-2 border border-[#f97316] text-left">Item Name</th>
              <th className="p-2 border border-[#f97316]">HSN</th>
              <th className="p-2 border border-[#f97316]">Qty</th>
              <th className="p-2 border border-[#f97316]">Rate</th>
              <th className="p-2 border border-[#f97316]">Amount</th>
            </tr>
          </thead>
          <tbody>
            {parsedItems.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="p-2 border-l border-r border-gray-200">{idx + 1}</td>
                <td className="p-2 border-r border-gray-200 text-left font-bold text-gray-800">{item.name}</td>
                <td className="p-2 border-r border-gray-200 text-gray-600">{item.hsn || '-'}</td>
                <td className="p-2 border-r border-gray-200">{item.qty}</td>
                <td className="p-2 border-r border-gray-200">{item.rate}</td>
                <td className="p-2 border-r border-gray-200 font-bold text-gray-800 text-right">{item.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Container */}
        <div className="flex mt-4 border border-gray-300 rounded overflow-hidden">
          <div className="w-2/3 p-3 bg-gray-50 flex flex-col gap-2">
            <span className="font-bold text-gray-700">Total In Words:</span>
            <span className="text-[#f97316] font-bold">{previewInvoice?.amountInWords}</span>
            <div className="mt-2 font-bold text-gray-700">Bank Details:</div>
            <span className="text-gray-600">Bank: {previewInvoice?.bankName || allPrintSettings?.bankDetails?.bankName}</span>
            <span className="text-gray-600">A/c No: {previewInvoice?.bankAccountNo || allPrintSettings?.bankDetails?.bankAccountNo}</span>
            <span className="text-gray-600">IFSC: {previewInvoice?.bankIfsc || allPrintSettings?.bankDetails?.bankIfsc}</span>
          </div>
          <div className="w-1/3 flex flex-col bg-white">
            <div className="flex justify-between p-2 text-gray-600 border-b border-gray-200"><span>Taxable:</span> <span>{totalTaxable.toFixed(2)}</span></div>
            <div className="flex justify-between p-2 text-gray-600 border-b border-gray-200"><span>CGST:</span> <span>{previewInvoice?.totalCgst || '0.00'}</span></div>
            <div className="flex justify-between p-2 text-gray-600 border-b border-gray-200"><span>SGST:</span> <span>{previewInvoice?.totalSgst || '0.00'}</span></div>
            <div className="flex justify-between p-2 text-gray-600 border-b border-gray-200"><span>IGST:</span> <span>{previewInvoice?.totalIgst || '0.00'}</span></div>
            <div className="flex justify-between p-2 font-black text-white bg-[#f97316]"><span>Total:</span> <span>{previewInvoice?.totalAmount || totalFinal.toFixed(2)}</span></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between p-4 pt-0 mt-auto">
        <div className="w-2/3 flex flex-col gap-1">
          <span className="font-bold text-gray-800">Terms & Conditions</span>
          <span className="text-gray-500 text-[9px] pr-4">{previewInvoice?.terms || ''}</span>
        </div>
        <div className="w-1/3 text-center pt-8">
          <div className="border-t border-gray-400 pt-1 font-bold text-gray-800">For, {previewInvoice?.customer?.name || 'Company Name'}</div>
        </div>
      </div>
      
      {/* Orange Bottom Bar */}
      <div className="w-full h-3 bg-[#f97316] mt-2"></div>
    </div>
  );
};
`;

fs.appendFileSync('os_frontend/src/pages/PrintTemplates.jsx', t2 + t3 + t4 + t5);
console.log('Appended templates');
