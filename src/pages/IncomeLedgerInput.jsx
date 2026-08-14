import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { X, Printer, Calendar, Paperclip, PlusSquare, Plus, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../utils';

// Inline Youtube SVG
const YoutubeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
  </svg>
);

export function IncomeLedgerInput() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const dateInputRef = useRef(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [incomeSearch, setIncomeSearch] = useState("");
  const [isAccountWise, setIsAccountWise] = useState(true);
  
  const [incomes, setIncomes] = useState([]);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Form State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [remark, setRemark] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };

  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef(null);

  const filteredIncomes = incomes.filter(inc => inc.name.toLowerCase().includes(incomeSearch.toLowerCase()));

  useEffect(() => {
    setHighlightedIndex(filteredIncomes.length > 0 ? 0 : -1);
  }, [incomeSearch, incomes]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const child = listRef.current.children[highlightedIndex];
      if (child) {
        child.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex(prev => {
        const next = prev + 1;
        return next >= filteredIncomes.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex(prev => {
        const next = prev - 1;
        return next < 0 ? filteredIncomes.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredIncomes.length) {
        handleSelectIncome(filteredIncomes[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };
  
  useEffect(() => {
    fetchIncomes();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchIncomes = async () => {
    try {
      const res = await apiClient.get('/incomes');
      if (res.data.success) {
        setIncomes(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching incomes', err);
    }
  };

  const fetchTransactions = async (income) => {
    try {
      const res = await apiClient.get(`/incomes/${income.id}/transactions`);
      if (res.data.success) {
        setTransactions(res.data.data);
        setSelectedIncome(res.data.income); // Updates balance
      }
    } catch (err) {
      console.error('Error fetching transactions', err);
    }
  };

  const handleSelectIncome = (inc) => {
    setIncomeSearch(inc.name);
    setSelectedIncome(inc);
    setIsDropdownOpen(false);
    fetchTransactions(inc);
  };

  const handleAddEntry = async () => {
    if (!selectedIncome) return alert('Please select an income first');
    
    // Validate
    const amtInc = parseFloat(incomeAmount) || 0;
    const amtPaid = parseFloat(paidAmount) || 0;
    const amtDiscount = parseFloat(discountAmount) || 0;
    
    if (amtInc === 0 && amtPaid === 0 && amtDiscount === 0) {
      return alert('Please enter Income Amount, Paid Amount or Discount');
    }

    try {
      const payload = {
        date: entryDate,
        incomeAmount: amtInc,
        paidAmount: amtPaid,
        discount: amtDiscount,
        remark
      };

      const res = await apiClient.post(`/incomes/${selectedIncome.id}/transactions`, payload);
      if (res.data.success) {
        setIncomeAmount('');
        setPaidAmount('');
        setDiscountAmount('');
        setRemark('');
        fetchTransactions(selectedIncome);
        fetchIncomes();
      }
    } catch (err) {
      console.error('Error adding transaction', err);
      alert('Failed to add transaction');
    }
  };

  const handleDeleteIncome = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await apiClient.delete(`/incomes/${id}`);
        setIncomes(incomes.filter(inc => inc.id !== id));
        if (selectedIncome?.id === id) {
          setSelectedIncome(null);
          setTransactions([]);
          setIncomeSearch("");
        }
      } catch (err) {
        console.error('Error deleting income', err);
      }
    }
  };

  const handleEditIncome = (e, name) => {
    e.stopPropagation();
    alert(`Editing details for ${name}`);
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <input type="file" ref={fileInputRef} className="hidden" />
      <div id="printable-area" className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Income Ledger</h2>
          
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button className="bg-white p-1 rounded-sm shadow-sm transition-colors">
              <YoutubeIcon className="w-5 h-5 text-[#ff0000]" />
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors ml-1"
            >
              <X className="w-5 h-5 font-bold" strokeWidth={4} />
            </button>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="p-3 border-b border-gray-200 no-print">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-3 max-w-full">
            
            <div className="flex flex-col gap-1 w-full max-w-[min(92vw,500px)]">
               <div className="flex justify-between items-center px-1">
                 <label className="text-[13px] font-bold text-gray-800">Incomes Name</label>
                 {isAccountWise && (
                   <span className="text-[13px] font-bold text-[#dc3545]">
                     Account Balance : ₹{(selectedIncome?.balance || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                   </span>
                 )}
               </div>
               
               <div className="relative w-full" ref={dropdownRef}>
                 <div className="relative flex items-center cursor-pointer" onClick={() => setIsDropdownOpen(true)}>
                   <input 
                     type="text"
                     value={incomeSearch}
                     onChange={(e) => {
                       setIncomeSearch(e.target.value);
                       setIsDropdownOpen(true);
                     }}
                     onKeyDown={handleKeyDown}
                     placeholder="Select Name"
                     className="w-full bg-[#add8e6] border border-[#add8e6] text-[#0056b3] placeholder-[#0056b3] rounded-[3px] px-3 py-1.5 pr-10 text-[14px] outline-none font-medium cursor-pointer"
                   />
                   <div className="absolute right-2 flex items-center gap-1.5 text-[#0056b3]">
                     <X className="w-3 h-3 hover:text-gray-800 cursor-pointer" onClick={(e) => { e.stopPropagation(); setIncomeSearch(''); setSelectedIncome(null); setTransactions([]); }} />
                     {isDropdownOpen ? <ChevronUp className="w-4 h-4 cursor-pointer hover:text-gray-800" /> : <ChevronDown className="w-4 h-4 cursor-pointer hover:text-gray-800" />}
                   </div>
                 </div>
                 
                 {isDropdownOpen && (
                   <div ref={listRef} className="absolute top-full left-0 w-full mt-0.5 bg-white border border-gray-300 rounded-[3px] shadow-xl z-50 max-h-[300px] overflow-y-auto">
                     {filteredIncomes.map((inc, index) => {
                       const isHighlighted = index === highlightedIndex;
                       return (
                         <div 
                           key={inc.id} 
                           onClick={() => handleSelectIncome(inc)}
                           className={`p-2 border-b transition-colors cursor-pointer flex justify-between ${
                             isHighlighted 
                               ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10' 
                               : (selectedIncome?.id === inc.id ? 'bg-[#add8e6] border-gray-200' : 'bg-white border-gray-150')
                           } hover:bg-indigo-50/50`}
                         >
                           <div className="flex flex-col">
                             <span className="font-bold text-[13px] text-gray-900">{inc.name}</span>
                             <span className="text-[11px] text-gray-800 font-medium mt-0.5">{inc.head || ''}</span>
                           </div>
                           <div className="flex flex-col items-end justify-between">
                             <span className="text-[13px] text-gray-800 font-medium">₹{(inc.balance || 0).toLocaleString()}</span>
                             <div className="flex gap-2 mt-1">
                               <Edit2 className="w-3.5 h-3.5 text-[#4F46E5] hover:text-cyan-700" onClick={(e) => handleEditIncome(e, inc.name)} />
                               <Trash2 className="w-3.5 h-3.5 text-[#dc3545] hover:text-red-700" onClick={(e) => handleDeleteIncome(e, inc.id)} />
                             </div>
                           </div>
                         </div>
                       );
                     })}
                     {filteredIncomes.length === 0 && (
                       <div className="p-3 text-center text-[12px] text-gray-500">No incomes found</div>
                     )}
                   </div>
                 )}
               </div>

            </div>

            <div 
              className="flex flex-wrap items-center gap-2 pb-1.5 select-none"
              onClick={() => setIsAccountWise(!isAccountWise)}
            >
               <span className={`text-[13px] font-bold ${isAccountWise ? 'text-gray-800' : 'text-gray-500'}`}>Account-wise</span>
               <div className={`w-[36px] h-[20px] rounded-full relative cursor-pointer shadow-inner transition-colors ${isAccountWise ? 'bg-[#4F46E5]' : 'bg-teal-600'}`}>
                 <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[3px] shadow-sm transition-all ${isAccountWise ? 'left-[3px]' : 'right-[3px]'}`}></div>
               </div>
               <span className={`text-[13px] font-bold ${!isAccountWise ? 'text-gray-800' : 'text-gray-500'}`}>Date-wise</span>
            </div>

          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0 w-full">
          <div className="min-w-[900px] flex flex-col h-full">
            {/* Table Header */}
            <div className={`bg-[#343a40] text-white grid ${isAccountWise ? 'grid-cols-[50px_130px_1fr_120px_120px_100px_120px_80px]' : 'grid-cols-[50px_130px_1fr_120px_120px_100px_80px]'} text-center border-b border-gray-600`}>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                #
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                DATE
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Other Information
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Income Amount
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Paid Amount
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Discount
              </div>
              {isAccountWise && (
                <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                  Balance
                </div>
              )}
              <div className="py-2.5 text-[13px] font-bold flex items-center justify-center uppercase">
                Action
              </div>
            </div>

            {/* Render added entries */}
            {transactions.map((entry, index) => (
              <div key={entry.id} className={`grid ${isAccountWise ? 'grid-cols-[50px_130px_1fr_120px_120px_100px_120px_80px]' : 'grid-cols-[50px_130px_1fr_120px_120px_100px_80px]'} bg-white border-b border-gray-200`}>
                <div className="border-r border-gray-200 flex items-center justify-center p-1 bg-gray-100 text-[13px]">
                  {index + 1}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {new Date(entry.date).toLocaleDateString()}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {entry.remark || '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600 font-bold">
                  {entry.incomeAmount > 0 ? <span className="text-[#28a745]">{entry.incomeAmount.toFixed(2)}</span> : '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold">
                  {entry.paidAmount > 0 ? <span className="text-[#dc3545]">{entry.paidAmount.toFixed(2)}</span> : '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {entry.discount > 0 ? entry.discount.toFixed(2) : '-'}
                </div>
                {isAccountWise && (
                  <div className={`border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold ${entry.balance > 0 ? 'text-[#28a745]' : 'text-[#dc3545]'}`}>
                    {Math.abs(entry.balance).toFixed(2)} {entry.balance > 0 ? 'Cr' : 'Dr'}
                  </div>
                )}
                <div className="p-1 flex items-center justify-center bg-gray-50 no-print">
                  <button className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}

            {/* Input Row */}
            <div className={`grid ${isAccountWise ? 'grid-cols-[50px_130px_1fr_120px_120px_100px_120px_80px]' : 'grid-cols-[50px_130px_1fr_120px_120px_100px_80px]'} bg-white border-b border-gray-200 no-print`}>
              <div className="border-r border-gray-200 flex items-center justify-center p-1 bg-[#343a40]">
                <span className="text-white text-[12px] font-bold">#</span>
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center relative">
                <input 
                  ref={dateInputRef}
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="absolute w-0 h-0 opacity-0 -z-10"
                />
                <input 
                  type="text" 
                  readOnly
                  value={formatDisplayDate(entryDate)}
                  className="w-full h-[32px] border border-gray-300 border-r-0 rounded-l-[3px] px-2 text-[13px] outline-none text-gray-600"
                />
                <button 
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker();
                    } catch (e) {
                      dateInputRef.current?.focus();
                    }
                  }}
                  className="h-[32px] border border-gray-300 border-l-0 px-2 flex items-center justify-center rounded-r-[3px] text-gray-500 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                 <input 
                   type="text" 
                   value={remark}
                   onChange={e => setRemark(e.target.value)}
                   placeholder="Enter Other Information" 
                   className="w-full h-[32px] px-2 text-[13px] outline-none text-center placeholder-gray-400 border border-transparent focus:border-gray-300 rounded-[3px]" 
                 />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input 
                  type="number" 
                  value={incomeAmount}
                  onChange={e => setIncomeAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-[32px] rounded-[3px] px-2 text-[13px] outline-none text-center font-bold bg-[#f0fdf4] border border-[#bbf7d0]"
                />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input 
                  type="number" 
                  value={paidAmount}
                  onChange={e => setPaidAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-[32px] rounded-[3px] px-2 text-[13px] outline-none text-center font-bold bg-white border border-[#ffcccc] bg-[#fff0f0]"
                />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input 
                  type="number" 
                  value={discountAmount}
                  onChange={e => setDiscountAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-center"
                />
              </div>
              {isAccountWise && (
                <div className="border-r border-gray-200 p-1 flex items-center bg-[#e9ecef]">
                  <input type="text" value={selectedIncome ? Math.abs(selectedIncome.balance).toFixed(2) : "0"} className="w-full h-[32px] bg-transparent text-[13px] font-bold text-gray-600 outline-none text-center" readOnly />
                </div>
              )}
              <div className="bg-[#343a40] flex items-center justify-center gap-1.5 p-1">
                <button onClick={() => fileInputRef.current?.click()} className="bg-white p-1 rounded-sm shadow-sm hover:bg-gray-100">
                  <Paperclip className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
                </button>
                <button onClick={handleAddEntry} className="text-[#28a745] hover:text-green-400">
                  <PlusSquare className="w-6 h-6" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Total Row */}
            <div className={`grid ${isAccountWise ? 'grid-cols-[50px_130px_1fr_120px_120px_100px_120px_80px]' : 'grid-cols-[50px_130px_1fr_120px_120px_100px_80px]'} bg-white border-b border-gray-200 mt-auto`}>
              <div className="col-span-3 border-r border-gray-200 p-2 flex items-center justify-end pr-4">
                <span className="font-bold text-[14px] text-gray-800">Total :</span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-[#28a745]">
                  {transactions.reduce((acc, curr) => acc + curr.incomeAmount, 0).toFixed(2)}
                </span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-[#dc3545]">
                  {transactions.reduce((acc, curr) => acc + curr.paidAmount, 0).toFixed(2)}
                </span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {transactions.reduce((acc, curr) => acc + curr.discount, 0).toFixed(2)}
                </span>
              </div>
              {isAccountWise && (
                <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                  <span className="font-bold text-[14px] text-[#28a745]">
                    {selectedIncome ? Math.abs(selectedIncome.balance).toFixed(2) : "0.00"}
                  </span>
                </div>
              )}
              <div className="p-2 flex items-center justify-center no-print">
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
