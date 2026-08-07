import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { X, Calendar, PlusSquare, Plus, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { CashBankMasterModal } from '../components/CashBankMasterModal';
import { cn } from '../utils';

export function BankLedger() {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const dropdownRef = useRef(null);
  const dateInputRef = useRef(null);
  
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState(null);
  
  const [transactions, setTransactions] = useState([]);
  
  // Form state
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [toBankId, setToBankId] = useState("");
  const [toBankSearch, setToBankSearch] = useState("");
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const toDropdownRef = useRef(null);
  const [transferAmount, setTransferAmount] = useState('');
  const [bankCharges, setBankCharges] = useState('');
  const [remark, setRemark] = useState('');
  
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

  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));

  useEffect(() => {
    setHighlightedIndex(filteredBanks.length > 0 ? 0 : -1);
  }, [bankSearch, banks]);

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
        return next >= filteredBanks.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex(prev => {
        const next = prev - 1;
        return next < 0 ? filteredBanks.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredBanks.length) {
        handleSelectBank(filteredBanks[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };
  
  useEffect(() => {
    fetchBanks();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target)) {
        setIsToDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToBankAdded = async (payload) => {
    try {
      const res = await apiClient.post('/banks', payload);
      if (res.data.success) {
        await fetchBanks();
        const newBank = res.data.data;
        setToBankId(newBank.id.toString());
        setToBankSearch(newBank.name);
        setIsBankModalOpen(false);
        setIsToDropdownOpen(false);
      }
    } catch (err) {
      console.error('Error creating bank account:', err);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await apiClient.get('/banks');
      if (res.data.success) {
        setBanks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching banks', err);
    }
  };

  const fetchTransactions = async (bank) => {
    try {
      const res = await apiClient.get(`/banks/${bank.id}/transactions`);
      if (res.data.success) {
        setTransactions(res.data.data);
        setSelectedBank(res.data.bank); // This ensures balance is up to date
      }
    } catch (err) {
      console.error('Error fetching transactions', err);
    }
  };

  const handleSelectBank = (b) => {
    setBankSearch(b.name);
    setSelectedBank(b);
    setIsDropdownOpen(false);
    fetchTransactions(b);
  };

  const handleAddEntry = async () => {
    if (!selectedBank) return alert('Please select a From Bank first');
    if (!transferAmount && !bankCharges) return alert('Please enter transfer amount or bank charges');
    
    try {
      const payload = {
        date: entryDate,
        toBankId: toBankId ? parseInt(toBankId) : null,
        amount: parseFloat(transferAmount) || 0,
        bankCharges: parseFloat(bankCharges) || 0,
        remark
      };
      const res = await apiClient.post(`/banks/${selectedBank.id}/transactions`, payload);
      if (res.data.success) {
        setTransferAmount('');
        setBankCharges('');
        setRemark('');
        setToBankId("");
        setToBankSearch("");
        fetchTransactions(selectedBank);
        fetchBanks(); // To update balances in dropdown
      }
    } catch (err) {
      console.error('Error adding transaction', err);
      alert('Failed to add transaction');
    }
  };

  const handleDeleteBank = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await apiClient.delete(`/banks/${id}`);
        setBanks(banks.filter(b => b.id !== id));
        if (selectedBank?.id === id) {
          setSelectedBank(null);
          setTransactions([]);
          setBankSearch("");
        }
      } catch (err) {
        console.error('Error deleting bank', err);
      }
    }
  };

  const handleEditBank = (e, name) => {
    e.stopPropagation();
    alert(`Editing details for ${name}`);
  };

  const getTypeColor = (type) => {
    if (type === 'CASH BOOK' || type === 'BANK BOOK') return 'text-[#28a745]';
    return 'text-[#ffc107]';
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex items-center justify-between">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Bank Book</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-[#dc3545] hover:text-red-700 bg-[#f8f9fa] rounded-sm p-0.5 transition-colors"
          >
            <X className="w-5 h-5 font-bold" strokeWidth={4} />
          </button>
        </div>

        {/* Top Control Bar */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex flex-col gap-1 max-w-[min(92vw,500px)]">
             <div className="flex justify-between items-center px-1">
               <label className="text-[13px] font-bold text-gray-800">From Cash/Bank</label>
               <span className="text-[13px] font-bold text-[#dc3545]">Account Balance : ₹{(selectedBank?.balance || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
             </div>
             <div className="relative w-full" ref={dropdownRef}>
               <div className="relative flex items-center cursor-pointer" onClick={() => setIsDropdownOpen(true)}>
                 <input 
                   type="text"
                   value={bankSearch}
                   onChange={(e) => {
                     setBankSearch(e.target.value);
                     setIsDropdownOpen(true);
                   }}
                   onKeyDown={handleKeyDown}
                   placeholder="Enter Bank Name Or UPI Name"
                   className="w-full bg-[#add8e6] border border-[#add8e6] text-[#0056b3] placeholder-[#0056b3] rounded-[3px] px-3 py-1.5 pr-10 text-[14px] outline-none font-medium cursor-pointer"
                 />
                 <div className="absolute right-2 flex items-center gap-1.5 text-[#0056b3]">
                   <X className="w-3 h-3 hover:text-gray-800 cursor-pointer" onClick={(e) => { e.stopPropagation(); setBankSearch(''); setSelectedBank(null); setTransactions([]); }} />
                   {isDropdownOpen ? <ChevronUp className="w-4 h-4 cursor-pointer hover:text-gray-800" /> : <ChevronDown className="w-4 h-4 cursor-pointer hover:text-gray-800" />}
                 </div>
               </div>
               
               {isDropdownOpen && (
                 <div ref={listRef} className="absolute top-full left-0 w-full mt-0.5 bg-white border border-gray-300 rounded-[3px] shadow-xl z-50 max-h-[300px] overflow-y-auto">
                   {filteredBanks.map((b, index) => {
                     const isHighlighted = index === highlightedIndex;
                     return (
                       <div 
                         key={b.id} 
                         onClick={() => handleSelectBank(b)}
                         className={`p-2 border-b transition-colors cursor-pointer flex justify-between ${
                           isHighlighted 
                             ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10' 
                             : (selectedBank?.id === b.id ? 'bg-[#add8e6] border-gray-200' : 'bg-white border-gray-150')
                         } hover:bg-indigo-50/50`}
                       >
                         <div className="flex flex-col">
                           <span className="font-bold text-[13px] text-gray-900">{b.name}</span>
                           <span className={`text-[11px] font-bold mt-0.5 ${getTypeColor(b.type)}`}>{b.type || 'ACCOUNT'}</span>
                         </div>
                         <div className="flex flex-col items-end justify-between">
                           <span className="text-[13px] text-gray-800 font-medium">₹{b.balance?.toLocaleString()}</span>
                           <div className="flex gap-2 mt-1">
                             <Edit2 className="w-3.5 h-3.5 text-[#4F46E5] hover:text-cyan-700" onClick={(e) => handleEditBank(e, b.name)} />
                             <Trash2 className="w-3.5 h-3.5 text-[#dc3545] hover:text-red-700" onClick={(e) => handleDeleteBank(e, b.id)} />
                           </div>
                         </div>
                       </div>
                     );
                   })}
                   {filteredBanks.length === 0 && (
                     <div className="p-3 text-center text-[12px] text-gray-500">No accounts found</div>
                   )}
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-y-auto min-h-0 w-full">
          <div className="min-w-[900px]">
            {/* Table Header */}
            <div className="bg-[#343a40] text-white grid grid-cols-[60px_130px_1fr_150px_120px_150px_60px] text-center border-b border-gray-600">
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex flex-col justify-center items-center">
                S.NO.
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Date
              </div>
              <div className="border-r border-gray-600 py-2.5 px-4 text-[13px] font-bold flex items-center justify-between">
                <span>To Cash/Bank</span>
                <span className="text-[#28a745]">Account Balance : ₹{(selectedBank?.balance || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Payment Transfer
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Bank Charges
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Other Info
              </div>
              <div className="py-2.5 text-[13px] font-bold flex items-center justify-center">
                Action
              </div>
            </div>

            {/* Render added entries */}
            {transactions.map((t, index) => (
              <div key={t.id} className="grid grid-cols-[60px_130px_1fr_150px_120px_150px_60px] bg-white border-b border-gray-200">
                <div className="border-r border-gray-200 flex items-center justify-center p-1 bg-gray-100 text-[13px]">
                  {index + 1}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {new Date(t.date).toLocaleDateString()}
                </div>
                <div className="border-r border-gray-200 p-1 px-4 flex items-center justify-between text-[13px] text-gray-600 font-medium">
                  <span>{t.otherBankName || '-'}</span>
                  <span className={`font-bold ${t.balance < 0 ? 'text-[#dc3545]' : 'text-[#28a745]'}`}>₹{Math.abs(t.balance).toFixed(2)} {t.balance < 0 ? 'Cr' : 'Dr'}</span>
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold text-gray-800">
                  {t.isCredit ? <span className="text-[#28a745]">(+){t.transferAmount.toFixed(2)}</span> : <span className="text-[#dc3545]">(-){t.transferAmount.toFixed(2)}</span>}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-[#dc3545] font-medium">
                  {t.bankCharges > 0 ? t.bankCharges.toFixed(2) : '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {t.remark || '-'}
                </div>
                <div className="p-1 flex items-center justify-center bg-gray-50">
                  <button className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}

            {/* Input Row */}
            <div className="grid grid-cols-[60px_130px_1fr_150px_120px_150px_60px] bg-white border-b border-gray-200">
              <div className="border-r border-gray-200 flex items-center justify-center p-1 bg-[#343a40]">
                <span className="text-white text-[12px] font-bold">#</span>
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input 
                  type="date" 
                  value={entryDate}
                  onChange={e => setEntryDate(e.target.value)}
                  className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-600"
                />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center relative" ref={toDropdownRef}>
                 <input 
                   type="text"
                   value={toBankSearch}
                   onFocus={() => setIsToDropdownOpen(true)}
                   onChange={e => {
                     setToBankSearch(e.target.value);
                     setIsToDropdownOpen(true);
                     const matched = banks.find(b => b.name.toLowerCase() === e.target.value.toLowerCase() && b.id !== selectedBank?.id);
                     if (matched) {
                       setToBankId(matched.id.toString());
                     } else {
                       setToBankId("");
                     }
                   }}
                   placeholder="Select To Cash/Bank (Optional)"
                   className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white"
                 />
                 {isToDropdownOpen && (
                   <div className="absolute top-[100%] left-0 w-[200px] mt-0.5 bg-[#add8e6] border border-gray-300 shadow-lg z-[999] max-h-[250px] overflow-y-auto rounded-[3px] text-left">
                     {banks.filter(b => b.id !== selectedBank?.id && b.name.toLowerCase().includes(toBankSearch.toLowerCase())).map(b => (
                       <div 
                         key={b.id} 
                         className="p-2 border-b border-gray-300 hover:bg-[#8ec2d8] cursor-pointer text-[13px] text-gray-800 font-medium"
                         onClick={() => {
                           setToBankSearch(b.name);
                           setToBankId(b.id.toString());
                           setIsToDropdownOpen(false);
                         }}
                       >
                         {b.name}
                       </div>
                     ))}
                     {toBankSearch.trim() !== '' && !banks.some(b => b.name.toLowerCase() === toBankSearch.toLowerCase()) && (
                       <div 
                         className="p-2 hover:bg-[#8ec2d8] cursor-pointer text-[13px] text-[#0056b3] font-bold"
                         onClick={() => {
                           setIsBankModalOpen(true);
                           setIsToDropdownOpen(false);
                         }}
                       >
                         +Add "{toBankSearch}"
                       </div>
                     )}
                   </div>
                 )}
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input 
                  type="number" 
                  value={transferAmount}
                  onChange={e => setTransferAmount(e.target.value)}
                  placeholder="0" 
                  className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-center" 
                />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input 
                  type="number" 
                  value={bankCharges}
                  onChange={e => setBankCharges(e.target.value)}
                  placeholder="0" 
                  className="w-full h-[32px] border border-[#ffcccc] bg-[#fff0f0] rounded-[3px] px-2 text-[13px] outline-none text-center" 
                />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input 
                  type="text" 
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  placeholder="Enter Other" 
                  className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-center" 
                />
              </div>
              <div className="bg-[#343a40] flex items-center justify-center p-1">
                <button 
                  onClick={handleAddEntry}
                  className="bg-[#28a745] hover:bg-[#218838] flex items-center justify-center w-[26px] h-[26px] rounded-[2px]"
                >
                  <Plus className="w-5 h-5 text-white" strokeWidth={3} />
                </button>
              </div>
            </div>
            
          </div>
        </div>

      </div>

      <CashBankMasterModal 
        isOpen={isBankModalOpen} 
        onClose={() => setIsBankModalOpen(false)} 
        initialBookName={toBankSearch}
        onSuccess={handleToBankAdded}
      />
    </div>
  );
}
