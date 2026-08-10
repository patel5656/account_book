import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import apiClient from '../api/apiClient';

export function GstUqcMergeModal({ isOpen, onClose }) {
  const [filterType, setFilterType] = useState('all');
  const [units, setUnits] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedUqc, setSelectedUqc] = useState('');
  const [isMerging, setIsMerging] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUnits();
    }
  }, [isOpen]);

  const fetchUnits = async () => {
    try {
      const res = await apiClient.get('/units');
      setUnits(res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching units:', error);
    }
  };

  const handleMerge = async () => {
    if (!selectedUnit || !selectedUqc) return alert('Please select a unit and a UQC code');
    try {
      setIsMerging(true);
      const unitObj = units.find(u => u.id.toString() === selectedUnit);
      if (!unitObj) return;

      await apiClient.put(`/units/${selectedUnit}`, {
        name: unitObj.name,
        uqc: selectedUqc,
        value: unitObj.value,
        compareTo: unitObj.compareTo
      });

      alert('GST UQC updated successfully!');
      fetchUnits();
      setSelectedUnit('');
      setSelectedUqc('');
      onClose();
    } catch (error) {
      console.error('Error updating GST UQC:', error);
      alert('Failed to update GST UQC.');
    } finally {
      setIsMerging(false);
    }
  };

  const filteredUnits = units.filter(u => {
    if (filterType === 'not_mapped') return !u.uqc || u.uqc === '';
    return true;
  });

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white w-[min(96vw,600px)] rounded-[3px] shadow-lg flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-[6px] flex justify-between items-center text-white">
          <h2 className="text-[14.5px] font-medium tracking-wide">GST UQC Correction</h2>
          <button onClick={onClose} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-2 py-[4px] rounded-[3px] flex items-center justify-center transition-colors">
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">
          {/* Radio Buttons */}
          <div className="flex justify-center gap-12">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="gstUqcFilter"
                checked={filterType === 'not_mapped'} 
                onChange={() => setFilterType('not_mapped')}
                className="w-3.5 h-3.5 accent-[#007bff]"
              />
              <span className="text-[13px] text-gray-700">Show Only Not Mapped Units ?</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="radio" 
                name="gstUqcFilter"
                checked={filterType === 'all'} 
                onChange={() => setFilterType('all')}
                className="w-3.5 h-3.5 accent-[#007bff]"
              />
              <span className="text-[13px] text-gray-700">Show All</span>
            </label>
          </div>

          {/* Dropdowns */}
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-900">Unit Name</label>
              <select 
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
              >
                <option value="">Select Unit</option>
                {filteredUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.name} {u.uqc ? `(Mapped: ${u.uqc})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-900">GST UQC</label>
              <select 
                value={selectedUqc}
                onChange={(e) => setSelectedUqc(e.target.value)}
                className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
              >
                <option value="">Select UQC</option>
                <option value="PCS-PIECES">PCS-PIECES</option>
                <option value="KGS-KILOGRAMS">KGS-KILOGRAMS</option>
                <option value="LTR-LITRES">LTR-LITRES</option>
                <option value="MTR-METERS">MTR-METERS</option>
                <option value="NOS-NUMBERS">NOS-NUMBERS</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-4 py-3 bg-[#f8f9fa] border-t border-gray-100 flex justify-end gap-2">
          <button 
            onClick={handleMerge}
            disabled={isMerging}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[5px] rounded-[3px] text-[13px] font-medium transition-colors disabled:opacity-70"
          >
            {isMerging ? 'Merging...' : 'Merge'}
          </button>
          <button onClick={onClose} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-[5px] rounded-[3px] text-[13px] font-medium transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
