import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  X, 
  Search, 
  Calendar, 
  DownloadCloud, 
  RefreshCw,
  PlusSquare,
  Edit,
  Check,
  Printer,
  ChevronDown,
  PlusCircle,
  Grip,
  PauseCircle,
  Plus,
  Trash2,
  Filter,
  Settings,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '../utils';
import { ImportInvoiceAIModal } from '../components/ImportInvoiceAIModal';
import { ProductSelectDropdown } from '../components/ProductSelectDropdown';
import { ItemMasterModal } from '../components/ItemMasterModal';
import { PaymentStatusModal } from '../components/PaymentStatusModal';
import { SupplierSelectDropdown } from '../components/SupplierSelectDropdown';
import { PartyMasterModal } from '../components/PartyMasterModal';
import { useSettings } from '../context/SettingsContext';
import { TextileQuantityCalculatorModal } from '../components/TextileQuantityCalculatorModal';

// Inline Youtube SVG to avoid lucide-react export issues
const YoutubeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
  </svg>
);

export function PurchaseOrder() {
  const { settings, formatAmount } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  
  const pageTitle = 'Purchase Order';

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [isTaxIncluded, setIsTaxIncluded] = useState(false); // Default to false since UI showed EXCLUDED previously
  const [paymentMode, setPaymentMode] = useState('Credit');
  const [showConvertDropdown, setShowConvertDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState('Today');
  const [customerStats, setCustomerStats] = useState(null);
  const [manualDiscPercent, setManualDiscPercent] = useState('');
  const [manualDiscAmount, setManualDiscAmount] = useState('');
  const [manualFreightAmt, setManualFreightAmt] = useState('');
  const [manualFreightGst, setManualFreightGst] = useState('');
  const [manualTcsPercent, setManualTcsPercent] = useState('');
  const [manualTcsAmount, setManualTcsAmount] = useState('');
  const [showSummaryDiscDropdown, setShowSummaryDiscDropdown] = useState(false);
  const [isQuantityCalcOpen, setIsQuantityCalcOpen] = useState(false);
  const [activeQuantityRow, setActiveQuantityRow] = useState(null);
  const [showBarcodePrintModal, setShowBarcodePrintModal] = useState(false);

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
    } else {
      setCustomerStats(null);
    }
  }, [selectedCustomerId]);

  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editInvoiceId, setEditInvoiceId] = useState(null);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchCustomers(), fetchProducts()]);
      const params = new URLSearchParams(location.search);
      const invoiceId = params.get('id');
      if (invoiceId) {
        setEditInvoiceId(invoiceId);
        try {
          const invRes = await apiClient.get(`/inventory/single/${invoiceId}`);
          if (invRes.data?.success) {
            const inv = invRes.data.data;
            setSearchInvoiceNo(inv.invoiceNo);
            setInvoiceDate(new Date(inv.date).toISOString().split('T')[0]);
            if (inv.customerId) setSelectedCustomerId(inv.customerId);
            setPaymentMode(inv.paymentMode);
            
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
                freeQty: item.freeQty || 0,
                primaryOpeningQty: item.primaryOpeningQty !== null && item.primaryOpeningQty !== undefined ? item.primaryOpeningQty : 0,
                secOpeningQty: item.secOpeningQty !== null && item.secOpeningQty !== undefined ? item.secOpeningQty : 0,
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
        } catch (error) {
          console.error("Failed to load invoice", error);
        }
      }
    };
    init();
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
      const res = await apiClient.get('/customers?type=COMPANY');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await apiClient.delete(`/customers/${supplierId}`);
      if (selectedCustomerId === supplierId) {
        setSelectedCustomerId("");
      }
      fetchCustomers();
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
           setSelectedCustomerId(res.data.data.id);
        }
      }
      setIsSupplierModalOpen(false);
      setEditingSupplier(null);
      fetchCustomers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save supplier.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await apiClient.delete(`/products/${productId}`);
      if (selectedProductId === productId) {
        setSelectedProductId("");
      }
      fetchProducts();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete product.");
    }
  };

  function getCalculatedQty() {
    const product = products.find(p => p.id === parseInt(selectedProductId));
    const rate = product?.conversionRate || 1;
    const priQty = settings?.primaryOpeningQty ? (Number(primaryOpeningQty) || 0) : 0;
    const secQty = settings?.secOpeningQty ? (Number(secOpeningQty) || 0) : 0;
    const isPriEmpty = primaryOpeningQty === undefined || primaryOpeningQty === "";
    const isSecEmpty = secOpeningQty === undefined || secOpeningQty === "";

    if ((!settings?.primaryOpeningQty || isPriEmpty) && (!settings?.secOpeningQty || isSecEmpty)) {
      return Number(qty) || 0;
    } else {
      if (product?.baseUnit && product?.salesUnit && rate > 1) {
        return priQty * rate + secQty;
      } else {
        return settings?.primaryOpeningQty ? priQty : secQty;
      }
    }
  }



  const handleSave = async () => {
    if (!selectedCustomerId) return alert('Please select a supplier/customer before saving.');

    const validItems = rows
      .filter(r => r.productId && calculateRowAmount(r).calcQty > 0);

    if (validItems.length === 0) return alert('Please select a product and enter valid quantity.');

    setIsPaymentStatusModalOpen(true);
  };

  const handleFinalSaveWithPayment = async (paymentRows) => {
    if (isSaving) return;
    setIsSaving(true);
    const validItems = rows
      .filter(r => r.productId && calculateRowAmount(r).calcQty > 0)
      .map(r => {
        const rowCalc = calculateRowAmount(r);
        return {
          productId: parseInt(r.productId),
          quantity: rowCalc.calcQty,
          freeQty: Number(r.freeQty) || 0,
          primaryOpeningQty: Number(r.primaryOpeningQty) || 0,
          secOpeningQty: Number(r.secOpeningQty) || 0,
          price: Number(r.price) || 0,
          discount1: Number(rowCalc.d1Amt) || 0,
          discount2: Number(rowCalc.d2Amt) || 0,
          amount: Number(rowCalc.finalAmount) || 0,
          mrp: Number(r.mrp) || 0,
          batchNo: r.batchNo || '',
          mfgDate: r.mfgDate || '',
          expDate: r.expDate || '',
          imei: r.imei || '',
        };
      });

    const payload = {
      customerId: selectedCustomerId,
      date: invoiceDate,
      invoiceNo: searchInvoiceNo || undefined,
      paymentMode,
      remark: 'Purchase Order',
      subTotal: grandBaseAmount,
      totalDiscount: appliedDiscAmount,
      freightCharges: totalFreight,
      tcsPercent: Number(manualTcsPercent) || 0,
      tcsAmount: Number(manualTcsAmount) || 0,
      totalAmount: grandFinalAmount,
      items: validItems,
      paymentDetails: paymentRows || []
    };

    try {
      if (editInvoiceId) {
        await apiClient.delete(`/inventory/${editInvoiceId}`);
      }
      await apiClient.post('/inventory/PURCHASE_ORDER', payload);
      alert('Purchase Order Saved Successfully!');
      setIsPaymentStatusModalOpen(false);
      setShowBarcodePrintModal(true);
    } catch (error) {
      console.error(error);
      const errMsg = error?.response?.data?.error || error?.response?.data?.message || 'Failed to save Purchase Order.';
      alert(errMsg);
    }
  };

  const handleHoldInvoice = async (note) => {
    if (!selectedCustomerId) return alert('Please select a supplier/customer before holding.');

    const validItems = rows
      .filter(r => r.productId && calculateRowAmount(r).calcQty > 0)
      .map(r => {
        const rowCalc = calculateRowAmount(r);
        return {
          productId: parseInt(r.productId),
          quantity: rowCalc.calcQty,
          freeQty: Number(r.freeQty) || 0,
          primaryOpeningQty: Number(r.primaryOpeningQty) || 0,
          secOpeningQty: Number(r.secOpeningQty) || 0,
          price: Number(r.price) || 0,
          discount1: Number(rowCalc.d1Amt) || 0,
          discount2: Number(rowCalc.d2Amt) || 0,
          amount: Number(rowCalc.finalAmount) || 0,
          mrp: Number(r.mrp) || 0,
          batchNo: r.batchNo || '',
          mfgDate: r.mfgDate || '',
          expDate: r.expDate || '',
          imei: r.imei || '',
        };
      });

    if (validItems.length === 0) return alert('Please add at least one product before holding.');

    const payload = {
      customerId: selectedCustomerId,
      date: invoiceDate,
      paymentMode,
      remark: note || 'Purchase Order',
      status: 'HOLD',
      subTotal: grandBaseAmount,
      totalDiscount: appliedDiscAmount,
      freightCharges: totalFreight,
      tcsPercent: Number(manualTcsPercent) || 0,
      tcsAmount: Number(manualTcsAmount) || 0,
      totalAmount: grandFinalAmount,
      items: validItems,
    };

    try {
      await apiClient.post('/inventory/PURCHASE_ORDER', payload);
      const custName = customers.find(c => c.id === parseInt(selectedCustomerId))?.name;
      setHoldSuccessMsgs(prev => [...prev, `Hold: ${custName || 'Supplier'}`]);
      
      // Reset form
      setSelectedCustomerId('');
      setRows([createEmptyRow()]);
      setManualDiscPercent('');
      setManualDiscAmount('');
      setManualFreightAmt('');
      setManualFreightGst('');
      setManualTcsPercent('');
      setManualTcsAmount('');
    } catch (error) {
      console.error(error);
      const errMsg = error?.response?.data?.error || error?.response?.data?.message || 'Failed to hold Purchase Order.';
      alert(errMsg);
    }
  };

  const [searchInvoiceNo, setSearchInvoiceNo] = useState("");

  const defaultColumnOrder = [
    'sno', 'productCode', 'brand', 'product', 'batch', 'qty',
    'primaryOpeningQty', 'pUnit', 'secOpeningQty', 'sUnit', 'hsn', 'gst', 'freeQty', 'mrp',
    'purchasePrice', 'price', 'disc1', 'disc2', 'imei', 'amount', 'action'
  ];
  
  const [columnOrder, setColumnOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('purchaseOrder_colOrder');
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
        localStorage.setItem('purchaseOrder_colOrder', JSON.stringify(newOrder));
        return newOrder;
      });
    }
    setDraggedColId(null);
    setDragOverColId(null);
  };

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPaymentStatusModalOpen, setIsPaymentStatusModalOpen] = useState(false);
  const [holdSuccessMsgs, setHoldSuccessMsgs] = useState([]);


  const [productSearchMode, setProductSearchMode] = useState(() => {
    return localStorage.getItem('purchaseOrder_productSearchMode') || 'Product Name';
  });
  const [availableBatches, setAvailableBatches] = useState({});

  const searchModes = ['Product Name', 'Product Code', 'Barcode', 'Batch No'];
  const handleToggleSearchMode = () => {
    const currentIndex = searchModes.indexOf(productSearchMode);
    const nextIndex = (currentIndex + 1) % searchModes.length;
    const nextMode = searchModes[nextIndex];
    setProductSearchMode(nextMode);
    localStorage.setItem('purchaseOrder_productSearchMode', nextMode);
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

  const [productCode, setProductCode] = useState('');
  const [brandName, setBrandName] = useState('');
  const [batchNo, setBatchNo] = useState('');
  const [mfgDate, setMfgDate] = useState('');
  const [expDate, setExpDate] = useState('');
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [activeBatchRow, setActiveBatchRow] = useState(null);
  const [activeBatchDropdownRow, setActiveBatchDropdownRow] = useState(null);
  const [tempBatchData, setTempBatchData] = useState({ batchNo: '', expDate: '', mfgDate: '' });
  
  // Batch Settings
  const [batchSettings, setBatchSettings] = useState({
    dateFormat: 'DD/MM/YYYY', 
    showExpiry: true,
    showMfg: true,
  });
  const [isBatchSettingsOpen, setIsBatchSettingsOpen] = useState(false);
  const [primaryOpeningQty, setPrimaryOpeningQty] = useState('');
  const [pUnit, setPUnit] = useState('');
  const [secOpeningQty, setSecOpeningQty] = useState('');
  const [sUnit, setSUnit] = useState('');
  const [hsn, setHsn] = useState('');
  const [gstRate, setGstRate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [imei, setImei] = useState('');



  const createEmptyRow = () => ({
    productId: "",
    productCode: "",
    brandName: "",
    batchNo: "",
    primaryOpeningQty: "",
    pUnit: "",
    secOpeningQty: "",
    sUnit: "",
    hsn: "",
    gstRate: "",
    freeQty: 0,
    mrp: 0,
    purchasePrice: "",
    price: 0,
    disc1: 0,
    disc1Type: '%',
    disc2: 0,
    disc2Type: '%',
    imei: "",
    qty: 1
  });

  const [rows, setRows] = useState([createEmptyRow()]);

  const handleProductSelect = (index, productId, variant = null) => {
    const newRows = [...rows];
    if (!productId) {
      newRows[index] = createEmptyRow();
      setRows(newRows);
      return;
    }

    // We identify a unique row by productId AND variant name (if present)
    const existingIndex = newRows.findIndex((r, i) => i !== index && r.productId === parseInt(productId) && r.variantName === (variant?.name || ""));
    if (existingIndex !== -1) {
      newRows[existingIndex] = {
        ...newRows[existingIndex],
        qty: (Number(newRows[existingIndex].qty) || 0) + 1,
        primaryOpeningQty: (Number(newRows[existingIndex].primaryOpeningQty) || 0) + 1
      };
      
      newRows[index] = createEmptyRow();
      setRows(newRows);
      return;
    }

    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      let pMRP = product.mrp || 0;
      let pPrice = product.purchasePrice || product.price || 0;

      if (variant) {
        if (variant.mrp > 0) pMRP = variant.mrp;
        if (variant.purchasePrice > 0) pPrice = variant.purchasePrice;
        else if (variant.price > 0) pPrice = variant.price;
      }

      newRows[index] = {
        ...newRows[index],
        productId: product.id,
        productCode: product.code || '',
        brandName: newRows[index].brandName,
        mrp: pMRP,
        price: pPrice,
        purchasePrice: pPrice,
        pUnit: product.baseUnit || product.purchaseUnit || '',
        sUnit: product.salesUnit || '',
        hsn: product.hsnCode || '',
        gstRate: product.tax || 0,
        batchNo: product.batchNo || '',
        primaryOpeningQty: 1,
        secOpeningQty: 0,
        qty: 1,
        variantName: variant?.name || ""
      };
      setRows(newRows);
      fetchAvailableBatches(product.id, index);
      
      if (settings?.quantityCalculator) {
        setTimeout(() => {
          setActiveQuantityRow(index);
          setIsQuantityCalcOpen(true);
        }, 100);
      }
    }
  };

  const updateRow = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;

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
          let pPrice = product.purchasePrice || product.price || 0;
          if (newRows[index].variantName) {
            let subItemsList = [];
            try {
              subItemsList = typeof product.subItems === 'string' ? JSON.parse(product.subItems) : (product.subItems || []);
            } catch (e) {}
            const variant = subItemsList.find(v => (v.name || [v.size, v.color].filter(Boolean).join(' - ')) === newRows[index].variantName);
            if (variant) {
               if (variant.purchasePrice > 0) pPrice = variant.purchasePrice;
               else if (variant.price > 0) pPrice = variant.price;
            }
          }
          newRows[index].price = pPrice;
        }
      }
    }

    setRows(newRows);
  };

  const addRow = () => setRows([...rows, createEmptyRow()]);
  
  const removeRow = (index) => {
    if (rows.length === 1) {
      setRows([createEmptyRow()]);
    } else {
      setRows(rows.filter((_, i) => i !== index));
    }
  };

  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const dateInputRef = useRef(null);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  // Calculation Logic per Row & Totals
  const calculateRowAmount = (row) => {
    const product = products.find(p => p.id === parseInt(row.productId));
    const rate = product?.conversionRate || 1;
    const priQty = settings?.primaryOpeningQty ? (Number(row.primaryOpeningQty) || 0) : 0;
    const secQty = settings?.secOpeningQty ? (Number(row.secOpeningQty) || 0) : 0;
    
    let calcQty = Number(row.qty) || 0;
    const isPriEmpty = row.primaryOpeningQty === undefined || row.primaryOpeningQty === "";
    const isSecEmpty = row.secOpeningQty === undefined || row.secOpeningQty === "";

    let priceToUse = Number(row.price) || 0;
    const secondaryPrice = rate > 1 ? (priceToUse / rate) : priceToUse;

    const isSecondary = (u) => u && product && product.baseUnit && u !== product.baseUnit && rate > 1;

    if ((!settings?.primaryOpeningQty || isPriEmpty) && (!settings?.secOpeningQty || isSecEmpty)) {
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
        calcQty = settings?.primaryOpeningQty ? priQty : secQty;
      }
    }

    const baseAmount = calcQty * priceToUse;
    let d1Amt = row.disc1Type === '%' ? baseAmount * ((row.disc1 || 0) / 100) : (row.disc1 || 0);
    const amountAfterD1 = Math.max(0, baseAmount - d1Amt);
    let d2Amt = row.disc2Type === '%' ? amountAfterD1 * ((row.disc2 || 0) / 100) : (row.disc2 || 0);
    const finalAmount = Math.max(0, amountAfterD1 - d2Amt);

    const gstRate = Number(row.gstRate) || Number(row.taxRate) || 0;
    let gstAmount = 0;
    if (isTaxIncluded) {
      gstAmount = finalAmount - (finalAmount / (1 + gstRate / 100));
    } else {
      gstAmount = finalAmount * (gstRate / 100);
    }
    const cgst = gstAmount / 2;
    const sgst = gstAmount / 2;

    return {
      calcQty,
      baseAmount,
      d1Amt,
      d2Amt,
      finalAmount,
      totalDiscAmount: d1Amt + d2Amt,
      totalQty: (settings?.primaryOpeningQty ? (Number(row.primaryOpeningQty) || 0) : (Number(row.qty) || 0)) + (Number(row.freeQty) || 0),
      gstRate,
      gstAmount,
      cgst,
      sgst
    };
  };

  const grandBaseAmount = rows.reduce((sum, r) => sum + calculateRowAmount(r).baseAmount, 0);
  const grandTotalDiscAmount = rows.reduce((sum, r) => sum + calculateRowAmount(r).totalDiscAmount, 0);
  const grandTotalQty = rows.reduce((sum, r) => sum + calculateRowAmount(r).totalQty, 0);
  const totalGstAmount = rows.reduce((sum, r) => sum + calculateRowAmount(r).gstAmount, 0);
  const totalCgst = rows.reduce((sum, r) => sum + calculateRowAmount(r).cgst, 0);
  const totalSgst = rows.reduce((sum, r) => sum + calculateRowAmount(r).sgst, 0);

  const appliedDiscAmount = (manualDiscAmount !== "" && !settings?.hideTotalDiscount) ? Number(manualDiscAmount) : (settings?.showDiscount !== false ? grandTotalDiscAmount : 0);
  const totalFreight = !settings?.hideFreightCharge ? ((parseFloat(manualFreightAmt) || 0) + (parseFloat(manualFreightAmt) || 0) * (parseFloat(manualFreightGst) || 0) / 100) : 0;
  
  const amountBeforeTcs = Math.max(0, grandBaseAmount - appliedDiscAmount) + totalFreight + (isTaxIncluded ? 0 : totalGstAmount);
  const tcsAmount = manualTcsAmount !== "" ? Number(manualTcsAmount) : 0;
  const grandFinalAmount = amountBeforeTcs + tcsAmount;


  const allColumnIds = [
    'sno', 'productCode', 'brand', 'product', 'batch', 'qty',
    'primaryOpeningQty', 'pUnit', 'secOpeningQty', 'sUnit', 'hsn', 'gst', 'freeQty', 'mrp',
    'purchasePrice', 'price', 'disc1', 'disc2', 'imei', 'amount', 'action'
  ];

  const colVisible = {
    sno: true, productCode: settings.showProductCode, brand: settings.showCompany,
    product: true, batch: settings.showBatchNo, qty: false,
    primaryOpeningQty: settings.primaryOpeningQty, pUnit: settings.pUnit, secOpeningQty: settings.secOpeningQty, sUnit: settings.sUnit,
    hsn: settings.showHSN, gst: settings.showGST, freeQty: settings.showFreeQty,
    mrp: settings.showMRP,
    purchasePrice: false, price: true,
    disc1: settings.showDiscount, disc2: settings.showDiscount2,
    imei: settings.showIMEI, amount: true, action: true
  };

  const colWidths = {
    sno: '40px', productCode: '90px', brand: '130px', product: 'minmax(150px, 1fr)', batch: '90px', qty: '80px',
    primaryOpeningQty: '100px', pUnit: '70px', secOpeningQty: '100px', sUnit: '70px',
    hsn: '80px', gst: '80px', freeQty: '80px',
    mrp: '80px', purchasePrice: '90px',
    price: '100px', disc1: '110px', disc2: '110px', imei: '120px', amount: '100px', action: '80px'
  };

  const gridTemplateColumns = columnOrder.filter(id => colVisible[id]).map(id => colWidths[id]).join(' ');
  const minGridWidth = columnOrder.filter(id => colVisible[id]).reduce((sum, id) => {
    let width = colWidths[id];
    if (width.startsWith('minmax')) return sum + parseInt(width.match(/\d+/)[0]);
    if (width.endsWith('px')) return sum + parseInt(width);
    return sum;
  }, 0);

  return (
    <>
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col relative pb-12">
      <div className="bg-white m-3 mt-0 shadow-sm border border-gray-200 flex-1 flex flex-col">
        
        {/* Top Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between px-3 py-1.5">
          <h2 className="text-white font-medium text-[15px]">{pageTitle}</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-white text-[13px] font-bold">Credit</span>
              <div className="w-[28px] h-[16px] bg-[#117a8b] rounded-full relative cursor-pointer border border-[#148ea1]">
                <div className="w-[12px] h-[12px] bg-[#4F46E5] rounded-full absolute top-[1px] right-[1px]"></div>
              </div>
              <span className="text-white text-[13px] font-bold">Cash</span>
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
              <div className="flex items-center gap-2">
                <label className="text-[13px] font-bold text-gray-800">Company Name</label>
                {holdSuccessMsgs.map((msg, idx) => (
                  <div key={idx} className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-[3px] border border-green-200">
                    <span className="text-[12px] font-bold">{msg}</span>
                    <button onClick={(e) => { 
                      e.preventDefault(); 
                      setHoldSuccessMsgs(prev => prev.filter((_, i) => i !== idx)); 
                    }} className="hover:text-green-900 transition-colors cursor-pointer">
                      <X className="w-3.5 h-3.5" strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
              {customerStats ? (
                <span 
                  className="text-[13px] font-bold text-[#dc3545] invisible md:visible absolute md:static left-1/2 -translate-x-1/2 top-4 cursor-pointer hover:underline"
                  onClick={() => {
                    const company = customers.find(c => c.id === parseInt(selectedCustomerId));
                    if (company) {
                      navigate('/admin/party-ledger/company_payment', { state: { company } });
                    }
                  }}
                  title="Click to view Company Ledger"
                >
                  Due Amount :{formatAmount(customerStats.dueAmount)}
                </span>
              ) : (
                <span className="text-[13px] font-bold text-[#dc3545] invisible md:visible absolute md:static left-1/2 -translate-x-1/2 top-4">
                  Due Amount : 0
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1 flex items-center h-[32px]">
                <SupplierSelectDropdown
                  suppliers={customers}
                  value={selectedCustomerId}
                  onChange={(val) => {
                    setSelectedCustomerId(val);
                  }}
                  onEdit={(s) => {
                    setEditingSupplier(s);
                    setIsSupplierModalOpen(true);
                  }}
                  onDelete={handleDeleteSupplier}
                />
              </div>
              <button 
                title="Click here to view the Latest invoice items of the selected party" 
                onClick={async () => {
                  if (!selectedCustomerId) {
                    alert("Please select a party first.");
                    return;
                  }
                  try {
                    const res = await apiClient.get(`/inventory/purchase_order?customerId=${selectedCustomerId}`);
                    if (res.data.data && res.data.data.length > 0) {
                      const latestInvoice = res.data.data[0];
                      if (latestInvoice.items && latestInvoice.items.length > 0) {
                        const itemNames = latestInvoice.items.map(item => `${item.product?.name || 'Unknown'} (Qty: ${item.quantity || 0})`).join('\n');
                        alert(`Latest Invoice Items:\n\n${itemNames}`);
                      } else {
                        alert("The latest invoice has no items.");
                      }
                    } else {
                      alert("No previous invoice found for this party.");
                    }
                  } catch (err) {
                    console.error(err);
                    alert("Failed to fetch latest invoice.");
                  }
                }}
                className="bg-[#17a2b8] hover:bg-[#138496] text-white px-2.5 py-1.5 rounded-[3px] flex items-center justify-center shadow-sm h-[32px] transition-colors"
              >
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
          </div>
          
          <div className="flex flex-col items-end justify-center gap-3">
             <div className="flex items-center justify-end w-full sm:max-w-[320px]">
               <label className="text-[13px] font-bold text-gray-800 w-[80px] text-right mr-2">Invoice No :</label>
               <div className="flex-1 flex items-center">
                 <input 
                   type="text" 
                   value={searchInvoiceNo}
                   onChange={(e) => setSearchInvoiceNo(e.target.value)}
                   placeholder=""
                   className="w-full min-w-0 border border-gray-300 border-r-0 rounded-l-[3px] px-3 py-1 text-[13px] bg-white text-gray-800 font-bold"
                 />
                 <button 
                   onClick={() => {
                     if (searchInvoiceNo.trim()) {
                       alert(`Search functionality for Invoice No: ${searchInvoiceNo} will be implemented here.`);
                     } else {
                       alert("Please enter an Invoice No to search.");
                     }
                   }}
                   className="bg-[#4F46E5] text-white px-3 py-1 border border-[#4F46E5] rounded-r-[3px] hover:bg-[#4338ca] transition-colors"
                 >
                   <Search className="w-4 h-4" />
                 </button>
               </div>
             </div>
             <div className="flex flex-col items-end w-full sm:max-w-[320px]">
               <div className="flex items-center gap-2 mb-1 mr-1">
                 <span className="text-[13px] font-bold text-gray-800">Date</span>
                 <span className="text-[12px] font-medium text-blue-500">({formatDisplayDate(invoiceDate)})</span>
               </div>
               <div className="flex flex-wrap items-center gap-2 justify-end w-full">
                 <input 
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="border border-gray-300 rounded-[3px] px-3 py-1 text-[13px] outline-none text-gray-800 bg-white shadow-sm min-w-[130px] cursor-pointer"
                  />
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
            {/* Table Header */}
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

            {/* Input Rows */}
            {rows.map((row, idx) => {
              const rowCalc = calculateRowAmount(row);
              return (
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
                          <input type="text" value={row.productCode || ''} onChange={(e) => updateRow(idx, 'productCode', e.target.value)} placeholder="Code" className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none" />
                        </div>
                      );
                      case 'brand': return (
                        <div key={colId} className="border-r border-gray-200 p-1 flex relative items-center">
                          <input type="text" list={`brand-options-po-${idx}`} value={row.brandName || ''} onChange={(e) => updateRow(idx, 'brandName', e.target.value)} placeholder="Enter Brand Name" className="w-full h-full border border-gray-200 rounded-[3px] pl-1 pr-6 text-[12px] outline-none" />
                          <datalist id={`brand-options-po-${idx}`}>
                            {Array.from(new Set(products.map(p => p.brand).filter(Boolean))).map((brand, bIdx) => <option key={bIdx} value={brand} />)}
                          </datalist>
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
                              selectedVariant={{ name: row.variantName }}
                              onChange={(val, variant) => handleProductSelect(idx, val, variant)}
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
                            {!row.productId && (settings?.units || []).map((u, i) => <option key={i} value={u}>{u}</option>)}
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
                            {!row.productId && (settings?.units || []).map((u, i) => <option key={i} value={u}>{u}</option>)}
                          </select>
                        </div>
                      );
                      case 'hsn': return (
                        <div key={colId} className="border-r border-gray-200 p-1">
                           <input type="text" placeholder="HSN" value={row.hsn || ''} onChange={(e) => updateRow(idx, 'hsn', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none text-center text-teal-700 font-bold" />
                        </div>
                      );
                      case 'gst': return (
                        <div key={colId} className="border-r border-gray-200 p-1">
                           <input type="number" placeholder="0" value={row.gstRate || ''} onChange={(e) => updateRow(idx, 'gstRate', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none text-center text-teal-700 font-bold" />
                        </div>
                      );
                      case 'freeQty': return (
                        <div key={colId} className="border-r border-gray-200 p-1">
                           <input type="number" placeholder="0" value={row.freeQty || 0} onChange={(e) => updateRow(idx, 'freeQty', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center text-[#d39e00] font-bold" />
                        </div>
                      );
                      case 'mrp': return (
                        <div key={colId} className="border-r border-gray-200 p-1">
                           <input type="number" value={row.mrp || 0} onChange={(e) => updateRow(idx, 'mrp', Number(e.target.value))} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
                        </div>
                      );
                      case 'price': return (
                        <div key={colId} className="border-r border-gray-200 p-1">
                          <input type="number" value={row.price || 0} onChange={(e) => updateRow(idx, 'price', Number(e.target.value))} className="w-full h-full border border-gray-200 rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
                        </div>
                      );
                      case 'disc1': return (
                        <div key={colId} className="border-r border-gray-200 p-1 flex">
                           <input type="number" value={row.disc1 || 0} onChange={(e) => updateRow(idx, 'disc1', Number(e.target.value))} className="w-[60%] h-full border border-gray-200 rounded-l-[3px] px-1 text-[13px] outline-none text-center font-bold border-r-0" />
                           <div className="w-[40%] bg-gray-50 border border-gray-200 rounded-r-[3px] flex items-center justify-center text-[12px] text-gray-500 font-bold">%</div>
                        </div>
                      );
                      case 'disc2': return (
                        <div key={colId} className="border-r border-gray-200 p-1 flex">
                           <input type="number" value={row.disc2 || 0} onChange={(e) => updateRow(idx, 'disc2', Number(e.target.value))} className="w-[60%] h-full border border-gray-200 rounded-l-[3px] px-1 text-[13px] outline-none text-center font-bold border-r-0" />
                           <div className="w-[40%] bg-gray-50 border border-gray-200 rounded-r-[3px] flex items-center justify-center text-[12px] text-gray-500 font-bold">%</div>
                        </div>
                      );
                      case 'imei': return (
                        <div key={colId} className="border-r border-gray-200 p-1">
                           <input type="text" placeholder="IMEI / Specs" value={row.imei || ''} onChange={(e) => updateRow(idx, 'imei', e.target.value)} className="w-full h-full border border-gray-200 rounded-[3px] px-1 text-[12px] outline-none text-center text-purple-700 font-bold" />
                        </div>
                      );
                      case 'amount': return (
                        <div key={colId} className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold text-gray-800 bg-gray-50">
                          {rowCalc.finalAmount.toFixed(2)}
                        </div>
                      );
                      case 'action': return (
                        <div key={colId} className="border-r border-gray-200 p-1 flex items-center justify-center gap-2">
                          <button type="button" onClick={addRow} title="Add Row" className="w-6 h-6 rounded-[3px] border border-green-600 flex items-center justify-center text-green-600 hover:bg-green-50 transition-colors cursor-pointer">
                            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                          </button>
                          <button type="button" onClick={() => removeRow(idx)} title="Delete Row" className="w-6 h-6 rounded-[3px] border border-red-500 flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </button>
                        </div>
                      );
                      default: return null;
                    }
                  })}
                </div>
              );
            })}
            
          </div>
        </div>

{/* Calculations and Footer Area */}
        <div className="bg-white border-t border-gray-200 p-4 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          {/* Left Side (Totals, Remark, Terms) */}
          <div className="flex flex-col gap-4">
            
            <div className="summary-stats grid grid-cols-4 gap-2">
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">Total Qty</span>
                <span className="text-[14px] font-bold text-[#007bff]">{grandTotalQty}</span>
              </div>
              <div className="border border-gray-200 bg-[#f8f9fa] rounded-[3px] p-2 flex flex-col items-center justify-center text-center">
                <span className="text-[12px] font-bold text-gray-700">Taxable</span>
                <span className="text-[14px] font-bold text-[#28a745]">{grandFinalAmount.toFixed(2)}</span>
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
                 {grandFinalAmount.toFixed(2)}
               </div>
             </div>

             {!settings?.hideTotalDiscount && (
               <div className="flex justify-between items-start">
                 <span className="text-[13px] font-bold text-gray-800 mt-3">Discount:</span>
                 <div className="w-[200px] flex gap-2">
                   <div className="flex-1 relative mt-[18px]">
                     <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Dis.%</span>
                     <div className="relative">
                       <input 
                         type="number" 
                         value={manualDiscPercent !== "" ? manualDiscPercent : ""}
                         placeholder="0"
                         onChange={(e) => {
                           setManualDiscPercent(e.target.value);
                           if (e.target.value) {
                             setManualDiscAmount((grandBaseAmount * Number(e.target.value) / 100).toFixed(2));
                           } else {
                             setManualDiscAmount('');
                           }
                         }}
                         className="w-full border border-gray-300 rounded-[3px] py-1 px-2 text-[13px] text-right text-blue-700 font-bold outline-none bg-white" 
                       />
                     </div>
                   </div>
                   <div className="flex-1 relative mt-[18px]">
                     <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Dis. Amount</span>
                     <input 
                       type="number" 
                       value={manualDiscAmount !== "" ? manualDiscAmount : (grandTotalDiscAmount > 0 ? grandTotalDiscAmount.toFixed(2) : "")}
                       placeholder="0.00"
                       onChange={(e) => setManualDiscAmount(e.target.value)}
                       className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right text-blue-700 font-bold" 
                     />
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
                     <input 
                       type="number" 
                       value={manualFreightAmt !== "" ? manualFreightAmt : ""}
                       placeholder="0"
                       onChange={(e) => setManualFreightAmt(e.target.value)}
                       className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right" 
                     />
                   </div>
                   <div className="flex-1 relative mt-[18px]">
                     <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">Gst %</span>
                     <input 
                       type="number" 
                       value={manualFreightGst} 
                       onChange={(e) => setManualFreightGst(e.target.value)}
                       className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-right" 
                     />
                   </div>
                 </div>
               </div>
             )}

              <div className="flex justify-between items-start mt-2">
                <span className="text-[13px] font-bold text-gray-800 mt-3">TCS:</span>
                <div className="w-[200px] flex gap-2">
                  <div className="flex-1 relative mt-[18px]">
                    <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">TCS %</span>
                    <input 
                      type="number" 
                      value={manualTcsPercent !== "" ? manualTcsPercent : ""}
                      placeholder="0"
                      onChange={(e) => {
                        setManualTcsPercent(e.target.value);
                        if (e.target.value) {
                          setManualTcsAmount((amountBeforeTcs * Number(e.target.value) / 100).toFixed(2));
                        } else {
                          setManualTcsAmount('');
                        }
                      }}
                      className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-center text-blue-700 font-bold" 
                    />
                  </div>
                  <div className="flex-1 relative mt-[18px]">
                    <span className="absolute -top-[18px] left-0 text-[11px] font-bold text-gray-800">TCS Amount</span>
                    <input 
                      type="number" 
                      value={manualTcsAmount !== "" ? manualTcsAmount : ""}
                      placeholder="0.00"
                      onChange={(e) => setManualTcsAmount(e.target.value)}
                      className="w-full min-w-0 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white text-center text-blue-700 font-bold" 
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-1">
               <span className="text-[13px] font-bold text-gray-800">Final Amount:</span>
               <div className="w-[200px] bg-[#e9ecef] min-w-0 border border-gray-300 rounded-[3px] px-3 py-1 text-[14px] text-[#28a745] font-bold text-right shadow-sm border-[#28a745]">
                 {grandFinalAmount.toFixed(2)}
               </div>
             </div>
          </div>

        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-[#343a40] z-40 px-4 py-2 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex flex-wrap items-center gap-1 text-[12px] font-bold">
          <span className="text-white">Last Invoice Total:</span>
          <span className="text-[#ffc107]">0</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 flex-1 max-w-[400px] mx-auto">
          <button onClick={handleSave} className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] transition-colors">
            <Check className="w-4 h-4" strokeWidth={3} />
            Save
          </button>
          
          <div className="flex items-center relative">
            <button 
              className="flex items-center gap-1 bg-[#ffc107] text-gray-900 px-3 py-1.5 rounded-l-[3px] text-[13px] cursor-default"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={3} />
              Convert Type
            </button>
            <button 
              className="bg-[#ffc107] text-gray-900 px-2 py-1.5 rounded-r-[3px] border-l border-[#d39e00] cursor-default"
            >
              <ChevronDown className="w-4 h-4" strokeWidth={3} />
            </button>
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

      </div>

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
                      
                      const newRows = [...rows];
                      if (activeBatchRow !== null && activeBatchRow >= 0) {
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
        onSave={async (newProduct) => {
          try {
            const payload = {
              ...newProduct,
              sku: newProduct.sku || `SKU${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
              price: parseFloat(newProduct.price) || 0,
              mrp: parseFloat(newProduct.mrp) || 0,
              stock: parseInt(newProduct.qty) || 0,
            };
            if (editingProduct) {
              await apiClient.put(`/products/${editingProduct.id}`, payload);
            } else {
              const res = await apiClient.post('/products', payload);
              if (res.data && res.data.data && res.data.data.id) {
                setSelectedProductId(res.data.data.id);
              }
            }
            fetchProducts();
          } catch (error) {
            console.error('Failed to save product:', error);
            alert('Failed to save product');
          }
        }}
      />
      <PaymentStatusModal 
        isOpen={isPaymentStatusModalOpen}
        onClose={() => setIsPaymentStatusModalOpen(false)}
        finalAmount={grandFinalAmount}
        onSaveSuccess={handleFinalSaveWithPayment}
      />
      
      {isQuantityCalcOpen && activeQuantityRow !== null && (
        <TextileQuantityCalculatorModal
          isOpen={isQuantityCalcOpen}
          onClose={() => {
            setIsQuantityCalcOpen(false);
            setActiveQuantityRow(null);
          }}           initialData={{
             productName: rows[activeQuantityRow]?.productName || products.find(p => p.id === parseInt(rows[activeQuantityRow]?.productId))?.name || 'Unknown Item',
             hsn: rows[activeQuantityRow]?.hsn,
             rollQty: rows[activeQuantityRow]?.rollQty,
             meterPerRoll: rows[activeQuantityRow]?.meterPerRoll,
             qty: rows[activeQuantityRow]?.qty,
             price: rows[activeQuantityRow]?.price,
             disc1: rows[activeQuantityRow]?.disc1,
             taxRate: rows[activeQuantityRow]?.gstRate,
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
               gstRate: calcData.taxRate,
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
              Do you want to print the barcode<br/>of this invoice?
            </h2>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => {
                  const itemsToPrint = rows.filter(r => r.productId && r.qty > 0).map(r => ({
                    productId: r.productId,
                    name: r.productName || r.name || products.find(p => p.id === parseInt(r.productId))?.name,
                    barcode: r.barcode || r.productCode || products.find(p => p.id === parseInt(r.productId))?.barcode || '',
                    quantity: r.qty,
                    salePrice: r.salePrice || r.price,
                    mrp: r.mrp || r.price
                  }));
                  navigate('/admin/barcode', { state: { invoiceItems: itemsToPrint } });
                }}
                className="bg-[#3085d6] hover:bg-[#2874ba] text-white px-5 py-2.5 rounded-[4px] text-[15px] font-medium transition-colors"
              >
                Yes, Print Barcode!
              </button>
              <button 
                onClick={() => {
                  setShowBarcodePrintModal(false);
                  window.location.href = location.pathname;
                }}
                className="bg-[#d33] hover:bg-[#b02a2a] text-white px-5 py-2.5 rounded-[4px] text-[15px] font-medium transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
