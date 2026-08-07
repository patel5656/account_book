const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintTemplates.jsx', 'utf8');

const t1Start = content.indexOf('export const Template1 =');
const t2Start = content.indexOf('export const Template2 =');

if (t1Start !== -1 && t2Start !== -1) {
  const pre = content.substring(0, t1Start);
  const post = content.substring(t2Start);

  const newT1 = `export const Template1 = ({ 
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
    <div className="w-full flex flex-col font-sans text-[10px] bg-white border border-gray-400 p-0 box-border h-full max-w-[210mm]">
      
      {/* 1. Header Section */}
      <div className="w-full flex flex-col border-b border-gray-400 relative">
        <div className="text-center font-bold py-1 border-b border-gray-400 text-purple-800" style={{ color: primaryColor }}>{transactionType2?.toUpperCase() || 'TAX INVOICE'} ( Original )</div>
        <div className="flex w-full p-2 h-[100px]">
          {/* Logo */}
          <div className="w-[100px] flex items-center justify-center">
            {headerSettings?.showLogo && previewInvoice?.companyLogo && (
              <img src={previewInvoice.companyLogo} alt="Logo" className="max-w-[80px] max-h-[80px] object-contain" />
            )}
          </div>
          {/* Company Info */}
          <div className="flex-1 text-center flex flex-col items-center justify-center">
            <h2 className="text-[20px] font-bold tracking-wide uppercase text-purple-800" style={{ color: primaryColor }}>{previewInvoice?.companyName || ''}</h2>
            {previewInvoice?.companyAddress && <p className="text-[9px] uppercase mt-1">{previewInvoice.companyAddress}</p>}
            <p className="text-[9px] mt-1">Tel : {previewInvoice?.companyPhone || ''} | {previewInvoice?.companyEmail || ''}</p>
            {previewInvoice?.companyGst && <p className="text-[10px] font-bold mt-1 uppercase">GSTIN: {previewInvoice.companyGst}</p>}
          </div>
          {/* Header QR */}
          <div className="w-[80px] flex items-start justify-end pt-2 pr-2">
            {headerSettings?.showQrCode && qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code" className="w-[60px] h-[60px]" />
            )}
          </div>
        </div>
      </div>

      {/* 2. Customer & Shipping Info Grid */}
      <div className="flex border-b border-gray-400">
        <div className="flex-1 p-2 border-r border-gray-400 flex flex-col gap-1">
          <div className="font-bold text-[#4d1685]" style={{ color: primaryColor }}>Bill to:</div>
          <div className="font-bold uppercase">{previewInvoice?.customerName || ''}</div>
          <div className="uppercase">{previewInvoice?.customerAddress || ''}</div>
          {previewInvoice?.customerPhone && <div>Contact No: {previewInvoice.customerPhone}</div>}
          {previewInvoice?.customerEmail && <div>Email: {previewInvoice.customerEmail}</div>}
          {previewInvoice?.customerGst && <div>GSTIN: {previewInvoice.customerGst}</div>}
          {previewInvoice?.customerPan && <div>PAN: {previewInvoice.customerPan}</div>}
        </div>
        <div className="flex-1 p-2 border-r border-gray-400 flex flex-col gap-1">
          <div className="font-bold text-[#4d1685]" style={{ color: primaryColor }}>Ship to:</div>
          <div className="font-bold uppercase">{previewInvoice?.shippingName || previewInvoice?.customerName || ''}</div>
          <div className="uppercase">{previewInvoice?.shippingAddress || previewInvoice?.customerAddress || ''}</div>
          {previewInvoice?.shippingPhone && <div>Contact No: {previewInvoice.shippingPhone}</div>}
          {previewInvoice?.shippingGst && <div>GSTIN: {previewInvoice.shippingGst}</div>}
          {previewInvoice?.customerPan && <div>PAN: {previewInvoice.customerPan}</div>}
        </div>
        <div className="flex-[0.8] p-2 flex flex-col gap-1">
          <div className="font-bold text-[#4d1685]" style={{ color: primaryColor }}>Invoice Details:</div>
          <div className="flex justify-between"><span>Invoice no:</span> <span>{previewInvoice?.invoiceNumber || ''}</span></div>
          <div className="flex justify-between"><span>Invoice Date:</span> <span>{previewInvoice?.invoiceDate || ''}</span></div>
          <div className="flex justify-between"><span>Delivery Challan:</span> <span>{previewInvoice?.deliveryChallanNo || ''}</span></div>
          <div className="flex justify-between"><span>Delivery Date:</span> <span>{previewInvoice?.deliveryDate || ''}</span></div>
        </div>
      </div>
      
      {/* 2.5 Ack details */}
      <div className="w-full p-1 px-2 flex flex-col border-b border-gray-400 font-bold text-[9px]">
         <div className="grid grid-cols-[80px_1fr]"><span>Ack No:</span> <span>{previewInvoice?.ackNo || ''}</span></div>
         <div className="grid grid-cols-[80px_1fr]"><span>Ack Date:</span> <span>{previewInvoice?.ackDate || ''}</span></div>
         <div className="grid grid-cols-[80px_1fr]"><span>IRN:</span> <span className="font-normal">{previewInvoice?.irn || ''}</span></div>
      </div>

      {/* 3. Items Table */}
      <div className="w-full border-b border-gray-400">
        <table className="w-full text-center border-collapse text-[10px]">
          <thead>
            <tr className="border-b border-gray-400 font-bold">
              <th className="p-1 border-r border-gray-400">SN</th>
              <th className="p-1 border-r border-gray-400 text-left">Item Name</th>
              <th className="p-1 border-r border-gray-400">HSN/SAC</th>
              <th className="p-1 border-r border-gray-400">Qty</th>
              <th className="p-1 border-r border-gray-400">MRP</th>
              <th className="p-1 border-r border-gray-400">Rate</th>
              <th className="p-1 border-r border-gray-400">Dis.</th>
              <th className="p-1 border-r border-gray-400">Dis. 2</th>
              <th className="p-1 border-r border-gray-400">Total Dis.</th>
              <th className="p-1 border-r border-gray-400">Taxable Value</th>
              <th className="p-1">Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {parsedItems && parsedItems.length > 0 ? (
              parsedItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200 align-top">
                  <td className="p-1 border-r border-gray-400 pt-1">{idx + 1}</td>
                  <td className="p-1 border-r border-gray-400 text-left pt-1">
                    <div className="font-bold">{item.name}</div>
                    {item.description && <div className="text-gray-500 text-[9px] mt-0.5">{item.description}</div>}
                  </td>
                  <td className="p-1 border-r border-gray-400 pt-1">{item.hsn}</td>
                  <td className="p-1 border-r border-gray-400 pt-1">{item.quantity}</td>
                  <td className="p-1 border-r border-gray-400 pt-1">₹{parseFloat(item.price || 0).toFixed(2)}</td>
                  <td className="p-1 border-r border-gray-400 pt-1">₹{parseFloat(item.price || 0).toFixed(2)}</td>
                  <td className="p-1 border-r border-gray-400 pt-1">{item.discount || 0}</td>
                  <td className="p-1 border-r border-gray-400 pt-1">0</td>
                  <td className="p-1 border-r border-gray-400 pt-1">0.00</td>
                  <td className="p-1 border-r border-gray-400 pt-1">₹{parseFloat(item.total || 0).toFixed(2)}</td>
                  <td className="p-1 pt-1">₹{parseFloat(item.total || 0).toFixed(2)}</td>
                </tr>
              ))
            ) : (
               <tr className="border-b border-gray-200">
                 <td colSpan={11} className="p-4 text-center text-gray-400 italic">No items added yet</td>
               </tr>
            )}
            {/* Total Row */}
            <tr className="font-bold border-t border-gray-400">
              <td className="p-1 border-r border-gray-400"></td>
              <td className="p-1 border-r border-gray-400 text-left">Total</td>
              <td className="p-1 border-r border-gray-400"></td>
              <td className="p-1 border-r border-gray-400">{totalQty || '0.00'}</td>
              <td className="p-1 border-r border-gray-400"></td>
              <td className="p-1 border-r border-gray-400"></td>
              <td className="p-1 border-r border-gray-400"></td>
              <td className="p-1 border-r border-gray-400"></td>
              <td className="p-1 border-r border-gray-400"></td>
              <td className="p-1 border-r border-gray-400">₹{totalTaxable || '0.00'}</td>
              <td className="p-1">₹{totalFinal || '0.00'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 4. Bank Details & Totals */}
      <div className="w-full flex border-b border-gray-400 min-h-[90px]">
        <div className="flex-[3] flex p-2 border-r border-gray-400 gap-4">
           {footerSettings?.showQrCode && qrCodeUrl && (
             <div className="w-16 h-16 shrink-0 mt-1">
                <img src={qrCodeUrl} alt="QR Code" className="w-full h-full" />
             </div>
           )}
           {footerSettings?.showBankDetails && (
             <div className="flex flex-col gap-1 text-[9px] mt-1">
                <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">Bank:</span> <span>{previewInvoice?.bankDetails?.bankName || ''}</span></div>
                <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">IFSC Code:</span> <span className="text-[#4d1685]" style={{ color: primaryColor }}>{previewInvoice?.bankDetails?.ifscCode || ''}</span></div>
                <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">A/C Number:</span> <span>{previewInvoice?.bankDetails?.accountNumber || ''}</span></div>
                <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">Bank Branch:</span> <span>{previewInvoice?.bankDetails?.branchName || ''}</span></div>
                <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">A/C Name:</span> <span>{previewInvoice?.bankDetails?.accountName || ''}</span></div>
                <div className="grid grid-cols-[100px_1fr]"><span className="font-bold">UPI ID:</span> <span>{previewInvoice?.upiId || ''}</span></div>
             </div>
           )}
        </div>
        <div className="flex-1 flex flex-col justify-between">
           <div className="flex justify-between p-2">
              <span className="font-bold">Round off:</span>
              <span>₹{previewInvoice?.roundOff ? parseFloat(previewInvoice.roundOff).toFixed(2) : '0.00'}</span>
           </div>
           <div className="flex justify-between p-2 border-t border-gray-400 font-bold text-[#4d1685]" style={{ color: primaryColor }}>
              <span>Total:</span>
              <span>₹{totalFinal || '0.00'}</span>
           </div>
        </div>
      </div>

      <div className="w-full p-2 flex flex-col gap-1 border-b border-gray-400 text-[10px]">
         <div className="flex gap-2"><span className="font-bold">In Words:</span> <span className="text-gray-700">{previewInvoice?.totalInWords || ''}</span></div>
         {previewInvoice?.paymentDetails && <div className="flex gap-2"><span className="font-bold">Payment Details:</span> <span className="text-gray-700">{previewInvoice.paymentDetails}</span></div>}
      </div>

      {/* 5. Tax Breakup Table */}
      <div className="w-full border-b border-gray-400">
        <table className="w-full text-center border-collapse text-[10px]">
          <thead>
            <tr className="border-b border-gray-400 font-bold">
              <th className="p-1 border-r border-gray-400">SN</th>
              <th className="p-1 border-r border-gray-400">HSN/SAC</th>
              <th className="p-1 border-r border-gray-400">Taxable Amount</th>
              <th className="p-1 border-r border-gray-400">GST</th>
              <th className="p-1 border-r border-gray-400">IGST</th>
              <th className="p-1">Total Tax</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-400">
               <td className="p-1 border-r border-gray-400">1</td>
               <td className="p-1 border-r border-gray-400">-</td>
               <td className="p-1 border-r border-gray-400">₹{totalTaxable || '0.00'}</td>
               <td className="p-1 border-r border-gray-400">-</td>
               <td className="p-1 border-r border-gray-400">₹{previewInvoice?.totalIgst ? parseFloat(previewInvoice.totalIgst).toFixed(2) : '0.00'}</td>
               <td className="p-1">₹{previewInvoice?.totalGstAmount ? parseFloat(previewInvoice.totalGstAmount).toFixed(2) : '0.00'}</td>
            </tr>
            <tr className="font-bold border-t border-gray-400">
              <td colSpan={2} className="p-1 border-r border-gray-400 text-center">Total</td>
              <td className="p-1 border-r border-gray-400">₹{totalTaxable || '0.00'}</td>
              <td className="p-1 border-r border-gray-400"></td>
              <td className="p-1 border-r border-gray-400">₹{previewInvoice?.totalIgst ? parseFloat(previewInvoice.totalIgst).toFixed(2) : '0.00'}</td>
              <td className="p-1">₹{previewInvoice?.totalGstAmount ? parseFloat(previewInvoice.totalGstAmount).toFixed(2) : '0.00'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 6. Footer (Terms & Signature) */}
      <div className="w-full flex min-h-[120px]">
         <div className="flex-[2.5] p-2 flex flex-col gap-2 border-r border-gray-400 text-[9px] overflow-hidden">
            <div>
              <div className="font-bold mb-1">Terms and Conditions:</div>
              <div className="font-bold text-gray-800">Payment Terms:</div>
              <div className="text-gray-600 leading-tight pr-4 mt-0.5 whitespace-pre-wrap">{previewInvoice?.terms || ''}</div>
            </div>
            <div className="mt-1">
              <div className="font-bold mb-1">Notes:</div>
              <div className="text-gray-600 leading-tight pr-4 whitespace-pre-wrap">{previewInvoice?.notes || ''}</div>
            </div>
         </div>
         <div className="flex-1 p-2 flex flex-col items-center justify-between text-center relative">
            <div className="font-bold text-[9px]">For, {previewInvoice?.companyName || ''}</div>
            
            {footerSettings?.showSignature && previewInvoice?.signatureUrl ? (
              <img src={previewInvoice.signatureUrl} alt="Signature" className="h-12 object-contain absolute bottom-6" />
            ) : (
              <div className="h-12 flex items-center justify-center text-gray-300 italic absolute bottom-6">Signature Here</div>
            )}
            
            <div className="text-[9px] absolute bottom-2 w-full text-center">Authorized Signatory</div>
         </div>
      </div>

    </div>
  );
};
`;

  const finalContent = pre + newT1 + '\n\n' + post;
  fs.writeFileSync('os_frontend/src/pages/PrintTemplates.jsx', finalContent);
  console.log('Template1 rebuilt successfully!');
} else {
  console.log('Could not find boundaries.');
}
