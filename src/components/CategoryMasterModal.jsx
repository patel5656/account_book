import React, { useState, useEffect } from 'react';
import { X, Settings, Image as ImageIcon } from 'lucide-react';

export function CategoryMasterModal({ isOpen, onClose, editData }) {
  const [isActive, setIsActive] = useState(true);
  const [categoryName, setCategoryName] = useState('');
  const [fileName, setFileName] = useState('');
  const [purchaseDiscount, setPurchaseDiscount] = useState('0');
  const [saleDiscount, setSaleDiscount] = useState('0');
  const fileInputRef = React.useRef(null);

  const [attributes, setAttributes] = useState([]);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrType, setNewAttrType] = useState('Text');
  const [newAttrOptions, setNewAttrOptions] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setCategoryName(editData.name || '');
        setPurchaseDiscount(editData.purchaseDiscount?.toString() || '0');
        setSaleDiscount(editData.saleDiscount?.toString() || '0');
        setIsActive(editData.isActive ?? true);
        setFileName('');
        setAttributes(editData.attributes || []);
      } else {
        setCategoryName('');
        setPurchaseDiscount('0');
        setSaleDiscount('0');
        setIsActive(true);
        setFileName('');
        setAttributes([]);
      }
      setNewAttrName('');
      setNewAttrType('Text');
      setNewAttrOptions('');
    }
  }, [isOpen, editData]);

  const handleSubmit = async () => {
    if (categoryName.trim() === '') return;

    const isRealEdit = !!(editData && editData.id);
    const payload = {
      name: categoryName,
      purchaseDiscount: parseFloat(purchaseDiscount) || 0,
      saleDiscount: parseFloat(saleDiscount) || 0,
      isActive,
      attributes
    };

    try {
      const { default: apiClient } = await import('../api/apiClient');
      let savedCategory;
      if (isRealEdit) {
        const res = await apiClient.put(`/categories/${editData.id}`, payload);
        savedCategory = res.data?.data || { ...payload, id: editData.id };
      } else {
        const res = await apiClient.post('/categories', payload);
        savedCategory = res.data?.data || { ...payload, id: Date.now() };
      }

      // Dispatch event so other components (dropdowns, lists) update their state
      window.dispatchEvent(new CustomEvent('categoryAdded', {
        detail: {
          ...savedCategory,
          isEdit: isRealEdit
        }
      }));
    } catch (err) {
      console.error('Error saving category:', err);
      // Even on error, dispatch event with local data as fallback
      window.dispatchEvent(new CustomEvent('categoryAdded', {
        detail: {
          id: isRealEdit ? editData.id : Date.now(),
          isEdit: isRealEdit,
          ...payload
        }
      }));
    }

    onClose();
  };

  const handleDownload = () => {
    if (fileName) {
      alert(`Downloading ${fileName}...`);
    } else {
      alert('No image available to download.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(92vw,500px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5">{editData ? 'Edit Category' : 'Category Master'}</h2>
          <div className="flex items-center">
            <button 
              onClick={onClose} 
              className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors"
            >
              <X className="w-5 h-5 text-white" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 bg-white overflow-y-auto max-h-[60vh] custom-scrollbar">
          <div className="flex flex-col gap-4">
            
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-bold text-gray-800">Category Name</label>
              </div>
              <input 
                type="text" 
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Enter Category Name"
                className="w-full border border-gray-300 bg-[#a6cdec] placeholder-gray-500 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Purchase Discount</label>
                <input 
                  type="text" 
                  value={purchaseDiscount}
                  onChange={(e) => setPurchaseDiscount(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Sale Discount</label>
                <input 
                  type="text" 
                  value={saleDiscount}
                  onChange={(e) => setSaleDiscount(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="flex flex-col items-center mt-2">
              <div className="flex items-center justify-between w-[300px]">
                <label className="text-[16px] text-gray-800">Image</label>
                <div className="text-[#007bff] cursor-pointer" onClick={handleDownload}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="stroke-current stroke-2">
                    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                  </svg>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={(e) => setFileName(e.target.files[0]?.name || '')} 
                accept="image/*"
              />
              <div 
                className="w-[300px] h-[120px] border border-dashed border-gray-300 mt-1 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current.click()}
              >
                {fileName ? (
                  <span className="text-[#28a745] text-[14px] font-bold">{fileName}</span>
                ) : (
                  <>
                    <span className="text-[#dca7a7] text-[14px]">Drag and drop or paste files here or</span>
                    <span className="text-[#007bff] text-[14px] font-bold">Browse..</span>
                  </>
                )}
              </div>
            </div>

            {/* Category Attributes section */}
            <div className="border-t border-gray-200 pt-4 mt-2">
              <h3 className="text-[14px] font-bold text-gray-800 mb-1">Category Attributes</h3>
              <p className="text-[11px] text-gray-500 mb-3">Configure dynamic fields (e.g. RAM, Storage, Color, Size) for items in this category.</p>
              
              {/* List of existing attributes */}
              {attributes.length === 0 ? (
                <div className="text-[12px] text-gray-500 italic bg-gray-50 border border-dashed border-gray-200 rounded-[3px] p-3 text-center mb-3">
                  No attributes defined. Items in this category will only have basic fields.
                </div>
              ) : (
                <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto custom-scrollbar border border-gray-200 rounded-[3px] p-2 bg-gray-50 mb-3">
                  {attributes.map((attr, index) => (
                    <div key={index} className="flex items-center justify-between bg-white border border-gray-100 rounded-[3px] px-3 py-1.5 shadow-sm text-[12px]">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{attr.name}</span>
                        <span className="text-[10px] text-gray-500">
                          Type: {attr.type}
                          {Array.isArray(attr.options) && attr.options.length > 0 && ` (${attr.options.join(', ')})`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAttributes(attributes.filter((_, i) => i !== index))}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Attribute Form */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-[3px] p-3 flex flex-col gap-3">
                <h4 className="text-[12px] font-bold text-indigo-900">Add New Attribute Field</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-gray-700">Field Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Storage"
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      className="border border-gray-300 rounded-[3px] px-2.5 py-1 text-[12px] outline-none focus:border-[#4F46E5] bg-white font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-gray-700">Field Type</label>
                    <select
                      value={newAttrType}
                      onChange={(e) => setNewAttrType(e.target.value)}
                      className="border border-gray-300 rounded-[3px] px-2 py-1 text-[12px] outline-none focus:border-[#4F46E5] bg-white text-gray-700"
                    >
                      <option value="Text">Text</option>
                      <option value="Number">Number</option>
                      <option value="Dropdown">Dropdown</option>
                      <option value="Multi Select">Multi Select</option>
                    </select>
                  </div>
                </div>

                {(newAttrType === 'Dropdown' || newAttrType === 'Multi Select') && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-gray-700">Options (comma-separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. 64GB, 128GB, 256GB"
                      value={newAttrOptions}
                      onChange={(e) => setNewAttrOptions(e.target.value)}
                      className="border border-gray-300 rounded-[3px] px-2.5 py-1 text-[12px] outline-none focus:border-[#4F46E5] bg-white font-medium"
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const name = newAttrName.trim();
                    if (!name) return alert('Please enter attribute name');
                    
                    let opts = null;
                    if (newAttrType === 'Dropdown' || newAttrType === 'Multi Select') {
                      opts = newAttrOptions
                        .split(',')
                        .map(o => o.trim())
                        .filter(Boolean);
                      if (opts.length === 0) {
                        return alert('Please enter options for Dropdown or Multi Select type');
                      }
                    }

                    setAttributes([...attributes, {
                      name,
                      type: newAttrType,
                      options: opts,
                      isRequired: false,
                      order: attributes.length + 1
                    }]);
                    setNewAttrName('');
                    setNewAttrOptions('');
                  }}
                  className="bg-[#4F46E5] hover:bg-[#4338ca] text-white text-[12px] font-bold py-1 px-3 rounded-[3px] self-end mt-1 shadow-sm transition-colors"
                >
                  + Add Field
                </button>
              </div>
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8f9fa] px-5 py-3 flex justify-end gap-2 border-t border-gray-200">
          <button 
            onClick={handleSubmit}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors"
          >
            Submit
          </button>
          <button 
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
