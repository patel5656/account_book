import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BarChart2, 
  Printer, 
  Plus, 
  X, 
  Search,
  ArrowDownAZ,
  Calendar,
  Info,
  Banknote,
  Download,
  Upload,
  Layers,
  ArrowDownToLine,
  ArrowUpFromLine,
  Building,
  Users,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import { cn } from '../utils';
import { useSettings } from '../context/SettingsContext';

import { getTransactions, deleteTransaction } from '../api/inventory';
import { getCollectionReport } from '../api/financial';

export function SalesInvoiceSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const { formatAmount, currentCurrency } = useSettings();
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [loadingSheetModalOpen, setLoadingSheetModalOpen] = useState(false);
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [collectionPeriod, setCollectionPeriod] = useState('Today');
  const [collectionStartDate, setCollectionStartDate] = useState(getTodayStr());
  const [collectionEndDate, setCollectionEndDate] = useState(getTodayStr());
  const [collectionCustomRangeOpen, setCollectionCustomRangeOpen] = useState(false);
  const [tempCollStart, setTempCollStart] = useState(getTodayStr());
  const [tempCollEnd, setTempCollEnd] = useState(getTodayStr());
  const [collectionData, setCollectionData] = useState({
    todaySales: 0, cashSales: 0, creditSales: 0,
    moneyIn: { total: 0, cashSale: 0, creditRecovery: 0, otherIncome: 0 },
    moneyOut: { total: 0, companyPaid: 0, employeePaid: 0, expensesPaid: 0 },
    netCollection: 0, accounts: { cash: 0, bank: 0 }
  });
  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchText, setSearchText] = useState("");
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleCollectionPeriodChange = (period) => {
    setCollectionPeriod(period);
    if (period === 'Custom Range') {
      setCollectionCustomRangeOpen(true);
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const offset = today.getTimezoneOffset() * 60000;
    const fmt = (d) => new Date(d.getTime() - offset).toISOString().split('T')[0];
    let start = new Date(today);
    let end = new Date(today);
    if (period === 'Yesterday') { start.setDate(today.getDate() - 1); end.setDate(today.getDate() - 1); }
    else if (period === 'Last 7 Days') { start.setDate(today.getDate() - 6); }
    else if (period === 'Last 30 Days') { start.setDate(today.getDate() - 29); }
    else if (period === 'This Month') { start = new Date(today.getFullYear(), today.getMonth(), 1); }
    setCollectionStartDate(fmt(start));
    setCollectionEndDate(fmt(end));
  };

  const handleCollectionCustomSubmit = () => {
    setCollectionStartDate(tempCollStart);
    setCollectionEndDate(tempCollEnd);
    setCollectionCustomRangeOpen(false);
  };

  React.useEffect(() => {
    if (collectionModalOpen) {
      const fetchCollectionData = async () => {
        try {
          const res = await getCollectionReport(collectionStartDate, collectionEndDate);
          if (res.data.success) {
            setCollectionData(res.data.data);
          }
        } catch (error) {
          console.error("Failed to fetch collection data", error);
        }
      };
      fetchCollectionData();
    }
  }, [collectionModalOpen, collectionStartDate, collectionEndDate]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Determine transaction type based on pathname
        let type = 'sales';
        if (location.pathname.includes('customer_sale_order')) type = 'sales_order';
        if (location.pathname.includes('customer_challan_invoice')) type = 'challan';
        if (location.pathname.includes('customer_sale')) type = 'sales'; // customer invoice

        const res = await getTransactions(type);
        // Map backend format to frontend format
        const mappedData = (res.data || []).map(item => ({
          id: item.id,
          invoiceId: item.invoiceNo,
          customerName: item.customer?.name || 'Unknown',
          user: item.companyId ? 'Admin' : '', 
          phone: item.customer?.phone || item.customer?.mobile || '',
          location: item.customer?.city ? `(${item.customer.city})` : '',
          date: item.date,
          totalAmt: item.totalAmount || 0,
          paidAmt: item.status === 'PAID' ? item.totalAmount : 0, // Simplified for demo
          balance: item.status === 'PAID' ? 0 : item.totalAmount, // Simplified for demo
          currentBalance: item.customer?.balance || 0
        }));
        setSalesData(mappedData);
      } catch (error) {
        console.error("Failed to fetch transactions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [location.pathname]);
  const dateInputRef = useRef(null);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteTransaction(id);
        setSalesData(prevData => prevData.filter(item => item.id !== id));
      } catch (error) {
        console.error("Failed to delete invoice", error);
        alert("Failed to delete invoice");
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = (id) => {
    const route = location.pathname.includes('customer_sale_order') ? '/admin/sales-order-invoice' : 
                  location.pathname.includes('customer_challan_invoice') ? '/admin/customer-challan-creation' :
                  location.pathname.includes('customer_sale') ? '/admin/customer-invoice-creation' :
                  '/admin/sales-invoice';
    navigate(`${route}?id=${id}`);
  };

  const getFilteredData = () => {
    let filtered = salesData;
    
    if (searchText) {
      filtered = filtered.filter(item => 
        item.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.invoiceId.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      
      switch (dateFilter) {
        case 'Today':
          return itemDate.getTime() === today.getTime();
        case 'Yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          return itemDate.getTime() === yesterday.getTime();
        case 'Last 7 Days':
          const last7Days = new Date(today);
          last7Days.setDate(today.getDate() - 7);
          return itemDate >= last7Days && itemDate <= today;
        case 'Last 30 Days':
          const last30Days = new Date(today);
          last30Days.setDate(today.getDate() - 30);
          return itemDate >= last30Days && itemDate <= today;
        case 'This Month':
          return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
        case 'Last Month':
          let lastMonth = today.getMonth() - 1;
          let year = today.getFullYear();
          if (lastMonth < 0) {
            lastMonth = 11;
            year--;
          }
          return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === year;
        case 'Custom Range':
          if (fromDate && toDate) {
            const start = new Date(fromDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            return itemDate >= start && itemDate <= end;
          } else if (fromDate) {
             const start = new Date(fromDate);
            start.setHours(0, 0, 0, 0);
            return itemDate >= start;
          } else if (toDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            return itemDate <= end;
          }
          return true;
        default:
          return true;
      }
    });
    return filtered;
  };

  const filteredData = getFilteredData();
  const totalAmtSum = filteredData.reduce((sum, item) => sum + item.totalAmt, 0);
  const totalPaidSum = filteredData.reduce((sum, item) => sum + item.paidAmt, 0);
  const balanceSum = filteredData.reduce((sum, item) => sum + item.balance, 0);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  };

  return (
    <div className="bg-[#f8f9fa] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className={cn(
          "px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#4F46E5]"
        )}>
          <h2 className="text-white text-[16px] font-medium tracking-wide">
            {location.pathname.includes('customer_sale_order') ? 'Sales Order Summary' : 
             location.pathname.includes('customer_challan_invoice') ? 'Customer Challan Summary' : 
             location.pathname.includes('customer_sale') ? 'Customer Invoice Summary' :
             'Sales Invoice Summary'}
          </h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setCollectionModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#6c757d] hover:bg-[#5a6268] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
              Today's Collection
            </button>
            <button 
              onClick={() => setLoadingSheetModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors"
            >
              <Printer className="w-4 h-4" strokeWidth={2.5} />
              Loading Sheet
            </button>
            <button 
              onClick={() => navigate(
                location.pathname.includes('customer_sale_order') ? '/admin/sales-order-invoice' : 
                location.pathname.includes('customer_challan_invoice') ? '/admin/customer-challan-creation' :
                location.pathname.includes('customer_sale') ? '/admin/customer-invoice-creation' :
                '/admin/sales-invoice'
              )}
              className="flex items-center gap-1.5 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Create New
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 border-b border-gray-200 flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 w-full md:w-auto relative">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[13px] font-bold text-gray-800 select-none">
                Customer Name
              </span>
            </div>
            <div className="relative flex items-center">
              <input 
                type="text"
                list="customer-names"
                placeholder="Select or Search Name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 pr-8 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white"
              />
              <Search className="absolute right-2.5 w-4 h-4 text-gray-400" />
            </div>
            <datalist id="customer-names">
              <option value="John Doe" />
              <option value="Jane Smith" />
              <option value="Acme Corp" />
              <option value="Global Industries" />
              <option value="Tech Solutions Ltd" />
            </datalist>
          </div>

          <div className="flex flex-wrap items-end gap-2 w-full md:w-auto">
             <div className="flex flex-col">
                <div className="flex flex-wrap items-center gap-2">
                   <span className="text-[13px] font-bold text-gray-800">Date</span>
                   <select 
                     value={dateFilter}
                     onChange={(e) => setDateFilter(e.target.value)}
                     className="min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white"
                   >
                     <option>Today</option>
                    <option>Yesterday</option>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last Month</option>
                    <option>This Month</option>
                    <option>Custom Range</option>
                   </select>
                   {dateFilter === 'Custom Range' && (
                     <div className="flex items-center gap-2 ml-2">
                       <input 
                         type="date"
                         value={fromDate}
                         onChange={(e) => setFromDate(e.target.value)}
                         className="min-w-0 border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white"
                       />
                       <span className="text-[13px] font-bold text-gray-800">To</span>
                       <input 
                         type="date"
                         value={toDate}
                         onChange={(e) => setToDate(e.target.value)}
                         className="min-w-0 border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white"
                       />
                     </div>
                   )}
                </div>
             </div>

             <button className="flex items-center gap-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white px-3 py-1.5 rounded-[3px] text-[14px] transition-colors shadow-sm h-[34px]">
               <Search className="w-4 h-4" strokeWidth={3} />
               Search
             </button>

             <button className="flex items-center justify-center bg-[#6c757d] hover:bg-[#5a6268] text-white px-2.5 py-1.5 rounded-[3px] transition-colors shadow-sm h-[34px]">
               <ArrowDownAZ className="w-[18px] h-[18px]" strokeWidth={2.5} />
             </button>
          </div>
        </div>

        {/* Totals Table Header */}
        <div className="bg-[#343a40] text-white flex flex-col sm:grid sm:grid-cols-3 text-center py-2 px-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col items-center border-r border-gray-600">
            <span className="text-[15px] font-bold tracking-wider">TOTAL AMT:</span>
            <span className="text-[18px] font-bold leading-none mt-0.5">{formatAmount(totalAmtSum)}</span>
          </div>
          <div className="flex flex-col items-center border-r border-gray-600">
            <span className="text-[15px] font-bold tracking-wider">TOTAL PAID:</span>
            <span className="text-[18px] font-bold leading-none mt-0.5">{formatAmount(totalPaidSum)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[15px] font-bold tracking-wider">BALANCE:</span>
            <span className="text-[18px] font-bold leading-none mt-0.5">{formatAmount(balanceSum)}</span>
          </div>
        </div>

        {/* Main list body */}
        <div className="flex-1 bg-[#f0f2f5] overflow-auto p-3 flex flex-col gap-3">
          {filteredData.length > 0 ? (
            filteredData.map((row, index) => (
              <div key={row.id} className="bg-white rounded-[6px] shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200 flex flex-col">
                {/* Card Main Body */}
                <div className="p-3">
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-1">
                      <span className="text-[14px] font-bold text-gray-800">{index + 1}.</span>
                      <input type="checkbox" className="w-[13px] h-[13px] border-gray-300 rounded-[2px] outline-none cursor-pointer mx-0.5" />
                      <span className="text-[12px] text-gray-500">#Invoice No : {row.invoiceId}</span>
                    </div>
                    <span className="text-[12px] text-gray-500">{formatDisplayDate(row.date)}</span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <div className="text-[15px] text-gray-800 flex items-center gap-1.5 leading-tight mb-1">
                        {row.customerName} {row.location && <span className="font-bold text-[14px]">{row.location}</span>}
                      </div>
                      {row.phone && <div className="text-[#007bff] text-[13px] leading-tight mb-1 hover:underline cursor-pointer">{row.phone}</div>}
                      {row.user && <div className="text-[12px] font-bold text-gray-800 mt-0.5">User : <span className="font-bold">{row.user}</span></div>}
                    </div>
                    
                    <div className="flex flex-col items-end text-right">
                      <div className="text-[16px] font-bold text-gray-800 leading-none mb-1">{row.totalAmt.toLocaleString('en-IN')}</div>
                      <div className="text-[12px] text-gray-500 leading-tight">Paid : {row.paidAmt.toLocaleString('en-IN')}</div>
                      <div className="text-[12px] font-bold text-gray-800 leading-tight">Balance : {row.balance.toLocaleString('en-IN')}</div>
                      <div className="text-[11px] text-gray-600 mt-1">Current Balance : {row.currentBalance.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
                
                {/* Card Actions */}
                <div className="border-t border-gray-100 p-2 flex justify-between items-center bg-[#fdfdfd] rounded-b-[6px]">
                  <button onClick={handlePrint} className="flex items-center justify-center gap-1.5 border border-[#ffc107] text-[#ffc107] bg-white hover:bg-yellow-50 px-3 py-1 rounded-[4px] text-[13px] font-medium transition-colors h-[30px]">
                    <Printer className="w-4 h-4" />
                    Print
                  </button>
                  <button onClick={() => handleEdit(row.id)} className="flex items-center justify-center gap-1.5 border border-[#4F46E5] text-[#4F46E5] bg-white hover:bg-cyan-50 px-3 py-1 rounded-[4px] text-[13px] font-medium transition-colors h-[30px]">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button onClick={() => handleDelete(row.id)} className="flex items-center justify-center gap-1.5 border border-[#dc3545] text-[#dc3545] bg-white hover:bg-red-50 px-3 py-1 rounded-[4px] text-[13px] font-medium transition-colors h-[30px]">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-8 text-center text-gray-500 rounded-md border border-gray-200">
              No records found for the selected filter
            </div>
          )}
        </div>
      </div>

      {/* Collection Report Modal */}
      {collectionModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[95vh] border border-gray-300">
            
            {/* Modal Header */}
            <div className="bg-[#4F46E5] px-4 py-2 flex items-center justify-between shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <BarChart2 className="w-5 h-5 text-white" strokeWidth={3} />
                <h3 className="text-white font-medium text-[16px]">Collection Report</h3>
              </div>
              <button onClick={() => setCollectionModalOpen(false)} className="text-white hover:text-gray-200 transition-colors">
                <X className="w-6 h-6 font-bold text-white" strokeWidth={3} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 flex-1 overflow-auto flex flex-col gap-4 bg-[#fbfcfc]">
              
              {/* Select Period and Date */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <select className="min-w-0 border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-700 outline-none w-[150px] shadow-sm bg-white">
                  <option>All</option>
                  <option>Retailsale</option>
                  <option>Wholesale</option>
                </select>
                
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label className="text-[13px] font-bold text-gray-700">Select Period</label>
                    <select
                      value={collectionPeriod}
                      onChange={(e) => handleCollectionPeriodChange(e.target.value)}
                      className="min-w-0 border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-700 outline-none w-[150px] shadow-sm bg-white"
                    >
                      <option>Today</option>
                      <option>Yesterday</option>
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>This Month</option>
                      <option>Custom Range</option>
                    </select>
                  </div>
                  <div
                    className="flex flex-wrap items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338ca] transition-colors text-white px-3 py-1.5 rounded-[4px] text-[13px] font-bold shadow-sm cursor-pointer"
                    onClick={() => setCollectionCustomRangeOpen(true)}
                  >
                    <Calendar className="w-4 h-4" />
                    {collectionPeriod === 'Custom Range'
                      ? (collectionStartDate === collectionEndDate
                        ? formatDisplayDate(collectionStartDate)
                        : `${formatDisplayDate(collectionStartDate)} - ${formatDisplayDate(collectionEndDate)}`)
                      : formatDisplayDate(collectionStartDate)
                    }
                  </div>
                </div>
              </div>

              {/* Metric Cards (Top Row) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#4F46E5] rounded-[4px] p-2 px-3 text-white flex flex-col shadow-sm">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1 opacity-90">
                    <BarChart2 className="w-4 h-4" strokeWidth={3} />
                    <span className="font-bold text-[14px]">Today's Sales</span>
                  </div>
                  <span className="text-[18px] font-bold">{formatAmount(collectionData.todaySales)}</span>
                </div>
                
                <div className="bg-[#28a745] rounded-[4px] p-3 text-white flex flex-col shadow-sm">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1 opacity-90">
                    <Banknote className="w-4 h-4" strokeWidth={3} />
                    <span className="font-bold text-[14px]">Cash Sales</span>
                  </div>
                  <span className="text-[18px] font-bold">{formatAmount(collectionData.cashSales)}</span>
                </div>
                
                <div className="bg-[#dc3545] rounded-[4px] p-3 text-white flex flex-col shadow-sm">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1 opacity-90">
                    <Layers className="w-4 h-4" strokeWidth={3} />
                    <span className="font-bold text-[14px]">Credit Sales</span>
                  </div>
                  <span className="text-[18px] font-bold">{formatAmount(collectionData.creditSales)}</span>
                </div>
              </div>

              {/* Money In & Money Out Tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                
                {/* MONEY IN */}
                <div className="border border-[#c3e6cb] rounded-[4px] bg-white overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-[#d4edda] text-[#155724] px-3 py-2 flex items-center gap-2 border-b border-[#c3e6cb]">
                    <ArrowDownToLine className="w-4 h-4" strokeWidth={3} />
                    <span className="font-bold text-[14px] tracking-wide">MONEY IN</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col p-2 gap-2 text-[13.5px] text-gray-700">
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                       <div className="flex items-center gap-2">
                         <Banknote className="w-4 h-4 text-[#28a745]" />
                         <span>Total Cash Sale</span>
                       </div>
                       <span className="font-bold text-gray-800">{formatAmount(collectionData.moneyIn.cashSale)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                       <div className="flex items-center gap-2">
                         <Banknote className="w-4 h-4 text-[#28a745]" />
                         <span>Total Credit Recovery</span>
                       </div>
                       <span className="font-bold text-gray-800">{formatAmount(collectionData.moneyIn.creditRecovery)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                       <div className="flex items-center gap-2">
                         <Banknote className="w-4 h-4 text-[#28a745]" />
                         <span>Total Other Income</span>
                       </div>
                       <span className="font-bold text-gray-800">{formatAmount(collectionData.moneyIn.otherIncome)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                       <div className="flex items-center gap-2">
                         <Download className="w-4 h-4 text-[#28a745]" />
                         <span>Total Payment In</span>
                       </div>
                       <span className="font-bold text-gray-800">{formatAmount(collectionData.moneyIn.total)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#28a745] text-white px-3 py-2.5 flex items-center justify-between mt-auto">
                    <span className="font-bold text-[14px] uppercase tracking-wide">Total Money In</span>
                    <span className="font-bold text-[15px]">{formatAmount(collectionData.moneyIn.total)}</span>
                  </div>
                </div>

                {/* MONEY OUT */}
                <div className="border border-[#f5c6cb] rounded-[4px] bg-white overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-[#f8d7da] text-[#721c24] px-3 py-2 flex items-center gap-2 border-b border-[#f5c6cb]">
                    <ArrowUpFromLine className="w-4 h-4" strokeWidth={3} />
                    <span className="font-bold text-[14px] tracking-wide">MONEY OUT</span>
                  </div>
                  
                  <div className="flex-1 flex flex-col p-2 gap-2 text-[13.5px] text-gray-700">
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                       <div className="flex items-center gap-2">
                         <Building className="w-4 h-4 text-[#dc3545]" />
                         <span>Total Company Paid</span>
                       </div>
                       <span className="font-bold text-gray-800">{formatAmount(collectionData.moneyOut.companyPaid)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                       <div className="flex items-center gap-2">
                         <Users className="w-4 h-4 text-[#dc3545]" />
                         <span>Total Employee Paid</span>
                       </div>
                       <span className="font-bold text-gray-800">{formatAmount(collectionData.moneyOut.employeePaid)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-gray-100">
                       <div className="flex items-center gap-2">
                         <FileText className="w-4 h-4 text-[#dc3545]" />
                         <span>Total Expenses Paid</span>
                       </div>
                       <span className="font-bold text-gray-800">{formatAmount(collectionData.moneyOut.expensesPaid)}</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                       <div className="flex items-center gap-2">
                         <Upload className="w-4 h-4 text-[#dc3545]" />
                         <span>Total Payment Out</span>
                       </div>
                       <span className="font-bold text-gray-800">{formatAmount(collectionData.moneyOut.total)}</span>
                    </div>
                  </div>
                  
                  <div className="bg-[#dc3545] text-white px-3 py-2.5 flex items-center justify-between mt-auto">
                    <span className="font-bold text-[14px] uppercase tracking-wide">Total Money Out</span>
                    <span className="font-bold text-[15px]">{formatAmount(collectionData.moneyOut.total)}</span>
                  </div>
                </div>

              </div>

              {/* Net Collection Bar */}
              <div className="bg-[#2eb85c] rounded-[4px] p-3 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 shadow-sm gap-2">
                <div className="flex flex-col">
                  <div className="flex flex-wrap items-center gap-2">
                    <Calculator className="w-5 h-5 opacity-90" />
                    <span className="font-bold text-[16px] tracking-wide uppercase">Net Collection</span>
                  </div>
                  <span className="text-[12px] opacity-90 mt-0.5">(Total Money In {formatAmount(collectionData.moneyIn.total)} - Total Money Out {formatAmount(collectionData.moneyOut.total)})</span>
                </div>
                <div className="font-bold text-[22px]">
                  {formatAmount(collectionData.netCollection)}
                </div>
              </div>

              {/* Accounts Collection */}
              <div className="flex flex-col mt-2">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <Banknote className="w-5 h-5" strokeWidth={2} />
                  <span className="font-bold text-[15px]">Accounts Collection</span>
                </div>
                
                <div className="border border-gray-200 rounded-[4px] bg-white overflow-hidden shadow-sm flex flex-col mb-4">
                  <div 
                    className="flex items-center justify-between p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setCollectionModalOpen(false);
                      navigate('/admin/cash_bank_summary');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-[14px]">
                        1
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[15px] text-gray-800">Cash Account</span>
                        <span className="text-[13px] font-bold text-[#28a745]">Cash (Balance)</span>
                      </div>
                    </div>
                    <span className="font-bold text-[16px] text-[#007bff]">{formatAmount(collectionData.accounts.cash)}</span>
                  </div>
                  
                  <div className="bg-[#4F46E5] text-white p-3 flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" strokeWidth={2} />
                        <span className="font-bold text-[15px]">Total Cash & Bank Balance</span>
                      </div>
                      <span className="text-[13px] opacity-90 mt-1">Cash {formatAmount(collectionData.accounts.cash)} + Bank {formatAmount(collectionData.accounts.bank)}</span>
                    </div>
                    <span className="font-bold text-[16px]">{formatAmount(collectionData.accounts.cash + collectionData.accounts.bank)}</span>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Modal Footer */}
            <div className="bg-[#f8f9fa] border-t border-gray-200 px-4 py-3 flex justify-end shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
              <button 
                onClick={() => setCollectionModalOpen(false)} 
                className="flex items-center gap-1.5 bg-[#6c757d] hover:bg-[#5a6268] text-white px-4 py-1.5 rounded-[4px] text-[14px] transition-colors shadow-sm"
              >
                <X className="w-4 h-4 font-bold" strokeWidth={3} />
                Close
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* Loading Sheet Modal */}
      {loadingSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-[#ffc107] px-4 py-3 flex items-center justify-between">
              <h3 className="text-gray-900 font-medium text-[16px]">Select Invoices for Loading Sheet</h3>
              <button onClick={() => setLoadingSheetModalOpen(false)} className="text-[#dc3545] hover:text-red-700 transition-colors">
                <X className="w-7 h-7 font-bold" strokeWidth={4} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              {/* Actions row */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[14px] text-gray-700">Select Invoices</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button className="border border-[#007bff] text-[#007bff] hover:bg-blue-50 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors">
                    Select All
                  </button>
                  <button className="border border-gray-400 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors">
                    Deselect All
                  </button>
                </div>
              </div>
              
              {/* Filter */}
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-[14px] font-bold text-gray-800">Filter by Salesman</label>
                <select className="min-w-0 border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] text-gray-500 outline-none w-full shadow-sm bg-white">
                  <option>Select Salesman</option>
                </select>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-auto border border-gray-200">
                <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
                  <thead className="bg-[#343a40] text-white sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-[14px] font-bold w-[40px] border-r border-gray-600 whitespace-nowrap">#</th>
                      <th className="px-3 py-2 text-[14px] font-bold border-r border-gray-600 whitespace-nowrap">Invoice No</th>
                      <th className="px-3 py-2 text-[14px] font-bold border-r border-gray-600 whitespace-nowrap">Party Name</th>
                      <th className="px-3 py-2 text-[14px] font-bold border-r border-gray-600 whitespace-nowrap">Date</th>
                      <th className="px-3 py-2 text-[14px] font-bold whitespace-nowrap">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Empty table rows */}
                  </tbody>
                </table>
          </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-[#f8f9fa] border-t border-gray-200 px-4 py-3 flex justify-between items-center">
              <div className="text-[14px] text-gray-600">
                Selected: 0 of 0
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => setLoadingSheetModalOpen(false)} 
                  className="bg-[#6c757d] hover:bg-[#5a6268] text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button className="bg-[#28a745] hover:bg-[#218838] opacity-80 text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm">
                  Send WhatsApp PDFs
                </button>
                <button className="bg-[#28a745] hover:bg-[#218838] opacity-80 text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm">
                  Generate Loading Sheet
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Collection Custom Range Modal */}
      {collectionCustomRangeOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[4px] shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-[#007bff] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[16px]">Select Date Range</h3>
              <button onClick={() => setCollectionCustomRangeOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-5 h-5 font-bold" strokeWidth={3} />
              </button>
            </div>
            <div className="p-4 flex gap-4">
              <div className="flex-1">
                <label className="block text-[13px] font-bold text-gray-800 mb-1">From Date</label>
                <input 
                  type="date"
                  value={tempCollStart}
                  onChange={(e) => setTempCollStart(e.target.value)}
                  className="w-full border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#007bff]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[13px] font-bold text-gray-800 mb-1">To Date</label>
                <input 
                  type="date"
                  value={tempCollEnd}
                  onChange={(e) => setTempCollEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#007bff]"
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-end">
              <button onClick={handleCollectionCustomSubmit} className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-1.5 rounded-[4px] text-[14px] font-bold shadow-sm transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Minimal stub component to keep lucide-react dependencies working if any icon missing
const Calculator = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="16" height="20" x="4" y="2" rx="2"></rect>
    <line x1="8" x2="16" y1="6" y2="6"></line>
    <line x1="16" x2="16" y1="14" y2="18"></line>
    <path d="M16 10h.01"></path>
    <path d="M12 10h.01"></path>
    <path d="M8 10h.01"></path>
    <path d="M12 14h.01"></path>
    <path d="M8 14h.01"></path>
    <path d="M12 18h.01"></path>
    <path d="M8 18h.01"></path>
  </svg>
);
