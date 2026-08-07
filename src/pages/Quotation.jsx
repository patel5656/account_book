import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart2, 
  Printer, 
  Plus, 
  X, 
  Search,
  ArrowDownAZ,
  Edit,
  Trash2
} from 'lucide-react';
import { CollectionReportModal } from '../components/CollectionReportModal';
import { LoadingSheetModal } from '../components/LoadingSheetModal';
import apiClient from '../api/apiClient';

export function Quotation() {
  const navigate = useNavigate();
  const [isCollectionReportModalOpen, setIsCollectionReportModalOpen] = useState(false);
  const [isLoadingSheetModalOpen, setIsLoadingSheetModalOpen] = useState(false);
  const [invoices, setInvoices] = useState([]);
  
  const [dateFilter, setDateFilter] = useState('Today');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [tempFromDate, setTempFromDate] = useState(fromDate);
  const [tempToDate, setTempToDate] = useState(toDate);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const params = {};
      if (fromDate && toDate) {
        params.startDate = fromDate;
        params.endDate = toDate;
      }
      const res = await apiClient.get('/inventory/QUOTATION', { params });
      if (res.data.data) {
        setInvoices(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDateFilterChange = (e) => {
    const value = e.target.value;
    setDateFilter(value);

    const today = new Date();
    const offset = today.getTimezoneOffset() * 60000;
    const localToday = new Date(today.getTime() - offset);
    const todayStr = localToday.toISOString().split('T')[0];

    if (value === 'Today') {
      setFromDate(todayStr);
      setToDate(todayStr);
    } else if (value === 'Yesterday') {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const localYesterday = new Date(yesterday.getTime() - offset);
      const yesterdayStr = localYesterday.toISOString().split('T')[0];
      setFromDate(yesterdayStr);
      setToDate(yesterdayStr);
    } else if (value === 'Last 7 Days') {
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 6);
      const localLast7Days = new Date(last7Days.getTime() - offset);
      setFromDate(localLast7Days.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (value === 'Last 30 Days') {
      const last30Days = new Date(today);
      last30Days.setDate(last30Days.getDate() - 29);
      const localLast30Days = new Date(last30Days.getTime() - offset);
      setFromDate(localLast30Days.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (value === 'Last Month') {
      const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      const localFirst = new Date(firstDayLastMonth.getTime() - offset);
      const localLast = new Date(lastDayLastMonth.getTime() - offset);
      setFromDate(localFirst.toISOString().split('T')[0]);
      setToDate(localLast.toISOString().split('T')[0]);
    } else if (value === 'This Month') {
      const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const localFirst = new Date(firstDayThisMonth.getTime() - offset);
      setFromDate(localFirst.toISOString().split('T')[0]);
      setToDate(todayStr);
    } else if (value === 'Custom Range') {
      setTempFromDate(fromDate);
      setTempToDate(toDate);
      setIsCustomDateModalOpen(true);
    }
  };

  const applyCustomDateRange = () => {
    setFromDate(tempFromDate);
    setToDate(tempToDate);
    setIsCustomDateModalOpen(false);
  };

  const totalAmount = invoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((acc, curr) => acc + (curr.status === 'PAID' ? curr.totalAmount : 0), 0);
  const totalBalance = totalAmount - totalPaid;

  return (
    <div className="bg-[#f8f9fa] min-h-[calc(100vh-45px)] flex flex-col p-3">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Quotation Summary</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setIsCollectionReportModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#6c757d] hover:bg-[#5a6268] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
              Today's Collection
            </button>
            <button 
              onClick={() => setIsLoadingSheetModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors"
            >
              <Printer className="w-4 h-4" strokeWidth={2.5} />
              Loading Sheet
            </button>
            <button 
              onClick={() => navigate('/admin/quotation-invoice')}
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
          <div className="flex-1 w-full md:w-auto">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <div className="w-8 h-[18px] bg-gray-300 rounded-full relative cursor-pointer flex items-center">
                <div className="w-[14px] h-[14px] bg-white rounded-full absolute left-[2px] shadow-sm"></div>
              </div>
              <span className="text-[13px] font-bold text-gray-800">Customer Name</span>
            </div>
            <select className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-500 outline-none focus:border-[#4F46E5] appearance-none bg-white">
              <option>Select Name</option>
            </select>
          </div>

          <div className="flex flex-wrap items-end gap-2 w-full md:w-auto">
             <div className="flex flex-col">
                 <div className="flex justify-between items-center mb-1">
                   <span className="text-[13px] font-bold text-gray-800 invisible">Date</span>
                   <span className="text-[11px] font-bold text-[#4F46E5]">{fromDate === toDate ? `(${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : ''})` : `(${fromDate ? new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : ''} to ${toDate ? new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : ''})`}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                   <span className="text-[13px] font-bold text-gray-800">Date</span>
                   <select 
                     value={dateFilter}
                     onChange={handleDateFilterChange}
                     className="min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white"
                   >
                     <option value="Today">Today</option>
                    <option value="Yesterday">Yesterday</option>
                    <option value="Last 7 Days">Last 7 Days</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                    <option value="Last Month">Last Month</option>
                    <option value="This Month">This Month</option>
                    <option value="Custom Range">Custom Range</option>
                   </select>
                </div>
             </div>

             <button onClick={fetchInvoices} className="flex items-center gap-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white px-3 py-1.5 rounded-[3px] text-[14px] transition-colors shadow-sm h-[34px]">
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
            <span className="text-[18px] font-bold leading-none mt-0.5">₹{totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-center border-r border-gray-600">
            <span className="text-[15px] font-bold tracking-wider">TOTAL PAID:</span>
            <span className="text-[18px] font-bold leading-none mt-0.5">₹{totalPaid.toFixed(2)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[15px] font-bold tracking-wider">BALANCE:</span>
            <span className="text-[18px] font-bold leading-none mt-0.5">₹{totalBalance.toFixed(2)}</span>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#f0f2f5] overflow-auto custom-scrollbar p-3">
          <div className="max-w-[1200px] mx-auto space-y-3">
            {invoices.map((invoice, index) => {
              const paidAmount = invoice.status === 'PAID' ? invoice.totalAmount : 0;
              const balanceAmount = invoice.totalAmount - paidAmount;
              const currentBalance = invoice.customer?.currentBalance || invoice.totalAmount;
              const formattedDate = invoice.date ? new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '';

              return (
                <div key={invoice.id} className="bg-white rounded-[5px] shadow-sm border border-gray-200 p-3">
                  <div className="flex justify-between items-start">
                    
                    {/* Left Side */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <span className="font-bold text-[14px] text-gray-800">{index + 1}.</span>
                        <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer rounded-sm border-gray-300" />
                        <span className="text-[12.5px] ml-1">#Quotation No : {invoice.invoiceNo}</span>
                      </div>
                      <div className="text-[15px] font-medium text-gray-700 leading-tight">
                        {invoice.customer?.name || 'Unknown Supplier'}
                      </div>
                      <div className="text-[12px] font-bold text-gray-800 mt-1">
                        User : {invoice.user?.name || 'SUPERADMIN'}
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end text-right">
                      <span className="text-[12.5px] text-gray-500 mb-1">{formattedDate}</span>
                      <span className="text-[18px] font-bold text-gray-900 leading-none mb-1">
                        {invoice.totalAmount ? invoice.totalAmount.toLocaleString('en-IN') : '0'}
                      </span>
                      <span className="text-[11.5px] text-gray-500 leading-tight">
                        Paid : {paidAmount ? paidAmount.toLocaleString('en-IN') : '0'}
                      </span>
                      <span className="text-[11.5px] font-bold text-gray-800 leading-tight">
                        Balance : {balanceAmount ? balanceAmount.toLocaleString('en-IN') : '0'}
                      </span>
                      <span className="text-[11.5px] text-gray-500 leading-tight mt-0.5">
                        Current Balance : {currentBalance ? currentBalance.toLocaleString('en-IN') : '0'}
                      </span>
                    </div>

                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center px-1">
                    <button 
                      onClick={() => window.open(`/bill/${invoice.invoiceNo}`, '_blank')}
                      className="text-[#ffc107] border border-[#ffc107] hover:bg-[#fff9e6] px-4 py-1.5 rounded-[4px] text-[13px] font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/quotation-invoice?id=${invoice.id}`)}
                      className="text-[#17a2b8] border border-[#17a2b8] hover:bg-[#eaf6f8] px-4 py-1.5 rounded-[4px] text-[13px] font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this quotation?")) {
                          try {
                            await apiClient.delete(`/inventory/${invoice.id}`);
                            fetchInvoices();
                          } catch (err) {
                            console.error(err);
                            alert("Failed to delete quotation");
                          }
                        }
                      }}
                      className="text-[#dc3545] border border-[#dc3545] hover:bg-[#fdf2f3] px-4 py-1.5 rounded-[4px] text-[13px] font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
            
            {invoices.length === 0 && (
              <div className="bg-white p-8 text-center text-gray-500 rounded-[5px] shadow-sm border border-gray-200">
                No quotations found matching the criteria.
              </div>
            )}
          </div>
        </div>

      </div>
      <CollectionReportModal 
        isOpen={isCollectionReportModalOpen} 
        onClose={() => setIsCollectionReportModalOpen(false)} 
      />
      <LoadingSheetModal
        isOpen={isLoadingSheetModalOpen}
        onClose={() => setIsLoadingSheetModalOpen(false)}
      />

      {/* Custom Date Modal */}
      {isCustomDateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded shadow-lg w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-[#4F46E5] text-white px-4 py-3 flex items-center justify-between">
              <span className="font-medium">Select Custom Date Range</span>
              <button onClick={() => { setIsCustomDateModalOpen(false); setDateFilter('Today'); }} className="text-white hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-gray-800">From Date</label>
                <input 
                  type="date" 
                  value={tempFromDate}
                  onChange={(e) => setTempFromDate(e.target.value)}
                  className="border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-bold text-gray-800">To Date</label>
                <input 
                  type="date" 
                  value={tempToDate}
                  onChange={(e) => setTempToDate(e.target.value)}
                  className="border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-end gap-2 bg-gray-50">
              <button 
                onClick={() => { setIsCustomDateModalOpen(false); setDateFilter('Today'); }}
                className="px-4 py-2 text-[13px] font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={applyCustomDateRange}
                className="px-4 py-2 text-[13px] font-medium text-white bg-[#4F46E5] rounded hover:bg-[#4338ca] transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
