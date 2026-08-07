import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronsLeft, ArrowRight, Upload, Download, ExternalLink } from 'lucide-react';
import apiClient from '../api/apiClient';

export function PurchaseSummary() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);

  const [selectedPeriod, setSelectedPeriod] = useState('Select');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await apiClient.get('/inventory/PURCHASE');
      if (res.data.data) {
        setInvoices(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getFilteredInvoices = () => {
    let filtered = invoices;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    filtered = filtered.filter(item => {
      if (!item.date) return true;
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);

      switch (selectedPeriod) {
        case 'This Month': {
          return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
        }
        case 'Last Month': {
          let lastMonth = today.getMonth() - 1;
          let year = today.getFullYear();
          if (lastMonth < 0) {
            lastMonth = 11;
            year--;
          }
          return itemDate.getMonth() === lastMonth && itemDate.getFullYear() === year;
        }
        case 'This Quarter': {
          const currentQuarter = Math.floor(today.getMonth() / 3);
          const itemQuarter = Math.floor(itemDate.getMonth() / 3);
          return currentQuarter === itemQuarter && today.getFullYear() === itemDate.getFullYear();
        }
        case 'Last Quarter': {
          let lastQuarter = Math.floor(today.getMonth() / 3) - 1;
          let year = today.getFullYear();
          if (lastQuarter < 0) {
            lastQuarter = 3;
            year--;
          }
          const itemQuarter = Math.floor(itemDate.getMonth() / 3);
          return lastQuarter === itemQuarter && year === itemDate.getFullYear();
        }
        case 'Custom Range': {
          if (fromDate && toDate) {
            const start = new Date(fromDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            return itemDate >= start && itemDate <= end;
          }
          return true;
        }
        default:
          return true;
      }
    });

    return filtered;
  };

  const filteredInvoices = getFilteredInvoices();
  const totalPurchase = filteredInvoices.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalPaid = filteredInvoices.reduce((acc, curr) => acc + (curr.status === 'PAID' ? curr.totalAmount : 0), 0);
  const totalDue = totalPurchase - totalPaid;


  const getFormattedDate = () => {
    const date = new Date();
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  const currentDate = getFormattedDate();

  const getDisplayDateRange = () => {
    if (selectedPeriod === 'Custom Range' && fromDate && toDate) {
      const formatDate = (dStr) => {
        const d = new Date(dStr);
        const day = d.getDate().toString().padStart(2, '0');
        const month = d.toLocaleString('default', { month: 'short' });
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
      };
      return `From ${formatDate(fromDate)} to ${formatDate(toDate)}`;
    }
    return `From ${currentDate} to ${currentDate}`;
  };

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Purchase Summary\nFrom ${currentDate} to ${currentDate}\nTotal Purchase: 0\nPurchase Return: 0\nTotal Due: 0`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  };

  const handleExport = () => {
    const csvContent = [
      ['#', 'Date', 'Invoice No', 'Party Name', 'Type', 'Total Purchase', 'Purchase Return', 'Paid Amount', 'Total Due'],
      ['', '', '', 'Totals :', '', '0', '0', '0', '0']
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "purchase_summary.csv";
    link.click();
  };

  const handleDownload = () => {
    const csvContent = [
      ['#', 'Date', 'Invoice No', 'Party Name', 'Type', 'Total Purchase', 'Purchase Return', 'Paid Amount', 'Total Due'],
      ['', '', '', 'Totals :', '', '0', '0', '0', '0']
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "purchase_summary_download.csv";
    link.click();
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
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
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

            {selectedPeriod === 'Custom Range' && (
              <div className="flex items-end gap-2">
                <div className="flex flex-col gap-1 w-full sm:max-w-[150px]">
                  <label className="text-[13px] font-bold text-gray-800 px-1">From</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full sm:max-w-[150px]">
                  <label className="text-[13px] font-bold text-gray-800 px-1">To</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white"
                  />
                </div>
              </div>
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
              <h3 className="text-[14px] font-normal text-gray-800">Purchase Summary</h3>
              <p className="text-[14px] font-bold text-gray-800">{getDisplayDateRange()}</p>
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
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[100px] text-center whitespace-nowrap">Total Purchase</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[100px] text-center whitespace-nowrap">Purchase Return</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[100px] text-center whitespace-nowrap">Paid Amount</th>
                  <th className="border border-gray-800 text-[12px] font-bold text-gray-900 py-1 px-2 w-[100px] text-center whitespace-nowrap">Total Due</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv, idx) => (
                  <tr key={inv.id}>
                    <td className="border border-gray-800 py-1 px-2 text-center text-[13px]">{idx + 1}</td>
                    <td className="border border-gray-800 py-1 px-2 text-center text-[13px]">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="border border-gray-800 py-1 px-2 text-center text-[13px]">{inv.invoiceNo}</td>
                    <td className="border border-gray-800 py-1 px-2 text-center text-[13px]">{inv.customer?.name || 'Cash'}</td>
                    <td className="border border-gray-800 py-1 px-2 text-center text-[13px]">{inv.type}</td>
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
                    <span className="font-bold text-[13px] text-gray-900">₹{totalPurchase.toFixed(2)}</span>
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
