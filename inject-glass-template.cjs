const fs = require('fs');

const glassTemplateCode = `
          {transactionType === 'Glass Template' ? (
             <div 
               ref={previewRef}
               className="bg-[#ffffff] shadow-sm w-[794px] shrink-0 text-[#000000] border-2 border-black m-auto text-[11px]"
               style={{ minHeight: '1123px', fontFamily: 'Arial, sans-serif' }}
             >
               {/* 1. Header Section */}
               <div className="w-full flex flex-col border-b border-black">
                 <div className="text-center font-bold py-1 border-b border-black">TAX INVOICE ( Original )</div>
                 <div className="flex w-full p-2">
                   {/* Logo */}
                   <div className="w-[120px] flex items-center justify-center">
                     <div className="w-[80px] h-[80px] bg-gray-100 border border-gray-300 flex items-center justify-center text-[10px] text-gray-400">Logo</div>
                   </div>
                   {/* Company Info */}
                   <div className="flex-1 text-center flex flex-col items-center justify-center px-2">
                     <h2 className="text-[20px] font-bold">SWAYAM BILLING SOFTWARE</h2>
                     <p>NO, , OPP GRAM PANCHAYAT, SH 31, BELAGAVI, KARNATAKA, INDIA, 591220</p>
                     <p>Tel : 9845972853 | swayamsoftwaretarget@gmail.com</p>
                     <p>GSTIN: 29DCDPP7499L2ZH</p>
                     <p>pass BILL3: 1</p>
                   </div>
                   {/* QR Code */}
                   <div className="w-[120px] flex items-center justify-center">
                     <div className="w-[80px] h-[80px] bg-gray-100 border border-gray-300 flex items-center justify-center text-[10px] text-gray-400">QR</div>
                   </div>
                 </div>
               </div>

               {/* 2. Parties & Invoice Info */}
               <div className="w-full flex border-b border-black">
                 {/* Bill To */}
                 <div className="flex-1 border-r border-black p-2 flex flex-col">
                   <div className="text-purple-700 mb-1">Bill to:</div>
                   <div className="font-bold">NISHIT</div>
                   <div>A-406, 4TH FLOOR, MONARCH GAURAVPATH ROAD, PALIIIII, BAMBOO FLAT, ANDAMAN AND NICOBAR ISLANDS, INDIA</div>
                   <div>Contact No: 9XXXXXX321 | 9XXXXXX321</div>
                   <div>Email: exa****@gmail.com</div>
                   <div>GSTIN: 24AADCD6XXXXXXX</div>
                   <div>PAN: EDBARXXXXX</div>
                 </div>
                 {/* Ship To */}
                 <div className="flex-1 border-r border-black p-2 flex flex-col">
                   <div className="text-purple-700 mb-1">Ship to:</div>
                   <div className="font-bold">NISHIT</div>
                   <div>A-406, 4TH FLOOR, MONARCH GAURAVPATH ROAD, PAL, BAMBOO FLAT, ANDAMAN AND NICOBAR ISLANDS, INDIA</div>
                   <div>Contact No: 9XXXXXX321</div>
                   <div>GSTIN: 24AADCD6XXXXXXX</div>
                   <div>PAN: EDBARXXXXX</div>
                 </div>
                 {/* Invoice Details */}
                 <div className="flex-1 p-2 flex flex-col">
                   <div className="text-purple-700 mb-1">Invoice Details:</div>
                   <div className="flex justify-between"><span>Invoice No:</span> <span className="font-bold">MA22/2348</span></div>
                   <div className="flex justify-between"><span>Invoice Date:</span> <span className="font-bold">24-08-2023</span></div>
                 </div>
               </div>

               {/* 3. Transport Details */}
               <div className="w-full flex border-b border-black">
                 <div className="flex-1 border-r border-black p-2 flex flex-col gap-1">
                   <div className="flex"><span className="w-32">Transport Name:</span> <span>Maharaj</span></div>
                   <div className="flex"><span className="w-32">Document No:</span> <span>11</span></div>
                   <div className="flex"><span className="w-32">Document Date:</span> <span>24-08-2023</span></div>
                 </div>
                 <div className="flex-1 p-2 flex flex-col gap-1">
                   <div className="flex"><span className="w-32">Ack No:</span> <span>162314701183939</span></div>
                   <div className="flex"><span className="w-32">Ack Date:</span> <span>18-08-2023</span></div>
                   <div className="flex"><span className="w-32">IRN:</span> <span>3183488b0385a8206fbe</span></div>
                 </div>
               </div>

               {/* 4. PO / E-way Details */}
               <div className="w-full flex border-b border-black">
                 <div className="flex-[0.8] border-r border-black p-2 flex flex-col gap-1">
                   <div className="flex justify-between"><span>PO No:</span> <span>9985</span></div>
                   <div className="flex justify-between"><span>PO Date:</span> <span>24-08-2023</span></div>
                 </div>
                 <div className="flex-1 border-r border-black p-2 flex flex-col gap-1">
                   <div className="flex justify-between"><span>E-way Bill No:</span> <span>162314701183939</span></div>
                   <div className="flex justify-between"><span>E-way Bill Date:</span> <span>18-08-2023</span></div>
                   <div className="flex justify-between"><span>Vehicle No:</span> <span>GJ05ABXXXX</span></div>
                 </div>
                 <div className="flex-1 p-2 flex flex-col gap-1">
                   <div className="flex justify-between"><span>Custom field 1:</span> <span>xxxxxxxxx</span></div>
                   <div className="flex justify-between"><span>Custom field 2:</span> <span>xxxxxxxxx</span></div>
                   <div className="flex justify-between"><span>Custom field 3:</span> <span>xxxxxxxxx</span></div>
                 </div>
               </div>

               {/* 5. Main Items Table */}
               <table className="w-full text-center border-collapse border-b border-black text-[10px]">
                 <thead>
                   <tr className="bg-white">
                     <th className="border border-black p-1 font-bold">SN</th>
                     <th className="border border-black p-1 font-bold text-left">Item<br/>Name</th>
                     <th className="border border-black p-1 font-bold">HSN/SAC</th>
                     <th className="border border-black p-1 font-bold">Pcs</th>
                     <th className="border border-black p-1 font-bold">Actual<br/>Qty</th>
                     <th className="border border-black p-1 font-bold">Qty</th>
                     <th className="border border-black p-1 font-bold">Size</th>
                     <th className="border border-black p-1 font-bold">Pcs<br/>Rate</th>
                     <th className="border border-black p-1 font-bold">Glass</th>
                     <th className="border border-black p-1 font-bold">Design</th>
                     <th className="border border-black p-1 font-bold">Labour</th>
                     <th className="border border-black p-1 font-bold">Polish</th>
                     <th className="border border-black p-1 font-bold">Dis.<br/>1</th>
                     <th className="border border-black p-1 font-bold">Dis.<br/>2</th>
                     <th className="border border-black p-1 font-bold">Total<br/>Dis.</th>
                     <th className="border border-black p-1 font-bold">GST<br/>(%)</th>
                     <th className="border border-black p-1 font-bold text-right">Taxable<br/>Value</th>
                   </tr>
                 </thead>
                 <tbody className="align-top">
                   <tr className="h-40">
                     <td className="border-r border-black p-1">1</td>
                     <td className="border-r border-black p-1 text-left">
                       Glass 4MM<br/><br/>
                       Holes: 20 x 50<br/>
                       Cut outs: 10 x 40
                     </td>
                     <td className="border-r border-black p-1">-</td>
                     <td className="border-r border-black p-1">1</td>
                     <td className="border-r border-black p-1">12 * 12<br/>mm</td>
                     <td className="border-r border-black p-1">12 * 12<br/>mm</td>
                     <td className="border-r border-black p-1">1.25<br/>sq.ft</td>
                     <td className="border-r border-black p-1">4.5<br/>run.ft</td>
                     <td className="border-r border-black p-1">100<br/>sq.ft</td>
                     <td className="border-r border-black p-1">100<br/>sq.ft</td>
                     <td className="border-r border-black p-1">20<br/>sq.ft</td>
                     <td className="border-r border-black p-1">30<br/>run.ft</td>
                     <td className="border-r border-black p-1">30<br/>sq.ft</td>
                     <td className="border-r border-black p-1">-</td>
                     <td className="border-r border-black p-1">-</td>
                     <td className="border-r border-black p-1">0</td>
                     <td className="p-1 text-right">₹2,722.50</td>
                   </tr>
                   <tr className="border-t border-black font-bold">
                     <td colSpan="3" className="border-r border-black p-1 text-right">Total:</td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1"></td>
                     <td className="p-1 text-right">₹2,722.50</td>
                   </tr>
                 </tbody>
               </table>

               {/* 6. Footer Layout */}
               <div className="w-full flex border-b border-black">
                 {/* Left side info */}
                 <div className="flex-[2] border-r border-black flex flex-col">
                   <div className="p-2 border-b border-black text-[10px]">
                     <div className="font-bold mb-1">Terms and Conditions:</div>
                     <div className="font-bold mb-1">Payment Terms:</div>
                     <p className="mb-2">Clearly state the payment due date, which is the date by which the client must pay the invoice amount. Specify the accepted payment methods (e.g., credit card bank transfer, PayPal) and any associated fees for certain payment methods. Outline any late payment penalties or interest charges that will apply if the client fails to make payment on time.</p>
                     
                     <div className="font-bold mb-1">Notes:</div>
                     <p>Narration simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.</p>
                   </div>
                   <div className="p-2 flex flex-col justify-end flex-1">
                     <div className="flex gap-2"><span>In Words:</span> <span>Nine Thousand Two Hundred and Seventy Rupees Only</span></div>
                     <div className="flex gap-2"><span>Payment Details:</span> <span>02-09-2025 - 310 - Default Bank</span></div>
                   </div>
                 </div>

                 {/* Right side summary */}
                 <div className="flex-1 flex flex-col">
                   <div className="p-2 border-b border-black flex flex-col gap-1 flex-1">
                     <div className="flex justify-between"><span>Credit Period:</span> <span>30 Days</span></div>
                     <div className="flex justify-between"><span>Due Date:</span> <span>23-09-2023</span></div>
                     <div className="flex justify-between mt-2"><span>Broker:</span> <span>Ankit</span></div>
                     <div className="flex justify-between"><span>GSTIN:</span> <span>24AADCD6XXXXXXX</span></div>
                   </div>
                   
                   <div className="p-2 border-b border-black flex flex-col gap-1">
                     <div className="flex justify-between"><span>Taxable Value:</span> <span>₹8,672.90</span></div>
                     <div className="flex justify-between"><span>IGST:</span> <span>₹544.00</span></div>
                     <div className="flex justify-between"><span>TCS:</span> <span>₹8.00</span></div>
                     <div className="flex justify-between"><span>Cess:</span> <span>₹45.00</span></div>
                     <div className="flex justify-between"><span>Round off:</span> <span>₹0.10</span></div>
                   </div>

                   <div className="p-2 flex justify-between font-bold text-[12px] h-full items-end">
                     <span>Total:</span> <span>₹9,270.00</span>
                   </div>
                 </div>
               </div>

               {/* 7. Tax Breakup Table */}
               <table className="w-full text-center border-collapse border-b border-black">
                 <thead>
                   <tr className="bg-white">
                     <th className="border-r border-black p-1 font-bold w-12">SN</th>
                     <th className="border-r border-black p-1 font-bold">HSN/SAC</th>
                     <th className="border-r border-black p-1 font-bold">Taxable Amount</th>
                     <th className="border-r border-black p-1 font-bold">GST (%)</th>
                     <th className="border-r border-black p-1 font-bold">IGST</th>
                     <th className="p-1 font-bold">Total Tax</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr className="border-t border-black">
                     <td className="border-r border-black p-1">1</td>
                     <td className="border-r border-black p-1">-</td>
                     <td className="border-r border-black p-1">₹1,342.00</td>
                     <td className="border-r border-black p-1">5</td>
                     <td className="border-r border-black p-1">₹40.00</td>
                     <td className="p-1">₹80.00</td>
                   </tr>
                   <tr className="border-t border-black font-bold">
                     <td colSpan="2" className="border-r border-black p-1">Total</td>
                     <td className="border-r border-black p-1">₹8,672.00</td>
                     <td className="border-r border-black p-1"></td>
                     <td className="border-r border-black p-1">₹272.00</td>
                     <td className="p-1">₹544.00</td>
                   </tr>
                 </tbody>
               </table>

               {/* 8. Bottom Footer */}
               <div className="w-full flex flex-1">
                 <div className="flex-[2] border-r border-black p-2 flex flex-col gap-1 justify-end">
                   <div className="flex"><span className="w-24">Bank:</span> <span>Axis Bank</span></div>
                   <div className="flex"><span className="w-24">IFSC Code:</span> <span>UTIB0002996</span></div>
                   <div className="flex"><span className="w-24">A/C Number:</span> <span>9674563210258</span></div>
                   <div className="flex"><span className="w-24">Bank Branch:</span> <span>ALTHAN</span></div>
                   <div className="flex"><span className="w-24">A/C Name:</span> <span>Nishit</span></div>
                   <div className="flex"><span className="w-24">UPI ID:</span> <span>9000000000@axisbank</span></div>
                 </div>
                 <div className="flex-1 p-2 flex flex-col justify-between items-end text-right">
                   <div>For, SWAYAM BILLING<br/>SOFTWARE</div>
                   <div className="mt-16">Authorized Signatory</div>
                 </div>
               </div>

             </div>
          ) : (
          {/* Thermal Receipt Paper Box */}
`;

const file = 'c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the start of the right column preview
const target = \`          {/* Thermal Receipt Paper Box */}
          <div \n            ref={previewRef} \n            className="bg-[#ffffff] shadow-sm w-full max-w-[420px] p-2 flex flex-col items-center shrink-0"\`;

content = content.replace(target, glassTemplateCode + \`          <div \n            ref={previewRef} \n            className="bg-[#ffffff] shadow-sm w-full max-w-[420px] p-2 flex flex-col items-center shrink-0"\`);

// And we need to close the conditional block at the very end of the Right Column Preview
const endTarget = \`              {/* End of Thermal Receipt content */}
            </div>
          </div>
        </div>\`;

const endReplacement = \`              {/* End of Thermal Receipt content */}
            </div>
          </div>
          )}
        </div>\`;

content = content.replace(endTarget, endReplacement);

fs.writeFileSync(file, content);
console.log('Glass template layout added!');
