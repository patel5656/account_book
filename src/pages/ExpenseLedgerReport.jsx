import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Trash2, Edit } from 'lucide-react';
import apiClient from '../api/apiClient';

export function ExpenseLedgerReport() {
  const navigate = useNavigate();
  
  const [expenses, setExpenses] = useState([]);
  const [selectedExpenseName, setSelectedExpenseName] = useState('');
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilter, setDateFilter] = useState("All Time");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await apiClient.get('/expenses');
      if (res.data.success) {
        setExpenses(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch expenses:", err);
    }
  };

  const handleExpenseChange = (e) => {
    const name = e.target.value;
    setSelectedExpenseName(name);
    
    const matched = expenses.find(ex => ex.name === name);
    if (matched) {
      setSelectedExpenseId(matched.id);
    } else {
      setSelectedExpenseId(null);
      setTransactions([]);
    }
  };

  useEffect(() => {
    if (selectedExpenseId) {
      fetchTransactions(selectedExpenseId);
    } else {
      fetchAllTransactions();
    }
  }, [selectedExpenseId]);

  const fetchAllTransactions = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/expenses/transactions/all');
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch all transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async (id) => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/expenses/${id}/transactions`);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForFilter = (date) => {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  };

  useEffect(() => {
    const today = new Date();
    const todayStr = formatDateForFilter(today);
    
    switch (dateFilter) {
      case "All Time":
        setFromDate("");
        setToDate(todayStr);
        break;
      case "Today":
        setFromDate(todayStr);
        setToDate(todayStr);
        break;
      case "Yesterday":
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        setFromDate(formatDateForFilter(yesterday));
        setToDate(formatDateForFilter(yesterday));
        break;
      case "Last 7 Days":
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        setFromDate(formatDateForFilter(last7));
        setToDate(todayStr);
        break;
      case "Last 30 Days":
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        setFromDate(formatDateForFilter(last30));
        setToDate(todayStr);
        break;
      case "Last Month":
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        setFromDate(formatDateForFilter(startOfLastMonth));
        setToDate(formatDateForFilter(endOfLastMonth));
        break;
      case "This Month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setFromDate(formatDateForFilter(startOfMonth));
        setToDate(todayStr);
        break;
      default:
        break;
    }
  }, [dateFilter]);

  const getFilteredTransactions = () => {
    return transactions.filter(t => {
      const tDate = new Date(t.date);
      tDate.setHours(0,0,0,0);
      
      let isValid = true;
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0,0,0,0);
        if (tDate < start) isValid = false;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23,59,59,999);
        if (tDate > end) isValid = false;
      }
      return isValid;
    });
  };

  const filteredData = getFilteredTransactions();
  const totalExpenseAmount = filteredData.reduce((acc, curr) => acc + (curr.expenseAmount || 0), 0);
  const totalPaidAmount = filteredData.reduce((acc, curr) => acc + (curr.paidAmount || 0), 0);
  const totalBalance = filteredData.length > 0 ? filteredData[filteredData.length - 1].balance : 0;

  const currentDateString = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).replace(/ /g, '-');

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex items-center justify-between">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Expense Ledger</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => navigate('/admin/expenses-ledger/expense_ledger')}
              className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Create New
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors ml-1"
            >
              <X className="w-5 h-5 font-bold" strokeWidth={4} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row gap-6 max-w-[800px]">
             
             {/* Expenses Head */}
             <div className="flex-1 flex flex-col gap-1">
               <label className="text-[13px] font-bold text-gray-800">Expenses Head</label>
               <input 
                 type="text" 
                 list="expense-heads"
                 value={selectedExpenseName}
                 onChange={handleExpenseChange}
                 placeholder="Select or Search Name..." 
                 className="w-full bg-[#add8e6] border border-[#add8e6] text-[#0056b3] placeholder-[#0056b3]/70 rounded-[3px] px-3 py-1.5 text-[13px] outline-none font-medium focus:border-blue-400"
               />
               <datalist id="expense-heads">
                 {expenses.map(ex => (
                   <option key={ex.id} value={ex.name} />
                 ))}
               </datalist>
             </div>

             {/* Date */}
             <div className="flex-1 flex flex-col gap-1">
               <div className="flex justify-between items-center">
                 <label className="text-[13px] font-bold text-gray-800">Date</label>
                 <span className="text-[13px] font-bold text-[#4F46E5]">({currentDateString})</span>
               </div>
               <div className="relative">
                 <select 
                   value={dateFilter}
                   onChange={(e) => setDateFilter(e.target.value)}
                   className="w-full min-w-0 border border-gray-300 bg-white text-gray-700 rounded-[3px] pl-3 pr-8 py-1.5 text-[13px] outline-none appearance-none cursor-pointer hover:border-gray-400"
                 >
                   <option>All Time</option>
                   <option>Today</option>
                   <option>Yesterday</option>
                   <option>Last 7 Days</option>
                   <option>Last 30 Days</option>
                   <option>Last Month</option>
                   <option>This Month</option>
                   <option>Custom Range</option>
                 </select>
                 <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                   </svg>
                 </div>
               </div>
             </div>

          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0 w-full relative">
          <div className="min-w-[900px] flex flex-col h-full">
            {/* Table Header */}
            <div className="bg-[#343a40] text-white grid grid-cols-[80px_130px_1fr_120px_120px_120px_100px] text-center border-b border-gray-600 sticky top-0 z-10">
              <div className="border-r border-gray-600 py-3 text-[13px] font-bold flex items-center justify-center">
                S.NO.
              </div>
              <div className="border-r border-gray-600 py-3 text-[13px] font-bold flex items-center justify-center uppercase">
                Date
              </div>
              <div className="border-r border-gray-600 py-3 text-[13px] font-bold flex items-center justify-center uppercase">
                Expenses Details
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold leading-tight flex flex-col justify-center items-center uppercase">
                Expense<br/>Amount
              </div>
              <div className="border-r border-gray-600 py-3 text-[13px] font-bold flex items-center justify-center uppercase">
                Paid
              </div>
              <div className="border-r border-gray-600 py-3 text-[13px] font-bold flex items-center justify-center uppercase">
                Balance
              </div>
              <div className="py-3 text-[13px] font-bold flex items-center justify-center uppercase">
                Action
              </div>
            </div>

            {/* Table Body */}
            <div className="flex-1 bg-white">
              {loading ? (
                <div className="p-4 text-center text-gray-500 text-sm font-medium">Loading transactions...</div>
              ) : filteredData.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm font-medium">
                  No transactions found for the selected period.
                </div>
              ) : (
                filteredData.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-[80px_130px_1fr_120px_120px_120px_100px] border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="border-r border-gray-200 p-2 flex items-center justify-center text-[13px] text-gray-800">
                      {index + 1}
                    </div>
                    <div className="border-r border-gray-200 p-2 flex items-center justify-center text-[13px] text-gray-800">
                      {new Date(item.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')}
                    </div>
                    <div className="border-r border-gray-200 p-2 flex items-center text-[13px] text-gray-800">
                      {item.remark || '-'}
                    </div>
                    <div className="border-r border-gray-200 p-2 flex items-center justify-center text-[13px] text-gray-800 font-medium">
                      {item.expenseAmount || 0}
                    </div>
                    <div className="border-r border-gray-200 p-2 flex items-center justify-center text-[13px] text-gray-800 font-medium text-green-600">
                      {item.paidAmount || 0}
                    </div>
                    <div className="border-r border-gray-200 p-2 flex items-center justify-center text-[13px] text-gray-800 font-medium text-blue-600">
                      {item.balance || 0}
                    </div>
                    <div className="p-2 flex items-center justify-center gap-2">
                      <button className="text-blue-500 hover:text-blue-700" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total Row */}
            <div className="grid grid-cols-[80px_130px_1fr_120px_120px_120px_100px] bg-white border-t-2 border-gray-300 sticky bottom-0 z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
              <div className="border-r border-gray-200 p-3"></div>
              <div className="border-r border-gray-200 p-3"></div>
              <div className="border-r border-gray-200 p-3 flex items-center justify-center">
                 <span className="text-[14px] font-bold text-gray-800">GRAND TOTAL</span>
              </div>
              <div className="border-r border-gray-200 p-3 flex items-center justify-center">
                 <span className="text-[14px] font-bold text-gray-800">{totalExpenseAmount}</span>
              </div>
              <div className="border-r border-gray-200 p-3 flex items-center justify-center">
                 <span className="text-[14px] font-bold text-gray-800">{totalPaidAmount}</span>
              </div>
              <div className="border-r border-gray-200 p-3 flex items-center justify-center">
                 <span className="text-[14px] font-bold text-gray-800">{totalBalance}</span>
              </div>
              <div className="p-3"></div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
