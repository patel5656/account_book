import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import apiClient from '../api/apiClient';

export function BomMasterModal({ isOpen, onClose, editData }) {
  const [isActive, setIsActive] = useState(true);
  const [bomName, setBomName] = useState('');
  const [productsList, setProductsList] = useState([]);
  const [unitsList, setUnitsList] = useState([]);
  
  // Local items state for current BOM
  const [items, setItems] = useState([]);

  // Form states for adding a product item
  const [selectedProductId, setSelectedProductId] = useState('');
  const [qty, setQty] = useState('1');
  const [unit, setUnit] = useState('');
  const [activeUnitDropdown, setActiveUnitDropdown] = useState(false);
  const [salePrice, setSalePrice] = useState('0');
  const [mrp, setMrp] = useState('0');
  const [wholesale, setWholesale] = useState('0');

  useEffect(() => {
    if (isOpen) {
      // Fetch products to populate the dropdown
      const fetchData = async () => {
        try {
          const [prodRes, unitRes] = await Promise.all([
            apiClient.get('/products'),
            apiClient.get('/units')
          ]);
          if (prodRes.data.success) {
            setProductsList(prodRes.data.data);
          }
          if (unitRes.data?.success) {
            setUnitsList(unitRes.data.data.map(u => u.name));
          }
        } catch (err) {
          console.error('Failed to fetch data for BOM dropdowns:', err);
        }
      };
      fetchData();
      
      if (editData) {
        setBomName(editData.name || '');
        setIsActive(editData.isActive ?? true);
        const editItems = (editData.items || []).map(item => ({
          productId: item.productId,
          productName: item.product?.name || 'Unknown',
          quantity: item.quantity,
          unit: item.unit,
          salePrice: item.salePrice,
          mrp: item.mrp,
          wholesale: item.wholesale
        }));
        setItems(editItems);
      } else {
        // Reset fields
        setBomName('');
        setItems([]);
        setIsActive(true);
      }
      resetAddItemForm();
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const resetAddItemForm = () => {
    setSelectedProductId('');
    setQty('1');
    setUnit('');
    setSalePrice('0');
    setMrp('0');
    setWholesale('0');
  };

  const handleAddItem = () => {
    if (!selectedProductId) {
      alert('Please select a product.');
      return;
    }
    if (!unit) {
      alert('Please select a unit.');
      return;
    }
    const product = productsList.find(p => p.id === parseInt(selectedProductId, 10));
    if (!product) return;

    // Check if product already added
    if (items.some(item => item.productId === product.id)) {
      alert('Product already added to BOM.');
      return;
    }

    const newItem = {
      productId: product.id,
      productName: product.name,
      quantity: parseFloat(qty) || 1,
      unit: unit,
      salePrice: parseFloat(salePrice) || 0,
      mrp: parseFloat(mrp) || 0,
      wholesale: parseFloat(wholesale) || 0
    };

    setItems([...items, newItem]);
    resetAddItemForm();
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!bomName.trim()) {
      alert('BOM Name is required.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one product to the Bill of Materials.');
      return;
    }

    try {
      const payload = {
        name: bomName,
        isActive,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unit: item.unit,
          salePrice: item.salePrice,
          mrp: item.mrp,
          wholesale: item.wholesale
        }))
      };

      if (editData) {
        const res = await apiClient.put(`/boms/${editData.id}`, payload);
        if (res.data.success) {
          window.dispatchEvent(new CustomEvent('bomAdded'));
          onClose();
        }
      } else {
        const res = await apiClient.post('/boms', payload);
        if (res.data.success) {
          window.dispatchEvent(new CustomEvent('bomAdded'));
          onClose();
        }
      }
    } catch (err) {
      console.error('Failed to create/update BOM master:', err);
      alert(err.response?.data?.message || 'Error saving BOM Master.');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(98vw,850px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5">{editData ? 'Edit BOM Master' : 'Create BOM Master'}</h2>
          <button 
            onClick={onClose} 
            className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors"
          >
            <X className="w-5 h-5 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 bg-white flex-1 overflow-auto max-h-[70vh]">
          <div className="flex flex-col gap-4">
            
            {/* BOM Name Row */}
            <div className="flex flex-col gap-1 border-b border-gray-200 pb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[14px] font-bold text-gray-800">BOM Name</label>
              </div>
              <input 
                type="text" 
                value={bomName}
                onChange={(e) => setBomName(e.target.value)}
                placeholder="Enter BOM Name"
                className="w-full border border-[#4F46E5] bg-[#e8e5ff] placeholder-gray-500 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold"
              />
            </div>

            {/* Form to add item */}
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <h3 className="text-[13px] font-bold text-gray-700 mb-2">Add Component Product</h3>
              <div className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-4 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-600">Product</label>
                  <select 
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none bg-white text-gray-700"
                  >
                    <option value="">Select Product</option>
                    {productsList.map(p => <option value={p.id} key={p.id}>{p.name} (SKU: {p.sku})</option>)}
                  </select>
                </div>
                
                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-600">Qty / Unit</label>
                  <div className="flex gap-1">
                    <input 
                      type="number" 
                      value={qty} 
                      onChange={(e) => setQty(e.target.value)}
                      className="w-1/3 border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 text-right" 
                    />
                    <div className="w-2/3 relative h-full">
                      <input 
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        onFocus={() => setActiveUnitDropdown(true)}
                        onBlur={() => setTimeout(() => setActiveUnitDropdown(false), 200)}
                        placeholder="Unit"
                        className="w-full h-full border border-gray-300 rounded-[3px] px-1 pr-5 py-[5px] text-[13px] outline-none focus:border-blue-500 bg-white"
                      />
                      <div 
                        className="absolute right-1 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setActiveUnitDropdown(!activeUnitDropdown);
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                      </div>
                      {activeUnitDropdown && (
                        <div className="absolute top-full left-0 w-full min-w-[80px] bg-white border border-gray-300 shadow-md z-[60] max-h-[150px] overflow-y-auto mt-1 rounded-[3px]">
                          {unitsList.map((u, i) => (
                            <div 
                              key={i} 
                              className="px-2 py-1.5 text-[12px] hover:bg-blue-50 cursor-pointer"
                              onMouseDown={(e) => {
                                 e.preventDefault();
                                 setUnit(u);
                                 setActiveUnitDropdown(false);
                              }}
                            >
                              {u}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-600">Sale Price</label>
                  <input 
                    type="number" 
                    value={salePrice} 
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 text-right" 
                  />
                </div>

                <div className="col-span-2 flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-gray-600">MRP / Wholesale</label>
                  <div className="flex gap-1">
                    <input 
                      type="number" 
                      value={mrp} 
                      placeholder="MRP"
                      onChange={(e) => setMrp(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded-[3px] px-1.5 py-1.5 text-[13px] outline-none focus:border-blue-500 text-right" 
                    />
                    <input 
                      type="number" 
                      value={wholesale} 
                      placeholder="Whsl"
                      onChange={(e) => setWholesale(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded-[3px] px-1.5 py-1.5 text-[13px] outline-none focus:border-blue-500 text-right" 
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <button 
                    onClick={handleAddItem}
                    className="w-full bg-[#007bff] hover:bg-[#0069d9] text-white py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
                  >
                    Add Component
                  </button>
                </div>
              </div>
            </div>

            {/* Added products list */}
            <div className="border border-gray-200 rounded-[3px] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 p-2.5 border-b border-gray-200 bg-gray-50 text-[13px] font-bold text-gray-700">
                <div className="col-span-1 text-center">#</div>
                <div className="col-span-4">Product Name</div>
                <div className="col-span-2 text-right">Quantity</div>
                <div className="col-span-2 text-right">Sale Price</div>
                <div className="col-span-2 text-right">MRP / Wholesale</div>
                <div className="col-span-1 text-center">Action</div>
              </div>
              
              {items.length === 0 ? (
                <div className="p-4 text-center text-[13px] text-gray-500">
                  No products added yet.
                </div>
              ) : (
                items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-2.5 border-b border-gray-100 items-center text-[13px]">
                    <div className="col-span-1 text-center text-gray-500">{idx + 1}</div>
                    <div className="col-span-4 font-bold text-gray-800">{item.productName}</div>
                    <div className="col-span-2 text-right">{item.quantity} {item.unit}</div>
                    <div className="col-span-2 text-right">{item.salePrice}</div>
                    <div className="col-span-2 text-right">{item.mrp} / {item.wholesale}</div>
                    <div className="col-span-1 flex justify-center">
                      <button 
                        onClick={() => handleRemoveItem(idx)}
                        className="text-[#dc3545] hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-4 py-3 flex justify-end gap-2 border-t border-gray-200">
          <button 
            onClick={handleSubmit}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
          >
            Submit
          </button>
          <button 
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
