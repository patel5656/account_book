import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export function ProfitLossAccount() {
  const navigate = useNavigate();

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const formatDate = (date) => date.toISOString().split('T')[0];
  
  const defaultFrom = formatDate(firstDay);
  const defaultTo = formatDate(today);

  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [reportDates, setReportDates] = useState({ from: defaultFrom, to: defaultTo });
  
  const [reportData, setReportData] = useState({
    sales: 0,
    salesReturn: 0,
    purchase: 0,
    purchaseReturn: 0,
    openingStock: 0,
    closingStock: 0,
    operatingExpenses: 0,
    operatingIncome: 0,
    otherIncomes: 0,
    otherExpenses: 0
  });

  const handleShowReport = async () => {
    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    
    if (d1 > d2) {
      alert("From Date cannot be greater than To Date.");
      return;
    }

    setReportDates({ from: fromDate, to: toDate });
    
    try {
      const res = await apiClient.get('/financial/profit-loss', {
        params: { fromDate, toDate }
      });
      
      if (res.data && res.data.success) {
        setReportData({
          sales: res.data.data.sales || 0,
          salesReturn: res.data.data.salesReturn || 0,
          purchase: res.data.data.purchase || 0,
          purchaseReturn: res.data.data.purchaseReturn || 0,
          openingStock: res.data.data.openingStock || 0,
          closingStock: res.data.data.closingStock || 0,
          operatingExpenses: res.data.data.operatingExpenses || 0,
          operatingIncome: res.data.data.operatingIncome || 0,
          otherIncomes: res.data.data.otherIncomes || 0,
          otherExpenses: res.data.data.otherExpenses || 0
        });
      }
    } catch (error) {
      console.error("Error fetching profit and loss report:", error);
      alert("Failed to load profit and loss data");
    }
  };

  useEffect(() => {
    handleShowReport();
  }, []);

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, parseInt(month) - 1, parseInt(day));
    return `${parseInt(day)}-${date.toLocaleString('default', { month: 'short' })}-${date.getFullYear()}`;
  };

  const netSales = reportData.sales - reportData.salesReturn;
  const netPurchase = reportData.purchase - reportData.purchaseReturn;
  const cogs = reportData.openingStock + netPurchase - reportData.closingStock;
  const grossProfit = netSales - cogs;
  
  const totalOperatingExpenses = reportData.operatingExpenses;
  const totalOperatingIncome = reportData.operatingIncome;
  const totalOtherIncomes = reportData.otherIncomes;
  const totalOtherExpenses = reportData.otherExpenses;
  
  const netIncome = grossProfit - totalOperatingExpenses + totalOperatingIncome + totalOtherIncomes - totalOtherExpenses;

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-3 flex flex-col relative pb-[70px]">
      <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden flex-1 p-4">
        
        {/* Header & Date Controls */}
        <div className="text-center mb-6">
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <div className="relative">
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-[32px] w-[140px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-600 bg-white"
              />
            </div>
            
            <div className="relative">
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-[32px] w-[140px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-600 bg-white"
              />
            </div>

            <button onClick={handleShowReport} className="h-[32px] px-4 bg-[#007bff] hover:bg-[#0069d9] text-white text-[13px] font-medium rounded-[3px] transition-colors shadow-sm">
              Show Report
            </button>
          </div>

          <h2 className="text-[14px] text-gray-700 mb-1">PROFIT AND LOSS REPORT</h2>
          <p className="text-[14px] text-gray-600">(From {formatDateLabel(reportDates.from)} To {formatDateLabel(reportDates.to)})</p>
        </div>

        {/* Ledger Table */}
        <div className="border border-gray-200 rounded-[3px] overflow-hidden mb-6">
          <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2.5 px-4 text-[13px] font-bold text-gray-800 w-[60%] whitespace-nowrap">Particular</th>
                <th className="py-2.5 px-4 text-[13px] font-bold text-gray-800 w-[20%] text-center whitespace-nowrap">Sub Total</th>
                <th className="py-2.5 px-4 text-[13px] font-bold text-gray-800 w-[20%] text-center whitespace-nowrap">Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {/* Row: Net Sales */}
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4">
                  <div className="text-[13px] text-gray-800 mb-0.5">Net Sales</div>
                  <div className="text-[12px] text-gray-500">Sales : {reportData.sales}</div>
                  <div className="text-[12px] text-gray-500">Sales Return : {reportData.salesReturn}</div>
                </td>
                <td className="py-3 px-4 text-center text-[13px]"></td>
                <td className="py-3 px-4 text-center text-[13px] font-medium">{netSales}</td>
              </tr>
              
              {/* Row: Cost of goods Sold */}
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4">
                  <div className="text-[13px] text-gray-800 mb-0.5">Cost of goods Sold</div>
                  <div className="text-[12px] text-gray-500">Opening Stock : {reportData.openingStock}</div>
                  <div className="text-[12px] text-gray-500">Net Purchase : {netPurchase}</div>
                  <div className="text-[12px] text-gray-500">Closing Stock : {reportData.closingStock}</div>
                </td>
                <td className="py-3 px-4 text-center text-[13px]"></td>
                <td className="py-3 px-4 text-center text-[13px] font-medium">{cogs}</td>
              </tr>

              {/* Row: Gross Profit */}
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-right text-[13px] font-bold text-[#28a745]">
                  Gross Profit
                </td>
                <td className="py-3 px-4 text-center text-[13px]"></td>
                <td className="py-3 px-4 text-center text-[13px] font-bold text-[#28a745]">{grossProfit}</td>
              </tr>

              {/* Row: Operating Expenses */}
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 font-bold text-[14px] text-gray-900" colSpan="3">
                  Operating Expenses
                </td>
              </tr>

              {/* Row: Total Operating Expenses */}
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-right text-[13px] font-bold text-[#dc3545]">
                  Total Operating Expenses
                </td>
                <td className="py-3 px-4 text-center text-[13px]"></td>
                <td className="py-3 px-4 text-center text-[13px] font-bold text-[#dc3545]">{totalOperatingExpenses}</td>
              </tr>

              {/* Row: Total Operating Income */}
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-right text-[13px] font-bold text-gray-800">
                  Total Operating Income
                </td>
                <td className="py-3 px-4 text-center text-[13px]"></td>
                <td className="py-3 px-4 text-center text-[13px] font-bold text-gray-800">{totalOperatingIncome}</td>
              </tr>

              {/* Row: Other Incomes */}
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 font-bold text-[14px] text-gray-900" colSpan="3">
                  Other Incomes
                </td>
              </tr>

              {/* Row: Total Other Incomes */}
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-right text-[13px] font-bold text-[#28a745]">
                  Total Other Incomes
                </td>
                <td className="py-3 px-4 text-center text-[13px]"></td>
                <td className="py-3 px-4 text-center text-[13px] font-bold text-[#28a745]">{totalOtherIncomes}</td>
              </tr>

              {/* Row: Other Expenses */}
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 font-bold text-[14px] text-gray-900" colSpan="3">
                  Other Expenses
                </td>
              </tr>

              {/* Row: Total Other Expenses */}
              <tr className="border-b border-gray-200">
                <td className="py-3 px-4 text-right text-[13px] font-bold text-[#dc3545]">
                  Total Other Expenses
                </td>
                <td className="py-3 px-4 text-center text-[13px]"></td>
                <td className="py-3 px-4 text-center text-[13px] font-bold text-[#dc3545]">{totalOtherExpenses}</td>
              </tr>

              {/* Row: Net Income */}
              <tr>
                <td className="py-3 px-4 text-right text-[13px] font-bold text-[#28a745]">
                  Net Income
                </td>
                <td className="py-3 px-4 text-center text-[13px]"></td>
                <td className="py-3 px-4 text-center text-[13px] font-bold text-[#28a745]">{netIncome}</td>
              </tr>

            </tbody>
          </table>
          </div>
        </div>

      </div>

      {/* Footer Button */}
        <div className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-white/90 border-t border-gray-200 p-3 flex justify-end z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => navigate(-1)}
          className="bg-[#007bff] hover:bg-[#0069d9] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1 shadow-sm transition-colors"
        >
          <span className="text-[16px] leading-none mt-[-2px]">&laquo;</span> Go back
        </button>
      </div>

    </div>
  );
}
