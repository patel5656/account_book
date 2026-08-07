import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export function BalanceSheet() {
  const navigate = useNavigate();

  const today = new Date();
  const formatDate = (date) => date.toISOString().split('T')[0];
  const defaultDate = formatDate(today);

  const [date, setDate] = useState(defaultDate);
  const [reportDate, setReportDate] = useState(defaultDate);
  
  const [reportData, setReportData] = useState({
    companyDue: 0,
    loanTaken: 0,
    expensesDue: 0,
    employeeSalaryDue: 0,
    customerDue: 0,
    loanGiven: 0,
    expensesAdvance: 0,
    employeeAdvance: 0,
    stock: 0,
    cashBalance: 0,
    bankBalance: 0,
    walletBalance: 0,
    loanBalance: 0
  });

  const handleShowReport = async () => {
    setReportDate(date);
    try {
      const res = await apiClient.get('/financial/balance-sheet', {
        params: { date }
      });
      if (res.data && res.data.success) {
        setReportData({
          companyDue: res.data.data.companyDue || 0,
          loanTaken: res.data.data.loanTaken || 0,
          expensesDue: res.data.data.expensesDue || 0,
          employeeSalaryDue: res.data.data.employeeSalaryDue || 0,
          customerDue: res.data.data.customerDue || 0,
          loanGiven: res.data.data.loanGiven || 0,
          expensesAdvance: res.data.data.expensesAdvance || 0,
          employeeAdvance: res.data.data.employeeAdvance || 0,
          stock: res.data.data.stock || 0,
          cashBalance: res.data.data.cashBalance || 0,
          bankBalance: res.data.data.bankBalance || 0,
          walletBalance: res.data.data.walletBalance || 0,
          loanBalance: res.data.data.loanBalance || 0
        });
      }
    } catch (error) {
      console.error("Error fetching balance sheet report:", error);
      alert("Failed to load balance sheet data");
    }
  };

  useEffect(() => {
    handleShowReport();
  }, []);

  const formatDateLabel = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    const d = new Date(year, parseInt(month) - 1, parseInt(day));
    return `${parseInt(day)}-${d.toLocaleString('default', { month: 'short' })}-${d.getFullYear()}`;
  };

  const totalLiability = 
    reportData.companyDue + 
    reportData.loanTaken + 
    reportData.expensesDue + 
    reportData.employeeSalaryDue;

  const totalAssets = 
    reportData.customerDue + 
    reportData.loanGiven + 
    reportData.expensesAdvance + 
    reportData.employeeAdvance + 
    reportData.stock + 
    reportData.cashBalance + 
    reportData.bankBalance + 
    reportData.walletBalance + 
    reportData.loanBalance;

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-3 flex flex-col relative pb-[70px]">
      <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden flex-1 p-4">
        
        {/* Date Controls */}
        <div className="flex flex-col items-center justify-center gap-1 mb-6">
          <div className="flex flex-wrap items-end justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <label className="text-[13px] font-bold text-gray-800">Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="h-[32px] w-[140px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-600 bg-white text-center"
                />
              </div>
            </div>

            <button onClick={handleShowReport} className="h-[32px] px-4 bg-[#007bff] hover:bg-[#0069d9] text-white text-[13px] font-medium rounded-[3px] transition-colors shadow-sm">
              Show Report
            </button>
          </div>
        </div>

        {/* Header Title */}
        <div className="text-center mb-4">
          <h2 className="text-[14px] text-gray-700 uppercase mb-1 tracking-wide">BALANCE SHEET</h2>
          <p className="text-[13px] text-gray-600">( on Date {formatDateLabel(reportDate)})</p>
        </div>

        {/* Balance Sheet Table */}
        <div className="border border-gray-200 rounded-sm overflow-hidden mb-6 mx-2">
          <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse text-left table-fixed min-w-[500px]">
            <thead>
              <tr>
                <th className="py-2.5 px-4 text-[13px] font-bold text-white bg-[#4F46E5] border border-white text-center w-[35%] uppercase tracking-wide whitespace-nowrap">LIABILITIES</th>
                <th className="py-2.5 px-4 text-[13px] font-bold text-white bg-[#4F46E5] border border-white text-center w-[15%] whitespace-nowrap">Amount</th>
                <th className="py-2.5 px-4 text-[13px] font-bold text-white bg-[#4F46E5] border border-white text-center w-[35%] uppercase tracking-wide whitespace-nowrap">ASSETS</th>
                <th className="py-2.5 px-4 text-[13px] font-bold text-white bg-[#4F46E5] border border-white text-center w-[15%] whitespace-nowrap">Amount</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1 */}
              <tr>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Company Due</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.companyDue}</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Customer Due</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.customerDue}</td>
              </tr>
              {/* Row 2 */}
              <tr>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Loan Taken</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.loanTaken}</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Loan Given</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.loanGiven}</td>
              </tr>
              {/* Row 3 */}
              <tr>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Expenses Due</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.expensesDue}</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Expenses Advance</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.expensesAdvance}</td>
              </tr>
              {/* Row 4 */}
              <tr>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Employee Salary Due</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.employeeSalaryDue}</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Employee Advance</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.employeeAdvance}</td>
              </tr>
              {/* Row 5 */}
              <tr>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700"></td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center"></td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Stock</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.stock}</td>
              </tr>
              {/* Row 6 */}
              <tr>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700"></td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center"></td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Cash Balance</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.cashBalance}</td>
              </tr>
              {/* Row 7 */}
              <tr>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700"></td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center"></td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Bank Balance</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.bankBalance}</td>
              </tr>
              {/* Row 8 */}
              <tr>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700"></td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center"></td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Wallet Balance</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.walletBalance}</td>
              </tr>
              {/* Row 9 */}
              <tr>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700"></td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center"></td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-700">Loan Balance</td>
                <td className="py-2.5 px-3 border border-gray-200 text-[13px] text-gray-800 text-center">{reportData.loanBalance}</td>
              </tr>
              
              {/* TOTAL Row */}
              <tr>
                <td className="py-3 px-3 border border-gray-200 text-[13px] font-bold text-gray-900 text-center tracking-wide uppercase">TOTAL LIABILITY</td>
                <td className="py-3 px-3 border border-gray-200 text-[13px] font-bold text-gray-900 text-center">{totalLiability}</td>
                <td className="py-3 px-3 border border-gray-200 text-[13px] font-bold text-gray-900 text-center tracking-wide uppercase">TOTAL ASSETS</td>
                <td className="py-3 px-3 border border-gray-200 text-[13px] font-bold text-gray-900 text-center">{totalAssets}</td>
              </tr>
            </tbody>
          </table>
          </div>
        </div>

      </div>

      {/* Footer Button */}
      <div className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3 flex justify-end z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
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
