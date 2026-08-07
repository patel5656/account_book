const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintTemplates.jsx', 'utf8');

const t4Start = content.indexOf('export const Template4 =');
const t5Start = content.indexOf('export const Template5 =');

if (t4Start !== -1 && t5Start !== -1) {
  const pre = content.substring(0, t4Start);
  const post = content.substring(t5Start);

  const newT4 = `export const Template4 = ({ 
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
    <div className="w-full bg-white text-black text-[10px] font-sans border border-gray-400">
       {/* 1. Top Section */}
       <div className="p-4 flex flex-col border-b border-gray-400 relative">
          <div className="w-full flex justify-between text-[9px] mb-2">
            <span>{transactionType || 'TAX INVOICE'}</span>
            <span>(Original)</span>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-1 w-3/4">
               <h1 className="text-[22px] font-bold uppercase">{previewInvoice?.companyName || ''}</h1>
               {previewInvoice?.companyGst && <div>GSTIN: {previewInvoice.companyGst}</div>}
               {previewInvoice?.companyAddress && <div className="uppercase">{previewInvoice.companyAddress}</div>}
               {previewInvoice?.companyPhone && <div>Tel : {previewInvoice.companyPhone}</div>}
               {previewInvoice?.companyEmail && <div>Email : {previewInvoice.companyEmail}</div>}
            </div>
            {headerSettings?.showLogo && previewInvoice?.companyLogo && (
              <div className="w-[100px] h-[100px] border border-gray-200 bg-gray-50 flex items-center justify-center p-2">
                 <img src={previewInvoice.companyLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
              </div>
            )}
          </div>
       </div>

       {/* 2. Middle Grid Section */}
       <div className="flex border-b border-gray-400">
          <div className="flex-1 p-4 flex flex-col gap-1 border-r border-gray-400">
             <div className="grid grid-cols-[100px_1fr]"><span className="text-gray-600">Invoice no</span> <span>: {previewInvoice?.invoiceNumber || ''}</span></div>
             <div className="grid grid-cols-[100px_1fr]"><span className="text-gray-600">Invoice Date</span> <span>: {previewInvoice?.invoiceDate || ''}</span></div>
             <div className="mt-8 grid grid-cols-[100px_1fr]"><span className="text-gray-600">Delivery Challan No</span> <span>: {previewInvoice?.deliveryChallanNo || ''}</span></div>
             <div className="grid grid-cols-[100px_1fr]"><span className="text-gray-600">Delivery Date</span> <span>: {previewInvoice?.deliveryDate || ''}</span></div>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-1 border-r border-gray-400">
             <div className="font-bold">Bill to:</div>
             <div className="uppercase">{previewInvoice?.customerName || ''}</div>
             {previewInvoice?.customerGst && <div>GSTIN: {previewInvoice.customerGst}</div>}
             {previewInvoice?.customerPan && <div>PAN: {previewInvoice.customerPan}</div>}
             <div className="uppercase">{previewInvoice?.customerAddress || ''}</div>
             {previewInvoice?.customerPhone && <div>Contact No: {previewInvoice.customerPhone}</div>}
             {previewInvoice?.customerEmail && <div>Email: {previewInvoice.customerEmail}</div>}

             <div className="mt-4 grid grid-cols-[80px_1fr]"><span className="text-gray-600">E-way Bill No</span> <span>: {previewInvoice?.ewayBillNo || ''}</span></div>
             <div className="grid grid-cols-[80px_1fr]"><span className="text-gray-600">E-way Bill Date</span> <span>: {previewInvoice?.ewayBillDate || ''}</span></div>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-1">
             <div className="font-bold">Ship to:</div>
             <div className="uppercase">{previewInvoice?.shippingName || previewInvoice?.customerName || ''}</div>
             {previewInvoice?.shippingGst && <div>GSTIN: {previewInvoice.shippingGst}</div>}
             {previewInvoice?.customerPan && <div>PAN: {previewInvoice.customerPan}</div>}
             <div className="uppercase">{previewInvoice?.shippingAddress || previewInvoice?.customerAddress || ''}</div>
             {previewInvoice?.shippingPhone && <div>Contact No: {previewInvoice.shippingPhone}</div>}
          </div>
       </div>

       {/* 3. Table */}
       <div className="w-full border-b border-gray-400">
         <table className="w-full text-center border-collapse text-[10px]">
           <thead>
             <tr className="text-white" style={{ backgroundColor: primaryColor }}>
               <th className="p-2 border-r border-white/20 w-[30px]">SN</th>
               <th className="p-2 border-r border-white/20 text-left">Item Name</th>
               <th className="p-2 border-r border-white/20">HSN/SAC</th>
               <th className="p-2 border-r border-white/20">Qty</th>
               <th className="p-2 border-r border-white/20">MRP</th>
               <th className="p-2 border-r border-white/20">Rate</th>
               <th className="p-2 border-r border-white/20">Dis.</th>
               <th className="p-2 border-r border-white/20">Dis . 2</th>
               <th className="p-2 border-r border-white/20">Total Dis.</th>
               <th className="p-2 border-r border-white/20">Taxable Value</th>
               <th className="p-2">Total Amount</th>
             </tr>
           </thead>
           <tbody>
             {parsedItems && parsedItems.length > 0 ? (
               parsedItems.map((item, idx) => (
                 <tr key={idx} className="border-b border-gray-200 align-top">
                   <td className="p-2 border-r border-gray-200">{idx + 1}</td>
                   <td className="p-2 border-r border-gray-200 text-left w-[200px]">
                     <div>{item.name}</div>
                     {item.description && <div className="text-gray-500 text-[9px] mt-1">{item.description}</div>}
                   </td>
                   <td className="p-2 border-r border-gray-200">{item.hsn}</td>
                   <td className="p-2 border-r border-gray-200">{item.quantity}</td>
                   <td className="p-2 border-r border-gray-200">₹{parseFloat(item.price || 0).toFixed(2)}</td>
                   <td className="p-2 border-r border-gray-200">₹{parseFloat(item.price || 0).toFixed(2)}</td>
                   <td className="p-2 border-r border-gray-200">{item.discount || 0}</td>
                   <td className="p-2 border-r border-gray-200">0</td>
                   <td className="p-2 border-r border-gray-200">0.00</td>
                   <td className="p-2 border-r border-gray-200">₹{parseFloat(item.total || 0).toFixed(2)}</td>
                   <td className="p-2">₹{parseFloat(item.total || 0).toFixed(2)}</td>
                 </tr>
               ))
             ) : (
                <tr className="border-b border-gray-200">
                  <td colSpan={11} className="p-4 text-center text-gray-400 italic">No items added yet</td>
                </tr>
             )}

             {/* Footer calculations inside table area like the image */}
             <tr className="border-t border-gray-300">
               <td colSpan={8} className="p-2 text-left align-top">
                  
               </td>
               <td colSpan={3} className="p-2">
                 <div className="flex flex-col gap-1 w-full text-right font-semibold">
                    {previewInvoice?.freightCharge > 0 && <div className="flex justify-between"><span>Shipping / Freight</span> <span>₹{parseFloat(previewInvoice.freightCharge).toFixed(2)}</span></div>}
                    <div className="flex justify-between"><span>Sub Total:</span> <span>₹{totalTaxable || '0.00'}</span></div>
                    {previewInvoice?.igst > 0 && <div className="flex justify-between"><span>IGST</span> <span>₹{parseFloat(previewInvoice.igst).toFixed(2)}</span></div>}
                    {previewInvoice?.cgst > 0 && <div className="flex justify-between"><span>CGST</span> <span>₹{parseFloat(previewInvoice.cgst).toFixed(2)}</span></div>}
                    {previewInvoice?.sgst > 0 && <div className="flex justify-between"><span>SGST</span> <span>₹{parseFloat(previewInvoice.sgst).toFixed(2)}</span></div>}
                    {previewInvoice?.tcs > 0 && <div className="flex justify-between"><span>TCS</span> <span>₹{parseFloat(previewInvoice.tcs).toFixed(2)}</span></div>}
                    {previewInvoice?.cess > 0 && <div className="flex justify-between"><span>Cess</span> <span>₹{parseFloat(previewInvoice.cess).toFixed(2)}</span></div>}
                    {previewInvoice?.roundOff && <div className="flex justify-between"><span>Round off:</span> <span>₹{parseFloat(previewInvoice.roundOff).toFixed(2)}</span></div>}
                    {previewInvoice?.packingCharge > 0 && <div className="flex justify-between"><span>Packing Charge</span> <span>₹{parseFloat(previewInvoice.packingCharge).toFixed(2)}</span></div>}
                 </div>
               </td>
             </tr>

             <tr className="text-white font-bold" style={{ backgroundColor: primaryColor }}>
               <td colSpan={9} className="p-2 text-left border-r border-white/20">Total</td>
               <td className="p-2 border-r border-white/20">₹{totalTaxable || '0.00'}</td>
               <td className="p-2">₹{totalFinal || '0.00'}</td>
             </tr>
           </tbody>
         </table>
       </div>

       {/* 4. Footer */}
       <div className="w-full flex p-4">
         <div className="flex-[2.5] flex flex-col gap-4 pr-4">
            <div>
               <div className="flex gap-2"><span>In Words :</span> <span>{previewInvoice?.totalInWords || ''}</span></div>
               {previewInvoice?.paymentDetails && <div className="mt-1 font-bold">Payment Details: <span className="font-normal">{previewInvoice.paymentDetails}</span></div>}
            </div>

            <div className="flex gap-6 items-start mt-2">
               {footerSettings?.showQrCode && qrCodeUrl && (
                 <div className="flex flex-col items-center">
                    <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
                    <div className="text-[10px] mt-1">{previewInvoice?.upiId || ''}</div>
                 </div>
               )}
               {footerSettings?.showBankDetails && (
                 <div className="flex flex-col gap-1">
                    <div className="font-bold mb-1">Bank Details</div>
                    <div className="grid grid-cols-[100px_1fr]"><span>Bank</span> <span className="font-bold">: {previewInvoice?.bankDetails?.bankName || ''}</span></div>
                    <div className="grid grid-cols-[100px_1fr]"><span>Account no.</span> <span className="font-bold">: {previewInvoice?.bankDetails?.accountNumber || ''}</span></div>
                    <div className="grid grid-cols-[100px_1fr]"><span>IFSC Code</span> <span className="font-bold">: {previewInvoice?.bankDetails?.ifscCode || ''}</span></div>
                    <div className="grid grid-cols-[100px_1fr]"><span>A/C Name</span> <span className="font-bold">: {previewInvoice?.bankDetails?.accountName || ''}</span></div>
                    <div className="grid grid-cols-[100px_1fr]"><span>Branch</span> <span className="font-bold">: {previewInvoice?.bankDetails?.branchName || ''}</span></div>
                 </div>
               )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
               <div>
                 <div className="font-bold mb-1">Notes:</div>
                 <div className="text-gray-700 leading-tight pr-10">{previewInvoice?.notes || ''}</div>
               </div>
               <div className="mt-2">
                 <div className="font-bold mb-1">Terms and Conditions:</div>
                 <div className="text-gray-700 leading-tight pr-10">{previewInvoice?.terms || ''}</div>
               </div>
            </div>
         </div>
         
         <div className="flex-1 flex flex-col items-center justify-between text-center mt-4">
            <div className="font-bold w-full max-w-[200px]">For, {previewInvoice?.companyName || ''}</div>
            <div className="mt-8 flex flex-col items-center w-full">
              {footerSettings?.showSignature && previewInvoice?.signatureUrl ? (
                <img src={previewInvoice.signatureUrl} alt="Signature" className="h-16 object-contain" />
              ) : (
                <div className="h-16 text-gray-300 italic flex items-center justify-center">Signature Here</div>
              )}
              <div className="text-[10px] mt-4 w-full border-t border-gray-400 pt-2">Authorized Signatory</div>
            </div>
         </div>
       </div>

    </div>
  );
};
`;

  const finalContent = pre + newT4 + '\n\n' + post;
  fs.writeFileSync('os_frontend/src/pages/PrintTemplates.jsx', finalContent);
  console.log('Template4 updated successfully!');
} else {
  console.log('Could not find boundaries.');
}
