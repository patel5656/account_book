import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { X, Printer, Calendar, Paperclip, PlusSquare, Filter, FileDown, Search, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../utils';
import { useSettings } from '../context/SettingsContext';

export function CompanyLedger() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [entries, setEntries] = useState([]);
  const [showFilter, setShowFilter] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [companySearch, setCompanySearch] = useState("");
  const dropdownRef = useRef(null);
  
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const dateInputRef = useRef(null);
  const [isPaymentOut, setIsPaymentOut] = useState(true);
  
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDiscount, setPaymentDiscount] = useState('');
  const [paymentRemark, setPaymentRemark] = useState('');

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

  const filteredCompanies = companies.filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase()));

  useEffect(() => {
    setHighlightedIndex(filteredCompanies.length > 0 ? 0 : -1);
  }, [companySearch, companies]);

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
        return next >= filteredCompanies.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex(prev => {
        const next = prev - 1;
        return next < 0 ? filteredCompanies.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredCompanies.length) {
        handleSelectCompany(filteredCompanies[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };
  
  useEffect(() => {
    fetchCompanies();
    if (location.state?.company) {
      handleSelectCompany(location.state.company);
      // Optional: clear state so refresh doesn't keep it
      window.history.replaceState({}, document.title);
    }
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await apiClient.get('/customers?type=COMPANY');
      if (res.data.success) {
        setCompanies(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching companies', err);
    }
  };

  const fetchLedger = async (company) => {
    try {
      const res = await apiClient.get(`/ledger/${company.id}`);
      if (res.data.success) {
        setEntries(res.data.data);
        setSelectedCompany(res.data.customer);
        setCompanies(prev => prev.map(c => c.id === res.data.customer.id ? { ...c, balance: res.data.customer.balance } : c));
      }
    } catch (err) {
      console.error('Error fetching ledger', err);
    }
  };

  const handleSelectCompany = (c) => {
    setCompanySearch(c.name);
    setSelectedCompany(c);
    setIsDropdownOpen(false);
    fetchLedger(c);
  };

  const handleAddEntry = async () => {
    if (!selectedCompany) return alert('Please select a company first');
    if (!paymentAmount && !paymentDiscount) return alert('Please enter an amount or discount');
    
    try {
      const payload = {
        date: entryDate,
        amount: parseFloat(paymentAmount) || 0,
        discount: parseFloat(paymentDiscount) || 0,
        remark: paymentRemark,
        paymentType: isPaymentOut ? 'OUT' : 'IN',
        paymentMode: 'Cash'
      };
      const res = await apiClient.post(`/ledger/${selectedCompany.id}/payment`, payload);
      if (res.data.success) {
        setPaymentAmount('');
        setPaymentDiscount('');
        setPaymentRemark('');
        fetchLedger(selectedCompany);
      }
    } catch (err) {
      console.error('Error adding payment', err);
      alert('Failed to add payment');
    }
  };

  const handleDeleteCompany = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this company?')) {
      try {
        await apiClient.delete(`/customers/${id}`);
        setCompanies(companies.filter(c => c.id !== id));
        if (selectedCompany?.id === id) {
          setSelectedCompany(null);
          setEntries([]);
          setCompanySearch("");
        }
      } catch (err) {
        console.error('Error deleting company', err);
      }
    }
  };

  const handleEditCompany = (e, name) => {
    e.stopPropagation();
    alert(`Editing details for ${name}`);
  };

  const handleExport = () => {
    const headers = ['#', 'Date', 'Other Information', 'Voucher No', 'Bill Amount', 'Payment Out', 'Dis.', 'Balance'];
    const csvRows = [headers.join(',')];
    
    if (entries.length === 0) {
      csvRows.push(['1', `"${formatDisplayDate(entryDate)}"`, '"-"', '"-"', '0', '0', '0', '0'].join(','));
    } else {
      entries.forEach((entry, index) => {
        csvRows.push([
          index + 1, 
          `"${new Date(entry.date).toLocaleDateString()}"`, 
          `"${entry.remark || '-'}"`, 
          `"${entry.voucherNo || '-'}"`, 
          entry.type === 'INVOICE' ? entry.amount : 0, 
          entry.type !== 'INVOICE' ? entry.amount || entry.paymentIn : 0, // Simplified mapping
          entry.discount || 0, 
          entry.balance
        ].join(','));
      });
    }
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'company_ledger.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <div id="printable-area" className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Company Ledger</h2>
          
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button 
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-1.5 bg-white text-gray-800 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              <FilterIcon className="w-4 h-4" />
              Filter
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-[#6c757d] hover:bg-[#5a6268] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors"
            >
              <FileDown className="w-4 h-4" strokeWidth={2.5} />
              Export
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors"
            >
              <X className="w-5 h-5 font-bold" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Top Control Bar */}
        {showFilter && (
          <div className="p-3 border-b border-gray-200 flex flex-col gap-3 no-print">
            <div className="flex flex-col gap-1 w-full md:w-1/2">
               <div className="flex justify-between items-center px-1">
                 <label className="text-[13px] font-bold text-gray-800">Company Name</label>
                 <span className="text-[13px] font-bold text-[#dc3545]">Account Balance : ₹{(selectedCompany?.balance || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
               </div>
               <div className="relative" ref={dropdownRef}>
                 <div className="relative flex items-center cursor-pointer" onClick={() => setIsDropdownOpen(true)}>
                   <input 
                     type="text"
                     value={companySearch}
                     onChange={(e) => {
                       setCompanySearch(e.target.value);
                       setIsDropdownOpen(true);
                     }}
                     onKeyDown={handleKeyDown}
                     placeholder="Select Name"
                     className="w-full bg-[#add8e6] border border-[#add8e6] text-[#0056b3] placeholder-[#0056b3] rounded-[3px] px-3 py-1.5 pr-10 text-[14px] outline-none font-medium cursor-pointer"
                   />
                   <div className="absolute right-2 flex items-center gap-1.5 text-gray-400">
                     <X className="w-3 h-3 hover:text-gray-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCompanySearch(''); setSelectedCompany(null); setEntries([]); }} />
                     {isDropdownOpen ? <ChevronUp className="w-4 h-4 cursor-pointer hover:text-gray-600" /> : <ChevronDown className="w-4 h-4 cursor-pointer hover:text-gray-600" />}
                   </div>
                 </div>
                 
                 {isDropdownOpen && (
                   <div ref={listRef} className="absolute top-full left-0 w-full mt-0.5 bg-white border border-gray-300 rounded-[3px] shadow-xl z-50 max-h-[300px] overflow-y-auto">
                     {filteredCompanies.map((c, index) => {
                       const isHighlighted = index === highlightedIndex;
                       return (
                         <div 
                           key={c.id} 
                           onClick={() => handleSelectCompany(c)}
                           className={`p-2 border-b transition-colors cursor-pointer flex justify-between ${
                             isHighlighted 
                               ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10' 
                               : (selectedCompany?.id === c.id ? 'bg-[#add8e6] border-gray-200' : 'bg-white border-gray-150')
                           } hover:bg-indigo-50/50`}
                         >
                           <div className="flex flex-col">
                             <span className="font-bold text-[13px] text-gray-900">{c.name}</span>
                             <span className="text-[11px] text-gray-800 font-medium mt-0.5">{c.city || ''} {c.mobile ? `Mobile: ${c.mobile}` : ''}</span>
                           </div>
                           <div className="flex flex-col items-end justify-between">
                             <span className="text-[13px] text-gray-800 font-medium">₹{(c.balance || 0).toLocaleString()}</span>
                             <div className="flex gap-2 mt-1">
                               <Edit2 className="w-3.5 h-3.5 text-[#4F46E5] hover:text-cyan-700" onClick={(e) => handleEditCompany(e, c.name)} />
                               <Trash2 className="w-3.5 h-3.5 text-[#dc3545] hover:text-red-700" onClick={(e) => handleDeleteCompany(e, c.id)} />
                             </div>
                           </div>
                         </div>
                       );
                     })}
                     {filteredCompanies.length === 0 && (
                       <div className="p-3 text-center text-[12px] text-gray-500">No companies found</div>
                     )}
                   </div>
                 )}
               </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full">
               <select className="w-full sm:w-[40%] min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none text-gray-600 bg-white">
                 <option>Voucher No</option>
               </select>
               <input type="text" placeholder="Search for Voucher No" className="w-full sm:w-[60%] min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none text-gray-600 placeholder-gray-400" />
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0 w-full">
          <div className="min-w-[900px] flex flex-col h-full">
            {/* Table Header */}
            <div className="bg-[#343a40] text-white grid grid-cols-[50px_130px_1fr_100px_100px_130px_70px_100px_80px] text-center border-b border-gray-600">
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
                Voucher No
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex flex-col justify-center">
                Bill Amount
                {settings.showDueDays && <span className="text-[10px] text-gray-400 font-normal mt-0.5">(Due Days Visible)</span>}
              </div>
              <div 
                className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer select-none"
                onClick={() => setIsPaymentOut(!isPaymentOut)}
              >
                <div className={`w-[30px] h-[16px] rounded-full relative border transition-colors ${isPaymentOut ? 'bg-[#dc3545] border-[#c82333]' : 'bg-[#28a745] border-[#218838]'}`}>
                  <div className={`w-[12px] h-[12px] bg-white rounded-full absolute top-[1px] transition-all ${isPaymentOut ? 'left-[1px]' : 'right-[1px]'}`}></div>
                </div>
                {isPaymentOut ? 'Payment Out' : 'Payment In'}
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Dis.
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex flex-col justify-center">
                Balance
                {settings.accountingFormat && <span className="text-[10px] text-blue-300 font-normal mt-0.5">(Dr/Cr Format)</span>}
              </div>
              <div className="py-2.5 text-[13px] font-bold flex items-center justify-center">
                ACTION
              </div>
            </div>

            {/* Render added entries */}
            {entries.map((entry, index) => (
              <div key={entry.id} className="grid grid-cols-[50px_130px_1fr_100px_100px_130px_70px_100px_80px] bg-white border-b border-gray-200">
                <div className="border-r border-gray-200 flex items-center justify-center p-1 bg-gray-100 text-[13px]">
                  {index + 1}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {new Date(entry.date).toLocaleDateString()}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {entry.remark || '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {entry.voucherNo || '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold text-gray-800">
                  {entry.type === 'INVOICE' && entry.amount > 0 ? entry.amount.toFixed(2) : '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold text-[#dc3545]">
                  {entry.paymentIn > 0 ? <span className="text-[#28a745]">(IN) {entry.paymentIn.toFixed(2)}</span> : (entry.type === 'PAYMENT_OUT' ? entry.amount.toFixed(2) : '-')}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {entry.discount > 0 ? entry.discount.toFixed(2) : '-'}
                </div>
                <div className={`border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold ${entry.balance < 0 ? 'text-[#28a745]' : 'text-[#dc3545]'}`}>
                  {settings.accountingFormat ? (
                    <>{Math.abs(entry.balance).toFixed(2)} {entry.balance < 0 ? 'Cr' : 'Dr'}</>
                  ) : (
                    <>{entry.balance.toFixed(2)}</>
                  )}
                </div>
                <div className="p-1 flex items-center justify-center bg-gray-50">
                  <button className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}

            {/* Input Row */}
            <div className="grid grid-cols-[50px_130px_1fr_100px_100px_130px_70px_100px_80px] bg-white border-b border-gray-200 no-print">
              <div className="border-r border-gray-200 flex items-center justify-center p-1 bg-[#343a40]">
                <input type="checkbox" className="w-3.5 h-3.5" />
                <span className="text-white text-[12px] font-bold ml-1">#</span>
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
                 <input type="text" value={paymentRemark} onChange={e => setPaymentRemark(e.target.value)} placeholder="Enter Other Information" className="w-full h-[32px] px-2 text-[13px] outline-none text-center placeholder-gray-400" />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input type="text" className="w-full h-[32px] px-2 text-[13px] outline-none" readOnly />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input type="text" value="0" className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-center bg-gray-50" readOnly />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="0" className="w-full h-[32px] border border-[#ffcccc] bg-[#fff0f0] rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input type="number" value={paymentDiscount} onChange={e => setPaymentDiscount(e.target.value)} placeholder="0" className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-center" />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center bg-[#e9ecef]">
                <input type="text" value={selectedCompany ? Math.abs(selectedCompany.balance).toFixed(2) : "0"} className="w-full h-[32px] bg-transparent text-[13px] outline-none text-center" readOnly />
              </div>
              <div className="bg-[#343a40] flex items-center justify-center gap-1.5 p-1">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white p-1 rounded-sm shadow-sm hover:bg-gray-100"
                >
                  <Paperclip className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
                </button>
                <button 
                  onClick={handleAddEntry}
                  className="text-[#28a745] hover:text-green-400"
                >
                  <PlusSquare className="w-6 h-6" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Total Row */}
            <div className="grid grid-cols-[50px_130px_1fr_100px_100px_130px_70px_100px_80px] bg-white border-b border-gray-200 mt-auto">
              <div className="col-span-4 border-r border-gray-200 p-2 flex items-center justify-end">
                <span className="font-bold text-[14px] text-gray-800">Total</span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {entries.reduce((acc, entry) => entry.type === 'INVOICE' ? acc + entry.amount : acc, 0).toFixed(2)}
                </span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {entries.reduce((acc, entry) => entry.type === 'PAYMENT_OUT' ? acc + entry.amount : acc + (entry.paymentIn || 0), 0).toFixed(2)}
                </span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {entries.reduce((acc, entry) => acc + entry.discount, 0).toFixed(2)}
                </span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {selectedCompany ? Math.abs(selectedCompany.balance).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="p-2 flex items-center justify-center">
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
