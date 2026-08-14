import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Upload, Printer, FileDown, Eye, Search, Edit2, Trash2, Calendar, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSettings } from '../context/SettingsContext';
import apiClient from '../api/apiClient';

export function DailyCashBook() {
  const navigate = useNavigate();
  const { formatAmount, currentCurrency } = useSettings();
  const [rows, setRows] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Form State for Add Entry
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0], type: 'Income', voucherNo: '', particular: '', accountName: '', paymentType: 'Cash', amount: ''
  });

  const fetchRojmel = async () => {
    try {
      const res = await apiClient.get(`/financial/rojmel?date=${dateFilter}`);
      if (res.data.success) {
        setRows(res.data.data);
        setOpeningBalance(res.data.openingBalance);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRojmel();
  }, [dateFilter]);

  // Filtering
  const filteredRows = rows.filter(r => 
    r.particular.toLowerCase().includes(search.toLowerCase()) ||
    r.accountName.toLowerCase().includes(search.toLowerCase()) ||
    r.voucherNo.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate Running Balance
  let currentBalance = openingBalance;
  const rowsWithBalance = filteredRows.map(r => {
    currentBalance = currentBalance + r.cashIn - r.cashOut;
    return { ...r, balance: currentBalance };
  });

  const totalIncome = filteredRows.reduce((sum, r) => sum + r.cashIn, 0);
  const totalExpense = filteredRows.reduce((sum, r) => sum + r.cashOut, 0);
  const closingBalance = openingBalance + totalIncome - totalExpense;

  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

  // Handle Add Entry
  const handleSaveEntry = async () => {
    if (!formData.particular || !formData.accountName || !formData.amount) {
      alert("Please fill all mandatory fields.");
      return;
    }
    
    try {
      const res = await apiClient.post('/financial/rojmel', formData);
      if (res.data.success) {
        fetchRojmel();
        setShowAddModal(false);
        setFormData({ date: new Date().toISOString().split('T')[0], type: 'Income', voucherNo: '', particular: '', accountName: '', paymentType: 'Cash', amount: '' });
      }
    } catch (err) {
      console.error("Failed to add entry", err);
      alert("Failed to add entry");
    }
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await apiClient.delete(`/financial/rojmel/${deleteTargetId}`);
      fetchRojmel();
      setShowDeleteConfirm(false);
    } catch (err) {
      console.error("Failed to delete entry", err);
      alert("Failed to delete entry");
    }
  };

  // Printing & Exporting
  const handlePrint = () => window.print();

  const handlePDF = async () => {
    const printElement = document.getElementById('print-report');
    if (!printElement) return;
    
    const originalDisplay = printElement.style.display;
    printElement.style.display = 'block';
    printElement.style.position = 'absolute';
    printElement.style.left = '-9999px';
    printElement.style.top = '-9999px';
    printElement.style.width = '210mm';
    printElement.style.padding = '15mm';
    printElement.style.background = 'white';
    printElement.style.color = 'black';
    
    try {
      const canvas = await html2canvas(printElement, { 
        scale: 2, 
        useCORS: true,
        onclone: (clonedDoc) => {
          const oklchRegex = /oklch\([^)]*\)/gi;
          clonedDoc.querySelectorAll('*').forEach(el => {
            if (el.style) {
              ['color', 'backgroundColor', 'borderColor'].forEach(p => {
                if (el.style[p] && oklchRegex.test(el.style[p])) el.style[p] = '#000000';
              });
              if (el.style.cssText && oklchRegex.test(el.style.cssText)) {
                el.style.cssText = el.style.cssText.replace(oklchRegex, '#000000');
              }
            }
          });
          clonedDoc.querySelectorAll('style').forEach(tag => {
            if (oklchRegex.test(tag.textContent)) tag.textContent = tag.textContent.replace(oklchRegex, '#000000');
          });
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save('Daily_Cash_Book_Rojmel.pdf');
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF.");
    } finally {
      printElement.style.display = originalDisplay;
      printElement.style.position = '';
      printElement.style.left = '';
      printElement.style.top = '';
      printElement.style.width = '';
      printElement.style.padding = '';
      printElement.style.background = '';
      printElement.style.color = '';
    }
  };
  
  const handleExportCSV = () => {
    const headers = ['Date', 'Voucher No', 'Particulars', 'Account Name', 'Payment Type', `Cash In (${currentCurrency.symbol})`, `Cash Out (${currentCurrency.symbol})`, `Balance (${currentCurrency.symbol})`];
    const csvRows = [headers.join(',')];
    csvRows.push(['-', '-', '"Opening Balance"', '-', '-', '-', '-', openingBalance].join(','));
    rowsWithBalance.forEach(r => {
      csvRows.push([r.date, r.voucherNo, `"${r.particular}"`, `"${r.accountName}"`, r.paymentType, r.cashIn, r.cashOut, r.balance].join(','));
    });
    csvRows.push(['-', '-', '"CLOSING BALANCE"', '-', '-', totalIncome, totalExpense, closingBalance].join(','));
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.setAttribute('download', 'rojmel_report.csv');
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  return (
    <>
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-report { display: block !important; }
          @page { margin: 15mm; size: A4 portrait; }
        }
        #print-report { display: none; }
      `}</style>

      {/* ======= HIDDEN PRINTABLE REPORT ======= */}
      <div id="print-report" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#111' }}>
        <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Swayam Bill Book</div>

          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>Daily Cash Book (Rojmel)</div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>Period: {dateFilter} | Generated on: {now}</div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '8px', textAlign: 'center', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>Opening Balance</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4F46E5' }}>{formatAmount(openingBalance)}</div>
          </div>
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '8px', textAlign: 'center', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>Total Cash In (Income)</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#28a745' }}>{formatAmount(totalIncome)}</div>
          </div>
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '8px', textAlign: 'center', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>Total Cash Out (Expense)</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc3545' }}>{formatAmount(totalExpense)}</div>
          </div>
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '8px', textAlign: 'center', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>Closing Balance</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4F46E5' }}>{formatAmount(closingBalance)}</div>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
          <thead>
            <tr style={{ background: '#343a40', color: '#fff' }}>
              <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left' }}>Date</th>
              <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left' }}>Voucher No</th>
              <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left' }}>Particulars</th>
              <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left' }}>Account</th>
              <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>Cash In ({currentCurrency.symbol})</th>
              <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>Cash Out ({currentCurrency.symbol})</th>
              <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>Balance ({currentCurrency.symbol})</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ background: '#f4f6f9' }}>
              <td style={{ border: '1px solid #ddd', padding: '5px' }} colSpan={4}><strong className="text-[#4F46E5]">Opening Balance</strong></td>
              <td style={{ border: '1px solid #ddd', padding: '5px' }}></td>
              <td style={{ border: '1px solid #ddd', padding: '5px' }}></td>
              <td style={{ border: '1px solid #ddd', padding: '5px', textAlign: 'right', fontWeight: 'bold' }}>{formatAmount(openingBalance)}</td>
            </tr>
            {rowsWithBalance.map((r, i) => (
              <tr key={r.id} style={{ background: i % 2 === 1 ? '#f9f9f9' : '#fff' }}>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>{r.date}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>{r.voucherNo}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>{r.particular}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px' }}>{r.accountName}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', color: '#28a745' }}>{r.cashIn > 0 ? formatAmount(r.cashIn) : '-'}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', color: '#dc3545' }}>{r.cashOut > 0 ? formatAmount(r.cashOut) : '-'}</td>
                <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right', fontWeight: 'bold' }}>{formatAmount(r.balance)}</td>
              </tr>
            ))}
            <tr style={{ background: '#343a40', color: '#fff', fontWeight: 'bold' }}>
              <td style={{ border: '1px solid #555', padding: '5px' }} colSpan={4}>CLOSING BALANCE</td>
              <td style={{ border: '1px solid #555', padding: '5px', textAlign: 'right' }}>{formatAmount(totalIncome)}</td>
              <td style={{ border: '1px solid #555', padding: '5px', textAlign: 'right' }}>{formatAmount(totalExpense)}</td>
              <td style={{ border: '1px solid #555', padding: '5px', textAlign: 'right' }}>{formatAmount(closingBalance)}</td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: '20px', fontSize: '9px', color: '#888', textAlign: 'center' }}>System-generated report from Swayam Bill Book</div>

      </div>

      {/* ======= MAIN UI ======= */}
      <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3">
        <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-white text-[16px] font-medium tracking-wide flex items-center gap-2">
              <FileText className="w-5 h-5" /> Daily Cash Book / Rojmel
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-2.5 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors">
                <Plus className="w-4 h-4" strokeWidth={3} /> Add Entry
              </button>
              <button onClick={() => setShowPreview(true)} className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white px-2.5 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors">
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button onClick={handlePrint} className="flex items-center gap-1.5 bg-white text-gray-800 border border-gray-300 hover:bg-gray-50 px-2.5 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button onClick={handlePDF} className="flex items-center gap-1.5 bg-[#dc3545] hover:bg-[#c82333] text-white px-2.5 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors">
                <FileDown className="w-4 h-4" strokeWidth={2.5} /> PDF
              </button>
              <button onClick={handleExportCSV} className="flex items-center gap-1.5 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-2.5 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors">
                <Upload className="w-4 h-4" strokeWidth={2.5} /> Excel
              </button>
              <button onClick={() => navigate('/dashboard')} className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors ml-1">
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-3 bg-white border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-center gap-3 max-w-[800px]">
              <div className="flex items-center flex-1 w-full bg-white border border-gray-300 rounded-[3px] overflow-hidden shadow-sm focus-within:border-[#4F46E5]">
                <div className="px-3 py-1.5 text-[#4F46E5] bg-indigo-50 border-r border-gray-300"><Search className="w-4 h-4" /></div>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Particulars, Account, Voucher..."
                  className="flex-1 min-w-0 px-3 py-1.5 text-[13px] outline-none text-gray-700 placeholder-gray-400" />
              </div>
              <div className="flex flex-col gap-1 w-full sm:w-[200px]">
                <div className="relative">
                  <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full bg-white border border-gray-300 text-gray-700 rounded-[3px] px-3 py-1.5 text-[13px] outline-none cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-gray-200">
            <div className="bg-blue-50/50 p-3 border-r border-gray-200">
              <div className="text-[11px] text-gray-500 font-medium">OPENING BALANCE</div>
              <div className="text-[18px] font-bold text-[#4F46E5] mt-0.5">{formatAmount(openingBalance)}</div>
            </div>
            <div className="bg-green-50/50 p-3 border-r border-gray-200">
              <div className="text-[11px] text-gray-500 font-medium">TOTAL CASH IN (INCOME)</div>
              <div className="text-[18px] font-bold text-green-700 mt-0.5">{formatAmount(totalIncome)}</div>
            </div>
            <div className="bg-red-50/50 p-3 border-r border-gray-200">
              <div className="text-[11px] text-gray-500 font-medium">TOTAL CASH OUT (EXPENSE)</div>
              <div className="text-[18px] font-bold text-red-600 mt-0.5">{formatAmount(totalExpense)}</div>
            </div>
            <div className="bg-indigo-50/50 p-3">
              <div className="text-[11px] text-gray-500 font-medium">CLOSING BALANCE</div>
              <div className="text-[18px] font-bold text-[#4F46E5] mt-0.5">{formatAmount(closingBalance)}</div>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead className="sticky top-0 bg-[#343a40] text-white text-[13px] z-10 shadow-sm">
                <tr>
                  <th className="py-2.5 px-3 font-medium border-r border-gray-600">Date</th>
                  <th className="py-2.5 px-3 font-medium border-r border-gray-600">Voucher No</th>
                  <th className="py-2.5 px-3 font-medium border-r border-gray-600">Particulars / Description</th>
                  <th className="py-2.5 px-3 font-medium border-r border-gray-600">Account Name</th>
                  <th className="py-2.5 px-3 font-medium border-r border-gray-600 text-right">Cash In ({currentCurrency.symbol})</th>
                  <th className="py-2.5 px-3 font-medium border-r border-gray-600 text-right">Cash Out ({currentCurrency.symbol})</th>
                  <th className="py-2.5 px-3 font-medium border-r border-gray-600 text-right">Balance ({currentCurrency.symbol})</th>
                  <th className="py-2.5 px-3 font-medium text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-blue-50/40 border-b border-gray-200 text-[13px]">
                  <td className="py-2 px-3"></td>
                  <td className="py-2 px-3"></td>
                  <td className="py-2 px-3 font-bold text-[#4F46E5]">Opening Balance</td>
                  <td className="py-2 px-3"></td>
                  <td className="py-2 px-3"></td>
                  <td className="py-2 px-3"></td>
                  <td className="py-2 px-3 text-right font-bold text-[#4F46E5]">{formatAmount(openingBalance)}</td>
                  <td className="py-2 px-3"></td>
                </tr>
                {rowsWithBalance.length === 0 ? (
                  <tr><td colSpan="8" className="py-12 text-center text-gray-400">No cash transactions found for selected criteria.</td></tr>
                ) : rowsWithBalance.map((r, i) => (
                  <tr key={r.id} className={`border-b border-gray-100 text-[13px] hover:bg-gray-50 transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <td className="py-2 px-3 text-gray-600 whitespace-nowrap">{r.date}</td>
                    <td className="py-2 px-3"><span className="text-gray-500 font-mono text-[11px] bg-gray-100 px-1.5 py-0.5 rounded">{r.voucherNo}</span></td>
                    <td className="py-2 px-3 text-gray-800 font-medium">{r.particular}</td>
                    <td className="py-2 px-3 text-gray-600">{r.accountName}</td>
                    <td className="py-2 px-3 text-right font-bold text-green-700">{r.cashIn > 0 ? formatAmount(r.cashIn) : <span className="text-gray-300">-</span>}</td>
                    <td className="py-2 px-3 text-right font-bold text-red-600">{r.cashOut > 0 ? formatAmount(r.cashOut) : <span className="text-gray-300">-</span>}</td>
                    <td className="py-2 px-3 text-right font-bold text-gray-800 bg-gray-50/50 border-l border-gray-100">{formatAmount(r.balance)}</td>
                    <td className="py-2 px-3 text-center">
                      {r.isManual && (
                        <button onClick={() => { setDeleteTargetId(r.id); setShowDeleteConfirm(true); }} className="text-red-500 hover:text-red-700 transition-colors bg-red-50 p-1.5 rounded" title="Delete">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#4F46E5] px-4 py-3 flex justify-between items-center">
              <h3 className="text-white font-bold text-[15px] flex items-center gap-2"><Plus className="w-4 h-4"/> New Cash Entry (Rojmel)</h3>
              <button onClick={() => setShowAddModal(false)} className="text-white/80 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="entryType" checked={formData.type === 'Income'} onChange={() => setFormData({...formData, type: 'Income'})} className="w-4 h-4 text-[#4F46E5]" />
                  <span className="text-[14px] font-bold text-green-700">Cash In (Income)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="entryType" checked={formData.type === 'Expense'} onChange={() => setFormData({...formData, type: 'Expense'})} className="w-4 h-4 text-red-600" />
                  <span className="text-[14px] font-bold text-red-600">Cash Out (Expense)</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-gray-700">Date</label>
                  <input type="text" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-gray-700">Amount ({currentCurrency.symbol}) *</label>
                  <input type="number" placeholder="0.00" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] font-bold"/>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-gray-700">Particulars / Description *</label>
                <input type="text" placeholder="e.g., Office Rent, Cash Sales" value={formData.particular} onChange={e => setFormData({...formData, particular: e.target.value})} className="border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]"/>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold text-gray-700">Account Name *</label>
                <input type="text" placeholder="Ledger Account" value={formData.accountName} onChange={e => setFormData({...formData, accountName: e.target.value})} className="border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-gray-700">Voucher No.</label>
                  <input type="text" placeholder="Auto-generated if empty" value={formData.voucherNo} onChange={e => setFormData({...formData, voucherNo: e.target.value})} className="border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] bg-gray-50"/>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[12px] font-bold text-gray-700">Payment Type</label>
                  <select value={formData.paymentType} onChange={e => setFormData({...formData, paymentType: e.target.value})} className="border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]">
                    <option>Cash</option>
                    <option>Bank / UPI</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 flex justify-end gap-2 border-t border-gray-200">
              <button onClick={() => setShowAddModal(false)} className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-[3px] text-[13px] font-bold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSaveEntry} className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-5 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors">Save Entry</button>
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(98vw,800px)] max-h-[90vh] overflow-auto animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-[#4F46E5] px-4 py-2.5 flex items-center justify-between sticky top-0 z-10">
              <h3 className="text-white font-bold text-[15px] flex items-center gap-2"><Eye className="w-5 h-5" /> Print Preview</h3>
              <div className="flex gap-2">
                <button onClick={() => { setShowPreview(false); setTimeout(() => window.print(), 100); }} className="flex items-center gap-1.5 bg-white text-[#4F46E5] px-3 py-1.5 rounded-[3px] text-[13px] font-bold hover:bg-gray-50 transition-colors">
                  <Printer className="w-4 h-4" /> Print Now
                </button>
                <button onClick={() => setShowPreview(false)} className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors"><X className="w-5 h-5" strokeWidth={3} /></button>
              </div>
            </div>
            <div className="p-8 bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
              <div className="text-center border-b-2 border-gray-800 pb-4 mb-5">
                <div className="text-[20px] font-bold text-gray-900">Swayam Bill Book</div>

                <div className="text-[16px] font-bold text-gray-700 mt-1">Daily Cash Book (Rojmel)</div>
                <div className="text-[12px] text-gray-500 mt-1">Period: <strong>{dateFilter}</strong> | Generated on: {now}</div>
              </div>
              <div className="grid grid-cols-4 gap-3 mb-5">
                <div className="border border-gray-200 rounded-[3px] p-3 text-center bg-gray-50">
                  <div className="text-[11px] text-gray-500">Opening Balance</div>
                  <div className="text-[14px] font-bold text-[#4F46E5] mt-0.5">{formatAmount(openingBalance)}</div>
                </div>
                <div className="border border-gray-200 rounded-[3px] p-3 text-center bg-gray-50">
                  <div className="text-[11px] text-gray-500">Total Cash In</div>
                  <div className="text-[14px] font-bold text-green-700 mt-0.5">{formatAmount(totalIncome)}</div>
                </div>
                <div className="border border-gray-200 rounded-[3px] p-3 text-center bg-gray-50">
                  <div className="text-[11px] text-gray-500">Total Cash Out</div>
                  <div className="text-[14px] font-bold text-red-600 mt-0.5">{formatAmount(totalExpense)}</div>
                </div>
                <div className="border border-gray-200 rounded-[3px] p-3 text-center bg-gray-50">
                  <div className="text-[11px] text-gray-500">Closing Balance</div>
                  <div className="text-[14px] font-bold text-[#4F46E5] mt-0.5">{formatAmount(closingBalance)}</div>
                </div>
              </div>
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="bg-[#343a40] text-white">
                    <th className="border border-gray-500 py-1.5 px-2 text-left">Date</th>
                    <th className="border border-gray-500 py-1.5 px-2 text-left">Voucher</th>
                    <th className="border border-gray-500 py-1.5 px-2 text-left">Particulars</th>
                    <th className="border border-gray-500 py-1.5 px-2 text-left">Account</th>
                    <th className="border border-gray-500 py-1.5 px-2 text-right">Cash In</th>
                    <th className="border border-gray-500 py-1.5 px-2 text-right">Cash Out</th>
                    <th className="border border-gray-500 py-1.5 px-2 text-right">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-gray-100">
                    <td className="border border-gray-200 py-1.5 px-2" colSpan={4}><strong>Opening Balance</strong></td>
                    <td className="border border-gray-200 py-1.5 px-2"></td>
                    <td className="border border-gray-200 py-1.5 px-2"></td>
                    <td className="border border-gray-200 py-1.5 px-2 text-right font-bold text-[#4F46E5]">{formatAmount(openingBalance)}</td>
                  </tr>
                  {rowsWithBalance.map((r, i) => (
                    <tr key={r.id} className={i % 2 === 1 ? 'bg-gray-50' : ''}>
                      <td className="border border-gray-200 py-1.5 px-2">{r.date}</td>
                      <td className="border border-gray-200 py-1.5 px-2 font-mono text-[10px]">{r.voucherNo}</td>
                      <td className="border border-gray-200 py-1.5 px-2">{r.particular}</td>
                      <td className="border border-gray-200 py-1.5 px-2">{r.accountName}</td>
                      <td className="border border-gray-200 py-1.5 px-2 text-right text-green-700 font-bold">{r.cashIn > 0 ? formatAmount(r.cashIn) : '-'}</td>
                      <td className="border border-gray-200 py-1.5 px-2 text-right text-red-600 font-bold">{r.cashOut > 0 ? formatAmount(r.cashOut) : '-'}</td>
                      <td className="border border-gray-200 py-1.5 px-2 text-right font-bold">{formatAmount(r.balance)}</td>
                    </tr>
                  ))}
                  <tr className="bg-[#343a40] text-white font-bold">
                    <td className="border border-gray-600 py-2 px-2" colSpan={4}>CLOSING BALANCE</td>
                    <td className="border border-gray-600 py-2 px-2 text-right text-green-300">{formatAmount(totalIncome)}</td>
                    <td className="border border-gray-600 py-2 px-2 text-right text-red-300">{formatAmount(totalExpense)}</td>
                    <td className="border border-gray-600 py-2 px-2 text-right">{formatAmount(closingBalance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[380px] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#dc3545] px-4 py-2.5">
              <h3 className="text-white font-bold text-[14px]">⚠️ Confirm Deletion</h3>
            </div>
            <div className="p-5 text-[14px] text-gray-700">Are you sure you want to delete this cash entry?</div>
            <div className="flex justify-end gap-2 px-5 pb-4">
              <button onClick={() => setShowDeleteConfirm(false)} className="bg-gray-200 px-4 py-2 rounded-[3px] text-[13px] font-medium">Cancel</button>
              <button onClick={confirmDelete} className="bg-[#dc3545] text-white px-5 py-2 rounded-[3px] text-[13px] font-bold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
