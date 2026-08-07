import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getBrandwiseSale } from '../api/financial';
import apiClient from '../api/apiClient';

export function BrandwiseSaleSummary() {
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

      const res = await getBrandwiseSale(
        fetchStart,
        fetchEnd,
        selectedCustomerId
      );

      setReportData(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch brandwise sale", error);
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
    doc.text('Brandwise Sales Summary', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateText = `From ${displayStartDate} to ${displayEndDate}`;
    doc.text(`Period: ${dateText}`, 14, 30);
    
    // Prepare table data
    const tableColumn = ["#", "Brand Name", "Total Quantity", "Total Amount (Rs)", "Total Discount (Rs)"];
    const tableRows = [];

    reportData.forEach((row, i) => {
      tableRows.push([
        i + 1,
        row.brandName,
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
    doc.save(`brandwise_sale_summary_${new Date().getTime()}.pdf`);
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
              <h3 className="text-[14px] font-normal text-gray-600">Brandwise Sales Summary</h3>
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
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1.5 px-2 text-center whitespace-nowrap">Brand Name</th>
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
                      <td className="border border-gray-800 py-1.5 px-2">{row.brandName}</td>
                      <td className="border border-gray-800 py-1.5 px-2 text-right">{row.totalQuantity}</td>
                      <td className="border border-gray-800 py-1.5 px-2 text-right">{row.totalAmount?.toFixed(2)}</td>
                      <td className="border border-gray-800 py-1.5 px-2 text-right">{row.totalDiscount?.toFixed(2)}</td>
                    </tr>
                  ))
                )}
                <tr className="bg-gray-100">
                  <td className="border border-gray-800 py-1.5 px-2"></td>
                  <td className="border border-gray-800 py-1.5 px-2 text-right pr-4">
                    <span className="font-bold text-[13px] text-gray-900">Totals :</span>
                  </td>
                  <td className="border border-gray-800 py-1.5 px-2 text-right">
                    <span className="font-bold text-[13px] text-gray-900">{totalQty}</span>
                  </td>
                  <td className="border border-gray-800 py-1.5 px-2 text-right">
                    <span className="font-bold text-[13px] text-gray-900">{totalAmt?.toFixed(2)}</span>
                  </td>
                  <td className="border border-gray-800 py-1.5 px-2 text-right">
                    <span className="font-bold text-[13px] text-gray-900">{totalDisc?.toFixed(2)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>

      </div>

      {/* Footer Buttons */}
      <div className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-2 sm:p-3 footer-btns z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => navigate(-1)}
          className="bg-[#dc3545] hover:bg-[#c82333] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1 shadow-sm transition-colors"
        >
          <span className="text-[16px] leading-none mt-[-2px]">&laquo;</span> Go back
        </button>
        <button 
          onClick={() => window.open('https://web.whatsapp.com/', '_blank')}
          className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] shadow-sm transition-colors"
        >
          <WhatsappIcon className="w-4 h-4" />
        </button>
        <button 
          onClick={handleExport}
          className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 text-[13px] font-bold px-3 py-1.5 rounded-[3px] flex items-center gap-1 shadow-sm transition-colors"
        >
          <Upload className="w-4 h-4" strokeWidth={2.5} /> Export
        </button>
      </div>

    </div>
  );
}

// Custom Whatsapp SVG Icon
const WhatsappIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);
