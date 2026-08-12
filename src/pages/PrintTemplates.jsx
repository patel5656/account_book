import React from 'react';

export const Template1 = ({ 
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
  const primaryColor = customization?.primaryColor || '#000000'; // Make it black/dark like image
  
  return (
    <div className="w-full flex flex-col font-sans text-[8px] bg-white border border-gray-400 p-0 box-border min-h-full max-w-[210mm]">
      
      {/* 1. Header Section */}
      <div className="w-full flex flex-col border-b border-gray-400 relative">
        <div className="text-center font-bold py-1 border-b border-gray-400 uppercase tracking-widest">{transactionType2 || 'INCOME TRANSACTION'} ( Original )</div>
        <div className="flex w-full p-2 relative h-[80px]">
          {/* Company Info */}
          <div className="flex-1 text-center flex flex-col items-center justify-center pt-2">
            <h2 className="text-[18px] font-bold tracking-wide">{previewInvoice?.companyName || ''}</h2>
            <div className="text-[9px] text-gray-500">The Digital Accounting Book</div>
            <p className="text-[8px] mt-0.5 uppercase">{previewInvoice?.companyAddress || ''}</p>
            <p className="text-[8px] mt-0.5">Tel : {previewInvoice?.companyPhone || ''} | {previewInvoice?.companyEmail || ''}</p>
            {previewInvoice?.companyGst && <p className="text-[8px] font-bold mt-0.5 uppercase">GSTIN: {previewInvoice.companyGst}</p>}
            <p className="text-[8px] mt-0.5 uppercase font-bold">pass BILLS: 1</p>
          </div>
          {/* Header QR */}
          <div className="absolute right-2 top-2">
            {headerSettings?.showQrCode && qrCodeUrl && (
              <img src={qrCodeUrl} alt="QR Code" className="w-[65px] h-[65px]" />
            )}
          </div>
        </div>
      </div>

      {/* 2. Customer & Shipping Info Grid */}
      <div className="flex border-b border-gray-400 min-h-[90px]">
        <div className="flex-1 p-1.5 border-r border-gray-400 flex flex-col gap-[1px]">
          <div className="text-blue-600 font-medium">Bill to:</div>
          <div className="font-bold uppercase mt-1">{previewInvoice?.customerName || ''}</div>
          <div className="uppercase leading-tight">{previewInvoice?.customerAddress || ''}</div>
          {previewInvoice?.customerPhone && <div>CONTACT NO: {previewInvoice.customerPhone}</div>}
          {previewInvoice?.customerEmail && <div>Email: {previewInvoice.customerEmail}</div>}
          {previewInvoice?.customerGst && <div>GSTIN: {previewInvoice.customerGst}</div>}
          {previewInvoice?.customerPan && <div>PAN: {previewInvoice.customerPan}</div>}
        </div>
        <div className="flex-1 p-1.5 border-r border-gray-400 flex flex-col gap-[1px]">
          <div className="text-blue-600 font-medium">Ship to:</div>
          <div className="font-bold uppercase mt-1">{previewInvoice?.shippingName || previewInvoice?.customerName || ''}</div>
          <div className="uppercase leading-tight">{previewInvoice?.shippingAddress || previewInvoice?.customerAddress || ''}</div>
          {previewInvoice?.shippingPhone && <div>CONTACT NO: {previewInvoice.shippingPhone}</div>}
          {previewInvoice?.shippingGst && <div>GSTIN: {previewInvoice.shippingGst}</div>}
          {previewInvoice?.customerPan && <div>PAN: {previewInvoice.customerPan}</div>}
        </div>
        <div className="flex-[0.8] p-1.5 flex flex-col gap-[1px]">
          <div className="text-blue-600 font-medium">Invoice Details:</div>
          <div className="flex justify-between mt-1"><span className="uppercase">INVOICE NO:</span> <span className="font-bold">{previewInvoice?.invoiceNumber || ''}</span></div>
          <div className="flex justify-between uppercase"><span>INVOICE DATE:</span> <span className="font-bold">{previewInvoice?.invoiceDate || ''}</span></div>
        </div>
      </div>
      
      {/* Extra Details Rows */}
      <div className="flex border-b border-gray-400 min-h-[40px]">
         <div className="flex-1 p-1.5 border-r border-gray-400 grid grid-cols-[80px_1fr] gap-[1px] content-start">
            <span>Transport Name:</span> <span>{previewInvoice?.transportName || ''}</span>
            <span>Document No:</span> <span>{previewInvoice?.documentNo || ''}</span>
            <span>Document Date:</span> <span>{previewInvoice?.documentDate || ''}</span>
         </div>
         <div className="flex-[0.8] p-1.5 grid grid-cols-[60px_1fr] gap-[1px] content-start">
            <span>Ack No:</span> <span>{previewInvoice?.ackNo || ''}</span>
            <span>Ack Date:</span> <span>{previewInvoice?.ackDate || ''}</span>
            <span>IRN:</span> <span>{previewInvoice?.irn || ''}</span>
         </div>
      </div>

      <div className="flex border-b border-gray-400 min-h-[40px]">
         <div className="flex-1 p-1.5 border-r border-gray-400 grid grid-cols-[60px_1fr] gap-[1px] content-start">
            <span>PO No:</span> <span>{previewInvoice?.poNo || ''}</span>
            <span>PO Date:</span> <span>{previewInvoice?.poDate || ''}</span>
         </div>
         <div className="flex-1 p-1.5 border-r border-gray-400 grid grid-cols-[70px_1fr] gap-[1px] content-start">
            <span>E-way Bill No:</span> <span>{previewInvoice?.ewayBillNo || ''}</span>
            <span>E-way Bill Date:</span> <span>{previewInvoice?.ewayBillDate || ''}</span>
            <span>Vehicle No:</span> <span>{previewInvoice?.vehicleNo || ''}</span>
         </div>
         <div className="flex-[0.8] p-1.5 grid grid-cols-[60px_1fr] gap-[1px] content-start">
            <span>Custom field 1:</span> <span>{previewInvoice?.customField1 || ''}</span>
            <span>Custom field 2:</span> <span>{previewInvoice?.customField2 || ''}</span>
            <span>Custom field 3:</span> <span>{previewInvoice?.customField3 || ''}</span>
         </div>
      </div>

      {/* 3. Items Table */}
      <div className="w-full border-b border-gray-400">
        <table className="w-full text-center border-collapse text-[7px] leading-[1]">
          <thead>
            <tr className="border-b border-gray-400">
              <th className="p-0.5 border-r border-gray-400">SN</th>
              <th className="p-0.5 border-r border-gray-400 text-left">Item Name</th>
              <th className="p-0.5 border-r border-gray-400">Product Code</th>
              <th className="p-0.5 border-r border-gray-400">Batch No</th>
              <th className="p-0.5 border-r border-gray-400">HSN/ SAC</th>
              <th className="p-0.5 border-r border-gray-400">Purchase Price</th>
              <th className="p-0.5 border-r border-gray-400">MRP</th>
              <th className="p-0.5 border-r border-gray-400">Pcs</th>
              <th className="p-0.5 border-r border-gray-400">Sec. Qty</th>
              <th className="p-0.5 border-r border-gray-400">Pri. Qty</th>
              <th className="p-0.5 border-r border-gray-400">Unit</th>
              <th className="p-0.5 border-r border-gray-400">Size</th>
              <th className="p-0.5 border-r border-gray-400">Pcs Rate</th>
              <th className="p-0.5 border-r border-gray-400">Dis. 1</th>
              <th className="p-0.5 border-r border-gray-400">Dis. 2</th>
              <th className="p-0.5 border-r border-gray-400">Total Dis.</th>
              <th className="p-0.5 border-r border-gray-400">GST (%)</th>
              <th className="p-0.5">Taxable Value</th>
            </tr>
          </thead>
          <tbody>
            {parsedItems && parsedItems.length > 0 ? (
              parsedItems.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-200 align-top">
                  <td className="p-0.5 border-r border-gray-400">{idx + 1}</td>
                  <td className="p-0.5 border-r border-gray-400 text-left truncate max-w-[80px]">{item.name}</td>
                  <td className="p-0.5 border-r border-gray-400 truncate max-w-[40px]">{item.productCode}</td>
                  <td className="p-0.5 border-r border-gray-400 truncate max-w-[40px]">{item.batchNo}</td>
                  <td className="p-0.5 border-r border-gray-400">{item.hsn}</td>
                  <td className="p-0.5 border-r border-gray-400">{parseFloat(item.purchasePrice || 0).toFixed(2)}</td>
                  <td className="p-0.5 border-r border-gray-400">{parseFloat(item.mrp || 0).toFixed(2)}</td>
                  <td className="p-0.5 border-r border-gray-400">{item.pcs}</td>
                  <td className="p-0.5 border-r border-gray-400">{item.secQty}</td>
                  <td className="p-0.5 border-r border-gray-400">{item.priQty}</td>
                  <td className="p-0.5 border-r border-gray-400">{item.unit}</td>
                  <td className="p-0.5 border-r border-gray-400">{item.size}</td>
                  <td className="p-0.5 border-r border-gray-400">{parseFloat(item.pcsRate || 0).toFixed(2)}</td>
                  <td className="p-0.5 border-r border-gray-400">{item.discount || 0}</td>
                  <td className="p-0.5 border-r border-gray-400">{item.discount2 || 0}</td>
                  <td className="p-0.5 border-r border-gray-400">{parseFloat(item.totalDiscount || 0).toFixed(2)}</td>
                  <td className="p-0.5 border-r border-gray-400">{item.taxPercent}</td>
                  <td className="p-0.5">{parseFloat(item.taxableValue || 0).toFixed(2)}</td>
                </tr>
              ))
            ) : (
               <tr className="border-b border-gray-200">
                 <td colSpan={18} className="p-4 text-center text-gray-400 italic">No items added yet</td>
               </tr>
            )}
            {/* Total Row */}
            <tr className="font-bold border-t border-gray-400 bg-gray-50">
              <td colSpan={5} className="p-0.5 border-r border-gray-400 text-right pr-2">Total:</td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5 border-r border-gray-400"></td>
              <td className="p-0.5">₹{totalTaxable || '0.00'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex border-b border-gray-400 h-[100px]">
         <div className="flex-[2] p-1.5 flex flex-col justify-between border-r border-gray-400">
            <div>
               <div className="mb-0.5">Terms and Conditions:</div>
               <div className="text-gray-600 leading-tight whitespace-pre-wrap">{previewInvoice?.terms || ''}</div>
            </div>
            <div>
               <div className="font-bold mb-0.5">Notes:</div>
               <div className="text-gray-600 leading-tight">{previewInvoice?.notes || 'Thank You Note'}</div>
            </div>
         </div>
         <div className="flex-[0.8] p-1.5 grid grid-cols-[100px_1fr] gap-[1px] content-start border-b border-gray-400">
            <span>Credit Period:</span> <span></span>
            <span>Due Date:</span> <span></span>
            <span>Broker:</span> <span></span>
            <span>GSTIN:</span> <span></span>
         </div>
      </div>

      <div className="flex border-b border-gray-400 min-h-[90px] relative">
         <div className="flex-[2] p-1.5 flex flex-col justify-end border-r border-gray-400 relative">
             <div className="mb-4">
                <span className="font-bold">In Words:</span> <span>{previewInvoice?.totalInWords || ''}</span><br/>
                <span className="font-bold">Payment Details:</span> <span>{previewInvoice?.paymentDetails || 'Cash / Bank Transfer'}</span>
             </div>
             
             {/* Tax Summary Table embedded */}
             <div className="w-full absolute bottom-0 left-0 border-t border-gray-400">
                 <table className="w-full text-center border-collapse text-[7px] leading-[1]">
                     <thead>
                         <tr className="border-b border-gray-400 font-bold bg-gray-50">
                             <th className="p-0.5 border-r border-gray-400 w-8">SN</th>
                             <th className="p-0.5 border-r border-gray-400">HSN/SAC</th>
                             <th className="p-0.5 border-r border-gray-400">Taxable Amount</th>
                             <th className="p-0.5 border-r border-gray-400">GST (%)</th>
                             <th className="p-0.5 border-r border-gray-400">IGST</th>
                             <th className="p-0.5">Total Tax</th>
                         </tr>
                     </thead>
                     <tbody>
                         <tr className="border-b border-gray-400">
                             <td className="p-0.5 border-r border-gray-400">1</td>
                             <td className="p-0.5 border-r border-gray-400">-</td>
                             <td className="p-0.5 border-r border-gray-400">₹{totalTaxable || '0.00'}</td>
                             <td className="p-0.5 border-r border-gray-400">0</td>
                             <td className="p-0.5 border-r border-gray-400">₹{parseFloat(previewInvoice?.totalIgst || 0).toFixed(2)}</td>
                             <td className="p-0.5">₹{parseFloat(previewInvoice?.totalGstAmount || 0).toFixed(2)}</td>
                         </tr>
                         <tr className="font-bold bg-gray-50">
                             <td colSpan={2} className="p-0.5 border-r border-gray-400">Total</td>
                             <td className="p-0.5 border-r border-gray-400">₹{totalTaxable || '0.00'}</td>
                             <td className="p-0.5 border-r border-gray-400"></td>
                             <td className="p-0.5 border-r border-gray-400">₹{parseFloat(previewInvoice?.totalIgst || 0).toFixed(2)}</td>
                             <td className="p-0.5">₹{parseFloat(previewInvoice?.totalGstAmount || 0).toFixed(2)}</td>
                         </tr>
                     </tbody>
                 </table>
             </div>
         </div>
         
         <div className="flex-[0.8] p-1.5 flex flex-col justify-between absolute right-0 top-[-100px] w-[31%] h-[190px] border-l border-gray-400 bg-white z-10">
            <div className="flex flex-col gap-1 w-full text-right mt-[100px] pt-1">
               <div className="flex justify-between"><span>Taxable Value:</span> <span>₹{totalTaxable || '0.00'}</span></div>
               <div className="flex justify-between"><span>IGST:</span> <span>₹{parseFloat(previewInvoice?.totalIgst || 0).toFixed(2)}</span></div>
               <div className="flex justify-between"><span>TCS:</span> <span>₹0.00</span></div>
               <div className="flex justify-between"><span>Cess:</span> <span>₹0.00</span></div>
               <div className="flex justify-between"><span>Round off:</span> <span>₹{parseFloat(previewInvoice?.roundOff || 0).toFixed(2)}</span></div>
            </div>
            <div className="flex justify-between border-t border-gray-400 pt-1 font-bold">
               <span>Total:</span>
               <span>₹{totalFinal || '0.00'}</span>
            </div>
         </div>
      </div>

      {/* 4. Bank Details & Signatures */}
      <div className="w-full flex h-[120px]">
        <div className="flex-[1.5] p-2 flex flex-col border-r border-gray-400">
           <div className="grid grid-cols-[80px_1fr] gap-[1px]">
              <span className="font-bold">Bank:</span> <span>{previewInvoice?.bankDetails?.bankName || ''}</span>
              <span className="font-bold">IFSC Code:</span> <span>{previewInvoice?.bankDetails?.ifscCode || ''}</span>
              <span className="font-bold">A/C Number:</span> <span>{previewInvoice?.bankDetails?.accountNumber || ''}</span>
              <span className="font-bold">Bank Branch:</span> <span>{previewInvoice?.bankDetails?.branchName || ''}</span>
              <span className="font-bold">A/C Name:</span> <span>{previewInvoice?.bankDetails?.accountName || ''}</span>
              <span className="font-bold mt-1">UPI ID:</span> <span className="mt-1">{previewInvoice?.upiId || ''}</span>
           </div>
        </div>
        <div className="flex-[1.1] p-2 flex flex-col items-end justify-between relative">
           <div className="font-bold text-[9px] text-right uppercase">For, {previewInvoice?.companyName || 'SWAYAM BILLING SOFTWARE'}</div>
           
           {footerSettings?.showSignature && previewInvoice?.signatureUrl ? (
             <img src={previewInvoice.signatureUrl} alt="Signature" className="h-10 object-contain absolute bottom-6 right-2" />
           ) : (
             <div className="h-10 text-gray-300 italic absolute bottom-6 right-8 text-[8px]">Signature Here</div>
           )}
           
           <div className="text-[8px]">Authorized Signatory</div>
        </div>
      </div>

    </div>
  );
};
