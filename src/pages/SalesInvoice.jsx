import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  X, Search, Calendar, DownloadCloud, RefreshCw, PlusSquare,
  Edit, Check, Printer, ChevronDown, PlusCircle, Grip, Trash2, PauseCircle, Settings, Filter
} from 'lucide-react';
import { cn } from '../utils';
import { useAuditLog } from '../context/AuditLogContext';
import { ImportInvoiceAIModal } from '../components/ImportInvoiceAIModal';
import { ItemMasterModal } from '../components/ItemMasterModal';
import { PartyMasterModal } from '../components/PartyMasterModal';
import { ProductSelectDropdown } from '../components/ProductSelectDropdown';
import { CustomerSelectDropdown } from '../components/CustomerSelectDropdown';
import { PaymentStatusModal } from '../components/PaymentStatusModal';
import { useSettings } from '../context/SettingsContext';
import { TextileQuantityCalculatorModal } from '../components/TextileQuantityCalculatorModal';
import apiClient from '../api/apiClient';
import { createTransaction, getTransactionById, deleteTransaction } from '../api/inventory';

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

export function SalesInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addLog } = useAuditLog();
  const { settings, formatAmount, currentCurrency } = useSettings();
  
  const isReturn = location.pathname.includes('sales-return-invoice');
  const isQuotation = location.pathname.includes('quotation-invoice');
  const isSalesOrder = location.pathname.includes('sales-order-invoice');
  const isCustomerInvoice = location.pathname.includes('customer-invoice-creation');
  const isCustomerChallan = location.pathname.includes('customer-challan-creation');
  const pageTitle = isQuotation ? 'Quotation' : (isReturn ? 'Sales Return' : (isSalesOrder ? 'Sales Order' : (isCustomerInvoice ? 'Customer Invoice' : (isCustomerChallan ? 'Customer Challan' : 'Sales Invoice'))));

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [activeBatchRow, setActiveBatchRow] = useState(null);
  const [activeBatchDropdownRow, setActiveBatchDropdownRow] = useState(null);
  const [activeUnitDropdownRow, setActiveUnitDropdownRow] = useState(null);
  const [tempBatchData, setTempBatchData] = useState({ batchNo: '', expDate: '', mfgDate: '' });
  const [isQuantityCalcOpen, setIsQuantityCalcOpen] = useState(false);
  const [activeQuantityRow, setActiveQuantityRow] = useState(null);
  const [showBarcodePrintModal, setShowBarcodePrintModal] = useState(false);
  const [savedInvoiceNo, setSavedInvoiceNo] = useState("");
  
  // Batch Settings
  const [batchSettings, setBatchSettings] = useState({
    dateFormat: 'DD/MM/YYYY', // Option A: MM/YYYY, Option B: DD/MM/YYYY
    showExpiry: true,
    showMfg: true,
  });
  const [isBatchSettingsOpen, setIsBatchSettingsOpen] = useState(false);

  // Toggles State
  const [isTaxIncluded, setIsTaxIncluded] = useState(true);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [isWholesale, setIsWholesale] = useState(false);

  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [holdSuccessMsgs, setHoldSuccessMsgs] = useState([]);
  const [activeHoldId, setActiveHoldId] = useState(null);
  const [isConvertMenuOpen, setIsConvertMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [isSaving, setIsSaving] = useState(false);

  const loadHeldInvoice = async (id) => {
    try {
      const response = await getTransactionById(id);
      if (response.success && response.data) {
        const invoice = response.data;
        
        if (invoice.items && invoice.items.length > 0) {
          const loadedRows = invoice.items.map(item => ({
             productId: item.productId,
             productCode: item.product?.productCode || '',
             brandName: item.product?.brandName || '',
             qty: item.quantity,
             freeQty: item.freeQty,
             price: item.price,
             disc1: item.discount1,
             disc1Type: '₹',
             disc2: item.discount2,
             disc2Type: '₹',
             amount: item.amount,
             gstRate: item.gstRate,
             gstAmount: item.gstAmount,
             cgst: item.cgst,
             sgst: item.sgst,
             igst: item.igst,
             imei: item.imei || '',
             ram: item.ram || '',
             storage: item.storage || '',
             color: item.color || '',
             taxRate: item.gstRate,
             hsn: item.product?.hsnCode || '',
             unit: item.product?.salesUnit || '',
             primaryOpeningQty: item.primaryOpeningQty || 1,
             secOpeningQty: item.secOpeningQty || 0,
             pUnit: item.product?.baseUnit || item.product?.purchaseUnit || '',
             sUnit: item.product?.salesUnit || '',
             size: item.product?.size || '',
          }));
          setRows(loadedRows);
        } else {
          setRows([{ productId: "", mrp: 0, price: 0, qty: 1, freeQty: 0, disc1: 0, disc1Type: '%', disc2: 0, disc2Type: '%', amount: 0, gstRate: 0, gstAmount: 0, cgst: 0, sgst: 0, igst: 0, imei: "", ram: "", storage: "", color: "", brandName: "", taxRate: 0, hsn: "", unit: "", primaryOpeningQty: 1, pUnit: "", secOpeningQty: 0, sUnit: "", size: "" }]);
        }
        
        if (invoice.customerId) {
           setSelectedCustomerId(invoice.customerId.toString());
           const cust = customers.find(c => c.id === invoice.customerId);
           if (cust) setCustomerInput(`${cust.name} - ${cust.phone}`);
        } else {
           setSelectedCustomerId("");
           setCustomerInput("");
        }
        if (invoice.paymentMode) setPaymentMode(invoice.paymentMode);
        if (invoice.remark) setRemark(invoice.remark);
        
        setActiveHoldId(id);
        setHoldSuccessMsgs(prev => prev.filter(h => h.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to load held invoice");
    }
  };

  useEffect(() => {
    const unholdId = searchParams.get('unholdId');
    if (unholdId && !activeHoldId) {
       loadHeldInvoice(unholdId);
    }
  }, [searchParams]);
  const [isPaymentStatusModalOpen, setIsPaymentStatusModalOpen] = useState(false);
  const dateInputRef = useRef(null);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [customerInput, setCustomerInput] = useState("");
  const [remark, setRemark] = useState("");
  const [customerStats, setCustomerStats] = useState(null);

  // Offers & Loyalty Points State
  const [activeOffers, setActiveOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [customerPoints, setCustomerPoints] = useState(0);
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [useEarnedPoints, setUseEarnedPoints] = useState(false);
  
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const customerDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer ${name}?`)) return;
    try {
      await apiClient.delete(`/customers/${id}`);
      fetchData();
      if (selectedCustomerId === id) {
        setSelectedCustomerId("");
        setCustomerInput("");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete customer.");
    }
  };

  useEffect(() => {
    if (selectedCustomerId) {
      apiClient.get(`/customers/${selectedCustomerId}/stats`)
        .then(res => {
          if (res.data.success) {
            setCustomerStats(res.data.data);
          }
        })
        .catch(err => {
          console.error('Failed to fetch stats', err);
          setCustomerStats(null);
        });
      const c = customers.find(x => String(x.id) === String(selectedCustomerId));
      if (c) setCustomerPoints(c.loyaltyPoints || 0);
    } else {
      setCustomerStats(null);
      setCustomerPoints(0);
    }
    setRedeemedPoints(0);
    setUseEarnedPoints(false);
    setSelectedOffer(null);
  }, [selectedCustomerId, customers]);

  useEffect(() => {
    if (settings?.showOffers) {
      apiClient.get('/offers')
        .then(res => {
          if (res.data && res.data.data) {
            setActiveOffers(res.data.data.filter(o => o.status === 'ACTIVE'));
          }
        })
        .catch(err => console.error('Failed to fetch offers', err));
    }
  }, [settings?.showOffers]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [custRes, prodRes, unitRes] = await Promise.all([
        apiClient.get('/customers?type=CUSTOMER'),
        apiClient.get('/products'),
        apiClient.get('/units')
      ]);
      if (custRes.data.success) setCustomers(custRes.data.data);
      if (prodRes.data.success) setProducts(prodRes.data.data);
      if (unitRes.data?.success) setUnits(unitRes.data.data.map(u => u.name));

      const params = new URLSearchParams(location.search);
      const invoiceId = params.get('id');
      if (invoiceId) {
        const invRes = await apiClient.get(`/inventory/single/${invoiceId}`);
        if (invRes.data?.success) {
          const inv = invRes.data.data;
          setInvoiceDate(new Date(inv.date).toISOString().split('T')[0]);
          if (inv.customerId) setSelectedCustomerId(inv.customerId);
          setPaymentMode(inv.paymentMode);
          setRemark(inv.remark || "");
          
          if (inv.items && inv.items.length > 0) {
            const loadedRows = inv.items.map(item => ({
              ...createEmptyRow(),
              productId: item.productId,
              productName: item.product?.name || "",
              brandName: item.product?.brand || "",
              batchNo: item.batchNo || "",
              primaryQty: item.quantity,
              qty: item.quantity,
              freeQty: item.freeQty || 0,
              primaryOpeningQty: item.primaryOpeningQty || 0,
              secOpeningQty: item.secOpeningQty || 0,
              primaryUnit: item.product?.baseUnit || "Unit",
              price: item.price,
              discount1: item.discount1 || "",
              discount2: item.discount2 || "",
              taxPercent: item.gstRate || 0,
              amount: item.amount
            }));
            setRows([...loadedRows, createEmptyRow()]);
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

  const handleSaveCustomer = async (newCustomer) => {
    try {
      if (newCustomer.id) {
        await apiClient.put(`/customers/${newCustomer.id}`, newCustomer);
      } else {
        const res = await apiClient.post('/customers', newCustomer);
        if (res.data?.data?.id) {
          setSelectedCustomerId(res.data.data.id);
          setCustomerInput(res.data.data.name);
        }
      }
      setIsCustomerModalOpen(false);
      setEditingCustomer(null);
      fetchData();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to save customer');
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
    taxRate: 0
  });

  const [rows, setRows] = useState([createEmptyRow()]);
  const [productSearchMode, setProductSearchMode] = useState(() => {
    return localStorage.getItem('salesInvoice_productSearchMode') || 'Product Name';
  });
  
  const searchModes = ['Product Name', 'Product Code', 'Barcode', 'Batch No'];
  const handleToggleSearchMode = () => {
    const currentIndex = searchModes.indexOf(productSearchMode);
    const nextIndex = (currentIndex + 1) % searchModes.length;
    const nextMode = searchModes[nextIndex];
    setProductSearchMode(nextMode);
    localStorage.setItem('salesInvoice_productSearchMode', nextMode);
  };

  // Recalculate prices when Wholesale toggle changes
  useEffect(() => {
    if (products.length > 0) {
      setRows(prevRows => prevRows.map(row => {
        if (row.productId) {
          const product = products.find(p => p.id === parseInt(row.productId));
          if (product) {
            return {
              ...row,
              price: isWholesale ? (product.wholesalePrice || 0) : (product.price || 0)
            };
          }
        }
        return row;
      }));
    }
  }, [isWholesale]);

  const handleProductSelect = (index, productId, variant = null) => {
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

    if (settings?.negativeStockLock) {
      if (1 > (product.stock || 0)) {
        alert('Negative Stock Lock is enabled. Insufficient stock!');
        return;
      }
    }

    // We identify a unique row by productId AND variant name (if present)
    const existingIndex = rows.findIndex((r, i) => i !== index && parseInt(r.productId) === product.id && r.variantName === (variant?.name || ""));

    if (existingIndex !== -1) {
      // Product already in list — increment its qty, reset current row to empty
      if (settings?.negativeStockLock) {
        const currentQty = Number(rows[existingIndex].qty) || 0;
        if (currentQty + 1 > (product.stock || 0)) {
          alert('Negative Stock Lock is enabled. Insufficient stock!');
          return;
        }
      }
      
      const newRows = [...rows];
      newRows[existingIndex] = { 
        ...newRows[existingIndex], 
        qty: (Number(newRows[existingIndex].qty) || 0) + 1,
        primaryOpeningQty: (Number(newRows[existingIndex].primaryOpeningQty) || 0) + 1
      };
      newRows[index] = createEmptyRow(); // clear the row user was typing in
      setRows(newRows);
    } else {
      // New product — fill current row
      const newRows = [...rows];
      let pMRP = product.mrp || 0;
      let pPrice = isWholesale ? (product.wholesalePrice || 0) : (product.price || 0);

      if (variant) {
        if (variant.mrp > 0) pMRP = variant.mrp;
        if (variant.price > 0) pPrice = variant.price;
        // Or if there is specific logic for variant price mapping, it goes here.
      }

      newRows[index] = {
        ...newRows[index],
        productId: product.id,
        mrp: pMRP,
        price: pPrice,
        taxRate: product.tax || 0,
        hsn: product.hsnCode || '',
        unit: product.salesUnit || product.baseUnit || '',
        primaryOpeningQty: 1,
        pUnit: product.baseUnit || product.purchaseUnit || '',
        secOpeningQty: 0,
        sUnit: product.salesUnit || '',
        brandName: "",
        color: variant?.color || product.colour || product.colorVariant || "",
        size: variant?.size || product.size || "",
        variantName: variant?.name || ""
      };
      setRows(newRows);
      
      if (settings?.quantityCalculator) {
        setTimeout(() => {
          setActiveQuantityRow(index);
          setIsQuantityCalcOpen(true);
        }, 100);
      }
    }
  };

  const updateRow = (index, field, value) => {
    if (settings?.negativeStockLock && ['qty', 'primaryOpeningQty', 'secOpeningQty'].includes(field)) {
      const productId = rows[index].productId;
      if (productId) {
        const product = products.find(p => p.id === parseInt(productId));
        if (product && Number(value) > (product.stock || 0)) {
          alert('Negative Stock Lock is enabled. Insufficient stock!');
          return;
        }
      }
    }

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
    
    // Slab Pricing Logic
    if (['qty', 'primaryOpeningQty', 'secOpeningQty'].includes(field) && newRows[index].productId) {
      const product = products.find(p => p.id === parseInt(newRows[index].productId));
      if (product) {
        const rate = product.conversionRate || 1;
        const priQty = settings?.primaryOpeningQty ? (Number(newRows[index].primaryOpeningQty) || 0) : 0;
        const secQty = settings?.secOpeningQty ? (Number(newRows[index].secOpeningQty) || 0) : 0;
        
        let slabCheckQty = 0;
        if (settings?.primaryOpeningQty && newRows[index].primaryOpeningQty !== undefined && newRows[index].primaryOpeningQty !== "") {
          slabCheckQty = Number(newRows[index].primaryOpeningQty) || 0;
        } else {
          slabCheckQty = Number(newRows[index].qty) || 0;
        }

        let slabPrice = null;
        let qtySlabs = [];
        try {
          if (typeof product.qtySlabs === 'string') qtySlabs = JSON.parse(product.qtySlabs);
          else if (Array.isArray(product.qtySlabs)) qtySlabs = product.qtySlabs;
        } catch(e) {}

        if (qtySlabs.length > 0) {
          for (const slab of qtySlabs) {
            const min = Number(slab.minQty) || 0;
            const max = Number(slab.maxQty) || Infinity;
            if (slabCheckQty >= min && slabCheckQty <= max && slab.price) {
              slabPrice = Number(slab.price);
              break;
            }
          }
        }

        if (slabPrice !== null) {
          newRows[index].price = slabPrice;
        } else {
          let pPrice = isWholesale ? (product.wholesalePrice || 0) : (product.price || 0);
          if (newRows[index].variantName) {
            let subItemsList = [];
            try {
              subItemsList = typeof product.subItems === 'string' ? JSON.parse(product.subItems) : (product.subItems || []);
            } catch (e) {}
            const variant = subItemsList.find(v => (v.name || [v.size, v.color].filter(Boolean).join(' - ')) === newRows[index].variantName);
            if (variant && variant.price > 0) pPrice = variant.price;
          }
          newRows[index].price = pPrice;
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
  const [manualDiscPercent, setManualDiscPercent] = useState("");
  const [showSummaryDiscDropdown, setShowSummaryDiscDropdown] = useState(false);
  const [manualDiscAmount, setManualDiscAmount] = useState("");
  const [manualFreightAmt, setManualFreightAmt] = useState("");
  const [manualFreightGst, setManualFreightGst] = useState("");
  const [manualTcsPercent, setManualTcsPercent] = useState("");
  const [manualTcsAmt, setManualTcsAmt] = useState("");

  // Calculation Logic
  let totalQty = 0;
  let baseAmount = 0;
  let totalRowDiscount = 0;
  let totalGstAmount = 0;
  let totalCgst = 0;
  let totalSgst = 0;
  let totalIgst = 0;

  const calculatedRows = rows.map(row => {
    let pPrice = Number(row.price) || 0;
    const pFree = Number(row.freeQty) || 0;
    
    // Find matching product to get conversion rate
    const product = products.find(p => p.id === parseInt(row.productId));
    const rate = product?.conversionRate || 1;

    const priQty = settings.primaryOpeningQty ? (Number(row.primaryOpeningQty) || 0) : 0;
    const secQty = settings.secOpeningQty ? (Number(row.secOpeningQty) || 0) : 0;
    
    let calcQty = Number(row.qty) || 0;
    const isPriEmpty = row.primaryOpeningQty === undefined || row.primaryOpeningQty === "";
    const isSecEmpty = row.secOpeningQty === undefined || row.secOpeningQty === "";

    let priceToUse = Number(row.price) || 0;
    const secondaryPrice = rate > 1 ? (priceToUse / rate) : priceToUse;

    const isSecondary = (u) => u && product && product.baseUnit && u !== product.baseUnit && rate > 1;

    if ((!settings.primaryOpeningQty || isPriEmpty) && (!settings.secOpeningQty || isSecEmpty)) {
      const q = Number(row.qty) || 0;
      const unit = row.unit || row.pUnit || product?.baseUnit;
      if (isSecondary(unit)) {
        calcQty = q;
        priceToUse = secondaryPrice;
      } else {
        if (product?.baseUnit && (product?.salesUnit || product?.purchaseUnit) && rate > 1) {
          calcQty = q * rate;
          priceToUse = secondaryPrice;
        } else {
          calcQty = q;
        }
      }
    } else {
      if (product?.baseUnit && (product?.salesUnit || product?.purchaseUnit) && rate > 1) {
        const priIsSec = isSecondary(row.pUnit);
        const secIsPri = row.sUnit === product?.baseUnit;

        const priInSecondaryUnits = priIsSec ? priQty : (priQty * rate);
        const secInSecondaryUnits = secIsPri ? (secQty * rate) : secQty;

        calcQty = priInSecondaryUnits + secInSecondaryUnits;
        priceToUse = secondaryPrice;
      } else {
        calcQty = settings.primaryOpeningQty ? priQty : secQty;
      }
    }

    const pQty = calcQty;
    pPrice = priceToUse;
    totalQty += pQty + pFree;
    
    const rowBaseAmount = pQty * pPrice;
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

    return { ...row, qty: pQty, displayUnit, amount, gstRate, gstAmount, cgst, sgst, igst };
  });

  const effectiveDiscPercent = baseAmount > 0 ? ((totalRowDiscount / baseAmount) * 100).toFixed(2) : 0;
  const appliedDiscAmount = manualDiscAmount !== "" ? Number(manualDiscAmount) : totalRowDiscount;
  const totalFreight = !settings?.hideFreightCharge ? ((parseFloat(manualFreightAmt) || 0) + (parseFloat(manualFreightAmt) || 0) * (parseFloat(manualFreightGst) || 0) / 100) : 0;
  
  const tempFinalAmount = Math.max(0, baseAmount - appliedDiscAmount) + totalFreight + (isTaxIncluded ? 0 : totalGstAmount);
  
  const appliedTcsPercent = parseFloat(manualTcsPercent) || 0;
  const calculatedTcsAmt = manualTcsAmt !== '' ? parseFloat(manualTcsAmt) : (tempFinalAmount * appliedTcsPercent) / 100;

  // Offer & Loyalty Calculations
  let offerDiscountAmount = 0;
  if (selectedOffer && settings?.showOffers) {
    let applicableItems = [];
    if (selectedOffer.target === 'ENTIRE CART') {
      applicableItems = calculatedRows.filter(r => r.productId && r.qty > 0);
    } else if (selectedOffer.target && selectedOffer.target.startsWith('CATEGORY: ')) {
      const cat = selectedOffer.target.replace('CATEGORY: ', '').trim().toLowerCase();
      applicableItems = calculatedRows.filter(r => r.productId && r.qty > 0 && products.find(p => p.id === Number(r.productId))?.category?.toLowerCase() === cat);
    } else if (selectedOffer.target && selectedOffer.target.startsWith('ITEM: ')) {
      const pName = selectedOffer.target.replace('ITEM: ', '').trim().toLowerCase();
      applicableItems = calculatedRows.filter(r => r.productId && r.qty > 0 && products.find(p => p.id === Number(r.productId))?.name?.toLowerCase() === pName);
    }
    const applicableTotal = applicableItems.reduce((acc, item) => acc + item.amount, 0);
    if (selectedOffer.type === 'FLAT' || selectedOffer.discountType === 'Flat') {
      offerDiscountAmount = Math.min(applicableTotal, parseFloat(selectedOffer.discountValue) || 0);
    } else if (selectedOffer.type === 'PERCENTAGE' || selectedOffer.discountType === 'Percentage') {
      offerDiscountAmount = applicableTotal * ((parseFloat(selectedOffer.discountValue) || 0) / 100);
    } else if (selectedOffer.type === 'BOGO' || selectedOffer.offerType === 'Buy 1 Get 1') {
      const buyQty = selectedOffer.buyQty || 1;
      const getQty = selectedOffer.getQty || 1;
      applicableItems.forEach(item => {
        const sets = Math.floor(item.qty / (buyQty + getQty));
        offerDiscountAmount += sets * getQty * item.price;
      });
    }
  }

  const totalEarnedPoints = calculatedRows.reduce((acc, item) => {
    const product = products.find(p => p.id === Number(item.productId));
    const creditPrice = product?.creditSalePrice || product?.price || item.price;
    return acc + (Number(creditPrice || 0) * (item.qty || 0));
  }, 0);

  const effectiveRedeemed = (settings?.showLoyaltyPoints ? redeemedPoints : 0) + (settings?.showLoyaltyPoints && useEarnedPoints ? totalEarnedPoints : 0);
  const finalCalculatedAmount = Math.max(0, tempFinalAmount + calculatedTcsAmt - offerDiscountAmount - effectiveRedeemed);
  const defaultColumnOrder = [
    'sno', 'productCode', 'brand', 'product', 'batch', 'qty', 'primaryOpeningQty', 'pUnit', 'secOpeningQty', 'sUnit', 
    'hsn', 'gst', 'freeQty', 'mrp', 
    'salePrice', 'wsPrice', 'price', 'disc1', 'disc2', 'imei', 'amount', 'action'
  ];

  const [columnOrder, setColumnOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('salesInvoice_colOrder');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return defaultColumnOrder;
  });

  const [draggedColId, setDraggedColId] = useState(null);
  const [dragOverColId, setDragOverColId] = useState(null);

  const handleDragStart = (e, colId) => {
    setDraggedColId(colId);
  };
  
  const handleDragOver = (e, colId) => {
    e.preventDefault();
    setDragOverColId(colId);
  };
  
  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    if (draggedColId && draggedColId !== targetColId) {
      setColumnOrder(prevOrder => {
        const draggedIdx = prevOrder.indexOf(draggedColId);
        const targetIdx = prevOrder.indexOf(targetColId);
        const newOrder = [...prevOrder];
        newOrder.splice(draggedIdx, 1);
        newOrder.splice(targetIdx, 0, draggedColId);
        localStorage.setItem('salesInvoice_colOrder', JSON.stringify(newOrder));
        return newOrder;
      });
    }
    setDraggedColId(null);
    setDragOverColId(null);
  };
  
  const colVisible = {
    sno: true, productCode: settings.showProductCode, brand: settings.showCompany, product: true,
    batch: settings.showBatchNo, qty: false,

    primaryOpeningQty: settings.primaryOpeningQty, pUnit: settings.pUnit, secOpeningQty: settings.secOpeningQty, sUnit: settings.sUnit,
    hsn: settings.showHSN, gst: settings.showGST, freeQty: settings.showFreeQty,
    mrp: settings.showMRP,
    salePrice: false,
    wsPrice: false, price: true,
    disc1: settings.showDiscount, disc2: settings.showDiscount2,
    imei: settings.showIMEI, amount: true, action: true
  };

  const colWidths = {
    sno: '40px', productCode: '90px', brand: '130px', product: 'minmax(200px, 1fr)', batch: '90px', qty: '80px',
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

  const handleSave = () => {
    if (paymentMode !== 'Cash' && !selectedCustomerId && !customerInput.trim()) return alert('Please select or enter a customer.');
    
    const validRows = calculatedRows.filter(r => r.productId && r.qty > 0);
    if (validRows.length === 0) return alert('Please add at least one valid product.');

    setIsPaymentStatusModalOpen(true);
  };

  const handleFinalSave = async (paymentDetails) => {
    if (isSaving) return;
    setIsSaving(true);
    const validRows = calculatedRows.filter(r => r.productId && r.qty > 0);

    const payload = {
      invoiceNo: `INV-${Date.now()}`,
      customerId: selectedCustomerId ? parseInt(selectedCustomerId) : customerInput.trim(),
      date: invoiceDate,
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
      items: validRows.map(r => ({
        productId: Number(r.productId),
        productCode: r.productCode,
        unit: r.displayUnit || r.unit,
        batchNo: r.batchNo,
        mfgDate: r.mfgDate,
        expDate: r.expDate,
        quantity: Number(r.qty) || 1,
        freeQty: Number(r.freeQty) || 0,
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
        imei: r.imei,
        ram: r.ram,
        storage: r.storage,
        color: r.color,
        amount: Number(r.amount) || 0,
        gstRate: Number(r.gstRate) || 0,
        gstAmount: Number(r.gstAmount) || 0,
        cgst: Number(r.cgst) || 0,
        sgst: Number(r.sgst) || 0,
        igst: Number(r.igst) || 0
      })),
      offerId: selectedOffer ? selectedOffer.id : null,
      redeemedPoints: effectiveRedeemed,
      loyaltyDiscountValue: offerDiscountAmount + effectiveRedeemed,
      paymentDetails: paymentDetails?.paymentRows || paymentDetails || [],
      salesPerson: paymentDetails?.salesPerson || '',
      commission: paymentDetails?.commission || ''
    };

    try {
      let type = 'sales';
      if (isQuotation) type = 'quotation';
      else if (isReturn) type = 'sales_return';
      else if (isCustomerChallan) type = 'challan';

      const response = await createTransaction(type, payload);
      if (response.data && response.data.invoiceNo) {
        setSavedInvoiceNo(response.data.invoiceNo);
      }
      
      if (activeHoldId) {
         try { await deleteTransaction(activeHoldId); } catch(e) { console.error("Error deleting hold after save", e); }
         setActiveHoldId(null);
      }
      
      // Add Audit Log (awaiting so it doesn't get cancelled on navigation)
      await addLog({
        userName: 'Admin User', // Hardcoded for now, would come from auth context
        userRole: 'Admin',
        actionType: 'Create',
        billNumber: payload.invoiceNo,
        moduleName: pageTitle,
        previousData: null,
        updatedData: payload,
        ipAddress: '127.0.0.1' // Ideally captured in backend, passing dummy for now
      });

      setIsPaymentStatusModalOpen(false);
      setShowBarcodePrintModal(true);
      
    } catch (error) {
      console.error(error);
      alert('Failed to save invoice.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleHoldInvoice = async (note) => {
    if (paymentMode !== 'Cash' && !selectedCustomerId && !customerInput.trim()) return alert('Please select or enter a customer before holding.');
    
    const validRows = calculatedRows.filter(r => r.productId && r.qty > 0);
    if (validRows.length === 0) return alert('Please add at least one valid product.');

    const payload = {
      invoiceNo: `INV-${Date.now()}`,
      customerId: selectedCustomerId ? parseInt(selectedCustomerId) : customerInput.trim(),
      date: invoiceDate,
      paymentMode,
      remark: note || remark,
      status: "HOLD",
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
        productId: Number(r.productId),
        quantity: Number(r.qty) || 1,
        freeQty: Number(r.freeQty) || 0,
        primaryOpeningQty: Number(r.primaryOpeningQty) || 0,
        secOpeningQty: Number(r.secOpeningQty) || 0,
        price: Number(r.price) || 0,
        discount1: Number(r.disc1Type === '%' ? (r.price * r.qty * (Number(r.disc1) || 0) / 100) : r.disc1) || 0,
        discount2: Number(r.disc2Type === '%' ? (Math.max(0, (r.price * r.qty) - (r.disc1Type === '%' ? (r.price * r.qty * (Number(r.disc1) || 0) / 100) : Number(r.disc1) || 0))) * (Number(r.disc2) || 0) / 100 : r.disc2) || 0,
        imei: r.imei,
        ram: r.ram,
        storage: r.storage,
        color: r.color,
        amount: Number(r.amount) || 0,
        gstRate: Number(r.gstRate) || 0,
        gstAmount: Number(r.gstAmount) || 0,
        cgst: Number(r.cgst) || 0,
        sgst: Number(r.sgst) || 0,
        igst: Number(r.igst) || 0
      })),
      offerId: selectedOffer ? selectedOffer.id : null,
      redeemedPoints: effectiveRedeemed,
      loyaltyDiscountValue: offerDiscountAmount + effectiveRedeemed
    };

    try {
      let type = 'sales';
      if (isQuotation) type = 'quotation';
      else if (isReturn) type = 'sales_return';
      else if (isCustomerChallan) type = 'challan';

      const response = await createTransaction(type, payload);
      const transactionId = response.data?.id;
      const custName = customers.find(c => c.id === parseInt(selectedCustomerId))?.name || customerInput.split('-')[0].trim();
      setHoldSuccessMsgs(prev => [...prev, { id: transactionId, msg: `Hold: ${custName || 'Customer'}` }]);
      
      if (activeHoldId) {
         try { await deleteTransaction(activeHoldId); } catch(e) { console.error("Error deleting old hold", e); }
      }
      setActiveHoldId(null);
      
      // Reset form to start a new invoice
      setRows([createEmptyRow()]);
      setSelectedCustomerId("");
      setRemark("");
      setManualDiscPercent("");
      setManualDiscAmount("");
      setManualFreightAmt("");
      setManualFreightGst("");
      setManualTcsPercent("");
      setManualTcsAmt("");
      
    } catch (error) {
      console.error(error);
      alert('Failed to hold invoice.');
    }
  };

  const handleEditRow = () => {
    addLog({
      userName: 'Admin User',
      userRole: 'Admin',
      actionType: 'Edit',
      billNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      moduleName: pageTitle,
      previousData: { qty: 10, price: 1000, finalAmount: 10000 },
      updatedData: { qty: 0, price: 0, finalAmount: 0 },
      ipAddress: '192.168.1.5'
    });
    alert('Row edit logged!');
  };

  const handleDeleteRow = () => {
    addLog({
      userName: 'Admin User',
      userRole: 'Admin',
      actionType: 'Delete',
      billNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      moduleName: pageTitle,
      previousData: { qty: 0, price: 0, finalAmount: 0 },
      updatedData: null,
      ipAddress: '192.168.1.5'
    });
    alert('Row delete logged!');
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col relative pb-12 w-full overflow-x-hidden">
      <div className="bg-white m-3 mt-0 shadow-sm border border-gray-200 flex-1 flex flex-col min-w-0 rounded-[3px]">
        
        {/* Top Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between px-3 py-1.5">
          <h2 className="text-white font-medium text-[15px]">{pageTitle}</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div 
              className="flex flex-wrap items-center gap-1.5 cursor-pointer" 
              onClick={() => setIsWholesale(!isWholesale)}
            >
              <span className={`text-[13px] font-bold ${!isWholesale ? 'text-white' : 'text-gray-300'}`}>Retail</span>
              <div className={`w-[32px] h-[18px] rounded-full relative border transition-colors ${isWholesale ? 'bg-[#117a8b] border-[#148ea1]' : 'bg-gray-400 border-gray-500'}`}>
                <div className={`w-[14px] h-[14px] rounded-full absolute top-[1px] transition-all bg-white shadow-sm ${isWholesale ? 'right-[1px]' : 'left-[1px]'}`}></div>
              </div>
              <span className={`text-[13px] font-bold ${isWholesale ? 'text-white' : 'text-gray-300'}`}>Wholesale</span>
            </div>

            <div className="w-[1px] h-5 bg-indigo-400 mx-1"></div>

            <div 
              className="flex flex-wrap items-center gap-1.5 cursor-pointer" 
              onClick={() => setPaymentMode(paymentMode === 'Cash' ? 'Credit' : 'Cash')}
            >
              <span className={`text-[13px] font-bold ${paymentMode === 'Credit' ? 'text-white' : 'text-gray-300'}`}>Credit</span>
              <div className={`w-[32px] h-[18px] rounded-full relative border transition-colors ${paymentMode === 'Cash' ? 'bg-[#117a8b] border-[#148ea1]' : 'bg-gray-400 border-gray-500'}`}>
                <div className={`w-[14px] h-[14px] rounded-full absolute top-[1px] transition-all bg-white shadow-sm ${paymentMode === 'Cash' ? 'right-[1px]' : 'left-[1px]'}`}></div>
              </div>
              <span className={`text-[13px] font-bold ${paymentMode === 'Cash' ? 'text-white' : 'text-gray-300'}`}>Cash</span>
            </div>
            
            <button className="bg-white p-1 rounded-sm shadow-sm">
              <YoutubeIcon className="w-4 h-4 text-[#ff0000]" />
            </button>
            <button className="bg-[#ffc107] p-1 rounded-sm shadow-sm">
              <RefreshCw className="w-4 h-4 text-white" strokeWidth={3} />
            </button>
            <button 
              onClick={() => navigate(-1)}
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
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-[13px] font-bold text-gray-800">Customer Name {paymentMode === 'Cash' && <span className="text-gray-500 font-normal">(Optional)</span>}</label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {holdSuccessMsgs.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-[3px] border border-green-200">
                      <span className="text-[12px] font-bold cursor-pointer hover:underline" onClick={() => { if(item.id) loadHeldInvoice(item.id); }}>{item.msg}</span>
                      <button onClick={(e) => { e.preventDefault(); setHoldSuccessMsgs(prev => prev.filter((_, i) => i !== idx)); }} className="hover:text-green-900 transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <span 
                className="text-[13px] font-bold text-[#dc3545] invisible md:visible absolute md:static left-1/2 -translate-x-1/2 top-4 cursor-pointer hover:underline"
                onClick={() => {
                  const customer = customers.find(c => String(c.id) === String(selectedCustomerId));
                  if (customer) {
                    navigate('/admin/party-ledger/customer_payment', { state: { customer } });
                  }
                }}
                title="Click to view Customer Ledger"
              >
                Due Amount : {customerStats ? formatAmount(customerStats.dueAmount) : formatAmount(0)}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 flex items-center h-[32px]">
                <CustomerSelectDropdown
                  customers={customers}
                  value={selectedCustomerId}
                  customValue={customerInput}
                  onChange={(val) => {
                    setSelectedCustomerId(val);
                    if (val) {
                      const c = customers.find(x => String(x.id) === String(val));
                      if (c) setCustomerInput(c.name);
                    } else {
                      setCustomerInput('');
                    }
                  }}
                  onCustomChange={(val) => {
                    setCustomerInput(val);
                    setSelectedCustomerId('');
                  }}
                  onEdit={(c) => {
                    setEditingCustomer(c);
                    setIsCustomerModalOpen(true);
                  }}
                  onDelete={(id) => {
                    const c = customers.find(x => x.id === id);
                    if (c) handleDeleteCustomer(id, c.name);
                  }}
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
                   disabled
                   placeholder="(AUTO GENRATED)"
                   className="w-full min-w-0 border border-gray-300 border-r-0 rounded-l-[3px] px-3 py-1 text-[13px] bg-white text-gray-400"
                 />
                 <button className="bg-[#4F46E5] text-white px-3 py-1 border border-[#4F46E5] rounded-r-[3px]">
                   <Search className="w-4 h-4" />
                 </button>
               </div>
             </div>
             <div className="flex items-center justify-end w-full sm:max-w-[320px]">
               <label className="text-[13px] font-bold text-gray-800 w-[80px] text-right mr-2">Date :</label>
               <div className="flex-1 flex items-center relative">
                 <input 
                   ref={dateInputRef}
                   type="date"
                   value={invoiceDate}
                   onChange={(e) => setInvoiceDate(e.target.value)}
                   className="absolute w-0 h-0 opacity-0 -z-10"
                 />
                 <input 
                   type="text" 
                   readOnly
                   value={formatDisplayDate(invoiceDate)}
                   className="w-full min-w-0 border border-gray-300 border-r-0 rounded-l-[3px] px-3 py-1 text-[13px] bg-white text-gray-600 outline-none"
                 />
                 <button 
                   onClick={() => {
                     try {
                       dateInputRef.current?.showPicker();
                     } catch (e) {
                       dateInputRef.current?.focus();
                     }
                   }}
                   className="min-w-0 border border-gray-300 border-l-0 px-2 py-1 rounded-r-[3px] bg-white text-gray-500 hover:bg-gray-50 transition-colors"
                 >
                   <Calendar className="w-4 h-4" />
                 </button>
               </div>
             </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 min-h-[300px] overflow-x-auto">
          <div style={{ minWidth: `max(100%, ${Math.max(1000, minGridWidth)}px)` }} className="w-fit">
            {/* Table Header: Dynamic Columns */}
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

            <datalist id="brand-options">
              {[...new Set(products.map(p => p.brand).filter(Boolean))].map((brand, i) => (
                <option key={i} value={brand} />
              ))}
            </datalist>

            {/* Input Rows */}
            {calculatedRows.map((row, idx) => (
              <div key={idx} style={{ gridTemplateColumns }} className="grid bg-white border-b border-gray-200">
                {columnOrder.map(colId => {
                  if (!colVisible[colId]) return null;
                  switch (colId) {
                    case 'sno': return (
                      <div key={colId} className="border-r border-gray-200 flex items-center justify-center p-1 bg-gray-600 text-white font-bold text-[12px]">
                        {idx + 1}
                      </div>
                    );
                    case 'productCode': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex">
                        <input type="text" value={row.productCode} onChange={(e) => updateRow(idx, 'productCode', e.target.value)} placeholder="Code" className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none" />
                      </div>
                    );
                    case 'brand': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex relative items-center">
                        <input 
                          list="brand-options" 
                          type="text" 
                          value={row.brandName || ''} 
                          onChange={(e) => updateRow(idx, 'brandName', e.target.value)} 
                          placeholder="Enter Brand Name" 
                          className="w-full h-full border border-gray-200 rounded-[3px] pl-1 pr-6 text-[12px] outline-none" 
                        />
                        {row.brandName && (
                          <button
                            type="button"
                            onClick={() => updateRow(idx, 'brandName', '')}
                            className="absolute right-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            title="Clear Brand"
                          >
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
                            selectedVariant={{ name: row.variantName }}
                            onChange={(val, variant) => handleProductSelect(idx, val, variant)}
                            onEdit={(product) => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            onDelete={(productId) => handleDeleteProduct(productId)}
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
                            type="text" 
                            value={row.batchNo} 
                            onChange={(e) => updateRow(idx, 'batchNo', e.target.value)}
                            onClick={() => setActiveBatchDropdownRow(idx)}
                            onBlur={() => setTimeout(() => setActiveBatchDropdownRow(null), 200)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                setActiveBatchDropdownRow(null);
                                setTempBatchData({ batchNo: row.batchNo || '', expDate: row.expDate || '', mfgDate: row.mfgDate || '' });
                                setActiveBatchRow(idx);
                                setIsBatchModalOpen(true);
                              }
                            }}
                            placeholder="Batch No" 
                            className="w-full h-full bg-transparent text-[12px] outline-none text-gray-800 font-bold" 
                          />
                          <ChevronDown size={14} className="text-gray-400 cursor-pointer" onClick={() => setActiveBatchDropdownRow(idx === activeBatchDropdownRow ? null : idx)} />
                        </div>
                        
                        {activeBatchDropdownRow === idx && row.batchNo && (
                          <div className="absolute top-[calc(100%-4px)] left-1 min-w-[180px] bg-[#b8e2f2] shadow-md z-[60] border-t border-white rounded-b-[3px]">
                            <div 
                              className="p-1.5 flex justify-center items-center hover:bg-[#a5d7ea] transition-colors cursor-pointer"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setActiveBatchDropdownRow(null);
                                setActiveBatchRow(idx);
                                setTempBatchData({ batchNo: row.batchNo || '', expDate: row.expDate || '', mfgDate: row.mfgDate || '' });
                                setIsBatchModalOpen(true);
                              }}
                            >
                              <span className="font-bold text-[#007bff] text-[14px]">Add item "{row.batchNo}"</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                    case 'qty': return (
                      <div key={colId} className="border-r border-gray-200 p-1">
                         <input type="number" placeholder="0" value={row.qty || ''} onChange={(e) => updateRow(idx, 'qty', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
                      </div>
                    );
                    case 'primaryOpeningQty': return (
                      <div key={colId} className="border-r border-gray-200 p-1">
                         <input type="number" placeholder="0" value={row.primaryOpeningQty || ''} onChange={(e) => updateRow(idx, 'primaryOpeningQty', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
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
                          {!row.productId && (units || []).map((u, i) => <option key={i} value={u}>{u}</option>)}
                        </select>
                      </div>
                    );
                    case 'secOpeningQty': return (
                      <div key={colId} className="border-r border-gray-200 p-1">
                         <input type="number" placeholder="0" value={row.secOpeningQty || ''} onChange={(e) => updateRow(idx, 'secOpeningQty', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
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
                          {!row.productId && (units || []).map((u, i) => <option key={i} value={u}>{u}</option>)}
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
                        <select 
                          value={row.taxRate}
                          onChange={(e) => updateRow(idx, 'taxRate', Number(e.target.value))}
                          className="w-full h-full border border-gray-200 rounded-[3px] px-0 text-[12px] outline-none text-center"
                        >
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
                         <input 
                           type="number" 
                           value={row.freeQty}
                           onChange={(e) => updateRow(idx, 'freeQty', Number(e.target.value))}
                           className="w-full h-full border border-yellow-300 bg-yellow-50 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold text-yellow-800" 
                         />
                      </div>
                    );
                    case 'mrp': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex flex-col justify-center bg-gray-50 text-[13px] font-bold text-gray-500">
                        <input type="number" value={row.mrp} onChange={(e) => updateRow(idx, 'mrp', Number(e.target.value))} className="w-full h-full border-none bg-transparent px-1 text-[12px] outline-none text-right font-bold text-gray-600" />
                      </div>
                    );
                    case 'price': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex flex-col justify-center relative group">
                        <input 
                          type="number" 
                          value={row.price}
                          onChange={(e) => updateRow(idx, 'price', Number(e.target.value))}
                          className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-right font-bold transition-colors bg-blue-50 border-blue-200" 
                        />
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
                          <input 
                            type="text"
                            placeholder="IMEI..."
                            value={row.imei || ''}
                            onChange={(e) => updateRow(idx, 'imei', e.target.value)}
                            className="w-full border border-purple-200 bg-purple-50 rounded-[3px] px-1 py-0.5 text-[10px] outline-none text-purple-800 font-bold"
                          />
                          <input 
                            type="text"
                            placeholder="RAM..."
                            value={row.ram || ''}
                            onChange={(e) => updateRow(idx, 'ram', e.target.value)}
                            className="w-full border border-gray-200 bg-white rounded-[3px] px-1 py-0.5 text-[10px] outline-none text-gray-800"
                          />
                          <input 
                            type="text"
                            placeholder="Storage..."
                            value={row.storage || ''}
                            onChange={(e) => updateRow(idx, 'storage', e.target.value)}
                            className="w-full border border-gray-200 bg-white rounded-[3px] px-1 py-0.5 text-[10px] outline-none text-gray-800"
                          />
                          <input 
                            type="text"
                            placeholder="Color..."
                            value={row.color || ''}
                            onChange={(e) => updateRow(idx, 'color', e.target.value)}
                            className="w-full border border-gray-200 bg-white rounded-[3px] px-1 py-0.5 text-[10px] outline-none text-gray-800"
                          />
                      </div>
                    );
                    case 'amount': return (
                      <div key={colId} className="border-r border-gray-200 p-1 flex items-center justify-end pr-2 text-[13px] font-bold text-gray-800 bg-gray-50">
                        {row.amount.toFixed(2)}
                      </div>
                    );
                    case 'action': return (
                      <div key={colId} className="bg-[#343a40] flex items-center justify-center gap-2 p-1">
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
          {/* Left Side (Totals, Remark, Terms) */}
          <div className="flex flex-col gap-4">
            
            <div className="summary-stats grid grid-cols-4 gap-2">
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">Total Qty (Inc. Free)</span>
                <span className="text-[14px] font-bold text-[#007bff]">{totalQty}</span>
              </div>
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">Taxable</span>
                <span className="text-[14px] font-bold text-[#28a745]">{formatAmount(finalCalculatedAmount - totalGstAmount)}</span>
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
              <textarea 
                placeholder="Remark..." 
                className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5] resize-none h-[40px] text-gray-400"
              />
            </div>



          </div>

          {/* Right Side (Summary Calculations) */}
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between">
               <span className="text-[13px] font-bold text-gray-800">Subtotal:</span>
               <div className="w-[200px] bg-[#e9ecef] min-w-0 border border-gray-300 rounded-[3px] px-3 py-1 text-[13px] text-gray-800 font-bold text-right">
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
                         value={manualDiscPercent !== "" ? manualDiscPercent : effectiveDiscPercent} 
                         onChange={(e) => setManualDiscPercent(e.target.value)} 
                         onFocus={() => setShowSummaryDiscDropdown(true)}
                         onBlur={() => setTimeout(() => setShowSummaryDiscDropdown(false), 200)}
                         className="w-full min-w-0 border border-gray-300 rounded-[3px] py-1 pl-2 pr-6 text-[13px] outline-none bg-white text-right text-blue-700 font-bold" 
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
                     <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Dis. Amount</span>
                     <input type="number" value={manualDiscAmount !== "" ? manualDiscAmount : totalRowDiscount.toFixed(2)} onChange={(e) => setManualDiscAmount(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right text-blue-700 font-bold" />
                   </div>
                 </div>
               </div>
             )}

              {!settings?.hideFreightCharge && (
                <div className="flex justify-between items-start">
                  <span className="text-[13px] font-bold text-gray-800 mt-3">Fright Charges:</span>
                  <div className="w-[200px] flex gap-2">
                    <div className="flex-1 relative mt-[18px]">
                      <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Amount</span>
                      <div className="flex h-full">
                        <input type="number" value={manualFreightAmt !== "" ? manualFreightAmt : "0"} onChange={(e) => setManualFreightAmt(e.target.value)} className="w-full min-w-0 border border-gray-300 border-r-0 rounded-l-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right" />
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

             {/* Offers Section */}
             {settings?.showOffers && activeOffers.length > 0 && (
               <div className="flex justify-between items-center mt-1">
                 <span className="text-[13px] font-bold text-gray-800">Offer:</span>
                 <div className="w-[200px] flex flex-col gap-1">
                   <select
                     value={selectedOffer ? String(selectedOffer.id) : ''}
                     onChange={(e) => {
                       const found = activeOffers.find(o => String(o.id) === e.target.value);
                       setSelectedOffer(found || null);
                     }}
                     className="w-full min-w-0 border border-purple-300 bg-purple-50 rounded-[3px] px-2 py-1 text-[12px] outline-none text-purple-800 font-bold"
                   >
                     <option value="">-- Select Offer --</option>
                     {activeOffers.map(o => (
                       <option key={o.id} value={String(o.id)}>{o.name || o.title || `Offer #${o.id}`}</option>
                     ))}
                   </select>
                   {selectedOffer && offerDiscountAmount > 0 && (
                     <div className="text-[11px] text-purple-700 font-bold text-right">
                       Offer Discount: -{formatAmount(offerDiscountAmount)}
                     </div>
                   )}
                 </div>
               </div>
             )}

             {/* Loyalty Points Section */}
             {settings?.showLoyaltyPoints && selectedCustomerId && (
               <div className="flex justify-between items-start mt-1">
                 <span className="text-[13px] font-bold text-gray-800">Loyalty Points:</span>
                 <div className="w-[200px] flex flex-col gap-1.5">
                   <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-[3px] px-2 py-1">
                     <span className="text-[11px] text-amber-700 font-bold">Available:</span>
                     <span className="text-[13px] text-amber-800 font-bold">{customerPoints} pts</span>
                   </div>
                   <div className="flex items-center gap-1">
                     <span className="text-[11px] font-bold text-gray-600 whitespace-nowrap">Redeem:</span>
                     <input
                       type="number"
                       value={redeemedPoints || ''}
                       onChange={(e) => {
                         const val = Math.max(0, Math.min(customerPoints, Number(e.target.value) || 0));
                         setRedeemedPoints(val);
                       }}
                       placeholder="0"
                       className="flex-1 min-w-0 border border-amber-300 bg-amber-50 rounded-[3px] px-2 py-1 text-[12px] outline-none text-right text-amber-800 font-bold"
                     />
                   </div>
                   <label className="flex items-center gap-1.5 cursor-pointer">
                     <input
                       type="checkbox"
                       checked={useEarnedPoints}
                       onChange={(e) => setUseEarnedPoints(e.target.checked)}
                       className="w-3.5 h-3.5 accent-amber-500"
                     />
                     <span className="text-[11px] text-gray-700 font-medium">Use earned pts ({totalEarnedPoints.toFixed(0)})</span>
                   </label>
                   {effectiveRedeemed > 0 && (
                     <div className="text-[11px] text-amber-700 font-bold text-right">
                       Points Disc: -{formatAmount(effectiveRedeemed)}
                     </div>
                   )}
                 </div>
               </div>
             )}

             <div className="flex items-center justify-between mt-1">
               <span className="text-[13px] font-bold text-gray-800">Final Amount:</span>
               <div className="w-[200px] bg-[#e9ecef] min-w-0 border border-[#28a745] rounded-[3px] px-3 py-1 text-[14px] text-[#28a745] font-bold text-right shadow-sm">
                 {formatAmount(finalCalculatedAmount)}
               </div>
             </div>
          </div>

        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-[#343a40] z-40 px-2 sm:px-4 py-2 invoice-bottom-bar shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex flex-wrap items-center gap-1 text-[12px] font-bold">
          <span className="text-white">Last Invoice Total:</span>
          <span className="text-[#ffc107]">{formatAmount(0)}</span>
        </div>
        
        <div className="flex items-center justify-center gap-1.5 flex-1 max-w-[400px] mx-auto flex-wrap">
          <button onClick={handleSave} className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] transition-colors">
            <Check className="w-4 h-4" strokeWidth={3} />
            Save
          </button>
          
          <div className="flex items-center relative">
            <button 
              type="button"
              onClick={() => setIsConvertMenuOpen(!isConvertMenuOpen)}
              className="flex items-center gap-1 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1.5 rounded-l-[3px] text-[13px] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={3} />
              Convert Type
            </button>
            <button 
              type="button"
              onClick={() => setIsConvertMenuOpen(!isConvertMenuOpen)}
              className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-2 py-1.5 rounded-r-[3px] border-l border-[#d39e00] transition-colors"
            >
              <ChevronDown className="w-4 h-4" strokeWidth={3} />
            </button>
            {isConvertMenuOpen && (
              <div className="absolute bottom-full left-0 mb-1 w-[160px] bg-white border border-gray-200 shadow-lg rounded-[3px] py-1 z-50">
                <button type="button" onClick={() => { setIsConvertMenuOpen(false); navigate('/create_invoices/quotation-invoice'); }} className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-gray-100 text-gray-700">Quotation</button>
                <button type="button" onClick={() => { setIsConvertMenuOpen(false); navigate('/create_invoices/sales-order-invoice'); }} className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-gray-100 text-gray-700">Sales Order</button>
                <button type="button" onClick={() => { setIsConvertMenuOpen(false); navigate('/create_invoices/sales-return-invoice'); }} className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-gray-100 text-gray-700">Sales Return</button>
                <button type="button" onClick={() => { setIsConvertMenuOpen(false); navigate('/create_invoices/customer-challan-creation'); }} className="w-full text-left px-3 py-1.5 text-[13px] hover:bg-gray-100 text-gray-700">Customer Challan</button>
              </div>
            )}
          </div>

          <button 
            type="button"
            onClick={() => {
              if (searchInvoiceNo) {
                window.open(`/bill/${searchInvoiceNo}`, '_blank');
              } else {
                alert('Please save the invoice first to print it.');
              }
            }}
            className="flex items-center gap-1 bg-[#4F46E5] hover:bg-[#4338ca] text-white px-3 py-1.5 rounded-[3px] text-[13px] transition-colors"
          >
            <Printer className="w-4 h-4" strokeWidth={3} />
            Print
          </button>

          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 bg-[#dc3545] hover:bg-[#c82333] text-white px-3 py-1.5 rounded-[3px] text-[13px] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={3} />
            Close
          </button>
        </div>

        <button className="flex items-center gap-2 bg-[#23272b] hover:bg-[#1d2124] text-white px-3 py-1.5 rounded-[3px] text-[12px] border border-gray-600 transition-colors invisible sm:visible">
          <Grip className="w-4 h-4" />
          Shortcut keys
          <ChevronDown className="w-3.5 h-3.5 ml-1" strokeWidth={3} />
        </button>
      </div>

      <datalist id="disc-options">
        <option value="5" />
        <option value="12" />
        <option value="18" />
        <option value="28" />
      </datalist>

      {/* Modals */}
      <PartyMasterModal
        isOpen={isCustomerModalOpen}
        onClose={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }}
        editData={editingCustomer}
        onSave={handleSaveCustomer}
        defaultType="CUSTOMER"
      />
      <ImportInvoiceAIModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
      
      <PaymentStatusModal 
        isOpen={isPaymentStatusModalOpen}
        onClose={() => setIsPaymentStatusModalOpen(false)}
        dueAmount={finalCalculatedAmount}
        isSales={true}
        salesPersons={customers}
        onSaveSuccess={(paymentDetails) => {
          setIsPaymentStatusModalOpen(false);
          handleFinalSave(paymentDetails);
        }}
      />
      
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
        products={products}
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
                        alert("Manufacturing Date is mandatory.");
                        return;
                      }
                      if (batchSettings.showExpiry && !tempBatchData.expDate) {
                        alert("Expiry Date is mandatory.");
                        return;
                      }
                      if (batchSettings.showMfg && batchSettings.showExpiry) {
                        if (new Date(tempBatchData.expDate) < new Date(tempBatchData.mfgDate)) {
                          alert("Expiry Date must not be earlier than Manufacturing Date.");
                          return;
                        }
                      }

                      if (activeBatchRow !== null) {
                        const newRows = [...rows];
                        newRows[activeBatchRow].batchNo = tempBatchData.batchNo;
                        newRows[activeBatchRow].expDate = tempBatchData.expDate;
                        newRows[activeBatchRow].mfgDate = tempBatchData.mfgDate;
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
             isGstInclusive: rows[activeQuantityRow]?.isGstInclusive,
          }}
          onSave={(calcData) => {
             const newRows = [...rows];
             newRows[activeQuantityRow] = {
               ...newRows[activeQuantityRow],
               rollQty: calcData.rollQty,
               meterPerRoll: calcData.meterPerRoll,
               qty: calcData.qty,
               primaryOpeningQty: calcData.qty,
               secOpeningQty: 0,
               price: calcData.price,
               disc1: calcData.disc1,
               taxRate: calcData.taxRate,
               isGstInclusive: calcData.isGstInclusive,
             };
             setRows(newRows);
             setIsQuantityCalcOpen(false);
             setActiveQuantityRow(null);
          }}
        />
      )}

      {showBarcodePrintModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[5px] shadow-2xl w-full max-w-[420px] overflow-hidden flex flex-col p-8 text-center animate-in zoom-in-95 duration-200">
            <div className="mx-auto w-[80px] h-[80px] border-[3px] border-[#87adbd] rounded-full flex items-center justify-center mb-6">
              <span className="text-[#87adbd] text-[40px] font-medium leading-none">?</span>
            </div>
            <h2 className="text-[24px] font-bold text-[#545454] mb-8 leading-tight">
              Do you want to print the Invoice<br/>now?
            </h2>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => {
                  setShowBarcodePrintModal(false);
                  if (savedInvoiceNo) {
                    window.open(`/bill/${savedInvoiceNo}`, '_blank');
                  }
                }}
                className="bg-[#3085d6] hover:bg-[#2874ba] text-white px-5 py-2.5 rounded-[4px] text-[15px] font-medium transition-colors"
              >
                Yes, Print it!
              </button>
              <button 
                onClick={() => {
                  setShowBarcodePrintModal(false);
                }}
                className="bg-[#d33] hover:bg-[#b02a2a] text-white px-5 py-2.5 rounded-[4px] text-[15px] font-medium transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
