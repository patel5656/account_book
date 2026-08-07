import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart2, X, Calendar, Banknote, Download, Upload, Layers, ArrowDownToLine, ArrowUpFromLine, Building, Users, FileText, Calculator
} from 'lucide-react';
import apiClient from '../api/apiClient';
import { useSettings } from '../context/SettingsContext';
import { useNavigate } from 'react-router-dom';

export function CollectionReportModal({ isOpen, onClose }) {
  const { formatAmount, currentCurrency } = useSettings();
  const navigate = useNavigate();
  const [reportDate, setReportDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState('Today');
  const [customRangeModalOpen, setCustomRangeModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [tempCustomStart, setTempCustomStart] = useState(new Date().toISOString().split('T')[0]);
  const [tempCustomEnd, setTempCustomEnd] = useState(new Date().toISOString().split('T')[0]);
  const dateInputRef = useRef(null);

  const [data, setData] = useState({
    todaySales: 0,
    cashSales: 0,
    creditSales: 0,
    moneyIn: { cashSale: 0, creditRecovery: 0, otherIncome: 0, total: 0 },
    moneyOut: { companyPaid: 0, employeePaid: 0, expensesPaid: 0, total: 0 },
    netCollection: 0,
    accounts: { cash: 0, bank: 0 }
  });

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  };

  const handlePeriodChange = (val) => {
    setPeriod(val);
    if (val === 'Custom Range') {
      setCustomRangeModalOpen(true);
    }
  };

  const handleCustomRangeSubmit = () => {
    setCustomStartDate(tempCustomStart);
    setCustomEndDate(tempCustomEnd);
    setCustomRangeModalOpen(false);
  };

  const fetchReport = async () => {
    try {
      let startDate = reportDate;
      let endDate = reportDate;
      
      const today = new Date();
      today.setHours(0,0,0,0);
      const offset = today.getTimezoneOffset() * 60000;
      const fmt = (d) => new Date(d.getTime() - offset).toISOString().split('T')[0];
      
      switch (period) {
        case 'Today':
          startDate = fmt(today);
          endDate = fmt(today);
          break;
        case 'Yesterday': {
          const y = new Date(today);
          y.setDate(y.getDate() - 1);
          startDate = fmt(y);
          endDate = fmt(y);
          break;
        }
        case 'Last 7 Days': {
          const s = new Date(today);
          s.setDate(s.getDate() - 6);
          startDate = fmt(s);
          endDate = fmt(today);
          break;
        }
        case 'Last 30 Days': {
          const s = new Date(today);
          s.setDate(s.getDate() - 29);
          startDate = fmt(s);
          endDate = fmt(today);
          break;
        }
        case 'This Month': {
          const s = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate = fmt(s);
          endDate = fmt(today);
          break;
        }
        case 'Custom Range':
          startDate = customStartDate;
          endDate = customEndDate;
          break;
      }

      const res = await apiClient.get('/financial/collections', {
        params: { startDate, endDate }
      });
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch collection report", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchReport();
    }
  }, [isOpen, period, customStartDate, customEndDate]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden max-h-[95vh] border border-gray-300">
        
        {/* Modal Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex items-center justify-between shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <BarChart2 className="w-5 h-5 text-white" strokeWidth={3} />
            <h3 className="text-white font-medium text-[16px]">Collection Report</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
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
                <select value={period} onChange={e => handlePeriodChange(e.target.value)} className="min-w-0 border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-700 outline-none w-[150px] shadow-sm bg-white">
                  <option>Today</option>
                  <option>Yesterday</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>This Month</option>
                  <option>Custom Range</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338ca] transition-colors text-white px-3 py-1.5 rounded-[4px] text-[13px] font-bold shadow-sm cursor-pointer" onClick={() => setCustomRangeModalOpen(true)}>
                <Calendar className="w-4 h-4" />
                {period === 'Custom Range'
                  ? (customStartDate === customEndDate
                    ? formatDisplayDate(customStartDate)
                    : `${formatDisplayDate(customStartDate)} - ${formatDisplayDate(customEndDate)}`)
                  : formatDisplayDate(reportDate)
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
              <span className="text-[18px] font-bold">{formatAmount(data.todaySales)}</span>
            </div>
            
            <div className="bg-[#28a745] rounded-[4px] p-3 text-white flex flex-col shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5 mb-1 opacity-90">
                <Banknote className="w-4 h-4" strokeWidth={3} />
                <span className="font-bold text-[14px]">Cash Sales</span>
              </div>
              <span className="text-[18px] font-bold">{formatAmount(data.cashSales)}</span>
            </div>
            
            <div className="bg-[#dc3545] rounded-[4px] p-3 text-white flex flex-col shadow-sm">
              <div className="flex flex-wrap items-center gap-1.5 mb-1 opacity-90">
                <Layers className="w-4 h-4" strokeWidth={3} />
                <span className="font-bold text-[14px]">Credit Sales</span>
              </div>
              <span className="text-[18px] font-bold">{formatAmount(data.creditSales)}</span>
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
                   <span className="font-bold text-gray-800">{formatAmount(data.moneyIn.cashSale)}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                   <div className="flex items-center gap-2">
                     <Banknote className="w-4 h-4 text-[#28a745]" />
                     <span>Total Credit Recovery</span>
                   </div>
                   <span className="font-bold text-gray-800">{formatAmount(data.moneyIn.creditRecovery)}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                   <div className="flex items-center gap-2">
                     <Banknote className="w-4 h-4 text-[#28a745]" />
                     <span>Total Other Income</span>
                   </div>
                   <span className="font-bold text-gray-800">{formatAmount(data.moneyIn.otherIncome)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                   <div className="flex items-center gap-2">
                     <Download className="w-4 h-4 text-[#28a745]" />
                     <span>Total Payment In</span>
                   </div>
                   <span className="font-bold text-gray-800">{formatAmount(data.moneyIn.total)}</span>
                </div>
              </div>
              
              <div className="bg-[#28a745] text-white px-3 py-2.5 flex items-center justify-between mt-auto">
                <span className="font-bold text-[14px] uppercase tracking-wide">Total Money In</span>
                <span className="font-bold text-[15px]">{formatAmount(data.moneyIn.total)}</span>
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
                   <span className="font-bold text-gray-800">{formatAmount(data.moneyOut.companyPaid)}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                   <div className="flex items-center gap-2">
                     <Users className="w-4 h-4 text-[#dc3545]" />
                     <span>Total Employee Paid</span>
                   </div>
                   <span className="font-bold text-gray-800">{formatAmount(data.moneyOut.employeePaid)}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                   <div className="flex items-center gap-2">
                     <FileText className="w-4 h-4 text-[#dc3545]" />
                     <span>Total Expenses Paid</span>
                   </div>
                   <span className="font-bold text-gray-800">{formatAmount(data.moneyOut.expensesPaid)}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                   <div className="flex items-center gap-2">
                     <Upload className="w-4 h-4 text-[#dc3545]" />
                     <span>Total Payment Out</span>
                   </div>
                   <span className="font-bold text-gray-800">{formatAmount(data.moneyOut.total)}</span>
                </div>
              </div>
              
              <div className="bg-[#dc3545] text-white px-3 py-2.5 flex items-center justify-between mt-auto">
                <span className="font-bold text-[14px] uppercase tracking-wide">Total Money Out</span>
                <span className="font-bold text-[15px]">{formatAmount(data.moneyOut.total)}</span>
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
              <span className="text-[12px] opacity-90 mt-0.5">(Total Money In {formatAmount(data.moneyIn.total)} - Total Money Out {formatAmount(data.moneyOut.total)})</span>
            </div>
            <div className="font-bold text-[22px]">
              {formatAmount(data.netCollection)}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                  window.location.href = `/admin/cash_bank_summary?type=cash&dateRange=${encodeURIComponent(period)}`;
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
                <span className="font-bold text-[16px] text-[#007bff]">{formatAmount(data.accounts.cash)}</span>
              </div>
              <div 
                className="flex items-center justify-between p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                  window.location.href = `/admin/cash_bank_summary?type=bank&dateRange=${encodeURIComponent(period)}`;
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-[14px]">
                    2
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-[15px] text-gray-800">Bank Account</span>
                    <span className="text-[13px] font-bold text-[#007bff]">Bank (Balance)</span>
                  </div>
                </div>
                <span className="font-bold text-[16px] text-[#007bff]">{formatAmount(data.accounts.bank)}</span>
              </div>
              
              <div className="bg-[#4F46E5] text-white p-3 flex items-center justify-between">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" strokeWidth={2} />
                    <span className="font-bold text-[15px]">Total Cash & Bank Balance</span>
                  </div>
                  <span className="text-[13px] opacity-90 mt-1">Cash {formatAmount(data.accounts.cash)} + Bank {formatAmount(data.accounts.bank)}</span>
                </div>
                <span className="font-bold text-[16px]">{formatAmount(data.accounts.cash + data.accounts.bank)}</span>
              </div>
            </div>
          </div>

        </div>
        
        {/* Modal Footer */}
        <div className="bg-[#f8f9fa] border-t border-gray-200 px-4 py-3 flex justify-end shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <button 
            onClick={onClose} 
            className="flex items-center gap-1.5 bg-[#6c757d] hover:bg-[#5a6268] text-white px-4 py-1.5 rounded-[4px] text-[14px] transition-colors shadow-sm"
          >
            <X className="w-4 h-4 font-bold" strokeWidth={3} />
            Close
          </button>
        </div>
        
      </div>

      {/* Custom Range Date Modal */}
      {customRangeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[4px] shadow-xl w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-[#007bff] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[16px]">Select Date Range</h3>
              <button onClick={() => setCustomRangeModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-5 h-5 font-bold" strokeWidth={3} />
              </button>
            </div>
            <div className="p-4 flex gap-4">
              <div className="flex-1">
                <label className="block text-[13px] font-bold text-gray-800 mb-1">From Date</label>
                <input 
                  type="date"
                  value={tempCustomStart}
                  onChange={(e) => setTempCustomStart(e.target.value)}
                  className="w-full border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#007bff]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[13px] font-bold text-gray-800 mb-1">To Date</label>
                <input 
                  type="date"
                  value={tempCustomEnd}
                  onChange={(e) => setTempCustomEnd(e.target.value)}
                  className="w-full border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#007bff]"
                />
              </div>
            </div>
            <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-end">
              <button onClick={handleCustomRangeSubmit} className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-1.5 rounded-[4px] text-[14px] font-bold shadow-sm transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
