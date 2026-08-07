import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function ExpenseMasterModal({ isOpen, onClose, expense }) {
  const [isActive, setIsActive] = useState(true);
  const [expenseName, setExpenseName] = useState('');
  const [expenseHead, setExpenseHead] = useState('');
  const [expenseType, setExpenseType] = useState('Operating Expenses');

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (expense) {
      setExpenseName(expense.name || '');
      setExpenseHead(expense.head || '');
      setExpenseType(expense.type || 'Operating Expenses');
      setIsActive(expense.isActive !== false);
    } else {
      setExpenseName('');
      setExpenseHead('');
      setExpenseType('Operating Expenses');
      setIsActive(true);
    }
    setDropdownOpen(false);
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!expenseName.trim()) {
      alert('Expense Name is required.');
      return;
    }

    const eventName = expense ? 'expenseUpdated' : 'expenseAdded';
    const detail = {
      name: expenseName,
      head: expenseHead,
      type: expenseType,
      isActive
    };

    if (expense) {
      detail.id = expense.id;
    }

    window.dispatchEvent(new CustomEvent(eventName, { detail }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(96vw,600px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5">
            {expense ? 'Edit Expense' : 'Expenses Master'}
          </h2>
          <button 
            onClick={onClose} 
            className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors"
          >
            <X className="w-5 h-5 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white">
          <div className="flex flex-col gap-5">
            
            {/* Row 1: Expense Name and Expense Head */}
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div className="flex flex-col gap-1 w-[350px]">
                <div className="flex items-center justify-between">
                  <label className="text-[14px] font-bold text-gray-800">Expense Name</label>
                  <div className="flex flex-wrap items-center gap-2">
                    <div 
                      className={`w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-[#0d6efd]' : 'bg-gray-300'}`}
                      onClick={() => setIsActive(!isActive)}
                    >
                      <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isActive ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                    </div>
                    <span className="text-[13px] font-bold text-gray-800 select-none w-[50px]">{isActive ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
                <input 
                  type="text" 
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  placeholder="Enter Expense Name"
                  className="w-full border border-[#4F46E5] bg-[#e8e5ff] placeholder-gray-500 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold"
                />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[14px] font-bold text-gray-800">Expense Head</label>
                <input 
                  type="text" 
                  value={expenseHead}
                  onChange={(e) => setExpenseHead(e.target.value)}
                  placeholder="Enter Expense Head"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[9px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white"
                />
              </div>
            </div>

            {/* Row 2: Expense Type */}
            <div className="flex flex-col gap-1 w-[250px] relative">
              <label className="text-[14px] font-bold text-gray-800">Expense Type</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[9px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white flex items-center justify-between font-bold text-left shadow-sm hover:border-[#4F46E5] transition-colors"
                >
                  <span>{expenseType}</span>
                  <span className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`}>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>
                    <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-[3px] shadow-lg z-20 overflow-hidden py-1">
                      {['Operating Expenses', 'Non-Operating Expenses', 'Fixed Assets'].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setExpenseType(opt);
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-[14px] transition-colors ${
                            expenseType === opt 
                              ? 'bg-[#e8e5ff] text-[#4F46E5] font-bold' 
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white px-5 py-4 flex justify-end gap-2 border-t border-gray-100">
          <button 
            onClick={handleSubmit}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
          >
            Submit
          </button>
          <button 
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
