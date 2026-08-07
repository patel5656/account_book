import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCategorywiseSale } from '../api/financial';
import apiClient from '../api/apiClient';

export function CategorywiseSaleSummary() {
  const navigate = useNavigate();

  const [period, setPeriod] = useState('Select');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('all');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Date calculation states for display
  const [displayStartDate, setDisplayStartDate] = useState('');
  const [displayEndDate, setDisplayEndDate] = useState('');

  useEffect(() => {
    // Fetch customers
    apiClient.get('/customers')
      .then(res => setCustomers(res.data?.data || []))
      .catch(err => console.error("Failed to fetch customers", err));
  }, []);

  useEffect(() => {
    if (period === 'Custom Range' && (!startDate || !endDate)) {
      return;
    }
    fetchReport();
  }, [period, startDate, endDate, selectedCustomerId]);

  const handlePeriodChange = (e) => {
    const val = e.target.value;
    setPeriod(val);
    const today = new Date();
    let start = '';
    let end = '';

    if (val === 'This Month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (val === 'Last Month') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (val === 'This Quarter') {
      const currentQuarter = Math.floor(today.getMonth() / 3);
      start = new Date(today.getFullYear(), currentQuarter * 3, 1);
      end = new Date(today.getFullYear(), currentQuarter * 3 + 3, 0);
    } else if (val === 'Last Quarter') {
      let currentQuarter = Math.floor(today.getMonth() / 3) - 1;
      let year = today.getFullYear();
      if (currentQuarter < 0) {
        currentQuarter = 3;
        year -= 1;
      }
      start = new Date(year, currentQuarter * 3, 1);
      end = new Date(year, currentQuarter * 3 + 3, 0);
    } else if (val === 'Custom Range') {
      start = '';
      end = '';
    }

    if (start && end) {
      const formatTime = (d) => {
        const date = new Date(d);
        const y = date.getFullYear();
        const m = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${y}-${m}-${day}`;
      };
      setStartDate(formatTime(start));
      setEndDate(formatTime(end));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      let fetchStart = startDate;
      let fetchEnd = endDate;

      if (!fetchStart || !fetchEnd) {
        const today = new Date();
        const formatTime = (d) => {
          const y = d.getFullYear();
          const m = (d.getMonth() + 1).toString().padStart(2, '0');
          const day = d.getDate().toString().padStart(2, '0');
          return `${y}-${m}-${day}`;
        };
        fetchStart = formatTime(today);
        fetchEnd = formatTime(today);
      }

      const getFormattedDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
      };

      setDisplayStartDate(getFormattedDate(fetchStart));
      setDisplayEndDate(getFormattedDate(fetchEnd));

      const res = await getCategorywiseSale(
        fetchStart,
        fetchEnd,
        selectedCustomerId
      );

      setReportData(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch categorywise sale", error);
    } finally {
      setLoading(false);
    }
  };

  const totalQty = reportData.reduce((sum, item) => sum + (item.totalQuantity || 0), 0);
  const totalAmt = reportData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const totalDisc = reportData.reduce((sum, item) => sum + (item.totalDiscount || 0), 0);

  const handleExport = () => {
    const doc = new jsPDF();
    
    // Add professional header
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Categorywise Sales Summary', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateText = `From ${displayStartDate} to ${displayEndDate}`;
    doc.text(`Period: ${dateText}`, 14, 30);
    
    // Prepare table data
    const tableColumn = ["#", "Category Name", "Total Quantity", "Total Amount (Rs)", "Total Discount (Rs)"];
    const tableRows = [];

    reportData.forEach((row, i) => {
      tableRows.push([
        i + 1,
        row.categoryName,
        row.totalQuantity,
        row.totalAmount?.toFixed(2),
        row.totalDiscount?.toFixed(2)
      ]);
    });

    // Add totals row
    tableRows.push([
      '', 
      'Totals :', 
      totalQty.toString(), 
      totalAmt?.toFixed(2), 
      totalDisc?.toFixed(2)
    ]);

    // Generate table
    autoTable(doc, {
      startY: 38,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 38 },
      didParseCell: function(data) {
        // Highlight totals row
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
        // Right align numbers
        if (data.column.index > 1) {
          data.cell.styles.halign = 'right';
        }
      }
    });

    // Save the PDF
    doc.save(`categorywise_sale_summary_${new Date().getTime()}.pdf`);
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-3 flex flex-col relative pb-[70px]">
      <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden flex-1">
        
        {/* Top Control Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row flex-1 gap-4 sm:gap-6">
              {/* Select Period */}
              <div className="flex flex-col gap-1 w-full sm:max-w-[250px]">
                <label className="text-[13px] font-bold text-gray-800 px-1">Select Period</label>
                <select 
                  value={period}
                  onChange={handlePeriodChange}
                  className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white"
                >
                  <option value="Select">Select</option>
                  <option value="This Month">This Month</option>
                  <option value="Last Month">Last Month</option>
                  <option value="This Quarter">This Quarter</option>
                  <option value="Last Quarter">Last Quarter</option>
                  <option value="Custom Range">Custom Range</option>
                </select>
              </div>

              {period === 'Custom Range' && (
                <>
                  <div className="flex flex-col gap-1 w-full sm:max-w-[150px]">
                    <label className="text-[13px] font-bold text-gray-800 px-1">From Date</label>
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)} 
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white" 
                    />
                  </div>
                  <div className="flex flex-col gap-1 w-full sm:max-w-[150px]">
                    <label className="text-[13px] font-bold text-gray-800 px-1">To Date</label>
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)} 
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white" 
                    />
                  </div>
                </>
              )}

              {/* Party Name */}
              <div className="flex flex-col gap-1 w-full sm:max-w-[400px]">
                <div className="flex flex-wrap items-center gap-2 px-1">
                  <div className="w-[32px] h-[16px] bg-gray-300 rounded-full relative cursor-pointer border border-gray-400">
                    <div className="w-[12px] h-[12px] bg-white rounded-full absolute top-[1px] left-[1px]"></div>
                  </div>
                  <label className="text-[13px] font-bold text-gray-800">Party Name</label>
                </div>
                <select 
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-800 bg-white"
                >
                  <option value="all">All Parties</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Discount Type */}
            <div className="flex flex-col gap-1 w-full sm:max-w-[200px]">
              <label className="text-[13px] font-bold text-gray-800 px-1 text-right">Discount Type</label>
              <select className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white">
                <option>Applied Discount</option>
              </select>
            </div>

          </div>
        </div>

        {/* Report Content */}
        <div className="p-4">
          <div className="w-full">
            {/* Title */}
            <div className="text-center mb-1">
              <h3 className="text-[14px] font-normal text-gray-600">Categorywise Sales Summary</h3>
              <p className="text-[14px] font-bold text-gray-800">
                From {displayStartDate} to {displayEndDate}
              </p>
            </div>

            {/* Table */}
            <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-800 mt-1">
              <thead>
                <tr>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1.5 px-2 w-[40px] text-center whitespace-nowrap">#</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1.5 px-2 text-center whitespace-nowrap">Category Name</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1.5 px-2 w-[120px] text-center whitespace-nowrap">Total Quantity</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1.5 px-2 w-[120px] text-center whitespace-nowrap">Total Amount</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1.5 px-2 w-[120px] text-center whitespace-nowrap">Total Discount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="border border-gray-800 py-4 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-500" />
                    </td>
                  </tr>
                ) : reportData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="border border-gray-800 py-4 text-center text-gray-500 text-[13px]">
                      No sales found for the selected criteria.
                    </td>
                  </tr>
                ) : (
                  reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="border border-gray-800 py-1.5 px-2 text-center">{idx + 1}</td>
                      <td className="border border-gray-800 py-1.5 px-2">{row.categoryName}</td>
                      <td className="border border-gray-800 py-1.5 px-2 text-right">{row.totalQuantity}</td>
                      <td className="border border-gray-800 py-1.5 px-2 text-right">{row.totalAmount?.toFixed(2)}</td>
                      <td className="border border-gray-800 py-1.5 px-2 text-right">{row.totalDiscount?.toFixed(2)}</td>
                    </tr>
                  ))
                )}
                {reportData.length > 0 && (
                  <tr>
                    <td className="border border-gray-800 py-1.5 px-2"></td>
                    <td className="border border-gray-800 py-1.5 px-2 text-right pr-4">
                      <span className="font-bold text-[13px] text-gray-900">Totals :</span>
                    </td>
                    <td className="border border-gray-800 py-1.5 px-2 text-right">
                      <span className="font-bold text-[13px] text-gray-900">{totalQty}</span>
                    </td>
                    <td className="border border-gray-800 py-1.5 px-2 text-right pr-2">
                      <span className="font-bold text-[13px] text-gray-900">{totalAmt?.toFixed(2)}</span>
                    </td>
                    <td className="border border-gray-800 py-1.5 px-2 text-right pr-2">
                      <span className="font-bold text-[13px] text-gray-900">{totalDisc?.toFixed(2)}</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[220px] bg-white border-t border-gray-200 p-3 flex justify-between items-center z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex gap-2">
          {/* Add settings/print buttons if needed */}
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-6 py-2 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}
