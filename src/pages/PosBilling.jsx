import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Search, 
  Printer,
  PlusCircle,
  Trash2,
  PauseCircle,
  ScanBarcode,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  PackageSearch,
  Wallet
} from 'lucide-react';
import { cn, getPurchasePriceCode } from '../utils';
import { ItemMasterModal } from '../components/ItemMasterModal';
import apiClient from '../api/apiClient';
import { createTransaction, getTransactionById, deleteTransaction } from '../api/inventory';

export function PosBilling() {
  const navigate = useNavigate();
  
  // States
  const [settings, setSettings] = useState(null);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [productSuggestions, setProductSuggestions] = useState([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  
  // Cart always starts empty on refresh (no persistence)
  const [cart, setCart] = useState([]);
  
  const [customerName, setCustomerName] = useState('');
  const [customerId, setCustomerId] = useState(null);
  const [customerPoints, setCustomerPoints] = useState(0);
  const [redeemedPoints, setRedeemedPoints] = useState(0);
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimerRef = React.useRef(null);
  
  const [paymentMode, setPaymentMode] = useState(() => {
    return localStorage.getItem('pos_paymentMode') || 'Cash';
  });
  const [useEarnedPoints, setUseEarnedPoints] = useState(false);
  
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [lastInvoiceId, setLastInvoiceId] = useState(null);
  const [lastInvoiceNo, setLastInvoiceNo] = useState('');
  
  const [isBillOnHold, setIsBillOnHold] = useState(false);
  const [holdSuccessMsgs, setHoldSuccessMsgs] = useState([]);
  const [activeHoldId, setActiveHoldId] = useState(null);
  
  const [billDiscount, setBillDiscount] = useState(() => {
    const saved = localStorage.getItem('pos_billDiscount');
    return saved ? Number(saved) : 0;
  });

  const [splitAmounts, setSplitAmounts] = useState({ Cash: '', Card: '', UPI: '', Credit: '' });

  const [isWholesale, setIsWholesale] = useState(() => {
    const saved = localStorage.getItem('pos_isWholesale');
    return saved === 'true';
  });

  const [activeOffers, setActiveOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await apiClient.get('/offers');
        if (res.data && res.data.data) {
          const active = res.data.data.filter(o => o.status === 'ACTIVE');
          setActiveOffers(active);
        }
      } catch (err) {
        console.error('Failed to fetch offers', err);
      }
    };
    fetchOffers();
  }, []);

  useEffect(() => {
    localStorage.setItem('pos_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pos_paymentMode', paymentMode);
  }, [paymentMode]);

  useEffect(() => {
    localStorage.setItem('pos_billDiscount', billDiscount.toString());
  }, [billDiscount]);

  useEffect(() => {
    localStorage.setItem('pos_isWholesale', isWholesale.toString());
  }, [isWholesale]);

  // Focus ref for quick barcode scanning
  const barcodeRef = useRef(null);

  useEffect(() => {
    // Auto focus barcode scanner on load
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, []);

  // All customers list for dropdown on focus
  const [allCustomers, setAllCustomers] = useState([]);

  // Fetch all customers once on mount
  useEffect(() => {
    const fetchAllCustomers = async () => {
      try {
        const res = await apiClient.get('/customers?type=CUSTOMER');
        if (res.data.success) {
          setAllCustomers(res.data.data || []);
        }
      } catch (err) {
        console.error('Customers fetch error:', err);
      }
    };
    fetchAllCustomers();
  }, []);

  // Customer search handler
  const [activeCustomerIndex, setActiveCustomerIndex] = useState(-1);
  const handleCustomerSearch = (text) => {
    setActiveCustomerIndex(-1);
    setCustomerName(text);
    setCustomerId(null);
    setShowSuggestions(true);

    // Filter from allCustomers locally
    if (text.trim() === '') {
      setCustomerSuggestions(allCustomers);
      setCustomerPoints(0);
      setRedeemedPoints(0);
    } else {
      const filtered = allCustomers.filter(c =>
        c.name?.toLowerCase().includes(text.toLowerCase()) ||
        c.mobile?.includes(text) ||
        c.phone?.includes(text)
      );
      setCustomerSuggestions(filtered);
    }
  };

  // On focus — show all customers immediately
  const handleCustomerFocus = () => {
    setShowSuggestions(true);
    if (customerName.trim() === '') {
      setCustomerSuggestions(allCustomers);
    }
  };

  const handleCustomerSelect = (customer) => {
    setCustomerName(customer.name);
    setCustomerId(customer.id);
    setCustomerPoints(customer.loyaltyPoints || 0);
    setRedeemedPoints(0);
    setCustomerSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCustomerBlur = () => {
    // Delay taaki click event pehle fire ho
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Products database from API
  const [products, setProducts] = useState([]);
  const [quickItems, setQuickItems] = useState([]);

  useEffect(() => {
    const fetchPOSData = async () => {
      try {
        const prodRes = await apiClient.get('/products');
        if (prodRes.data.success) {
          const activeProducts = prodRes.data.data.filter(p => p.status === 'Active' || p.status === 'ACTIVE');
          setProducts(activeProducts);
        }
        
        const quickRes = await apiClient.get('/pos/quick-items');
        if (quickRes.data.success) setQuickItems(quickRes.data.data);

        const settingsRes = await apiClient.get('/settings');
        if (settingsRes.data?.success && settingsRes.data.data) {
          setSettings(settingsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load POS data:", err);
      }
    };
    fetchPOSData();
  }, []);

  // Dynamic Price Calculation from Item Master
  const calculateItemPrice = (product, currentQty, currentPaymentMode, wholesaleStatus) => {
    const basePrice = parseFloat(product.price) || 0;
    let newPrice = basePrice;
    let reason = "Standard Retail";

    if (currentPaymentMode === 'Credit') {
      newPrice = product.creditSalePrice || product.price;
      reason = "Credit Sale Price";
    } else if (wholesaleStatus) {
      newPrice = product.wholesalePrice || product.price;
      reason = "Wholesale Price";
    }

    // Check quantity slabs
    if (product.qty_slabs && product.qty_slabs.length > 0) {
      const matchingSlab = product.qty_slabs.find(slab => currentQty >= slab.min && currentQty <= slab.max);
      if (matchingSlab && currentPaymentMode !== 'Credit') {
        newPrice = matchingSlab.price;
        reason = `Qty Price (${matchingSlab.min}+)`;
      }
    }

    return { price: newPrice, reason };
  };

  // Recalculate cart prices when globally toggling Payment Mode or Wholesale
  useEffect(() => {
    setCart(prevCart => prevCart.map(item => {
      let newPrice = item.price;
      let reason = item.priceReason;
      if (!item.isManualPrice) {
        const productDef = products.find(p => p.id === item.id) || item;
        const calculated = calculateItemPrice(productDef, item.qty, paymentMode, isWholesale);
        newPrice = calculated.price;
        reason = calculated.reason;
      }
      return { ...item, price: newPrice, total: item.qty * (Number(newPrice) || 0) * (1 - (item.discount || 0) / 100), priceReason: reason };
    }));
  }, [paymentMode, isWholesale]);

  const [activeProductIndex, setActiveProductIndex] = useState(-1);
  const handleBarcodeChange = (e) => {
    setActiveProductIndex(-1);
    const text = e.target.value;
    setBarcodeInput(text);
    
    if (!text.trim()) {
      setProductSuggestions(products);
      setShowProductSuggestions(true);
      return;
    }

    const query = text.trim().toLowerCase();

    const filtered = products
      .filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) || 
        (p.barcode && p.barcode.toLowerCase().includes(query))
      )
      .sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));
    
    setProductSuggestions(filtered);
    setShowProductSuggestions(true);
  };

  const handleProductSelect = (product) => {
    addToCart(product);
    setBarcodeInput('');
    setProductSuggestions([]);
    setShowProductSuggestions(false);
    setTimeout(() => {
      if (barcodeRef.current) barcodeRef.current.focus();
    }, 100);
  };

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    // Find product (Exact match for barcode, or prefix/startsWith match for name)
    const exactBarcodeMatch = products.find(p => p.barcode === query);
    const product = exactBarcodeMatch || 
      products.find(p => p.name && p.name.toLowerCase().startsWith(query.toLowerCase())) ||
      products.find(p => p.name && p.name.toLowerCase().includes(query.toLowerCase()));
    
    if (product) {
      addToCart(product);
      setBarcodeInput(''); // Clear for next scan
      setShowProductSuggestions(false);
    } else {
      alert('Product not found!');
    }
  };

  const handleProductKeyDown = (e) => {
    if (!showProductSuggestions || productSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveProductIndex(prev => (prev < productSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveProductIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (activeProductIndex >= 0 && activeProductIndex < productSuggestions.length) {
        e.preventDefault();
        handleProductSelect(productSuggestions[activeProductIndex]);
      }
    }
  };

  const handleCustomerKeyDown = (e) => {
    if (!showSuggestions || customerSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveCustomerIndex(prev => (prev < customerSuggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveCustomerIndex(prev => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      if (activeCustomerIndex >= 0 && activeCustomerIndex < customerSuggestions.length) {
        e.preventDefault();
        handleCustomerSelect(customerSuggestions[activeCustomerIndex]);
      }
    }
  };

  const addToCart = (product) => {
    if (settings?.negativeStockLock) {
      const existing = cart.find(item => item.id === product.id);
      const currentQty = existing ? existing.qty : 0;
      if (currentQty + 1 > (product.stock || 0)) {
        alert('Negative Stock Lock is enabled. Insufficient stock!');
        return;
      }
    }

    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      let newQty = 1;
      if (existing) {
        newQty = existing.qty + 1;
      }
      
      const { price: newPrice, reason } = calculateItemPrice(product, newQty, paymentMode, isWholesale);
      
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, qty: newQty, price: newPrice, total: newQty * newPrice * (1 - (item.discount || 0) / 100), priceReason: reason }
            : item
        );
      }
      return [...prevCart, { ...product, qty: 1, discount: 0, price: newPrice, total: newPrice, priceReason: reason }];
    });
  };

  const updateQty = (id, newQty) => {
    if (newQty < 1) return;
    if (settings?.negativeStockLock) {
      const product = products.find(p => p.id === id);
      if (product && newQty > (product.stock || 0)) {
        alert('Negative Stock Lock is enabled. Insufficient stock!');
        return;
      }
    }
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        let newPrice = item.price;
        let reason = item.priceReason;
        if (!item.isManualPrice) {
          const productDef = products.find(p => p.id === id) || item;
          const calculated = calculateItemPrice(productDef, newQty, paymentMode, isWholesale);
          newPrice = calculated.price;
          reason = calculated.reason;
        }
        return { ...item, qty: newQty, price: newPrice, total: newQty * (Number(newPrice) || 0) * (1 - (item.discount || 0) / 100), priceReason: reason };
      }
      return item;
    }));
  };

  const updateMrp = (id, newMrp) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const val = newMrp === '' ? '' : (newMrp < 0 ? 0 : newMrp);
        return { ...item, mrp: val };
      }
      return item;
    }));
  };

  const updatePrice = (id, newPrice) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const val = newPrice === '' ? '' : (newPrice < 0 ? 0 : newPrice);
        const numVal = Number(val) || 0;
        return { ...item, price: val, isManualPrice: true, total: item.qty * numVal * (1 - (item.discount || 0) / 100), priceReason: 'Manual Override' };
      }
      return item;
    }));
  };

  const updateDiscount = (id, newDiscount) => {
    if (newDiscount < 0) newDiscount = 0;
    if (newDiscount > 100) newDiscount = 100;
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        return { ...item, discount: newDiscount, total: item.qty * (Number(item.price) || 0) * (1 - newDiscount / 100) };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("Cart is empty!");
      return;
    }
    
    try {
      const payload = {
        customerId: customerId || null,
        items: cart.map(item => ({
          productId: item.id,
          qty: item.qty,
          price: Number(item.price) || 0,
          discount1: item.discount || 0,
          amount: item.total
        })),
        paymentModes: paymentMode === 'Split' 
          ? [
              { mode: 'Cash', amount: Number(splitAmounts.Cash) || 0 },
              { mode: 'Card', amount: Number(splitAmounts.Card) || 0 },
              { mode: 'UPI', amount: Number(splitAmounts.UPI) || 0 }
            ].filter(p => p.amount > 0)
          : [{ mode: paymentMode, amount: finalAmount }],
        totalAmount: finalAmount,
        loyaltyDiscountValue: discountAmount + offerDiscountAmount,
        redeemedPoints: redeemedPoints + (useEarnedPoints ? totalEarnedPoints : 0),
        offerId: selectedOffer ? selectedOffer.id : null
      };
      
      const res = await apiClient.post('/pos/checkout', payload);
      if (res.data.success) {
        const invoiceData = res.data.data;
        setLastInvoiceId(invoiceData?.id || null);
        setLastInvoiceNo(invoiceData?.invoiceNo || `POS-${Date.now()}`);
        setIsPrintModalOpen(true);
        
        if (activeHoldId) {
          try {
            await deleteTransaction(activeHoldId);
            setHoldSuccessMsgs(prev => prev.filter(h => h.id !== activeHoldId));
            setActiveHoldId(null);
            setIsBillOnHold(false);
          } catch (e) {
            console.error("Error deleting hold after checkout", e);
          }
        }
      }
    } catch (error) {
      console.error("Checkout failed:", error);
      alert(error.response?.data?.message || "Checkout failed");
    }
  };

  const loadHeldInvoice = async (id) => {
    try {
      const response = await getTransactionById(id);
      if (response.success && response.data) {
        const invoice = response.data;
        
        if (invoice.items && invoice.items.length > 0) {
          const loadedCart = invoice.items.map(item => ({
             id: item.productId,
             name: item.product?.name || 'Unknown',
             barcode: item.product?.barcode || '',
             qty: item.quantity,
             price: item.price,
             discount: item.discount1 || 0,
             total: item.amount,
             mrp: item.product?.mrp || item.price,
             priceReason: 'Loaded from Hold',
             isManualPrice: true,
             stock: item.product?.stock || 0
          }));
          setCart(loadedCart);
        } else {
          setCart([]);
        }
        
        if (invoice.customerId) {
           setCustomerId(invoice.customerId);
           const cust = allCustomers.find(c => c.id === invoice.customerId);
           if (cust) setCustomerName(cust.name);
        } else {
           setCustomerId(null);
           setCustomerName("");
        }
        if (invoice.paymentMode) setPaymentMode(invoice.paymentMode);
        
        setActiveHoldId(id);
        setIsBillOnHold(true);
      }
    } catch (error) {
      console.error("Error loading hold invoice", error);
      alert("Failed to load held bill.");
    }
  };

  const handleHoldBill = async () => {
    if (cart.length === 0) {
      alert("Cart is empty! Nothing to hold.");
      return;
    }
    
    const payload = {
      invoiceNo: `POS-${Date.now()}`,
      customerId: customerId || null,
      date: new Date().toISOString().split('T')[0],
      paymentMode,
      remark: "POS Hold",
      status: "HOLD",
      subTotal: subtotal,
      totalDiscount: discountAmount + offerDiscountAmount,
      totalAmount: finalAmount,
      items: cart.map(item => ({
        productId: Number(item.id),
        quantity: Number(item.qty) || 1,
        price: Number(item.price) || 0,
        discount1: Number(item.discount) || 0,
        amount: Number(item.total) || 0,
      })),
      offerId: selectedOffer ? selectedOffer.id : null,
      redeemedPoints: effectiveRedeemed,
      loyaltyDiscountValue: discountAmount + offerDiscountAmount
    };

    try {
      const response = await createTransaction('sales', payload);
      const transactionId = response.data?.id;
      const custName = customerName || 'Walk-in Customer';
      setHoldSuccessMsgs(prev => [...prev, { id: transactionId, msg: `Hold: ${custName}` }]);
      
      if (activeHoldId) {
         try { await deleteTransaction(activeHoldId); } catch(e) { console.error("Error deleting old hold", e); }
      }
      setActiveHoldId(null);
      setIsBillOnHold(false);
      
      // Reset POS form
      setCart([]);
      setCustomerId(null);
      setCustomerName('');
      setCustomerPoints(0);
      setRedeemedPoints(0);
      
      alert("Bill placed on Hold successfully!");
    } catch (error) {
      console.error(error);
      alert('Failed to hold bill.');
    }
  };

  const isOfferApplicable = (offer, currentCart) => {
    if (!offer) return false;
    if (offer.target === 'ENTIRE CART') return currentCart.length > 0;
    if (offer.target && offer.target.startsWith('CATEGORY: ')) {
      const cat = offer.target.replace('CATEGORY: ', '').trim().toLowerCase();
      return currentCart.some(item => item.category?.toLowerCase() === cat);
    }
    if (offer.target && offer.target.startsWith('ITEM: ')) {
      const pName = offer.target.replace('ITEM: ', '').trim().toLowerCase();
      return currentCart.some(item => item.name?.toLowerCase() === pName);
    }
    return false;
  };

  useEffect(() => {
    if (selectedOffer && !isOfferApplicable(selectedOffer, cart)) {
      setSelectedOffer(null);
    }
  }, [cart, selectedOffer]);

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
  const totalTax = cart.reduce((acc, item) => acc + (item.total * ((item.tax || 0) / 100)), 0);
  const discountAmount = subtotal * (billDiscount / 100);
  
  // Calculate Offer Discount
  let offerDiscountAmount = 0;
  if (selectedOffer) {
    let applicableItems = [];
    if (selectedOffer.target === 'ENTIRE CART') {
      applicableItems = cart;
    } else if (selectedOffer.target && selectedOffer.target.startsWith('CATEGORY: ')) {
      const cat = selectedOffer.target.replace('CATEGORY: ', '').trim().toLowerCase();
      applicableItems = cart.filter(item => item.category?.toLowerCase() === cat);
    } else if (selectedOffer.target && selectedOffer.target.startsWith('ITEM: ')) {
      const pName = selectedOffer.target.replace('ITEM: ', '').trim().toLowerCase();
      applicableItems = cart.filter(item => item.name?.toLowerCase() === pName);
    }
    
    const applicableTotal = applicableItems.reduce((acc, item) => acc + item.total, 0);
    
    if (selectedOffer.type === 'FLAT' || selectedOffer.discountType === 'Flat') {
      offerDiscountAmount = Math.min(applicableTotal, parseFloat(selectedOffer.discountValue) || 0);
    } else if (selectedOffer.type === 'PERCENTAGE' || selectedOffer.discountType === 'Percentage') {
      offerDiscountAmount = applicableTotal * ((parseFloat(selectedOffer.discountValue) || 0) / 100);
    } else if (selectedOffer.type === 'BOGO' || selectedOffer.offerType === 'Buy 1 Get 1') {
      const buyQty = selectedOffer.buyQty || 1;
      const getQty = selectedOffer.getQty || 1;
      applicableItems.forEach(item => {
        const sets = Math.floor(item.qty / (buyQty + getQty));
        const freeItems = sets * getQty;
        offerDiscountAmount += freeItems * item.price;
      });
    }
  }

  const totalEarnedPoints = cart.reduce((acc, item) => acc + (Number(item.creditSalePrice || 0) * item.qty), 0);
  const effectiveRedeemed = redeemedPoints + (useEarnedPoints ? totalEarnedPoints : 0);
  
  const finalAmount = Math.max(0, subtotal - discountAmount - offerDiscountAmount - effectiveRedeemed);
  const netPayableUI = Math.max(0, subtotal - discountAmount - offerDiscountAmount - effectiveRedeemed);
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="bg-[#f4f6f9] h-[calc(100vh-45px)] flex flex-col relative overflow-hidden">
      <div className="bg-white m-3 mt-0 shadow-sm border border-gray-200 flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side: Cart & Billing (70%) */}
        <div className="flex-1 min-h-0 flex flex-col border-r border-gray-200">
          
          {/* Top Header */}
          <div className="bg-[#4F46E5] flex items-center justify-between px-3 py-2">
            <h2 className="text-white font-bold text-[16px] flex items-center gap-2">
              <ScanBarcode className="w-5 h-5" /> 
              Point of Sale (POS)
              {isBillOnHold && <span className="ml-2 bg-[#ffc107] text-gray-900 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold shadow-sm">ON HOLD</span>}
            </h2>
            <div className="flex items-center gap-4">
              <div 
                className="flex flex-wrap items-center gap-1.5 cursor-pointer bg-black/20 px-2 py-1 rounded" 
                onClick={() => setIsWholesale(!isWholesale)}
              >
                <span className={`text-[12px] font-bold ${!isWholesale ? 'text-white' : 'text-gray-300'}`}>Retail</span>
                <div className={`w-[28px] h-[16px] rounded-full relative border transition-colors ${isWholesale ? 'bg-[#ffc107] border-[#d39e00]' : 'bg-gray-400 border-gray-500'}`}>
                  <div className={`w-[12px] h-[12px] rounded-full absolute top-[1px] transition-all bg-white shadow-sm ${isWholesale ? 'right-[1px]' : 'left-[1px]'}`}></div>
                </div>
                <span className={`text-[12px] font-bold ${isWholesale ? 'text-white' : 'text-gray-300'}`}>Wholesale</span>
              </div>
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-[#dc3545] p-1 rounded-sm shadow-sm hover:bg-[#c82333] transition-colors"
              >
                <X className="w-4 h-4 text-white font-bold" strokeWidth={4} />
              </button>
            </div>
          </div>

          {/* POS Controls */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 flex gap-3 flex-wrap">
            {holdSuccessMsgs.length > 0 && (
              <div className="w-full flex flex-wrap gap-2 mb-1">
                {holdSuccessMsgs.map((hold, idx) => (
                  <div key={idx} className="bg-[#e8f5e9] border border-[#c8e6c9] text-[#2e7d32] px-2 py-1 rounded-[3px] flex items-center gap-1.5 text-[12px] font-bold shadow-sm hover:bg-[#c8e6c9] cursor-pointer transition-colors" onClick={() => loadHeldInvoice(hold.id)}>
                    {hold.msg}
                    <X className="w-3.5 h-3.5 cursor-pointer hover:text-red-600" onClick={(e) => {
                      e.stopPropagation();
                      setHoldSuccessMsgs(prev => prev.filter(h => h.id !== hold.id));
                      deleteTransaction(hold.id).catch(err => console.error(err));
                      if (activeHoldId === hold.id) {
                        setActiveHoldId(null);
                        setIsBillOnHold(false);
                      }
                    }}/>
                  </div>
                ))}
              </div>
            )}
            <div className="flex-1 min-w-[200px] flex gap-2">
              <form onSubmit={handleBarcodeSubmit} className="relative flex-1">
                <input 
                  ref={barcodeRef}
                  type="text" 
                  value={barcodeInput}
                  onChange={handleBarcodeChange}
                  onKeyDown={handleProductKeyDown}
                  onBlur={() => setTimeout(() => setShowProductSuggestions(false), 300)}
                  onFocus={() => { 
                    if (!barcodeInput.trim()) {
                      setProductSuggestions(products);
                    }
                    setShowProductSuggestions(true);
                  }}
                  placeholder="Scan Barcode or Search Product (F3)"
                  className="w-full border-2 border-[#4F46E5] rounded-[4px] px-3 py-2 text-[14px] font-medium outline-none pr-10 shadow-sm"
                  autoComplete="off"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#4F46E5]">
                  <Search className="w-5 h-5" />
                </button>
                {showProductSuggestions && productSuggestions.length > 0 && (
                  <div 
                    className="absolute top-full left-0 w-full bg-white border-2 border-indigo-500 shadow-xl z-50 rounded-b-[6px] max-h-[160px] overflow-y-scroll pos-product-scroll"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {productSuggestions.map((p, index) => (
                      <div
                        key={p.id}
                        onClick={() => handleProductSelect(p)}
                        className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-0 flex justify-between items-center ${activeProductIndex === index ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
                      >
                        <div>
                          <div className="font-bold text-[13px] text-gray-800">{p.name}</div>
                          <div className="text-[11px] text-gray-500">Barcode: {p.barcode || 'N/A'}</div>
                        </div>
                        <div className="text-[13px] font-bold text-[#28a745]">₹{p.price}</div>
                      </div>
                    ))}
                  </div>
                )}
                {showProductSuggestions && productSuggestions.length === 0 && barcodeInput.trim() && (
                  <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg z-50 rounded-b-[4px] px-3 py-2 text-[12px] text-gray-500 text-center">
                    No products found
                  </div>
                )}
              </form>
              <button 
                type="button"
                onClick={() => setIsItemModalOpen(true)}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-2 rounded-[4px] shadow-sm flex items-center justify-center transition-colors"
                title="Add New Product"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="w-[250px] relative">
              <input 
                type="text" 
                value={customerName}
                onChange={(e) => handleCustomerSearch(e.target.value)}
                onKeyDown={handleCustomerKeyDown}
                onBlur={handleCustomerBlur}
                onFocus={handleCustomerFocus}
                placeholder="Customer Mobile / Name"
                className={`w-full border rounded-[4px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5] transition-colors ${
                  customerId ? 'border-green-400 bg-green-50' : 'border-gray-300'
                }`}
                autoComplete="off"
              />
              {customerId && (
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-500 text-[10px] font-bold">✓ Selected</span>
              )}
              {showSuggestions && customerSuggestions.length > 0 && (
                <div 
                  className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg z-50 rounded-b-[4px] max-h-[200px] overflow-y-scroll pos-product-scroll"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  {customerSuggestions.map((c, index) => (
                    <div
                      key={c.id}
                      onMouseDown={() => handleCustomerSelect(c)}
                      className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-0 ${activeCustomerIndex === index ? 'bg-indigo-100' : 'hover:bg-indigo-50'}`}
                    >
                      <div className="font-semibold text-[13px] text-gray-800">{c.name}</div>
                      <div className="text-[11px] text-gray-500">{c.mobile || c.phone || 'No mobile'}</div>
                    </div>
                  ))}
                </div>
              )}
              {showSuggestions && customerSuggestions.length === 0 && (
                <div className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg z-50 rounded-b-[4px] px-3 py-2 text-[12px] text-gray-500">
                  {allCustomers.length === 0 ? 'Loading customers...' : 'No customer found'}
                </div>
              )}
            </div>
            
            <button onClick={handleHoldBill} className={`px-4 py-2 rounded-[4px] text-[13px] font-bold shadow-sm flex items-center gap-1.5 transition-colors ${isBillOnHold ? 'bg-[#17a2b8] hover:bg-[#138496] text-white' : 'bg-[#ffc107] hover:bg-[#e0a800] text-gray-900'}`}>
              <PauseCircle className="w-4 h-4" /> {isBillOnHold ? 'Unhold Bill' : 'Hold Bill'}
            </button>
          </div>

          {/* Cart Table */}
          <div className="flex-1 min-h-0 relative">
            <div className="absolute inset-0 overflow-y-scroll">
            <div className="bg-[#343a40] text-white grid grid-cols-[50px_1fr_80px_90px_70px_100px_100px_90px_50px] text-center sticky top-0 z-10">
              <div className="py-2 text-[12px] font-bold">S.NO</div>
              <div className="py-2 text-[12px] font-bold text-left px-2">PRODUCT NAME</div>
              <div className="py-2 text-[12px] font-bold">MRP</div>
              <div className="py-2 text-[12px] font-bold">PRICE</div>
              <div className="py-2 text-[12px] font-bold">DISC(%)</div>
              <div className="py-2 text-[12px] font-bold">QTY</div>
              <div className="py-2 text-[12px] font-bold">LOYALTY POINT</div>
              <div className="py-2 text-[12px] font-bold">TOTAL</div>
              <div className="py-2 text-[12px] font-bold">ACTION</div>
            </div>

            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                <PackageSearch className="w-16 h-16 mb-2 opacity-50" />
                <p className="text-[15px] font-medium">Cart is empty. Scan products to add.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {cart.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-[50px_1fr_80px_90px_70px_100px_100px_90px_50px] text-center border-b border-gray-200 bg-white items-center hover:bg-gray-50">
                    <div className="py-2 text-[13px] font-bold text-gray-600">{index + 1}</div>
                    <div className="py-2 text-[13px] font-bold text-left px-2 text-gray-800 line-clamp-1 flex flex-col justify-center relative group">
                      {item.name}
                      <span className="text-[10px] font-normal text-blue-500">{item.priceReason}</span>
                    </div>
                    <div className="py-2 px-1">
                      <div className="flex items-center border border-gray-300 rounded-[3px] bg-white overflow-hidden focus-within:border-[#4F46E5]">
                        <span className="pl-1 text-gray-500 text-[12px] font-bold">₹</span>
                        <input 
                          type="number" 
                          value={item.mrp === '' ? '' : (item.mrp || item.price || 0)}
                          onChange={(e) => updateMrp(item.id, e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full text-center outline-none py-1 text-[13px] font-bold text-gray-700"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="py-2 px-1">
                      <div className="flex items-center border border-gray-300 rounded-[3px] bg-white overflow-hidden focus-within:border-[#4F46E5]">
                        <span className="pl-1 text-gray-500 text-[12px] font-bold">₹</span>
                        <input 
                          type="number" 
                          value={item.price === '' ? '' : item.price}
                          onChange={(e) => updatePrice(item.id, e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full text-center outline-none py-1 text-[13px] font-bold text-gray-700"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="py-2 px-1">
                      <input 
                        type="number" 
                        value={item.discount || ''}
                        onChange={(e) => updateDiscount(item.id, Number(e.target.value))}
                        className="w-full text-center border border-gray-300 rounded-[3px] py-1 outline-none focus:border-[#4F46E5] text-[13px] font-bold hide-arrows"
                        placeholder="0"
                      />
                    </div>
                    <div className="py-2 px-2">
                      <div className="flex items-center border border-gray-300 rounded-[3px] bg-white overflow-hidden">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold">-</button>
                        <input 
                          type="number" 
                          value={item.qty} 
                          onChange={(e) => updateQty(item.id, Number(e.target.value))}
                          className="w-full text-center outline-none text-[13px] font-bold hide-arrows" 
                        />
                        <button onClick={() => updateQty(item.id, item.qty + 1)} className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold">+</button>
                      </div>
                    </div>
                    <div className="py-2 text-[13px] font-bold text-gray-700">{(Number(item.creditSalePrice || 0)) * item.qty}</div>
                    <div className="py-2 text-[14px] font-bold text-[#28a745]">₹{item.total.toFixed(2)}</div>
                    <div className="py-2 flex items-center justify-center">
                      <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-full">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>

          {/* Cart Footer / Totals */}
          <div className="bg-[#1A1C29] p-3 text-white">
             <div className="grid grid-cols-3 gap-4">
               <div className="flex flex-col border-r border-gray-600 px-2">
                 <span className="text-[12px] text-gray-400 font-medium">TOTAL ITEMS</span>
                 <span className="text-[22px] font-bold text-[#ffc107]">{totalItems}</span>
               </div>
               <div className="flex flex-col border-r border-gray-600 px-2">
                 <span className="text-[12px] text-gray-400 font-medium">SUBTOTAL</span>
                 <span className="text-[20px] font-bold">₹{subtotal.toFixed(2)}</span>
               </div>
               <div className="flex flex-col px-2">
                 <span className="text-[12px] text-gray-400 font-medium">DISCOUNT (%)</span>
                 <input 
                   type="number" 
                   value={billDiscount || ''} 
                   onChange={(e) => setBillDiscount(Number(e.target.value) || 0)}
                   className="mt-1 w-full bg-gray-800 text-[#28a745] text-[18px] font-bold px-2 py-1 rounded-[4px] outline-none border border-gray-600 focus:border-[#4F46E5] hide-arrows"
                   placeholder="0"
                 />
               </div>
             </div>
          </div>
        </div>

        {/* Right Side: Quick Products & Payment (30%) */}
        <div className="w-full md:w-[350px] min-h-0 bg-white flex flex-col">
          
          {/* Payment Modes */}
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-[14px] font-bold text-gray-800 mb-3 uppercase tracking-wide">Payment Mode</h3>
            <div className="grid grid-cols-5 gap-2">
              <button 
                onClick={() => setPaymentMode('Cash')}
                className={cn(
                  "flex flex-col items-center justify-center py-2 rounded-[6px] border-2 transition-all",
                  paymentMode === 'Cash' ? "border-[#4F46E5] bg-indigo-50 text-[#4F46E5]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <Banknote className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold">CASH</span>
              </button>
              <button 
                onClick={() => setPaymentMode('Card')}
                className={cn(
                  "flex flex-col items-center justify-center py-2 rounded-[6px] border-2 transition-all",
                  paymentMode === 'Card' ? "border-[#4F46E5] bg-indigo-50 text-[#4F46E5]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold">CARD</span>
              </button>
              <button 
                onClick={() => setPaymentMode('UPI')}
                className={cn(
                  "flex flex-col items-center justify-center py-2 rounded-[6px] border-2 transition-all",
                  paymentMode === 'UPI' ? "border-[#4F46E5] bg-indigo-50 text-[#4F46E5]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <Smartphone className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold">UPI</span>
              </button>
              <button 
                onClick={() => setPaymentMode('Credit')}
                className={cn(
                  "flex flex-col items-center justify-center py-2 rounded-[6px] border-2 transition-all",
                  paymentMode === 'Credit' ? "border-[#4F46E5] bg-indigo-50 text-[#4F46E5]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <CreditCard className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold">CREDIT</span>
              </button>
              <button 
                onClick={() => setPaymentMode('Split')}
                className={cn(
                  "flex flex-col items-center justify-center py-2 rounded-[6px] border-2 transition-all",
                  paymentMode === 'Split' ? "border-[#4F46E5] bg-indigo-50 text-[#4F46E5]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                <Wallet className="w-5 h-5 mb-1" />
                <span className="text-[11px] font-bold">SPLIT</span>
              </button>
            </div>
            {paymentMode === 'Split' && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-[6px] border border-indigo-100 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-700">Cash:</span>
                  <input type="number" value={splitAmounts.Cash} onChange={e => setSplitAmounts({...splitAmounts, Cash: e.target.value})} className="w-[120px] border border-gray-300 rounded-[4px] px-2 py-1 text-[13px] outline-none text-right font-bold" placeholder="₹0.00" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-700">Card:</span>
                  <input type="number" value={splitAmounts.Card} onChange={e => setSplitAmounts({...splitAmounts, Card: e.target.value})} className="w-[120px] border border-gray-300 rounded-[4px] px-2 py-1 text-[13px] outline-none text-right font-bold" placeholder="₹0.00" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-700">UPI:</span>
                  <input type="number" value={splitAmounts.UPI} onChange={e => setSplitAmounts({...splitAmounts, UPI: e.target.value})} className="w-[120px] border border-gray-300 rounded-[4px] px-2 py-1 text-[13px] outline-none text-right font-bold" placeholder="₹0.00" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-700">Credit:</span>
                  <input type="number" value={splitAmounts.Credit} onChange={e => setSplitAmounts({...splitAmounts, Credit: e.target.value})} className="w-[120px] border border-gray-300 rounded-[4px] px-2 py-1 text-[13px] outline-none text-right font-bold" placeholder="₹0.00" />
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-indigo-200">
                  <label className="text-[12px] font-bold text-indigo-900 flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={useEarnedPoints} onChange={e => setUseEarnedPoints(e.target.checked)} className="cursor-pointer" />
                    Total Earned Pts:
                  </label>
                  <span className="text-[13px] font-bold text-green-600">
                    {totalEarnedPoints}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-indigo-200">
                  <span className="text-[12px] font-bold text-indigo-900">Total Split:</span>
                  <span className={cn("text-[13px] font-bold", ((Number(splitAmounts.Cash)||0) + (Number(splitAmounts.Card)||0) + (Number(splitAmounts.UPI)||0) + (Number(splitAmounts.Credit)||0)).toFixed(2) === finalAmount.toFixed(2) ? "text-green-600" : "text-red-600")}>
                    ₹{((Number(splitAmounts.Cash)||0) + (Number(splitAmounts.Card)||0) + (Number(splitAmounts.UPI)||0) + (Number(splitAmounts.Credit)||0)).toFixed(2)} / ₹{finalAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-indigo-200">
                  <span className="text-[12px] font-bold text-indigo-900">Remaining:</span>
                  <span className={cn("text-[13px] font-bold", (finalAmount - ((Number(splitAmounts.Cash)||0) + (Number(splitAmounts.Card)||0) + (Number(splitAmounts.UPI)||0) + (Number(splitAmounts.Credit)||0))) <= 0 ? "text-green-600" : "text-red-600")}>
                    ₹{Math.max(0, finalAmount - ((Number(splitAmounts.Cash)||0) + (Number(splitAmounts.Card)||0) + (Number(splitAmounts.UPI)||0) + (Number(splitAmounts.Credit)||0))).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
            {paymentMode !== 'Split' && (
              <div className="mt-3 p-2 bg-indigo-50 border border-indigo-100 rounded-[6px] flex items-center justify-between">
                 <label className="text-[12px] font-bold text-indigo-900 flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={useEarnedPoints} onChange={e => setUseEarnedPoints(e.target.checked)} className="cursor-pointer" />
                    Total Earned Pts:
                 </label>
                 <span className="text-[13px] font-bold text-green-600">
                    {totalEarnedPoints}
                 </span>
              </div>
            )}
          </div>

          {/* Quick Items Grid (Touch Friendly) */}
          <div className="flex-1 min-h-0 relative bg-gray-50">
            <div className="absolute inset-0 p-4 overflow-y-scroll">
             <div className="flex items-center justify-between mb-3">
               <h3 className="text-[14px] font-bold text-gray-800 uppercase tracking-wide">Quick Items</h3>
               <span className="text-[11px] font-bold bg-gray-200 px-2 py-0.5 rounded-full">Touch Friendly</span>
             </div>
             
             <div className="grid grid-cols-2 gap-2">
               {quickItems.map(p => (
                 <button 
                   key={p.id}
                   onClick={() => addToCart(p)}
                   className="bg-white border border-gray-200 p-2 rounded-[6px] text-left hover:border-[#4F46E5] hover:shadow-md transition-all flex flex-col active:scale-95"
                 >
                   <span className="text-[12px] font-bold text-gray-800 line-clamp-2 leading-tight h-[30px]">{p.name}</span>
                   <span className="text-[14px] font-bold text-[#28a745] mt-1">₹{calculateItemPrice(p, 1, paymentMode, isWholesale).price}</span>
                 </button>
               ))}
             </div>
            </div>
          </div>

          {/* Grand Total & Checkout */}
          <div className="p-4 bg-white border-t border-gray-200">
             {/* Offer Selection */}
             {activeOffers.length > 0 && (
               <div className="mb-3">
                 <select 
                   value={selectedOffer ? selectedOffer.id : ''}
                   onChange={(e) => {
                     const offerId = e.target.value;
                     if (!offerId) {
                       setSelectedOffer(null);
                     } else {
                       const offer = activeOffers.find(o => o.id === parseInt(offerId, 10));
                       setSelectedOffer(offer);
                     }
                   }}
                   className="w-full border border-[#4F46E5] text-[#4F46E5] font-bold rounded-[6px] px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#4F46E5] bg-[#f4f6f9] cursor-pointer"
                 >
                   <option value="">-- Select an Offer --</option>
                   {activeOffers.map(o => {
                     const applicable = isOfferApplicable(o, cart);
                     return (
                       <option key={o.id} value={o.id} disabled={!applicable}>
                         {o.name} ({o.offerValue}) {!applicable ? '(Not Applicable)' : ''}
                       </option>
                     );
                   })}
                 </select>
               </div>
             )}
             {customerId && (
               <div className="mb-3 p-2 bg-indigo-50 border border-indigo-100 rounded-[6px] flex flex-col gap-2">
                 <div className="flex justify-between items-center">
                   <span className="text-[12px] font-bold text-indigo-900">Available Pts: {customerPoints}</span>
                   <div className="flex items-center gap-2">
                     <span className="text-[12px] font-bold text-gray-700">Redeem:</span>
                     <input type="number" value={redeemedPoints} onChange={(e) => setRedeemedPoints(Math.min(customerPoints, Math.max(0, Number(e.target.value))))} className="w-[80px] border border-indigo-200 rounded-[4px] px-2 py-1 text-[13px] outline-none font-bold text-right" />
                   </div>
                 </div>
                </div>
              )}
             
             {typeof offerDiscountAmount !== 'undefined' && offerDiscountAmount > 0 && (
               <div className="flex items-center justify-between mb-2 px-1">
                 <span className="text-[13px] font-bold text-gray-500 uppercase">Offer Discount</span>
                 <span className="text-[15px] font-bold text-green-600">-₹{offerDiscountAmount.toFixed(2)}</span>
               </div>
             )}
             <div className="flex items-center justify-between mb-4">
               <span className="text-[16px] font-bold text-gray-600 uppercase">Net Payable</span>
               <span className="text-[32px] font-bold text-[#1A1C29]">₹{netPayableUI.toFixed(2)}</span>
             </div>
             
             <button 
               onClick={handleCheckout}
               className="w-full bg-[#28a745] hover:bg-[#218838] text-white py-4 rounded-[6px] text-[18px] font-bold uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-green-500/30 transition-all active:scale-[0.98]"
             >
               <CheckCircle2 className="w-6 h-6" /> PAY & PRINT BILL
             </button>
          </div>

        </div>
      </div>

      {/* Thermal Print Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-[8px] w-[350px] shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gray-100 p-3 flex items-center justify-between rounded-t-[8px] border-b border-gray-200">
              <h3 className="font-bold text-gray-800 text-[14px] flex items-center gap-2">
                <Printer className="w-4 h-4" /> Thermal Receipt (3-inch)
              </h3>
              <button onClick={() => {
                setIsPrintModalOpen(false);
                setCart([]); // Clear cart after print
                setCustomerName('');
                setCustomerId(null);
                setCustomerPoints(0);
                setRedeemedPoints(0);
                setUseEarnedPoints(false);
                setPaymentMode('Cash');
                setBillDiscount(0);
                setSelectedOffer(null);
                setSplitAmounts({ Cash: '', Card: '', UPI: '', Credit: '' });
              }} className="text-gray-500 hover:text-red-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto font-mono text-[12px] bg-white text-black print-receipt">
               <div className="text-center mb-4 border-b-2 border-dashed border-gray-300 pb-4">
                 <h2 className="text-[18px] font-bold uppercase tracking-widest">SWAYAM BILL BOOK RETAIL</h2>

                 <p className="text-[11px] mt-1">123, Main Market Road, City Center</p>
                 <p className="text-[11px]">GSTIN: 07AABCU9603R1ZN</p>
                 <p className="text-[11px]">Ph: +91 9876543210</p>
               </div>
               
               <div className="flex justify-between mb-2 text-[11px]">
                 <span>Bill No: INV-{Math.floor(1000 + Math.random() * 9000)}</span>
                 <span>Date: {new Date().toLocaleDateString()}</span>
               </div>
               <div className="flex justify-between mb-4 text-[11px]">
                 <span>Customer: {customerName || 'Cash'}</span>
                 <span>Mode: {paymentMode}</span>
               </div>
               
               <table className="w-full mb-4 border-b-2 border-dashed border-gray-300 pb-2">
                 <thead>
                   <tr className="border-y border-dashed border-gray-300">
                     <th className="text-left py-1 w-[50%]">Item</th>
                     <th className="text-center py-1">Qty</th>
                     <th className="text-right py-1">Amount</th>
                   </tr>
                 </thead>
                 <tbody>
                    {cart.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-1">
                          <span className="block line-clamp-1">{item.name}</span>
                        </td>
                        <td className="text-center py-1">{item.qty}</td>
                        <td className="text-right py-1">{item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                 </tbody>
               </table>
               
               <div className="flex justify-between mb-1">
                 <span>Subtotal:</span>
                 <span>{subtotal.toFixed(2)}</span>
               </div>
               <div className="flex justify-between mb-2">
                 <span>Includes Tax:</span>
                 <span>{totalTax.toFixed(2)}</span>
               </div>
               {billDiscount > 0 && (
                 <div className="flex justify-between mb-1 text-gray-700">
                   <span>Bill Discount ({billDiscount}%):</span>
                   <span>-₹{discountAmount.toFixed(2)}</span>
                 </div>
               )}
               
               {typeof offerDiscountAmount !== 'undefined' && offerDiscountAmount > 0 && (
                 <div className="flex justify-between mb-1 text-gray-700">
                   <span>Offer ({selectedOffer?.name || 'Applied'}):</span>
                   <span>-₹{offerDiscountAmount.toFixed(2)}</span>
                 </div>
               )}

               {redeemedPoints > 0 && (
                 <div className="flex justify-between mb-1 text-gray-700">
                   <span>Points Redeemed:</span>
                   <span>-₹{redeemedPoints.toFixed(2)}</span>
                 </div>
               )}

               {totalEarnedPoints > 0 && (
                 <div className="flex justify-between mb-2 text-gray-700">
                   <span>Points Earned:</span>
                   <span>+{totalEarnedPoints}</span>
                 </div>
               )}
               <div className="flex justify-between font-bold text-[14px] border-t border-dashed border-gray-300 pt-2 mb-6">
                 <span>GRAND TOTAL:</span>
                 <span>Rs. {finalAmount.toFixed(2)}</span>
               </div>
               
               <div className="text-center text-[10px] mt-4">
                  <p>*** Thank You For Shopping ***</p>
                  <p>Visit Again!</p>
                </div>

                {/* QR Code for payment/bill */}
                <div className="flex flex-col items-center mt-4 pt-3 border-t border-dashed border-gray-300 pb-8">
                  <p className="text-[10px] font-bold mb-2">Scan to View Full Bill</p>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/bill/${lastInvoiceNo}`)}`}
                    alt="Bill QR Code"
                    className="w-24 h-24"
                  />
                  <p className="text-[9px] mt-1 text-gray-500">Bill No: {lastInvoiceNo}</p>
                  <p className="text-[9px] text-gray-500">₹{finalAmount.toFixed(2)}</p>
                </div>
            </div>

            <div className="p-3 border-t border-gray-200 bg-gray-50 flex gap-2 rounded-b-[8px]">
              <button 
                onClick={() => {
                  window.print();
                  setIsPrintModalOpen(false);
                  setCart([]);
                  setCustomerName('');
                  setCustomerId(null);
                  setCustomerPoints(0);
                  setRedeemedPoints(0);
                  setUseEarnedPoints(false);
                  setPaymentMode('Cash');
                  setBillDiscount(0);
                  setSelectedOffer(null);
                  setSplitAmounts({ Cash: '', Card: '', UPI: '', Credit: '' });
                }}
                className="flex-1 bg-[#4F46E5] text-white py-2 rounded-[4px] font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#4338ca]"
              >
                <Printer className="w-4 h-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basic styles for print media and hiding arrows */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-arrows::-webkit-outer-spin-button,
        .hide-arrows::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .hide-arrows {
          -moz-appearance: textfield;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .print-receipt, .print-receipt * {
            visibility: visible;
          }
          .print-receipt {
            position: fixed;
            left: 0;
            top: 0;
            width: 80mm;
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

      <ItemMasterModal 
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        onSave={async (newItem) => {
          try {
            if (newItem.category && newItem.category.trim() !== '') {
              const catRes = await apiClient.get('/categories');
              const exists = (catRes.data?.data || []).some(
                c => c.name.toLowerCase() === newItem.category.trim().toLowerCase()
              );
              if (!exists) {
                await apiClient.post('/categories', {
                  name: newItem.category.trim(),
                  purchaseDiscount: 0,
                  saleDiscount: 0,
                  isActive: true,
                  attributes: []
                });
              }
            }

            const payload = {
              ...newItem,
              sku: newItem.sku || `SKU${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
              price: parseFloat(newItem.price) || 0,
              mrp: parseFloat(newItem.mrp) || 0,
              stock: parseInt(newItem.qty) || 0,
            };

            const res = await apiClient.post('/products', payload);
            if (res.data.success) {
              const savedProduct = res.data.data;
              savedProduct.qty = savedProduct.stock;
              savedProduct.hasBom = Boolean(savedProduct.hasBom);
              savedProduct.synced = true;
              setProducts(prev => [savedProduct, ...prev]);
              if (newItem.isQuickItem) {
                setQuickItems(prev => [savedProduct, ...prev]);
              }
            }
          } catch (error) {
            console.error('Failed to save product from POS:', error);
            alert('Failed to save product');
          }
        }}
      />
    </div>
  );
}
