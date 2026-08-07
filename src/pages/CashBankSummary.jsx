import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { X, Plus, Upload, Printer, FileDown, Eye, Calendar, Filter } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import apiClient from '../api/apiClient';

const DATE_RANGES = ['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'Last Month', 'This Month', 'Custom Range'];

export function CashBankSummary() {
  const navigate = useNavigate();
  const printRef = useRef();
  const { formatAmount, currentCurrency } = useSettings();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const typeParam = searchParams.get('type');
  const dateRangeParam = searchParams.get('dateRange');

  const [accountsList, setAccountsList] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [dateRange, setDateRange] = useState(dateRangeParam && DATE_RANGES.includes(dateRangeParam) ? dateRangeParam : 'Last 7 Days');
  const [customStartDate, setCustomStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [customEndDate, setCustomEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [accountData, setAccountData] = useState({ openingBalance: 0, transactions: [] });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await apiClient.get('/banks');
      if (res.data.success && res.data.data.length > 0) {
        setAccountsList(res.data.data);
        
        let targetId = res.data.data[0].id.toString();
        if (typeParam === 'cash') {
          const cashAcc = res.data.data.find(a => (a.name || '').toLowerCase().includes('cash') || (a.type || '').toLowerCase().includes('cash'));
          if (cashAcc) targetId = cashAcc.id.toString();
        } else if (typeParam === 'bank') {
          const bankAcc = res.data.data.find(a => (a.name || '').toLowerCase().includes('bank') || (a.type || '').toLowerCase().includes('bank'));
          if (bankAcc) targetId = bankAcc.id.toString();
        }
        
        setSelectedAccountId(targetId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getDates = () => {
    let startDate = null;
    let endDate = null;
    const today = new Date();
    today.setHours(0,0,0,0);
    const offset = today.getTimezoneOffset() * 60000;
    const fmt = (d) => new Date(d.getTime() - offset).toISOString().split('T')[0];

    switch (dateRange) {
      case 'Today':
        startDate = fmt(today); endDate = fmt(today); break;
      case 'Yesterday': {
        const y = new Date(today); y.setDate(y.getDate() - 1);
        startDate = fmt(y); endDate = fmt(y); break;
      }
      case 'Last 7 Days': {
        const s = new Date(today); s.setDate(s.getDate() - 6);
        startDate = fmt(s); endDate = fmt(today); break;
      }
      case 'Last 30 Days': {
        const s = new Date(today); s.setDate(s.getDate() - 29);
        startDate = fmt(s); endDate = fmt(today); break;
      }
      case 'This Month': {
        const s = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = fmt(s); endDate = fmt(today); break;
      }
      case 'Last Month': {
        const s = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const e = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = fmt(s); endDate = fmt(e); break;
      }
      case 'Custom Range':
        startDate = customStartDate; endDate = customEndDate; break;
    }
    return { startDate, endDate };
  };

  useEffect(() => {
    if (selectedAccountId) {
      fetchTransactions(selectedAccountId);
    }
  }, [selectedAccountId, dateRange, customStartDate, customEndDate]);

  const fetchTransactions = async (id) => {
    try {
      const { startDate, endDate } = getDates();
      const res = await apiClient.get(`/banks/${id}/transactions`, {
        params: { startDate, endDate }
      });
      if (res.data.success) {
        const bank = res.data.bank;
        const txs = res.data.data || [];
        
        let totalInAmt = 0;
        let totalOutAmt = 0;
        
        const mappedTxs = txs.map(t => {
          const paymentIn = t.isCredit ? (t.transferAmount || 0) : 0;
          const paymentOut = !t.isCredit ? (t.transferAmount || 0) : 0;
          totalInAmt += paymentIn;
          totalOutAmt += paymentOut;
          
          return {
            date: new Date(t.date).toLocaleDateString('en-GB').replace(/\//g, '-'),
            info: t.remark || t.otherBankName || 'Transfer',
            paymentIn,
            paymentOut
          };
        });

        const closingBal = bank.balance || 0;
        const openingBal = closingBal - totalInAmt + totalOutAmt;

        setAccountData({
          openingBalance: openingBal,
          transactions: mappedTxs
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const selectedAccountName = accountsList.find(a => a.id.toString() === selectedAccountId)?.name || 'Account';

  // Calculate running balance
  let runningBalance = accountData.openingBalance;
  const txWithBalance = accountData.transactions.map(tx => {
    runningBalance = runningBalance + tx.paymentIn - tx.paymentOut;
    return { ...tx, balance: runningBalance };
  });

  const totalIn = accountData.transactions.reduce((s, t) => s + t.paymentIn, 0);
  const totalOut = accountData.transactions.reduce((s, t) => s + t.paymentOut, 0);
  const closingBalance = accountData.openingBalance + totalIn - totalOut;

  const formatDisplayDate = (dString) => {
    if(!dString) return "";
    const d = new Date(dString);
    if(isNaN(d.getTime())) return dString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  };

  const { startDate, endDate } = getDates();
  const dateLabel = `${formatDisplayDate(startDate)} to ${formatDisplayDate(endDate)}`;

  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  // Print function using window.print() with a hidden printable area
  const handlePrint = () => {
    window.print();
  };

  // Export as PDF using browser print-to-PDF
  const handlePDF = () => {
    setShowPreview(true);
    setTimeout(() => window.print(), 400);
  };

  // CSV export
  const handleExport = () => {
    const headers = ['S.NO.', 'Date', 'Description', `Payment In (${currentCurrency.symbol})`, `Payment Out (${currentCurrency.symbol})`, `Balance (${currentCurrency.symbol})`];
    const csvRows = [headers.join(',')];
    csvRows.push(['', '', `Opening Balance`, '', '', accountData.openingBalance].join(','));
    txWithBalance.forEach((tx, i) => {
      csvRows.push([i + 1, tx.date, `"${tx.info}"`, tx.paymentIn, tx.paymentOut, tx.balance].join(','));
    });
    csvRows.push(['', '', 'TOTAL', totalIn, totalOut, closingBalance].join(','));
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.setAttribute('download', `${selectedAccount.replace(/\s/g, '_')}_report.csv`);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isCash = selectedAccountName.toLowerCase().includes('cash');

  return (
    <>
      {/* ======= PRINT STYLES — only visible when printing ======= */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-report { display: block !important; }
          @page { margin: 15mm; size: A4; }
        }
        #print-report { display: none; }
      `}</style>

      {/* ======= PRINTABLE REPORT (hidden on screen) ======= */}
      <div id="print-report" style={{ fontFamily: 'Arial, sans-serif', fontSize: '12px', color: '#111' }}>
        <div style={{ textAlign: 'center', marginBottom: '12px', borderBottom: '2px solid #333', paddingBottom: '8px' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>Swayam Bill Book</div>

          <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '4px' }}>
            {isCash ? 'Cash Summary Report' : 'Bank Summary Report'}
          </div>
          <div style={{ fontSize: '11px', marginTop: '2px', color: '#555' }}>Account: {selectedAccountName} | Period: {dateLabel}</div>
          <div style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>Generated on: {now}</div>
        </div>

        {/* Summary boxes */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
          {[
            { label: 'Opening Balance', value: formatAmount(accountData.openingBalance), color: '#4F46E5' },
            { label: 'Total Credit (In)', value: formatAmount(totalIn), color: '#28a745' },
            { label: 'Total Debit (Out)', value: formatAmount(totalOut), color: '#dc3545' },
            { label: 'Closing Balance', value: formatAmount(closingBalance), color: '#4F46E5' },
          ].map(b => (
            <div key={b.label} style={{ flex: 1, border: `1px solid #ddd`, padding: '6px 8px', borderRadius: '3px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: '#666' }}>{b.label}</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: b.color }}>{b.value}</div>
            </div>
          ))}
        </div>

        {/* Transactions table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ background: '#343a40', color: '#fff' }}>
              <th style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center' }}>S.No.</th>
              <th style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'center' }}>Date</th>
              <th style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'left' }}>Description</th>
              <th style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'right' }}>Credit ({currentCurrency.symbol})</th>
              <th style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'right' }}>Debit ({currentCurrency.symbol})</th>
              <th style={{ border: '1px solid #ccc', padding: '5px 8px', textAlign: 'right' }}>Balance ({currentCurrency.symbol})</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #ddd', padding: '4px 8px' }}></td>
              <td style={{ border: '1px solid #ddd', padding: '4px 8px' }}></td>
              <td style={{ border: '1px solid #ddd', padding: '4px 8px', fontWeight: 'bold', color: '#4F46E5' }}>Opening Balance</td>
              <td style={{ border: '1px solid #ddd', padding: '4px 8px' }}></td>
              <td style={{ border: '1px solid #ddd', padding: '4px 8px' }}></td>
              <td style={{ border: '1px solid #ddd', padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>{formatAmount(accountData.openingBalance)}</td>
            </tr>
            {txWithBalance.map((tx, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                <td style={{ border: '1px solid #ddd', padding: '4px 8px', textAlign: 'center' }}>{i + 1}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px 8px', textAlign: 'center' }}>{tx.date}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px 8px' }}>{tx.info}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px 8px', textAlign: 'right', color: '#28a745', fontWeight: tx.paymentIn > 0 ? 'bold' : 'normal' }}>{tx.paymentIn > 0 ? formatAmount(tx.paymentIn) : '-'}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px 8px', textAlign: 'right', color: '#dc3545', fontWeight: tx.paymentOut > 0 ? 'bold' : 'normal' }}>{tx.paymentOut > 0 ? formatAmount(tx.paymentOut) : '-'}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px 8px', textAlign: 'right' }}>{formatAmount(tx.balance)}</td>
              </tr>
            ))}
            <tr style={{ background: '#343a40', color: '#fff', fontWeight: 'bold' }}>
              <td style={{ border: '1px solid #555', padding: '5px 8px' }} colSpan={2}></td>
              <td style={{ border: '1px solid #555', padding: '5px 8px' }}>CLOSING BALANCE TOTAL</td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', textAlign: 'right' }}>{formatAmount(totalIn)}</td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', textAlign: 'right' }}>{formatAmount(totalOut)}</td>
              <td style={{ border: '1px solid #555', padding: '5px 8px', textAlign: 'right' }}>{formatAmount(closingBalance)}</td>
            </tr>
          </tbody>
        </table>

        <div style={{ marginTop: '20px', fontSize: '10px', color: '#888', textAlign: 'center', borderTop: '1px solid #ddd', paddingTop: '8px' }}>
          This is a system-generated report from Swayam Bill Book — The Digital Accounting Book

        </div>
      </div>

      {/* ======= MAIN SCREEN UI ======= */}
      <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-3">
        <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden flex flex-col">

          {/* Header */}
          <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-white text-[16px] font-medium tracking-wide">Cash &amp; Bank Reports</h2>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => navigate('/admin/bank-ledger')}
                className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-2.5 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors">
                <Plus className="w-4 h-4" strokeWidth={3} /> Create New
              </button>

              {/* Preview Button */}
              <button onClick={() => setShowPreview(true)}
                className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white px-2.5 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors">
                <Eye className="w-4 h-4" /> Preview
              </button>

              {/* Print Button */}
              <button onClick={handlePrint}
                className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 px-2.5 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors border border-gray-300">
                <Printer className="w-4 h-4" /> Print
              </button>

              {/* PDF Export */}
              <button onClick={handlePDF}
                className="flex items-center gap-1.5 bg-[#dc3545] hover:bg-[#c82333] text-white px-2.5 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors">
                <FileDown className="w-4 h-4" strokeWidth={2.5} /> PDF
              </button>

              {/* CSV Export */}
              <button onClick={handleExport}
                className="flex items-center gap-1 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-2.5 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors">
                <Upload className="w-4 h-4" strokeWidth={2.5} /> CSV
              </button>

              <button onClick={() => navigate('/dashboard')}
                className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors ml-1">
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[13px] font-bold text-gray-800">Cash / Bank Account</label>
                  <span className="text-[13px] font-bold text-[#28a745]">
                    Balance: {formatAmount(closingBalance)}
                  </span>
                </div>
                <select
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full h-[32px] border border-[#4F46E5] rounded-[3px] px-2 text-[13px] outline-none bg-[#add8e6] text-[#0056b3]"
                >
                  {accountsList.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[13px] font-bold text-gray-800">Date Range</label>
                </div>
                <select
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none bg-white text-gray-700"
                >
                  {DATE_RANGES.map(d => <option key={d}>{d}</option>)}
                </select>
                {dateRange === 'Custom Range' && (
                  <div className="flex gap-2 mt-1">
                    <input 
                      type="date" 
                      value={customStartDate} 
                      onChange={e => setCustomStartDate(e.target.value)} 
                      className="w-1/2 h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none bg-white"
                    />
                    <input 
                      type="date" 
                      value={customEndDate} 
                      onChange={e => setCustomEndDate(e.target.value)} 
                      className="w-1/2 h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none bg-white"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-b border-gray-200">
            {[
              { label: 'Opening Balance', value: formatAmount(accountData.openingBalance), bg: 'bg-blue-50', text: 'text-[#4F46E5]' },
              { label: 'Total Credit (In)', value: formatAmount(totalIn), bg: 'bg-green-50', text: 'text-green-700' },
              { label: 'Total Debit (Out)', value: formatAmount(totalOut), bg: 'bg-red-50', text: 'text-red-600' },
              { label: 'Closing Balance', value: formatAmount(closingBalance), bg: 'bg-indigo-50', text: 'text-[#4F46E5]' },
            ].map((card, i) => (
              <div key={i} className={`${card.bg} px-4 py-3 border-r border-gray-200 last:border-r-0`}>
                <div className="text-[11px] text-gray-500 font-medium">{card.label}</div>
                <div className={`text-[16px] font-bold mt-0.5 ${card.text}`}>{card.value}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#343a40]">
                  <th className="border border-gray-500 text-[13px] font-bold text-white py-2 px-3 text-center w-14">S.No.</th>
                  <th className="border border-gray-500 text-[13px] font-bold text-white py-2 px-3 text-center w-28">Date</th>
                  <th className="border border-gray-500 text-[13px] font-bold text-white py-2 px-3 text-left">Description</th>
                  <th className="border border-gray-500 text-[13px] font-bold text-white py-2 px-3 text-right w-28">Credit ({currentCurrency.symbol})</th>
                  <th className="border border-gray-500 text-[13px] font-bold text-white py-2 px-3 text-right w-28">Debit ({currentCurrency.symbol})</th>
                  <th className="border border-gray-500 text-[13px] font-bold text-white py-2 px-3 text-right w-28">Balance ({currentCurrency.symbol})</th>
                </tr>
              </thead>
              <tbody>
                {/* Opening Balance */}
                <tr className="border-b border-gray-200 bg-blue-50">
                  <td className="border border-gray-200 py-2 px-3"></td>
                  <td className="border border-gray-200 py-2 px-3"></td>
                  <td className="border border-gray-200 py-2 px-3">
                    <span className="text-[#4F46E5] font-bold text-[13px]">Opening Balance</span>
                  </td>
                  <td className="border border-gray-200 py-2 px-3"></td>
                  <td className="border border-gray-200 py-2 px-3"></td>
                  <td className="border border-gray-200 py-2 px-3 text-right">
                    <span className="text-[#4F46E5] font-bold text-[13px]">{formatAmount(accountData.openingBalance)}</span>
                  </td>
                </tr>

                {/* Transactions */}
                {txWithBalance.map((tx, i) => (
                  <tr key={i} className={`border-b border-gray-100 hover:bg-gray-50 text-[13px] transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <td className="border border-gray-200 py-2 px-3 text-center text-gray-500">{i + 1}</td>
                    <td className="border border-gray-200 py-2 px-3 text-center text-gray-700 font-mono text-[12px]">{tx.date}</td>
                    <td className="border border-gray-200 py-2 px-3 text-gray-700">{tx.info}</td>
                    <td className="border border-gray-200 py-2 px-3 text-right font-bold text-green-700">
                      {tx.paymentIn > 0 ? formatAmount(tx.paymentIn) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="border border-gray-200 py-2 px-3 text-right font-bold text-red-600">
                      {tx.paymentOut > 0 ? formatAmount(tx.paymentOut) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="border border-gray-200 py-2 px-3 text-right font-bold text-gray-800">
                      {formatAmount(tx.balance)}
                    </td>
                  </tr>
                ))}

                {/* Closing Total */}
                <tr className="bg-[#343a40] text-white font-bold text-[13px]">
                  <td className="border border-gray-600 py-2 px-3" colSpan={2}></td>
                  <td className="border border-gray-600 py-2 px-3">CLOSING BALANCE</td>
                  <td className="border border-gray-600 py-2 px-3 text-right text-green-300">{formatAmount(totalIn)}</td>
                  <td className="border border-gray-600 py-2 px-3 text-right text-red-300">{formatAmount(totalOut)}</td>
                  <td className="border border-gray-600 py-2 px-3 text-right">{formatAmount(closingBalance)}</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>

      {/* ======= PRINT PREVIEW MODAL ======= */}
      {showPreview && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(98vw,800px)] max-h-[90vh] overflow-auto animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>

            {/* Preview Header */}
            <div className="bg-[#4F46E5] px-4 py-2.5 flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-white font-bold text-[15px] flex items-center gap-2"><Eye className="w-5 h-5" /> Print Preview</h3>
              <div className="flex gap-2">
                <button onClick={handlePrint} className="flex items-center gap-1.5 bg-white text-[#4F46E5] px-3 py-1.5 rounded-[3px] text-[13px] font-bold hover:bg-gray-50 transition-colors">
                  <Printer className="w-4 h-4" /> Print Now
                </button>
                <button onClick={() => setShowPreview(false)} className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors">
                  <X className="w-5 h-5" strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Preview Body — mimics the printable layout */}
            <div className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
              {/* Company & Title */}
              <div className="text-center border-b-2 border-gray-800 pb-4 mb-5">
                <div className="text-[20px] font-bold text-gray-900">Swayam Bill Book</div>

                <div className="text-[15px] font-bold text-gray-700 mt-1">
                  {isCash ? 'Cash Summary Report' : 'Bank Summary Report'}
                </div>
                <div className="text-[12px] text-gray-500 mt-1">Account: <strong>{selectedAccountName}</strong> | Period: <strong>{dateLabel}</strong></div>
                <div className="text-[11px] text-gray-400 mt-1">Generated on: {now}</div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-4 gap-3 mb-5">
                {[
                  { label: 'Opening Balance', value: formatAmount(accountData.openingBalance), cls: 'text-[#4F46E5]' },
                  { label: 'Total Credit', value: formatAmount(totalIn), cls: 'text-green-700' },
                  { label: 'Total Debit', value: formatAmount(totalOut), cls: 'text-red-600' },
                  { label: 'Closing Balance', value: formatAmount(closingBalance), cls: 'text-[#4F46E5]' },
                ].map(b => (
                  <div key={b.label} className="border border-gray-200 rounded-[3px] p-3 text-center bg-gray-50">
                    <div className="text-[11px] text-gray-500">{b.label}</div>
                    <div className={`text-[14px] font-bold mt-0.5 ${b.cls}`}>{b.value}</div>
                  </div>
                ))}
              </div>

              {/* Table */}
              <table className="w-full border-collapse text-[12px]">
                <thead>
                  <tr className="bg-[#343a40] text-white">
                    <th className="border border-gray-500 py-2 px-3 text-center">S.No.</th>
                    <th className="border border-gray-500 py-2 px-3 text-center">Date</th>
                    <th className="border border-gray-500 py-2 px-3 text-left">Description</th>
                    <th className="border border-gray-500 py-2 px-3 text-right">Credit ({currentCurrency.symbol})</th>
                    <th className="border border-gray-500 py-2 px-3 text-right">Debit ({currentCurrency.symbol})</th>
                    <th className="border border-gray-500 py-2 px-3 text-right">Balance ({currentCurrency.symbol})</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-blue-50">
                    <td className="border border-gray-200 py-2 px-3" colSpan={2}></td>
                    <td className="border border-gray-200 py-2 px-3 font-bold text-[#4F46E5]">Opening Balance</td>
                    <td className="border border-gray-200 py-2 px-3"></td>
                    <td className="border border-gray-200 py-2 px-3"></td>
                    <td className="border border-gray-200 py-2 px-3 text-right font-bold text-[#4F46E5]">{formatAmount(accountData.openingBalance)}</td>
                  </tr>
                  {txWithBalance.map((tx, i) => (
                    <tr key={i} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                      <td className="border border-gray-200 py-1.5 px-3 text-center text-gray-500">{i + 1}</td>
                      <td className="border border-gray-200 py-1.5 px-3 text-center font-mono">{tx.date}</td>
                      <td className="border border-gray-200 py-1.5 px-3 text-gray-700">{tx.info}</td>
                      <td className="border border-gray-200 py-1.5 px-3 text-right text-green-700 font-bold">{tx.paymentIn > 0 ? formatAmount(tx.paymentIn) : '—'}</td>
                      <td className="border border-gray-200 py-1.5 px-3 text-right text-red-600 font-bold">{tx.paymentOut > 0 ? formatAmount(tx.paymentOut) : '—'}</td>
                      <td className="border border-gray-200 py-1.5 px-3 text-right font-bold">{formatAmount(tx.balance)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#343a40] text-white font-bold">
                    <td className="border border-gray-600 py-2 px-3" colSpan={2}></td>
                    <td className="border border-gray-600 py-2 px-3">CLOSING BALANCE</td>
                    <td className="border border-gray-600 py-2 px-3 text-right text-green-300">{formatAmount(totalIn)}</td>
                    <td className="border border-gray-600 py-2 px-3 text-right text-red-300">{formatAmount(totalOut)}</td>
                    <td className="border border-gray-600 py-2 px-3 text-right">{formatAmount(closingBalance)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-6 text-center text-[10px] text-gray-400 border-t border-gray-200 pt-3">
                System-generated report — Swayam Bill Book | The Digital Accounting Book

              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
