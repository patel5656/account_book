const fs = require('fs');
const file = 'c:/Users/kiaan/Desktop/os -booking/account frontend/src/pages/PrintSetting.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the Table Headings to use tableSettings
const oldTableHeadings = `<div className="flex w-full py-1 font-bold" style={{ fontSize: \`\${customization.tableHeadingsFontSize}px\` }}>
                <div className="flex-1 text-left pr-2">Item Name</div>
                <div className="w-[35px] text-right">Qty</div>
                <div className="w-[45px] text-right">Rate</div>
                <div className="w-[30px] text-right">Dis.</div>
                <div className="w-[55px] text-right">Taxable Value</div>
                <div className="w-[60px] text-right">Total Amount</div>
              </div>`;
const newTableHeadings = `<div className="flex w-full py-1 font-bold" style={{ fontSize: \`\${customization.tableHeadingsFontSize}px\` }}>
                <div className="flex-1 text-left pr-2">{tableSettings.thItemName || 'Item Name'}</div>
                {tableSettings.showThQty && <div className="w-[35px] text-right">{tableSettings.thQty || 'Qty'}</div>}
                {tableSettings.showThRate && <div className="w-[45px] text-right">{tableSettings.thRate || 'Rate'}</div>}
                {tableSettings.showThDiscount && <div className="w-[30px] text-right">{tableSettings.thDiscount || 'Dis.'}</div>}
                {tableSettings.showThTaxableValue && <div className="w-[55px] text-right">{tableSettings.thTaxableValue || 'Taxable Value'}</div>}
                {tableSettings.showThTotalAmount && <div className="w-[60px] text-right">{tableSettings.thTotalAmount || 'Total Amount'}</div>}
              </div>`;
content = content.replace(oldTableHeadings, newTableHeadings);

// 2. Fix the Table Row 1
const oldRow1 = `<div className="flex w-full py-1">
                  <div className="flex-1 pr-2">Adrian Bell</div>
                  <div className="w-[35px] text-right">1</div>
                  <div className="w-[45px] text-right">1000.00</div>
                  <div className="w-[30px] text-right">120</div>
                  <div className="w-[55px] text-right">880.00</div>
                  <div className="w-[60px] text-right">1,006.40</div>
                </div>`;
const newRow1 = `<div className="flex w-full py-1">
                  <div className="flex-1 pr-2">Adrian Bell</div>
                  {tableSettings.showThQty && <div className="w-[35px] text-right">1</div>}
                  {tableSettings.showThRate && <div className="w-[45px] text-right">1000.00</div>}
                  {tableSettings.showThDiscount && <div className="w-[30px] text-right">120</div>}
                  {tableSettings.showThTaxableValue && <div className="w-[55px] text-right">880.00</div>}
                  {tableSettings.showThTotalAmount && <div className="w-[60px] text-right">1,006.40</div>}
                </div>`;
content = content.replace(oldRow1, newRow1);

// 3. Fix the Table Row 2
const oldRow2 = `<div className="flex w-full py-0.5">
                  <div className="flex-1 pr-2">Saree</div>
                  <div className="w-[35px] text-right">1</div>
                  <div className="w-[45px] text-right">1500.00</div>
                  <div className="w-[30px] text-right">20</div>
                  <div className="w-[55px] text-right">1,200.00</div>
                  <div className="w-[60px] text-right">1,416.00</div>
                </div>`;
const newRow2 = `<div className="flex w-full py-0.5">
                  <div className="flex-1 pr-2">Saree</div>
                  {tableSettings.showThQty && <div className="w-[35px] text-right">1</div>}
                  {tableSettings.showThRate && <div className="w-[45px] text-right">1500.00</div>}
                  {tableSettings.showThDiscount && <div className="w-[30px] text-right">20</div>}
                  {tableSettings.showThTaxableValue && <div className="w-[55px] text-right">1,200.00</div>}
                  {tableSettings.showThTotalAmount && <div className="w-[60px] text-right">1,416.00</div>}
                </div>`;
content = content.replace(oldRow2, newRow2);

