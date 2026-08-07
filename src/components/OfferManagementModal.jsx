import React, { useState, useEffect } from 'react';
import { X, IndianRupee, Percent, PartyPopper, Tag } from 'lucide-react';
import apiClient from '../api/apiClient';

export function OfferManagementModal({ isOpen, onClose, onSubmit, editData }) {
  const isEditMode = !!editData;

  const [isActive, setIsActive] = useState(true);
  const [offerType, setOfferType] = useState('Flat Discount');
  const [offerName, setOfferName] = useState('');
  const [priority, setPriority] = useState(1);
  const [minCartValue, setMinCartValue] = useState(0);
  const [productSelection, setProductSelection] = useState('Select Specific Category');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [discountType, setDiscountType] = useState('Flat');
  const [discountValue, setDiscountValue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [offerDescription, setOfferDescription] = useState('');
  const [buyQty, setBuyQty] = useState(1);
  const [getQty, setGetQty] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When editData changes (modal opens for edit), populate form fields
  useEffect(() => {
    if (editData) {
      setOfferName(editData.name || '');
      setIsActive(editData.status === 'ACTIVE');
      setOfferType(editData.offerType || 'Flat Discount');
      setProductSelection(editData.productSelection || 'Select Specific Category');
      setDiscountType(editData.discountType || 'Flat');
      setDiscountValue(editData.discountValue || '');
      setStartDate(editData.startDate || '');
      setEndDate(editData.endDate || '');
      setOfferDescription(editData.offerDescription || '');
      setPriority(editData.priority ? Number(editData.priority) : 1);
      setMinCartValue(editData.minCart && editData.minCart !== '-' ? Number(editData.minCart) : 0);
      
      if (editData.target) {
        if (editData.target.startsWith('CATEGORY: ')) {
          setSelectedCategory(editData.target.replace('CATEGORY: ', ''));
        } else if (editData.target.startsWith('ITEM: ')) {
          setSelectedProduct(editData.target.replace('ITEM: ', ''));
        }
      }
      setBuyQty(editData.buyQty || 1);
      setGetQty(editData.getQty || 1);
    } else {
      // Reset when opening for create
      setOfferName('');
      setIsActive(true);
      setOfferType('Flat Discount');
      setProductSelection('Select Specific Category');
      setDiscountType('Flat');
      setDiscountValue('');
      setStartDate('');
      setEndDate('');
      setOfferDescription('');
      setPriority(1);
      setMinCartValue(0);
      setSelectedCategory('');
      setSelectedProduct('');
      setBuyQty(1);
      setGetQty(1);
    }
  }, [editData, isOpen]);

  // Fetch categories and products on open
  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [catRes, prodRes] = await Promise.all([
            apiClient.get('/categories'),
            apiClient.get('/products')
          ]);
          if (catRes.data && catRes.data.data) {
            setCategories(catRes.data.data);
          }
          if (prodRes.data && prodRes.data.data) {
            setProducts(prodRes.data.data);
          }
        } catch (err) {
          console.error("Failed to fetch data:", err);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Auto-set discount type when changing offer type explicitly, but allow manual override
  useEffect(() => {
    if (offerType === 'Flat Discount') setDiscountType('Flat');
    if (offerType === 'Percentage Discount') setDiscountType('Percentage');
  }, [offerType]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const typeStr = offerType === 'Buy 1 Get 1' ? 'BOGO' : 
                      (discountType === 'Flat' || discountType.toLowerCase().includes('flat')) ? 'FLAT' : 
                      (discountType === 'Percentage' || discountType.toLowerCase().includes('percent')) ? 'PERCENTAGE' : 
                      discountType.toUpperCase();
      
      const targetStr = productSelection === 'All Products' 
        ? 'ENTIRE CART' 
        : productSelection === 'Select Specific Category' 
          ? `CATEGORY: ${selectedCategory}` 
          : `ITEM: ${selectedProduct}`;
      
      const valueStr = offerType === 'Buy 1 Get 1' ? 'Buy 1 Get 1' : 
                       (discountType === 'Flat' || discountType.toLowerCase().includes('flat')) ? `₹${discountValue || 0} OFF` : 
                       (discountType === 'Percentage' || discountType.toLowerCase().includes('percent')) ? `${discountValue || 0}% OFF` : 
                       `${discountValue || 0} ${discountType}`;
      
      const payload = {
        name: offerName || 'New Offer',
        offerType,
        productSelection,
        discountType,
        discountValue,
        buyQty: offerType === 'Buy 1 Get 1' || offerType === 'Product Offer' ? buyQty : null,
        getQty: offerType === 'Buy 1 Get 1' || offerType === 'Product Offer' ? getQty : null,
        startDate,
        endDate,
        schedule: startDate && endDate ? `${startDate} to ${endDate}` : 'Always Active',
        offerDescription,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        minCart: String(minCartValue),
        target: targetStr,
        type: typeStr,
        offerValue: valueStr,
        scheduleIcon: startDate && endDate ? 'CalendarClock' : null,
        priority: String(priority)
      };

      if (isEditMode) {
        await apiClient.put(`/offers/${editData.id}`, payload);
      } else {
        payload.usage = 0;
        await apiClient.post('/offers', payload);
      }

      if (onSubmit) onSubmit();
      onClose();
    } catch (error) {
      console.error('Failed to save offer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(96vw,800px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5">
            {isEditMode ? 'Edit Offer' : 'Offer Management Setup'}
          </h2>
          <button 
            onClick={onClose} 
            className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors"
          >
            <X className="w-5 h-5 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white overflow-y-auto max-h-[calc(100vh-150px)] custom-scrollbar">
          <div className="flex flex-col gap-5">
            
            {/* Row 1: Offer Name */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-[14px] font-bold text-gray-800">Offer Name</label>
              <input 
                type="text" 
                value={offerName}
                onChange={(e) => setOfferName(e.target.value)}
                placeholder="E.g. Diwali Mega Sale"
                className="w-full border border-[#4F46E5] bg-[#e8e5ff] placeholder-gray-500 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold"
              />
            </div>

            {/* Row 2: Offer Type & Product Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[14px] font-bold text-gray-800">Offer Type</label>
                <select 
                  value={offerType}
                  onChange={(e) => setOfferType(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[9px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white font-medium"
                >
                  <option value="Buy 1 Get 1">Buy X Get Y Free</option>
                  <option value="Flat Discount">Flat Discount (₹)</option>
                  <option value="Percentage Discount">Percentage Discount (%)</option>
                  <option value="Festival Discount">Festival Discount (🎉)</option>
                  <option value="Product Offer">Product Offer (🏷️)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-[14px] font-bold text-gray-800">Product Selection</label>
                <select 
                  value={productSelection}
                  onChange={(e) => setProductSelection(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[9px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white font-medium"
                >
                  <option>All Products</option>
                  <option>Select Specific Category</option>
                  <option>Select Specific Item</option>
                </select>
              </div>
              
              {productSelection === 'Select Specific Category' && (
                <div className="flex flex-col gap-1 w-full md:col-span-2">
                  <label className="text-[14px] font-bold text-gray-800">Select Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-[9px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white font-medium"
                  >
                    <option value="">-- Choose Category --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {productSelection === 'Select Specific Item' && (
                <div className="flex flex-col gap-1 w-full md:col-span-2">
                  <label className="text-[14px] font-bold text-gray-800">Select Product</label>
                  <select 
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-[9px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white font-medium"
                  >
                    <option value="">-- Choose Product --</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Row 3: Conditional Logic Fields */}
            <div className="bg-gray-50 border border-gray-200 rounded-[3px] p-4">
              {offerType === 'Buy 1 Get 1' || offerType === 'Product Offer' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[13px] font-bold text-blue-800">Buy Quantity</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 1"
                      value={buyQty}
                      onChange={(e) => setBuyQty(e.target.value)}
                      className="w-full border border-blue-300 rounded-[3px] px-3 py-[7px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[13px] font-bold text-green-800">Get Free Quantity</label>
                    <input 
                      type="number" 
                      placeholder="e.g. 1"
                      value={getQty}
                      onChange={(e) => setGetQty(e.target.value)}
                      className="w-full border border-green-300 rounded-[3px] px-3 py-[7px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[13px] font-bold text-gray-800">Discount Type</label>
                    <input 
                      type="text"
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value)}
                      placeholder="e.g. Flat, Percentage, etc."
                      className="w-full border border-gray-300 rounded-[3px] px-3 py-[7px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white"
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    <label className="text-[13px] font-bold text-gray-800">Discount Value</label>
                    <div className="relative flex items-center border border-gray-300 rounded-[3px] bg-white overflow-hidden focus-within:border-[#4F46E5] focus-within:ring-1 focus-within:ring-[#4F46E5]">
                      <input 
                        type="number" 
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        placeholder="e.g. 10"
                        className="w-full py-[7px] pl-3 pr-2 text-[14px] outline-none text-gray-800 bg-transparent"
                      />
                      <div className="flex items-center justify-center pl-1 pr-3 text-gray-500">
                        {offerType === 'Percentage Discount' || discountType === 'Percentage' ? <Percent size={18} /> : 
                         offerType === 'Festival Discount' ? <PartyPopper size={18} /> : 
                         offerType === 'Product Offer' ? <Tag size={18} /> : 
                         <IndianRupee size={18} />}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Row 3.5: Min Cart Value & Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[14px] font-bold text-gray-800">Min Cart Value (₹)</label>
                <input 
                  type="number" 
                  value={minCartValue}
                  onChange={(e) => setMinCartValue(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[9px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white"
                />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-[14px] font-bold text-gray-800">Priority (1 = Highest)</label>
                <input 
                  type="number" 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[9px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white"
                />
              </div>
            </div>

            {/* Row 4: Start Date & End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-[14px] font-bold text-gray-800">Start Date</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[9px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white uppercase"
                />
              </div>

              <div className="flex flex-col gap-1 w-full">
                <label className="text-[14px] font-bold text-gray-800">End Date</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[9px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white uppercase"
                />
              </div>
            </div>

            {/* Row 5: Description */}
            <div className="flex flex-col gap-1 w-full">
              <label className="text-[14px] font-bold text-gray-800">Offer Description</label>
              <textarea 
                rows="3"
                value={offerDescription}
                onChange={(e) => setOfferDescription(e.target.value)}
                placeholder="Enter offer rules and details..."
                className="w-full border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white resize-none"
              ></textarea>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8f9fa] px-5 py-3 flex justify-end gap-2 border-t border-gray-200">
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-[7px] rounded-[3px] text-[14px] font-bold transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Submit'}
          </button>
          <button 
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-5 py-[7px] rounded-[3px] text-[14px] transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
