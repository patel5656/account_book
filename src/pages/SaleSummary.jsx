import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsLeft, ArrowRight, Upload, Download, ExternalLink } from 'lucide-react';
import apiClient from '../api/apiClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { updateTransactionStatus } from '../api/inventory';

export function SaleSummary() {
  const navigate = useNavigate();
  const [allInvoices, setAllInvoices] = useState([]);
  const [period, setPeriod] = useState('Select');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await apiClient.get('/inventory/sales');
      if (res.data.data) {
        setAllInvoices(res.data.data);
      } else if (Array.isArray(res.data)) {
        setAllInvoices(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleHold = async (row) => {
    try {
      const newStatus = row.status === 'HOLD' ? 'UNHOLD' : 'HOLD';
      await updateTransactionStatus(row.id, newStatus);
      fetchInvoices();
    } catch (error) {
      console.error(error);
      alert('Failed to update status');
    }
  };


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

  const invoices = allInvoices.filter(inv => {
    if (!startDate || !endDate) return true;
    const invDate = new Date(inv.date);
    invDate.setHours(0,0,0,0);
    const start = new Date(startDate);
    start.setHours(0,0,0,0);
    const end = new Date(endDate);
    end.setHours(23,59,59,999);
    return invDate >= start && invDate <= end;
  });

  const totalSale = invoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalPaid = invoices.reduce((acc, curr) => acc + (curr.status === 'PAID' ? curr.totalAmount : 0), 0);
  const totalDue = totalSale - totalPaid;

  const getFormattedDate = (dateString) => {
    const date = dateString ? new Date(dateString) : new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const currentDate = getFormattedDate();
  const displayStart = startDate ? getFormattedDate(startDate) : currentDate;
  const displayEnd = endDate ? getFormattedDate(endDate) : currentDate;

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Sales Summary\nFrom ${displayStart} to ${displayEnd}\nTotal Sale: ${totalSale}\nSale Return: 0\nTotal Due: ${totalDue}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleExport = () => {
    const csvContent = [
      ['#', 'Date', 'Invoice No', 'Party Name', 'Type', 'Total Sale', 'Sale Return', 'Paid Amount', 'Total Due'],
      ...invoices.map((inv, idx) => [
        idx + 1,
        new Date(inv.date).toLocaleDateString(),
        inv.invoiceNo,
        inv.customer?.name || 'Cash',
        inv.type || 'SALES',
        (inv.totalAmount || 0).toFixed(2),
        '0.00',
        (inv.status === 'PAID' ? inv.totalAmount : 0).toFixed(2),
        (inv.status === 'PAID' ? 0 : inv.totalAmount).toFixed(2)
      ]),
      ['', '', '', 'Totals :', '', totalSale.toFixed(2), '0.00', totalPaid.toFixed(2), totalDue.toFixed(2)]
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "sale_summary.csv";
    link.click();
  };

  const handleDownload = () => {
    const doc = new jsPDF('landscape');
    
    doc.setFontSize(16);
    doc.text('Sales Summary', 14, 15);
    
    doc.setFontSize(10);
    doc.text(`From ${displayStart} to ${displayEnd}`, 14, 22);

    const tableColumn = ['#', 'Date', 'Invoice No', 'Party Name', 'Type', 'Total Sale', 'Sale Return', 'Paid Amount', 'Total Due'];
    
    const tableRows = invoices.map((inv, idx) => [
      idx + 1,
      new Date(inv.date).toLocaleDateString(),
      inv.invoiceNo,
      inv.customer?.name || 'Cash',
      inv.type || 'SALES',
      (inv.totalAmount || 0).toFixed(2),
      '0.00',
      (inv.status === 'PAID' ? inv.totalAmount : 0).toFixed(2),
      (inv.status === 'PAID' ? 0 : inv.totalAmount).toFixed(2)
    ]);

    tableRows.push([
      '', '', '', 'Totals :', '',
      totalSale.toFixed(2),
      '0.00',
      totalPaid.toFixed(2),
      totalDue.toFixed(2)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 9 },
      didParseCell: function (data) {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    doc.save('sale_summary_download.pdf');
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-3 flex flex-col relative pb-[70px]">
      <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden flex-1">
        
        {/* Top Control Bar */}
        <div className="p-4 border-b border-gray-200 print:hidden">
          <div className="flex flex-col sm:flex-row gap-6">
            
            {/* Select Period */}
            <div className="flex flex-col gap-1 w-full sm:max-w-[300px]">
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
            <div className="flex flex-col gap-1 w-full max-w-[min(92vw,500px)]">
              <div className="flex flex-wrap items-center gap-2 px-1">
                <div className="w-[32px] h-[16px] bg-gray-300 rounded-full relative cursor-pointer border border-gray-400">
                  <div className="w-[12px] h-[12px] bg-white rounded-full absolute top-[1px] left-[1px]"></div>
                </div>
                <label className="text-[13px] font-bold text-gray-800">Party Name</label>
              </div>
              <select className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-400 bg-white">
                <option>Select Name</option>
              </select>
            </div>

          </div>
        </div>

        {/* Report Content */}
        <div className="p-4">
          <div className="w-full">
            {/* Title */}
            <div className="text-center mb-1">
              <h3 className="text-[14px] font-normal text-gray-800">Sales Summary</h3>
              <p className="text-[14px] font-bold text-gray-800">From {displayStart} to {displayEnd}</p>
            </div>

            {/* Table */}
            <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse border border-gray-800 mt-1">
              <thead>
                <tr>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[40px] text-center whitespace-nowrap">#</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[100px] text-center whitespace-nowrap">Date</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[120px] text-center whitespace-nowrap">Invoice No</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 text-center whitespace-nowrap">Party Name</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[80px] text-center whitespace-nowrap">Type</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[100px] text-center whitespace-nowrap">Total Sale</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[100px] text-center whitespace-nowrap">Sale Return</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[100px] text-center whitespace-nowrap">Paid Amount</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[100px] text-center whitespace-nowrap">Total Due</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv, idx) => (
                  <tr key={inv.id}>
                    <td className="border border-gray-800 py-1 px-2 text-center text-[13px]">{idx + 1}</td>
                    <td className="border border-gray-800 py-1 px-2 text-center text-[13px]">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="border border-gray-800 py-1 px-2 text-center text-[13px]">{inv.invoiceNo}</td>
                    <td className="border border-gray-800 py-1 px-2 text-center text-[13px]">{inv.customer?.name || 'Cash'}</td>
                    <td className="border border-gray-800 py-1 px-2 text-center text-[13px]">
                      <div className="flex items-center justify-center gap-2">
                        <span>{inv.type || 'SALES'}</span>
                        <label className="relative inline-flex items-center cursor-pointer" title="Toggle Hold/Unhold">
                          <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={inv.status === 'HOLD'}
                            onChange={() => handleToggleHold(inv)}
                          />
                          <div className="w-7 h-3.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
                        </label>
                      </div>
                    </td>
                    <td className="border border-gray-800 py-1 px-2 text-right text-[13px]">₹{(inv.totalAmount || 0).toFixed(2)}</td>
                    <td className="border border-gray-800 py-1 px-2 text-right text-[13px]">0.00</td>
                    <td className="border border-gray-800 py-1 px-2 text-right text-[13px]">₹{(inv.status === 'PAID' ? inv.totalAmount : 0).toFixed(2)}</td>
                    <td className="border border-gray-800 py-1 px-2 text-right text-[13px]">₹{(inv.status === 'PAID' ? 0 : inv.totalAmount).toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-100">
                  <td className="border border-gray-800 py-1 px-2 h-[26px]"></td>
                  <td className="border border-gray-800 py-1 px-2"></td>
                  <td className="border border-gray-800 py-1 px-2"></td>
                  <td className="border border-gray-800 py-1 px-2">
                    <span className="font-bold text-[13px] text-gray-900">Totals :</span>
                  </td>
                  <td className="border border-gray-800 py-1 px-2"></td>
                  <td className="border border-gray-800 py-1 px-2 text-right">
                    <span className="font-bold text-[13px] text-gray-900">₹{totalSale.toFixed(2)}</span>
                  </td>
                  <td className="border border-gray-800 py-1 px-2 text-right">
                    <span className="font-bold text-[13px] text-gray-900">0.00</span>
                  </td>
                  <td className="border border-gray-800 py-1 px-2 text-right">
                    <span className="font-bold text-[13px] text-gray-900">₹{totalPaid.toFixed(2)}</span>
                  </td>
                  <td className="border border-gray-800 py-1 px-2 text-right">
                    <span className="font-bold text-[13px] text-gray-900">₹{totalDue.toFixed(2)}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-2 sm:p-3 footer-btns print:hidden z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1 shadow-sm transition-colors"
          >
            <span className="text-[16px] leading-none mt-[-2px]">&laquo;</span> Go back
          </button>
          <button 
            onClick={() => alert('Forward action clicked')}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] shadow-sm transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button 
            onClick={handleWhatsApp}
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
          <button 
            onClick={handleDownload}
            className="bg-[#343a40] hover:bg-[#23272b] text-white text-[13px] font-bold px-3 py-1.5 rounded-[3px] flex items-center gap-1 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" strokeWidth={2.5} /> Download
          </button>
        </div>

      </div>
    </div>
  );
}

// Custom Whatsapp SVG Icon since lucide might not have the exact brand icon
const WhatsappIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);