// 4. Fix the HSN/GST description
const oldHsn = `<div className="w-full pb-1" style={{ fontSize: \`\${customization.tableDescriptionFontSize}px\` }}>Blue Saree ( HSN/SAC: 1006, GST: 28% )</div>`;
const newHsn = `<div className="w-full pb-1" style={{ fontSize: \`\${customization.tableDescriptionFontSize}px\` }}>Blue Saree {tableSettings.showThHsnSac && '( HSN/SAC: 1006, GST: 28% )'}</div>`;
content = content.replace(oldHsn, newHsn);

// 5. Fix the Table Row 3
const oldRow3 = `<div className="flex w-full py-0.5">
                  <div className="flex-1 pr-2"></div>
                  <div className="w-[35px] text-right">5</div>
                  <div className="w-[45px] text-right">781.00</div>
                  <div className="w-[30px] text-right">0.00</div>
                  <div className="w-[55px] text-right">3,905.00</div>
                  <div className="w-[60px] text-right">4,999.68</div>
                </div>`;
const newRow3 = `<div className="flex w-full py-0.5">
                  <div className="flex-1 pr-2"></div>
                  {tableSettings.showThQty && <div className="w-[35px] text-right">5</div>}
                  {tableSettings.showThRate && <div className="w-[45px] text-right">781.00</div>}
                  {tableSettings.showThDiscount && <div className="w-[30px] text-right">0.00</div>}
                  {tableSettings.showThTaxableValue && <div className="w-[55px] text-right">3,905.00</div>}
                  {tableSettings.showThTotalAmount && <div className="w-[60px] text-right">4,999.68</div>}
                </div>`;
content = content.replace(oldRow3, newRow3);

// 6. Fix the Table Row 4
const oldRow4 = `<div className="flex w-full py-1 pb-2">
                  <div className="flex-1 leading-tight pr-2">
                    Cricket Bat 
                    <span className="block" style={{ fontSize: \`\${customization.tableDescriptionFontSize}px\` }}>(GST: 28%)</span>
                  </div>
                  <div className="w-[35px] text-right">3</div>
                  <div className="w-[45px] text-right">100.00</div>
                  <div className="w-[30px] text-right">0.00</div>
                  <div className="w-[55px] text-right">300.00</div>
                  <div className="w-[60px] text-right">384.00</div>
                </div>`;
const newRow4 = `<div className="flex w-full py-1 pb-2">
                  <div className="flex-1 leading-tight pr-2">
                    Cricket Bat 
                    {tableSettings.showThGst && <span className="block" style={{ fontSize: \`\${customization.tableDescriptionFontSize}px\` }}>(GST: 28%)</span>}
                  </div>
                  {tableSettings.showThQty && <div className="w-[35px] text-right">3</div>}
                  {tableSettings.showThRate && <div className="w-[45px] text-right">100.00</div>}
                  {tableSettings.showThDiscount && <div className="w-[30px] text-right">0.00</div>}
                  {tableSettings.showThTaxableValue && <div className="w-[55px] text-right">300.00</div>}
                  {tableSettings.showThTotalAmount && <div className="w-[60px] text-right">384.00</div>}
                </div>`;
content = content.replace(oldRow4, newRow4);

// 7. Fix the mangled Totals section!
const mangledRegex = /<div className="w-full text-\[11px\] mb-1">\s*<PrintDashedLine \/>\s*<div className="flex w-full py-1 font-bold">[\s\S]*?<PrintDashedLine \/>\s*<\/div>/;

const properTotals = `<div className="flex-1 pr-2">Total</div>
                <div className="w-[35px] text-right">10.00</div>
                <div className="w-[45px] text-right"></div>
                <div className="w-[30px] text-right"></div>
                <div className="w-[55px] text-right">6,285.00</div>
                <div className="w-[60px] text-right">7,806.08</div>
              </div>
              <PrintDashedLine />
            </div>`;

content = content.replace(mangledRegex, properTotals);

fs.writeFileSync(file, content);
console.log("Fixed the tables!");
