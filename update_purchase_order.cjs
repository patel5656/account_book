const fs = require('fs');
const path = require('path');

const filepath = path.join(__dirname, 'os_frontend', 'src', 'pages', 'PurchaseOrder.jsx');
let content = fs.readFileSync(filepath, 'utf8');

// 1. Replace State and Logic
const stateLogicStart = content.indexOf('  const [customers, setCustomers] = useState([]);');
const stateLogicEnd = content.indexOf('  return (');

const newStateLogic = `
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [paymentMode, setPaymentMode] = useState('Credit');

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [holdSuccessMsg, setHoldSuccessMsg] = useState("");

  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const dateInputRef = useRef(null);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\\//g, '-');
  };

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products');
      if (res.data.success) {
        setProducts(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const createEmptyRow = () => ({
    productId: "",
    productCode: "",
    unit: "",
    primaryOpeningQty: "",
    secOpeningQty: "",
    batchNo: "",
    mfgDate: "",
    expDate: "",
    hsn: "",
    qty: 1,
    freeQty: 0,
    listPrice: 0,
    mrp: 0,
    purchasePrice: 0,
    salePrice: 0,
    wholeSalePrice: 0,
    price: 0,
    disc1: "",
    disc1Type: '%',
    disc2: "",
    disc2Type: '%',
    imei: "",
    ram: "",
    storage: "",
    color: "",
    amount: 0,
    taxRate: 0,
    brandName: ""
  });

  const [rows, setRows] = useState([createEmptyRow()]);
  const [productSearchMode, setProductSearchMode] = useState('Barcode');
  
  const searchModes = ['Product Name', 'Product Code', 'Barcode', 'Batch No'];
  const handleToggleSearchMode = () => {
    const currentIndex = searchModes.indexOf(productSearchMode);
    const nextIndex = (currentIndex + 1) % searchModes.length;
    setProductSearchMode(searchModes[nextIndex]);
  };

  const handleProductSelect = (index, productId) => {
    if (!productId) {
      const newRows = [...rows];
      newRows[index] = {
        ...newRows[index],
        productId: "",
        productCode: "",
        mrp: 0,
        price: 0,
        taxRate: 0,
        hsn: "",
        unit: "",
        primaryOpeningQty: "",
        secOpeningQty: ""
      };
      setRows(newRows);
      return;
    }
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;

    const existingIndex = rows.findIndex((r, i) => i !== index && parseInt(r.productId) === product.id);

    if (existingIndex !== -1) {
      const newRows = [...rows];
      newRows[existingIndex] = { ...newRows[existingIndex], qty: Number(newRows[existingIndex].qty) + 1 };
      newRows[index] = createEmptyRow();
      setRows(newRows);
    } else {
      const newRows = [...rows];
      newRows[index] = {
        ...newRows[index],
        productId: product.id,
        productCode: product.code || '',
        mrp: product.mrp || 0,
        price: product.purchasePrice || product.price || 0,
        purchasePrice: product.purchasePrice || 0,
        taxRate: product.tax || 0,
        hsn: product.hsnCode || '',
        unit: product.purchaseUnit || product.baseUnit || '',
        primaryOpeningQty: product.stock || 0,
        secOpeningQty: product.secOpeningQty || 0,
        brandName: product.brand || ''
      };
      setRows(newRows);
    }
  };

  const updateRow = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    
    if (field === 'brandName') {
      newRows[index].productId = "";
      newRows[index].mrp = 0;
      newRows[index].price = 0;
      newRows[index].taxRate = 0;
      newRows[index].hsn = "";
      newRows[index].unit = "";
      newRows[index].primaryOpeningQty = 0;
      newRows[index].secOpeningQty = 0;
    }
    
    setRows(newRows);
  };

  const addRow = () => setRows([...rows, createEmptyRow()]);
  const removeRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const [manualDiscAmount, setManualDiscAmount] = useState('');
  const [manualFreightAmt, setManualFreightAmt] = useState('');
  const [manualFreightGst, setManualFreightGst] = useState('');
  const [manualTcsPercent, setManualTcsPercent] = useState('');
  const [manualTcsAmt, setManualTcsAmt] = useState('');
  const [manualDiscPercent, setManualDiscPercent] = useState('');
  
  const isTaxIncluded = false; 

  let totalQty = 0;
  let baseAmount = 0;
  let totalRowDiscount = 0;
  let totalGstAmount = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const calculatedRows = rows.map(row => {
    const pPrice = Number(row.price) || 0;
    const pFree = Number(row.freeQty) || 0;
    
    const product = products.find(p => p.id === parseInt(row.productId));
    const rate = product?.conversionRate || 1;

    const priQty = settings.primaryOpeningQty ? (Number(row.primaryOpeningQty) || 0) : 0;
    const secQty = settings.secOpeningQty ? (Number(row.secOpeningQty) || 0) : 0;

    const isPriEmpty = row.primaryOpeningQty === undefined || row.primaryOpeningQty === "";
    const isSecEmpty = row.secOpeningQty === undefined || row.secOpeningQty === "";

    let calculatedQty = 0;
    if ((!settings.primaryOpeningQty || isPriEmpty) && (!settings.secOpeningQty || isSecEmpty)) {
      calculatedQty = Number(row.qty) || 0;
    } else {
      if (product?.baseUnit && product?.salesUnit && rate > 1) {
        calculatedQty = priQty * rate + secQty;
      } else {
        calculatedQty = settings.primaryOpeningQty ? priQty : secQty;
      }
    }

    const pQty = calculatedQty;
    totalQty += pQty + pFree;
    
    const rowBaseAmount = pQty * pPrice;
    baseAmount += rowBaseAmount;

    let displayUnit = row.unit || '';
    if (product) {
      const pUnit = product.baseUnit || '';
      const sUnit = product.salesUnit || '';
      if (settings.primaryOpeningQty && settings.secOpeningQty) {
        displayUnit = pUnit && sUnit ? \`\${pUnit} = \${sUnit}\` : (pUnit || sUnit || '');
      } else if (settings.primaryOpeningQty) {
        displayUnit = pUnit || '';
      } else if (settings.secOpeningQty) {
        displayUnit = sUnit || '';
      }
    }

    let d1Amt = row.disc1Type === '%' ? rowBaseAmount * ((Number(row.disc1) || 0) / 100) : (Number(row.disc1) || 0);
    const afterD1 = Math.max(0, rowBaseAmount - d1Amt);
    let d2Amt = row.disc2Type === '%' ? afterD1 * ((Number(row.disc2) || 0) / 100) : (Number(row.disc2) || 0);
    
    const rowDisc = d1Amt + d2Amt;
    totalRowDiscount += rowDisc;
    
    const amount = Math.max(0, rowBaseAmount - rowDisc);

    const gstRate = Number(row.taxRate) || 0;
    let gstAmount = 0;
    if (isTaxIncluded) {
      gstAmount = amount - (amount / (1 + gstRate / 100));
    } else {
      gstAmount = amount * (gstRate / 100);
    }
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;
    const igst = 0;

    totalGstAmount += gstAmount;
    totalCgst += cgst;
    totalSgst += sgst;
    totalIgst += igst;

    return { ...row, qty: pQty, displayUnit, amount, gstRate, gstAmount, cgst, sgst, igst };
  });

  const appliedDiscAmount = manualDiscAmount !== "" ? Number(manualDiscAmount) : (settings.showDiscount ? totalRowDiscount : 0);
  
  const totalFreight = (parseFloat(manualFreightAmt) || 0) + 
                       (parseFloat(manualFreightAmt) || 0) * (parseFloat(manualFreightGst) || 0) / 100;

  const tempFinalAmount = Math.max(0, baseAmount - appliedDiscAmount) + totalFreight + (isTaxIncluded ? 0 : totalGstAmount);
  
  const appliedTcsPercent = parseFloat(manualTcsPercent) || 0;
  const calculatedTcsAmt = manualTcsAmt !== '' ? parseFloat(manualTcsAmt) : (tempFinalAmount * appliedTcsPercent) / 100;
  const finalCalculatedAmount = tempFinalAmount + calculatedTcsAmt;

  const effectiveDiscPercent = baseAmount > 0 ? ((appliedDiscAmount / baseAmount) * 100).toFixed(2) : 0;

  const allColumnIds = [
    'sno', 'productCode', 'brand', 'product', 'batch', 'qty', 'unit',
    'primaryOpeningQty', 'secOpeningQty', 'hsn', 'gst', 'freeQty', 'mrp',
    'purchasePrice', 'price', 'disc1', 'disc2', 'imei', 'amount', 'action'
  ];

  const colVisible = {
    sno: true, productCode: settings.showProductCode, brand: settings.showCompany,
    product: true, batch: settings.showBatchNo, qty: true, unit: settings.showUnit,
    primaryOpeningQty: settings.primaryOpeningQty, secOpeningQty: settings.secOpeningQty,
    hsn: settings.showHSN, gst: settings.showGST, freeQty: settings.showFreeQty,
    mrp: settings.showMRP,
    purchasePrice: settings.showPurchasePrice, price: true,
    disc1: settings.showDiscount, disc2: settings.showDiscount2,
    imei: settings.showIMEI, amount: true, action: true
  };

  const colWidths = {
    sno: '40px', productCode: '90px', brand: '130px', product: 'minmax(200px, 1fr)', batch: '90px', qty: '100px', unit: '70px',
    primaryOpeningQty: '100px', secOpeningQty: '100px',
    hsn: '80px', gst: '80px', freeQty: '80px',
    mrp: '80px', purchasePrice: '90px',
    price: '100px', disc1: '110px', disc2: '110px', imei: '120px', amount: '100px', action: '80px'
  };

  const gridTemplateColumns = allColumnIds.filter(id => colVisible[id]).map(id => colWidths[id]).join(' ');
  const minGridWidth = allColumnIds.filter(id => colVisible[id]).reduce((sum, id) => {
    let width = colWidths[id];
    if (width.startsWith('minmax')) return sum + parseInt(width.match(/\\d+/)[0]);
    if (width.endsWith('px')) return sum + parseInt(width);
    return sum;
  }, 0);

  const handleSave = async () => {
    if (!selectedCustomerId) return alert('Please select a supplier/customer.');
    
    const validRows = calculatedRows.filter(r => r.productId && r.qty > 0);
    if (validRows.length === 0) {
      alert("Please add at least one valid product.");
      return;
    }

    const payload = {
      invoiceNo: \`PO-\${Date.now()}\`,
      customerId: selectedCustomerId,
      date: invoiceDate,
      paymentMode,
      remark: 'Purchase Order',
      subTotal: baseAmount,
      totalDiscount: appliedDiscAmount,
      freightCharges: totalFreight,
      totalAmount: finalCalculatedAmount,
      totalGstAmount,
      totalCgst,
      totalSgst,
      totalIgst,
      tcsAmount: calculatedTcsAmt,
      items: validRows.map(r => ({
        productId: parseInt(r.productId),
        productCode: r.productCode,
        unit: r.unit,
        batchNo: r.batchNo,
        mfgDate: r.mfgDate,
        expDate: r.expDate,
        quantity: Number(r.qty),
        freeQty: Number(r.freeQty),
        primaryOpeningQty: Number(r.primaryOpeningQty) || 0,
        secOpeningQty: Number(r.secOpeningQty) || 0,
        listPrice: Number(r.listPrice) || 0,
        mrp: Number(r.mrp) || 0,
        purchasePrice: Number(r.purchasePrice) || 0,
        salePrice: Number(r.salePrice) || 0,
        wholeSalePrice: Number(r.wholeSalePrice) || 0,
        price: Number(r.price) || 0,
        discount1: Number(r.disc1Type === '%' ? (r.price * r.qty * (Number(r.disc1) || 0) / 100) : r.disc1) || 0,
        discount2: Number(r.disc2Type === '%' ? (Math.max(0, (r.price * r.qty) - (r.disc1Type === '%' ? (r.price * r.qty * (Number(r.disc1) || 0) / 100) : Number(r.disc1) || 0))) * (Number(r.disc2) || 0) / 100 : r.disc2) || 0,
        amount: Number(r.amount) || 0,
        gstRate: Number(r.gstRate) || 0,
        gstAmount: Number(r.gstAmount) || 0,
        cgst: Number(r.cgst) || 0,
        sgst: Number(r.sgst) || 0,
        igst: Number(r.igst) || 0,
        imei: r.imei,
        ram: r.ram,
        storage: r.storage,
        color: r.color
      }))
    };

    try {
      await apiClient.post('/inventory/PURCHASE_ORDER', payload);
      alert('Purchase Order Saved Successfully!');
      navigate('/admin/invoice-details/company_purchase_order');
    } catch (error) {
      console.error(error);
      alert('Failed to save Purchase Order.');
    }
  };

  const handleHoldInvoice = async (note) => {
    if (!selectedCustomerId) return alert('Please select a supplier/customer before holding.');
    
    const validRows = calculatedRows.filter(r => r.productId && r.qty > 0);
    if (validRows.length === 0) {
      alert("Please add at least one valid product.");
      return;
    }

    const payload = {
      invoiceNo: \`PO-\${Date.now()}\`,
      customerId: selectedCustomerId,
      date: invoiceDate,
      paymentMode,
      remark: note || 'Purchase Order',
      status: 'HOLD',
      subTotal: baseAmount,
      totalDiscount: appliedDiscAmount,
      freightCharges: totalFreight,
      totalAmount: finalCalculatedAmount,
      totalGstAmount,
      totalCgst,
      totalSgst,
      totalIgst,
      tcsAmount: calculatedTcsAmt,
      items: validRows.map(r => ({
        productId: parseInt(r.productId),
        productCode: r.productCode,
        unit: r.unit,
        batchNo: r.batchNo,
        mfgDate: r.mfgDate,
        expDate: r.expDate,
        quantity: Number(r.qty),
        freeQty: Number(r.freeQty),
        primaryOpeningQty: Number(r.primaryOpeningQty) || 0,
        secOpeningQty: Number(r.secOpeningQty) || 0,
        listPrice: Number(r.listPrice) || 0,
        mrp: Number(r.mrp) || 0,
        purchasePrice: Number(r.purchasePrice) || 0,
        salePrice: Number(r.salePrice) || 0,
        wholeSalePrice: Number(r.wholeSalePrice) || 0,
        price: Number(r.price) || 0,
        discount1: Number(r.disc1Type === '%' ? (r.price * r.qty * (Number(r.disc1) || 0) / 100) : r.disc1) || 0,
        discount2: Number(r.disc2Type === '%' ? (Math.max(0, (r.price * r.qty) - (r.disc1Type === '%' ? (r.price * r.qty * (Number(r.disc1) || 0) / 100) : Number(r.disc1) || 0))) * (Number(r.disc2) || 0) / 100 : r.disc2) || 0,
        amount: Number(r.amount) || 0,
        gstRate: Number(r.gstRate) || 0,
        gstAmount: Number(r.gstAmount) || 0,
        cgst: Number(r.cgst) || 0,
        sgst: Number(r.sgst) || 0,
        igst: Number(r.igst) || 0,
        imei: r.imei,
        ram: r.ram,
        storage: r.storage,
        color: r.color
      }))
    };

    try {
      await apiClient.post('/inventory/PURCHASE_ORDER', payload);
      const custName = customers.find(c => c.id === parseInt(selectedCustomerId))?.name;
      setHoldSuccessMsg(\`Hold: \${custName}\`);
      
      setSelectedCustomerId('');
      setRows([createEmptyRow()]);

    } catch (error) {
      console.error(error);
      alert('Failed to hold Purchase Order.');
    }
  };
`;

