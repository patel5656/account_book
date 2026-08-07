import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../api/apiClient';

export function WarehouseMasterModal({ isOpen, onClose }) {
  const [isActive, setIsActive] = useState(true);
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseCode, setWarehouseCode] = useState('');
  const [branchId, setBranchId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [managerName, setManagerName] = useState('');
  const [address, setAddress] = useState('');

  const [branches, setBranches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const [branchesRes, locationsRes] = await Promise.all([
            apiClient.get('/branches'),
            apiClient.get('/locations')
          ]);
          if (branchesRes.data && branchesRes.data.data) {
            setBranches(branchesRes.data.data);
            if (branchesRes.data.data.length > 0) {
              setBranchId(branchesRes.data.data[0].id.toString());
            }
          }
          if (locationsRes.data && locationsRes.data.data) {
            setLocations(locationsRes.data.data);
          }
        } catch (error) {
          console.error('Failed to load branches and locations for warehouse modal', error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  // Filter locations based on selected branch
  const filteredLocations = locations.filter(
    (loc) => loc.branchId === parseInt(branchId, 10)
  );

  // Set default location when branch changes or filtered locations change
  useEffect(() => {
    if (filteredLocations.length > 0) {
      setLocationId(filteredLocations[0].id.toString());
    } else {
      setLocationId('');
    }
  }, [branchId, locations]);

  const handleSubmit = async () => {
    if (warehouseName.trim() === '') {
      alert('Warehouse Name is required');
      return;
    }

    try {
      const payload = {
        name: warehouseName,
        location: managerName || address, // using location field in backend
        isActive: isActive,
        branchId: branchId ? parseInt(branchId, 10) : null,
        locationId: locationId ? parseInt(locationId, 10) : null
      };
      const res = await apiClient.post('/warehouses', payload);
      
      // Notify parent
      window.dispatchEvent(new CustomEvent('warehouseAdded', { 
        detail: res.data.data
      }));
      
      // Reset
      setWarehouseName('');
      setWarehouseCode('');
      setBranchId(branches.length > 0 ? branches[0].id.toString() : '');
      setLocationId('');
      setManagerName('');
      setAddress('');
      setIsActive(true);
      onClose();
    } catch (error) {
      console.error('Failed to create warehouse', error);
      alert('Failed to create warehouse');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(92vw,500px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5">Warehouse Master</h2>
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
                <label className="text-[14px] font-bold text-gray-800">Warehouse Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={warehouseName}
                  onChange={(e) => setWarehouseName(e.target.value)}
                  placeholder="e.g. Main Godown"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Warehouse Code</label>
                <input 
                  type="text" 
                  value={warehouseCode}
                  onChange={(e) => setWarehouseCode(e.target.value)}
                  placeholder="e.g. WH-01"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Link to Branch</label>
                {loading ? (
                  <div className="text-[12px] text-gray-500">Loading...</div>
                ) : (
                  <select 
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5] bg-white text-gray-800"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                )}
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Location</label>
                <select 
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  disabled={!branchId}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5] bg-white text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Select Location</option>
                  {filteredLocations.map((loc) => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-[14px] font-bold text-gray-800">Manager Name</label>
                <input 
                  type="text" 
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                  placeholder="e.g. Rahul Kumar"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-bold text-gray-800">Warehouse Address</label>
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
