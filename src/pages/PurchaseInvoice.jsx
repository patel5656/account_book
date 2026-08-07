import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  X, Search, Calendar, DownloadCloud, RefreshCw, PlusSquare,
  Edit, Check, Printer, ChevronDown, PlusCircle, Grip, Trash2, Image, Settings, PauseCircle, Filter, SlidersHorizontal, Calculator
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import apiClient from '../api/apiClient';
import { ItemMasterModal } from '../components/ItemMasterModal';
import { ProductSelectDropdown } from '../components/ProductSelectDropdown';
import { SupplierSelectDropdown } from '../components/SupplierSelectDropdown';
import { PartyMasterModal } from '../components/PartyMasterModal';
import { ImportInvoiceAIModal } from '../components/ImportInvoiceAIModal';
import { PaymentStatusModal } from '../components/PaymentStatusModal';
import { TextileQuantityCalculatorModal } from '../components/TextileQuantityCalculatorModal';

// Inline Youtube SVG to avoid lucide-react export issues
const YoutubeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
  </svg>
);

const timeAgo = (dateParam) => {
  if (!dateParam) return 'No transaction';
  const date = new Date(dateParam);
  const today = new Date();
  const days = Math.round((today - date) / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.round(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

export function PurchaseInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings, formatAmount, currentCurrency } = useSettings();
  
  const isReturn = location.pathname.includes('purchase_return');
  const pageTitle = isReturn ? 'Purchase Return' : 'Purchase Invoice';
  const transactionType = isReturn ? 'PURCHASE_RETURN' : 'PURCHASE';

  // Toggles State
  const [isTaxIncluded, setIsTaxIncluded] = useState(true);
  const [paymentMode, setPaymentMode] = useState('Credit');

  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceToDate, setInvoiceToDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilter, setDateFilter] = useState('Today');
  const [focusedRow, setFocusedRow] = useState(null);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [supplierInput, setSupplierInput] = useState("");
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [activeBatchRow, setActiveBatchRow] = useState(null);
  const [activeBatchDropdownRow, setActiveBatchDropdownRow] = useState(null);
  const [activeUnitDropdownRow, setActiveUnitDropdownRow] = useState(null);
  const [tempBatchData, setTempBatchData] = useState({ batchNo: '', expDate: '', mfgDate: '' });
  const [batchSettings, setBatchSettings] = useState({
    dateFormat: 'DD/MM/YYYY', 
    showExpiry: true,
    showMfg: true,
  });
  const [isBatchSettingsOpen, setIsBatchSettingsOpen] = useState(false);
  const [remark, setRemark] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [customerStats, setCustomerStats] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPaymentStatusModalOpen, setIsPaymentStatusModalOpen] = useState(false);
  const [heldCompanies, setHeldCompanies] = useState([]);
  
  const [isQuantityCalcOpen, setIsQuantityCalcOpen] = useState(false);
  const [activeQuantityRow, setActiveQuantityRow] = useState(null);

  useEffect(() => {
    if (selectedSupplierId) {
      apiClient.get(`/customers/${selectedSupplierId}/stats`)
        .then(res => {
          if (res.data.success) {
            setCustomerStats(res.data.data);
          }
        })
        .catch(err => {
          console.error('Failed to fetch stats', err);
          setCustomerStats(null);
        });
    } else {
      setCustomerStats(null);
    }
  }, [selectedSupplierId]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, prodRes, unitRes] = await Promise.all([
        apiClient.get('/customers?type=COMPANY'),
        apiClient.get('/products'),
        apiClient.get('/units')
      ]);
      if (custRes.data.success) setSuppliers(custRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (unitRes.data?.success) setUnits(unitRes.data.data.map(u => u.name));

      const params = new URLSearchParams(location.search);
      const invoiceId = params.get('id');
      if (invoiceId) {
        const invRes = await apiClient.get(`/inventory/single/${invoiceId}`);
        if (invRes.data?.success) {
          const inv = invRes.data.data;
          setInvoiceNo(inv.invoiceNo);
          setInvoiceDate(new Date(inv.date).toISOString().split('T')[0]);
          if (inv.customerId) setSelectedSupplierId(inv.customerId);
          setPaymentMode(inv.paymentMode);
          setRemark(inv.remark || "");
          
          if (inv.items && inv.items.length > 0) {
            const loadedRows = inv.items.map(item => ({
              ...createEmptyRow(),
              productId: item.productId,
              productName: item.product?.name || "",
              brandName: item.product?.brand || "",
              batchNo: item.batchNo || "",
              mfgDate: item.mfgDate || "",
              expDate: item.expDate || "",
              qty: item.quantity || 1,
              primaryOpeningQty: item.primaryOpeningQty || item.quantity,
              secOpeningQty: item.secOpeningQty || 0,
              primaryUnit: item.product?.baseUnit || "Unit",
              price: item.price,
              discount1: item.discount1 || "",
              discount2: item.discount2 || "",
              taxPercent: item.gstRate || 0,
              amount: item.amount
            }));
            setRows([...loadedRows, createEmptyRow()]); // add one empty row at end
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiClient.delete(`/products/${productId}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete product.");
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await apiClient.delete(`/customers/${supplierId}`);
      if (selectedSupplierId === supplierId) {
        setSelectedSupplierId("");
        setSupplierInput("");
      }
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete supplier.");
    }
  };

  const handleSaveSupplier = async (updatedSupplier) => {
    try {
      if (updatedSupplier.id) {
        await apiClient.put(`/customers/${updatedSupplier.id}`, updatedSupplier);
      } else {
        const res = await apiClient.post(`/customers`, updatedSupplier);
        if (res.data && res.data.data && res.data.data.id) {
           setSelectedSupplierId(res.data.data.id);
           setSupplierInput(res.data.data.name);
        }
      }
      setIsSupplierModalOpen(false);
      setEditingSupplier(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save supplier.");
    }
  };

  const createEmptyRow = () => ({
    productId: "",
    productCode: "",
    sku: "",
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
    taxRate: 0
  });

  const [rows, setRows] = useState([createEmptyRow()]);
  const [productSearchMode, setProductSearchMode] = useState(() => {
    return localStorage.getItem('purchaseInvoice_productSearchMode') || 'Product Name';
  });
  const [availableBatches, setAvailableBatches] = useState({});
  
  const searchModes = ['Product Name', 'Product Code', 'Barcode', 'Batch No'];
  const handleToggleSearchMode = () => {
    const currentIndex = searchModes.indexOf(productSearchMode);
    const nextIndex = (currentIndex + 1) % searchModes.length;
    const nextMode = searchModes[nextIndex];
    setProductSearchMode(nextMode);
    localStorage.setItem('purchaseInvoice_productSearchMode', nextMode);
  };

  const fetchAvailableBatches = async (productId, autoFillIndex = null) => {
    if (!productId) return;
    try {
      const res = await apiClient.get(`/inventory/batches/${productId}`);
      if (res.data?.success) {
        setAvailableBatches(prev => ({ ...prev, [productId]: res.data.data }));
        
        if (autoFillIndex !== null && res.data.data.length > 0) {
          const latestBatch = res.data.data[0];
          setRows(prevRows => {
            const newRows = [...prevRows];
            if (newRows[autoFillIndex] && newRows[autoFillIndex].productId == productId && !newRows[autoFillIndex].batchNo) {
               newRows[autoFillIndex] = {
                 ...newRows[autoFillIndex],
                 batchNo: latestBatch.batchNo || '',
                 mfgDate: latestBatch.mfgDate || '',
                 expDate: latestBatch.expDate || ''
               };
            }
            return newRows;
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    }
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
        pUnit: "",
        secOpeningQty: "",
        sUnit: ""
      };
      setRows(newRows);
      return;
    }
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) return;

    const existingIndex = rows.findIndex((r, i) => i !== index && parseInt(r.productId) === product.id);

    if (existingIndex !== -1) {
      // Product already in list — increment its qty, reset current row to empty
      const newRows = [...rows];
      newRows[existingIndex] = { 
        ...newRows[existingIndex], 
        qty: (Number(newRows[existingIndex].qty) || 0) + 1,
        primaryOpeningQty: (Number(newRows[existingIndex].primaryOpeningQty) || 0) + 1
      };
      newRows[index] = createEmptyRow(); // clear the row user was typing in
      setRows(newRows);
    } else {      // New product — fill current row
      const newRows = [...rows];
      newRows[index] = {
        ...newRows[index],
        productId: product.id,
        sku: product.sku || '',
        mrp: product.mrp || 0,
        price: product.purchasePrice || product.price || 0,
        taxRate: product.tax || 0,
        hsn: product.hsnCode || '',
        unit: product.purchaseUnit || product.baseUnit || '',
        primaryOpeningQty: 1,
        pUnit: product.baseUnit || product.purchaseUnit || '',
        secOpeningQty: 0,
        sUnit: product.salesUnit || '',
        brandName: "",
        color: product.colour || product.colorVariant || "",
        size: product.size || ""
      };
      setRows(newRows);
      fetchAvailableBatches(product.id, index);
      
      if (settings.quantityCalculator) {
        setTimeout(() => {
          setActiveQuantityRow(index);
          setIsQuantityCalcOpen(true);
        }, 100);
      }
    }
  };

  const [priceWarnings, setPriceWarnings] = useState({});

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
      newRows[index].pUnit = "";
      newRows[index].secOpeningQty = 0;
      newRows[index].sUnit = "";
    }

    // Price Warning: show warning if entered price < product's saved purchase price
    if (field === 'price' && settings.showPriceWarning) {
      const row = newRows[index];
      if (row.productId) {
        const product = products.find(p => p.id === parseInt(row.productId));
        const savedPrice = product?.purchasePrice || product?.price || 0;
        if (savedPrice > 0 && Number(value) < savedPrice) {
          setPriceWarnings(prev => ({ ...prev, [index]: `⚠ Price (${value}) is below purchase price (${savedPrice})` }));
        } else {
          setPriceWarnings(prev => { const n = { ...prev }; delete n[index]; return n; });
        }
      }
    }
    
    setRows(newRows);
  };

  const addRow = () => setRows([...rows, createEmptyRow()]);
  const removeRow = (index) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  // Manual Summary Inputs
  const [manualDiscAmount, setManualDiscAmount] = useState('');
  const [manualFreightAmt, setManualFreightAmt] = useState('');
  const [manualFreightGst, setManualFreightGst] = useState('');
  const [manualTcsPercent, setManualTcsPercent] = useState('');
  const [manualTcsAmt, setManualTcsAmt] = useState('');
  const [manualDiscPercent, setManualDiscPercent] = useState('');
  const [showSummaryDiscDropdown, setShowSummaryDiscDropdown] = useState(false);

  // Calculation Logic
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
    
    // Find matching product to get conversion rate
    const product = products.find(p => p.id === parseInt(row.productId));
    const rate = product?.conversionRate || 1;

    const priQty = settings.primaryOpeningQty ? (Number(row.primaryOpeningQty) || 0) : 0;
    const secQty = settings.secOpeningQty ? (Number(row.secOpeningQty) || 0) : 0;

    const isPriEmpty = row.primaryOpeningQty === undefined || row.primaryOpeningQty === "";
    const isSecEmpty = row.secOpeningQty === undefined || row.secOpeningQty === "";

    let calculatedQty = 0;
    let actualPriceToUse = pPrice;
    const secondaryPrice = rate > 1 ? (pPrice / rate) : pPrice;
    
    const isSecondary = (u) => u && product && product.baseUnit && u !== product.baseUnit && rate > 1;

    if ((!settings.primaryOpeningQty || isPriEmpty) && (!settings.secOpeningQty || isSecEmpty)) {
      const q = Number(row.qty) || 0;
      const unit = row.unit || row.pUnit || product?.baseUnit;
      if (isSecondary(unit)) {
        calculatedQty = q;
        actualPriceToUse = secondaryPrice;
      } else {
        if (product?.baseUnit && (product?.salesUnit || product?.purchaseUnit) && rate > 1) {
          calculatedQty = q * rate;
          actualPriceToUse = secondaryPrice;
        } else {
          calculatedQty = q;
          actualPriceToUse = pPrice;
        }
      }
    } else {
      if (product?.baseUnit && (product?.salesUnit || product?.purchaseUnit) && rate > 1) {
        const priIsSec = isSecondary(row.pUnit);
        const secIsPri = row.sUnit === product?.baseUnit;

        const priInSecondaryUnits = priIsSec ? priQty : (priQty * rate);
        const secInSecondaryUnits = secIsPri ? (secQty * rate) : secQty;

        calculatedQty = priInSecondaryUnits + secInSecondaryUnits;
        actualPriceToUse = secondaryPrice;
      } else {
        calculatedQty = settings.primaryOpeningQty ? priQty : secQty;
        actualPriceToUse = pPrice;
      }
    }

    const pQty = calculatedQty;
    totalQty += pQty + pFree;
    
    const rowBaseAmount = pQty * actualPriceToUse;
    baseAmount += rowBaseAmount;

    // Determine unit representation based on settings toggles
    let displayUnit = row.unit || '';
    if (product) {
      const pUnit = product.baseUnit || '';
      const sUnit = product.salesUnit || '';
      if (settings.primaryOpeningQty && settings.secOpeningQty) {
        displayUnit = pUnit && sUnit ? `${pUnit} = ${sUnit}` : (pUnit || sUnit || '');
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

    return { ...row, qty: pQty, displayUnit, amount, gstRate, gstAmount, cgst, sgst, igst, d1Amt, d2Amt };
  });

  const appliedDiscAmount = (manualDiscAmount !== "" && !settings.hideTotalDiscount) ? Number(manualDiscAmount) : (settings.showDiscount ? totalRowDiscount : 0);
  
  const totalFreight = !settings.hideFreightCharge ? ((parseFloat(manualFreightAmt) || 0) + 
                       (parseFloat(manualFreightAmt) || 0) * (parseFloat(manualFreightGst) || 0) / 100) : 0;

  const tempFinalAmount = Math.max(0, baseAmount - appliedDiscAmount) + totalFreight + (isTaxIncluded ? 0 : totalGstAmount);
  
  const appliedTcsPercent = parseFloat(manualTcsPercent) || 0;
  const calculatedTcsAmt = manualTcsAmt !== '' ? parseFloat(manualTcsAmt) : (tempFinalAmount * appliedTcsPercent) / 100;
  const finalCalculatedAmount = tempFinalAmount + calculatedTcsAmt;

  const defaultColumnOrder = [
    'sno', 'productCode', 'brand', 'product', 'batch', 'qty', 'primaryOpeningQty', 'pUnit', 'secOpeningQty', 'sUnit', 
    'hsn', 'gst', 'freeQty', 'mrp',
    'salePrice', 'wsPrice', 'price', 'disc1', 'disc2', 'imei', 'amount', 'action'
  ];

  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('purchaseInvoice_colOrder');
    return saved ? JSON.parse(saved) : defaultColumnOrder;
  });
  const [dragOverColId, setDragOverColId] = useState(null);

  useEffect(() => {
    localStorage.setItem('purchaseInvoice_colOrder', JSON.stringify(columnOrder));
  }, [columnOrder]);

  const handleDragStart = (e, colId) => {
    e.dataTransfer.setData('text/plain', colId);
  };
  const handleDragOver = (e, colId) => {
    e.preventDefault();
    if (dragOverColId !== colId) setDragOverColId(colId);
  };
  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    setDragOverColId(null);
    const sourceColId = e.dataTransfer.getData('text/plain');
    if (sourceColId === targetColId) return;
    setColumnOrder(prev => {
      const newOrder = [...prev];
      const sourceIdx = newOrder.indexOf(sourceColId);
      const targetIdx = newOrder.indexOf(targetColId);
      newOrder.splice(sourceIdx, 1);
      newOrder.splice(targetIdx, 0, sourceColId);
      return newOrder;
    });
  };

  const colVisible = {
    sno: true, productCode: settings.showProductCode, brand: settings.showCompany, product: true,
    batch: true, qty: false, primaryOpeningQty: settings.primaryOpeningQty, pUnit: settings.pUnit, secOpeningQty: settings.secOpeningQty, sUnit: settings.sUnit,
    hsn: settings.showHSN, gst: settings.showGST, freeQty: settings.showFreeQty,
    mrp: settings.showMRP,
    salePrice: false,
    wsPrice: false, price: true,
    disc1: settings.showDiscount, disc2: settings.showDiscount2,
    imei: settings.showIMEI, amount: true, action: true
  };

  const colWidths = {
    sno: '40px', productCode: '90px', brand: '130px', product: 'minmax(150px, 1fr)', batch: '90px', qty: '80px',
    primaryOpeningQty: '100px', pUnit: '70px', secOpeningQty: '100px', sUnit: '70px',
    hsn: '80px', gst: '80px', freeQty: '80px',
    mrp: '80px', salePrice: '90px', wsPrice: '90px',
    price: '100px', disc1: '110px', disc2: '110px', imei: '120px', amount: '100px', action: '80px'
  };

  const gridTemplateColumns = columnOrder
    .filter(id => colVisible[id])
    .map(id => colWidths[id])
    .join(' ');

  const minGridWidth = columnOrder.filter(id => colVisible[id]).reduce((sum, id) => {
    let width = colWidths[id];
    if (width.startsWith('minmax')) {
      return sum + parseInt(width.match(/\d+/)[0]);
    }
    if (width.endsWith('px')) {
      return sum + parseInt(width);
    }
    return sum;
  }, 0);
  const handleSave = async () => {
    if (paymentMode !== 'Cash' && !selectedSupplierId && !supplierInput.trim()) {
      alert("Please select or enter a company/supplier.");
      return;
    }

    const validRows = calculatedRows.filter(r => r.productId && r.qty > 0);
    if (validRows.length === 0) {
      alert("Please add at least one valid product.");
      return;
    }

    // Open Payment Status Modal
    setIsPaymentStatusModalOpen(true);
  };

  const handleFinalSaveWithPayment = async (paymentRows) => {
    const validRows = calculatedRows.filter(r => r.productId && r.qty > 0);

    const payload = {
      invoiceNo: invoiceNo || `PUR-${Date.now()}`,
      date: invoiceDate,
      customerId: selectedSupplierId ? parseInt(selectedSupplierId) : supplierInput.trim(),
      paymentMode,
      remark,
      subTotal: baseAmount,
      totalDiscount: appliedDiscAmount,
      freightCharges: totalFreight,
      totalAmount: finalCalculatedAmount,
      totalGstAmount,
      totalCgst,
      totalSgst,
      totalIgst,
      tcsAmount: calculatedTcsAmt,
      status: paymentMode === 'Cash' ? 'PAID' : 'DUE',
      items: validRows.map(r => ({
        productId: parseInt(r.productId),
        productCode: r.productCode,
        sku: r.sku,
        unit: r.displayUnit || r.unit,
        batchNo: r.batchNo,
        mfgDate: r.mfgDate,
        expDate: r.expDate,
        quantity: Number(r.qty),
        freeQty: Number(r.freeQty),
        primaryOpeningQty: Number(r.primaryOpeningQty) || 0,
        secOpeningQty: Number(r.secOpeningQty) || 0,
        listPrice: Number(r.listPrice),
        mrp: Number(r.mrp),
        purchasePrice: Number(r.purchasePrice),
        salePrice: Number(r.salePrice),
        wholeSalePrice: Number(r.wholeSalePrice),
        price: Number(r.price),
        discount1: Number(r.d1Amt) || 0,
        discount2: Number(r.d2Amt) || 0,
        amount: Number(r.amount),
        gstRate: Number(r.gstRate) || 0,
        gstAmount: Number(r.gstAmount) || 0,
        cgst: Number(r.cgst) || 0,
        sgst: Number(r.sgst) || 0,
        igst: Number(r.igst) || 0,
        imei: r.imei,
        ram: r.ram,
        storage: r.storage,
        color: r.color
      })),
      paymentDetails: paymentRows || []
    };

    try {
      const res = await apiClient.post(`/inventory/${transactionType}`, payload);
      if (res.data) {
        alert("Purchase Invoice Saved Successfully!");
        setIsPaymentStatusModalOpen(false);
        setRows([createEmptyRow()]);
        setSelectedSupplierId("");
        setSupplierInput("");
        setRemark("");
        setInvoiceNo("");
        setManualDiscPercent("");
        setManualDiscAmount("");
        setManualFreightAmt("");
        setManualFreightGst("");
        setManualTcsPercent("");
        setManualTcsAmt("");
      }
    } catch (err) {
      alert("Error saving transaction.");
      console.error(err);
    }
  };

  const handleHoldInvoice = async (note) => {
    if (paymentMode !== 'Cash' && !selectedSupplierId && !supplierInput.trim()) {
      alert("Please select or enter a company/supplier before holding.");
      return;
    }

    const validRows = calculatedRows.filter(r => r.productId && r.qty > 0);
    if (validRows.length === 0) {
      alert("Please add at least one valid product.");
      return;
    }

    const payload = {
      invoiceNo: invoiceNo || `PUR-${Date.now()}`,
      date: invoiceDate,
      customerId: selectedSupplierId ? parseInt(selectedSupplierId) : supplierInput.trim(),
      paymentMode,
      remark: note || remark,
      subTotal: baseAmount,
      totalDiscount: appliedDiscAmount,
      freightCharges: totalFreight,
      totalAmount: finalCalculatedAmount,
      totalGstAmount,
      totalCgst,
      totalSgst,
      totalIgst,
      tcsAmount: calculatedTcsAmt,
      status: 'HOLD',
      items: validRows.map(r => ({
        productId: parseInt(r.productId),
        productCode: r.productCode,
        sku: r.sku,
        unit: r.unit,
        batchNo: r.batchNo,
        mfgDate: r.mfgDate,
        expDate: r.expDate,
        quantity: Number(r.qty),
        freeQty: Number(r.freeQty),
        primaryOpeningQty: Number(r.primaryOpeningQty) || 0,
        secOpeningQty: Number(r.secOpeningQty) || 0,
        listPrice: Number(r.listPrice),
        mrp: Number(r.mrp),
        purchasePrice: Number(r.purchasePrice),
        salePrice: Number(r.salePrice),
        wholeSalePrice: Number(r.wholeSalePrice),
        price: Number(r.price),
        discount1: Number(r.d1Amt) || 0,
        discount2: Number(r.d2Amt) || 0,
        amount: Number(r.amount),
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
      const res = await apiClient.post(`/inventory/${transactionType}`, payload);
      if (res.data) {
        const custName = suppliers.find(c => c.id === parseInt(selectedSupplierId))?.name || supplierInput.split('-')[0].trim();
        setHeldCompanies(prev => [...prev, custName]);
        
        // Reset form
        setRows([createEmptyRow()]);
        setSelectedSupplierId("");
        setSupplierInput("");
        setRemark("");
        setInvoiceNo("");
        setManualDiscPercent("");
        setManualDiscAmount("");
        setManualFreightAmt("");
        setManualFreightGst("");
        setManualTcsPercent("");
        setManualTcsAmt("");
      }
    } catch (err) {
      alert("Failed to hold invoice.");
      console.error(err);
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col relative pb-12 w-full overflow-x-hidden">
      <div className="bg-white m-3 mt-0 shadow-sm border border-gray-200 flex-1 flex flex-col min-w-0 rounded-[3px]">
        
        {/* Top Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between px-3 py-1.5">
          <h2 className="text-white font-medium text-[15px]">{pageTitle}</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={`text-white text-[13px] font-bold ${paymentMode === 'Credit' ? '' : 'opacity-50'}`}>Credit</span>
              <div 
                onClick={() => setPaymentMode(prev => prev === 'Cash' ? 'Credit' : 'Cash')}
                className={`w-[28px] h-[16px] rounded-full relative cursor-pointer border ${paymentMode === 'Cash' ? 'bg-[#117a8b] border-[#148ea1]' : 'bg-[#dc3545] border-[#c82333]'}`}
              >
                <div className={`w-[12px] h-[12px] bg-white rounded-full absolute top-[1px] transition-all ${paymentMode === 'Cash' ? 'right-[1px]' : 'left-[1px]'}`}></div>
              </div>
              <span className={`text-white text-[13px] font-bold ${paymentMode === 'Cash' ? '' : 'opacity-50'}`}>Cash</span>
            </div>
            
            <button className="bg-white p-1 rounded-sm shadow-sm">
              <YoutubeIcon className="w-4 h-4 text-[#ff0000]" />
            </button>
            <button className="bg-[#ffc107] p-1 rounded-sm shadow-sm">
              <RefreshCw className="w-4 h-4 text-white" strokeWidth={3} />
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] p-1 rounded-sm shadow-sm hover:bg-[#c82333] transition-colors"
            >
              <X className="w-4 h-4 text-white font-bold" strokeWidth={4} />
            </button>
          </div>
        </div>

        {/* Top Form Controls */}
        <div className="p-3 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-bold text-gray-800">Company Name {paymentMode === 'Cash' && <span className="text-gray-500 font-normal">(Optional)</span>}</label>
                {heldCompanies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {heldCompanies.map((comp, idx) => (
                      <div key={idx} className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-[3px] border border-green-200">
                        <span className="text-[12px] font-bold">Hold: {comp}</span>
                        <button onClick={(e) => { 
                          e.preventDefault(); 
                          setHeldCompanies(prev => prev.filter((_, i) => i !== idx)); 
                        }} className="hover:text-green-900 transition-colors cursor-pointer">
                          <X className="w-3.5 h-3.5" strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {customerStats && (
                <span 
                  className="text-[13px] font-bold text-[#dc3545] cursor-pointer hover:underline"
                  onClick={() => {
                    const company = suppliers.find(s => s.id === parseInt(selectedSupplierId));
                    if (company) {
                      navigate('/admin/party-ledger/company_payment', { state: { company } });
                    }
                  }}
                  title="Click to view Company Ledger"
                >
                  Due Amount :{formatAmount(customerStats.dueAmount)}
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 flex items-center h-[32px]">
                <SupplierSelectDropdown
                  suppliers={suppliers}
                  value={selectedSupplierId}
                  onChange={(val) => {
                    setSelectedSupplierId(val);
                    const matched = suppliers.find(s => s.id === parseInt(val));
                    setSupplierInput(matched ? matched.name : "");
                  }}
                  onEdit={(s) => {
                    setEditingSupplier(s);
                    setIsSupplierModalOpen(true);
                  }}
                  onDelete={handleDeleteSupplier}
                />
              </div>
              <button title="Click here to view the Latest invoice of the selected party" onClick={() => alert("Click here to view the Latest invoice of the selected party")} className="bg-[#17a2b8] hover:bg-[#138496] text-white px-2.5 py-1.5 rounded-[3px] flex items-center justify-center shadow-sm h-[32px] transition-colors">
                <Search className="w-4 h-4" strokeWidth={3} />
              </button>
              <button 
                onClick={() => handleHoldInvoice()}
                className="bg-[#6c757d] hover:bg-[#5a6268] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <PauseCircle className="w-3.5 h-3.5" /> Hold
              </button>
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <DownloadCloud className="w-4 h-4" /> Import Invoice (AI)
              </button>
            </div>
            {customerStats && (
              <div className="flex flex-wrap gap-2 mt-0.5">
                <div className="bg-[#f8f9fa] border border-gray-200 px-3 py-1 rounded-[3px] flex flex-col items-center justify-center min-w-[100px]">
                  <span className="text-[11px] text-gray-500 font-bold flex items-center gap-1"><Calendar size={11}/> Joining</span>
                  <span className="text-[12px] font-bold text-gray-800">{formatDisplayDate(customerStats.joiningDate)}</span>
                </div>
                <div className="bg-[#e3f2fd] border border-[#bbdefb] px-3 py-1 rounded-[3px] flex flex-col items-center justify-center min-w-[100px]">
                  <span className="text-[11px] text-[#0277bd] font-bold flex items-center gap-1">Total Billing</span>
                  <span className="text-[12px] font-bold text-[#0288d1]">{formatAmount(customerStats.totalBilling)}</span>
                </div>
                <div className="bg-[#e8f5e9] border border-[#c8e6c9] px-3 py-1 rounded-[3px] flex flex-col items-center justify-center min-w-[100px]">
                  <span className="text-[11px] text-[#2e7d32] font-bold flex items-center gap-1">Last Transaction</span>
                  <span className="text-[12px] font-bold text-[#388e3c]">{timeAgo(customerStats.lastTransaction)}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end justify-center gap-3">
             <div className="flex items-center justify-end w-full sm:max-w-[320px]">
               <label className="text-[13px] font-bold text-gray-800 w-[80px] text-right mr-2">Invoice No :</label>
               <div className="flex-1 flex items-center">
                 <input 
                   type="text" 
                   value={invoiceNo}
                   onChange={e => setInvoiceNo(e.target.value)}
                   placeholder="PUR-12345 (Auto)"
                   className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1 text-[13px] bg-white text-gray-800 font-bold"
                 />
               </div>
             </div>
             <div className="flex flex-col items-end w-full sm:max-w-[320px]">
               <div className="flex items-center gap-2 mb-1 mr-1">
                 <span className="text-[13px] font-bold text-gray-800">Date</span>
                 <span className="text-[12px] font-medium text-blue-500">({formatDisplayDate(invoiceDate)})</span>
               </div>
               <div className="flex flex-wrap items-center gap-2 justify-end w-full">
                 <select 
                   value={dateFilter}
                   onChange={(e) => setDateFilter(e.target.value)}
                   className="border border-gray-300 rounded-[3px] px-3 py-1 text-[13px] outline-none text-gray-800 bg-white shadow-sm min-w-[130px] cursor-pointer"
                 >
                   <option>Today</option>
                   <option>Yesterday</option>
                   <option>Last 7 Days</option>
                   <option>Last 30 Days</option>
                   <option>Last Month</option>
                   <option>This Month</option>
                   <option>Custom Range</option>
                 </select>
                 <button className="flex items-center gap-1 bg-[#007bff] hover:bg-[#0069d9] text-white px-3 py-1 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm whitespace-nowrap">
                   <Search className="w-4 h-4" /> Search
                 </button>
                 <button className="bg-[#6c757d] hover:bg-[#5a6268] text-white p-1 rounded-[3px] transition-colors shadow-sm">
                   <SlidersHorizontal className="w-4 h-4" />
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 min-h-[300px] overflow-x-auto">
          <div style={{ minWidth: `max(100%, ${Math.max(1000, minGridWidth)}px)` }} className="w-full">
            <div style={{ gridTemplateColumns }} className="bg-[#343a40] text-white grid text-center border-b border-gray-600">
              {columnOrder.map(colId => {
                if (!colVisible[colId]) return null;
                const isDragOver = dragOverColId === colId;
                const dragProps = {
                  draggable: true,
                  onDragStart: (e) => handleDragStart(e, colId),
                  onDragOver: (e) => handleDragOver(e, colId),
                  onDrop: (e) => handleDrop(e, colId),
                  className: `py-2 text-[12px] font-bold flex flex-col justify-center leading-tight hover:bg-gray-700 transition-colors cursor-grab ${isDragOver ? 'border-l-2 border-blue-500 bg-gray-700' : 'border-r border-gray-600'}`
                };
                
                switch (colId) {
                  case 'sno': return <div key={colId} {...dragProps}>S.NO.</div>;
                  case 'productCode': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center')}>P.CODE</div>;
                  case 'brand': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center')}>BRAND NAME</div>;
                  case 'product': return (
                    <div key={colId} {...dragProps} className={dragProps.className.replace('justify-center', 'justify-center min-w-0 relative')}>
                      <div className="flex items-center justify-center gap-2 w-full px-1 pointer-events-none">
                        <span className="truncate">PRODUCT NAME</span>
                        <div 
                          onClick={(e) => { e.stopPropagation(); handleToggleSearchMode(); }}
                          className="bg-[#007bff] hover:bg-[#0069d9] text-white px-1.5 py-0.5 rounded-[3px] flex items-center gap-1 text-[10px] font-bold transition-colors cursor-pointer shadow-sm flex-shrink-0 select-none pointer-events-auto"
                          title="Click to change search mode"
                        >
                           <Filter className="w-3 h-3" /> {productSearchMode}
                        </div>
                      </div>
                    </div>
                  );
                  case 'batch': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center')}>BATCH NO</div>;
                  case 'qty': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center flex-col')}>QTY</div>;
                  case 'primaryOpeningQty': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center flex-col')}>P.QTY</div>;
                  case 'pUnit': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center flex-col')}>P.Unit</div>;
                  case 'secOpeningQty': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center flex-col')}>S.QTY</div>;
                  case 'sUnit': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center flex-col')}>S.Unit</div>;
                  case 'hsn': return <div key={colId} {...dragProps} className={dragProps.className + ' text-teal-300'}>HSN</div>;
                  case 'gst': return <div key={colId} {...dragProps} className={dragProps.className + ' text-teal-300'}>GST %</div>;
                  case 'freeQty': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center text-[#ffc107]')}>FREE</div>;
                  case 'mrp': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center')}>MRP</div>;
                  case 'price': return (
                    <div key={colId} {...dragProps}>
                      <span className="font-normal text-[10px] pointer-events-none">(TAX {isTaxIncluded ? 'INCLUDED' : 'EXCLUDED'})</span>
                      <div 
                        onClick={(e) => { e.stopPropagation(); setIsTaxIncluded(!isTaxIncluded); }}
                        className="flex items-center justify-center gap-1 mt-0.5 cursor-pointer pointer-events-auto"
                      >
                        <div className={`w-[24px] h-[14px] rounded-full relative transition-colors ${isTaxIncluded ? 'bg-[#117a8b]' : 'bg-gray-400'}`}>
                          <div className={`w-[10px] h-[10px] bg-white rounded-full absolute top-[2px] transition-all shadow-sm ${isTaxIncluded ? 'right-[2px]' : 'left-[2px]'}`}></div>
                        </div>
                        PRICE
                      </div>
                    </div>
                  );
                  case 'disc1': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center text-blue-300')}>DISC 1</div>;
                  case 'disc2': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center text-blue-300')}>DISC 2</div>;
                  case 'imei': return (
                    <div key={colId} {...dragProps} className={dragProps.className + ' items-center justify-center text-purple-300'}>
                      <span className="pointer-events-none">IMEI /</span><span className="pointer-events-none">SPECS</span>
                    </div>
                  );
                  case 'amount': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center')}>AMOUNT</div>;
                  case 'action': return <div key={colId} {...dragProps} className={dragProps.className.replace('flex-col', 'items-center justify-center border-r-0')}>ACTION</div>;
                  default: return null;
                }
              })}
            </div>

            <datalist id="unit-options">
              {units.map((u, i) => (
                <option key={i} value={u} />
              ))}
            </datalist>
            <datalist id="brand-options-purchase">
              {[...new Set(products.map(p => p.brand).filter(Boolean))].map((brand, i) => (
                <option key={i} value={brand} />
              ))}
            </datalist>
            <datalist id="disc-options">
              <option value="5" />
              <option value="12" />
              <option value="18" />
              <option value="28" />
            </datalist>

            {calculatedRows.map((row, idx) => (
              <div key={idx} style={{ gridTemplateColumns }} className="grid bg-white border-b border-gray-200">
                {columnOrder.map(colId => {
                  if (!colVisible[colId]) return null;
                  switch (colId) {
                    case 'sno': return <div key={colId} className="border-r border-gray-200 flex items-center justify-center p-1 bg-gray-600 text-white font-bold text-[12px]">{idx + 1}</div>;
                    case 'productCode': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex">
                        <input type="text" value={row.productCode} onChange={(e) => updateRow(idx, 'productCode', e.target.value)} placeholder="Code" className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none" />
                      </div>
                    );
                    case 'brand': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex relative items-center">
                        <input list="brand-options-purchase" type="text" value={row.brandName || ''} onChange={(e) => updateRow(idx, 'brandName', e.target.value)} placeholder="Enter Brand Name" className="w-full h-full border border-gray-200 rounded-[3px] pl-1 pr-6 text-[12px] outline-none" />
                        {row.brandName && (
                          <button type="button" onClick={() => updateRow(idx, 'brandName', '')} className="absolute right-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" title="Clear Brand">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                    case 'product': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex relative min-w-0">
                        <div className="flex-1 min-w-0">
                          <ProductSelectDropdown 
                            products={row.brandName ? products.filter(p => p.brand === row.brandName) : products}
                            value={row.productId}
                            onChange={(val) => handleProductSelect(idx, val)}
                            onEdit={(product) => { setEditingProduct(product); setIsProductModalOpen(true); }}
                            onDelete={handleDeleteProduct}
                            showPurchasePrice={settings.showPurchasePrice}
                            searchMode={productSearchMode}
                          />
                        </div>
                      </div>
                    );
                    case 'batch': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex items-center justify-center relative">
                        <div className={`flex items-center justify-between w-full h-full border rounded-[3px] px-1 bg-[#b8e2f2] ${activeBatchDropdownRow === idx ? 'border-[#90c5da]' : 'border-transparent'}`}>
                          <input 
                            type="text" value={row.batchNo || ''} onChange={(e) => updateRow(idx, 'batchNo', e.target.value)}
                            onClick={() => { setActiveBatchDropdownRow(idx); if(row.productId) fetchAvailableBatches(row.productId); }}
                            onBlur={() => setTimeout(() => setActiveBatchDropdownRow(null), 200)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault(); setActiveBatchDropdownRow(null); setActiveBatchRow(idx);
                                setTempBatchData({ batchNo: row.batchNo || '', expDate: row.expDate || '', mfgDate: row.mfgDate || '' });
                                setIsBatchModalOpen(true);
                              }
                            }}
                            placeholder="Batch No" className="w-full h-full bg-transparent text-[12px] outline-none text-gray-800 font-bold" 
                          />
                          <ChevronDown size={14} className="text-gray-400 cursor-pointer" onClick={() => { setActiveBatchDropdownRow(idx === activeBatchDropdownRow ? null : idx); if(row.productId) fetchAvailableBatches(row.productId); }} />
                        </div>
                        {activeBatchDropdownRow === idx && (
                          <div className="absolute top-[calc(100%-4px)] left-1 min-w-[180px] bg-[#b8e2f2] shadow-md z-[60] border-t border-white rounded-b-[3px] max-h-[200px] overflow-y-auto">
                            {(availableBatches[row.productId] || []).map((batchObj, bIdx) => (
                              <div key={bIdx} className="p-1.5 flex justify-between items-start hover:bg-[#a5d7ea] transition-colors cursor-pointer border-b border-[#a5d7ea]" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setActiveBatchDropdownRow(null); setRows(prev => { const newRows = [...prev]; newRows[idx] = { ...newRows[idx], batchNo: batchObj.batchNo || '', mfgDate: batchObj.mfgDate || '', expDate: batchObj.expDate || '' }; return newRows; }); }}>
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-800 text-[14px] leading-tight">{batchObj.batchNo}</span>
                                  <div className="flex gap-2 text-[11px] font-bold mt-0.5">
                                    {batchObj.mfgDate ? <span className="text-[#28a745]">Mfg. {new Date(batchObj.mfgDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</span> : <span className="text-[#28a745]">Mfg.</span>}
                                    {batchObj.expDate ? <span className="text-[#dc3545]">Exp. {new Date(batchObj.expDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-')}</span> : <span className="text-[#dc3545]">Exp.</span>}
                                  </div>
                                </div>
                              </div>
                            ))}
                            {row.batchNo && (
                              <div className="p-1.5 flex justify-between items-start hover:bg-[#a5d7ea] transition-colors cursor-pointer" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setActiveBatchDropdownRow(null); setActiveBatchRow(idx); setTempBatchData({ batchNo: row.batchNo || '', expDate: row.expDate || '', mfgDate: row.mfgDate || '' }); setIsBatchModalOpen(true); }}>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span className="bg-[#007bff] text-white text-[11px] px-1.5 py-0.5 rounded-[3px] font-bold">{row.qty || 0} pcs</span>
                                  <Edit className="w-3.5 h-3.5 text-[#17a2b8]" />
                                  <Trash2 className="w-3.5 h-3.5 text-[#dc3545] hover:text-red-700" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setActiveBatchDropdownRow(null); setRows(prev => { const newRows = [...prev]; newRows[idx] = { ...newRows[idx], batchNo: '', mfgDate: '', expDate: '' }; return newRows; }); }} />
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                    case 'qty': return (
                      <div key={colId} className="border-r border-gray-200 p-1">
                         <input type="number" placeholder="0" value={row.qty} onChange={(e) => updateRow(idx, 'qty', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
                      </div>
                    );
                    case 'primaryOpeningQty': return (
                      <div key={colId} className="border-r border-gray-200 p-1">
                         <input type="number" placeholder="0" value={row.primaryOpeningQty} onChange={(e) => updateRow(idx, 'primaryOpeningQty', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
                      </div>
                    );
                    case 'pUnit': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex items-center justify-center">
                        <select value={row.pUnit || ''} onChange={(e) => updateRow(idx, 'pUnit', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-0 text-[12px] outline-none text-center bg-white">
                          <option value="">Unit</option>
                          {row.productId && Array.from(new Set([
                            products.find(p => p.id === parseInt(row.productId))?.baseUnit,
                            products.find(p => p.id === parseInt(row.productId))?.purchaseUnit,
                            products.find(p => p.id === parseInt(row.productId))?.salesUnit
                          ].filter(Boolean))).map(u => <option key={u} value={u}>{u}</option>)}
                          {!row.productId && units.map((u, i) => <option key={i} value={u}>{u}</option>)}
                        </select>
                      </div>
                    );
                    case 'secOpeningQty': return (
                      <div key={colId} className="border-r border-gray-200 p-1">
                         <input type="number" placeholder="0" value={row.secOpeningQty} onChange={(e) => updateRow(idx, 'secOpeningQty', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
                      </div>
                    );
                    case 'sUnit': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex items-center justify-center">
                        <select value={row.sUnit || ''} onChange={(e) => updateRow(idx, 'sUnit', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-0 text-[12px] outline-none text-center bg-white">
                          <option value="">Unit</option>
                          {row.productId && Array.from(new Set([
                            products.find(p => p.id === parseInt(row.productId))?.baseUnit,
                            products.find(p => p.id === parseInt(row.productId))?.purchaseUnit,
                            products.find(p => p.id === parseInt(row.productId))?.salesUnit
                          ].filter(Boolean))).map(u => <option key={u} value={u}>{u}</option>)}
                          {!row.productId && units.map((u, i) => <option key={i} value={u}>{u}</option>)}
                        </select>
                      </div>
                    );
                    case 'hsn': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex items-center justify-center">
                        <input type="text" value={row.hsn || ''} onChange={(e) => updateRow(idx, 'hsn', e.target.value)} placeholder="HSN" className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none text-center" />
                      </div>
                    );
                    case 'gst': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex items-center justify-center">
                        <select value={row.taxRate} onChange={(e) => updateRow(idx, 'taxRate', Number(e.target.value))} className="w-full h-full border border-gray-200 rounded-[3px] px-0 text-[12px] outline-none text-center">
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </div>
                    );
                    case 'freeQty': return (
                      <div key={colId} className="border-r border-gray-200 p-1">
                         <input type="number" value={row.freeQty} onChange={(e) => updateRow(idx, 'freeQty', Number(e.target.value))} className="w-full h-full border border-yellow-300 bg-yellow-50 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold text-yellow-800" />
                      </div>
                    );
                    case 'mrp': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex flex-col justify-center bg-gray-50 text-[13px] font-bold text-gray-500">
                        <input type="number" value={row.mrp} onChange={(e) => updateRow(idx, 'mrp', Number(e.target.value))} className="w-full h-full border-none bg-transparent px-1 text-[12px] outline-none text-right font-bold text-gray-600" />
                      </div>
                    );
                    case 'price': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex flex-col justify-center relative">
                        <input
                          type="number"
                          value={row.price}
                          onChange={(e) => updateRow(idx, 'price', Number(e.target.value))}
                          className={`w-full h-full border rounded-[3px] px-2 text-[13px] outline-none text-right font-bold transition-colors ${priceWarnings[idx] ? 'bg-red-50 border-red-400' : 'bg-blue-50 border-blue-200'}`}
                        />
                        {priceWarnings[idx] && settings.showPriceWarning && (
                          <div className="absolute top-full left-0 z-50 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-[3px] shadow-lg mt-0.5 whitespace-nowrap">
                            ⚠ Price is below purchase price!
                          </div>
                        )}
                      </div>
                    );
                    case 'disc1': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex">
                         <input list="disc-options" type="text" value={row.disc1} onChange={(e) => updateRow(idx, 'disc1', e.target.value)} className="w-[60%] border border-blue-200 rounded-l-[3px] px-1 text-[13px] outline-none border-r-0 text-center text-blue-800 bg-blue-50" />
                          <select value={row.disc1Type} onChange={(e) => updateRow(idx, 'disc1Type', e.target.value)} className="w-[40%] border border-blue-200 rounded-r-[3px] px-0 text-[12px] outline-none bg-blue-100 text-blue-800 appearance-none text-center">
                            <option value="%">%</option>
                            <option value={currentCurrency.symbol}>{currentCurrency.symbol}</option>
                          </select>
                      </div>
                    );
                    case 'disc2': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex">
                         <input list="disc-options" type="text" value={row.disc2} onChange={(e) => updateRow(idx, 'disc2', e.target.value)} className="w-[60%] border border-blue-200 rounded-l-[3px] px-1 text-[13px] outline-none border-r-0 text-center text-blue-800 bg-blue-50" />
                          <select value={row.disc2Type} onChange={(e) => updateRow(idx, 'disc2Type', e.target.value)} className="w-[40%] border border-blue-200 rounded-r-[3px] px-0 text-[12px] outline-none bg-blue-100 text-blue-800 appearance-none text-center">
                            <option value="%">%</option>
                            <option value={currentCurrency.symbol}>{currentCurrency.symbol}</option>
                          </select>
                      </div>
                    );
                    case 'imei': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex flex-col gap-1 justify-center">
                          <input type="text" placeholder="IMEI..." value={row.imei || ''} onChange={(e) => updateRow(idx, 'imei', e.target.value)} className="w-full border border-purple-200 bg-purple-50 rounded-[3px] px-1 py-0.5 text-[10px] outline-none text-purple-800 font-bold" />
                          <input type="text" placeholder="RAM..." value={row.ram || ''} onChange={(e) => updateRow(idx, 'ram', e.target.value)} className="w-full border border-gray-200 bg-white rounded-[3px] px-1 py-0.5 text-[10px] outline-none text-gray-800" />
                          <input type="text" placeholder="Storage..." value={row.storage || ''} onChange={(e) => updateRow(idx, 'storage', e.target.value)} className="w-full border border-gray-200 bg-white rounded-[3px] px-1 py-0.5 text-[10px] outline-none text-gray-800" />
                          <input type="text" placeholder="Color..." value={row.color || ''} onChange={(e) => updateRow(idx, 'color', e.target.value)} className="w-full border border-gray-200 bg-white rounded-[3px] px-1 py-0.5 text-[10px] outline-none text-gray-800" />
                      </div>
                    );
                    case 'amount': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex items-center justify-end pr-2 text-[13px] font-bold text-gray-800 bg-gray-50">
                        {row.amount.toFixed(2)}
                      </div>
                    );
                    case 'action': return (
                      <div key={colId} className="bg-[#343a40] flex items-center justify-center gap-2 p-1 border-r-0">
                        <button onClick={addRow} className="text-[#28a745] hover:text-green-400">
                          <PlusSquare className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        </button>
                        <button onClick={() => removeRow(idx)} className="text-red-400 hover:text-red-300">
                          <Trash2 className="w-[18px] h-[18px]" strokeWidth={2.5} />
                        </button>
                      </div>
                    );
                    default: return null;
                  }
                })}
              </div>
            ))}
            
          </div>
        </div>

