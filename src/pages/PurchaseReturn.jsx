import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  X, 
  Plus, 
  BarChart2,
  FileText,
  Search,
  SlidersHorizontal,
  Calendar,
  ShoppingCart,
  Coins,
  Calculator,
  Info,
  Eye,
  Printer,
  Trash2,
  Edit
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { CollectionReportModal } from '../components/CollectionReportModal';

export function PurchaseReturn() {
  const navigate = useNavigate();
  const { formatAmount } = useSettings();
  const [companyToggle, setCompanyToggle] = useState(false);
  const [collectionModalOpen, setCollectionModalOpen] = useState(false);
  const [loadingSheetModalOpen, setLoadingSheetModalOpen] = useState(false);
  const [isToggleOn, setIsToggleOn] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('Today');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [customRangeModalOpen, setCustomRangeModalOpen] = useState(false);
  const [tempFromDate, setTempFromDate] = useState('');
  const [tempToDate, setTempToDate] = useState('');

  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    if (dateFilter === 'All') {
      setFromDate('');
      setToDate('');
      return;
    }

    const today = new Date();
    let start = new Date(today);
    let end = new Date(today);

    if (dateFilter === 'Today') {
      // today
    } else if (dateFilter === 'Yesterday') {
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
    } else if (dateFilter === 'Last 7 Days') {
      start.setDate(today.getDate() - 6);
    } else if (dateFilter === 'Last 30 Days') {
      start.setDate(today.getDate() - 29);
    } else if (dateFilter === 'This Month') {
      start.setDate(1);
    } else if (dateFilter === 'Last Month') {
      start.setMonth(today.getMonth() - 1);
      start.setDate(1);
      end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
    } else if (dateFilter === 'Custom Range') {
      setTempFromDate(fromDate);
      setTempToDate(toDate);
      setCustomRangeModalOpen(true);
      return;
    }

    const toLocalISOString = (d) => {
      const offset = d.getTimezoneOffset() * 60000;
      return new Date(d.getTime() - offset).toISOString().split('T')[0];
    };

    setFromDate(toLocalISOString(start));
    setToDate(toLocalISOString(end));
  }, [dateFilter]);

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
  };

  const dateLabel = dateFilter === 'All' 
    ? '(All Dates)' 
    : (fromDate && toDate 
      ? (fromDate === toDate ? `(${formatDisplayDate(fromDate)})` : `(${formatDisplayDate(fromDate)} to ${formatDisplayDate(toDate)})`)
      : (fromDate ? `(From ${formatDisplayDate(fromDate)})` : (toDate ? `(Until ${formatDisplayDate(toDate)})` : '(All Dates)')));

  const fetchInvoices = async () => {
    try {
      const res = await apiClient.get('/inventory/PURCHASE_RETURN');
      if (res.data.data) {
        setInvoices(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch purchase returns', error);
    }
  };

  const filteredData = invoices.filter(item => {
    let match = true;
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      if (
        !(item.customer?.name || '').toLowerCase().includes(searchLower) &&
        !(item.invoiceNo || '').toLowerCase().includes(searchLower)
      ) {
        match = false;
      }
    }
    if (dateFilter !== 'All' && item.date) {
      const itemDate = new Date(item.date);
      if (fromDate) {
        const start = new Date(fromDate + 'T00:00:00');
        if (itemDate < start) match = false;
      }
      if (toDate) {
        const end = new Date(toDate + 'T23:59:59.999');
        if (itemDate > end) match = false;
      }
    }
    return match;
  });

  const totalAmt = filteredData.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);
  const totalPaid = filteredData.reduce((acc, curr) => acc + (curr.status === 'PAID' ? curr.totalAmount : 0), 0);
  const totalBal = totalAmt - totalPaid;

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm("Are you sure you want to delete this invoice?")) return;
    try {
      await apiClient.delete(`/inventory/${id}`);
      fetchInvoices();
    } catch (err) {
      console.error(err);
      alert("Failed to delete invoice");
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Purchase Return Summary</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setCollectionModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#6c757d] hover:bg-[#5a6268] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm"
            >
              <BarChart2 className="w-4 h-4" />
              Today's Collection
            </button>
            <button 
              onClick={() => setLoadingSheetModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <FileText className="w-4 h-4" strokeWidth={2.5} />
              Loading Sheet
            </button>
            <button 
              onClick={() => navigate('/admin/create_invoices/company_purchase_return')}
              className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Create New
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors shadow-sm"
            >
              <X className="w-5 h-5 font-bold" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="p-3 bg-white border-b border-gray-200">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center px-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-gray-800">Company Name</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold text-gray-800">Date</span>
                <span className="text-[12px] font-medium text-blue-500">{dateLabel}</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex-1 w-full">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Supplier/Customer Name..."
                  className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none bg-white text-gray-800 placeholder-gray-400 focus:border-[#4F46E5]"
                />
              </div>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <select 
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none text-gray-800 bg-white shadow-sm min-w-[130px] cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Today">Today</option>
                  <option value="Yesterday">Yesterday</option>
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Last Month">Last Month</option>
                  <option value="This Month">This Month</option>
                  <option value="Custom Range">Custom Range</option>
                </select>

                <button className="flex items-center gap-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm whitespace-nowrap">
                  <Search className="w-4 h-4" />
                  Search
                </button>
                <button className="bg-[#6c757d] hover:bg-[#5a6268] text-white p-1.5 rounded-[3px] transition-colors shadow-sm">
                  <SlidersHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Data Totals Header */}
        <div className="bg-[#343a40] text-white flex flex-col sm:grid sm:grid-cols-3 text-center border-b border-gray-600 py-1.5">
           <div className="flex flex-col items-center justify-center">
             <span className="font-bold text-[13px] tracking-wide">TOTAL AMT:</span>
             <span className="font-bold text-[14px]">{formatAmount(totalAmt)}</span>
           </div>
           <div className="flex flex-col items-center justify-center">
             <span className="font-bold text-[13px] tracking-wide">TOTAL PAID:</span>
             <span className="font-bold text-[14px]">{formatAmount(totalPaid)}</span>
           </div>
           <div className="flex flex-col items-center justify-center">
             <span className="font-bold text-[13px] tracking-wide">BALANCE:</span>
             <span className="font-bold text-[14px]">{formatAmount(totalBal)}</span>
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-[#f0f2f5] overflow-auto custom-scrollbar p-3">
          <div className="max-w-[1200px] mx-auto space-y-3">
            {filteredData.map((invoice, index) => {
              const paidAmount = invoice.status === 'PAID' ? invoice.totalAmount : 0;
              const balanceAmount = invoice.totalAmount - paidAmount;
              const currentBalance = invoice.customer?.currentBalance || invoice.totalAmount;
              const formattedDate = formatDisplayDate(invoice.date);

              return (
                <div key={invoice.id} className="bg-white rounded-[5px] shadow-sm border border-gray-200 p-3">
                  <div className="flex justify-between items-start">
                    
                    {/* Left Side */}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                        <span className="font-bold text-[14px] text-gray-800">{index + 1}.</span>
                        <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer rounded-sm border-gray-300" />
                        <span className="text-[12.5px] ml-1">#Invoice No : {invoice.invoiceNo}</span>
                      </div>
                      <div className="text-[15px] font-medium text-gray-700 leading-tight">
                        {invoice.customer?.name || 'Unknown Supplier'}
                      </div>
                      <div className="text-[12px] font-bold text-gray-800 mt-1">
                        User : {invoice.user?.name || 'SUPERADMIN'}
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex flex-col items-end text-right">
                      <span className="text-[12.5px] text-gray-500 mb-1">{formattedDate}</span>
                      <span className="text-[18px] font-bold text-gray-900 leading-none mb-1">
                        {formatAmount(invoice.totalAmount)}
                      </span>
                      <span className="text-[11.5px] text-gray-500 leading-tight">
                        Paid : {formatAmount(paidAmount)}
                      </span>
                      <span className="text-[11.5px] font-bold text-gray-800 leading-tight">
                        Balance : {formatAmount(balanceAmount)}
                      </span>
                      <span className="text-[11.5px] text-gray-500 leading-tight mt-0.5">
                        Current Balance : {formatAmount(currentBalance)}
                      </span>
                    </div>

                  </div>

                  {/* Actions Bottom Bar */}
                  <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center px-1">
                    <button 
                      onClick={() => window.open('/bill/' + invoice.invoiceNo, '_blank')}
                      className="text-[#ffc107] border border-[#ffc107] hover:bg-[#fff9e6] px-4 py-1.5 rounded-[4px] text-[13px] font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-4 h-4" /> Print
                    </button>
                    <button 
                      onClick={() => navigate('/admin/create_invoices/company_purchase_return?id=' + invoice.id)}
                      className="text-[#17a2b8] border border-[#17a2b8] hover:bg-[#eaf6f8] px-4 py-1.5 rounded-[4px] text-[13px] font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="text-[#dc3545] border border-[#dc3545] hover:bg-[#fdf2f3] px-4 py-1.5 rounded-[4px] text-[13px] font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
            
            {filteredData.length === 0 && (
              <div className="bg-white p-8 text-center text-gray-500 rounded-[5px] shadow-sm border border-gray-200">
                No results found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>

      </div>

      <CollectionReportModal 
        isOpen={collectionModalOpen} 
        onClose={() => setCollectionModalOpen(false)} 
      />

      {/* Loading Sheet Modal */}
      {loadingSheetModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">
            
            {/* Modal Header */}
            <div className="bg-[#ffc107] px-4 py-3 flex items-center justify-between">
              <h3 className="text-gray-900 font-medium text-[16px]">Select Invoices for Loading Sheet</h3>
              <button onClick={() => setLoadingSheetModalOpen(false)} className="text-[#dc3545] hover:text-red-700 transition-colors">
                <X className="w-7 h-7 font-bold" strokeWidth={4} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col p-4 overflow-hidden">
              {/* Actions row */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-[14px] text-gray-700">Select Invoices</span>
                <div className="flex flex-wrap items-center gap-2">
                  <button 
                    onClick={() => setSelectedInvoices(filteredData.map(inv => inv.id))}
                    className="border border-[#007bff] text-[#007bff] hover:bg-blue-50 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={() => setSelectedInvoices([])}
                    className="border border-gray-400 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
              
              {/* Filter */}
              <div className="flex flex-col gap-1 mb-4">
                <label className="text-[14px] font-bold text-gray-800">Filter by Salesman</label>
                <select className="min-w-0 border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] text-gray-500 outline-none w-full shadow-sm bg-white">
                  <option>Select Salesman</option>
                </select>
              </div>

              {/* Data Table */}
              <div className="flex-1 overflow-auto border border-gray-200">
                <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full text-left border-collapse">
                  <thead className="bg-[#343a40] text-white sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-[14px] font-bold w-[40px] border-r border-gray-600 whitespace-nowrap">#</th>
                      <th className="px-3 py-2 text-[14px] font-bold border-r border-gray-600 whitespace-nowrap">Invoice No</th>
                      <th className="px-3 py-2 text-[14px] font-bold border-r border-gray-600 whitespace-nowrap">Party Name</th>
                      <th className="px-3 py-2 text-[14px] font-bold border-r border-gray-600 whitespace-nowrap">Date</th>
                      <th className="px-3 py-2 text-[14px] font-bold whitespace-nowrap">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((row, index) => (
                        <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer" onClick={() => {
                          if (selectedInvoices.includes(row.id)) {
                            setSelectedInvoices(selectedInvoices.filter(id => id !== row.id));
                          } else {
                            setSelectedInvoices([...selectedInvoices, row.id]);
                          }
                        }}>
                          <td className="px-3 py-2 text-[13px] border-r border-gray-100">
                            <input 
                              type="checkbox" 
                              checked={selectedInvoices.includes(row.id)}
                              readOnly
                              className="cursor-pointer" 
                            />
                          </td>
                          <td className="px-3 py-2 text-[13px] text-gray-800 border-r border-gray-100">{row.invoiceNo}</td>
                          <td className="px-3 py-2 text-[13px] font-medium text-gray-800 border-r border-gray-100">{row.customer?.name || 'Cash'}</td>
                          <td className="px-3 py-2 text-[13px] text-gray-600 border-r border-gray-100">{new Date(row.date).toLocaleDateString()}</td>
                          <td className="px-3 py-2 text-[13px] font-bold text-gray-800">₹{row.totalAmount?.toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500 text-[14px]">No invoices available for Loading Sheet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
          </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-[#f8f9fa] border-t border-gray-200 px-4 py-3 flex justify-between items-center">
              <div className="text-[14px] text-gray-600">
                Selected: {selectedInvoices.length} of {filteredData.length}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => setLoadingSheetModalOpen(false)} 
                  className="bg-[#6c757d] hover:bg-[#5a6268] text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    if (selectedInvoices.length === 0) return alert('Select invoices first');
                    const selectedData = filteredData.filter(inv => selectedInvoices.includes(inv.id));
                    let text = "Loading Sheet Details:\n\n";
                    selectedData.forEach((inv, i) => {
                      text += `${i + 1}. Invoice: ${inv.invoiceNo} | Party: ${inv.customer?.name || 'Cash'} | Amount: Rs. ${inv.totalAmount?.toFixed(2)}\n`;
                    });
                    const url = `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                    window.open(url, '_blank');
                  }}
                  className="bg-[#28a745] hover:bg-[#218838] opacity-80 text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
                >
                  Send WhatsApp PDFs
                </button>
                <button 
                  onClick={async () => {
                    if (selectedInvoices.length === 0) return alert('Select invoices first');
                    try {
                      const { default: apiClient } = await import('../api/apiClient');
                      const response = await apiClient.post('/loading-sheet/generate-pdf', { invoiceIds: selectedInvoices }, { responseType: 'blob' });
                      const url = window.URL.createObjectURL(new Blob([response.data]));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', `LoadingSheet_${Date.now()}.pdf`);
                      document.body.appendChild(link);
                      link.click();
                      link.parentNode.removeChild(link);
                    } catch (error) {
                      console.error('PDF Error:', error);
                      alert('Failed to generate PDF');
                    }
                  }}
                  className="bg-[#28a745] hover:bg-[#218838] opacity-80 text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
                >
                  Generate Loading Sheet
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}

      {/* Custom Range Modal */}
      {customRangeModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            
            <div className="bg-[#007bff] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white text-[15px] font-medium">Select Date Range</h3>
              <button onClick={() => setCustomRangeModalOpen(false)} className="text-[#dc3545] hover:text-red-700 transition-colors drop-shadow-sm">
                <X className="w-7 h-7 font-bold" strokeWidth={4} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">From Date</label>
                  <input 
                    type="date"
                    value={tempFromDate}
                    onChange={(e) => setTempFromDate(e.target.value)}
                    className="w-full border border-[#007bff] bg-[#e3f2fd] rounded-[3px] px-3 py-1.5 text-[14px] text-gray-800 outline-none focus:border-[#0056b3]"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">To Date</label>
                  <input 
                    type="date"
                    value={tempToDate}
                    onChange={(e) => setTempToDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-800 outline-none focus:border-[#007bff]"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-3 flex justify-end bg-[#f8f9fa]">
              <button 
                onClick={() => {
                  setFromDate(tempFromDate);
                  setToDate(tempToDate);
                  setCustomRangeModalOpen(false);
                }}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
