import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export function TradingAccount() {
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
    openingStock: 0,
    closingStock: 0,
    purchase: 0,
    purchaseReturn: 0,
    hasLoaded: false
  });

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const date = new Date(year, parseInt(month) - 1, parseInt(day));
    const dayStr = parseInt(day);
    const monthName = date.toLocaleString('default', { month: 'short' });
    const yearNum = date.getFullYear();
    return `${dayStr}-${monthName}-${yearNum}`;
  };

  const handleShowReport = async () => {
    const d1 = new Date(fromDate);
    const d2 = new Date(toDate);
    
    if (d1 > d2) {
      alert("From Date cannot be greater than To Date.");
      return;
    }

    setReportDates({ from: fromDate, to: toDate });
    
    try {
      const res = await apiClient.get('/financial/trading-account', {
        params: { fromDate, toDate }
      });
      
      if (res.data && res.data.success) {
        const { sales, salesReturn, openingStock, closingStock, purchase, purchaseReturn } = res.data.data;
        setReportData({
          sales: sales || 0,
          salesReturn: salesReturn || 0,
          openingStock: openingStock || 0,
          closingStock: closingStock || 0,
          purchase: purchase || 0,
          purchaseReturn: purchaseReturn || 0,
          hasLoaded: true
        });
      }
    } catch (error) {
      console.error("Error fetching trading account report:", error);
      alert("Failed to load trading account data");
    }
  };

  useEffect(() => {
    handleShowReport();
  }, []); // Load initially


  const netSale = reportData.sales - reportData.salesReturn;
  const netPurchase = reportData.purchase - reportData.purchaseReturn;
  
  const totalLeft = netSale + reportData.closingStock;
  const totalRightWithoutProfit = reportData.openingStock + netPurchase;
  const grossProfit = totalLeft - totalRightWithoutProfit;
  
  const totalRight = totalRightWithoutProfit + grossProfit;

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-3 flex flex-col relative pb-[70px]">
      <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden flex-1 p-4">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-[18px] font-medium text-gray-700 mb-4">Trading Account</h2>
          
          {/* Date Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
            <div className="flex flex-col items-start gap-1">
              <label className="text-[13px] font-bold text-gray-800">From Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="h-[32px] w-[140px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-600 bg-white"
                />
              </div>
            </div>
            
            <div className="flex flex-col items-start gap-1">
              <label className="text-[13px] font-bold text-gray-800">To Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="h-[32px] w-[140px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-600 bg-white"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end h-full">
               <div className="h-[21px]"></div> {/* Spacer to align button with inputs */}
               <button 
                 onClick={handleShowReport}
                 className="h-[32px] px-4 bg-[#007bff] hover:bg-[#0069d9] text-white text-[13px] font-medium rounded-[3px] transition-colors shadow-sm"
               >
                 Show Report
               </button>
            </div>
          </div>

          <p className="text-[14px] font-bold text-[#4F46E5]">
            (From: {formatDateLabel(reportDates.from)} - To: {formatDateLabel(reportDates.to)})
          </p>
        </div>

        {/* Two-Column Ledger Table */}
        <div className="border border-gray-200 rounded-[3px] overflow-hidden mb-6">
          <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="py-2.5 px-4 text-[13px] font-bold text-gray-800 w-[35%] whitespace-nowrap">Particular</th>
                <th className="py-2.5 px-4 text-[13px] font-bold text-gray-800 w-[15%] text-center border-r border-gray-200 whitespace-nowrap">Amount</th>
                <th className="py-2.5 px-4 text-[13px] font-bold text-gray-800 w-[35%] whitespace-nowrap">Particular</th>
                <th className="py-2.5 px-4 text-[13px] font-bold text-gray-800 w-[15%] text-center whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr className="border-b border-gray-200">
                <td className="py-4 px-4 align-top">
                  <div className="font-bold text-[14px] text-gray-900 mb-1">Net Sale</div>
                  <div className="text-[12px] text-gray-500">Sales : {reportData.sales}</div>
                  <div className="text-[12px] text-gray-500">Sales Return : {reportData.salesReturn}</div>
                </td>
                <td className="py-4 px-4 align-top text-center font-bold text-[13px] border-r border-gray-200">{netSale}</td>
                <td className="py-4 px-4 align-top">
                  <div className="font-bold text-[14px] text-gray-900">Opening Stock</div>
                </td>
                <td className="py-4 px-4 align-top text-center font-bold text-[13px]">{reportData.openingStock}</td>
              </tr>
              {/* Row 2 */}
              <tr className="border-b border-gray-200">
                <td className="py-4 px-4 align-top">
                  <div className="font-bold text-[14px] text-gray-900">Closing Stock</div>
                </td>
                <td className="py-4 px-4 align-top text-center font-bold text-[13px] border-r border-gray-200">{reportData.closingStock}</td>
                <td className="py-4 px-4 align-top">
                  <div className="font-bold text-[14px] text-gray-900 mb-1">Net Purchase</div>
                  <div className="text-[12px] text-gray-500">Purchase : {reportData.purchase}</div>
                  <div className="text-[12px] text-gray-500">Purchase Return : {reportData.purchaseReturn}</div>
                </td>
                <td className="py-4 px-4 align-top text-center font-bold text-[13px]">{netPurchase}</td>
              </tr>
              {/* TOTAL Row */}
              <tr>
                <td className="py-4 px-4 align-middle">
                  <div className="font-bold text-[14px] text-gray-900 uppercase">TOTAL</div>
                </td>
                <td className="py-4 px-4 align-middle text-center font-bold text-[13px] border-r border-gray-200">{totalLeft}</td>
                <td className="py-4 px-4 align-middle">
                  <div className="font-bold text-[14px] text-gray-900 uppercase">TOTAL</div>
                </td>
                <td className="py-4 px-4 align-middle text-center font-bold text-[13px]">{totalRight}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

        {/* Gross Profit Badge */}
        <div className="flex justify-center mb-4">
          <div className="bg-[#28a745] text-white px-4 py-2 font-medium text-[14px] rounded shadow-sm inline-block">
            GROSS Profit : {grossProfit}
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