content = content.slice(0, stateLogicStart) + newStateLogic + '\n' + content.slice(stateLogicEnd);

// 2. Replace the Input Row to use calculatedRows.map(...)
const inputRowStart = content.indexOf('            {/* Input Row */}');
const inputRowEnd = content.indexOf('          </div>\\n        </div>\\n\\n        {/* Calculations and Footer Area */}');
if (inputRowStart === -1 || inputRowEnd === -1) {
    console.error("Could not find input row");
}

const inputRowReplacement = `            {/* Input Row */}
            {calculatedRows.map((row, index) => (
            <div key={index} style={{ gridTemplateColumns }} className="grid bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors">
              <div className="border-r border-gray-200 flex items-center justify-center p-1 bg-gray-600 text-white font-bold text-[12px]">
                {index + 1}
              </div>
              
              {settings.showProductCode && (
                <div className="border-r border-gray-200 p-1 flex">
                  <input type="text" value={row.productCode} onChange={(e) => updateRow(index, 'productCode', e.target.value)} placeholder="Code" className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none" />
                </div>
              )}
              
              {settings.showCompany && (
                <div className="border-r border-gray-200 p-1 flex relative items-center">
                  <input type="text" value={row.brandName} onChange={(e) => updateRow(index, 'brandName', e.target.value)} placeholder="Enter Brand Name" className="w-full h-full border border-gray-200 rounded-[3px] pl-1 pr-6 text-[12px] outline-none" />
                  {row.brandName && (
                    <button type="button" onClick={() => updateRow(index, 'brandName', '')} className="absolute right-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" title="Clear Brand">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              <div className="border-r border-gray-200 p-1 flex relative min-w-0">
                <div className="flex-1 min-w-0">
                  <ProductSelectDropdown 
                    products={products}
                    value={row.productId}
                    onChange={(val) => handleProductSelect(index, val)}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    showPurchasePrice={false}
                    searchMode={productSearchMode}
                  />
                </div>
              </div>

              {settings.showBatchNo && (
                <div className="border-r border-gray-200 p-1 flex items-center justify-center">
                  <input type="text" value={row.batchNo} onChange={(e) => updateRow(index, 'batchNo', e.target.value)} placeholder="Batch No" className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none" />
                </div>
              )}
              
              <div className="border-r border-gray-200 p-1 flex">
                 <input 
                   type="number" 
                   value={row.qty}
                   onChange={(e) => updateRow(index, 'qty', e.target.value)}
                   className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" 
                 />
              </div>

              {settings.showUnit && (
                <div className="border-r border-gray-200 p-1 flex items-center justify-center relative">
                  <input 
                    type="text" 
                    value={row.displayUnit} 
                    onChange={(e) => updateRow(index, 'unit', e.target.value)} 
                    placeholder="Unit"
                    className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none text-center bg-gray-50"
                    readOnly
                  />
                </div>
              )}

              {settings.primaryOpeningQty && (
                <div className="border-r border-gray-200 p-1">
                   <input type="number" placeholder="0" value={row.primaryOpeningQty} onChange={(e) => updateRow(index, 'primaryOpeningQty', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
                </div>
              )}
              {settings.secOpeningQty && (
                <div className="border-r border-gray-200 p-1">
                   <input type="number" placeholder="0" value={row.secOpeningQty} onChange={(e) => updateRow(index, 'secOpeningQty', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
                </div>
              )}
              {settings.showHSN && (
                <div className="border-r border-gray-200 p-1">
                   <input type="text" placeholder="HSN" value={row.hsn} onChange={(e) => updateRow(index, 'hsn', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none text-center text-teal-700 font-bold" />
                </div>
              )}
              {settings.showGST && (
                <div className="border-r border-gray-200 p-1">
                   <input type="number" placeholder="0" value={row.taxRate} onChange={(e) => updateRow(index, 'taxRate', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none text-center text-teal-700 font-bold" />
                </div>
              )}
              {settings.showFreeQty && (
                <div className="border-r border-gray-200 p-1">
                   <input type="number" placeholder="0" value={row.freeQty} onChange={(e) => updateRow(index, 'freeQty', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center text-[#d39e00] font-bold" />
                </div>
              )}

              {settings.showMRP && (
                <div className="border-r border-gray-200 p-1">
                   <input 
                     type="number" 
                     value={row.mrp}
                     onChange={(e) => updateRow(index, 'mrp', e.target.value)}
                     className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" 
                   />
                </div>
              )}

              {settings.showPurchasePrice && (
                <div className="border-r border-gray-200 p-1">
                   <input type="number" placeholder="0" value={row.purchasePrice} onChange={(e) => updateRow(index, 'purchasePrice', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
                </div>
              )}

              <div className="border-r border-gray-200 p-1">
                <input 
                  type="number" 
                  value={row.price}
                  onChange={(e) => updateRow(index, 'price', e.target.value)}
                  className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" 
                />
              </div>

              {settings.showDiscount && (
                <div className="border-r border-gray-200 p-1 flex">
                   <input 
                     type="number" 
                     value={row.disc1}
                     onChange={(e) => updateRow(index, 'disc1', e.target.value)}
                     className="w-[60%] h-full border border-gray-200 rounded-l-[3px] px-1 text-[13px] outline-none text-center font-bold border-r-0" 
                   />
                   <div className="w-[40%] bg-gray-50 border border-gray-200 rounded-r-[3px] flex items-center justify-center text-[12px] text-gray-500 font-bold">%</div>
                </div>
              )}
              {settings.showDiscount2 && (
                <div className="border-r border-gray-200 p-1 flex">
                   <input type="number" value={row.disc2} onChange={(e) => updateRow(index, 'disc2', e.target.value)} className="w-[60%] h-full border border-gray-200 rounded-l-[3px] px-1 text-[13px] outline-none text-center font-bold border-r-0" />
                   <div className="w-[40%] bg-gray-50 border border-gray-200 rounded-r-[3px] flex items-center justify-center text-[12px] text-gray-500 font-bold">%</div>
                </div>
              )}
              {settings.showIMEI && (
                <div className="border-r border-gray-200 p-1">
                   <input type="text" placeholder="IMEI / Specs" value={row.imei} onChange={(e) => updateRow(index, 'imei', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none text-center text-purple-700 font-bold" />
                </div>
              )}

              <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold text-gray-800 bg-gray-50">
                {row.amount.toFixed(2)}
              </div>
              
              <div className="p-1 flex items-center justify-center gap-2">
                <button 
                  onClick={addRow}
                  className="bg-[#28a745] hover:bg-[#218838] text-white p-1 rounded-[3px] transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
                <button 
                  onClick={() => removeRow(index)}
                  className="bg-transparent rounded-[3px] p-0.5 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
            </div>
            ))}
`;