{/* Calculations and Footer Area */}
        <div className="bg-white border-t border-gray-200 p-4 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          <div className="flex flex-col gap-4">
            <div className="summary-stats grid grid-cols-4 gap-2">
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">Total Qty</span>
                <span className="text-[14px] font-bold text-[#007bff]">{totalQty}</span>
              </div>
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">Taxable</span>
                <span className="text-[14px] font-bold text-[#28a745]">{formatAmount(finalCalculatedAmount)}</span>
              </div>
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">CGST</span>
                <span className="text-[14px] font-bold text-[#007bff]">{formatAmount(totalCgst)}</span>
              </div>
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">SGST</span>
                <span className="text-[14px] font-bold text-[#007bff]">{formatAmount(totalSgst)}</span>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-1">Remark</label>
              <textarea value={remark} onChange={(e) => setRemark(e.target.value)} placeholder="Remark..." className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5] h-[40px]" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between">
               <span className="text-[13px] font-bold text-gray-800">Subtotal:</span>
               <div className="w-[200px] bg-[#e9ecef] border border-gray-300 rounded-[3px] px-3 py-1 text-[13px] text-gray-800 font-bold text-right">
                 {formatAmount(baseAmount)}
               </div>
             </div>

             {!settings.hideTotalDiscount && (
               <div className="flex justify-between items-start">
                 <span className="text-[13px] font-bold text-gray-800 mt-3">Discount:</span>
                 <div className="w-[200px] flex gap-2">
                   <div className="flex-1 relative mt-[18px]">
                     <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Dis.%</span>
                     <div className="relative">
                       <input 
                         type="text" 
                         value={manualDiscPercent !== "" ? manualDiscPercent : ""}
                         placeholder="0"
                         onChange={(e) => {
                           setManualDiscPercent(e.target.value);
                           if (e.target.value) {
                             setManualDiscAmount((baseAmount * Number(e.target.value) / 100).toFixed(2));
                           } else {
                             setManualDiscAmount('');
                           }
                         }}
                         onFocus={() => setShowSummaryDiscDropdown(true)}
                         onBlur={() => setTimeout(() => setShowSummaryDiscDropdown(false), 200)}
                         className="w-full border border-gray-300 rounded-[3px] py-1 pl-2 pr-6 text-[13px] text-right text-blue-700 font-bold" 
                       />
                       <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-blue-600 text-[10px]">
                         ▼
                       </div>
                     </div>
                     {showSummaryDiscDropdown && (
                        <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg z-50 rounded-b-[3px] mt-[1px]">
                          {[5, 12, 18, 28].map(val => (
                            <div 
                              key={val} 
                              className="px-2 py-1.5 hover:bg-blue-50 cursor-pointer text-center text-[13px] text-gray-800 font-bold border-b border-gray-100 last:border-0"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setManualDiscPercent(val);
                                setManualDiscAmount((baseAmount * Number(val) / 100).toFixed(2));
                                setShowSummaryDiscDropdown(false);
                              }}
                            >
                              {val}
                            </div>
                          ))}
                        </div>
                     )}
                   </div>
                   <div className="flex-1 relative mt-[18px]">
                     <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Dis. Amt</span>
                     <input type="number" value={manualDiscAmount !== "" ? manualDiscAmount : (totalRowDiscount > 0 ? totalRowDiscount.toFixed(2) : "")} placeholder="0.00" onChange={(e) => setManualDiscAmount(e.target.value)} className="w-full border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] text-right text-blue-700 font-bold" />
                   </div>
                 </div>
               </div>
             )}

              {!settings.hideFreightCharge && (
               <div className="flex justify-between items-start">
                  <span className="text-[13px] font-bold text-gray-800 mt-3">Fright Charges:</span>
                  <div className="w-[200px] flex gap-2">
                    <div className="flex-1 relative mt-[18px]">
                      <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Amount</span>
                      <div className="flex h-full">
                        <input type="number" value={manualFreightAmt !== "" ? manualFreightAmt : ""} placeholder="0" onChange={(e) => setManualFreightAmt(e.target.value)} className="w-full min-w-0 border border-gray-300 border-r-0 rounded-l-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right" />
                        <button 
                          onClick={() => {
                            const addAmt = parseFloat(window.prompt("Enter amount to add to Freight Charges:", "0"));
                            if (!isNaN(addAmt) && addAmt > 0) {
                              setManualFreightAmt(String((parseFloat(manualFreightAmt) || 0) + addAmt));
                            }
                          }}
                          className="bg-[#e9ecef] border border-gray-300 border-l-0 px-2 rounded-r-[3px] flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-700 font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 relative mt-[18px]">
                      <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Gst %</span>
                      <select 
                        value={manualFreightGst !== "" ? manualFreightGst : "0"} 
                        onChange={(e) => setManualFreightGst(e.target.value)} 
                        className="w-full min-w-0 border border-gray-300 rounded-[3px] px-0 py-1 text-[13px] outline-none bg-white text-center"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>
                  </div>
                </div>
             )}

              <div className="flex justify-between items-start">
                <span className="text-[13px] font-bold text-gray-800 mt-3">TCS:</span>
                <div className="w-[200px] flex gap-2">
                  <div className="flex-1 relative mt-[18px]">
                    <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">TCS %</span>
                    <input type="number" value={manualTcsPercent !== "" ? manualTcsPercent : "0"} onChange={(e) => setManualTcsPercent(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right text-[#4F46E5] font-bold" />
                  </div>
                  <div className="flex-1 relative mt-[18px]">
                    <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">TCS Amount</span>
                    <input type="number" value={manualTcsAmt !== "" ? manualTcsAmt : calculatedTcsAmt.toFixed(2)} onChange={(e) => setManualTcsAmt(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right text-[#4F46E5] font-bold" />
                  </div>
                </div>
              </div>

             <div className="flex items-center justify-between mt-1">
               <span className="text-[13px] font-bold text-gray-800">Final Amount:</span>
               <div className="w-[200px] bg-[#e9ecef] border border-[#28a745] rounded-[3px] px-3 py-1 text-[14px] text-[#28a745] font-bold text-right">
                 {formatAmount(finalCalculatedAmount)}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-[#343a40] z-40 px-2 sm:px-4 py-2 shadow-lg">
        <div className="flex items-center justify-center gap-2 max-w-[400px] mx-auto">
          <button onClick={handleSave} className="flex flex-1 items-center justify-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold">
            <Check className="w-4 h-4" /> Save Purchase
          </button>
          
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 bg-[#dc3545] hover:bg-[#c82333] text-white px-3 py-1.5 rounded-[3px] text-[13px]"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>

      {/* Item Master Modal */}
      <ItemMasterModal 
        isOpen={isProductModalOpen} 
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        editData={editingProduct}
        onSave={async (newProduct) => {
          try {
            const payload = {
              ...newProduct,
              sku: newProduct.sku || `SKU${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
              price: parseFloat(newProduct.price) || 0,
              mrp: parseFloat(newProduct.mrp) || 0,
              stock: parseInt(newProduct.qty) || 0,
            };
            if (editingProduct && editingProduct.id) {
              await apiClient.put(`/products/${editingProduct.id}`, payload);
            } else {
              await apiClient.post('/products', payload);
            }
            fetchData(); // Refresh products list
          } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product');
          }
        }}
      />

      {/* Batch Details Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 bg-black/30 z-[100] flex items-center justify-center">
          <div className="bg-white rounded-[4px] shadow-lg w-[450px] overflow-hidden flex flex-col">
            <div className="bg-[#007bff] px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold text-[15px]">Enter Batch Details</h3>
                <button onClick={() => setIsBatchSettingsOpen(true)} className="text-white/80 hover:text-white transition-colors" title="Settings">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
              <button onClick={() => setIsBatchModalOpen(false)} className="text-[#dc3545] hover:text-red-600">
                <X className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>
            
            {isBatchSettingsOpen ? (
              <div className="p-4 flex flex-col gap-4">
                <h4 className="font-bold text-[14px] text-gray-800 border-b pb-1">Batch Settings</h4>
                
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-gray-700">Date Format</label>
                  <select 
                    value={batchSettings.dateFormat}
                    onChange={(e) => setBatchSettings({...batchSettings, dateFormat: e.target.value})}
                    className="border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none"
                  >
                    <option value="DD/MM/YYYY">Full Date (DD/MM/YYYY)</option>
                    <option value="MM/YYYY">Month & Year (MM/YYYY)</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-gray-700">Expiry Tracking</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={batchSettings.showExpiry} onChange={(e) => setBatchSettings({...batchSettings, showExpiry: e.target.checked})} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#28a745]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium text-gray-700">Manufacturing Tracking</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={batchSettings.showMfg} onChange={(e) => setBatchSettings({...batchSettings, showMfg: e.target.checked})} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#28a745]"></div>
                  </label>
                </div>

                <div className="flex justify-end mt-2">
                  <button 
                    onClick={() => setIsBatchSettingsOpen(false)}
                    className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                    <label className="text-[13px] font-bold text-gray-800">Batch No :</label>
                    <input 
                      type="text" 
                      value={tempBatchData.batchNo} 
                      onChange={(e) => setTempBatchData({ ...tempBatchData, batchNo: e.target.value })}
                      className="w-full border border-[#90c5da] bg-[#b8e2f2] rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-gray-800 font-bold"
                      autoFocus
                    />
                  </div>
                  
                  {batchSettings.showMfg && (
                    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                      <label className="text-[13px] font-bold text-gray-800">MFG Date:</label>
                      <input 
                        type={batchSettings.dateFormat === 'MM/YYYY' ? 'month' : 'date'} 
                        value={tempBatchData.mfgDate} 
                        onChange={(e) => setTempBatchData({ ...tempBatchData, mfgDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-gray-800"
                      />
                    </div>
                  )}

                  {batchSettings.showExpiry && (
                    <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                      <label className="text-[13px] font-bold text-gray-800">Expiry Date:</label>
                      <input 
                        type={batchSettings.dateFormat === 'MM/YYYY' ? 'month' : 'date'} 
                        value={tempBatchData.expDate} 
                        onChange={(e) => setTempBatchData({ ...tempBatchData, expDate: e.target.value })}
                        className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-gray-800"
                      />
                    </div>
                  )}
                </div>
                <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
                  <button 
                    onClick={() => {
                      if (!tempBatchData.batchNo.trim()) {
                        alert("Batch Number is mandatory.");
                        return;
                      }
                      if (batchSettings.showMfg && !tempBatchData.mfgDate) {
                        alert("MFG Date is mandatory when tracking is enabled.");
                        return;
                      }
                      if (batchSettings.showExpiry && !tempBatchData.expDate) {
                        alert("Expiry Date is mandatory when tracking is enabled.");
                        return;
                      }
                      
                      if (activeBatchRow !== null) {
                        const newRows = [...rows];
                        newRows[activeBatchRow].batchNo = tempBatchData.batchNo;
                        newRows[activeBatchRow].mfgDate = tempBatchData.mfgDate;
                        newRows[activeBatchRow].expDate = tempBatchData.expDate;
                        setRows(newRows);
                      }
                      setIsBatchModalOpen(false);
                    }}
                    className="border border-gray-800 text-gray-800 hover:bg-gray-100 px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
                  >
                    Okay
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {/* Import Invoice AI Modal */}
      <ImportInvoiceAIModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={(data) => {
          setIsImportModalOpen(false);
        }}
      />

      <PartyMasterModal 
        isOpen={isSupplierModalOpen}
        onClose={() => { setIsSupplierModalOpen(false); setEditingSupplier(null); }}
        editData={editingSupplier}
        onSave={handleSaveSupplier}
        defaultType="COMPANY"
      />

      <ItemMasterModal 
        isOpen={isProductModalOpen}
        onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
        editData={editingProduct}
        onSave={async (newItem) => {
          try {
            const payload = {
              ...newItem,
              sku: newItem.sku || `SKU${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
              price: parseFloat(newItem.price) || 0,
              mrp: parseFloat(newItem.mrp) || 0,
              stock: parseInt(newItem.qty) || 0,
            };
            if (editingProduct && editingProduct.id) {
              await apiClient.put(`/products/${editingProduct.id}`, payload);
            } else {
              await apiClient.post('/products', payload);
            }
            setIsProductModalOpen(false);
            setEditingProduct(null);
            fetchData();
          } catch (err) {
            console.error('Failed to save product:', err);
            alert(err.response?.data?.message || 'Failed to save product');
          }
        }}
        products={products}
      />

      <PaymentStatusModal 
        isOpen={isPaymentStatusModalOpen}
        onClose={() => setIsPaymentStatusModalOpen(false)}
        totalAmount={finalCalculatedAmount}
        dueAmount={customerStats?.dueAmount || 0}
        onSaveSuccess={handleFinalSaveWithPayment}
      />

      {isQuantityCalcOpen && activeQuantityRow !== null && (
        <TextileQuantityCalculatorModal
          isOpen={isQuantityCalcOpen}
          onClose={() => {
            setIsQuantityCalcOpen(false);
            setActiveQuantityRow(null);
          }}
          initialData={{
             productName: rows[activeQuantityRow]?.productName || products.find(p => p.id === parseInt(rows[activeQuantityRow]?.productId))?.name || 'Unknown Item',
             hsn: rows[activeQuantityRow]?.hsn,
             rollQty: rows[activeQuantityRow]?.rollQty,
             meterPerRoll: rows[activeQuantityRow]?.meterPerRoll,
             qty: rows[activeQuantityRow]?.qty,
             price: rows[activeQuantityRow]?.price,
             disc1: rows[activeQuantityRow]?.disc1,
             taxRate: rows[activeQuantityRow]?.taxRate,
          }}
          onSave={(calcData) => {
             const newRows = [...rows];
             newRows[activeQuantityRow] = {
               ...newRows[activeQuantityRow],
               rollQty: calcData.rollQty,
               meterPerRoll: calcData.meterPerRoll,
               qty: calcData.qty,
               price: calcData.price,
               disc1: calcData.disc1,
               taxRate: calcData.taxRate,
             };
             setRows(newRows);
             setIsQuantityCalcOpen(false);
             setActiveQuantityRow(null);
          }}
        />
      )}
    </div>
  );
}
