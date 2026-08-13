import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, FileText, Share2, MessageCircle, Upload, Download, ExternalLink, X } from 'lucide-react';
import apiClient from '../api/apiClient';

export function GstrSaleSummary() {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState([]);
  const [period, setPeriod] = useState('This Month');
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomRangeModalOpen, setIsCustomRangeModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [customers, setCustomers] = useState([]);
  const [partyNameEnabled, setPartyNameEnabled] = useState(false);
  const [selectedPartyName, setSelectedPartyName] = useState('');
  const [showHsnWise, setShowHsnWise] = useState(false);

  useEffect(() => {
    if(period && period !== 'Custom Range' && period !== 'Select') {
      fetchSummary(period, customStartDate, customEndDate, partyNameEnabled ? selectedPartyName : '');
    }
  }, [period, partyNameEnabled, selectedPartyName]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await apiClient.get('/customers');
        if (res.data.success) {
          setCustomers(res.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch customers', error);
      }
    };
    fetchCustomers();
  }, []);

  const fetchSummary = async (selectedPeriod, customStart, customEnd, partyName) => {
    try {
      setIsLoading(true);
      const now = new Date();
      let startDate, endDate;

      if (selectedPeriod === 'This Month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (selectedPeriod === 'Last Month') {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      } else if (selectedPeriod === 'This Quarter') {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        endDate = new Date(now.getFullYear(), quarterMonth + 3, 0);
      } else if (selectedPeriod === 'Last Quarter') {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3 - 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        endDate = new Date(now.getFullYear(), quarterMonth + 3, 0);
      } else if (selectedPeriod === 'Custom Range' && customStart && customEnd) {
        startDate = new Date(customStart);
        endDate = new Date(customEnd);
      }

      let url = '/gstr/sale-summary?';
      if (startDate && endDate) {
        url += `startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&`;
      }
      if (partyName) {
        url += `partyName=${encodeURIComponent(partyName)}`;
      }

      const res = await apiClient.get(url);
      if (res.data.success) {
        setSummaryData(res.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch sale summary', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate Totals
  const totals = summaryData.reduce((acc, row) => {
    acc.taxableAmount += Number(row.taxableAmount) || 0;
    acc.igst += Number(row.igst) || 0;
    acc.cgst += Number(row.cgst) || 0;
    acc.sgst += Number(row.sgst) || 0;
    acc.subTotal += Number(row.subTotal) || 0;
    acc.grandTotal += Number(row.grandTotal) || 0;
    return acc;
  }, { taxableAmount: 0, igst: 0, cgst: 0, sgst: 0, subTotal: 0, grandTotal: 0 });

  const formatNumber = (num) => Number(num).toFixed(2);
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
  };

  const handleExportCSV = () => {
    const header = ['Date', 'Invoice No.', 'Party Name', 'GSTIN', 'State'];
    if (showHsnWise) header.push('HSN Code');
    header.push('Taxable Amount', 'GST %', 'Quantity', 'IGST', 'CGST', 'SGST', 'Sub Total', 'Grand Total');

    const rows = summaryData.map(row => {
      const rowData = [
        formatDate(row.date),
        row.invoiceNo,
        row.partyName,
        row.gstin,
        row.state
      ];
      if (showHsnWise) rowData.push(row.hsn || '-');
      rowData.push(
        formatNumber(row.taxableAmount),
        row.gstPercent,
        row.quantity,
        formatNumber(row.igst),
        formatNumber(row.cgst),
        formatNumber(row.sgst),
        formatNumber(row.subTotal),
        formatNumber(row.grandTotal)
      );
      return rowData;
    });
    
    const totalRow = [
      '', '', '', '', 'Total'
    ];
    if (showHsnWise) totalRow.push('');
    totalRow.push(
      formatNumber(totals.taxableAmount), '', '', 
      formatNumber(totals.igst), formatNumber(totals.cgst), formatNumber(totals.sgst), 
      formatNumber(totals.subTotal), formatNumber(totals.grandTotal)
    );
    rows.push(totalRow);

    const csvContent = [header, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "gstr_sale_summary.csv";
    link.click();
  };

  const handleDownload = () => {
    const data = { message: "GSTR Sale Summary Data", data: summaryData, totals };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "gstr_sale_summary.json";
    link.click();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'GST Sales Summary',
        text: 'Check out the GST Sales Summary',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-4 flex flex-col relative pb-[80px]">
      
      {/* Top Controls */}
      <div className="bg-white p-4 rounded shadow-sm border border-gray-200 mb-4 flex flex-wrap items-center gap-6">
        <div className="flex flex-col gap-1.5 w-full sm:max-w-[250px]">
          <label className="text-[13px] font-bold text-gray-800">Select Period</label>
          <select 
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              if (e.target.value === 'Custom Range') {
                setIsCustomRangeModalOpen(true);
              }
            }}
            className="h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white"
          >
            <option value="">Select</option>
            <option value="This Month">This Month</option>
            <option value="Last Month">Last Month</option>
            <option value="This Quarter">This Quarter</option>
            <option value="Last Quarter">Last Quarter</option>
            <option value="Custom Range">Custom Range</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 w-full sm:max-w-[300px]">
          <div className="flex flex-wrap items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={partyNameEnabled}
                onChange={(e) => setPartyNameEnabled(e.target.checked)}
              />
              <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#007bff]"></div>
            </label>
            <span className="text-[13px] font-bold text-gray-800">Party Name</span>
          </div>
          <select 
            className={`h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none ${partyNameEnabled ? 'bg-white text-gray-700' : 'text-gray-400 bg-gray-50'}`}
            disabled={!partyNameEnabled}
            value={selectedPartyName}
            onChange={(e) => setSelectedPartyName(e.target.value)}
          >
            <option value="">Select Name</option>
            {customers.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-5">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={showHsnWise}
              onChange={(e) => setShowHsnWise(e.target.checked)}
            />
            <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#007bff]"></div>
          </label>
          <span className="text-[13px] font-bold text-gray-800">Show HSN-wise</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden flex-1">
        
        {/* Header */}
        <div className="text-center py-4 border-b border-gray-200">
          <h2 className="text-[14px] text-gray-700 mb-1">GST Sales Summary</h2>
          <p className="text-[14px] font-bold text-gray-800">Period: {period}</p>
        </div>

        {/* Table */}
        <div className="p-4 w-full">
          <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse border border-black text-center">
            <thead>
              <tr>
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[8%] whitespace-nowrap">Date<br/>Invoice No.</th>
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[20%] whitespace-nowrap">Party Name</th>
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[10%] whitespace-nowrap">GSTIN</th>
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[8%] whitespace-nowrap">State</th>
                {showHsnWise && <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[8%] whitespace-nowrap">HSN Code</th>}
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[8%] whitespace-nowrap">Taxable<br/>Amount</th>
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[5%] whitespace-nowrap">GST %</th>
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[6%] whitespace-nowrap">Quantity</th>
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[6%] whitespace-nowrap">IGST</th>
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[6%] whitespace-nowrap">CGST</th>
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[6%] whitespace-nowrap">SGST</th>
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[8%] whitespace-nowrap">Sub Total</th>
                <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[9%] whitespace-nowrap">Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {summaryData.length === 0 ? (
                <tr>
                  <td colSpan={showHsnWise ? "13" : "12"} className="py-4 text-center text-[13px] text-gray-500">
                    {isLoading ? 'Loading data...' : 'No sales found for the selected period.'}
                  </td>
                </tr>
              ) : (
                summaryData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-2 border border-black text-[13px]">
                      {formatDate(row.date)}<br/>
                      <span className="text-gray-500 font-semibold">{row.invoiceNo}</span>
                    </td>
                    <td className="py-2 px-2 border border-black text-[13px]">{row.partyName}</td>
                    <td className="py-2 px-2 border border-black text-[13px]">{row.gstin}</td>
                    <td className="py-2 px-2 border border-black text-[13px]">{row.state}</td>
                    {showHsnWise && <td className="py-2 px-2 border border-black text-[13px]">{row.hsn || '-'}</td>}
                    <td className="py-2 px-2 border border-black text-[13px]">{formatNumber(row.taxableAmount)}</td>
                    <td className="py-2 px-2 border border-black text-[13px]">{row.gstPercent}%</td>
                    <td className="py-2 px-2 border border-black text-[13px]">{row.quantity}</td>
                    <td className="py-2 px-2 border border-black text-[13px]">{formatNumber(row.igst)}</td>
                    <td className="py-2 px-2 border border-black text-[13px]">{formatNumber(row.cgst)}</td>
                    <td className="py-2 px-2 border border-black text-[13px]">{formatNumber(row.sgst)}</td>
                    <td className="py-2 px-2 border border-black text-[13px]">{formatNumber(row.subTotal)}</td>
                    <td className="py-2 px-2 border border-black text-[13px]">{formatNumber(row.grandTotal)}</td>
                  </tr>
                ))
              )}
              {/* Total Row */}
              {summaryData.length > 0 && (
                <tr className="bg-gray-100">
                  <td className="py-3 px-2 border border-black text-[13px]"></td>
                  <td className="py-3 px-2 border border-black text-[13px]"></td>
                  <td className="py-3 px-2 border border-black text-[13px]"></td>
                  <td className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800">Total</td>
                  {showHsnWise && <td className="py-3 px-2 border border-black text-[13px]"></td>}
                  <td className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800">{formatNumber(totals.taxableAmount)}</td>
                  <td className="py-3 px-2 border border-black text-[13px]"></td>
                  <td className="py-3 px-2 border border-black text-[13px]"></td>
                  <td className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800">{formatNumber(totals.igst)}</td>
                  <td className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800">{formatNumber(totals.cgst)}</td>
                  <td className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800">{formatNumber(totals.sgst)}</td>
                  <td className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800">{formatNumber(totals.subTotal)}</td>
                  <td className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800">{formatNumber(totals.grandTotal)}</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Custom Range Modal */}
      {isCustomRangeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-[450px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#4F46E5] flex items-center justify-between pl-4 pr-1 py-1.5">
              <h2 className="text-[15px] text-white font-medium">Select Date Range</h2>
              <button 
                onClick={() => setIsCustomRangeModalOpen(false)}
                className="text-[#dc3545] hover:text-[#c82333] transition-colors p-1"
              >
                <X className="w-6 h-6 stroke-[3px]" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[14px] font-bold text-gray-800">From Date</label>
                  <input 
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] outline-none focus:border-blue-500 bg-[#a6cdec]"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[14px] font-bold text-gray-800">To Date</label>
                  <input 
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white px-5 py-3 flex justify-end gap-2 border-t border-gray-100">
              <button 
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    setIsCustomRangeModalOpen(false);
                    fetchSummary('Custom Range', customStartDate, customEndDate, partyNameEnabled ? selectedPartyName : '');
                  } else {
                    alert("Please select both dates");
                  }
                }}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-2 sm:p-3 footer-btns z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => navigate(-1)}
          className="bg-[#dc3545] hover:bg-[#c82333] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1 shadow-sm transition-colors"
        >
          <span className="text-[16px] leading-none mt-[-2px]">&laquo;</span> Go back
        </button>
        <button 
          onClick={handleShare}
          className="bg-[#28a745] hover:bg-[#218838] text-white text-[13px] font-medium px-3 py-1.5 rounded-[3px] flex items-center justify-center shadow-sm transition-colors"
        >
          <Share2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => window.open('https://web.whatsapp.com/', '_blank')}
          className="bg-[#28a745] hover:bg-[#218838] text-white text-[13px] font-medium px-3 py-1.5 rounded-[3px] flex items-center justify-center shadow-sm transition-colors"
        >
          <MessageCircle className="w-4 h-4 fill-white" />
        </button>
        <button 
          onClick={handleExportCSV}
          className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <Upload className="w-4 h-4" /> Export
        </button>
        <button 
          onClick={handleDownload}
          className="bg-[#343a40] hover:bg-[#23272b] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" /> Download
        </button>
      </div>

    </div>
  );
}
