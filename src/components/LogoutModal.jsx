import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LogoutModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [allDevices, setAllDevices] = useState(false);

  if (!isOpen) return null;

  const handleLogout = () => {
    // If backend supported invalidating all tokens, we would pass `allDevices` here.
    // For now, it just clears local storage and navigates.
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[400px] shadow-xl rounded-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
          <h2 className="text-white text-[16px] font-medium">Logged off</h2>
          <button 
            onClick={onClose}
            className="text-[#dc3545] hover:text-red-700 transition-colors focus:outline-none"
          >
            <X className="w-[22px] h-[22px]" strokeWidth={4} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-8 pb-10 text-center flex flex-col items-center justify-center gap-5">
          <h3 className="text-[15px] font-bold text-gray-800">Logged out From All Device ?</h3>
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <input 
              type="checkbox" 
              checked={allDevices}
              onChange={(e) => setAllDevices(e.target.checked)}
              className="w-4 h-4 rounded-sm border-gray-400 text-[#4F46E5] focus:ring-[#4F46E5]"
            />
            <span className="text-[14px] text-gray-700">All Devices</span>
          </label>
        </div>
        
        {/* Footer */}
        <div className="bg-[#f4f6f9] border-t border-gray-200 px-4 py-3 flex justify-end">
          <button 
            onClick={handleLogout}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white text-[14px] font-medium px-5 py-1.5 rounded-[3px] transition-colors shadow-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
