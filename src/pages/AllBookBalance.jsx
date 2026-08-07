import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, X, Calendar, Search, Info, TrendingUp, TrendingDown, IndianRupee, Loader2 } from 'lucide-react';
import apiClient from '../api/apiClient';
import { useSettings } from '../context/SettingsContext';

export function AllBookBalance() {
  const navigate = useNavigate();
  const { formatAmount } = useSettings();
  const [banks, setBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const dateInputRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const displayDateStr = selectedDate.split('-').reverse().join('-');

  // Today's Collection modal state
  const [showCollection, setShowCollection] = useState(false);
  const [collectionData, setCollectionData] = useState(null);
  const [collectionLoading, setCollectionLoading] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/banks');
      if (res.data && res.data.success) {
        setBanks(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch bank balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    fetchBanks();
  };

  const getBalanceByType = (typeKeyword) => {
    return banks
      .filter((b) => b.type?.toLowerCase().includes(typeKeyword.toLowerCase()))
      .reduce((sum, b) => sum + (parseFloat(b.balance) || 0), 0);
  };

  const cashBalance = getBalanceByType('Cash');
  const bankBalance = getBalanceByType('Bank');
  const walletBalance = getBalanceByType('Wallet');
  const loanBalance = getBalanceByType('Loan');
  const totalBalance = banks.reduce((sum, b) => sum + (parseFloat(b.balance) || 0), 0);

  const handleDateClick = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker();
      } catch (e) {
        dateInputRef.current.focus();
      }
    }
  };

  // ── Today's Collection ──────────────────────────────────────────────────────
  const handleTodaysCollection = async () => {
    setShowCollection(true);
    setCollectionLoading(true);
    setCollectionData(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await apiClient.get(`/financial/collections?startDate=${today}&endDate=${today}`);
      if (res.data && res.data.success) {
        setCollectionData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch collection data:', err);
      setCollectionData(null);
    } finally {
      setCollectionLoading(false);
    }
  };

  const todayLabel = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Cash &amp; Bank Report</h2>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleTodaysCollection}
              className="flex items-center gap-1.5 bg-[#6c757d] hover:bg-[#5a6268] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              <BarChart2 className="w-4 h-4" strokeWidth={2.5} />
              Today's Collection
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors"
            >
              <X className="w-5 h-5 font-bold" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex justify-between items-center mb-1 max-w-[min(96vw,600px)]">
            <label className="text-[13px] font-bold text-gray-800">Date</label>
            <span className="text-[13px] font-bold text-[#dc3545]">Account Balance : {formatAmount(totalBalance)}</span>
          </div>

          <div className="flex items-center max-w-[min(96vw,600px)] relative">
            <input
              type="date"
              ref={dateInputRef}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="absolute inset-0 opacity-0 w-0 h-0"
            />
            <div
              onClick={handleDateClick}
              className="flex-1 h-[34px] border border-gray-300 border-r-0 rounded-l-[3px] px-3 text-[13px] text-gray-600 bg-white flex items-center cursor-pointer"
            >
              {displayDateStr}
            </div>
            <div
              onClick={handleDateClick}
              className="h-[34px] border border-gray-300 border-l-0 px-3 flex items-center justify-center text-gray-500 bg-white border-r-0 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
            </div>
            <button
              onClick={handleSearch}
              className="h-[34px] bg-[#007bff] hover:bg-[#0069d9] text-white px-3 border border-[#007bff] rounded-r-[3px] flex items-center justify-center transition-colors"
            >
              <Search className="w-[18px] h-[18px]" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Balance Cards Header */}
        <div className="grid grid-cols-4 text-center border-b border-gray-200 bg-white">
          <div className="py-2.5 font-bold text-[13px] text-[#007bff] border-r border-gray-200">Cash Balance</div>
          <div className="py-2.5 font-bold text-[13px] text-[#007bff] border-r border-gray-200">Bank Balance</div>
          <div className="py-2.5 font-bold text-[13px] text-[#007bff] border-r border-gray-200">Wallet Balance</div>
          <div className="py-2.5 font-bold text-[13px] text-[#007bff]">Loan Balance</div>
        </div>

        {/* Balance Cards Values */}
        <div className="grid grid-cols-4 text-center border-b border-gray-200 bg-white p-3 gap-3">
          <div className="bg-[#28a745] text-white font-bold text-[15px] py-1.5 rounded-[3px] shadow-sm">
            {formatAmount(cashBalance)}
          </div>
          <div className="bg-[#007bff] text-white font-bold text-[15px] py-1.5 rounded-[3px] shadow-sm">
            {formatAmount(bankBalance)}
          </div>
          <div className="bg-[#dc3545] text-white font-bold text-[15px] py-1.5 rounded-[3px] shadow-sm">
            {formatAmount(walletBalance)}
          </div>
          <div className="bg-[#ffc107] text-white font-bold text-[15px] py-1.5 rounded-[3px] shadow-sm">
            {formatAmount(loanBalance)}
          </div>
        </div>

        {/* Empty State */}
        {banks.length === 0 && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-gray-500 bg-white shadow-[inset_0_4px_6px_-6px_rgba(0,0,0,0.1)]">
            <div className="w-12 h-12 rounded-full bg-gray-500 text-white flex items-center justify-center mb-4">
              <Info className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <p className="text-[14px] font-medium text-gray-600">No bank accounts found.</p>
          </div>
        )}

      </div>

      {/* ── Today's Collection Modal ──────────────────────────────────────────── */}
      {showCollection && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setShowCollection(false)}
        >
          <div
            className="bg-white rounded-[4px] shadow-2xl w-full max-w-[520px] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <BarChart2 className="w-5 h-5" strokeWidth={2.5} />
                <span className="text-[15px] font-bold">Today's Collection</span>
                <span className="text-[12px] text-indigo-200 ml-1">— {todayLabel}</span>
              </div>
              <button
                onClick={() => setShowCollection(false)}
                className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              {collectionLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
                  <span className="text-[13px]">Loading collection data…</span>
                </div>
              ) : collectionData ? (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {/* Total Sales */}
                    <div className="border border-gray-200 rounded-[3px] p-3 text-center bg-blue-50">
                      <div className="text-[11px] text-gray-500 mb-1">Total Sales</div>
                      <div className="text-[16px] font-bold text-[#4F46E5]">
                        {formatAmount(collectionData.todaySales || 0)}
                      </div>
                    </div>
                    {/* Cash Sales */}
                    <div className="border border-gray-200 rounded-[3px] p-3 text-center bg-green-50">
                      <div className="text-[11px] text-gray-500 mb-1">Cash Sales</div>
                      <div className="text-[16px] font-bold text-[#28a745]">
                        {formatAmount(collectionData.cashSales || 0)}
                      </div>
                    </div>
                    {/* Credit Sales */}
                    <div className="border border-gray-200 rounded-[3px] p-3 text-center bg-yellow-50">
                      <div className="text-[11px] text-gray-500 mb-1">Credit Sales</div>
                      <div className="text-[16px] font-bold text-[#ffc107]">
                        {formatAmount(collectionData.creditSales || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Money In / Out / Net */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {/* Money In */}
                    <div className="border border-green-200 rounded-[3px] bg-green-50 p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <TrendingUp className="w-3.5 h-3.5 text-green-700" strokeWidth={2.5} />
                        <span className="text-[11px] font-bold text-green-800">Money In</span>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px] text-gray-600">
                        <div className="flex justify-between">
                          <span>Cash Sale</span>
                          <span className="font-bold text-green-700">{formatAmount(collectionData.moneyIn?.cashSale || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Credit Recovery</span>
                          <span className="font-bold text-green-700">{formatAmount(collectionData.moneyIn?.creditRecovery || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Other Income</span>
                          <span className="font-bold text-green-700">{formatAmount(collectionData.moneyIn?.otherIncome || 0)}</span>
                        </div>
                        <div className="border-t border-green-200 pt-1 mt-1 flex justify-between">
                          <span className="font-bold text-green-800">Total</span>
                          <span className="font-bold text-green-800">{formatAmount(collectionData.moneyIn?.total || 0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Money Out */}
                    <div className="border border-red-200 rounded-[3px] bg-red-50 p-3">
                      <div className="flex items-center gap-1 mb-2">
                        <TrendingDown className="w-3.5 h-3.5 text-red-600" strokeWidth={2.5} />
                        <span className="text-[11px] font-bold text-red-700">Money Out</span>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px] text-gray-600">
                        <div className="flex justify-between">
                          <span>Company Paid</span>
                          <span className="font-bold text-red-600">{formatAmount(collectionData.moneyOut?.companyPaid || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Employee Paid</span>
                          <span className="font-bold text-red-600">{formatAmount(collectionData.moneyOut?.employeePaid || 0)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expenses</span>
                          <span className="font-bold text-red-600">{formatAmount(collectionData.moneyOut?.expensesPaid || 0)}</span>
                        </div>
                        <div className="border-t border-red-200 pt-1 mt-1 flex justify-between">
                          <span className="font-bold text-red-700">Total</span>
                          <span className="font-bold text-red-700">{formatAmount(collectionData.moneyOut?.total || 0)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Net Collection */}
                    <div className={`border rounded-[3px] p-3 flex flex-col items-center justify-center ${
                      (collectionData.netCollection || 0) >= 0
                        ? 'border-indigo-200 bg-indigo-50'
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <IndianRupee className={`w-6 h-6 mb-1 ${(collectionData.netCollection || 0) >= 0 ? 'text-[#4F46E5]' : 'text-red-600'}`} strokeWidth={2} />
                      <div className="text-[10px] text-gray-500 mb-1">Net Collection</div>
                      <div className={`text-[18px] font-bold ${
                        (collectionData.netCollection || 0) >= 0 ? 'text-[#4F46E5]' : 'text-red-600'
                      }`}>
                        {formatAmount(collectionData.netCollection || 0)}
                      </div>
                    </div>
                  </div>

                  {/* Account Balances */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="border border-gray-200 rounded-[3px] p-3 flex items-center justify-between bg-gray-50">
                      <span className="text-[12px] font-bold text-gray-600">Cash Balance</span>
                      <span className="text-[14px] font-bold text-[#28a745]">{formatAmount(collectionData.accounts?.cash || 0)}</span>
                    </div>
                    <div className="border border-gray-200 rounded-[3px] p-3 flex items-center justify-between bg-gray-50">
                      <span className="text-[12px] font-bold text-gray-600">Bank Balance</span>
                      <span className="text-[14px] font-bold text-[#007bff]">{formatAmount(collectionData.accounts?.bank || 0)}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                  <Info className="w-8 h-8" strokeWidth={1.5} />
                  <span className="text-[13px]">No collection data available for today.</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowCollection(false)}
                className="px-4 py-1.5 bg-[#6c757d] hover:bg-[#5a6268] text-white text-[13px] font-medium rounded-[3px] transition-colors"
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
