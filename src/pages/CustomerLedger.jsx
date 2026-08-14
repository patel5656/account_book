import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { X, Printer, Calendar, Paperclip, PlusSquare, Filter, FileDown, Search, ChevronDown, ChevronUp, Edit2, Trash2, FileText } from 'lucide-react';
import { cn } from '../utils';
import { useSettings } from '../context/SettingsContext';

export function CustomerLedger() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [entries, setEntries] = useState([]);
  const [showFilter, setShowFilter] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const dropdownRef = useRef(null);
  
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const dateInputRef = useRef(null);
  const [isPaymentIn, setIsPaymentIn] = useState(true);
  
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDiscount, setPaymentDiscount] = useState('');
  const [paymentRemark, setPaymentRemark] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [banks, setBanks] = useState([]);
  const [showUnpaidModal, setShowUnpaidModal] = useState(false);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };

  const formatDateMMM = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${day}-${month}-${year}`;
  };

  const handlePrintEntry = (entry) => {
    if (entry.voucherNo) {
      window.open(`/bill/${entry.voucherNo}`, '_blank');
    } else {
      window.print();
    }
  };

  const handleEditEntry = (entry) => {
    if (entry.type === 'INVOICE') {
      navigate(`/admin/sales-invoice?id=${entry.rawId}`);
    } else if (entry.type === 'SALES_RETURN') {
      navigate(`/admin/sales-return-invoice?id=${entry.rawId}`);
    } else {
      alert(`Editing ${entry.type} is not directly supported from Customer Ledger yet.`);
    }
  };

  const handleDeleteEntry = async (entry) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    
    try {
      if (entry.type === 'PAYMENT_IN' || entry.type === 'PAYMENT_OUT') {
        const res = await apiClient.delete(`/ledger/payment/${entry.rawId}`);
        if (res.data.success) {
          fetchLedger(selectedCustomer);
        }
      } else {
        alert('Invoice entries cannot be deleted directly from ledger. Please delete from Sales Invoice page.');
      }
    } catch (err) {
      console.error('Error deleting entry', err);
      alert('Failed to delete entry');
    }
  };

  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef(null);

  const filteredCustomers = customers.filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()));

  useEffect(() => {
    setHighlightedIndex(filteredCustomers.length > 0 ? 0 : -1);
  }, [customerSearch, customers]);

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
        return next >= filteredCustomers.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex(prev => {
        const next = prev - 1;
        return next < 0 ? filteredCustomers.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredCustomers.length) {
        handleSelectCustomer(filteredCustomers[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };
  useEffect(() => {
    fetchCustomers();
    fetchBanks();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await apiClient.get('/banks');
      if (res.data.success) {
        setBanks(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch banks', err);
    }
  };

  // Auto-select customer if navigated from CustomerOutstanding
  useEffect(() => {
    if (location.state?.customer) {
      const c = location.state.customer;
      setCustomerSearch(c.name || '');
      setSelectedCustomer(c);
      fetchLedger(c);
    }
  }, [location.state]);

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/customers?type=CUSTOMER');
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching customers', err);
    }
  };

  const fetchLedger = async (customer = selectedCustomer) => {
    if (!customer) return;
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      alert("From Date cannot be greater than To Date.");
      return;
    }
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      const res = await apiClient.get(`/ledger/${customer.id}?${params.toString()}`);
      if (res.data.success) {
        setEntries(res.data.data);
        setSelectedCustomer(res.data.customer);
        setCustomers(prev => prev.map(c => c.id === res.data.customer.id ? { ...c, balance: res.data.customer.balance } : c));
      }
    } catch (err) {
      console.error('Error fetching ledger', err);
    }
  };

  const handleSelectCustomer = (c) => {
    setCustomerSearch(c.name);
    setSelectedCustomer(c);
    setIsDropdownOpen(false);
    fetchLedger(c);
  };

  const handleAddEntry = async () => {
    if (!selectedCustomer) return alert('Please select a customer first');
    if (!paymentAmount && !paymentDiscount) return alert('Please enter an amount or discount');
    
    try {
      const payload = {
        date: entryDate,
        amount: parseFloat(paymentAmount) || 0,
        discount: parseFloat(paymentDiscount) || 0,
        remark: paymentRemark,
        paymentType: isPaymentIn ? 'IN' : 'OUT',
        paymentMode: paymentMode
      };
      const res = await apiClient.post(`/ledger/${selectedCustomer.id}/payment`, payload);
      if (res.data.success) {
        setPaymentAmount('');
        setPaymentDiscount('');
        setPaymentRemark('');
        fetchLedger(selectedCustomer);
      }
    } catch (err) {
      console.error('Error adding payment', err);
      alert('Failed to add payment');
    }
  };

  const getUnpaidBills = () => {
    if (!selectedCustomer || entries.length === 0) return [];

    // 1. Get all credit invoices
    const creditInvoices = entries
      .filter(entry => entry.type === 'INVOICE' && entry.paymentMode === 'Credit')
      .map(inv => ({
        id: inv.id,
        date: inv.date,
        invoiceNo: inv.voucherNo,
        billAmt: inv.amount,
        balanceDue: inv.amount,
        status: 'Unpaid'
      }));

    // 2. Sum up total payments received and sales returns (credits)
    const totalPayments = entries
      .filter(entry => entry.type === 'PAYMENT_IN' || entry.type === 'SALES_RETURN')
      .reduce((sum, entry) => sum + (entry.paymentIn || entry.amount || 0), 0);

    // 3. Allocate payments to credit invoices (FIFO)
    let remainingCredits = totalPayments;
    const unpaidBills = [];

    for (let inv of creditInvoices) {
      if (remainingCredits > 0) {
        if (remainingCredits >= inv.billAmt) {
          remainingCredits -= inv.billAmt;
          inv.balanceDue = 0;
          inv.status = 'Paid';
        } else {
          inv.balanceDue = inv.billAmt - remainingCredits;
          remainingCredits = 0;
          inv.status = 'Partial';
        }
      }
      
      if (inv.balanceDue > 0) {
        unpaidBills.push(inv);
      }
    }

    return unpaidBills;
  };

  const handleExport = () => {
    const headers = ['#', 'Date', 'Other Information', 'Voucher No', 'Bill Amount', 'Payment In', 'Dis.', 'Balance'];
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
          entry.type !== 'INVOICE' ? entry.paymentIn || entry.amount : 0, 
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
    link.setAttribute('download', 'customer_ledger.csv');
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
          <h2 className="text-white text-[16px] font-medium tracking-wide">Customer Ledger</h2>
          
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
          <div className="p-3 border-b border-gray-200 no-print">
            <div className="flex flex-col gap-1 w-full max-w-[min(96vw,600px)]">
               <div className="flex justify-between items-center px-1">
                 <label className="text-[13px] font-bold text-gray-800">Customer Name</label>
                 <span className="text-[13px] font-bold text-[#dc3545]">Account Balance : ₹{(selectedCustomer?.balance || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
               </div>
               <div className="flex flex-col gap-2">
                  <div className="relative" ref={dropdownRef}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="relative flex-1 flex items-center cursor-pointer"
                        onClick={() => setIsDropdownOpen(true)}
                      >
                        <input 
                          type="text"
                          value={customerSearch}
                          onChange={(e) => {
                            setCustomerSearch(e.target.value);
                            setIsDropdownOpen(true);
                          }}
                          onKeyDown={handleKeyDown}
                          placeholder="Select Name"
                          className="w-full bg-[#add8e6] border border-[#add8e6] text-[#0056b3] placeholder-[#0056b3] rounded-[3px] px-3 py-1.5 pr-10 text-[14px] outline-none font-medium cursor-pointer"
                        />
                        <div className="absolute right-2 flex items-center gap-1.5 text-gray-400">
                          <X className="w-3 h-3 hover:text-gray-600 cursor-pointer" onClick={(e) => { e.stopPropagation(); setCustomerSearch(''); setSelectedCustomer(null); setEntries([]); }} />
                          {isDropdownOpen ? <ChevronUp className="w-4 h-4 cursor-pointer hover:text-gray-600" /> : <ChevronDown className="w-4 h-4 cursor-pointer hover:text-gray-600" />}
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (!selectedCustomer) {
                            alert("Please select a customer first");
                            return;
                          }
                          setShowUnpaidModal(true); 
                        }}
                        className="flex items-center gap-1.5 border border-[#17a2b8] text-[#17a2b8] hover:bg-[#17a2b8] hover:text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors bg-white whitespace-nowrap h-[34px] shadow-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Unpaid Bills
                      </button>
                    </div>
                    
                    {isDropdownOpen && (
                      <div ref={listRef} className="absolute top-full left-0 w-full mt-0.5 bg-white border border-gray-300 rounded-[3px] shadow-xl z-50 max-h-[300px] overflow-y-auto">
                        {filteredCustomers.map((c, index) => {
                          const isHighlighted = index === highlightedIndex;
                          return (
                            <div 
                              key={c.id} 
                              onClick={() => handleSelectCustomer(c)}
                              className={`p-2 border-b transition-colors cursor-pointer flex justify-between ${
                                isHighlighted 
                                  ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10' 
                                  : (selectedCustomer?.id === c.id ? 'bg-[#add8e6] border-gray-200' : 'bg-white border-gray-150')
                              } hover:bg-indigo-50/50`}
                            >
                              <div className="flex flex-col">
                                <span className="font-bold text-[13px] text-gray-900">{c.name}</span>
                                <span className="text-[11px] text-gray-800 font-medium mt-0.5">{c.city || ''} {c.mobile ? `Mobile: ${c.mobile}` : ''}</span>
                              </div>
                              <div className="flex flex-col items-end justify-between">
                                <span className="text-[13px] text-gray-800 font-medium">₹{(c.balance || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        })}
                        {filteredCustomers.length === 0 && (
                          <div className="p-3 text-center text-[12px] text-gray-500">No customers found</div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-end gap-2 mt-2">
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-[12px] font-bold text-gray-700">From Date</label>
                      <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-gray-800" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-[12px] font-bold text-gray-700">To Date</label>
                      <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-gray-800" />
                    </div>
                    <button onClick={() => fetchLedger()} className="bg-[#007bff] hover:bg-[#0069d9] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors whitespace-nowrap h-[32px] shadow-sm">
                      Show Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Data Table */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0 w-full">
          <div className="min-w-[900px] flex flex-col h-full">
            {/* Table Header */}
            <div className="bg-[#343a40] text-white grid grid-cols-[50px_110px_100px_1fr_100px_100px_110px_70px_100px_120px] text-center border-b border-gray-600">
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                #
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                DATE
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Mode
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
                onClick={() => setIsPaymentIn(!isPaymentIn)}
              >
                <div className={`w-[30px] h-[16px] rounded-full relative border transition-colors ${isPaymentIn ? 'bg-[#28a745] border-[#218838]' : 'bg-[#dc3545] border-[#c82333]'}`}>
                  <div className={`w-[12px] h-[12px] bg-white rounded-full absolute top-[1px] transition-all ${isPaymentIn ? 'right-[1px]' : 'left-[1px]'}`}></div>
                </div>
                {isPaymentIn ? 'Payment In' : 'Payment Out'}
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
              <div key={entry.id} className={`grid grid-cols-[50px_110px_100px_1fr_100px_100px_110px_70px_100px_120px] border-b border-gray-200 ${
                entry.type === 'PAYMENT_IN' ? 'bg-[#f0fff4]' :
                entry.type === 'PAYMENT_OUT' ? 'bg-[#fff5f5]' :
                entry.type === 'SALES_RETURN' ? 'bg-[#fffbf0]' : 'bg-white'
              }`}>
                <div className="border-r border-gray-200 flex items-center justify-center p-1 bg-gray-100 text-[13px]">
                  {index + 1}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {formatDateMMM(entry.date)}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600 font-bold">
                  {entry.paymentMode || 'Cash'}
                </div>
                <div className="border-r border-gray-200 p-1.5 flex flex-col justify-center text-[13px] text-center">
                  {entry.type === 'INVOICE' ? (
                    <>
                      <span className="font-bold text-gray-800">Invoice #</span>
                      {entry.paymentIn > 0 && (
                        <span className="text-[11px] text-gray-500 font-medium">
                          {entry.paymentMode === 'Cash' ? 'Cash Account' : `${entry.paymentMode} Account`}
                        </span>
                      )}
                    </>
                  ) : entry.type === 'SALES_RETURN' ? (
                    <span className="font-bold text-gray-800">Sales Return</span>
                  ) : (
                    <>
                      <span className="font-bold text-gray-800">Receipt #</span>
                      <span className="text-[11px] text-gray-500 font-medium">
                        {entry.paymentMode === 'Cash' ? 'Cash Account' : `${entry.paymentMode || 'Cash'} Account`}
                      </span>
                      {entry.remark && (
                        <span className="text-[11px] text-[#0056b3] font-medium leading-tight mt-0.5">{entry.remark}</span>
                      )}
                    </>
                  )}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600 font-semibold text-[#0056b3]">
                  {entry.voucherNo || '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold text-gray-800">
                  {entry.type === 'INVOICE' && (entry.amount || 0) > 0 ? (entry.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) :
                   entry.type === 'PAYMENT_OUT' && (entry.amount || 0) > 0 ? <span className="text-[#dc3545]">{(entry.amount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span> : '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold">
                  {(entry.paymentIn || 0) > 0 ? (
                    <span className="text-[#28a745]">{(entry.paymentIn || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  ) : '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {(entry.discount || 0) > 0 ? (entry.discount || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : '-'}
                </div>
                <div className={`border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold ${(entry.balance || 0) < 0 ? 'text-[#28a745]' : 'text-[#dc3545]'}`}>
                  {settings.accountingFormat ? (
                    <>{Math.abs(entry.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} {(entry.balance || 0) < 0 ? 'Cr' : 'Dr'}</>
                  ) : (
                    <>{(entry.balance || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</>
                  )}
                </div>
                <div className="p-1 flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => handlePrintEntry(entry)} 
                    className="w-[26px] h-[26px] bg-[#ffc107] hover:bg-[#e0a800] rounded-[3px] flex items-center justify-center transition-colors shadow-sm"
                    title="Print"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-900" />
                  </button>
                  <button 
                    onClick={() => handleEditEntry(entry)} 
                    className="w-[26px] h-[26px] bg-[#0d6efd] hover:bg-[#0b5ed7] rounded-[3px] flex items-center justify-center transition-colors shadow-sm"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-white" />
                  </button>
                  <button 
                    onClick={() => handleDeleteEntry(entry)} 
                    className="w-[26px] h-[26px] bg-[#dc3545] hover:bg-[#c82333] rounded-[3px] flex items-center justify-center transition-colors shadow-sm"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white" />
                  </button>
                </div>
              </div>
            ))}

            {/* Input Row */}
            <div className="grid grid-cols-[50px_110px_100px_1fr_100px_100px_110px_70px_100px_120px] bg-white border-b border-gray-200 no-print">
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
                 <select
                   value={paymentMode}
                   onChange={e => setPaymentMode(e.target.value)}
                   className="w-full h-[32px] px-1 text-[13px] outline-none text-gray-700 bg-white border border-gray-300 focus:border-[#4F46E5] rounded-[3px] cursor-pointer"
                 >
                   <option value="Cash">Cash</option>
                   {banks.map(b => (
                     <option key={b.id} value={b.name}>{b.name}</option>
                   ))}
                 </select>
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
                <input type="number" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} placeholder="0" className="w-full h-[32px] border border-[#add8e6] bg-[#e8f4f8] rounded-[3px] px-2 text-[13px] outline-none text-center font-bold" />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input type="number" value={paymentDiscount} onChange={e => setPaymentDiscount(e.target.value)} placeholder="0" className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-center" />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center bg-[#e9ecef]">
                <input type="text" value={selectedCustomer ? Math.abs(selectedCustomer.balance).toFixed(2) : "0"} className="w-full h-[32px] bg-transparent text-[13px] outline-none text-center" readOnly />
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
            <div className="grid grid-cols-[50px_110px_100px_1fr_100px_100px_110px_70px_100px_120px] bg-white border-b border-gray-200 mt-auto">
              <div className="col-span-5 border-r border-gray-200 p-2 flex items-center justify-end">
                <span className="font-bold text-[14px] text-gray-800">Total</span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {entries.reduce((acc, entry) => entry.type === 'INVOICE' ? acc + (entry.amount || 0) : acc, 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {entries.reduce((acc, entry) => acc + (entry.paymentIn || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {entries.reduce((acc, entry) => acc + (entry.discount || 0), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {selectedCustomer ? Math.abs(selectedCustomer.balance).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) : "0.00"}
                </span>
              </div>
              <div className="p-2 flex items-center justify-center">
              </div>
            </div>
            
          </div>
        </div>

      </div>

      {showUnpaidModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-[800px] mx-4 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[16px]">Unpaid Bills</h3>
              <button 
                onClick={() => setShowUnpaidModal(false)} 
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5 font-bold" strokeWidth={2.5} />
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-5 flex flex-col gap-4">
              {/* Customer Title & Summary */}
              <div className="flex flex-col gap-0.5">
                <h2 className="text-[#333333] text-[20px] font-bold uppercase tracking-wide">
                  {selectedCustomer?.name}
                </h2>
                <div className="flex items-center gap-2 text-[13px] text-gray-500 font-semibold uppercase mt-1">
                  <span>Bills</span>
                  <span className="text-[#333333] font-bold">{getUnpaidBills().length}</span>
                  <span className="ml-4">Total Due</span>
                  <span className="text-[#dc3545] font-bold">
                    {getUnpaidBills().reduce((sum, bill) => sum + bill.balanceDue, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="border border-gray-200 rounded-[3px] overflow-hidden max-h-[350px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead className="bg-[#f8f9fa] sticky top-0 border-b border-gray-200">
                    <tr className="text-gray-600 font-bold">
                      <th className="py-2.5 px-3 border-r border-gray-200 text-center w-[50px]">#</th>
                      <th className="py-2.5 px-3 border-r border-gray-200">DATE</th>
                      <th className="py-2.5 px-3 border-r border-gray-200">INVOICE NO</th>
                      <th className="py-2.5 px-3 border-r border-gray-200 text-right">BILL AMT</th>
                      <th className="py-2.5 px-3 border-r border-gray-200 text-right">BALANCE DUE</th>
                      <th className="py-2.5 px-3 text-center w-[120px]">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getUnpaidBills().length > 0 ? (
                      getUnpaidBills().map((bill, index) => (
                        <tr key={bill.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-2.5 px-3 border-r border-gray-200 text-center text-gray-500 font-medium">
                            {index + 1}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-200 text-gray-700">
                            {formatDateMMM(bill.date).replace(/-/g, ' ')}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-200 font-semibold text-[#0056b3]">
                            {bill.invoiceNo}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-200 text-right font-medium text-gray-800">
                            {bill.billAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 border-r border-gray-200 text-right font-bold text-gray-800">
                            {bill.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded-[3px] text-[11px] font-bold inline-block shadow-sm ${
                              bill.status === 'Partial' 
                                ? 'bg-[#ffc107] text-gray-900' 
                                : 'bg-[#6c757d] text-white'
                            }`}>
                              {bill.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="py-8 text-center text-gray-500 bg-[#f8f9fa] font-medium">
                          No unpaid bills found
                        </td>
                      </tr>
                    )}
                  </tbody>
                  {getUnpaidBills().length > 0 && (
                    <tfoot className="bg-[#e9ecef] font-bold text-gray-800 border-t border-gray-300">
                      <tr>
                        <td colSpan="4" className="py-2.5 px-3 text-right border-r border-gray-200">
                          Total
                        </td>
                        <td className="py-2.5 px-3 text-right border-r border-gray-200 font-extrabold text-[#4F46E5]">
                          {getUnpaidBills().reduce((sum, bill) => sum + bill.balanceDue, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setShowUnpaidModal(false)} 
                className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-5 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