content = content.slice(0, inputRowStart) + inputRowReplacement + '\n' + content.slice(inputRowEnd);

// 3. Replace Footer Calculations
const footerStart = content.indexOf('        {/* Calculations and Footer Area */}');
const footerEnd = content.indexOf('      {/* Fixed Bottom Action Bar */}');

const footerReplacement = `        {/* Calculations and Footer Area */}
        <div className="bg-white border-t border-gray-200 p-4 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          {/* Left Side (Totals, Remark, Terms) */}
          <div className="flex flex-col gap-4">
            
            <div className="summary-stats grid grid-cols-4 gap-2">
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">Total Qty (Inc. Free)</span>
                <span className="text-[14px] font-bold text-[#007bff]">{totalQty}</span>
              </div>
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">Taxable</span>
                <span className="text-[14px] font-bold text-[#28a745]">{baseAmount.toFixed(2)}</span>
              </div>
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">CGST</span>
                <span className="text-[14px] font-bold text-[#007bff]">{totalCgst.toFixed(2)}</span>
              </div>
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">SGST</span>
                <span className="text-[14px] font-bold text-[#007bff]">{totalSgst.toFixed(2)}</span>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-1">Remark</label>
              <textarea 
                placeholder="Remark..." 
                className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5] resize-none h-[40px] text-gray-800"
              />
            </div>

            <div className="flex flex-col text-[13px]">
               <div className="flex flex-wrap items-center gap-1 mb-1 text-gray-500 text-[15px]">
                 Terms <PlusCircle className="w-4 h-4 text-[#4F46E5] cursor-pointer" />
               </div>
               <span className="font-bold text-gray-600">1.Goods once sold will not be taken back or exchanged</span>
            </div>

          </div>

          {/* Right Side (Summary Calculations) */}
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between">
               <span className="text-[13px] font-bold text-gray-800">Subtotal:</span>
               <div className="w-[200px] bg-[#e9ecef] min-w-0 border border-gray-300 rounded-[3px] px-3 py-1 text-[13px] text-gray-800 font-bold text-right">
                 {baseAmount.toFixed(2)}
               </div>
             </div>

             <div className="flex justify-between items-start">
               <span className="text-[13px] font-bold text-gray-800 mt-3">Discount:</span>
               <div className="w-[200px] flex gap-2">
                 <div className="flex-1 relative mt-[18px]">
                   <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Dis.%</span>
                   <input type="number" value={manualDiscPercent} onChange={(e) => {
                     setManualDiscPercent(e.target.value);
                     if(e.target.value) {
                       setManualDiscAmount((baseAmount * Number(e.target.value) / 100).toFixed(2));
                     } else {
                       setManualDiscAmount('');
                     }
                   }} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right text-blue-700 font-bold" placeholder={effectiveDiscPercent} />
                 </div>
                 <div className="flex-1 relative mt-[18px]">
                   <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Dis. Amount</span>
                   <input type="number" value={manualDiscAmount} onChange={(e) => {
                     setManualDiscAmount(e.target.value);
                     setManualDiscPercent('');
                   }} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right text-blue-700 font-bold" placeholder={totalRowDiscount.toFixed(2)} />
                 </div>
               </div>
             </div>

             <div className="flex justify-between items-start">
               <span className="text-[13px] font-bold text-gray-800 mt-3">Fright Charges:</span>
               <div className="w-[200px] flex gap-2">
                 <div className="flex-1 relative mt-[18px]">
                   <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Amount</span>
                   <input type="number" value={manualFreightAmt} onChange={(e) => setManualFreightAmt(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right" placeholder="0" />
                 </div>
                 <div className="flex-1 relative mt-[18px]">
                   <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Gst %</span>
                   <input type="number" value={manualFreightGst} onChange={(e) => setManualFreightGst(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right" placeholder="0" />
                 </div>
               </div>
             </div>
             
             <div className="flex justify-between items-start">
               <span className="text-[13px] font-bold text-gray-800 mt-3">TCS:</span>
               <div className="w-[200px] flex gap-2">
                 <div className="flex-1 relative mt-[18px]">
                   <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">TCS %</span>
                   <input type="number" value={manualTcsPercent} onChange={(e) => setManualTcsPercent(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right" placeholder="0" />
                 </div>
                 <div className="flex-1 relative mt-[18px]">
                   <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">TCS Amount</span>
                   <input type="number" value={manualTcsAmt} onChange={(e) => setManualTcsAmt(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right" placeholder={calculatedTcsAmt.toFixed(2)} />
                 </div>
               </div>
             </div>

             <div className="flex items-center justify-between mt-1">
               <span className="text-[13px] font-bold text-gray-800">Final Amount:</span>
               <div className="w-[200px] bg-[#e9ecef] min-w-0 border border-gray-300 rounded-[3px] px-3 py-1 text-[14px] text-[#28a745] font-bold text-right shadow-sm border-[#28a745]">
                 {finalCalculatedAmount.toFixed(2)}
               </div>
             </div>
          </div>

        </div>
      </div>

`;

content = content.slice(0, footerStart) + footerReplacement + '\n' + content.slice(footerEnd);

fs.writeFileSync(filepath, content);
console.log("Successfully refactored PurchaseOrder.jsx");
