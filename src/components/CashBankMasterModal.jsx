import React, { useState } from 'react';
import { X } from 'lucide-react';

export function CashBankMasterModal({ isOpen, onClose, initialBookName = '', onSuccess }) {
  const [isActive, setIsActive] = useState(true);
  const [bookName, setBookName] = useState(initialBookName);
  const [type, setType] = useState('CASH BOOK');
  const [address, setAddress] = useState('');
  const [branch, setBranch] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accountNo, setAccountNo] = useState('');

  React.useEffect(() => {
    if (isOpen) {
      setBookName(initialBookName);
    }
  }, [isOpen, initialBookName]);

  const handleSubmit = () => {
    if (bookName.trim() !== '') {
      const payload = { 
        name: bookName, 
        type: type, 
        balance: 0,
        address,
        branch,
        ifsc,
        accountNo
      };
      if (onSuccess) {
        onSuccess(payload);
      } else {
        window.dispatchEvent(new CustomEvent('bankAdded', { detail: { id: Date.now(), ...payload } }));
      }
    }
    setBookName('');
    setType('CASH BOOK');
    setIsActive(true);
    setAddress('');
    setBranch('');
    setIfsc('');
    setAccountNo('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(96vw,700px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2.5 flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide">Cash/Bank Master</h2>
          <button onClick={onClose} className="text-[#ff4444] hover:text-[#ff0000] focus:outline-none transition-colors">
            <X className="w-6 h-6" strokeWidth={3.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white pb-10">
          <div className="flex flex-col sm:flex-row gap-6">
            
            {/* Left side: Book Name */}
            <div className="flex-1">
              <label className="block text-[14px] font-bold text-gray-800 mb-2">Book Name</label>
              <input 
                type="text" 
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                placeholder="Enter Bank Name Or UPI Name"
                className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-[7px] text-[14px] outline-none focus:border-[#4F46E5]"
              />
            </div>
            
            {/* Right side: Active toggle & Type */}
            <div className="flex-1 flex flex-col gap-1">
              
              <div className="flex flex-wrap items-center justify-between mb-1">
                <span className="text-[14px] font-bold text-gray-800">Type</span>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-gray-800 select-none">Active</span>
                  <div 
                    className={`w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-[#0d6efd]' : 'bg-gray-300'}`}
                    onClick={() => setIsActive(!isActive)}
                  >
                    <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isActive ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                  </div>
                </div>
              </div>

              <div>
                <select 
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[7px] text-[14px] outline-none focus:border-[#4F46E5] bg-white text-gray-700"
                >
                  <option>CASH BOOK</option>
                  <option>BANK BOOK</option>
                  <option>WALLET-BOOK</option>
                  <option>LOAN BOOK</option>
                  <option>NON-PAYMENT BOOK</option>
                </select>
              </div>

            </div>
          </div>

          {/* Additional Fields */}
          <div className="flex flex-col gap-6 mt-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-[14px] font-bold text-gray-800 mb-2">Account No</label>
                <input 
                  type="text" 
                  value={accountNo}
                  onChange={(e) => setAccountNo(e.target.value)}
                  placeholder="Enter Account No"
                  className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-[7px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[14px] font-bold text-gray-800 mb-2">IFSC Code</label>
                <input 
                  type="text" 
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value)}
                  placeholder="Enter IFSC Code"
                  className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-[7px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-[14px] font-bold text-gray-800 mb-2">Branch</label>
                <input 
                  type="text" 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="Enter Branch Name"
                  className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-[7px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[14px] font-bold text-gray-800 mb-2">Address</label>
                <input 
                  type="text" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter Bank Address"
                  className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-[7px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-4 flex justify-end gap-2 border-t border-gray-100">
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
