import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, ChevronsUpDown, Loader2 } from 'lucide-react';
import { getInvoicesReport } from '../api/financial';
import apiClient from '../api/apiClient';

export function InvoicesReport() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('Sales');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('all');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.get('/customers')
      .then(res => setCustomers(res.data?.data || []))
      .catch(err => console.error("Failed to fetch customers", err));
  }, []);

  useEffect(() => {
    fetchReport();
  }, [selectedType, selectedCustomerId]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
        alert("From Date cannot be greater than To Date.");
        setLoading(false);
        return;
      }
      const res = await getInvoicesReport(selectedType, fromDate, toDate, selectedCustomerId);
      setReportData(res.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch invoices report", error);
    } finally {
      setLoading(false);
    }
  };

  const displayFromDate = fromDate ? new Date(fromDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '';
  const displayToDate = toDate ? new Date(toDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '';
  const displayDate = (displayFromDate && displayToDate) ? `${displayFromDate} to ${displayToDate}` : (displayFromDate || displayToDate || 'All Time');

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-3 flex flex-col">
      <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden flex flex-col flex-1">
        
        {/* Header Banner */}
        <div className="bg-[#4F46E5] text-white px-4 py-2 flex items-center justify-between">
          <span className="text-[15px] font-medium tracking-wide">All Invoices Report</span>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#dc3545] hover:bg-[#c82333] transition-colors p-1 rounded-[3px] text-white focus:outline-none"
          >
            <X className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>

        {/* Control Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            
            {/* Type */}
            <div className="flex flex-col gap-1 w-full sm:max-w-[200px]">
              <label className="text-[13px] font-bold text-gray-800">Type</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white"
              >
                <option>Sales</option>
                <option>Sales Return</option>
                <option>Purchase</option>
                <option>Purchase Return</option>
                <option>Quotation</option>
                <option>Store Stock Transfer</option>
                <option>Branch Stock IN/OUT</option>
                <option>Challan Sale</option>
                <option>Challan Invoice</option>
                <option>Purchase Order</option>
                <option>Sale Order</option>
              </select>
            </div>

            {/* Date */}
            <div className="flex flex-col gap-1 w-full sm:max-w-[280px]">
              <div className="flex flex-wrap items-center gap-1.5">
                <label className="text-[13px] font-bold text-gray-800">Date</label>
                <span className="text-[11px] font-semibold text-[#4F46E5]">({displayDate})</span>
              </div>
              <div className="flex gap-1.5 w-full">
                <input 
                  type="date" 
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="flex-1 h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white" 
                />
                <span className="text-[13px] font-bold text-gray-800 self-center">To</span>
                <input 
                  type="date" 
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="flex-1 h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white" 
                />
                <button onClick={fetchReport} className="h-[32px] w-[36px] bg-[#007bff] hover:bg-[#0069d9] text-white flex items-center justify-center rounded-[3px] transition-colors shadow-sm focus:outline-none">
                  <Search className="w-4 h-4" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Filter by Party */}
            <div className="flex flex-col gap-1 w-full md:max-w-[350px]">
              <label className="text-[13px] font-bold text-gray-800">Filter by Party</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white"
              >
                <option value="all">All Parties</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 p-4">
          <div className="w-full h-full flex flex-col">
            
            <div className="table-scroll w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[10%] whitespace-nowrap">
                      <span className="flex items-center gap-1">Date <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" /></span>
                    </th>
                    <th className="py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[12%] whitespace-nowrap">
                      <span className="flex items-center gap-1">Invoice No <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" /></span>
                    </th>
                    <th className="py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[18%] whitespace-nowrap">
                      <span className="flex items-center gap-1">Party <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" /></span>
                    </th>
                    <th className="py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[22%] whitespace-nowrap">
                      <span className="flex items-center gap-1">Product Name <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" /></span>
                    </th>
                    <th className="py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[10%] whitespace-nowrap">
                      <span className="flex items-center gap-1">Quantity <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" /></span>
                    </th>
                    <th className="py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[9%] whitespace-nowrap">
                      <span className="flex items-center gap-1">Price <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" /></span>
                    </th>
                    <th className="py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[10%] whitespace-nowrap">
                      <span className="flex items-center gap-1">Amount <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" /></span>
                    </th>
                    <th className="py-2.5 px-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[9%] whitespace-nowrap">
                      <span className="flex items-center gap-1">GST Tax <ChevronsUpDown className="w-3.5 h-3.5 text-gray-400" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="py-12 text-center">
                        <Loader2 className="w-7 h-7 animate-spin mx-auto text-gray-400" />
                      </td>
                    </tr>
                  ) : reportData.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="py-16 text-center">
                        <span className="text-[15px] font-normal text-gray-500 tracking-wide">No data found</span>
                      </td>
                    </tr>
                  ) : (
                    reportData.map((row, idx) => (
                      <tr key={row.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 text-[13px] text-gray-700 whitespace-nowrap">
                          {row.date ? new Date(row.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '-'}
                        </td>
                        <td className="py-2 px-3 text-[13px] text-[#4F46E5] font-semibold whitespace-nowrap">{row.invoiceNo || '-'}</td>
                        <td className="py-2 px-3 text-[13px] text-gray-700">{row.party || '-'}</td>
                        <td className="py-2 px-3 text-[13px] text-gray-700">{row.productName || '-'}</td>
                        <td className="py-2 px-3 text-[13px] text-gray-700 text-right">{row.quantity}</td>
                        <td className="py-2 px-3 text-[13px] text-gray-700 text-right">{row.price?.toFixed(2)}</td>
                        <td className="py-2 px-3 text-[13px] text-gray-700 text-right font-semibold">{row.amount?.toFixed(2)}</td>
                        <td className="py-2 px-3 text-[13px] text-gray-700 text-right">{row.gstTax?.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
