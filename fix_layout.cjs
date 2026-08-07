const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8');

const startMarker = '{/* 3. Transport Details */}';
const endMarker = ') : (';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if(startIndex === -1 || endIndex === -1) {
  console.log("MARKER NOT FOUND", startIndex, endIndex);
  process.exit(1);
}

const replacement = `{/* 3. Ack Details */}
               <div className="w-full flex border-b border-black text-[10px]">
                 <div className="flex-1 p-1 border-r border-black flex flex-col gap-0">
                   <div className="flex justify-between font-bold"><span>Ack No:</span> <span className="uppercase">{previewInvoice?.ackNo || '162314701183939'}</span></div>
                 </div>
                 <div className="flex-1 p-1 border-r border-black flex flex-col gap-0">
                   <div className="flex justify-between font-bold"><span>Ack Date:</span> <span className="uppercase">{previewInvoice?.ackDate ? new Date(previewInvoice.ackDate).toLocaleDateString('en-GB') : '18-08-2023'}</span></div>
                 </div>
                 <div className="flex-1 p-1 flex flex-col gap-0">
                   <div className="flex justify-between font-bold"><span>IRN:</span> <span className="uppercase">{previewInvoice?.irn || '3183488b0385a8206fbe'}</span></div>
                 </div>
               </div>

               {/* 4. Main Items Table */}
               <div className="w-full border-b border-black">
                 <table className="w-full text-center border-collapse text-[10px] m-0">
                   <thead>
                     <tr className="bg-white border-b border-black font-bold">
                       <th className="border-r border-black p-1">SN</th>
                       <th className="border-r border-black p-1 text-left">Item Name</th>
                       <th className="border-r border-black p-1">HSN/SAC</th>
                       {transactionType === 'Glass Template' && <th className="border-r border-black p-1">Pcs</th>}
                       {transactionType === 'Glass Template' && <th className="border-r border-black p-1">Actual<br/>Qty</th>}
                       <th className="border-r border-black p-1">Qty</th>
                       {transactionType === 'Glass Template' && <th className="border-r border-black p-1">Size</th>}
                       {transactionType === 'Glass Template' && <th className="border-r border-black p-1">Pcs<br/>Rate</th>}
                       {transactionType === 'Glass Template' && <th className="border-r border-black p-1">Glass</th>}
                       {transactionType === 'Glass Template' && <th className="border-r border-black p-1">Design</th>}
                       {transactionType === 'Glass Template' && <th className="border-r border-black p-1">Labour</th>}
                       {transactionType === 'Glass Template' && <th className="border-r border-black p-1">Polish</th>}
                       <th className="border-r border-black p-1">MRP</th>
                       <th className="border-r border-black p-1">Rate</th>
                       <th className="border-r border-black p-1">Dis.</th>
                       <th className="border-r border-black p-1">Dis. 2</th>
                       <th className="border-r border-black p-1">Total Dis.</th>
                       <th className="border-r border-black p-1 text-right">Taxable Value</th>
                       <th className="p-1 text-right">Total Amount</th>
                     </tr>
                   </thead>
                   <tbody className="align-top">
                     {parsedItems.map((item, idx) => (
                       <tr key={idx}>
                         <td className="border-r border-black p-1 pt-2">{idx + 1}</td>
                         <td className="border-r border-black p-1 pt-2 text-left h-[30px]">
                           <div className="font-bold">{item.name}</div>
                           {item.desc && <div className="text-[9px] text-gray-600">{item.desc}</div>}
                         </td>
                         <td className="border-r border-black p-1 pt-2">{item.hsn || '-'}</td>
                         {transactionType === 'Glass Template' && <td className="border-r border-black p-1 pt-2">{item.qty}</td>}
                         {transactionType === 'Glass Template' && <td className="border-r border-black p-1 pt-2">-</td>}
                         <td className="border-r border-black p-1 pt-2">{item.qty}</td>
                         {transactionType === 'Glass Template' && <td className="border-r border-black p-1 pt-2">-</td>}
                         {transactionType === 'Glass Template' && <td className="border-r border-black p-1 pt-2">-</td>}
                         {transactionType === 'Glass Template' && <td className="border-r border-black p-1 pt-2">-</td>}
                         {transactionType === 'Glass Template' && <td className="border-r border-black p-1 pt-2">-</td>}
                         {transactionType === 'Glass Template' && <td className="border-r border-black p-1 pt-2">-</td>}
                         {transactionType === 'Glass Template' && <td className="border-r border-black p-1 pt-2">-</td>}
                         <td className="border-r border-black p-1 pt-2">₹{item.mrp || '-'}</td>
                         <td className="border-r border-black p-1 pt-2">₹{item.rate}</td>
                         <td className="border-r border-black p-1 pt-2">{item.discount > 0 ? item.discount : '0'}</td>
                         <td className="border-r border-black p-1 pt-2">{item.discount2 > 0 ? item.discount2 : '0'}</td>
                         <td className="border-r border-black p-1 pt-2">{item.discount > 0 ? item.discount : '0.00'}</td>
                         <td className="border-r border-black p-1 pt-2 text-right">₹{item.taxableValue}</td>
                         <td className="p-1 pt-2 text-right">₹{item.totalAmount}</td>
                       </tr>
                     ))}
                     <tr className="border-t border-black font-bold">
                       <td colSpan="3" className="border-r border-black p-1 text-left">Total</td>
                       {transactionType === 'Glass Template' && <td className="border-r border-black p-1"></td>}
                       {transactionType === 'Glass Template' && <td className="border-r border-black p-1"></td>}
                       <td className="border-r border-black p-1">{totalQty.toFixed(2)}</td>
                       {transactionType === 'Glass Template' && <td className="border-r border-black p-1"></td>}
                       {transactionType === 'Glass Template' && <td className="border-r border-black p-1"></td>}
                       {transactionType === 'Glass Template' && <td className="border-r border-black p-1"></td>}
                       {transactionType === 'Glass Template' && <td className="border-r border-black p-1"></td>}
                       {transactionType === 'Glass Template' && <td className="border-r border-black p-1"></td>}
                       {transactionType === 'Glass Template' && <td className="border-r border-black p-1"></td>}
                       <td className="border-r border-black p-1"></td>
                       <td className="border-r border-black p-1"></td>
                       <td className="border-r border-black p-1"></td>
                       <td className="border-r border-black p-1"></td>
                       <td className="border-r border-black p-1"></td>
                       <td className="border-r border-black p-1 text-right">₹{totalTaxable.toFixed(2)}</td>
                       <td className="p-1 text-right">₹{totalFinal.toFixed(2)}</td>
                     </tr>
                   </tbody>
                 </table>
               </div>

               {/* 5. Bank & Round Off */}
               <div className="w-full flex border-b border-black text-[10px]">
                 <div className="flex-[3] flex p-1 border-r border-black items-center">
                   <div className="w-20 h-20 mr-4 flex-shrink-0 flex items-center justify-center">
                     {headerSettings.showQrCode && (
                       <img src={qrCodeUrl} alt="QR Code" className="max-w-full max-h-full object-contain" />
                     )}
                   </div>
                   <div className="flex flex-col gap-1 w-full font-bold justify-center">
                     <div className="flex"><span className="w-24 text-right pr-2">Bank:</span> <span className="font-normal text-left">{previewInvoice?.bankName || allPrintSettings?.bankDetails?.bankName || 'Axis Bank'}</span></div>
                     <div className="flex"><span className="w-24 text-right pr-2">IFSC Code:</span> <span className="font-normal text-left">{previewInvoice?.bankIfsc || allPrintSettings?.bankDetails?.bankIfsc || 'UTIB0002996'}</span></div>
                     <div className="flex"><span className="w-24 text-right pr-2">A/C Number:</span> <span className="font-normal text-left">{previewInvoice?.bankAccountNo || allPrintSettings?.bankDetails?.bankAccountNo || '9674563210258'}</span></div>
                     <div className="flex"><span className="w-24 text-right pr-2">Bank Branch:</span> <span className="font-normal text-left">{previewInvoice?.bankBranch || allPrintSettings?.bankDetails?.bankBranch || 'ALTHAN'}</span></div>
                     <div className="flex"><span className="w-24 text-right pr-2">A/C Name:</span> <span className="font-normal text-left">{previewInvoice?.bankAccountName || allPrintSettings?.bankDetails?.bankAccountName || 'Nishit'}</span></div>
                     <div className="flex"><span className="w-24 text-right pr-2">UPI ID:</span> <span className="font-normal text-left">{previewInvoice?.upiId || allPrintSettings?.bankDetails?.upiId || '9000000000@axisbank'}</span></div>
                   </div>
                 </div>
                 <div className="flex-1 p-2 flex justify-between font-bold">
                   <span>Round off:</span>
                   <span>₹{previewInvoice?.roundOff ? Number(previewInvoice.roundOff).toFixed(2) : '0.10'}</span>
                 </div>
               </div>

               {/* 6. In Words & Total */}
               <div className="w-full flex border-b border-black text-[10px]">
                 <div className="flex-[3] flex flex-col p-2 border-r border-black justify-center">
                   <div className="font-bold mb-1">In Words: <span className="font-normal text-[#4F46E5]">{previewInvoice?.amountInWords || 'Nine Thousand Two Hundred and Seventy Rupees Only'}</span></div>
                   <div className="font-bold">Payment Details: <span className="font-normal">{previewInvoice?.paymentMode || '02-09-2025 - 310 - Default Bank'}</span></div>
                 </div>
                 <div className="flex-1 p-2 flex justify-between items-center font-bold text-[12px] text-[#4F46E5]">
                   <span>Total:</span>
                   <span>₹{previewInvoice?.totalAmount ? Number(previewInvoice.totalAmount).toFixed(2) : (totalFinal + 0.10).toFixed(2)}</span>
                 </div>
               </div>

               {/* 7. Tax Breakup Table */}
               <div className="w-full border-b border-black">
                 <table className="w-full text-center border-collapse text-[10px] m-0">
                   <thead>
                     <tr className="bg-white border-b border-black font-bold">
                       <th className="border-r border-black p-1 w-12">SN</th>
                       <th className="border-r border-black p-1">HSN/SAC</th>
                       <th className="border-r border-black p-1">Taxable Amount</th>
                       <th className="border-r border-black p-1">GST (%)</th>
                       <th className="border-r border-black p-1">IGST</th>
                       <th className="p-1">Total Tax</th>
                     </tr>
                   </thead>
                   <tbody>
                     <tr>
                       <td className="border-r border-black p-1">1</td>
                       <td className="border-r border-black p-1">-</td>
                       <td className="border-r border-black p-1">₹1,342.00</td>
                       <td className="border-r border-black p-1">5</td>
                       <td className="border-r border-black p-1">₹80.00</td>
                       <td className="p-1">₹80.00</td>
                     </tr>
                     <tr>
                       <td className="border-r border-black p-1">2</td>
                       <td className="border-r border-black p-1">5407</td>
                       <td className="border-r border-black p-1">₹7,130.00</td>
                       <td className="border-r border-black p-1">5</td>
                       <td className="border-r border-black p-1">₹428.00</td>
                       <td className="p-1">₹428.00</td>
                     </tr>
                     <tr>
                       <td className="border-r border-black p-1">3</td>
                       <td className="border-r border-black p-1">996812</td>
                       <td className="border-r border-black p-1">₹100.00</td>
                       <td className="border-r border-black p-1">18</td>
                       <td className="border-r border-black p-1">₹18.00</td>
                       <td className="p-1">₹18.00</td>
                     </tr>
                     <tr>
                       <td className="border-r border-black p-1">4</td>
                       <td className="border-r border-black p-1">994541</td>
                       <td className="border-r border-black p-1">₹100.00</td>
                       <td className="border-r border-black p-1">18</td>
                       <td className="border-r border-black p-1">₹18.00</td>
                       <td className="p-1">₹18.00</td>
                     </tr>
                     <tr className="border-t border-black font-bold">
                       <td colSpan="2" className="border-r border-black p-1 text-center">Total</td>
                       <td className="border-r border-black p-1">₹8,672.00</td>
                       <td className="border-r border-black p-1"></td>
                       <td className="border-r border-black p-1">₹544.00</td>
                       <td className="p-1">₹544.00</td>
                     </tr>
                   </tbody>
                 </table>
               </div>

               {/* 8. Terms & Conditions and Signature */}
               <div className="w-full flex">
                 <div className="flex-[3] flex flex-col border-r border-black p-2 text-[10px]">
                   <div className="font-bold mb-1 text-left">Terms and Conditions:</div>
                   <div className="text-gray-700 mb-2 text-left">{previewInvoice?.terms || 'Payment Terms:\\nClearly state the payment due date, which is the date by which the client must pay the invoice amount. Specify the accepted payment methods (e.g., credit card bank transfer, PayPal) and any associated fees for certain payment methods.\\nOutline any late payment penalties or interest charges that will apply if the client fails to make payment on time.'}</div>
                   <div className="font-bold mb-1 text-left">Notes:</div>
                   <div className="text-gray-700 text-left">{previewInvoice?.notes || footerSettings.labelThankYouNote || 'Narration simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.'}</div>
                 </div>
                 <div className="flex-1 p-2 flex flex-col justify-between items-center text-center pb-2 text-[10px]">
                   <div className="font-bold">For, SWAYAM BILLING<br/>SOFTWARE</div>
                   <div className="mt-16 mb-2">
                     <span className="italic font-serif text-[32px] opacity-20">S</span>
                   </div>
                   <div className="font-bold">Authorized Signatory</div>
                 </div>
               </div>

             </div>
          `;
content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('os_frontend/src/pages/PrintSetting.jsx', content);
