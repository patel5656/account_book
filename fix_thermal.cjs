const fs = require('fs');
let content = fs.readFileSync('os_frontend/src/pages/PrintSetting.jsx', 'utf8');

const startMarker = '{/* Table */}';
const endMarker = '{/* Footer Text */}';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if(startIndex === -1 || endIndex === -1) {
  console.log('MARKER NOT FOUND', startIndex, endIndex);
  process.exit(1);
}

const replacement = `{/* Table */}
            <div className="w-full mb-1">
              <PrintDashedLine />
              <div className="flex w-full py-1 font-bold overflow-hidden" style={{ fontSize: \`\${customization.tableHeadingsFontSize}px\` }}>
                <div className="flex-[1.5] text-left pr-1 min-w-0 break-words">{tableSettings.thItemName || 'Item Name'}</div>
                <div className="flex-1 min-w-0 break-all px-0.5 text-right">{tableSettings.thQty || 'Qty'}</div>
                <div className="flex-1 min-w-0 break-all px-0.5 text-right">{tableSettings.thRate || 'Rate'}</div>
                <div className="flex-1 min-w-0 break-all px-0.5 text-right">{tableSettings.thDiscount || 'Dis.'}</div>
                <div className="flex-[1.2] min-w-0 break-all px-0.5 text-right">{tableSettings.thTaxableValue || 'Taxable Value'}</div>
                <div className="flex-[1.2] min-w-0 break-all pl-0.5 text-right">{tableSettings.thTotalAmount || 'Total Amount'}</div>
              </div>
              <PrintDashedLine />
              
              <div className="flex flex-col w-full align-top" style={{ fontSize: \`\${customization.tableContentsFontSize}px\` }}>
                {(previewInvoice?.items?.length > 0 
                  ? previewInvoice.items.map(i => ({
                      name: i.product?.name || i.name || 'Unknown',
                      qty: i.quantity || 1,
                      rate: i.price || 0,
                      discount: i.discount1 || 0,
                      taxableValue: i.amount || 0,
                      totalAmount: i.amount || 0,
                      desc: ''
                    }))
                  : [
                      { name: 'Adrian Bell', qty: 1, rate: 1000.00, discount: 120, taxableValue: 880.00, totalAmount: 1006.40 },
                      { name: 'Saree', qty: 1, rate: 1500.00, discount: 20, taxableValue: 1200.00, totalAmount: 1416.00 },
                      { name: 'Blue Saree', qty: 5, rate: 781.00, discount: 0.00, taxableValue: 3906.00, totalAmount: 4999.68, desc: tableSettings.showThHsnSac ? '( 23: 1006, 12%: 28% )' : '' },
                      { name: 'Cricket Bat', qty: 3, rate: 100.00, discount: 0.00, taxableValue: 300.00, totalAmount: 384.00, desc: tableSettings.showThGst ? '(12%: 28%)' : '' }
                    ]
                ).map((item, idx) => (
                  <div key={idx} className="flex flex-col w-full py-0.5">
                    {item.name === 'Blue Saree' || item.name === 'Cricket Bat' ? (
                      <>
                        <div className="flex w-full py-0.5 overflow-hidden">
                          <div className="flex-[1.5] pr-1 leading-tight min-w-0 break-words">
                            {item.name} {item.desc && <span className="inline" style={{ fontSize: \`\${customization.tableDescriptionFontSize}px\` }}>{item.desc}</span>}
                          </div>
                          <div className="flex-1 min-w-0 break-all px-0.5 text-right">{item.qty}</div>
                          <div className="flex-1 min-w-0 break-all px-0.5 text-right">{item.rate}</div>
                          <div className="flex-1 min-w-0 break-all px-0.5 text-right">{item.discount}</div>
                          <div className="flex-[1.2] min-w-0 break-all px-0.5 text-right">{item.taxableValue}</div>
                          <div className="flex-[1.2] min-w-0 break-all pl-0.5 text-right">{item.totalAmount}</div>
                        </div>
                      </>
                    ) : (
                      <div className="flex w-full py-0.5 overflow-hidden">
                        <div className="flex-[1.5] pr-1 leading-tight min-w-0 break-words">
                          {item.name}
                          {item.desc && <span className="block" style={{ fontSize: \`\${customization.tableDescriptionFontSize}px\` }}>{item.desc}</span>}
                        </div>
                        <div className="flex-1 min-w-0 break-all px-0.5 text-right">{item.qty}</div>
                        <div className="flex-1 min-w-0 break-all px-0.5 text-right">{item.rate}</div>
                        <div className="flex-1 min-w-0 break-all px-0.5 text-right">{item.discount}</div>
                        <div className="flex-[1.2] min-w-0 break-all px-0.5 text-right">{item.taxableValue}</div>
                        <div className="flex-[1.2] min-w-0 break-all pl-0.5 text-right">{item.totalAmount}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <PrintDashedLine />
              {(() => {
                const items = previewInvoice?.items?.length > 0 
                  ? previewInvoice.items.map(i => ({ qty: i.quantity || 1, taxableValue: i.amount || 0, totalAmount: i.amount || 0 }))
                  : [{ qty: 10.00, taxableValue: 6286.00, totalAmount: 7806.08 }];
                const totalQty = items.reduce((acc, i) => acc + Number(i.qty), 0);
                const totalTaxable = items.reduce((acc, i) => acc + Number(i.taxableValue), 0);
                const totalFinal = items.reduce((acc, i) => acc + Number(i.totalAmount), 0);
                return (
                  <>
                    <div className="flex w-full py-1 font-bold overflow-hidden" style={{ fontSize: \`\${customization.tableTotalFontSize}px\` }}>
                      <div className="flex-[1.5] pr-1 min-w-0 break-words">Total</div>
                      <div className="flex-1 min-w-0 break-all px-0.5 text-right">{totalQty.toFixed(2)}</div>
                      <div className="flex-1 min-w-0 break-all px-0.5 text-right"></div>
                      <div className="flex-1 min-w-0 break-all px-0.5 text-right"></div>
                      <div className="flex-[1.2] min-w-0 break-all px-0.5 text-right">{totalTaxable.toFixed(2)}</div>
                      <div className="flex-[1.2] min-w-0 break-all pl-0.5 text-right">{totalFinal.toFixed(2)}</div>
                    </div>
                  </>
                );
              })()}
              
              <PrintDashedLine className="mb-1" />

              {tableSettings.showTlCgst && <div className="flex justify-between w-full"><span>{tableSettings.tlCgst || 'CGST'}:</span><span>{previewInvoice?.totalCgst ? Number(previewInvoice.totalCgst).toFixed(2) : '588.88'}</span></div>}
              {tableSettings.showTlSgst && <div className="flex justify-between w-full"><span>{tableSettings.tlSgst || 'SGST'}:</span><span>{previewInvoice?.totalSgst ? Number(previewInvoice.totalSgst).toFixed(2) : '588.88'}</span></div>}
              {tableSettings.showTlIgst && <div className="flex justify-between w-full"><span>{tableSettings.tlIgst || 'IGST'}:</span><span>{previewInvoice?.totalIgst ? Number(previewInvoice.totalIgst).toFixed(2) : '1,177.76'}</span></div>}
              {tableSettings.showTlTcs && <div className="flex justify-between w-full"><span>{tableSettings.tlTcs || 'TCS'}:</span><span>{previewInvoice?.tcsAmount ? Number(previewInvoice.tcsAmount).toFixed(2) : '0.00'}</span></div>}
              {tableSettings.showTlCess && <div className="flex justify-between w-full"><span>{tableSettings.tlCess || 'Cess'}:</span><span>{previewInvoice?.totalCess ? Number(previewInvoice.totalCess).toFixed(2) : '468.75'}</span></div>}
              {tableSettings.showTlRoundOff && <div className="flex justify-between w-full"><span>{tableSettings.tlRoundOff || 'Round off'}:</span><span>{previewInvoice?.roundOff ? Number(previewInvoice.roundOff).toFixed(2) : ''}</span></div>}
              
              <div className="flex justify-between w-full font-bold text-[13px] my-1">
                <span>{tableSettings.tlTotalAmount || 'Total Payable Amount'}:</span>
                <span>{previewInvoice?.totalAmount ? Number(previewInvoice.totalAmount).toFixed(2) : '7,806.00'}</span>
              </div>
              
              <div className="flex justify-between w-full mt-1"><span>Balance:</span><span></span></div>
              <div className="flex justify-between w-full"><span>Previous O/S:</span><span></span></div>
              <div className="flex justify-between w-full"><span>Current O/S:</span><span></span></div>
            </div>
            
            `;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
fs.writeFileSync('os_frontend/src/pages/PrintSetting.jsx', content);
console.log('Fixed Thermal Layout');
