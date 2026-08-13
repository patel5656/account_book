import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, FileText, Share2, MessageCircle, Upload, Download, ExternalLink, X } from 'lucide-react';
import apiClient from '../api/apiClient';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function GstrSaleReturn() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('This Month');
  const [filterByParty, setFilterByParty] = useState(false);
  const [selectedParty, setSelectedParty] = useState('');
  const [showHsnWise, setShowHsnWise] = useState(false);
  const [isCustomRangeModalOpen, setIsCustomRangeModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invoiceRes, customerRes] = await Promise.all([
        apiClient.get('/invoices?type=SALES_RETURN'),
        apiClient.get('/customers')
      ]);

      if (invoiceRes.data?.success) {
        setData(invoiceRes.data.data || []);
      }
      if (customerRes.data?.success) {
        setCustomers(customerRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching GSTR Sale Return data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isDateInPeriod = (dateStr, selectedPeriod) => {
    if (selectedPeriod === '' || selectedPeriod === 'Select') return false;
    const date = new Date(dateStr);
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'This Month':
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case 'Last Month': {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
      }
      case 'This Quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        const dateQuarter = Math.floor(date.getMonth() / 3);
        return currentQuarter === dateQuarter && date.getFullYear() === now.getFullYear();
      }
      case 'Last Quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3) - 1;
        const dateQuarter = Math.floor(date.getMonth() / 3);
        const yearOffset = currentQuarter < 0 ? -1 : 0;
        const targetQuarter = currentQuarter < 0 ? 3 : currentQuarter;
        return targetQuarter === dateQuarter && date.getFullYear() === now.getFullYear() + yearOffset;
      }
      case 'Custom Range': {
        if (!customStartDate || !customEndDate) return false;
        const start = new Date(customStartDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      }
      default:
        return true;
    }
  };

  const getPeriodDateRangeString = () => {
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'This Month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'Last Month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'This Quarter': {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        endDate = new Date(now.getFullYear(), quarterMonth + 3, 0);
        break;
      }
      case 'Last Quarter': {
        const quarterMonth = Math.floor(now.getMonth() / 3) * 3 - 3;
        startDate = new Date(now.getFullYear(), quarterMonth, 1);
        endDate = new Date(now.getFullYear(), quarterMonth + 3, 0);
        break;
      }
      case 'Custom Range': {
        if (!customStartDate || !customEndDate) return 'Select Date Range';
        startDate = new Date(customStartDate);
        endDate = new Date(customEndDate);
        break;
      }
      case '':
      case 'Select':
      default:
        return 'Select a period';
    }
    
    const formatDateStr = (d) => {
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');
    };
    
    return `From ${formatDateStr(startDate)} To ${formatDateStr(endDate)}`;
  };

  const filteredData = data.filter(invoice => {
    if (!isDateInPeriod(invoice.date, period)) {
      return false;
    }
    if (filterByParty && selectedParty && selectedParty !== 'Select Name') {
      return invoice.customer?.name === selectedParty;
    }
    return true;
  });

  // Process data to map it to row values
  let displayRows = [];

  if (showHsnWise) {
    const hsnGroups = {};
    filteredData.forEach(invoice => {
      invoice.items?.forEach(item => {
        const hsn = item.product?.hsnCode || 'N/A';
        const gstRate = Number(item.gstRate) || Number(item.product?.tax) || 0;
        
        const qty = Number(item.quantity) || 0;
        const taxableAmount = Number(item.amount) || 0;
        const cgst = Number(item.cgst) || 0;
        const sgst = Number(item.sgst) || 0;
        const igst = Number(item.igst) || 0;
        const totalGst = Number(item.gstAmount) || (cgst + sgst + igst) || (taxableAmount * gstRate / 100);
        const grandTotal = taxableAmount + totalGst;

        const groupKey = `${hsn}-${gstRate}`;
        if (!hsnGroups[groupKey]) {
          hsnGroups[groupKey] = {
            hsn,
            gstRate,
            description: item.product?.name || 'Product Description',
            taxableAmount: 0,
            qty: 0,
            igst: 0,
            cgst: 0,
            sgst: 0,
            subTotal: 0,
            grandTotal: 0
          };
        }

        hsnGroups[groupKey].taxableAmount += taxableAmount;
        hsnGroups[groupKey].qty += qty;
        hsnGroups[groupKey].igst += igst;
        hsnGroups[groupKey].cgst += cgst;
        hsnGroups[groupKey].sgst += sgst;
        hsnGroups[groupKey].subTotal += taxableAmount;
        hsnGroups[groupKey].grandTotal += grandTotal;
      });
    });

    displayRows = Object.values(hsnGroups).map((group, idx) => ({
      key: `hsn-${idx}`,
      col1: group.hsn,
      col2: group.description,
      gstin: '-',
      state: '-',
      taxableAmount: group.taxableAmount,
      gstRate: group.gstRate,
      qty: group.qty,
      igst: group.igst,
      cgst: group.cgst,
      sgst: group.sgst,
      subTotal: group.subTotal,
      grandTotal: group.grandTotal
    }));
  } else {
    filteredData.forEach(invoice => {
      invoice.items?.forEach(item => {
        const qty = Number(item.quantity) || 0;
        const taxableAmount = Number(item.amount) || 0;
        const gstRate = Number(item.gstRate) || Number(item.product?.tax) || 0;
        const cgst = Number(item.cgst) || 0;
        const sgst = Number(item.sgst) || 0;
        const igst = Number(item.igst) || 0;
        const totalGst = Number(item.gstAmount) || (cgst + sgst + igst) || (taxableAmount * gstRate / 100);
        const grandTotal = taxableAmount + totalGst;

        displayRows.push({
          key: `${invoice.id}-${item.id}`,
          col1: `${new Date(invoice.date).toLocaleDateString('en-GB')} / ${invoice.invoiceNo}`,
          col2: invoice.customer?.name || 'Cash',
          gstin: invoice.customer?.gstin || '-',
          state: invoice.customer?.state || '-',
          taxableAmount,
          gstRate,
          qty,
          igst,
          cgst,
          sgst,
          subTotal: taxableAmount,
          grandTotal
        });
      });
    });
  }

  // Calculate totals
  const totals = displayRows.reduce((acc, row) => {
    acc.taxableAmount += row.taxableAmount;
    acc.qty += row.qty;
    acc.igst += row.igst;
    acc.cgst += row.cgst;
    acc.sgst += row.sgst;
    acc.subTotal += row.subTotal;
    acc.grandTotal += row.grandTotal;
    return acc;
  }, { taxableAmount: 0, qty: 0, igst: 0, cgst: 0, sgst: 0, subTotal: 0, grandTotal: 0 });

  const formatNumber = (num) => Number(num).toFixed(2);

  const handleExportCSV = () => {
    const col1Header = showHsnWise ? 'HSN Slab' : 'Date / Invoice No.';
    const col2Header = showHsnWise ? 'Product / Description' : 'Party Name';
    
    const headers = [col1Header, col2Header, 'GSTIN', 'State', 'Taxable Amount', 'GST %', 'Quantity', 'IGST', 'CGST', 'SGST', 'Sub Total', 'Grand Total'];
    let rowsContent = [];
    
    displayRows.forEach(row => {
       rowsContent.push([
         `"${row.col1.replace(/\n/g, ' ')}"`,
         `"${row.col2}"`,
         row.gstin,
         row.state,
         row.taxableAmount.toFixed(2),
         `${row.gstRate}%`,
         row.qty,
         row.igst.toFixed(2),
         row.cgst.toFixed(2),
         row.sgst.toFixed(2),
         row.subTotal.toFixed(2),
         row.grandTotal.toFixed(2)
       ].join(','));
    });

    // Totals row
    rowsContent.push([
      '""',
      '""',
      '""',
      '"Total"',
      totals.taxableAmount.toFixed(2),
      '""',
      totals.qty,
      totals.igst.toFixed(2),
      totals.cgst.toFixed(2),
      totals.sgst.toFixed(2),
      totals.subTotal.toFixed(2),
      totals.grandTotal.toFixed(2)
    ].join(','));

    const csvContent = [headers.join(','), ...rowsContent].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `gstr_sale_return_${showHsnWise ? 'hsn' : 'standard'}.csv`;
    link.click();
  };

  const handleDownload = () => {
    const doc = new jsPDF('landscape');
    
    // Title & Subtitle
    doc.setFontSize(16);
    doc.text('GST Sales Return Summary', 14, 15);
    doc.setFontSize(10);
    doc.text(getPeriodDateRangeString(), 14, 22);

    const col1Header = showHsnWise ? 'HSN Slab' : 'Date / Invoice No.';
    const col2Header = showHsnWise ? 'Product / Description' : 'Party Name';
    
    const tableColumn = [col1Header, col2Header, 'GSTIN', 'State', 'Taxable Amount', 'GST %', 'Quantity', 'IGST', 'CGST', 'SGST', 'Sub Total', 'Grand Total'];
    
    const tableRows = displayRows.map(row => [
      row.col1.replace(/\n/g, ' '),
      row.col2,
      row.gstin,
      row.state,
      formatNumber(row.taxableAmount),
      `${row.gstRate}%`,
      row.qty,
      formatNumber(row.igst),
      formatNumber(row.cgst),
      formatNumber(row.sgst),
      formatNumber(row.subTotal),
      formatNumber(row.grandTotal)
    ]);

    // Push Totals Row
    tableRows.push([
      '', '', '', 'Total',
      formatNumber(totals.taxableAmount),
      '',
      totals.qty,
      formatNumber(totals.igst),
      formatNumber(totals.cgst),
      formatNumber(totals.sgst),
      formatNumber(totals.subTotal),
      formatNumber(totals.grandTotal)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: 255 }, // Brand Indigo `#4F46E5`
      styles: { fontSize: 8, halign: 'center' },
      columnStyles: {
        0: { halign: 'left' },
        1: { halign: 'left' }
      },
      didParseCell: function (data) {
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 255]; // Light Indigo tint for total row
        }
      }
    });

    doc.save(`gstr_sale_return_${showHsnWise ? 'hsn' : 'standard'}.pdf`);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'GST Sales Return Summary',
        text: 'Check out the GST Sales Return Summary',
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
            className="h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white cursor-pointer"
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
          <div className="flex flex-wrap items-center">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={filterByParty}
                  onChange={(e) => {
                    setFilterByParty(e.target.checked);
                    if (!e.target.checked) setSelectedParty('');
                  }}
                  className="sr-only peer" 
                />
                <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#4F46E5]"></div>
              </div>
              <span className="text-[13px] font-bold text-gray-800">Party Name</span>
            </label>
          </div>
          <select 
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            disabled={!filterByParty}
            className={`h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none transition-colors ${
              filterByParty ? 'text-gray-700 bg-white cursor-pointer' : 'text-gray-400 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <option value="">Select Name</option>
            {customers.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 mt-5 cursor-pointer select-none">
          <div className="relative inline-flex items-center">
            <input 
              type="checkbox" 
              checked={showHsnWise}
              onChange={(e) => setShowHsnWise(e.target.checked)}
              className="sr-only peer" 
            />
            <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#4F46E5]"></div>
          </div>
          <span className="text-[13px] font-bold text-gray-800">Show HSN-wise</span>
        </label>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden flex-1">
        
        {/* Header */}
        <div className="text-center py-4 border-b border-gray-200">
          <h2 className="text-[14px] text-gray-700 mb-1">GST Sales Return Summary</h2>
          <p className="text-[14px] font-bold text-gray-800">{getPeriodDateRangeString()}</p>
        </div>

        {/* Table */}
        <div className="p-4 w-full">
          <div className="table-scroll w-full overflow-x-auto">
            {loading ? (
              <div className="text-center py-10 text-[13px] text-gray-500 font-medium">Loading data...</div>
            ) : (
              <table className="w-full border-collapse border border-black text-center">
                <thead>
                  <tr>
                    <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[8%] whitespace-nowrap">
                      {showHsnWise ? 'HSN Slab' : <>Date /<br/>Invoice No.</>}
                    </th>
                    <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[20%] whitespace-nowrap">
                      {showHsnWise ? 'Product / Description' : 'Party Name'}
                    </th>
                    <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[10%] whitespace-nowrap">GSTIN</th>
                    <th className="py-3 px-2 border border-black text-[13px] font-bold text-gray-800 w-[8%] whitespace-nowrap">State</th>
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
                  {displayRows.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="py-4 text-center text-[13px] text-gray-500">
                        No sales return records found.
                      </td>
                    </tr>
                  ) : (
                    displayRows.map(row => (
                      <tr key={row.key} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2.5 px-2 border border-black text-[13px] whitespace-pre-line">{row.col1}</td>
                        <td className="py-2.5 px-2 border border-black text-[13px]">{row.col2}</td>
                        <td className="py-2.5 px-2 border border-black text-[13px]">{row.gstin}</td>
                        <td className="py-2.5 px-2 border border-black text-[13px]">{row.state}</td>
                        <td className="py-2.5 px-2 border border-black text-[13px]">{formatNumber(row.taxableAmount)}</td>
                        <td className="py-2.5 px-2 border border-black text-[13px]">{row.gstRate}%</td>
                        <td className="py-2.5 px-2 border border-black text-[13px]">{row.qty}</td>
                        <td className="py-2.5 px-2 border border-black text-[13px]">{formatNumber(row.igst)}</td>
                        <td className="py-2.5 px-2 border border-black text-[13px]">{formatNumber(row.cgst)}</td>
                        <td className="py-2.5 px-2 border border-black text-[13px]">{formatNumber(row.sgst)}</td>
                        <td className="py-2.5 px-2 border border-black text-[13px]">{formatNumber(row.subTotal)}</td>
                        <td className="py-2.5 px-2 border border-black text-[13px]">{formatNumber(row.grandTotal)}</td>
                      </tr>
                    ))
                  )}
                  {/* Total Row */}
                  {displayRows.length > 0 && (
                    <tr className="bg-[#4F46E5] bg-opacity-15">
                      <td className="py-3 px-2 border border-black text-[13px]"></td>
                      <td className="py-3 px-2 border border-black text-[13px]"></td>
                      <td className="py-3 px-2 border border-black text-[13px]"></td>
                      <td className="py-3 px-2 border border-black text-[13px] font-bold text-white uppercase text-center" style={{ backgroundColor: '#4F46E5'}}>Total</td>
                      <td className="py-3 px-2 border border-black text-[13px] font-bold text-white text-center" style={{ backgroundColor: '#4F46E5'}}>{formatNumber(totals.taxableAmount)}</td>
                      <td className="py-3 px-2 border border-black text-[13px]"></td>
                      <td className="py-3 px-2 border border-black text-[13px] font-bold text-white text-center" style={{ backgroundColor: '#4F46E5'}}>{totals.qty}</td>
                      <td className="py-3 px-2 border border-black text-[13px] font-bold text-white text-center" style={{ backgroundColor: '#4F46E5'}}>{formatNumber(totals.igst)}</td>
                      <td className="py-3 px-2 border border-black text-[13px] font-bold text-white text-center" style={{ backgroundColor: '#4F46E5'}}>{formatNumber(totals.cgst)}</td>
                      <td className="py-3 px-2 border border-black text-[13px] font-bold text-white text-center" style={{ backgroundColor: '#4F46E5'}}>{formatNumber(totals.sgst)}</td>
                      <td className="py-3 px-2 border border-black text-[13px] font-bold text-white text-center" style={{ backgroundColor: '#4F46E5'}}>{formatNumber(totals.subTotal)}</td>
                      <td className="py-3 px-2 border border-black text-[13px] font-bold text-white text-center" style={{ backgroundColor: '#4F46E5'}}>{formatNumber(totals.grandTotal)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
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
                    // Filter happens automatically via isDateInPeriod when period is "Custom Range"
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
