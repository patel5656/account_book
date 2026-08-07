import React, { useState } from 'react';
import { X } from 'lucide-react';
import apiClient from '../api/apiClient';

export function AddNewUnitModal({ isOpen, onClose, type, onAdd }) {
  const [unitName, setUnitName] = useState('');
  const [unitShortName, setUnitShortName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAdd = async () => {
    if (!unitName || !unitShortName) {
      alert("Both fields are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.post('/units', {
        name: unitName,
        uqc: unitShortName
      });
      
      if (response.data && response.data.success) {
        onAdd(unitName);
        setUnitName('');
        setUnitShortName('');
        onClose();
      } else {
        alert(response.data?.message || "Failed to add unit");
      }
    } catch (error) {
      console.error("Error adding unit", error);
      alert(error.response?.data?.message || "Error adding unit");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[6px] shadow-lg w-[400px] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-[16px] font-medium text-gray-800">{type} Unit</h2>
            <p className="text-[13px] text-gray-500 mt-1">Create a new unit for your inventory items.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 self-start mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-2 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-gray-700 font-bold">Unit Name <span className="text-red-500">*</span></label>
            <input 
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              placeholder="e.g. KILOGRAMS"
              className="w-full border border-gray-300 rounded-[6px] px-3 py-2 text-[13px] outline-none focus:border-[#3b82f6] bg-[#f8f9fa]"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] text-gray-700 font-bold">Unit Short Name <span className="text-red-500">*</span></label>
            <input 
              type="text"
              value={unitShortName}
              onChange={(e) => setUnitShortName(e.target.value)}
              placeholder="e.g. KG"
              className="w-full border border-gray-300 rounded-[6px] px-3 py-2 text-[13px] outline-none focus:border-[#3b82f6] bg-[#f8f9fa]"
            />
          </div>
          <p className="text-[12px] text-gray-500 mt-2">This unit will be available for all future inventory items.</p>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-3 mt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-[6px] text-[13px] font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleAdd}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-[6px] text-[13px] font-medium text-white transition-colors shadow-sm disabled:opacity-70"
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
