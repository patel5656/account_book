import React, { useState, useEffect } from 'react';
import { X, Settings, Image as ImageIcon, Plus, RefreshCw, ChevronDown, Edit, Trash2 } from 'lucide-react';
import { ProductSettingModal } from './ProductSettingModal';
import { SelectUnitsModal } from './SelectUnitsModal';
import apiClient from '../api/apiClient';
import { useSettings } from '../context/SettingsContext';

export function ProductMasterModal({ isOpen, onClose, onSubmit, editProduct }) {
  const { settings: appSettings } = useSettings();
  const [isProduct, setIsProduct] = useState(appSettings?.defaultProductType !== 'Service');
  const [isActive, setIsActive] = useState(true);
  const [isGstApplicable, setIsGstApplicable] = useState(true);
  const [isRawProduct, setIsRawProduct] = useState(false);
  const [toggles, setToggles] = useState({
    'More Info': false,
    'Raw Materials': false,
    'Sub Item': false,
    'Sub Inventory': false
  });
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [productTags, setProductTags] = useState([]);
  const [commissionTypes, setCommissionTypes] = useState([]);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settings, setSettings] = useState(null);
  
  const [isSelectUnitsModalOpen, setIsSelectUnitsModalOpen] = useState(false);
  const [selectedPrimaryUnit, setSelectedPrimaryUnit] = useState('');
  const [selectedSecondaryUnit, setSelectedSecondaryUnit] = useState('');

  const [rawMaterialsList, setRawMaterialsList] = useState([]);
  const [extraChargesList, setExtraChargesList] = useState([]);
  const [subItemsList, setSubItemsList] = useState([]);
  const [rmInput, setRmInput] = useState({ name: '', qty: 0, unit: '' });
  const [ecInput, setEcInput] = useState({ name: '', price: 0, unit: '' });
  const [subItemInput, setSubItemInput] = useState({ name: '', price: 0 });
  const [editingSubItemIdx, setEditingSubItemIdx] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/categories')
        .then(res => {
          if (res.data?.data) setCategories(res.data.data.map(c => c.name));
        }).catch(err => console.error("Failed to load categories", err));
      
      apiClient.get('/units')
        .then(res => {
          if (res.data?.data) setUnits(res.data.data.map(u => u.name));
        }).catch(err => console.error("Failed to load units", err));

      apiClient.get('/settings')
        .then(res => {
          if (res.data?.data) setSettings(res.data.data);
        }).catch(err => console.error("Failed to load settings", err));

      apiClient.get('/product-tags')
        .then(res => {
          if (res.data?.data) setProductTags(res.data.data.map(t => t.name));
        }).catch(err => console.error("Failed to load product tags", err));

      apiClient.get('/commission-types')
        .then(res => {
          if (res.data?.data) setCommissionTypes(res.data.data.map(t => t.name));
        }).catch(err => console.error("Failed to load commission types", err));

      apiClient.get('/products')
        .then(res => {
          if (res.data?.data) setAllProducts(res.data.data.map(p => p.name));
        }).catch(err => console.error("Failed to load products", err));
    }
  }, [isOpen]);

  // Pre-fill form if editing
  useEffect(() => {
    if (isOpen && editProduct) {
      setTimeout(() => {
        setIsActive(editProduct.status !== 'Inactive');
        setIsGstApplicable(parseFloat(editProduct.tax) > 0);
        
        const setVal = (id, val) => {
          const el = document.getElementById(id);
          if (el && val !== undefined && val !== null) el.value = val;
        };

        setVal('productName', editProduct.name);
        setVal('categorySelect', editProduct.category);
        setVal('gstSelect', editProduct.tax);
        setVal('hsnCode', editProduct.hsnCode);
        setSelectedPrimaryUnit(editProduct.baseUnit || '');
        setSelectedSecondaryUnit(editProduct.salesUnit || editProduct.purchaseUnit || '');
        setVal('barcodeInput', editProduct.barcode);
        setVal('mrpPrice', editProduct.mrp);
        setVal('salePrice', editProduct.price);
        setVal('wholesalePrice', editProduct.wholesalePrice);
        setVal('creditSalePrice', editProduct.creditSalePrice);
        
        // More Info
        if (editProduct.commissionType || editProduct.size || editProduct.colour || editProduct.hindiName) {
           setToggles(prev => ({ ...prev, 'More Info': true }));
           setTimeout(() => {
             setVal('commissionType', editProduct.commissionType);
             setVal('size', editProduct.size);
             setVal('colour', editProduct.colour);
             setVal('expiryMonth', editProduct.expiryMonth);
             setVal('location', editProduct.location);
             setVal('hindiName', editProduct.hindiName);
             setVal('description', editProduct.description);
             setVal('termsCondition', editProduct.termsCondition);
             setVal('productTags', editProduct.productTags);
           }, 100);
        }

        if (editProduct.rawMaterials?.length || editProduct.extraCharges?.length || editProduct.subItems?.length || editProduct.subInventory) {
          setTimeout(() => {
            if (editProduct.rawMaterials?.length || editProduct.extraCharges?.length) {
              setToggles(prev => ({ ...prev, 'Raw Materials': true }));
              if (editProduct.rawMaterials) setRawMaterialsList(editProduct.rawMaterials);
              if (editProduct.extraCharges) setExtraChargesList(editProduct.extraCharges);
            }
            if (editProduct.subItems?.length) {
              setToggles(prev => ({ ...prev, 'Sub Item': true }));
              setSubItemsList(editProduct.subItems);
            }
            if (editProduct.subInventory) {
              setToggles(prev => ({ ...prev, 'Sub Inventory': true }));
              const setVal = (id, val) => { const el = document.getElementById(id); if (el && val !== undefined) el.value = val; };
              setVal('subBatchNumber', editProduct.subInventory.batchNumber);
              setVal('subExpiryDate', editProduct.subInventory.expiryDate);
              setVal('subRackLocation', editProduct.subInventory.rackLocation);
            }
          }, 100);
        }
      }, 100);
    } else if (isOpen && !editProduct) {
        // Clear fields on new
        const clearVal = (id) => {
          const el = document.getElementById(id);
          if (el) el.value = '';
        };
        setTimeout(() => {
            clearVal('productName'); clearVal('hsnCode'); clearVal('barcodeInput');
            clearVal('hindiName'); clearVal('description'); clearVal('termsCondition');
            clearVal('size'); clearVal('colour'); clearVal('location');
            clearVal('subBatchNumber'); clearVal('subExpiryDate'); clearVal('subRackLocation');
            setSelectedPrimaryUnit('');
            setSelectedSecondaryUnit('');
            const setZero = (id) => { const el = document.getElementById(id); if (el) el.value = '0'; };
            setZero('mrpPrice'); setZero('salePrice'); setZero('wholesalePrice'); setZero('creditSalePrice'); setZero('expiryMonth');
            setIsActive(true);
            setIsGstApplicable(true);
            setToggles({ 'More Info': false, 'Raw Materials': false, 'Sub Item': false, 'Sub Inventory': false });
            setRawMaterialsList([]);
            setExtraChargesList([]);
            setSubItemsList([]);
            setRmInput({ name: '', qty: 0, unit: '' });
            setEcInput({ name: '', price: 0, unit: '' });
            setSubItemInput({ name: '', price: 0 });
            setEditingSubItemIdx(null);
        }, 100);
    }
  }, [isOpen, editProduct]);

  const handleQuickAdd = async (type) => {
    const name = window.prompt(`Enter new ${type} name:`);
    if (!name) return;
    try {
      if (type === 'Tag') {
        await apiClient.post('/product-tags', { name });
        setProductTags(prev => [...prev, name]);
      } else if (type === 'Commission Type') {
        await apiClient.post('/commission-types', { name });
        setCommissionTypes(prev => [...prev, name]);
      }
    } catch (error) {
      alert(`Failed to add ${type}`);
    }
  };

  const cols = ['100px', '1fr', '80px', '80px'];
  if (settings?.showWholesalePrice) cols.push('80px');
  if (settings?.showCreditSalePrice) cols.push('80px');
  if (settings?.showSpecialPrice) cols.push('80px');
  if (settings?.showSuperSpecialPrice) cols.push('80px');
  const gridColsStyle = { gridTemplateColumns: cols.join(' ') };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[3px] shadow-2xl w-full sm:max-w-[750px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5 w-[200px]">Product Master</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[14px] ${isProduct ? 'text-white font-bold' : 'text-gray-300'}`}>Product</span>
            <div 
              className={`w-[36px] h-[18px] rounded-full relative cursor-pointer transition-colors ${isProduct ? 'bg-[#28a745]' : 'bg-[#0056b3]'}`}
              onClick={() => setIsProduct(!isProduct)}
            >
              <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isProduct ? 'translate-x-[2px]' : 'translate-x-[20px]'}`}></div>
            </div>
            <span className={`text-[13px] ${!isProduct ? 'text-white font-bold' : 'text-gray-300'}`}>Service</span>
          </div>

          <div className="flex items-center w-[200px] justify-end gap-2">
            <button 
              onClick={() => setIsSettingOpen(true)}
              className="text-white hover:text-gray-200 focus:outline-none mr-1"
            >
              <Settings className="w-4 h-4" strokeWidth={2} />
            </button>
            <button 
              onClick={onClose} 
              className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors"
            >
              <X className="w-5 h-5 text-white" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 bg-white overflow-y-auto max-h-[65vh]">
          <div className="flex flex-col gap-4">
            
            {/* Raw Product */}
            <div className="flex items-center gap-2 mb-2 pt-1 cursor-pointer" onClick={() => setIsRawProduct(!isRawProduct)}>
              <div className={`w-[32px] h-[18px] rounded-full relative transition-colors ${isRawProduct ? 'bg-[#4F46E5]' : 'bg-gray-300'}`}>
                <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isRawProduct ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
              </div>
              <span className="text-[13px] font-bold text-gray-800 select-none">Raw Product</span>
            </div>

            {/* Product Name */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-bold text-gray-800">Product Name</label>
              <div className="flex items-center gap-3">
                <input 
                  id="productName"
                  type="text" 
                  placeholder="Enter Product Name"
                  className="flex-1 border border-gray-300 rounded-[3px] px-3 py-[6px] text-[13px] outline-none focus:border-[#4F46E5]"
                />
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-[#4F46E5]' : 'bg-gray-300'}`}
                    onClick={() => setIsActive(!isActive)}
                  >
                    <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isActive ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                  </div>
                  <span className="text-[13px] font-bold text-gray-800 select-none">Active</span>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1">
              <label className="text-[13px] font-bold text-gray-800">Category</label>
              <select id="categorySelect" className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[13px] outline-none focus:border-[#4F46E5]">
                <option value=""></option>
                {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Gst and HSN */}
            <div className="grid grid-cols-[1fr_1fr] gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-gray-800">Gst</label>
                  <div className="flex flex-wrap items-center gap-2 cursor-pointer" onClick={() => setIsGstApplicable(!isGstApplicable)}>
                    <div className={`w-[32px] h-[18px] rounded-full relative transition-colors ${isGstApplicable ? 'bg-[#4F46E5]' : 'bg-gray-300'}`}>
                      <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isGstApplicable ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                    </div>
                    <span className="text-[12px] text-gray-600 select-none">Applicable : {isGstApplicable ? 'Yes' : 'No'}</span>
                  </div>
                </div>
                <select 
                  id="gstSelect"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[13px] outline-none focus:border-[#4F46E5] bg-gray-100 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400"
                  disabled={!isGstApplicable}
                >
                  <option value="0">@0 %</option>
                  <option value="5">@5 %</option>
                  <option value="12">@12 %</option>
                  <option value="18">@18 %</option>
                  <option value="28">@28 %</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-bold text-gray-800">HSN</label>
                  <RefreshCw className="w-3.5 h-3.5 text-[#4F46E5] cursor-pointer" />
                </div>
                <input id="hsnCode" type="text" className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[13px] outline-none focus:border-[#4F46E5]" />
              </div>
            </div>

            {/* Table Area */}
            <div className="mt-1 bg-[#f8f9fa] border border-gray-200 rounded-[3px] p-2 overflow-x-auto custom-scrollbar">
              <div className="grid gap-2 mb-2 items-center text-center min-w-max" style={gridColsStyle}>
                <div className="font-bold text-[13px] text-gray-800">Unit</div>
                <div className="font-bold text-[13px] text-gray-800 flex items-center justify-center gap-1">
                  Barcode M <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="font-bold text-[13px] text-gray-800">MRP</div>
                <div className="font-bold text-[13px] text-gray-800">Sale</div>
                {settings?.showWholesalePrice && <div className="font-bold text-[13px] text-gray-800">Wholesale</div>}
                {settings?.showCreditSalePrice && <div className="font-bold text-[13px] text-gray-800">Credit</div>}
                {settings?.showSpecialPrice && <div className="font-bold text-[13px] text-gray-800">Special</div>}
                {settings?.showSuperSpecialPrice && <div className="font-bold text-[13px] text-gray-800">Super Spc.</div>}
              </div>
              <div className="grid gap-2 items-center bg-white border border-gray-200 p-2 rounded-[3px] min-w-max" style={gridColsStyle}>
                <div className="w-full">
                  <input 
                    id="unitSelect" 
                    readOnly
                    onClick={() => setIsSelectUnitsModalOpen(true)}
                    value={selectedPrimaryUnit ? (selectedSecondaryUnit ? `${selectedPrimaryUnit} - ${selectedSecondaryUnit}` : selectedPrimaryUnit) : ''}
                    className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] bg-white cursor-pointer" 
                    placeholder="Select Unit" 
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="text" readOnly value="Auto" className="w-[60px] border border-gray-300 bg-gray-100 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-center text-gray-600" />
                  <input id="barcodeInput" type="text" placeholder="Scan or enter barcode" className="flex-1 border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                </div>
                <input id="mrpPrice" type="number" defaultValue="0" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-center focus:border-[#4F46E5] text-blue-400 font-medium" />
                <input id="salePrice" type="number" defaultValue="0" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-center focus:border-[#4F46E5]" />
                {settings?.showWholesalePrice && <input id="wholesalePrice" type="number" defaultValue="0" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-center focus:border-[#4F46E5] text-purple-600 font-medium" />}
                {settings?.showCreditSalePrice && <input id="creditSalePrice" type="number" defaultValue="0" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-center focus:border-[#4F46E5]" />}
                {settings?.showSpecialPrice && <input id="specialPrice" type="number" defaultValue="0" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-center focus:border-[#4F46E5]" />}
                {settings?.showSuperSpecialPrice && <input id="superSpecialPrice" type="number" defaultValue="0" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-center focus:border-[#4F46E5]" />}
              </div>
            </div>

            {/* Action Buttons Below Table */}
            <div className="flex justify-end gap-2 mt-0 mb-3">
              <button className="bg-[#28a745] hover:bg-[#218838] px-2 py-1.5 rounded-[3px] flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4 text-white" strokeWidth={3} />
              </button>
              <button className="border border-[#28a745] text-[#28a745] hover:bg-green-50 px-3 py-1.5 rounded-[3px] flex items-center gap-1.5 transition-colors font-medium text-[13px]">
                <Edit className="w-3.5 h-3.5" /> Units Master
              </button>
            </div>

            {/* Row 6: Toggles */}
            <div className={`grid ${isProduct ? 'grid-cols-4' : 'grid-cols-1 max-w-[150px]'} pt-2 border-b border-gray-100 pb-2`}>
              {[
                'More Info', 
                ...(isProduct ? ['Raw Materials', 'Sub Item', 'Sub Inventory'] : [])
              ].map((label) => (
                <div key={label} className="flex flex-col items-center gap-1">
                  <div 
                    className={`w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${toggles[label] ? 'bg-[#0d6efd]' : 'bg-gray-300'}`}
                    onClick={() => setToggles(prev => ({ ...prev, [label]: !prev[label] }))}
                  >
                    <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${toggles[label] ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                  </div>
                  <span className="text-[12px] font-bold text-gray-800 text-center">{label}</span>
                </div>
              ))}
            </div>

            {/* Expanded Panels */}
            <div className="flex flex-col gap-3">
              {toggles['More Info'] && (
                <div className="pt-2 animate-in fade-in zoom-in-95 duration-200">
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Commission Type</label>
                      <input id="commissionType" type="text" className="w-full border border-gray-800 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white font-medium border-2" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Size</label>
                      <input id="size" type="text" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Colour</label>
                      <input id="colour" type="text" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Expiry Month</label>
                      <input id="expiryMonth" type="text" defaultValue="0" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] text-center text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Product Hindi Name</label>
                      <input id="hindiName" type="text" placeholder="Enter Hindi Name" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Description</label>
                      <input id="description" type="text" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Terms & Condition</label>
                      <input id="termsCondition" type="text" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Product Tags</label>
                      <input id="productTags" type="text" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Point</label>
                      <input id="point" type="number" defaultValue="0" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                    </div>
                  </div>
                </div>
              )}

              {isProduct && toggles['Raw Materials'] && (
                <div className="p-3 border-t border-gray-100 bg-white flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
                  {/* Table 1: Raw Material */}
                  <div className="border border-gray-200 rounded-[3px]">
                    <div className="grid grid-cols-[50px_1fr_200px_70px] bg-white text-center text-[12px] text-gray-600 border-b border-gray-200 divide-x divide-gray-200">
                      <div className="p-1.5">S.NO</div>
                      <div className="p-1.5">Raw Material</div>
                      <div className="p-1.5">Quantity</div>
                      <div className="p-1.5">ACTION</div>
                    </div>
                    {rawMaterialsList.map((rm, idx) => (
                      <div key={idx} className="grid grid-cols-[50px_1fr_200px_70px] bg-gray-50 text-center items-center divide-x divide-gray-200 border-b border-gray-200">
                        <div className="p-1.5 text-gray-600 text-[13px]">{idx + 1}</div>
                        <div className="p-1.5 text-[13px] text-left px-2">{rm.name}</div>
                        <div className="p-1.5 text-[13px] font-medium">{rm.qty} {rm.unit}</div>
                        <div className="p-1.5 flex justify-center">
                          <button 
                            onClick={(e) => { e.preventDefault(); setRawMaterialsList(prev => prev.filter((_, i) => i !== idx)); }}
                            className="bg-[#dc3545] text-white w-6 h-6 rounded-[3px] flex items-center justify-center hover:bg-[#c82333] transition-colors"
                          >
                            <X className="w-4 h-4" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="grid grid-cols-[50px_1fr_200px_70px] bg-white text-center items-center divide-x divide-gray-200">
                      <div className="p-1.5 text-gray-600 text-[13px]">#</div>
                      <div className="p-1.5">
                        <input list="raw-materials" placeholder="Search or enter material..." value={rmInput.name} onChange={e => setRmInput({...rmInput, name: e.target.value})} className="w-full border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white" />
                        <datalist id="raw-materials">
                          {allProducts.map((p, idx) => (
                            <option key={idx} value={p} />
                          ))}
                        </datalist>
                      </div>
                      <div className="p-1.5 flex gap-1">
                        <input type="number" value={rmInput.qty} onChange={e => setRmInput({...rmInput, qty: parseFloat(e.target.value) || 0})} className="w-1/2 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none text-center" />
                        <input list="qty-units" value={rmInput.unit} onChange={e => setRmInput({...rmInput, unit: e.target.value})} className="w-1/2 border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none font-bold bg-white" />
                        <datalist id="qty-units">
                          {units.map((u, idx) => (
                            <option key={idx} value={u} />
                          ))}
                        </datalist>
                      </div>
                      <div className="p-1.5 flex justify-center">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (rmInput.name.trim() && rmInput.qty > 0) {
                              setRawMaterialsList(prev => [...prev, rmInput]);
                              setRmInput({ name: '', qty: 0, unit: '' });
                            }
                          }}
                          className="bg-[#28a745] text-white w-7 h-7 rounded-[3px] flex items-center justify-center hover:bg-[#218838] transition-colors"
                        >
                          <Plus className="w-5 h-5" strokeWidth={4} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Table 2: Extra Charges */}
                  <div className="border border-gray-200 rounded-[3px]">
                    <div className="grid grid-cols-[50px_1fr_1fr_1fr_70px] bg-white text-center text-[12px] text-gray-600 border-b border-gray-200 divide-x divide-gray-200">
                      <div className="p-1.5">S.NO</div>
                      <div className="p-1.5">Extra Charges</div>
                      <div className="p-1.5">Charges Price</div>
                      <div className="p-1.5">Unit</div>
                      <div className="p-1.5">ACTION</div>
                    </div>
                    {extraChargesList.map((ec, idx) => (
                      <div key={idx} className="grid grid-cols-[50px_1fr_1fr_1fr_70px] bg-gray-50 text-center items-center divide-x divide-gray-200 border-b border-gray-200">
                        <div className="p-1.5 text-gray-600 text-[13px]">{idx + 1}</div>
                        <div className="p-1.5 text-[13px] text-left px-2">{ec.name}</div>
                        <div className="p-1.5 text-[13px]">{ec.price}</div>
                        <div className="p-1.5 text-[13px]">{ec.unit}</div>
                        <div className="p-1.5 flex justify-center">
                          <button 
                            onClick={(e) => { e.preventDefault(); setExtraChargesList(prev => prev.filter((_, i) => i !== idx)); }}
                            className="bg-[#dc3545] text-white w-6 h-6 rounded-[3px] flex items-center justify-center hover:bg-[#c82333] transition-colors"
                          >
                            <X className="w-4 h-4" strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="grid grid-cols-[50px_1fr_1fr_1fr_70px] bg-white text-center items-center divide-x divide-gray-200">
                      <div className="p-1.5 text-gray-600 text-[13px]">#</div>
                      <div className="p-1.5">
                        <input type="text" value={ecInput.name} onChange={e => setEcInput({...ecInput, name: e.target.value})} className="w-full border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none" />
                      </div>
                      <div className="p-1.5">
                        <input type="number" value={ecInput.price} onChange={e => setEcInput({...ecInput, price: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none text-center" />
                      </div>
                      <div className="p-1.5">
                        <input list="qty-units" value={ecInput.unit} onChange={e => setEcInput({...ecInput, unit: e.target.value})} className="w-full border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none bg-white" />
                      </div>
                      <div className="p-1.5 flex justify-center">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            if (ecInput.name.trim() || ecInput.price > 0) {
                              setExtraChargesList(prev => [...prev, ecInput]);
                              setEcInput({ name: '', price: 0, unit: '' });
                            }
                          }}
                          className="bg-[#28a745] text-white w-7 h-7 rounded-[3px] flex items-center justify-center hover:bg-[#218838] transition-colors"
                        >
                          <Plus className="w-5 h-5" strokeWidth={4} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MFG Commission */}
                  <div className="flex flex-col gap-1 items-center mb-1">
                    <label className="text-[13px] font-bold text-gray-800">MFG. Commission</label>
                    <input type="number" defaultValue="0" className="w-[300px] border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                  </div>
                </div>
              )}

              {isProduct && toggles['Sub Item'] && (
                <div className="p-3 border border-gray-200 rounded-[3px] bg-white flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                  <h3 className="text-[13px] font-bold text-[#4F46E5] uppercase border-b border-gray-200 pb-1">Sub Items / Variants</h3>
                  
                  {subItemsList.length > 0 && (
                    <div className="flex flex-col gap-2 mb-2">
                      {subItemsList.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-[2fr_1fr_0.5fr] gap-2 items-center bg-gray-50 p-2 rounded-[3px] border border-gray-200">
                          <div className="text-[13px] text-gray-800 font-medium px-1">{item.name}</div>
                          <div className="text-[13px] text-gray-800 font-medium">{item.price}</div>
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={(e) => { 
                                e.preventDefault(); 
                                setSubItemInput(item);
                                setEditingSubItemIdx(idx);
                              }}
                              className="bg-[#0d6efd] text-white w-6 h-6 rounded-[3px] flex items-center justify-center hover:bg-[#0b5ed7] transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={(e) => { 
                                e.preventDefault(); 
                                setSubItemsList(prev => prev.filter((_, i) => i !== idx)); 
                                if (editingSubItemIdx === idx) {
                                  setEditingSubItemIdx(null);
                                  setSubItemInput({ name: '', price: 0 });
                                } else if (editingSubItemIdx !== null && editingSubItemIdx > idx) {
                                  setEditingSubItemIdx(editingSubItemIdx - 1);
                                }
                              }}
                              className="bg-[#dc3545] text-white w-6 h-6 rounded-[3px] flex items-center justify-center hover:bg-[#c82333] transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-[2fr_1fr_0.5fr] gap-2 items-end">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Sub Item Name</label>
                      <input type="text" placeholder="E.g. Red Size M" value={subItemInput.name} onChange={e => setSubItemInput({...subItemInput, name: e.target.value})} className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Extra Price</label>
                      <input type="number" value={subItemInput.price} onChange={e => setSubItemInput({...subItemInput, price: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                    </div>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        if (subItemInput.name.trim()) {
                          if (editingSubItemIdx !== null) {
                            setSubItemsList(prev => {
                              const newList = [...prev];
                              newList[editingSubItemIdx] = subItemInput;
                              return newList;
                            });
                            setEditingSubItemIdx(null);
                          } else {
                            setSubItemsList(prev => [...prev, subItemInput]);
                          }
                          setSubItemInput({ name: '', price: 0 });
                        }
                      }}
                      className={`${editingSubItemIdx !== null ? 'bg-[#0d6efd] hover:bg-[#0b5ed7]' : 'bg-[#28a745] hover:bg-[#218838]'} text-white px-2 py-1.5 rounded-[3px] font-bold text-[13px] transition-colors h-[31px]`}
                    >
                      {editingSubItemIdx !== null ? 'Update' : 'Add'}
                    </button>
                  </div>
                </div>
              )}

              {isProduct && toggles['Sub Inventory'] && (
                <div className="p-3 border border-gray-200 rounded-[3px] bg-[#f8f9fa] flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-200">
                  <h3 className="text-[13px] font-bold text-[#4F46E5] uppercase border-b border-gray-200 pb-1">Sub Inventory (Batch)</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Batch Number</label>
                      <input id="subBatchNumber" type="text" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[12px] font-bold text-gray-700">Expiry Date</label>
                      <input id="subExpiryDate" type="date" className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
                    </div>
                  </div>
                </div>
              )}


            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-4 flex justify-end gap-2 border-t border-gray-100">
          <button 
            disabled={isSubmitting}
            onClick={async () => {
              const pName = document.getElementById('productName')?.value;
              if (!pName) {
                alert("Product Name is required");
                return;
              }
              
              setIsSubmitting(true);
              
              try {
                const formData = {
                  name: pName,
                  sku: 'SKU-' + Date.now().toString() + '-' + Math.floor(1000 + Math.random() * 9000),
                  status: isActive ? 'Active' : 'Inactive',
                  category: document.getElementById('categorySelect')?.value,
                  tax: isGstApplicable ? parseFloat(document.getElementById('gstSelect')?.value || 0) : 0,
                  hsnCode: document.getElementById('hsnCode')?.value,
                  baseUnit: selectedPrimaryUnit,
                  salesUnit: selectedSecondaryUnit,
                  purchaseUnit: selectedSecondaryUnit,
                  barcode: document.getElementById('barcodeInput')?.value,
                  mrp: parseFloat(document.getElementById('mrpPrice')?.value || 0),
                  price: parseFloat(document.getElementById('salePrice')?.value || 0),
                  wholesalePrice: document.getElementById('wholesalePrice') ? parseFloat(document.getElementById('wholesalePrice').value || 0) : 0,
                  creditSalePrice: document.getElementById('creditSalePrice') ? parseFloat(document.getElementById('creditSalePrice').value || 0) : 0,
                  
                  
                  // More Info Fields
                  commissionType: document.getElementById('commissionType')?.value,
                  size: document.getElementById('size')?.value,
                  colour: document.getElementById('colour')?.value,
                  expiryMonth: document.getElementById('expiryMonth')?.value,
                  location: document.getElementById('location')?.value,
                  hindiName: document.getElementById('hindiName')?.value,
                  description: document.getElementById('description')?.value,
                  termsCondition: document.getElementById('termsCondition')?.value,
                  productTags: document.getElementById('productTags')?.value,
                  
                  // New Lists & Sub Inventory
                  rawMaterials: rawMaterialsList,
                  extraCharges: extraChargesList,
                  subItems: subItemsList,
                  subInventory: {
                    batchNumber: document.getElementById('subBatchNumber')?.value,
                    expiryDate: document.getElementById('subExpiryDate')?.value,
                    rackLocation: document.getElementById('subRackLocation')?.value,
                  },
                };
                
                let response;
                if (editProduct && editProduct.id) {
                  response = await apiClient.put(`/products/${editProduct.id}`, formData);
                } else {
                  response = await apiClient.post('/products', formData);
                }
                
                if (onSubmit) {
                  // Ensure standard format that Invoice expects
                  const newProduct = response.data?.data || formData;
                  onSubmit({
                    id: newProduct.id || Date.now(),
                    name: newProduct.name,
                    fullName: newProduct.name,
                    price: newProduct.price,
                    barcode: newProduct.barcode || '1000' + Math.floor(Math.random()*100),
                    tax: newProduct.tax || 0,
                  });
                }
                onClose();
              } catch (error) {
                console.error("Failed to create product", error);
                alert(error.response?.data?.message || "Failed to create product");
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
          <button 
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
      <ProductSettingModal isOpen={isSettingOpen} onClose={() => setIsSettingOpen(false)} />
      <SelectUnitsModal 
        isOpen={isSelectUnitsModalOpen}
        onClose={() => setIsSelectUnitsModalOpen(false)}
        units={units}
        initialPrimary={selectedPrimaryUnit}
        initialSecondary={selectedSecondaryUnit}
        onSave={(primary, secondary) => {
          setSelectedPrimaryUnit(primary);
          setSelectedSecondaryUnit(secondary);
          setIsSelectUnitsModalOpen(false);
        }}
      />
    </div>
  );
}
