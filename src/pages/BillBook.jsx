import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Search,
  ArrowDownAZ,
  Printer,
  FileDown,
  Eye,
  Edit,
  FileText
} from 'lucide-react';
import { cn } from '../utils';

export function BillBook() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [billNumberSearch, setBillNumberSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('Today');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/invoices?type=SALES');
      if (res.data.success) {
        // Map backend response to match frontend table structure
        const mappedData = res.data.data.map(inv => ({
          id: inv.id,
          billNo: `BB-${inv.id.toString().padStart(4, '0')}`,
          invoiceNo: inv.invoiceNo,
          customerName: inv.customer ? inv.customer.name : 'Walk-in Customer',
          date: new Date(inv.date).toLocaleDateString(),
          rawDate: inv.date, // Store raw ISO string for date filtering
          totalAmount: parseFloat(inv.totalAmount || 0).toFixed(2),
          paymentStatus: inv.status || 'PAID',
          dueAmount: inv.status === 'UNPAID' ? parseFloat(inv.totalAmount || 0).toFixed(2) : 0 
        }));
        setInvoices(mappedData);
      }
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async (invoice) => {
    try {
      // Full invoice data DB se fetch karo with items
      const res = await apiClient.get(`/invoices?type=SALES`);
      const allInvoices = res.data.data || [];
      const fullInvoice = allInvoices.find(inv => inv.id === invoice.id);

      if (!fullInvoice) {
        alert('Invoice data not found!');
        return;
      }

      // Company settings fetch karo
      const settingsRes = await apiClient.get('/settings');
      const settings = settingsRes.data.data || {};

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = doc.internal.pageSize.getWidth();

      // ── Header Background ──
      doc.setFillColor(79, 70, 229); // indigo
      doc.rect(0, 0, pageW, 30, 'F');

      // ── Company Name ──
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text(settings.printHeader || 'SWAYAM BILL BOOK', pageW / 2, 13, { align: 'center' });


      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(settings.printFooter || 'Tax Invoice', pageW / 2, 21, { align: 'center' });

      // ── Invoice Info Box ──
      doc.setTextColor(40, 40, 40);
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(248, 249, 250);
      doc.roundedRect(10, 35, pageW - 20, 30, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      // Left column
      doc.text('Bill No:', 14, 43);
      doc.text('Invoice No:', 14, 50);
      doc.text('Date:', 14, 57);
      doc.text('Payment Mode:', 14, 63);

      doc.setFont('helvetica', 'normal');
      doc.text(invoice.billNo || '-', 40, 43);
      doc.text(invoice.invoiceNo || '-', 40, 50);
      doc.text(invoice.date || '-', 40, 57);
      doc.text(fullInvoice.paymentMode || 'Cash', 45, 63);

      // Right column — Customer Info
      const cx = pageW / 2 + 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Customer:', cx, 43);
      doc.text('Status:', cx, 50);
      doc.text('Due Amount:', cx, 57);
      doc.text('Total Amount:', cx, 63);

      doc.setFont('helvetica', 'normal');
      doc.text(invoice.customerName || 'Walk-in Customer', cx + 28, 43);

      const status = invoice.paymentStatus || 'PAID';
      if (status === 'PAID') doc.setTextColor(40, 167, 69);
      else if (status === 'UNPAID') doc.setTextColor(220, 53, 69);
      else doc.setTextColor(255, 193, 7);
      doc.text(status, cx + 28, 50);
      doc.setTextColor(40, 40, 40);

      doc.text(`Rs. ${parseFloat(invoice.dueAmount).toFixed(2)}`, cx + 28, 57);
      doc.setFont('helvetica', 'bold');
      doc.text(`Rs. ${parseFloat(invoice.totalAmount).toFixed(2)}`, cx + 28, 63);

      // ── Items Table ──
      const items = fullInvoice.items || [];
      const tableBody = items.map((item, i) => [
        i + 1,
        item.product ? item.product.name : '-',
        item.quantity || 0,
        item.freeQty || 0,
        `Rs. ${parseFloat(item.price || 0).toFixed(2)}`,
        `${item.discount1 || 0}%`,
        `Rs. ${parseFloat(item.amount || 0).toFixed(2)}`,
      ]);

      autoTable(doc, {
        startY: 70,
        head: [['#', 'Product Name', 'Qty', 'Free', 'Price', 'Disc%', 'Amount']],
        body: tableBody,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 249, 255] },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 70 },
          2: { cellWidth: 12, halign: 'center' },
          3: { cellWidth: 12, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 28, halign: 'right' },
        },
        margin: { left: 10, right: 10 },
      });

      // ── Totals ──
      const finalY = doc.lastAutoTable.finalY + 5;
      const rightX = pageW - 10;

      doc.setFillColor(248, 249, 250);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(pageW / 2, finalY, pageW / 2 - 10, 30, 2, 2, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 80);
      doc.text('Sub Total:', pageW / 2 + 5, finalY + 8);
      doc.text('Discount:', pageW / 2 + 5, finalY + 15);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text('GRAND TOTAL:', pageW / 2 + 5, finalY + 25);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Rs. ${parseFloat(fullInvoice.subTotal || fullInvoice.totalAmount || 0).toFixed(2)}`, rightX, finalY + 8, { align: 'right' });
      doc.text(`Rs. ${parseFloat(fullInvoice.totalDiscount || 0).toFixed(2)}`, rightX, finalY + 15, { align: 'right' });

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(79, 70, 229);
      doc.text(`Rs. ${parseFloat(invoice.totalAmount).toFixed(2)}`, rightX, finalY + 25, { align: 'right' });

      // ── Footer ──
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.text('Thank you for your business!', pageW / 2, finalY + 38, { align: 'center' });
      doc.text('Generated by Swayam Bill Book', pageW / 2, finalY + 43, { align: 'center' });


      // ── Save ──
      doc.save(`${invoice.billNo}-${invoice.customerName}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('PDF generate karne mein error aaya. Please try again.');
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    // 1. Customer Search
    if (searchTerm && !inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    
    // 2. Bill/Invoice Number Search
    if (billNumberSearch) {
      const searchLower = billNumberSearch.toLowerCase();
      const matchesBill = inv.billNo && inv.billNo.toLowerCase().includes(searchLower);
      const matchesInvoice = inv.invoiceNo && inv.invoiceNo.toLowerCase().includes(searchLower);
      if (!matchesBill && !matchesInvoice) return false;
    }
    
    // 3. Status Filter
    if (statusFilter !== 'All' && inv.paymentStatus.toUpperCase() !== statusFilter.toUpperCase()) return false;
    
    // 4. Date Filter
    if (dateFilter && dateFilter !== 'All Time') {
      const d = new Date(inv.rawDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dateFilter === 'Today') {
        if (d < today) return false;
      } else if (dateFilter === 'Yesterday') {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (d < yesterday || d >= today) return false;
      } else if (dateFilter === 'Last 7 Days') {
        const last7 = new Date(today);
        last7.setDate(last7.getDate() - 7);
        if (d < last7) return false;
      } else if (dateFilter === 'Last 30 Days') {
        const last30 = new Date(today);
        last30.setDate(last30.getDate() - 30);
        if (d < last30) return false;
      } else if (dateFilter === 'This Month') {
        if (d.getMonth() !== today.getMonth() || d.getFullYear() !== today.getFullYear()) return false;
      } else if (dateFilter === 'Custom Range') {
        if (startDate && endDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (d < start || d > end) return false;
        } else if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          if (d < start) return false;
        } else if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          if (d > end) return false;
        }
      }
    }
    
    return true;
  });

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bill-book-container, .bill-book-container * {
            visibility: visible;
          }
          .bill-book-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-hide {
            display: none !important;
          }
          @page {
            size: landscape;
            margin: 10mm;
          }
        }
      `}</style>
      <div className="bg-[#f8f9fa] min-h-[calc(100vh-45px)] flex flex-col p-3 relative bill-book-container">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 print-hide">
          <div className="flex items-center gap-2">
             <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
             <h2 className="text-white text-[16px] font-medium tracking-wide">
               Bill Book (Sales Bills)
             </h2>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 border-b border-gray-200 flex flex-wrap gap-4 items-end bg-[#fdfdfd] print-hide">
          {/* Customer Search */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[13px] font-bold text-gray-800 mb-1">Customer Search</label>
            <div className="relative flex items-center">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Customer Name"
                className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 pr-8 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white shadow-sm"
              />
              <Search className="absolute right-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Bill Number Search */}
          <div className="w-[180px]">
            <label className="block text-[13px] font-bold text-gray-800 mb-1">Bill / Invoice No.</label>
            <input 
              type="text"
              value={billNumberSearch}
              onChange={(e) => setBillNumberSearch(e.target.value)}
              placeholder="Search Bill No."
              className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white shadow-sm"
            />
          </div>

          {/* Date Filter */}
          <div className="w-[150px]">
             <label className="block text-[13px] font-bold text-gray-800 mb-1">Date</label>
             <select 
               value={dateFilter}
               onChange={(e) => setDateFilter(e.target.value)}
               className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white shadow-sm"
             >
               <option>All Time</option>
               <option>Today</option>
               <option>Yesterday</option>
               <option>Last 7 Days</option>
               <option>Last 30 Days</option>
               <option>This Month</option>
               <option>Custom Range</option>
             </select>
          </div>

          {/* Custom Date Range Picker */}
          {dateFilter === 'Custom Range' && (
            <div className="flex gap-2 w-auto items-end animate-in fade-in zoom-in duration-200">
              <div className="w-[130px]">
                <label className="block text-[13px] font-bold text-gray-800 mb-1">From</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white shadow-sm"
                />
              </div>
              <div className="w-[130px]">
                <label className="block text-[13px] font-bold text-gray-800 mb-1">To</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white shadow-sm"
                />
              </div>
            </div>
          )}

          {/* Status Filter */}
          <div className="w-[150px]">
             <label className="block text-[13px] font-bold text-gray-800 mb-1">Status</label>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white shadow-sm"
             >
               <option>All</option>
               <option>Paid</option>
               <option>Partial</option>
               <option>Unpaid</option>
               <option>Hold</option>
             </select>
          </div>

          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 bg-[#007bff] hover:bg-[#0069d9] text-white px-3 py-1.5 rounded-[3px] text-[14px] transition-colors shadow-sm h-[34px]">
              <Search className="w-4 h-4" strokeWidth={3} />
              Search
            </button>
            <button className="flex items-center justify-center bg-[#6c757d] hover:bg-[#5a6268] text-white px-2.5 py-1.5 rounded-[3px] transition-colors shadow-sm h-[34px]">
              <ArrowDownAZ className="w-[18px] h-[18px]" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Totals Table Header */}
        <div className="bg-[#343a40] text-white flex flex-col sm:grid sm:grid-cols-3 text-center py-2 px-4 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] z-10">
          <div className="flex flex-col items-center border-r border-gray-600">
            <span className="text-[15px] font-bold tracking-wider">TOTAL INVOICES:</span>
            <span className="text-[18px] font-bold leading-none mt-0.5">{filteredInvoices.length}</span>
          </div>
          <div className="flex flex-col items-center border-r border-gray-600">
            <span className="text-[15px] font-bold tracking-wider">TOTAL AMOUNT:</span>
            <span className="text-[18px] font-bold leading-none mt-0.5 text-[#28a745]">₹{filteredInvoices.reduce((acc, inv) => acc + parseFloat(inv.totalAmount), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[15px] font-bold tracking-wider">DUE AMOUNT:</span>
            <span className="text-[18px] font-bold leading-none mt-0.5 text-[#dc3545]">₹{filteredInvoices.reduce((acc, inv) => acc + parseFloat(inv.dueAmount), 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto bg-white border-t border-gray-200">
          <div className="table-scroll w-full overflow-x-auto print:overflow-visible">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#f8f9fa] sticky top-0 shadow-sm z-0">
                <tr>
                  <th className="px-3 py-2.5 text-[13px] font-bold text-gray-700 border-b border-gray-200 border-r w-[50px] text-center">#</th>
                  <th className="px-3 py-2.5 text-[13px] font-bold text-gray-700 border-b border-gray-200 border-r whitespace-nowrap">Bill No</th>
                  <th className="px-3 py-2.5 text-[13px] font-bold text-gray-700 border-b border-gray-200 border-r whitespace-nowrap">Invoice No</th>
                  <th className="px-3 py-2.5 text-[13px] font-bold text-gray-700 border-b border-gray-200 border-r whitespace-nowrap">Customer Name</th>
                  <th className="px-3 py-2.5 text-[13px] font-bold text-gray-700 border-b border-gray-200 border-r whitespace-nowrap">Invoice Date</th>
                  <th className="px-3 py-2.5 text-[13px] font-bold text-gray-700 border-b border-gray-200 border-r whitespace-nowrap text-right">Total Amount</th>
                  <th className="px-3 py-2.5 text-[13px] font-bold text-gray-700 border-b border-gray-200 border-r w-[100px] text-center">Status</th>
                  <th className="px-3 py-2.5 text-[13px] font-bold text-gray-700 border-b border-gray-200 border-r whitespace-nowrap text-right">Due Amount</th>
                  <th className="px-3 py-2.5 text-[13px] font-bold text-gray-700 border-b border-gray-200 text-center w-[160px] print:hidden">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((inv, index) => (
                  <tr key={inv.id} className="hover:bg-blue-50/50 transition-colors border-b border-gray-100">
                    <td className="px-3 py-2.5 text-[13px] text-gray-800 border-r border-gray-100 text-center">{index + 1}</td>
                    <td className="px-3 py-2.5 text-[13px] text-gray-800 font-medium border-r border-gray-100 whitespace-nowrap">{inv.billNo}</td>
                    <td className="px-3 py-2.5 text-[13px] text-gray-800 border-r border-gray-100 whitespace-nowrap">{inv.invoiceNo}</td>
                    <td className="px-3 py-2.5 text-[13px] text-[#4F46E5] font-bold border-r border-gray-100 whitespace-nowrap">{inv.customerName}</td>
                    <td className="px-3 py-2.5 text-[13px] text-gray-800 border-r border-gray-100 whitespace-nowrap">{inv.date}</td>
                    <td className="px-3 py-2.5 text-[14px] font-bold text-gray-900 border-r border-gray-100 text-right">₹{parseFloat(inv.totalAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    <td className="px-3 py-2.5 border-r border-gray-100 text-center">
                      <span className={cn(
                        "px-2 py-0.5 rounded-[3px] text-[11px] font-bold uppercase tracking-wider",
                        inv.paymentStatus.toUpperCase() === 'PAID' ? "bg-green-100 text-green-700 border border-green-200" :
                        inv.paymentStatus.toUpperCase() === 'PARTIAL' ? "bg-yellow-100 text-yellow-700 border border-yellow-200" :
                        "bg-red-100 text-red-700 border border-red-200"
                      )}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className={cn(
                      "px-3 py-2.5 text-[14px] font-bold border-r border-gray-100 text-right",
                      inv.dueAmount > 0 ? "text-[#dc3545]" : "text-gray-500"
                    )}>
                      ₹{parseFloat(inv.dueAmount).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </td>
                    <td className="px-3 py-2.5 text-center print:hidden">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => navigate(inv.invoiceNo?.startsWith('POS-') ? `/bill/${inv.invoiceNo}` : `/admin/invoice-details/customer_sale?id=${inv.id}`)}
                          title="View" 
                          className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(inv.invoiceNo?.startsWith('POS-') ? `/admin/pos?id=${inv.id}` : `/admin/sales-invoice?id=${inv.id}`)}
                          title="Edit" 
                          className="p-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={handlePrint}
                          title="Print" 
                          className="p-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDownloadPDF(inv)}
                          title="Download PDF" 
                          className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <FileDown className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500 font-medium">
                      No invoices found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
