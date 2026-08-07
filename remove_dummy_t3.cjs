const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintTemplates.jsx', 'utf8');

const t3Start = content.indexOf('export const Template3 =');
const t4Start = content.indexOf('export const Template4 =');

if (t3Start !== -1 && t4Start !== -1) {
  const pre = content.substring(0, t3Start);
  const post = content.substring(t4Start);

  const newT3 = `export const Template3 = ({ 
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
    <div className="w-full bg-white text-black p-4 text-[10px] relative font-sans">
      {/* 1. Header Banner */}
      <div className="w-full flex justify-between items-start mb-4 relative z-10">
        <div className="flex-[1.5]">
          {headerSettings?.showLogo && previewInvoice?.companyLogo && (
            <div className="w-[100px] h-[100px] border border-gray-200 bg-gray-50 flex items-center justify-center p-2 mb-2">
              <img src={previewInvoice.companyLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
            </div>
          )}
          <div className="text-[18px] font-bold text-gray-700 leading-tight uppercase mt-2">
            {previewInvoice?.companyName || ''}
          </div>
          {previewInvoice?.companyGst && (
            <div className="text-[10px] font-bold mt-1">
              GSTIN {previewInvoice.companyGst}
            </div>
          )}
        </div>
        
        <div className="flex-[2] flex flex-col items-end">
           {/* Purple Banner */}
           <div 
             className="w-[110%] text-white p-4 flex gap-4 text-left relative right-[-16px] shadow-sm mb-6" 
             style={{ backgroundColor: primaryColor, borderBottomLeftRadius: '60px', borderTopLeftRadius: '60px' }}
           >
             <div className="flex-1 text-[11px] leading-tight font-semibold border-r border-white/30 pr-4">
                <div>{previewInvoice?.companyEmail || ''}</div>
                <div>{previewInvoice?.companyPhone ? \`Phone No: \${previewInvoice.companyPhone}\` : ''}</div>
             </div>
             <div className="flex-[1.5] text-[10px] leading-tight font-semibold">
                {previewInvoice?.companyAddress || ''}
             </div>
           </div>
           
           <div className="text-[22px] font-normal uppercase tracking-wider text-black mr-4">
             {transactionType || 'TAX INVOICE'}
           </div>
        </div>
      </div>

      {/* 2. Bill To & Invoice Info */}
      <div className="w-full flex gap-4 mb-4">
        {/* Bill To */}
        <div className="flex-1 flex flex-col gap-1 border-r border-gray-200 pr-4">
          <div className="text-[#4d1685] font-bold text-[11px]" style={{ color: primaryColor }}>Bill To:</div>
          <div className="font-bold uppercase text-[11px]">{previewInvoice?.customerName || ''}</div>
          {previewInvoice?.customerGst && <div><span className="font-bold">GSTIN:</span> {previewInvoice.customerGst}</div>}
          <div className="uppercase w-3/4">
             {previewInvoice?.customerAddress || ''}
          </div>
          {previewInvoice?.customerPhone && <div><span className="font-bold">Contact No:</span> {previewInvoice.customerPhone}</div>}
          {previewInvoice?.customerEmail && <div><span className="font-bold">Email:</span> {previewInvoice.customerEmail}</div>}
          {previewInvoice?.customerPan && <div><span className="font-bold">PAN:</span> {previewInvoice.customerPan}</div>}
        </div>
        
        {/* Invoice Info */}
        <div className="flex-[0.8] flex flex-col gap-1 justify-end pb-4 font-bold">
           <div className="grid grid-cols-[100px_1fr] gap-2">
             <div>Invoice No.</div>
             <div>: {previewInvoice?.invoiceNumber || ''}</div>
           </div>
           <div className="grid grid-cols-[100px_1fr] gap-2">
             <div>Invoice Date</div>
             <div>: {previewInvoice?.invoiceDate || ''}</div>
           </div>
           <div className="grid grid-cols-[100px_1fr] gap-2">
             <div>Place of Supply</div>
             <div className="uppercase">: {previewInvoice?.placeOfSupply || ''}</div>
           </div>
        </div>
      </div>

      {/* 3. Ship To & E-Way Info */}
      <div className="w-full flex gap-4 mb-4 pt-4 border-t border-gray-300">
        {/* Ship To */}
        <div className="flex-1 flex flex-col gap-1 border-r border-gray-200 pr-4">
          <div className="text-[#4d1685] font-bold text-[11px]" style={{ color: primaryColor }}>Ship To:</div>
          <div className="font-bold uppercase text-[11px]">{previewInvoice?.shippingName || previewInvoice?.customerName || ''}</div>
          {previewInvoice?.shippingGst && <div><span className="font-bold">GSTIN:</span> {previewInvoice.shippingGst}</div>}
          <div className="uppercase w-3/4">
             {previewInvoice?.shippingAddress || previewInvoice?.customerAddress || ''}
          </div>
          {previewInvoice?.shippingPhone && <div><span className="font-bold">Contact No:</span> {previewInvoice.shippingPhone}</div>}
          {previewInvoice?.customerPan && <div><span className="font-bold">PAN:</span> {previewInvoice.customerPan}</div>}
        </div>
        
        {/* Eway Info */}
        <div className="flex-[0.8] flex flex-col gap-1 font-bold">
           <div className="grid grid-cols-[100px_1fr] gap-2">
             <div>E-way Bill No.</div>
             <div>: {previewInvoice?.ewayBillNo || ''}</div>
           </div>
           <div className="grid grid-cols-[100px_1fr] gap-2">
             <div>E-way Bill Date</div>
             <div>: {previewInvoice?.ewayBillDate || ''}</div>
           </div>
           <div className="grid grid-cols-[100px_1fr] gap-2">
             <div>Ack No</div>
             <div>: {previewInvoice?.ackNo || ''}</div>
           </div>
           <div className="grid grid-cols-[100px_1fr] gap-2">
             <div>Ack Date</div>
             <div>: {previewInvoice?.ackDate || ''}</div>
           </div>
           <div className="grid grid-cols-[100px_1fr] gap-2">
             <div>IRN</div>
             <div>: {previewInvoice?.irnNo || ''}</div>
           </div>
        </div>
      </div>

      {/* 4. Table */}
      <div className="w-full border border-gray-300 rounded mb-4 overflow-hidden">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="text-white" style={{ backgroundColor: primaryColor }}>
              <th className="p-2 border-r border-white/20">SN</th>
              <th className="p-2 border-r border-white/20 text-left">Item & Description</th>
              <th className="p-2 border-r border-white/20">HSN/SAC</th>
              <th className="p-2 border-r border-white/20">Qty</th>
              <th className="p-2 border-r border-white/20">MRP</th>
              <th className="p-2 border-r border-white/20">Rate</th>
              <th className="p-2 border-r border-white/20">Dis.</th>
              <th className="p-2 border-r border-white/20">Dis. 2</th>
              <th className="p-2 border-r border-white/20">Total Dis.</th>
              <th className="p-2 border-r border-white/20">Taxable Value</th>
              <th className="p-2">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {parsedItems && parsedItems.length > 0 ? (
              parsedItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-300 last:border-b-0 align-top">
                  <td className="p-2 border-r border-gray-300">{idx + 1}</td>
                  <td className="p-2 border-r border-gray-300 text-left">
                    <div className="font-semibold">{item.name}</div>
                    {item.description && <div className="text-gray-500 text-[9px] italic mt-1">{item.description}</div>}
                  </td>
                  <td className="p-2 border-r border-gray-300">{item.hsn}</td>
                  <td className="p-2 border-r border-gray-300">{item.quantity}</td>
                  <td className="p-2 border-r border-gray-300">₹{parseFloat(item.price || 0).toFixed(2)}</td>
                  <td className="p-2 border-r border-gray-300">₹{parseFloat(item.price || 0).toFixed(2)}</td>
                  <td className="p-2 border-r border-gray-300">{item.discount || 0}</td>
                  <td className="p-2 border-r border-gray-300">0</td>
                  <td className="p-2 border-r border-gray-300">0.00</td>
                  <td className="p-2 border-r border-gray-300">₹{parseFloat(item.total || 0).toFixed(2)}</td>
                  <td className="p-2">₹{parseFloat(item.total || 0).toFixed(2)}</td>
                </tr>
              ))
            ) : (
                <tr className="border-b border-gray-300">
                  <td colSpan={11} className="p-4 text-center text-gray-400 italic">
                    No items added yet
                  </td>
                </tr>
            )}
            
            {/* Total Row */}
            <tr className="text-white font-bold" style={{ backgroundColor: primaryColor }}>
              <td colSpan={3} className="p-2 text-right border-r border-white/20">Total</td>
              <td className="p-2 border-r border-white/20">{totalQty || '0.00'}</td>
              <td colSpan={5} className="border-r border-white/20"></td>
              <td className="p-2 border-r border-white/20">₹{totalTaxable || '0.00'}</td>
              <td className="p-2">₹{totalFinal || '0.00'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Footer Layout */}
      <div className="w-full flex">
        {/* Left Footer Area */}
        <div className="flex-[2] pr-4 flex flex-col gap-4">
          <div>
            <div className="font-bold flex gap-2">
              <span>Total In Words:</span>
              <span style={{ color: primaryColor }}>{previewInvoice?.totalInWords || ''}</span>
            </div>
            {previewInvoice?.paymentDetails && (
              <div className="text-[9px] text-gray-500 mt-1">Payment Details: {previewInvoice.paymentDetails}</div>
            )}
          </div>
          
          <div className="flex gap-4 items-center">
            {footerSettings?.showQrCode && qrCodeUrl && (
              <div className="flex flex-col items-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" />
                <div className="text-[10px] mt-1 font-semibold text-center">{previewInvoice?.upiId || ''}</div>
              </div>
            )}
            
            {footerSettings?.showBankDetails && (
              <div className="flex flex-col gap-1 text-[10px] ml-4 font-bold">
                 <div className="uppercase underline mb-1">Bank Details</div>
                 <div className="grid grid-cols-[100px_1fr]">
                   <div>Bank</div><div>: {previewInvoice?.bankDetails?.bankName || ''}</div>
                 </div>
                 <div className="grid grid-cols-[100px_1fr]">
                   <div>Account No.</div><div>: {previewInvoice?.bankDetails?.accountNumber || ''}</div>
                 </div>
                 <div className="grid grid-cols-[100px_1fr]">
                   <div>IFSC Code</div><div>: {previewInvoice?.bankDetails?.ifscCode || ''}</div>
                 </div>
                 <div className="grid grid-cols-[100px_1fr]">
                   <div>A/C Name</div><div>: {previewInvoice?.bankDetails?.accountName || ''}</div>
                 </div>
                 <div className="grid grid-cols-[100px_1fr]">
                   <div>Branch</div><div>: {previewInvoice?.bankDetails?.branchName || ''}</div>
                 </div>
              </div>
            )}
          </div>
          
          {/* Note & Terms */}
          <div className="flex flex-col gap-3 mt-4">
            <div>
              <div className="font-bold mb-1">Note:</div>
              <div className="text-gray-700 leading-tight">
                {previewInvoice?.notes || ''}
              </div>
            </div>
            <div>
              <div className="font-bold mb-1">Terms and Conditions:</div>
              <div className="text-gray-700 leading-tight">
                {previewInvoice?.terms || ''}
              </div>
            </div>
          </div>
        </div>

        {/* Right Footer Area (Taxes & Signature) */}
        <div className="flex-1 flex flex-col justify-between">
           <table className="w-full border-collapse border border-gray-300 text-right">
             <tbody>
               {previewInvoice?.freightCharge > 0 && (
                 <tr className="border-b border-gray-300">
                   <td className="p-2 border-r border-gray-300 font-semibold text-left">Freight Charge</td>
                   <td className="p-2">₹{parseFloat(previewInvoice.freightCharge).toFixed(2)}</td>
                 </tr>
               )}
               {previewInvoice?.packingCharge > 0 && (
                 <tr className="border-b border-gray-300">
                   <td className="p-2 border-r border-gray-300 font-semibold text-left">Packing Charge</td>
                   <td className="p-2">₹{parseFloat(previewInvoice.packingCharge).toFixed(2)}</td>
                 </tr>
               )}
               <tr className="border-b border-gray-300 text-white font-bold" style={{ backgroundColor: primaryColor }}>
                 <td className="p-2 border-r border-white/20 text-left">Taxable Amount</td>
                 <td className="p-2">₹{totalTaxable || '0.00'}</td>
               </tr>
               {previewInvoice?.igst > 0 && (
                 <tr className="border-b border-gray-300">
                   <td className="p-2 border-r border-gray-300 font-semibold text-left">IGST</td>
                   <td className="p-2">₹{parseFloat(previewInvoice.igst).toFixed(2)}</td>
                 </tr>
               )}
               {previewInvoice?.cgst > 0 && (
                 <tr className="border-b border-gray-300">
                   <td className="p-2 border-r border-gray-300 font-semibold text-left">CGST</td>
                   <td className="p-2">₹{parseFloat(previewInvoice.cgst).toFixed(2)}</td>
                 </tr>
               )}
               {previewInvoice?.sgst > 0 && (
                 <tr className="border-b border-gray-300">
                   <td className="p-2 border-r border-gray-300 font-semibold text-left">SGST</td>
                   <td className="p-2">₹{parseFloat(previewInvoice.sgst).toFixed(2)}</td>
                 </tr>
               )}
               {previewInvoice?.cess > 0 && (
                 <tr className="border-b border-gray-300">
                   <td className="p-2 border-r border-gray-300 font-semibold text-left">Cess</td>
                   <td className="p-2">₹{parseFloat(previewInvoice.cess).toFixed(2)}</td>
                 </tr>
               )}
               {previewInvoice?.tcs > 0 && (
                 <tr className="border-b border-gray-300">
                   <td className="p-2 border-r border-gray-300 font-semibold text-left">TCS</td>
                   <td className="p-2">₹{parseFloat(previewInvoice.tcs).toFixed(2)}</td>
                 </tr>
               )}
               {previewInvoice?.roundOff && (
                 <tr className="border-b border-gray-300">
                   <td className="p-2 border-r border-gray-300 font-semibold text-left">Round off</td>
                   <td className="p-2">₹{parseFloat(previewInvoice.roundOff).toFixed(2)}</td>
                 </tr>
               )}
               <tr className="border-b border-gray-300 text-white font-bold" style={{ backgroundColor: primaryColor }}>
                 <td className="p-2 border-r border-white/20 text-left">Total</td>
                 <td className="p-2">₹{totalFinal || '0.00'}</td>
               </tr>
             </tbody>
           </table>
           
           {/* Signature */}
           <div className="mt-8 flex flex-col items-center border border-gray-200 bg-gray-50/50 p-4 h-[120px] justify-between">
              {footerSettings?.showSignature && previewInvoice?.signatureUrl ? (
                <img src={previewInvoice.signatureUrl} alt="Signature" className="h-12 object-contain" />
              ) : (
                <div className="h-12 text-gray-300 italic flex items-center justify-center border-b border-gray-300 w-3/4">Signature Here</div>
              )}
              <div className="font-bold text-[10px] mt-2">Authorized Signatory</div>
           </div>
        </div>
      </div>

    </div>
  );
};
`;

  const finalContent = pre + newT3 + '\n\n' + post;
  fs.writeFileSync('os_frontend/src/pages/PrintTemplates.jsx', finalContent);
  console.log('Template3 dummy data removed successfully!');
} else {
  console.log('Could not find boundaries.');
}
