const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintTemplates.jsx', 'utf8');

const t5Start = content.indexOf('export const Template5 =');

if (t5Start !== -1) {
  const pre = content.substring(0, t5Start);

  const newT5 = `export const Template5 = ({ 
  previewInvoice, 
  parsedItems, 
  totalQty, 
  totalTaxable, 
  totalFinal, 
  qrCodeUrl, 
  allPrintSettings, 
  headerSettings, 
  tableSettings, 
  footerSettings, 
  customization, 
  transactionType, 
  transactionType2 
}) => {
  const primaryColor = customization?.primaryColor || '#4d1685';

  return (
    <div className="w-full bg-white text-black text-[10px] font-sans border border-gray-400 p-4">
       {/* Top decorative line and Tax Invoice title */}
       <div className="w-full flex items-center mb-4">
          <div className="h-2 w-1/2" style={{ backgroundColor: primaryColor }}></div>
          <div className="px-4 text-[14px] font-bold uppercase" style={{ color: primaryColor }}>
             {transactionType || 'TAX INVOICE'}
          </div>
       </div>

       {/* 1. Header Information */}
       <div className="w-full mb-6 relative">
          {headerSettings?.showLogo && previewInvoice?.companyLogo && (
            <div className="w-[80px] h-[80px] border border-gray-200 bg-gray-50 flex items-center justify-center p-1 mb-2">
               <img src={previewInvoice.companyLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <h1 className="text-[24px] font-normal uppercase text-gray-800 tracking-wide">{previewInvoice?.companyName || ''}</h1>
          <div className="flex flex-col gap-[2px] text-gray-700 mt-1">
             {previewInvoice?.companyGst && <div className="font-bold text-[9px]">GSTIN: {previewInvoice.companyGst}</div>}
             {previewInvoice?.companyAddress && <div className="uppercase text-[9px]">{previewInvoice.companyAddress}</div>}
             <div className="text-[9px]">
                {previewInvoice?.companyPhone && <span>Tel: {previewInvoice.companyPhone} | </span>}
                {previewInvoice?.companyEmail && <span>{previewInvoice.companyEmail}</span>}
             </div>
          </div>
       </div>

       {/* 2. Middle Grid Section */}
       <div className="w-full flex gap-4 mb-4">
          {/* Column 1 */}
          <div className="flex-1 flex flex-col gap-1">
             <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">Invoice No.:</span> <span>{previewInvoice?.invoiceNumber || ''}</span></div>
             <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">Invoice Date:</span> <span>{previewInvoice?.invoiceDate || ''}</span></div>
             <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">E-way Bill No.:</span> <span>{previewInvoice?.ewayBillNo || ''}</span></div>
             <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">E-way Bill Date:</span> <span>{previewInvoice?.ewayBillDate || ''}</span></div>
          </div>
          {/* Column 2: Bill To */}
          <div className="flex-1 flex flex-col gap-1">
             <div className="font-bold">Bill To:</div>
             <div className="font-bold uppercase">{previewInvoice?.customerName || ''}</div>
             {previewInvoice?.customerGst && <div>GSTIN: {previewInvoice.customerGst}</div>}
             {previewInvoice?.customerPan && <div>PAN: {previewInvoice.customerPan}</div>}
             <div className="uppercase">{previewInvoice?.customerAddress || ''}</div>
             {previewInvoice?.customerPhone && <div>Contact No: {previewInvoice.customerPhone}</div>}
             {previewInvoice?.customerEmail && <div>Email: {previewInvoice.customerEmail}</div>}
          </div>
          {/* Column 3: Ship To */}
          <div className="flex-1 flex flex-col gap-1">
             <div className="font-bold">Ship To:</div>
             <div className="font-bold uppercase">{previewInvoice?.shippingName || previewInvoice?.customerName || ''}</div>
             {previewInvoice?.shippingGst && <div>GSTIN: {previewInvoice.shippingGst}</div>}
             <div className="uppercase">{previewInvoice?.shippingAddress || previewInvoice?.customerAddress || ''}</div>
             {previewInvoice?.shippingPhone && <div>Contact No: {previewInvoice.shippingPhone}</div>}
             
             <div className="mt-2 grid grid-cols-[100px_1fr]"><span className="font-bold">Delivery Challan No.:</span> <span>{previewInvoice?.deliveryChallanNo || ''}</span></div>
             <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">Delivery Date:</span> <span>{previewInvoice?.deliveryDate || ''}</span></div>
             <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">Ack No.:</span> <span>{previewInvoice?.ackNo || ''}</span></div>
             <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">Ack Date:</span> <span>{previewInvoice?.ackDate || ''}</span></div>
          </div>
       </div>

       {/* 3. Items Table */}
       <div className="w-full border border-gray-400 mb-4">
         <table className="w-full text-center border-collapse text-[10px]">
           <thead>
             <tr className="text-white" style={{ backgroundColor: primaryColor }}>
               <th className="p-1.5 border border-gray-400">SN</th>
               <th className="p-1.5 border border-gray-400 text-left">Item Name</th>
               <th className="p-1.5 border border-gray-400">HSN/SAC</th>
               <th className="p-1.5 border border-gray-400">Qty</th>
               <th className="p-1.5 border border-gray-400">MRP</th>
               <th className="p-1.5 border border-gray-400">Rate</th>
               <th className="p-1.5 border border-gray-400">Dis.</th>
               <th className="p-1.5 border border-gray-400">Dis. 2</th>
               <th className="p-1.5 border border-gray-400">Total Dis.</th>
               <th className="p-1.5 border border-gray-400">Taxable Value</th>
               <th className="p-1.5 border border-gray-400">Total Amount</th>
             </tr>
           </thead>
           <tbody>
             {parsedItems && parsedItems.length > 0 ? (
               parsedItems.map((item, idx) => (
                 <tr key={idx} className="border-b border-gray-400 align-top">
                   <td className="p-1.5 border-r border-gray-400">{idx + 1}</td>
                   <td className="p-1.5 border-r border-gray-400 text-left w-[180px]">
                     <div>{item.name}</div>
                     {item.description && <div className="text-gray-500 text-[9px] mt-1">{item.description}</div>}
                   </td>
                   <td className="p-1.5 border-r border-gray-400">{item.hsn}</td>
                   <td className="p-1.5 border-r border-gray-400">{item.quantity}</td>
                   <td className="p-1.5 border-r border-gray-400">₹{parseFloat(item.price || 0).toFixed(2)}</td>
                   <td className="p-1.5 border-r border-gray-400">₹{parseFloat(item.price || 0).toFixed(2)}</td>
                   <td className="p-1.5 border-r border-gray-400">{item.discount || 0}</td>
                   <td className="p-1.5 border-r border-gray-400">0</td>
                   <td className="p-1.5 border-r border-gray-400">0.00</td>
                   <td className="p-1.5 border-r border-gray-400">₹{parseFloat(item.total || 0).toFixed(2)}</td>
                   <td className="p-1.5">₹{parseFloat(item.total || 0).toFixed(2)}</td>
                 </tr>
               ))
             ) : (
                <tr className="border-b border-gray-400">
                  <td colSpan={11} className="p-4 text-center text-gray-400 italic">No items added yet</td>
                </tr>
             )}
             
             {/* Total Row */}
             <tr className="font-bold border-t border-gray-400">
               <td colSpan={3} className="p-1.5 text-left border-r border-gray-400">Total</td>
               <td className="p-1.5 border-r border-gray-400">{totalQty || '0.00'}</td>
               <td colSpan={5} className="p-1.5 border-r border-gray-400"></td>
               <td className="p-1.5 border-r border-gray-400">₹{totalTaxable || '0.00'}</td>
               <td className="p-1.5">₹{totalFinal || '0.00'}</td>
             </tr>
           </tbody>
         </table>
       </div>

       {/* 4. Bank Details & Totals block */}
       <div className="w-full flex border border-gray-400 mb-4">
          <div className="flex-[2] p-2 flex flex-col justify-between border-r border-gray-400">
             <div className="flex gap-2 font-bold mb-2">
                <span>In Words:</span>
                <span style={{ color: primaryColor }}>{previewInvoice?.totalInWords || ''}</span>
             </div>
             
             <div className="flex gap-4">
                {footerSettings?.showQrCode && qrCodeUrl && (
                  <div className="flex flex-col items-center justify-center">
                     <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
                  </div>
                )}
                {footerSettings?.showBankDetails && (
                  <div className="flex flex-col gap-1">
                     <div className="font-bold text-[#4d1685]" style={{ color: primaryColor }}>Bank Details</div>
                     <div className="flex gap-2"><span>Bank :</span> <span className="font-medium">{previewInvoice?.bankDetails?.bankName || ''}</span></div>
                     <div className="flex gap-2"><span>Account No. :</span> <span className="font-medium">{previewInvoice?.bankDetails?.accountNumber || ''}</span></div>
                     <div className="flex gap-2"><span>IFSC :</span> <span className="font-medium">{previewInvoice?.bankDetails?.ifscCode || ''}</span></div>
                     <div className="flex gap-2"><span>Branch :</span> <span className="font-medium">{previewInvoice?.bankDetails?.branchName || ''}</span></div>
                     <div className="flex gap-2 mt-1"><span>UPI ID :</span> <span className="font-medium">{previewInvoice?.upiId || ''}</span></div>
                  </div>
                )}
             </div>
          </div>
          <div className="flex-1 flex flex-col justify-between">
             <div className="flex-1 flex flex-col justify-center gap-1 p-2">
                {previewInvoice?.freightCharge > 0 && <div className="flex justify-between"><span>Freight Charges:</span> <span>₹{parseFloat(previewInvoice.freightCharge).toFixed(2)}</span></div>}
                {previewInvoice?.packingCharge > 0 && <div className="flex justify-between"><span>Packing Charge:</span> <span>₹{parseFloat(previewInvoice.packingCharge).toFixed(2)}</span></div>}
             </div>
             <div className="flex justify-between p-2 border-t border-gray-400">
                <span>Round off:</span> 
                <span>₹{previewInvoice?.roundOff ? parseFloat(previewInvoice.roundOff).toFixed(2) : '0.00'}</span>
             </div>
             <div className="flex justify-between p-2 font-bold text-white text-[12px]" style={{ backgroundColor: primaryColor }}>
                <span>Total</span> 
                <span>₹{totalFinal || '0.00'}</span>
             </div>
          </div>
       </div>

       {/* 5. Tax Breakup Table */}
       <div className="w-full border border-gray-400 mb-4">
         <table className="w-full text-center border-collapse text-[10px]">
           <thead>
             <tr className="text-white" style={{ backgroundColor: primaryColor }}>
               <th className="p-1.5 border border-gray-400">SN</th>
               <th className="p-1.5 border border-gray-400">HSN/SAC</th>
               <th className="p-1.5 border border-gray-400">Taxable Amount</th>
               <th className="p-1.5 border border-gray-400">GST (%)</th>
               <th className="p-1.5 border border-gray-400">CGST</th>
               <th className="p-1.5 border border-gray-400">SGST</th>
               <th className="p-1.5 border border-gray-400">Total Tax</th>
             </tr>
           </thead>
           <tbody>
             <tr className="border-b border-gray-400">
               <td className="p-1.5 border-r border-gray-400">1</td>
               <td className="p-1.5 border-r border-gray-400">-</td>
               <td className="p-1.5 border-r border-gray-400">₹{totalTaxable || '0.00'}</td>
               <td className="p-1.5 border-r border-gray-400">-</td>
               <td className="p-1.5 border-r border-gray-400">₹{previewInvoice?.totalCgst ? parseFloat(previewInvoice.totalCgst).toFixed(2) : '0.00'}</td>
               <td className="p-1.5 border-r border-gray-400">₹{previewInvoice?.totalSgst ? parseFloat(previewInvoice.totalSgst).toFixed(2) : '0.00'}</td>
               <td className="p-1.5">₹{previewInvoice?.totalGstAmount ? parseFloat(previewInvoice.totalGstAmount).toFixed(2) : '0.00'}</td>
             </tr>
             <tr className="font-bold">
               <td colSpan={2} className="p-1.5 border-r border-gray-400">Total</td>
               <td className="p-1.5 border-r border-gray-400">₹{totalTaxable || '0.00'}</td>
               <td className="p-1.5 border-r border-gray-400"></td>
               <td className="p-1.5 border-r border-gray-400">₹{previewInvoice?.totalCgst ? parseFloat(previewInvoice.totalCgst).toFixed(2) : '0.00'}</td>
               <td className="p-1.5 border-r border-gray-400">₹{previewInvoice?.totalSgst ? parseFloat(previewInvoice.totalSgst).toFixed(2) : '0.00'}</td>
               <td className="p-1.5">₹{previewInvoice?.totalGstAmount ? parseFloat(previewInvoice.totalGstAmount).toFixed(2) : '0.00'}</td>
             </tr>
           </tbody>
         </table>
       </div>

       {/* 6. Footer (Notes, Terms & Signature) */}
       <div className="w-full flex border border-gray-400 min-h-[100px]">
          <div className="flex-[2] p-3 flex flex-col gap-2 border-r border-gray-400">
             <div>
               <div className="font-bold mb-1">Notes:</div>
               <div className="text-gray-600 leading-tight">{previewInvoice?.notes || ''}</div>
             </div>
             <div>
               <div className="font-bold mb-1">Terms and Conditions:</div>
               <div className="text-gray-600 leading-tight">{previewInvoice?.terms || ''}</div>
             </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-between text-center p-3 bg-gray-50/50">
             <div className="font-bold w-full max-w-[200px]">For, {previewInvoice?.companyName || ''}</div>
             <div className="mt-4 flex flex-col items-center w-full">
               {footerSettings?.showSignature && previewInvoice?.signatureUrl ? (
                 <img src={previewInvoice.signatureUrl} alt="Signature" className="h-14 object-contain mix-blend-multiply" />
               ) : (
                 <div className="h-14 w-full flex items-center justify-center text-gray-300 italic">Signature Here</div>
               )}
               <div className="text-[10px] mt-2 w-full pt-1">Authorized Signatory</div>
             </div>
          </div>
       </div>

    </div>
  );
};
`;

  const finalContent = pre + newT5 + '\n';
  fs.writeFileSync('os_frontend/src/pages/PrintTemplates.jsx', finalContent);
  console.log('Template5 updated successfully!');
} else {
  console.log('Could not find boundaries.');
}
