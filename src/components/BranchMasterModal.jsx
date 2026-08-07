import React, { useState } from 'react';
import { X } from 'lucide-react';
import apiClient from '../api/apiClient';

export function BranchMasterModal({ isOpen, onClose }) {
  const [isActive, setIsActive] = useState(true);
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = async () => {
    if (branchName.trim() !== '') {
      try {
        const payload = {
          name: branchName,
          code: branchCode,
          contact: contactNumber,
          gstin: gstin,
          address: address,
          isActive: isActive
        };
        const res = await apiClient.post('/branches', payload);
        
        window.dispatchEvent(new CustomEvent('branchAdded', { 
          detail: res.data.data 
        }));
        
        // Reset
        setBranchName('');
        setBranchCode('');
        setContactNumber('');
        setGstin('');
        setAddress('');
        setIsActive(true);
        onClose();
      } catch (error) {
        console.error('Failed to create branch', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(92vw,500px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5">Branch Master</h2>
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
        <div className="p-6 bg-white">
          <div className="flex flex-col gap-4">
            
            <div className="flex items-center justify-end">
              <div className="flex flex-wrap items-center gap-2">
                <div 
                  className={`w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-[#0d6efd]' : 'bg-gray-300'}`}
                  onClick={() => setIsActive(!isActive)}
                >
                  <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isActive ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                </div>
                <span className="text-[13px] font-bold text-gray-800 select-none">{isActive ? 'Active' : 'Inactive'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Branch Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Delhi South Branch"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Branch Code</label>
                <input 
                  type="text" 
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  placeholder="e.g. DEL-01"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Contact Number</label>
                <input 
                  type="text" 
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Phone / Mobile"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">GSTIN</label>
                <input 
                  type="text" 
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  placeholder="e.g. 07AABCU9603R1ZN"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5] uppercase"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-bold text-gray-800">Branch Address</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Complete postal address"
                className="w-full border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] min-h-[80px] resize-none"
              />
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
