const fs = require('fs');
let content = fs.readFileSync('src/pages/BarcodePage.jsx', 'utf-8');

const replacement = `          if (tmplElements && tmplElements.length > 0) {
            // Render Dynamic Designer Template
            return (
              <div key={i} className="print-item bg-white relative">
                {tmplElements.map(el => {
                  let text = el.text;
                  if (el.type === 'text') {
                    if (el.field === 'Product Name') text = printRowModal.name;
                    if (el.field === 'MRP') text = \`MRP: ₹\${printRowModal.mrp || 0}\`;
                    if (el.field === 'Sale Price') text = \`Price: ₹\${printRowModal.salePrice || printRowModal.price || 0}\`;
                    if (el.field === 'Company Name') text = activeTemplate?.barcodeHeading || 'SWAYAM BILL';
                  }
                  
                  return (
                    <div key={el.id} style={{ position: 'absolute', left: \`\${el.x}px\`, top: \`\${el.y}px\`, width: \`\${el.width}px\`, height: \`\${el.height}px\` }}>
                      {el.type === 'text' && <span style={{ fontSize: \`\${el.fontSize}px\`, fontWeight: 'bold' }} className="whitespace-nowrap">{text}</span>}
                      {el.type === 'barcode' && <Barcode value={printRowModal.barcode || printRowModal.id?.toString() || '12345'} width={el.width/100} height={el.height - 15} fontSize={10} margin={0} displayValue={true} />}
                      {el.type === 'qrcode' && <QRCodeSVG value={printRowModal.barcode || printRowModal.id?.toString() || '12345'} size={Math.min(el.width, el.height)} />}
                      {el.type === 'image' && <ImageIcon className="w-full h-full text-gray-300" />}
                      {el.type === 'rectangle' && <div className="w-full h-full border-[2px] border-black" />}
                      {el.type === 'circle' && <div className="w-full h-full border-[2px] border-black rounded-full" />}
                      {el.type === 'line' && <div className="w-full border-t-[2px] border-black" />}
                    </div>
                  );
                })}
              </div>
            );
          }
          
          // Enforce Render Static Template (Fallback)`;

content = content.replace('          // Enforce Render Static Template (Requested Format)', replacement);

fs.writeFileSync('src/pages/BarcodePage.jsx', content);
console.log('Restored dynamic template rendering');
