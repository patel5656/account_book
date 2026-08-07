import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../api/apiClient';

export function LocationMasterModal({ isOpen, onClose }) {
  const [isActive, setIsActive] = useState(true);
  const [locationName, setLocationName] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [address, setAddress] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchBranches = async () => {
        setLoadingBranches(true);
        try {
          const res = await apiClient.get('/branches');
          if (res.data && res.data.data) {
            setBranches(res.data.data);
            if (res.data.data.length > 0) {
              setBranchId(res.data.data[0].id.toString());
            }
          }
        } catch (error) {
          console.error('Failed to fetch branches for location modal', error);
        } finally {
          setLoadingBranches(false);
        }
      };
      fetchBranches();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!locationName.trim()) {
      alert('Location name is required');
      return;
    }
    if (!branchId) {
      alert('Please select a branch');
      return;
    }

    try {
      const payload = {
        name: locationName,
        code: locationCode,
        address: address,
        branchId: parseInt(branchId, 10),
        isActive: isActive
      };
      const res = await apiClient.post('/locations', payload);
      
      // Dispatch custom event to notify parents
      window.dispatchEvent(new CustomEvent('locationAdded', { 
        detail: res.data.data 
      }));
      
      // Reset form
      setLocationName('');
      setLocationCode('');
      setAddress('');
      setIsActive(true);
      if (branches.length > 0) {
        setBranchId(branches[0].id.toString());
      }
      onClose();
    } catch (error) {
      console.error('Failed to create location', error);
      alert(error.response?.data?.message || 'Failed to create location');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(92vw,500px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5">Location Master</h2>
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

            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-bold text-gray-800">Select Branch <span className="text-red-500">*</span></label>
              {loadingBranches ? (
                <div className="text-[13px] text-gray-500">Loading branches...</div>
              ) : (
                <select 
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5] bg-white text-gray-800"
                >
                  {branches.length === 0 ? (
                    <option value="">No branches found. Please create a branch first.</option>
                  ) : (
                    branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} {b.code ? `(${b.code})` : ''}</option>
                    ))
                  )}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Location Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. Main Godown"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Location Code</label>
                <input 
                  type="text" 
                  value={locationCode}
                  onChange={(e) => setLocationCode(e.target.value)}
                  placeholder="e.g. LOC-01"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-bold text-gray-800">Location Address</label>
              <textarea 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Complete location address details"
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
