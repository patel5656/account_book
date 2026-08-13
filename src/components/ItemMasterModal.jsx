import React, { useState, useEffect } from 'react';
import {
  X, Plus, Package, Barcode as BarcodeIcon, Globe, Image as ImageIcon,
  Settings, RefreshCw, Printer, Box, AlertTriangle, History, Edit
} from 'lucide-react';
import { SelectUnitsModal } from './SelectUnitsModal';
import { CategoryMasterModal } from './CategoryMasterModal';

export function ItemMasterModal({ isOpen, onClose, onSave, editData, products = [] }) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalEditData, setCategoryModalEditData] = useState(null);
  const [brand, setBrand] = useState('');
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [mrp, setMrp] = useState('');
  const [price, setPrice] = useState('');
  const [qty, setQty] = useState('');
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(true);

  // Advanced fields
  const [tax, setTax] = useState('');
  const [hsnCode, setHsnCode] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [creditSalePrice, setCreditSalePrice] = useState('');
  const [baseUnit, setBaseUnit] = useState('');
  const [purchaseUnit, setPurchaseUnit] = useState('');
  const [salesUnit, setSalesUnit] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [lowStockAlert, setLowStockAlert] = useState('');
  const [reorderLevel, setReorderLevel] = useState('');
  const [openingStockRate, setOpeningStockRate] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [warehouseList, setWarehouseList] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [location, setLocation] = useState('');

  const [isActive, setIsActive] = useState(true);
  const [activeTab, setActiveTab] = useState('basic');

  // Variant states
  const [memorySize, setMemorySize] = useState('');
  const [colorVariant, setColorVariant] = useState('');
  const [designModel, setDesignModel] = useState('');

  const [subItemsList, setSubItemsList] = useState([]);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [variantInput, setVariantInput] = useState({ size: '', color: '', qty: '', barcode: '', mrp: '', price: '' });
  const [editingVariantIdx, setEditingVariantIdx] = useState(null);

  const [isSizeDropdownOpen, setIsSizeDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);

  const defaultSizes = ['XLL', 'S', 'M', 'L', 'XL', 'XXL', '3XL', ...Array.from({ length: 44 }, (_, i) => String(i + 1))];
  const defaultColors = [
    { name: 'Black', hex: '#000000' },
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Blue', hex: '#2563EB' },
    { name: 'Red', hex: '#EF4444' },
    { name: 'Green', hex: '#10B981' },
    { name: 'Yellow', hex: '#FBBF24' },
    { name: 'Brown', hex: '#78350F' },
    { name: 'Silver', hex: '#D1D5DB' },
    { name: 'Gold', hex: '#F59E0B' },
    { name: 'Gray', hex: '#6B7280' },
    { name: 'Pink', hex: '#EC4899' },
    { name: 'Orange', hex: '#F97316' },
    { name: 'Purple', hex: '#8B5CF6' }
  ];

  const getColorHex = (colorName) => {
    const matched = defaultColors.find(c => c.name.toLowerCase() === colorName.toLowerCase());
    if (matched) return matched.hex;
    const standardColors = ['black','white','blue','red','green','yellow','brown','silver','gold','gray','pink','orange','purple'];
    if (standardColors.includes(colorName.toLowerCase())) return colorName.toLowerCase();
    return '#E2E8F0';
  };

  const getCombinedSizes = () => {
    const catSizes = getAttributeOptions('size');
    const merged = [...catSizes];
    defaultSizes.forEach(ds => {
      if (!merged.some(cs => cs.toLowerCase() === ds.toLowerCase())) {
        merged.push(ds);
      }
    });
    return merged;
  };

  const getCombinedColors = () => {
    const catColors = getAttributeOptions('color');
    const merged = catColors.map(c => ({ name: c, hex: getColorHex(c) }));
    defaultColors.forEach(dc => {
      if (!merged.some(mc => mc.name.toLowerCase() === dc.name.toLowerCase())) {
        merged.push(dc);
      }
    });
    return merged;
  };

  const getAttributeOptions = (attrName) => {
    const attr = selectedCategoryConfig?.attributes?.find(
      a => a.name.toLowerCase() === attrName.toLowerCase()
    );
    if (!attr) return [];
    if (Array.isArray(attr.options)) return attr.options;
    if (typeof attr.options === 'string') {
      try {
        const parsed = JSON.parse(attr.options);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
      return attr.options.split(',').map(o => o.trim()).filter(Boolean);
    }
    return [];
  };

  const handleBadgeClick = (field, option) => {
    const currentVal = variantInput[field] || '';
    const parts = currentVal.split(',').map(p => p.trim()).filter(Boolean);
    let nextVal = '';
    if (parts.includes(option)) {
      nextVal = parts.filter(p => p !== option).join(', ');
    } else {
      parts.push(option);
      nextVal = parts.join(', ');
    }
    setVariantInput(prev => ({ ...prev, [field]: nextVal }));
  };

  // Dynamic Attribute States
  const [categoriesList, setCategoriesList] = useState([]);
  const [selectedCategoryConfig, setSelectedCategoryConfig] = useState(null);
  const [dynamicValues, setDynamicValues] = useState({});
  const [activeMultiSelectField, setActiveMultiSelectField] = useState(null);
  const [customInputs, setCustomInputs] = useState({});

  // Inventory tracking states
  const [enableBatch, setEnableBatch] = useState(false);
  const [enableExpiry, setEnableExpiry] = useState(false);
  const [enableImei, setEnableImei] = useState(false);

  // BOM states
  const [hasBom, setHasBom] = useState(false);
  const [bomName, setBomName] = useState('');
  const [isMultiLevel, setIsMultiLevel] = useState(false);
  const [bomRecipe, setBomRecipe] = useState([]);
  const [tempRawMaterial, setTempRawMaterial] = useState('');
  const [tempQty, setTempQty] = useState('');
  const [tempUnit, setTempUnit] = useState('PCS');

  const [isSelectUnitsModalOpen, setIsSelectUnitsModalOpen] = useState(false);
  const [showInventoryStock, setShowInventoryStock] = useState(false);
  const [secQty, setSecQty] = useState('');
  const [asOfDate, setAsOfDate] = useState(() => new Date().toISOString().split('T')[0]);

  const addBomItem = (e) => {
    if (e) e.preventDefault();

    // Calculate current cost dynamically
    const calculateBomCost = () => {
      return bomRecipe.reduce((total, item) => {
        const prod = products.find(p => p.id.toString() === item.productId?.toString());
        const price = prod ? (prod.purchasePrice || prod.price || prod.mrp || 0) : 0;
        return total + (parseFloat(item.quantity) * parseFloat(price));
      }, 0);
    };
    if (!tempRawMaterial || !tempQty) return;
    const selectedProd = products.find(p => p.id.toString() === tempRawMaterial);
    setBomRecipe([...bomRecipe, {
      productId: tempRawMaterial,
      name: selectedProd ? selectedProd.name : 'Unknown',
      quantity: tempQty,
      unit: tempUnit
    }]);
    setTempRawMaterial('');
    setTempQty('');
  };

  const removeBomItem = (idx) => {
    setBomRecipe(bomRecipe.filter((_, i) => i !== idx));
  };

  // Online Sync states
  const [syncOnline, setSyncOnline] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [onlineProductName, setOnlineProductName] = useState('');
  const [onlineProductDesc, setOnlineProductDesc] = useState('');
  const [onlineSalePrice, setOnlineSalePrice] = useState('');
  const [ecommerceCategory, setEcommerceCategory] = useState('');

  // Pricing states
  const [qtySlabs, setQtySlabs] = useState([]);
  const [slabError, setSlabError] = useState('');

  const handlePrintLabels = () => {
    if (!barcode) return;
    const bars = [];
    for (let i = 0; i < barcode.length; i++) {
      const code = barcode.charCodeAt(i);
      const w = (code % 3) + 1;
      bars.push(w);
    }
    const barsHtml = bars.map(w => `<div style="display:inline-block;height:60px;width:${w * 2}px;background:#000;margin:0 1px;"></div>`).join('');

    const printWin = window.open('', '_blank', 'width=400,height=300');
    printWin.document.write(`
      <html>
        <head>
          <title>Barcode Label - ${name || 'Item'}</title>
          <style>
            body { margin: 0; font-family: monospace; }
            .label { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:16px; page-break-after:always; }
            .item-name { font-size:13px; font-weight:bold; margin-bottom:6px; }
            .bars { display:flex; align-items:flex-end; margin-bottom:4px; }
            .barcode-text { font-size:12px; letter-spacing:4px; }
            .price { font-size:14px; font-weight:bold; margin-top:6px; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="item-name">${name || ''}</div>
            <div class="bars">${barsHtml}</div>
            <div class="barcode-text">${barcode}</div>
            ${mrp ? `<div class="price">MRP: ₹${mrp}</div>` : ''}
          </div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setName(editData.name || '');
        setSku(editData.sku || '');
        setCategory(editData.category || '');
        setBrand(editData.brand || '');
        setMrp(editData.mrp?.toString() || '');
        setPrice(editData.price?.toString() || '');
        const initialQty = editData.qty !== undefined ? editData.qty : editData.stock;
        setQty(initialQty !== undefined && initialQty !== null ? initialQty.toString() : '');
        setDescription(editData.description || '');
        setBarcode(editData.barcode || '');
        setIsActive(editData.status === 'ACTIVE' || editData.status === 'Active');

        setMemorySize(editData.memorySize || '');
        setColorVariant(editData.colorVariant || '');
        setDesignModel(editData.designModel || '');

        if (editData.attributeValues) {
          const vals = {};
          editData.attributeValues.forEach(av => {
            vals[av.attributeId] = av.value;
          });
          setDynamicValues(vals);
        }
        setEnableImei(editData.enableImei || false);
        setTax(editData.tax?.toString() || '');
        setHsnCode(editData.hsnCode || '');
        setPurchasePrice(editData.purchasePrice?.toString() || '');
        setWholesalePrice(editData.wholesalePrice?.toString() || '');
        setCreditSalePrice(editData.creditSalePrice?.toString() || '');
        setBaseUnit(editData.baseUnit || '');
        setPurchaseUnit(editData.purchaseUnit || '');
        setSalesUnit(editData.salesUnit || '');
        setConversionRate(editData.conversionRate?.toString() || '');
        setLowStockAlert(editData.lowStockAlert?.toString() || '');
        setReorderLevel(editData.reorderLevel?.toString() || '');
        setOpeningStockRate(editData.openingStockRate?.toString() || '');
        setSecQty(editData.secOpeningQty?.toString() || '');
        setWarehouse(editData.warehouse || '');
        setEnableBatch(editData.enableBatch || false);
        setEnableExpiry(editData.enableExpiry || false);
        setHasBom(editData.hasBom || false);
        setBomName(editData.bomName || '');
        setIsMultiLevel(editData.isMultiLevel || false);
        try {
          const recipe = typeof editData.bomRecipe === 'string' ? JSON.parse(editData.bomRecipe) : editData.bomRecipe;
          setBomRecipe(Array.isArray(recipe) ? recipe : []);
        } catch (e) { setBomRecipe([]); }
        setSyncOnline(editData.syncOnline || false);
        setOnlineProductName(editData.onlineProductName || '');
        setOnlineProductDesc(editData.onlineProductDesc || '');
        setOnlineSalePrice(editData.onlineSalePrice?.toString() || '');
        setEcommerceCategory(editData.ecommerceCategory || '');
        setImagePreview(editData.productImage || null);
        try {
          const slabs = typeof editData.qtySlabs === 'string' ? JSON.parse(editData.qtySlabs) : editData.qtySlabs;
          setQtySlabs(Array.isArray(slabs) ? slabs : []);
        } catch (e) { setQtySlabs([]); }
        try {
          const sub = typeof editData.subItems === 'string' ? JSON.parse(editData.subItems) : editData.subItems;
          const parsedSubItems = Array.isArray(sub) ? sub : [];
          setSubItemsList(parsedSubItems);

          if ((!editData.mrp || editData.mrp === '0' || editData.mrp === 0) && parsedSubItems.length > 0) {
            const firstWithMrp = parsedSubItems.find(s => s.mrp > 0);
            if (firstWithMrp) setMrp(firstWithMrp.mrp.toString());
          }
          if ((!editData.price || editData.price === '0' || editData.price === 0) && parsedSubItems.length > 0) {
            const firstWithPrice = parsedSubItems.find(s => s.price > 0);
            if (firstWithPrice) setPrice(firstWithPrice.price.toString());
          }
        } catch (e) { setSubItemsList([]); }
      } else {
        setName(''); setSku(''); setCategory(''); setBrand(''); setMrp(''); setPrice(''); setQty(''); setDescription(''); setBarcode(''); setIsActive(true); setDynamicValues({}); setEnableImei(false);
        setMemorySize(''); setColorVariant(''); setDesignModel('');
        setTax(''); setHsnCode(''); setPurchasePrice(''); setWholesalePrice(''); setCreditSalePrice(''); setBaseUnit(''); setPurchaseUnit(''); setSalesUnit(''); setConversionRate(''); setLowStockAlert(''); setReorderLevel(''); setOpeningStockRate(''); setSecQty(''); setWarehouse(''); setEnableBatch(false); setEnableExpiry(false); setHasBom(false); setQtySlabs([]); setBomName(''); setIsMultiLevel(false); setBomRecipe([]); setTempRawMaterial(''); setTempQty(''); setSyncOnline(false); setOnlineProductName(''); setOnlineProductDesc(''); setOnlineSalePrice(''); setEcommerceCategory(''); setImagePreview(null);
        setSubItemsList([]);
        setVariantInput({ size: '', color: '', qty: '', barcode: '', mrp: '', price: '' });
        setEditingVariantIdx(null);
        setSelectedBranchId(''); setSelectedLocationId(''); setLocation('');
      }
    }
  }, [isOpen, editData]);

  useEffect(() => {
    if (editData && warehouseList.length > 0) {
      const matchedWh = warehouseList.find(w => w.name === editData.warehouse);
      if (matchedWh) {
        setSelectedBranchId(matchedWh.branchId ? matchedWh.branchId.toString() : '');
        setSelectedLocationId(matchedWh.locationId ? matchedWh.locationId.toString() : '');
        setWarehouse(matchedWh.name);
      }
    }
  }, [editData, warehouseList]);

  useEffect(() => {
    if (warehouse && warehouseList.length > 0) {
      const matchedWh = warehouseList.find(w => w.name === warehouse);
      if (matchedWh) {
        setLocation(matchedWh.locRef?.name || matchedWh.location || '');
      }
    } else {
      setLocation('');
    }
  }, [warehouse, warehouseList]);

  useEffect(() => {
    if (!isOpen) return;
    const handleCategoryAdded = async (e) => {
      const newCat = e.detail;
      // Refresh categories list from backend so new category appears in dropdown
      try {
        const { default: apiClient } = await import('../api/apiClient');
        const res = await apiClient.get('/categories');
        if (res.data && res.data.data) {
          setCategoriesList(res.data.data);
        }
      } catch (err) {
        // Fallback: update locally
        setCategoriesList(prev => {
          const idx = prev.findIndex(c => c.name.toLowerCase() === newCat.name.toLowerCase());
          if (idx !== -1) return prev;
          return [...prev, { ...newCat, id: newCat.id || Date.now() }];
        });
      }
      setCategory(newCat.name);
    };
    window.addEventListener('categoryAdded', handleCategoryAdded);
    return () => window.removeEventListener('categoryAdded', handleCategoryAdded);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchWarehouses();
      fetchUnits();
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const { default: apiClient } = await import('../api/apiClient');
      const res = await apiClient.get('/categories');
      if (res.data && res.data.data) {
        setCategoriesList(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (categoriesList.length > 0 && category) {
      const config = categoriesList.find(c => c.name === category);
      setSelectedCategoryConfig(config || null);
    } else {
      setSelectedCategoryConfig(null);
    }
  }, [categoriesList, category]);

  const handleDynamicChange = (attributeId, value, isMulti) => {
    if (isMulti) {
      setDynamicValues(prev => {
        const current = Array.isArray(prev[attributeId]) ? prev[attributeId] : [];
        if (current.includes(value)) {
          return { ...prev, [attributeId]: current.filter(v => v !== value) };
        } else {
          return { ...prev, [attributeId]: [...current, value] };
        }
      });
    } else {
      setDynamicValues(prev => ({ ...prev, [attributeId]: value }));
    }
  };

  const fetchUnits = async () => {
    try {
      const { default: apiClient } = await import('../api/apiClient');
      const res = await apiClient.get('/units');
      if (res.data && res.data.data) {
        setUnitList(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch units:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const { default: apiClient } = await import('../api/apiClient');
      const [whRes, brRes, locRes] = await Promise.all([
        apiClient.get('/warehouses'),
        apiClient.get('/branches'),
        apiClient.get('/locations')
      ]);
      if (whRes.data?.success) {
        setWarehouseList(whRes.data.data);
      }
      if (brRes.data?.success) {
        setBranchList(brRes.data.data);
      }
      if (locRes.data?.success) {
        setLocationList(locRes.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch warehouses, branches, locations:', error);
    }
  };

  const getNextBarcode = () => {
    let max = 999;
    products.forEach(p => {
      if (p.barcode) {
        const num = parseInt(p.barcode, 10);
        if (!isNaN(num) && num.toString() === p.barcode && num > max) {
          max = num;
        }
      }
    });
    return (max + 1).toString();
  };

  const handleSave = () => {
    setSlabError('');
    if (qtySlabs.length > 0) {
      for (let i = 0; i < qtySlabs.length; i++) {
        const slab = qtySlabs[i];
        const min = Number(slab.minQty);
        const max = Number(slab.maxQty);
        const price = Number(slab.price);

        if (slab.minQty === '' || slab.maxQty === '') {
          setSlabError(`Slab ${i + 1}: Min and Max quantity cannot be empty.`);
          setActiveTab('basic');
          return;
        }
        if (min >= max) {
          setSlabError(`Slab ${i + 1}: Min Quantity (${min}) must be less than Max Quantity (${max}).`);
          setActiveTab('basic');
          return;
        }
        if (!slab.price || price <= 0) {
          setSlabError(`Slab ${i + 1}: Special Price cannot be empty or zero.`);
          setActiveTab('basic');
          return;
        }
      }

      const sortedSlabs = [...qtySlabs].sort((a, b) => Number(a.minQty) - Number(b.minQty));
      for (let i = 0; i < sortedSlabs.length - 1; i++) {
        if (Number(sortedSlabs[i].maxQty) >= Number(sortedSlabs[i + 1].minQty)) {
          setSlabError(`Slabs cannot overlap. Overlap found between Max Qty ${sortedSlabs[i].maxQty} and Min Qty ${sortedSlabs[i + 1].minQty}.`);
          setActiveTab('basic');
          return;
        }
      }
    }

    // Extract values from form elements
    const newItem = {
      name: name || 'New Item',

      attributeValues: Object.keys(dynamicValues).map(key => ({
        attributeId: parseInt(key, 10),
        value: dynamicValues[key]
      })),

      category: category || '',
      brand: brand || '',
      sku: sku || `SKU${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      barcode: barcode || getNextBarcode(),
      mrp: (mrp && mrp !== '0') ? mrp : (subItemsList.find(s => s.mrp > 0)?.mrp?.toString() || '0'),
      price: (price && price !== '0') ? price : (subItemsList.find(s => s.price > 0)?.price?.toString() || '0'),
      qty: qty || '0',
      description: description,
      status: isActive ? 'Active' : 'Inactive',
      hasBom: hasBom,
      memorySize: memorySize,
      colorVariant: colorVariant,
      designModel: designModel,
      subItems: subItemsList,

      enableImei: enableImei,
      tax: tax,
      hsnCode: hsnCode,
      purchasePrice: purchasePrice,
      wholesalePrice: wholesalePrice,
      creditSalePrice: creditSalePrice,
      baseUnit: baseUnit,
      purchaseUnit: purchaseUnit,
      salesUnit: salesUnit,
      lowStockAlert: lowStockAlert,
      reorderLevel: reorderLevel,
      openingStockRate: openingStockRate,
      secOpeningQty: secQty,
      asOfDate: asOfDate,
      warehouse: warehouse,
      location: location,
      enableBatch: enableBatch,
      enableExpiry: enableExpiry,
      qtySlabs: qtySlabs,
      hasBom: hasBom,
      bomName: bomName,
      isMultiLevel: isMultiLevel,
      bomRecipe: bomRecipe,
      syncOnline: syncOnline,
      onlineProductName: onlineProductName,
      onlineProductDesc: onlineProductDesc,
      onlineSalePrice: onlineSalePrice,
      ecommerceCategory: ecommerceCategory,
      productImage: imagePreview
    };

    if (onSave) {
      onSave(newItem);
    }

    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'basic', label: 'Basic Details', icon: Package },
    { id: 'inventory', label: 'Inventory & Tracking', icon: Box },
    { id: 'bom', label: 'Bill of Materials', icon: Settings },
    { id: 'barcode', label: 'Barcode', icon: BarcodeIcon },
    { id: 'online', label: 'Online Store', icon: Globe },
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(98vw,950px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 h-[90vh] md:h-auto md:max-h-[90vh]">

        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Advanced Item Master
          </h2>
          <button
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors"
          >
            <X className="w-5 h-5 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 border-b border-gray-200 px-4 pt-3 gap-1 overflow-x-auto custom-scrollbar flex-shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-[13px] font-bold rounded-t-[3px] transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-white text-[#4F46E5] border-x border-t border-gray-200 border-b-0 -mb-[1px] relative z-10'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-200 border border-transparent'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Body content based on active tab */}
        <div className="p-4 md:p-6 bg-white overflow-y-auto custom-scrollbar flex-1 min-h-[400px]">

          {/* TAB 1: BASIC DETAILS */}
          {activeTab === 'basic' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[14px] font-bold text-gray-800 mb-1 block">Item Name</label>
                  <input id="item_name_input" value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Enter Item Name" className="w-full border border-[#4F46E5] bg-[#e8e5ff] placeholder-gray-500 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold" />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[14px] font-bold text-gray-800">Item Code / SKU</label>
                  <input id="item_sku_input" value={sku} onChange={e => setSku(e.target.value)} type="text" placeholder="Enter Item Code / SKU" className="w-full border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white" />
                </div>
                <div className="flex flex-col gap-1 w-full pl-2">
                  <label className="text-[14px] font-bold text-gray-800 mb-1 block">Status</label>
                  <div className="flex items-center gap-3 mt-1">
                    <div
                      className={`w-[44px] h-[24px] rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-[#28a745]' : 'bg-gray-400'}`}
                      onClick={() => setIsActive(!isActive)}
                    >
                      <div className={`w-[20px] h-[20px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isActive ? 'translate-x-[22px]' : 'translate-x-[2px]'}`}></div>
                    </div>
                    <span className={`text-[14px] font-bold ${isActive ? 'text-[#28a745]' : 'text-gray-500'}`}>{isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[14px] font-bold text-gray-800">Product Description</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-gray-600">{showDescription ? 'Visible' : 'Hidden'}</span>
                    <div
                      className={`w-[36px] h-[20px] rounded-full relative cursor-pointer transition-colors ${showDescription ? 'bg-[#4F46E5]' : 'bg-gray-300'}`}
                      onClick={() => setShowDescription(!showDescription)}
                    >
                      <div className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${showDescription ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                    </div>
                  </div>
                </div>
                {showDescription && (
                  <textarea rows="2" value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter Product Description" className="w-full border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white resize-none animate-in fade-in slide-in-from-top-2 duration-200"></textarea>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-b border-gray-100 pb-5">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[13px] font-bold text-gray-800">Category</label>
                  <div className="relative">
                    <input
                      id="item_category_input"
                      value={category}
                      onChange={e => {
                         setCategory(e.target.value);
                         setShowCategoryDropdown(true);
                      }}
                      onFocus={() => setShowCategoryDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                      placeholder="Select or enter category"
                      className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white"
                      autoComplete="off"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const exists = categoriesList.find(cat => cat.name.toLowerCase() === category.toLowerCase());
                          if (!exists && category.trim() !== '') {
                            setShowCategoryDropdown(false);
                            setCategoryModalEditData({ name: category.trim() });
                            setIsCategoryModalOpen(true);
                          } else {
                            setShowCategoryDropdown(false);
                          }
                        }
                      }}
                    />
                    {showCategoryDropdown && (
                      <div 
                        className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg z-[100] rounded-b-[4px] max-h-[200px] overflow-y-auto pos-product-scroll"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {categoriesList
                          .filter(cat => cat.name.toLowerCase().includes(category.toLowerCase()))
                          .map(cat => (
                            <div
                              key={cat.id}
                              onMouseDown={() => {
                                setCategory(cat.name);
                                setShowCategoryDropdown(false);
                              }}
                              className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-0 text-[13px] text-gray-800 font-medium"
                            >
                              {cat.name}
                            </div>
                        ))}
                        {categoriesList.filter(cat => cat.name.toLowerCase().includes(category.toLowerCase())).length === 0 && category.trim() !== '' && (
                          <div 
                            className="px-3 py-2 text-[12px] text-[#4F46E5] font-bold cursor-pointer hover:bg-indigo-50"
                            onMouseDown={() => {
                              setShowCategoryDropdown(false);
                              setCategoryModalEditData({ name: category.trim() });
                              setIsCategoryModalOpen(true);
                            }}
                          >
                            + Create "{category}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-full relative">
                  <label className="text-[13px] font-bold text-gray-800">Brand</label>
                  <input
                    id="item_brand_input"
                    type="text"
                    placeholder="Enter Brand"
                    value={brand}
                    onChange={e => {
                      setBrand(e.target.value);
                      setShowBrandDropdown(true);
                    }}
                    onFocus={() => setShowBrandDropdown(true)}
                    onBlur={() => setTimeout(() => setShowBrandDropdown(false), 200)}
                    autoComplete="off"
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white"
                  />
                  {showBrandDropdown && (
                    <div 
                      className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg z-[100] rounded-b-[4px] max-h-[200px] overflow-y-auto pos-product-scroll mt-1"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {[...new Set(products.map(p => p.brand).filter(Boolean))]
                        .filter(b => b.toLowerCase().includes(brand.toLowerCase()))
                        .map((b, idx) => (
                          <div
                            key={idx}
                            onMouseDown={() => {
                              setBrand(b);
                              setShowBrandDropdown(false);
                            }}
                            className="px-3 py-2 hover:bg-indigo-50 cursor-pointer border-b border-gray-100 last:border-0 text-[13px] text-gray-800 font-medium"
                          >
                            {b}
                          </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[13px] font-bold text-gray-800">GST / Tax (%)</label>
                  <input
                    type="number"
                    value={tax} onChange={e => setTax(e.target.value)}
                    placeholder="e.g. 18"
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[13px] font-bold text-gray-800">HSN Code</label>
                  <input type="text" value={hsnCode} onChange={e => setHsnCode(e.target.value)} placeholder="e.g. 8517" className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white" />
                </div>
              </div>

              {/* Dynamic Category Attributes completely disabled per request */}

              {/* Advanced Unit System & Stock Details Row */}
              <div className={`grid grid-cols-1 ${showInventoryStock ? 'md:grid-cols-2' : ''} gap-4 mt-2`}>
                {/* Advanced Unit System */}
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-[3px]">
                  <h4 className="text-[14px] font-bold text-blue-900 mb-3 flex items-center justify-between">
                    Unit Conversions
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-bold text-blue-800">Opening Stock</span>
                        <div
                          className={`w-[36px] h-[20px] rounded-full relative cursor-pointer transition-colors ${showInventoryStock ? 'bg-[#4F46E5]' : 'bg-gray-400'}`}
                          onClick={() => setShowInventoryStock(!showInventoryStock)}
                        >
                          <div className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${showInventoryStock ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                        </div>
                      </div>
                      <button className="text-[12px] bg-white border border-blue-200 text-blue-700 px-2 py-1 rounded-[3px] shadow-sm flex items-center gap-1 hover:bg-blue-100 transition-colors" onClick={() => setIsSelectUnitsModalOpen(true)}>
                        <Plus className="w-3 h-3" /> Manage Units
                      </button>
                    </div>
                  </h4>
                  <div className="grid grid-cols-1 gap-4 items-end mt-4">
                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-[13px] font-bold text-gray-700">Base Unit (Reporting)</label>
                      <input
                        readOnly
                        onClick={() => setIsSelectUnitsModalOpen(true)}
                        value={baseUnit ? (purchaseUnit && purchaseUnit !== baseUnit ? `${baseUnit} - ${purchaseUnit}` : baseUnit) : ''}
                        placeholder="Select Unit"
                        className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-blue-500 bg-white cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-[13px] font-bold text-gray-700">Purchase Unit</label>
                      <input list="purchaseUnitOptions" value={purchaseUnit} onChange={e => setPurchaseUnit(e.target.value)} placeholder="Select or type unit" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 bg-white" />
                      <datalist id="purchaseUnitOptions">
                        {unitList.map(u => <option key={u.id} value={u.name} />)}
                        {unitList.length === 0 && <option value="BOX" />}
                      </datalist>
                    </div>
                    <div className="flex flex-col gap-1 w-full">
                      <label className="text-[13px] font-bold text-gray-700">Sales Unit</label>
                      <input list="salesUnitOptions" value={salesUnit} onChange={e => setSalesUnit(e.target.value)} placeholder="Select or type unit" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 bg-white" />
                      <datalist id="salesUnitOptions">
                        {unitList.map(u => <option key={u.id} value={u.name} />)}
                        {unitList.length === 0 && <option value="PCS" />}
                      </datalist>
                    </div>
                  </div>
                </div>

                {/* INVENTORY STOCK DETAILS */}
                {showInventoryStock && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-[3px]">
                    <h4 className="text-[14px] font-bold text-[#0f172a] mb-4 flex items-center gap-2 uppercase tracking-wide">
                      <Box className="w-4 h-4 text-[#f97316]" strokeWidth={2.5} />
                      Inventory Stock Details
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-bold text-gray-700">Primary Opening Qty</label>
                        <input type="number" value={qty} onChange={e => setQty(e.target.value)} className="border border-slate-400 rounded-[4px] px-3 py-1.5 text-[14px] outline-none" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-bold text-gray-700">Unit</label>
                        <input type="text" readOnly value={baseUnit || purchaseUnit || ''} className="border border-slate-400 rounded-[4px] px-3 py-1.5 text-[14px] outline-none bg-slate-50" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-bold text-gray-700">Sec Opening Qty</label>
                        <input type="number" value={secQty} onChange={e => setSecQty(e.target.value)} className="border border-slate-400 rounded-[4px] px-3 py-1.5 text-[14px] outline-none" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-bold text-gray-700">Unit</label>
                        <input type="text" readOnly value={salesUnit || ''} className="border border-slate-400 rounded-[4px] px-3 py-1.5 text-[14px] outline-none bg-slate-50" />
                      </div>
                    </div>
                    <div className="border-t border-dashed border-slate-400 my-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-bold text-gray-700">Opening Purchase Price</label>
                        <div className="flex">
                          <span className="bg-slate-200 border border-r-0 border-slate-400 rounded-l-[4px] px-3 py-1.5 flex items-center justify-center text-slate-700">₹</span>
                          <input type="number" value={openingStockRate} onChange={e => setOpeningStockRate(e.target.value)} className="border border-slate-400 rounded-r-[4px] px-3 py-1.5 text-[14px] outline-none flex-1" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-bold text-gray-700">As of Date</label>
                        <input type="date" value={asOfDate} onChange={e => setAsOfDate(e.target.value)} className="border border-slate-400 rounded-[4px] px-3 py-1.5 text-[14px] outline-none" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pb-4">
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[13px] font-bold text-gray-800">MRP</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-[13px]">₹</span>
                    <input id="item_mrp_input" value={mrp} onChange={e => setMrp(e.target.value)} type="number" placeholder="0.00" className="w-full border border-gray-300 rounded-[3px] pl-6 pr-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] bg-white text-right font-bold" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[13px] font-bold text-gray-800">Purchase Price</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-[13px]">₹</span>
                    <input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="0.00" className="w-full border border-gray-300 rounded-[3px] pl-6 pr-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] bg-white text-right font-bold" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[13px] font-bold text-gray-800">Sale Price</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-[13px]">₹</span>
                    <input id="item_saleprice_input" value={price} onChange={e => setPrice(e.target.value)} type="number" placeholder="0.00" className="w-full border border-gray-300 rounded-[3px] pl-6 pr-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] bg-white text-right font-bold" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[13px] font-bold text-gray-800">Wholesale Price</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-[13px]">₹</span>
                    <input type="number" value={wholesalePrice} onChange={e => setWholesalePrice(e.target.value)} placeholder="0.00" className="w-full border border-gray-300 rounded-[3px] pl-6 pr-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] bg-[#fff8e1] text-right font-bold" />
                  </div>
                </div>
                <div className="flex flex-col gap-1 w-full">
                  <label className="text-[13px] font-bold text-gray-800">Loyalty Points (Pts)</label>
                  <div className="relative">
                    <input type="number" value={creditSalePrice} onChange={e => setCreditSalePrice(e.target.value)} placeholder="0" className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] bg-[#e1f5fe] text-right font-bold" />
                  </div>
                </div>
              </div>

              {/* Product Variants section */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-4 mt-2">
                <div>
                  <h4 className="text-[14px] font-bold text-gray-800">Product Variants</h4>
                  <p className="text-[11px] text-gray-500">Configure size, color, stock qty, barcode, and custom rates for each variant.</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); setIsVariantModalOpen(true); }}
                  className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <Settings className="w-4 h-4" />
                  Manage Variants ({subItemsList.length})
                </button>
              </div>

              {subItemsList.length > 0 && (
                <div className="border border-gray-200 rounded-[3px] overflow-hidden text-[12px] bg-gray-50 mt-1 max-h-[160px] overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold sticky top-0">
                        <th className="p-2">Size</th>
                        <th className="p-2">Color</th>
                        <th className="p-2">Qty (Number)</th>
                        <th className="p-2">Barcode</th>
                        <th className="p-2 text-right">MRP</th>
                        <th className="p-2 text-right">Sale Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subItemsList.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100 last:border-0 bg-white hover:bg-gray-50">
                          <td className="p-2 font-medium">{item.size || '-'}</td>
                          <td className="p-2 font-medium">{item.color || '-'}</td>
                          <td className="p-2">{item.qty || 0}</td>
                          <td className="p-2 font-mono">{item.barcode || '-'}</td>
                          <td className="p-2 text-right font-bold">₹{item.mrp || 0}</td>
                          <td className="p-2 text-right font-bold text-green-700">₹{item.price || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Special Quantity Wise Pricing */}
              <div className="bg-green-50 border border-green-200 p-4 rounded-[3px] mt-2">
                <h4 className="text-[14px] font-bold text-green-900 mb-3 flex items-center justify-between">
                  Special Quantity Wise Pricing
                  <button
                    onClick={() => { setSlabError(''); setQtySlabs([...qtySlabs, { minQty: '', maxQty: '', price: '' }]); }}
                    className="text-[12px] bg-white border border-green-300 text-green-700 px-2 py-1 rounded-[3px] shadow-sm flex items-center gap-1 hover:bg-green-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" /> Add Slab
                  </button>
                </h4>
                {slabError && <div className="text-red-600 text-[12px] font-bold mb-3 p-2 bg-red-50 border border-red-200 rounded-[3px]">{slabError}</div>}
                {qtySlabs.length === 0 ? (
                  <p className="text-[12px] text-green-700 italic">No quantity slabs defined. Regular prices will apply.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="grid grid-cols-12 gap-2 px-2 pb-1 border-b border-green-200 text-[12px] font-bold text-green-800">
                      <div className="col-span-4">Min Quantity</div>
                      <div className="col-span-4">Max Quantity</div>
                      <div className="col-span-3">Special Price</div>
                      <div className="col-span-1 text-center">Action</div>
                    </div>
                    {qtySlabs.map((slab, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-4">
                          <input type="number" placeholder="e.g. 1" value={slab.minQty} onChange={(e) => { const newSlabs = [...qtySlabs]; newSlabs[index].minQty = e.target.value; setQtySlabs(newSlabs); }} className="w-full border border-green-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-green-500 bg-white" />
                        </div>
                        <div className="col-span-4">
                          <input type="number" placeholder="e.g. 10" value={slab.maxQty} onChange={(e) => { const newSlabs = [...qtySlabs]; newSlabs[index].maxQty = e.target.value; setQtySlabs(newSlabs); }} className="w-full border border-green-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-green-500 bg-white" />
                        </div>
                        <div className="col-span-3">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-[12px]">₹</span>
                            <input type="number" placeholder="0.00" value={slab.price} onChange={(e) => { const newSlabs = [...qtySlabs]; newSlabs[index].price = e.target.value; setQtySlabs(newSlabs); }} className="w-full border border-green-300 rounded-[3px] pl-5 pr-2 py-1.5 text-[13px] outline-none focus:border-green-500 bg-white font-bold text-right" />
                          </div>
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button onClick={() => setQtySlabs(qtySlabs.filter((_, i) => i !== index))} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"><X className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: INVENTORY & TRACKING */}
          {activeTab === 'inventory' && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">

              <div className="bg-gray-50 p-4 rounded-[3px] border border-gray-200">
                <h4 className="text-[14px] font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">Initial Stock Setup</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-700">Opening Stock Qty</label>
                    <input id="item_openingstock_input" value={qty} onChange={e => setQty(e.target.value)} type="number" placeholder="0" className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-700">Opening Stock Rate</label>
                    <input type="number" value={openingStockRate} onChange={e => setOpeningStockRate(e.target.value)} placeholder="₹0.00" className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-blue-500" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-700">Branch</label>
                    <select
                      value={selectedBranchId}
                      onChange={(e) => {
                        setSelectedBranchId(e.target.value);
                        setSelectedLocationId('');
                        setWarehouse('');
                      }}
                      className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-blue-500 bg-white text-gray-800"
                    >
                      <option value="">Select Branch</option>
                      {branchList.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-700">Location</label>
                    <select
                      value={selectedLocationId}
                      onChange={(e) => {
                        setSelectedLocationId(e.target.value);
                        setWarehouse('');
                      }}
                      disabled={!selectedBranchId}
                      className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-blue-500 bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Location</option>
                      {locationList.filter(l => l.branchId === parseInt(selectedBranchId, 10)).map(l => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-700">Warehouse / Godown</label>
                    <select
                      value={warehouse}
                      onChange={(e) => setWarehouse(e.target.value)}
                      disabled={!selectedLocationId}
                      className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-blue-500 bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Warehouse</option>
                      {warehouseList.filter(w => w.branchId === parseInt(selectedBranchId, 10) && w.locationId === parseInt(selectedLocationId, 10)).map(wh => (
                        <option key={wh.id} value={wh.name}>{wh.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-[3px] border border-yellow-200">
                <h4 className="text-[14px] font-bold text-yellow-900 mb-3 border-b border-yellow-200 pb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Stock Alerts
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-700">Low Stock Alert Limit</label>
                    <input type="number" value={lowStockAlert} onChange={e => setLowStockAlert(e.target.value)} placeholder="e.g. 10" className="w-full border border-yellow-300 bg-white rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-yellow-500" />
                    <span className="text-[11px] text-gray-500">System will warn you when stock drops below this limit.</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-700">Reorder Level (Auto PO)</label>
                    <input type="number" value={reorderLevel} onChange={e => setReorderLevel(e.target.value)} placeholder="e.g. 5" className="w-full border border-yellow-300 bg-white rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-yellow-500" />
                    <span className="text-[11px] text-gray-500">Suggested quantity to order when stock is low.</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-[3px] border border-purple-200">
                <h4 className="text-[14px] font-bold text-purple-900 mb-3 border-b border-purple-200 pb-2 flex items-center gap-2">
                  <History className="w-4 h-4" /> Advanced Tracking
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white border border-purple-100 rounded-[3px]">
                    <div
                      className={`w-[36px] h-[20px] rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${enableBatch ? 'bg-purple-600' : 'bg-gray-300'}`}
                      onClick={() => setEnableBatch(!enableBatch)}
                    >
                      <div className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${enableBatch ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-800">Enable Batch Management</h4>
                      <p className="text-[11px] text-gray-500">Track items by manufacturing batch/lot number.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white border border-purple-100 rounded-[3px]">
                    <div
                      className={`w-[36px] h-[20px] rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${enableExpiry ? 'bg-purple-600' : 'bg-gray-300'}`}
                      onClick={() => setEnableExpiry(!enableExpiry)}
                    >
                      <div className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${enableExpiry ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-800">Enable Expiry Tracking</h4>
                      <p className="text-[11px] text-gray-500">Force expiry date entry during purchase.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white border border-purple-100 rounded-[3px]">
                    <div
                      className={`w-[36px] h-[20px] rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${enableImei ? 'bg-purple-600' : 'bg-gray-300'}`}
                      onClick={() => setEnableImei(!enableImei)}
                    >
                      <div className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${enableImei ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                    </div>
                    <div>
                      <h4 className="text-[13px] font-bold text-gray-800">Enable IMEI Tracking</h4>
                      <p className="text-[11px] text-gray-500">Track unique IMEI numbers for each piece.</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: BOM */}
          {activeTab === 'bom' && (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-[3px]">
                <div
                  className={`w-[40px] h-[22px] rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${hasBom ? 'bg-[#28a745]' : 'bg-gray-400'}`}
                  onClick={() => setHasBom(!hasBom)}
                >
                  <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${hasBom ? 'translate-x-[20px]' : 'translate-x-[2px]'}`}></div>
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-gray-800">Enable Bill of Materials (BOM)</h4>
                  <p className="text-[12px] text-gray-600">Mark this item as a Finished Good and define its recipe/components.</p>
                </div>
              </div>

              {hasBom && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] font-bold text-gray-800">BOM Name</label>
                      <input type="text" value={bomName} onChange={e => setBomName(e.target.value)} placeholder="e.g. Standard Recipe 1" className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-blue-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[13px] font-bold text-gray-800">Multi-Level BOM</label>
                        <div
                          className={`w-[32px] h-[16px] rounded-full relative cursor-pointer transition-colors ${isMultiLevel ? 'bg-blue-600' : 'bg-gray-300'}`}
                          onClick={() => setIsMultiLevel(!isMultiLevel)}
                        >
                          <div className={`w-[12px] h-[12px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isMultiLevel ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">If enabled, you can add other BOM items as raw materials to create hierarchical recipes.</p>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-[3px]">
                    <div className="bg-[#343a40] text-white p-2 text-[13px] font-bold flex justify-between items-center rounded-t-[2px]">
                      <span>Raw Materials / Components</span>
                      <span className="bg-[#28a745] px-2 py-0.5 rounded text-[11px]">
                        Calculated Cost: ₹{bomRecipe.reduce((total, item) => {
                          const prod = products.find(p => p.id.toString() === item.productId?.toString());
                          const price = prod ? (prod.purchasePrice || prod.price || prod.mrp || 0) : 0;
                          return total + (parseFloat(item.quantity) * parseFloat(price));
                        }, 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="grid grid-cols-12 gap-2 p-2 border-b border-gray-200 bg-gray-100 text-[12px] font-bold text-gray-700">
                      <div className="col-span-6">Raw Material Item</div>
                      <div className="col-span-3">Quantity</div>
                      <div className="col-span-2">Unit</div>
                      <div className="col-span-1 text-center">Action</div>
                    </div>

                    {/* Input Row */}
                    <div className="grid grid-cols-12 gap-2 p-2 border-b border-gray-200 items-center">
                      <div className="col-span-6">
                        <select value={tempRawMaterial} onChange={e => setTempRawMaterial(e.target.value)} className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 bg-white">
                          <option value="">Select Raw Material...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input type="number" value={tempQty} onChange={e => setTempQty(e.target.value)} placeholder="Qty" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 text-right" />
                      </div>
                      <div className="col-span-2">
                        <select value={tempUnit} onChange={e => setTempUnit(e.target.value)} className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 bg-gray-50">
                          <option value="">Unit</option>
                          {unitList.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
                        </select>
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button type="button" onClick={addBomItem} className="bg-[#007bff] hover:bg-[#0069d9] text-white p-1.5 rounded-[3px] transition-colors shadow-sm">
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {bomRecipe.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 p-2 border-b border-gray-100 items-center text-[12px]">
                        <div className="col-span-6 text-gray-800 font-medium">{item.name}</div>
                        <div className="col-span-3 text-right">{item.quantity}</div>
                        <div className="col-span-2 text-gray-600">{item.unit}</div>
                        <div className="col-span-1 flex justify-center">
                          <button type="button" onClick={() => removeBomItem(idx)} className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {bomRecipe.length === 0 && (
                      <div className="p-4 text-center text-[13px] text-gray-500 bg-white">
                        No materials added to BOM yet.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: BARCODE */}
          {activeTab === 'barcode' && (
            <div className="flex flex-col gap-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-bold text-gray-800">Barcode / EAN / UPC</label>
                    <div className="flex">
                      <input
                        type="text"
                        value={barcode}
                        onChange={(e) => setBarcode(e.target.value)}
                        placeholder="Scan or enter manually"
                        className="w-full border border-gray-300 rounded-l-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] font-mono"
                      />
                      <button
                        onClick={() => setBarcode(getNextBarcode())}
                        className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-r-[3px] text-[13px] font-bold transition-colors whitespace-nowrap flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-4 h-4" /> Generate
                      </button>
                    </div>
                    <p className="text-[12px] text-gray-500 mt-1">Leave empty to auto-generate unique barcode upon saving.</p>
                  </div>

                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-[3px]">
                    <h4 className="text-[13px] font-bold text-yellow-800 mb-1">POS / Scanner Ready</h4>
                    <p className="text-[12px] text-yellow-700 leading-tight">
                      Barcodes assigned here can be scanned globally in Purchase, Sales, and Stock Adjustment modules to automatically fetch this item's details.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-[3px] p-6 bg-gray-50">
                  <h4 className="text-[13px] font-bold text-gray-600 mb-4 w-full text-left">Barcode Label Preview</h4>

                  {barcode ? (
                    <div className="flex flex-col items-center gap-3 bg-white p-4 border border-gray-200 shadow-sm rounded w-[250px]">
                      <div className="h-[60px] w-full flex items-end justify-center px-2 opacity-80">
                        {/* CSS-based fake barcode */}
                        {[3, 1, 4, 2, 1, 3, 1, 4, 2, 3, 2, 1, 4, 1, 2, 3].map((w, i) => (
                          <div key={i} className={`h-full bg-black mx-[1px]`} style={{ width: `${w}px` }}></div>
                        ))}
                      </div>
                      <span className="font-mono text-[14px] tracking-[4px] text-black font-medium">{barcode}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-gray-400 py-6">
                      <BarcodeIcon className="w-12 h-12 mb-2 opacity-50" strokeWidth={1} />
                      <span className="text-[13px]">No barcode assigned yet</span>
                    </div>
                  )}

                  <button
                    disabled={!barcode}
                    onClick={handlePrintLabels}
                    className={`mt-6 flex items-center gap-1.5 px-4 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm ${barcode ? 'bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                  >
                    <Printer className="w-4 h-4" strokeWidth={2.5} /> Print Labels
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ONLINE STORE */}
          {activeTab === 'online' && (
            <div className="flex flex-col gap-5 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-[3px]">
                <div
                  className={`w-[40px] h-[22px] rounded-full relative cursor-pointer transition-colors flex-shrink-0 ${syncOnline ? 'bg-[#4F46E5]' : 'bg-gray-400'}`}
                  onClick={() => setSyncOnline(!syncOnline)}
                >
                  <div className={`w-[18px] h-[18px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${syncOnline ? 'translate-x-[20px]' : 'translate-x-[2px]'}`}></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-[14px] font-bold text-gray-800">Sync with Online Store</h4>
                  <p className="text-[12px] text-gray-600">Enable this to publish this item to your integrated eCommerce storefront.</p>
                </div>

              </div>

              {syncOnline && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300 grid grid-cols-1 md:grid-cols-[1fr_300px] gap-6">

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] font-bold text-gray-800">Online Product Name</label>
                      <input type="text" value={onlineProductName} onChange={e => setOnlineProductName(e.target.value)} placeholder="Defaults to main Item Name if empty" className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-purple-500 bg-white" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[13px] font-bold text-gray-800">Online Product Description</label>
                      <textarea rows="4" value={onlineProductDesc} onChange={e => setOnlineProductDesc(e.target.value)} placeholder="Enter detailed description for online shoppers..." className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-purple-500 resize-none bg-white"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-bold text-gray-800">Online Sale Price</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                          <input type="number" value={onlineSalePrice} onChange={e => setOnlineSalePrice(e.target.value)} placeholder="0.00" className="w-full border border-gray-300 rounded-[3px] pl-7 pr-3 py-2 text-[13px] outline-none focus:border-purple-500 bg-white" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[13px] font-bold text-gray-800">eCommerce Category</label>
                        <select value={ecommerceCategory} onChange={e => setEcommerceCategory(e.target.value)} className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-purple-500 bg-white">
                          <option value="">Select Category</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Furniture">Furniture</option>
                          <option value="Clothing">Clothing</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800">Product Images</label>
                    <label className="border-2 border-dashed border-gray-300 rounded-[3px] h-[150px] flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors group relative overflow-hidden">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagePreview(reader.result);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                          <div
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 cursor-pointer shadow-md"
                            onClick={(e) => {
                              e.preventDefault();
                              setImagePreview(null);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </div>
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-purple-500 transition-colors mb-2" />
                          <span className="text-[13px] font-medium text-gray-600">Click to upload image</span>
                          <span className="text-[11px] text-gray-400 mt-1">Max size: 2MB</span>
                        </>
                      )}
                    </label>

                    <div className="mt-2 bg-blue-50 border border-blue-100 rounded-[3px] p-3 text-[12px] text-blue-800">
                      <strong>Auto-Sync Active:</strong> Stock quantity and SKU will automatically sync continuously with main inventory.
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-[#f8f9fa] px-4 md:px-6 py-3 flex justify-end gap-2 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleSave}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-[7px] rounded-[3px] text-[14px] font-bold transition-colors shadow-sm flex items-center gap-1.5"
          >
            Save Item
          </button>
          <button
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-5 py-[7px] rounded-[3px] text-[14px] transition-colors shadow-sm"
          >
            Cancel
          </button>
        </div>

        <SelectUnitsModal
          isOpen={isSelectUnitsModalOpen}
          onClose={() => setIsSelectUnitsModalOpen(false)}
          units={unitList.map(u => u.name)}
          initialPrimary={baseUnit}
          initialSecondary={purchaseUnit}
          initialConversionRate={conversionRate}
          onSave={(primary, secondary, rate) => {
            setBaseUnit(primary);
            if (secondary) {
              setPurchaseUnit(secondary);
              setSalesUnit(secondary);
            }
            if (rate) {
              setConversionRate(rate);
            }
            setIsSelectUnitsModalOpen(false);
          }}
        />

        {isVariantModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[650px] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="bg-[#4F46E5] px-4 py-2.5 flex items-center justify-between">
                <h3 className="text-white text-[15px] font-medium flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Configure Product Variants
                </h3>
                <button
                  type="button"
                  onClick={() => setIsVariantModalOpen(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh] flex flex-col gap-4">
                {/* List of existing variants */}
                <div>
                  <h4 className="text-[13px] font-bold text-gray-700 mb-2">Current Variants ({subItemsList.length})</h4>
                  {subItemsList.length === 0 ? (
                    <p className="text-[12px] text-gray-500 italic bg-gray-50 border border-dashed border-gray-200 rounded-[3px] p-4 text-center">
                      No variants added yet. Configure one using the form below.
                    </p>
                  ) : (
                    <div className="border border-gray-200 rounded-[3px] overflow-hidden max-h-[180px] overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse text-[12px]">
                        <thead>
                          <tr className="bg-gray-100 border-b border-gray-200 text-gray-700 font-bold sticky top-0">
                            <th className="p-2">Size</th>
                            <th className="p-2">Color</th>
                            <th className="p-2">Qty</th>
                            <th className="p-2">Barcode</th>
                            <th className="p-2 text-right">MRP</th>
                            <th className="p-2 text-right">Sale Rate</th>
                            <th className="p-2 text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {subItemsList.map((item, idx) => (
                            <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 last:border-0">
                              <td className="p-2 font-medium">{item.size || '-'}</td>
                              <td className="p-2 font-medium">{item.color || '-'}</td>
                              <td className="p-2">{item.qty || 0}</td>
                              <td className="p-2 font-mono">{item.barcode || '-'}</td>
                              <td className="p-2 text-right font-bold">₹{item.mrp || 0}</td>
                              <td className="p-2 text-right font-bold text-green-700">₹{item.price || 0}</td>
                              <td className="p-2 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setVariantInput({
                                        size: item.size || '',
                                        color: item.color || '',
                                        qty: item.qty || '',
                                        barcode: item.barcode || '',
                                        mrp: item.mrp || '',
                                        price: item.price || ''
                                      });
                                      setEditingVariantIdx(idx);
                                    }}
                                    className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSubItemsList(prev => prev.filter((_, i) => i !== idx));
                                      if (editingVariantIdx === idx) {
                                        setEditingVariantIdx(null);
                                        setVariantInput({ size: '', color: '', qty: '', barcode: '', mrp: '', price: '' });
                                      } else if (editingVariantIdx !== null && editingVariantIdx > idx) {
                                        setEditingVariantIdx(editingVariantIdx - 1);
                                      }
                                    }}
                                    className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Form to add/edit variant */}
                <div className="bg-indigo-50/40 border border-indigo-100 rounded-[3px] p-4 flex flex-col gap-3">
                  <h4 className="text-[13px] font-bold text-indigo-900">
                    {editingVariantIdx !== null ? 'Edit Variant Details' : 'Add New Variant'}
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-gray-700">Size</label>
                      <div className="relative">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder="Select or type sizes (e.g. M, L)"
                            value={variantInput.size}
                            onChange={e => setVariantInput(prev => ({ ...prev, size: e.target.value }))}
                            onClick={() => {
                              setIsSizeDropdownOpen(true);
                              setIsColorDropdownOpen(false);
                            }}
                            className="w-full border border-gray-300 rounded-[3px] pl-2.5 pr-6 py-1.5 text-[12px] outline-none focus:border-[#4F46E5] bg-white font-medium text-gray-800"
                          />
                          <span className="absolute right-2 text-[10px] text-gray-400 pointer-events-none">▼</span>
                        </div>

                        {isSizeDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsSizeDropdownOpen(false)} />
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-[3px] shadow-lg z-20 max-h-[160px] overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-1">
                              {getCombinedSizes().map(opt => {
                                const selectedParts = (variantInput.size || '')
                                  .split(',')
                                  .map(p => p.trim())
                                  .filter(Boolean);
                                const isSel = selectedParts.includes(opt);
                                return (
                                  <label
                                    key={opt}
                                    className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer text-[12px] font-medium text-gray-700"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSel}
                                      onChange={() => handleBadgeClick('size', opt)}
                                      className="accent-[#4F46E5] w-3.5 h-3.5"
                                    />
                                    <span>{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-gray-700">Color</label>
                      <div className="relative">
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            placeholder="Select or type colors (e.g. Red, Blue)"
                            value={variantInput.color}
                            onChange={e => setVariantInput(prev => ({ ...prev, color: e.target.value }))}
                            onClick={() => {
                              setIsColorDropdownOpen(true);
                              setIsSizeDropdownOpen(false);
                            }}
                            className="w-full border border-gray-300 rounded-[3px] pl-2.5 pr-6 py-1.5 text-[12px] outline-none focus:border-[#4F46E5] bg-white font-medium text-gray-800"
                          />
                          <span className="absolute right-2 text-[10px] text-gray-400 pointer-events-none">▼</span>
                        </div>

                        {isColorDropdownOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsColorDropdownOpen(false)} />
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-[3px] shadow-lg z-20 max-h-[160px] overflow-y-auto custom-scrollbar p-1.5 flex flex-col gap-1">
                              {getCombinedColors().map(opt => {
                                const selectedParts = (variantInput.color || '')
                                  .split(',')
                                  .map(p => p.trim())
                                  .filter(Boolean);
                                const isSel = selectedParts.includes(opt.name);
                                return (
                                  <label
                                    key={opt.name}
                                    className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer text-[12px] font-medium text-gray-700"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSel}
                                      onChange={() => handleBadgeClick('color', opt.name)}
                                      className="accent-[#4F46E5] w-3.5 h-3.5"
                                    />
                                    <span
                                      className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block"
                                      style={{ backgroundColor: opt.hex }}
                                    />
                                    <span>{opt.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-gray-700">Number (Qty)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={variantInput.qty}
                        onChange={e => setVariantInput(prev => ({ ...prev, qty: e.target.value }))}
                        className="border border-gray-300 rounded-[3px] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#4F46E5] bg-white font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-gray-700">Barcode</label>
                      <input
                        type="text"
                        placeholder="Scan or enter barcode"
                        value={variantInput.barcode}
                        onChange={e => setVariantInput(prev => ({ ...prev, barcode: e.target.value }))}
                        className="border border-gray-300 rounded-[3px] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#4F46E5] bg-white font-mono text-gray-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-gray-700">MRP (₹)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={variantInput.mrp}
                        onChange={e => setVariantInput(prev => ({ ...prev, mrp: e.target.value }))}
                        className="border border-gray-300 rounded-[3px] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#4F46E5] bg-white font-medium text-gray-800"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-gray-700">Sale Rate (₹)</label>
                      <input
                        type="number"
                        placeholder="0.00"
                        value={variantInput.price}
                        onChange={e => setVariantInput(prev => ({ ...prev, price: e.target.value }))}
                        className="border border-gray-300 rounded-[3px] px-2.5 py-1.5 text-[12px] outline-none focus:border-[#4F46E5] bg-white font-medium text-gray-800"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-1">
                    {editingVariantIdx !== null && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingVariantIdx(null);
                          setVariantInput({ size: '', color: '', qty: '', barcode: '', mrp: '', price: '' });
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-[12px] font-bold py-1 px-3 rounded-[3px] transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        const { size, color, qty, barcode, mrp, price } = variantInput;
                        if (!size && !color) {
                          return alert('Please enter at least Size or Color');
                        }

                        const sizes = size.split(',').map(s => s.trim()).filter(Boolean);
                        const colors = color.split(',').map(c => c.trim()).filter(Boolean);

                        const sizeList = sizes.length > 0 ? sizes : [''];
                        const colorList = colors.length > 0 ? colors : [''];

                        const qtyVal = parseInt(qty, 10) || 0;
                        const mrpVal = parseFloat(mrp) || 0;
                        const priceVal = parseFloat(price) || 0;

                        const newVariants = [];
                        let index = 0;
                        for (const s of sizeList) {
                          for (const c of colorList) {
                            let barVal = barcode.trim();
                            if (sizeList.length * colorList.length > 1) {
                              if (barVal) {
                                barVal = `${barVal}-${s}-${c}`;
                              } else {
                                barVal = `B${Date.now()}-${Math.floor(100 + Math.random() * 900)}-${index}`;
                              }
                            } else if (!barVal) {
                              barVal = `B${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
                            }

                            newVariants.push({
                              size: s,
                              color: c,
                              qty: qtyVal,
                              barcode: barVal,
                              mrp: mrpVal,
                              price: priceVal,
                              name: `${s} ${c}`.trim()
                            });
                            index++;
                          }
                        }

                        if (editingVariantIdx !== null) {
                          setSubItemsList(prev => {
                            const copy = [...prev];
                            copy.splice(editingVariantIdx, 1, ...newVariants);
                            return copy;
                          });
                          setEditingVariantIdx(null);
                        } else {
                          setSubItemsList(prev => [...prev, ...newVariants]);
                        }
                        
                        // Sync variant MRP and Sale Rate with the main item properly
                        if (mrpVal > 0) setMrp(mrpVal.toString());
                        if (priceVal > 0) setPrice(priceVal.toString());

                        setVariantInput({ size: '', color: '', qty: '', barcode: '', mrp: '', price: '' });
                      }}
                      className="bg-[#28a745] hover:bg-[#218838] text-white text-[12px] font-bold py-1.5 px-4 rounded-[3px] shadow-sm transition-colors"
                    >
                      {editingVariantIdx !== null ? 'Update Variant' : 'Add Variant'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-[#f8f9fa] border-t border-gray-200 px-4 py-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsVariantModalOpen(false)}
                  className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-5 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
      {isCategoryModalOpen && (
        <CategoryMasterModal 
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          editData={categoryModalEditData}
        />
      )}
    </div>
  );
}

