import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Filter, Download, Check, Info, Tag, HelpCircle, Save } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '../utils';
import { useSettings } from '../context/SettingsContext';
import apiClient from '../api/apiClient';

export function StockPriceUpdate() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [viewAll, setViewAll] = useState(false); // false = Show All, true = Show Modified only
  const [showBulkUpdate, setShowBulkUpdate] = useState(false);
  const [showBulkPriceUpdate, setShowBulkPriceUpdate] = useState(false);
  
  const [selectedField, setSelectedField] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bulk Price Update states
  const [updateField, setUpdateField] = useState('MRP');
  const [basedOnField, setBasedOnField] = useState('Purchase Price');
  const [formulaType, setFormulaType] = useState('Increase by %');
  const [formulaValue, setFormulaValue] = useState('');
  const [preventNegative, setPreventNegative] = useState(true);

  const [products, setProducts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products');
      const allProds = res.data.products || res.data.data || res.data;
      
      const mapped = allProds.map(p => ({
        id: p.id,
        name: p.name,
        hsn: p.hsnCode || '+Add',
        gst: p.tax || '0',
        branch: 'swayam billing software', // Static per mock, no branch assigned in db initially
        purchasePrice: (p.purchasePrice || 0).toString(),
        qty: p.stock || 0,
        sQty: p.secOpeningQty || 0,
        value: ((p.stock || 0) * (p.purchasePrice || 0)).toString(),
        mrp: (p.mrp || 0).toString(),
        creditSale: (p.creditSalePrice || 0).toString(),
        cashSale: (p.price || 0).toString(),
        wholeSale: (p.wholesalePrice || 0).toString(),
        modified: false
      }));
      setProducts(mapped);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSaveChanges = async () => {
    const modifiedProducts = products.filter(p => p.modified);
    if (modifiedProducts.length === 0) return alert('No changes to save.');

    try {
      setIsSaving(true);
      await apiClient.post('/products/bulk-prices', { products: modifiedProducts });
      alert('Prices updated successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error updating prices:', error);
      alert('Failed to update prices.');
    } finally {
      setIsSaving(false);
    }
  };

  // Update a single product field and mark it as modified
  const handleFieldChange = (id, field, value) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          [field]: value,
          modified: true
        };
      }
      return p;
    }));
  };

  // Perform bulk update of a selected field
  const handleBulkUpdate = () => {
    if (!selectedField) {
      alert('Please select a field to update.');
      return;
    }
    const newValue = prompt(`Enter new value for "${selectedField}":`);
    if (newValue === null) return;

    const displayedIds = new Set(displayedProducts.map(d => d.id));

    setProducts(prev => prev.map(p => {
      if (!displayedIds.has(p.id)) return p;
      return {
        ...p,
        [selectedField]: newValue,
        modified: true
      };
    }));
    setShowBulkUpdate(false);
    alert(`Bulk Update: "${selectedField}" set to "${newValue}" for filtered products.`);
  };

  // Perform bulk price update using math formulas
  const handleBulkPriceUpdateApply = () => {
    if (!formulaValue) {
      alert('Please enter a value.');
      return;
    }
    const val = parseFloat(formulaValue) || 0;
    
    // Only apply to the currently filtered/displayed products
    const displayedIds = new Set(displayedProducts.map(d => d.id));
    
    setProducts(prev => prev.map(p => {
      // Skip products that are not currently filtered
      if (!displayedIds.has(p.id)) return p;

      // Map Based On field names
      let baseVal = 0;
      if (basedOnField === 'Purchase Price') {
        baseVal = parseFloat(p.purchasePrice.replace(/,/g, '')) || 0;
      } else if (basedOnField === 'MRP') {
        baseVal = parseFloat(p.mrp) || 0;
      } else if (basedOnField === 'Credit Sale') {
        baseVal = parseFloat(p.creditSale) || 0;
      } else if (basedOnField === 'Cash Sale') {
        baseVal = parseFloat(p.cashSale) || 0;
      } else if (basedOnField === 'Whole Sale') {
        baseVal = parseFloat(p.wholeSale) || 0;
      }

      let newVal = baseVal;
      if (formulaType === 'Increase by %') {
        newVal = baseVal + (baseVal * (val / 100));
      } else if (formulaType === 'Decrease by %') {
        newVal = baseVal - (baseVal * (val / 100));
      } else if (formulaType === 'Increase by Amount') {
        newVal = baseVal + val;
      } else if (formulaType === 'Decrease by Amount') {
        newVal = baseVal - val;
      } else if (formulaType === 'Set Fixed Value') {
        newVal = val;
      }

      if (preventNegative && newVal < 0) {
        newVal = 0;
      }

      // Map target field keys
      let fieldKey = 'mrp';
      if (updateField === 'MRP') fieldKey = 'mrp';
      else if (updateField === 'Credit Sale') fieldKey = 'creditSale';
      else if (updateField === 'Cash Sale') fieldKey = 'cashSale';
      else if (updateField === 'Whole Sale') fieldKey = 'wholeSale';

      return {
        ...p,
        [fieldKey]: newVal.toFixed(0),
        modified: true
      };
    }));

    setShowBulkPriceUpdate(false);
    alert(`Bulk Price Update applied: ${updateField} updated using ${formulaType} of ${formulaValue}.`);
  };

  // Export current list to PDF file
  const handleExport = () => {
    const doc = new jsPDF('landscape'); // use landscape as there are many columns
    doc.text("Stock Price Update", 14, 15);

    const headers = ['ID', 'Product Name'];
    if (settings.showHSN) headers.push('HSN');
    if (settings.showGST) headers.push('GST');
    if (settings.showBranches) headers.push('Branches');
    if (settings.showPurchasePrice) headers.push('Purchase Price');
    if (settings.showStockQty) headers.push('Qty');
    if (settings.showMRP) headers.push('MRP');
    if (settings.showCreditSalePrice) headers.push('Credit Sale');
    if (settings.showCashSalePrice) headers.push('Cash Sale');
    if (settings.showWholeSalePrice) headers.push('Whole Sale');
    headers.push('Modified');

    const rows = products.map(p => {
      const row = [p.id, p.name];
      if (settings.showHSN) row.push(p.hsn === '+Add' ? '' : p.hsn);
      if (settings.showGST) row.push(p.gst);
      if (settings.showBranches) row.push(p.branch);
      if (settings.showPurchasePrice) row.push(p.purchasePrice);
      if (settings.showStockQty) row.push(p.qty);
      if (settings.showMRP) row.push(p.mrp);
      if (settings.showCreditSalePrice) row.push(p.creditSale);
      if (settings.showCashSalePrice) row.push(p.cashSale);
      if (settings.showWholeSalePrice) row.push(p.wholeSale);
      row.push(p.modified ? 'Yes' : 'No');
      return row;
    });

    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Stock_Price_Update_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Filter products
  const displayedProducts = products.filter(p => {
    if (viewAll && !p.modified) return false;
    
    if (stockFilter === 'in_stock' && p.qty <= 0) return false;
    if (stockFilter === 'negative' && p.qty >= 0) return false;
    if (stockFilter === 'zero' && p.qty !== 0) return false;
    // Note: expire and expiry_soon need expiry data which might not be mapped yet
    
    if (searchQuery) {
      if (!p.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    }

    return true;
  });

  return (
    <div className="bg-[#f4f6f9] h-[calc(100vh-60px)] flex flex-col relative select-none">
      
      {/* Top Indigo Bar */}
      <div className="bg-[#4F46E5] px-4 py-[6px] flex flex-wrap justify-between items-center gap-2 text-white h-[45px]">
        <h2 className="text-[14.5px] font-medium tracking-wide">Stock Price Update</h2>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* View All Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-bold">View All</span>
            <div 
              onClick={() => setViewAll(!viewAll)}
              className={cn(
                "w-8 h-[18px] rounded-full relative cursor-pointer transition-colors duration-200 border border-white/20",
                viewAll ? "bg-white" : "bg-[#3b32c4]"
              )}
            >
              <div className={cn(
                "w-3.5 h-3.5 rounded-full absolute top-[1px] transition-all duration-200 shadow-sm",
                viewAll ? "right-[2px] bg-[#4F46E5]" : "left-[2px] bg-white"
              )}></div>
            </div>
            <span className="text-[13px] font-medium ml-1">View Modified</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 ml-2">
            <button 
              onClick={() => setShowBulkPriceUpdate(true)}
              className="bg-[#6c757d] hover:bg-[#5a6268] text-white px-3 py-[5px] rounded-[3px] text-[12px] font-bold transition-colors"
            >
              Bulk Price Update
            </button>
            <button 
              onClick={() => setShowBulkUpdate(true)}
              className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-[5px] rounded-[3px] text-[12px] font-bold transition-colors"
            >
              Bulk Update
            </button>
            <button 
              onClick={handleSaveChanges}
              disabled={isSaving}
              className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-[5px] rounded-[3px] text-[12px] font-bold flex items-center gap-1.5 transition-colors disabled:opacity-70 ml-2"
            >
              <Save className="w-[14px] h-[14px]" strokeWidth={2.5} /> {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={handleExport}
              className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-[5px] rounded-[3px] text-[12px] font-bold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-[14px] h-[14px]" strokeWidth={2.5} /> Export
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white px-2 py-[5px] rounded-[3px] flex items-center justify-center transition-colors ml-1"
            >
              <X className="w-[14px] h-[14px]" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
        {/* Search Header */}
        <div className="bg-white border border-gray-200 rounded-[3px] p-4 shadow-sm shrink-0">
          <label className="text-[13px] font-bold text-gray-800 mb-1.5 block">Search Product</label>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-1 border border-gray-300 rounded-[3px] overflow-hidden">
              <div className="bg-white border-r border-gray-300 px-3 flex items-center justify-center">
                <Filter className="w-4 h-4 text-[#007bff]" strokeWidth={2.5} />
              </div>
              <select className="w-[180px] bg-white border-r border-gray-300 px-2 py-[5px] text-[13px] outline-none text-gray-700">
                <option value="name">Product Name</option>
                <option value="code">Product Code</option>
                <option value="barcode">Barcode</option>
                <option value="company">Company</option>
                <option value="category">Category</option>
                <option value="type">Product Type</option>
                <option value="gst_applicable">Gst Applicable</option>
                <option value="gst">GST</option>
                <option value="commission">Product Commision</option>
                <option value="hsn_sac">HSN/SAC</option>
              </select>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for Product Name" 
                className="flex-1 px-3 py-[5px] text-[13px] outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
            
            <select 
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="w-full sm:w-[300px] min-w-0 border border-gray-300 rounded-[3px] px-2 py-[6px] text-[13px] outline-none text-gray-700 bg-white"
            >
              <option value="all">Show All</option>
              <option value="in_stock">Only In Stock</option>
              <option value="negative">Only Negative</option>
              <option value="zero">Zero Stock</option>
              <option value="expire">Expire</option>
              <option value="expiry_soon">Expiry Soon</option>
            </select>
          </div>
        </div>

        {/* Product Cards List */}
        <div className="flex flex-col gap-4">
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-[3px] p-3 shadow-sm flex flex-col gap-2.5">
                {/* Top Row */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <h3 className="text-[14.5px] font-bold text-[#1e293b]">
                    #{product.id}. {product.name}
                    {product.modified && (
                      <span className="ml-2 bg-blue-100 text-[#007bff] text-[10px] font-bold px-1.5 py-0.5 rounded-[2px] select-none">
                        Modified
                      </span>
                    )}
                  </h3>

                  <div className="flex items-center gap-2 text-[13px] font-semibold text-[#334155]">
                    <div className="flex items-center gap-1.5">
                      <span>Purchase Price :</span>
                      <div className="flex items-center border border-gray-400 rounded-[4px] h-[26px] overflow-hidden bg-white">
                        <input 
                          type="text" 
                          value={product.purchasePrice}
                          onChange={(e) => handleFieldChange(product.id, 'purchasePrice', e.target.value)}
                          className="w-[45px] h-full px-1.5 text-center text-[13px] outline-none font-bold text-[#1e293b]"
                        />
                        {product.id === 1 && (
                          <span className="text-gray-400 text-[10.5px] font-medium pr-1.5 bg-white select-none">
                            +2 more
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-300 mx-1">|</span>
                    <div className="flex items-center gap-1">
                      P.Qty : <span className="font-bold text-[#1e293b]">{product.qty}</span> <span className="text-gray-300 mx-1">|</span> S.Qty : <span className="font-bold text-[#1e293b]">{product.sQty}</span> <span className="text-gray-300 mx-1">|</span> value: <span className="font-bold text-[#1e293b]">{product.value}</span>
                    </div>
                  </div>
                </div>

                <div className="h-[1px] bg-gray-100 w-full my-0.5"></div>

                {/* Bottom Row */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                  <div className="text-[12.5px] text-gray-500 font-medium flex items-center gap-1.5">
                    <span>HSN :</span> <span 
                      onClick={() => {
                        const newHsn = prompt("Enter HSN Code:", product.hsn === '+Add' ? '' : product.hsn);
                        if (newHsn !== null) handleFieldChange(product.id, 'hsn', newHsn || '+Add');
                      }}
                      className="text-[#ef4444] hover:underline cursor-pointer font-medium"
                    >{product.hsn}</span> <span className="text-gray-300 mx-0.5">|</span>
                    <span>GST :</span> <span>{product.gst}</span> <span className="text-gray-300 mx-0.5">|</span>
                    <span>Branches :</span> <span>{product.branch}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-[120px] mt-1.5">
                      <label className="absolute -top-[7px] left-2 bg-white px-0.5 text-[10.5px] font-bold text-[#1e3a8a] leading-none">MRP</label>
                      <input 
                        type="text" 
                        value={product.mrp}
                        onChange={(e) => handleFieldChange(product.id, 'mrp', e.target.value)}
                        className="w-full h-[30px] border border-[#cbd5e1] rounded-[3px] px-2.5 text-[13px] text-right outline-none text-gray-800 focus:border-blue-500"
                      />
                    </div>
                    <div className="relative w-[120px] mt-1.5">
                      <label className="absolute -top-[7px] left-2 bg-white px-0.5 text-[10.5px] font-bold text-[#1e3a8a] leading-none">Credit Sale</label>
                      <input 
                        type="text" 
                        value={product.creditSale}
                        onChange={(e) => handleFieldChange(product.id, 'creditSale', e.target.value)}
                        className="w-full h-[30px] border border-[#cbd5e1] rounded-[3px] px-2.5 text-[13px] text-right outline-none text-gray-800 focus:border-blue-500"
                      />
                    </div>
                    <div className="relative w-[120px] mt-1.5">
                      <label className="absolute -top-[7px] left-2 bg-white px-0.5 text-[10.5px] font-bold text-[#1e3a8a] leading-none">Cash Sale</label>
                      <input 
                        type="text" 
                        value={product.cashSale}
                        onChange={(e) => handleFieldChange(product.id, 'cashSale', e.target.value)}
                        className="w-full h-[30px] border border-[#cbd5e1] rounded-[3px] px-2.5 text-[13px] text-right outline-none text-gray-800 focus:border-blue-500"
                      />
                    </div>
                    <div className="relative w-[120px] mt-1.5">
                      <label className="absolute -top-[7px] left-2 bg-white px-0.5 text-[10.5px] font-bold text-[#1e3a8a] leading-none">Whole Sale</label>
                      <input 
                        type="text" 
                        value={product.wholeSale}
                        onChange={(e) => handleFieldChange(product.id, 'wholeSale', e.target.value)}
                        className="w-full h-[30px] border border-[#cbd5e1] rounded-[3px] px-2.5 text-[13px] text-right outline-none text-gray-800 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white border border-gray-200 rounded-[3px] p-8 shadow-sm flex flex-col items-center justify-center text-center">
              <Info className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-500 font-medium text-[14px]">No modified products found.</p>
              <p className="text-gray-400 text-[12px] mt-1">Make changes to any product price to see it listed here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Update Modal Overlay */}
      {showBulkUpdate && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 rounded-[4px] shadow-2xl w-full max-w-[650px] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="border-b border-gray-200 py-3 px-4 flex justify-between items-center">
              <h3 className="text-[15.5px] font-bold text-gray-800">Bulk Update Product Fields</h3>
              <button 
                onClick={() => setShowBulkUpdate(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex flex-col gap-4">
              {/* Teal Alert Banner */}
              <div className="bg-[#4F46E5] text-white p-3 rounded-[3px] flex items-start gap-2.5">
                <Info className="w-[18px] h-[18px] mt-[1px] flex-shrink-0" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold">This will update {displayedProducts.length} product(s) with the selected field value.</span>
                  <span className="text-[11px] text-white/80 font-medium">Only one field can be updated at a time.</span>
                </div>
              </div>

              {/* Select Input Group */}
              <div className="flex flex-col gap-1.5 mt-1">
                <label className="text-[13px] font-bold text-gray-800">
                  Select Field to Update <span className="text-red-500">*</span>
                </label>
                <select 
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full h-[36px] border border-gray-300 rounded-[3px] px-2.5 text-[13.5px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                >
                  <option value="">-- Select Field --</option>
                  <option value="mrp">MRP</option>
                  <option value="creditSale">Credit Sale Price</option>
                  <option value="cashSale">Cash Sale Price</option>
                  <option value="wholeSale">Whole Sale Price</option>
                  <option value="purchasePrice">Purchase Price</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-150 py-3 px-4 flex justify-end gap-2 bg-gray-50">
              <button 
                onClick={() => setShowBulkUpdate(false)}
                className="border border-gray-300 bg-white text-gray-750 hover:bg-gray-50 px-4 h-[34px] rounded-[3px] text-[13px] font-bold transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkUpdate}
                className="bg-[#007bff] hover:bg-[#0069d9] text-white px-4 h-[34px] rounded-[3px] text-[13px] font-bold flex items-center gap-1.5 transition-colors focus:outline-none"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} /> Update {displayedProducts.length} Product(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Price Update Modal Overlay */}
      {showBulkPriceUpdate && (
        <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-300 rounded-[4px] shadow-2xl w-full max-w-[550px] flex flex-col p-4 overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex flex-col">
                <h3 className="text-[20px] font-bold text-gray-800 leading-tight">Bulk Price Update</h3>
                <span className="text-[13px] text-gray-500 font-medium">Apply formula to all filtered items in one step</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-8 h-8 rounded-full bg-[#e3f2fd] flex items-center justify-center cursor-pointer text-[#007bff] hover:bg-[#bbdefb] transition-colors">
                  <Tag className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-[#e3f2fd] flex items-center justify-center cursor-pointer text-[#007bff] hover:bg-[#bbdefb] transition-colors">
                  <HelpCircle className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Modal Body Card Wrapper */}
            <div className="border border-gray-200 rounded-[5px] p-4 flex flex-col gap-4">
              {/* Row 1: Update Field */}
              <div className="flex items-center gap-4">
                <label className="w-[100px] text-[14.5px] font-bold text-gray-700">Update</label>
                <select 
                  value={updateField}
                  onChange={(e) => setUpdateField(e.target.value)}
                  className="flex-1 h-[36px] border border-gray-300 rounded-[3px] px-2.5 text-[13.5px] outline-none text-gray-700 bg-white"
                >
                  <option value="MRP">MRP</option>
                  <option value="Credit Sale">Credit Sale</option>
                  <option value="Cash Sale">Cash Sale</option>
                  <option value="Whole Sale">Whole Sale</option>
                </select>
              </div>

              {/* Row 2: Based On Field */}
              <div className="flex items-center gap-4">
                <label className="w-[100px] text-[14.5px] font-bold text-gray-700">Based On</label>
                <select 
                  value={basedOnField}
                  onChange={(e) => setBasedOnField(e.target.value)}
                  className="flex-1 h-[36px] border border-gray-300 rounded-[3px] px-2.5 text-[13.5px] outline-none text-gray-700 bg-white"
                >
                  <option value="Purchase Price">Purchase Price</option>
                  <option value="MRP">MRP</option>
                  <option value="Credit Sale">Credit Sale</option>
                  <option value="Cash Sale">Cash Sale</option>
                  <option value="Whole Sale">Whole Sale</option>
                </select>
              </div>

              {/* Row 3: Formula Field */}
              <div className="flex items-center gap-4">
                <label className="w-[100px] text-[14.5px] font-bold text-gray-700">Formula</label>
                <select 
                  value={formulaType}
                  onChange={(e) => setFormulaType(e.target.value)}
                  className="flex-1 h-[36px] border border-gray-300 rounded-[3px] px-2.5 text-[13.5px] outline-none text-gray-700 bg-white"
                >
                  <option value="Increase by %">Increase by %</option>
                  <option value="Decrease by %">Decrease by %</option>
                  <option value="Increase by Amount">Increase by Amount</option>
                  <option value="Decrease by Amount">Decrease by Amount</option>
                  <option value="Set Fixed Value">Set Fixed Value</option>
                </select>
              </div>

              {/* Row 4: Value Input */}
              <div className="flex items-center gap-4">
                <label className="w-[100px] text-[14.5px] font-bold text-gray-700">Value</label>
                <input 
                  type="text" 
                  placeholder="Enter value"
                  value={formulaValue}
                  onChange={(e) => setFormulaValue(e.target.value)}
                  className="flex-1 h-[36px] border border-gray-300 rounded-[3px] px-2.5 text-[13.5px] outline-none text-gray-700 bg-white placeholder-gray-400"
                />
              </div>

              {/* Checkbox Banner */}
              <div className="bg-[#e3f2fd] border border-[#bfe5f0] p-3 py-2 px-3 rounded-[3px] flex items-center gap-2 mt-1">
                <input 
                  type="checkbox" 
                  id="prevent-neg"
                  checked={preventNegative}
                  onChange={(e) => setPreventNegative(e.target.checked)}
                  className="w-4 h-4 accent-[#007bff] cursor-pointer"
                />
                <label htmlFor="prevent-neg" className="text-[13.5px] font-bold text-[#0c5460] cursor-pointer select-none">
                  Prevent negative values
                </label>
              </div>

              {/* Rows Count Banner */}
              <div className="bg-[#f8f9fa] border border-gray-200 p-2.5 px-3 rounded-[3px] text-[12.5px] text-gray-500">
                This action will be applied to <span className="font-bold text-gray-700">{displayedProducts.length}</span> filtered row(s).
              </div>
            </div>

            {/* Modal Footer Buttons */}
            <div className="flex justify-center gap-4 mt-5">
              <button 
                onClick={handleBulkPriceUpdateApply}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-7 py-2 rounded-[4px] text-[13.5px] font-bold transition-colors focus:outline-none"
              >
                Apply Changes
              </button>
              <button 
                onClick={() => setShowBulkPriceUpdate(false)}
                className="bg-[#dc3545] hover:bg-[#c82333] text-white px-7 py-2 rounded-[4px] text-[13.5px] font-bold transition-colors focus:outline-none"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
