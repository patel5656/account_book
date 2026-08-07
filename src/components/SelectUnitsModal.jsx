import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { AddNewUnitModal } from './AddNewUnitModal';
import apiClient from '../api/apiClient';

export function SelectUnitsModal({ isOpen, onClose, units, onSave, initialPrimary, initialSecondary, initialConversionRate }) {
  const [primaryUnit, setPrimaryUnit] = useState('');
  const [secondaryUnit, setSecondaryUnit] = useState('');
  const [conversionRate, setConversionRate] = useState('');
  const [localUnits, setLocalUnits] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalType, setAddModalType] = useState('Primary');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLocalUnits(units || []);
  }, [units]);

  useEffect(() => {
    if (isOpen) {
      setPrimaryUnit(initialPrimary || '');
      setSecondaryUnit(initialSecondary || '');
      setConversionRate(initialConversionRate || '');
    }
  }, [isOpen, initialPrimary, initialSecondary, initialConversionRate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-md shadow-lg w-[450px] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-[16px] font-medium text-gray-800">Select Units</h2>
            <p className="text-[13px] text-gray-500 mt-1">Choose primary and optional secondary units for this item.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 self-start mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-2 flex gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[13px] text-gray-700 font-medium">Primary Unit *</label>
            <select 
              value={primaryUnit} 
              onChange={(e) => setPrimaryUnit(e.target.value)}
              className="w-full border border-gray-300 rounded-[4px] px-3 py-2 text-[13px] outline-none focus:border-[#3b82f6] bg-white"
            >
              <option value="" disabled>Select unit</option>
              {localUnits.map((u, i) => <option key={i} value={u}>{u}</option>)}
            </select>
            <button 
              onClick={() => { setAddModalType('Primary'); setIsAddModalOpen(true); }}
              className="text-[#3b82f6] text-[12px] font-medium text-left mt-1 hover:underline w-max"
            >
              + Add New Primary Unit
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[13px] text-gray-700 font-medium">Secondary Unit (Optional)</label>
            <select 
              value={secondaryUnit} 
              onChange={(e) => setSecondaryUnit(e.target.value)}
              className="w-full border border-gray-300 rounded-[4px] px-3 py-2 text-[13px] outline-none focus:border-[#3b82f6] bg-white"
            >
              <option value="">Select unit</option>
              {localUnits.map((u, i) => <option key={i} value={u}>{u}</option>)}
            </select>
            <button 
              onClick={() => { setAddModalType('Secondary'); setIsAddModalOpen(true); }}
              className="text-[#3b82f6] text-[12px] font-medium text-left mt-1 hover:underline w-max"
            >
              + Add New Secondary Unit
            </button>
          </div>
        </div>

        {/* Conversion Rate Block */}
        {primaryUnit && secondaryUnit && (
          <div className="px-5 pb-2 mt-2 animate-in fade-in zoom-in-95 duration-200">
            <div className="border border-gray-200 rounded-[8px] p-4 bg-[#f8f9fa]">
              <h3 className="text-[13px] font-bold text-gray-800 mb-3">Conversion Rate</h3>
              <div className="flex items-center gap-3">
                <span className="text-[13px] text-gray-700 font-medium whitespace-nowrap">
                  1 {primaryUnit} =
                </span>
                <input 
                  type="number" 
                  value={conversionRate} 
                  onChange={(e) => setConversionRate(e.target.value)}
                  className="w-[100px] border-2 border-[#3b82f6] rounded-[6px] px-2 py-1.5 text-[14px] font-medium outline-none shadow-sm"
                />
                <span className="text-[13px] text-gray-700 font-medium whitespace-nowrap uppercase">
                  {secondaryUnit}
                </span>
              </div>
              <p className="text-[12px] text-gray-500 mt-2">
                Example: 1 {primaryUnit} = 12 {secondaryUnit}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-3 mt-0">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-300 rounded-[4px] text-[13px] font-medium text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              if (!primaryUnit) {
                alert("Primary Unit is required");
                return;
              }
              
              if (primaryUnit && secondaryUnit && conversionRate) {
                setIsSubmitting(true);
                try {
                  await apiClient.post('/unit-conversions', {
                    baseUnit: primaryUnit,
                    baseQty: 1,
                    targetUnit: secondaryUnit,
                    targetQty: parseFloat(conversionRate)
                  });
                } catch (error) {
                  console.error("Failed to save conversion rate", error);
                  alert(error.response?.data?.message || "Failed to save conversion rate to DB");
                } finally {
                  setIsSubmitting(false);
                }
              }
              
              onSave(primaryUnit, secondaryUnit, conversionRate);
            }}
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded-[4px] text-[13px] font-medium text-white transition-colors shadow-sm disabled:opacity-70"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <AddNewUnitModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        type={addModalType}
        onAdd={(newUnitName) => {
          setLocalUnits(prev => [...prev, newUnitName]);
          if (addModalType === 'Primary') {
            setPrimaryUnit(newUnitName);
          } else {
            setSecondaryUnit(newUnitName);
          }
        }}
      />
    </div>
  );
}
