import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import apiClient from '../api/apiClient';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
};

const formatYMD = (date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export function TcsReport() {
  const navigate = useNavigate();
  const [reportData, setReportData] = useState([]);
  const [parties, setParties] = useState([]);
  
  const [period, setPeriod] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  
  const [partyEnabled, setPartyEnabled] = useState(false);
  const [selectedParty, setSelectedParty] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchParties();
  }, []);

  useEffect(() => {
    // Only fetch if period is not Custom, or if it is Custom and both dates are selected
    if (period === 'Custom' && (!fromDate || !toDate)) return;
    
    // Auto fetch when filters change
    fetchReport();
  }, [period, fromDate, toDate, partyEnabled, selectedParty]);

  const fetchParties = async () => {
    try {
      const response = await apiClient.get('/customers');
      if (response.data.success) {
        setParties(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching parties:", error);
    }
  };

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      let url = '/financial/tcs-report?';
      if (partyEnabled && selectedParty) url += `customerId=${selectedParty}&`;
      if (fromDate) url += `fromDate=${fromDate}&`;
      if (toDate) url += `toDate=${toDate}&`;
      
      const response = await apiClient.get(url);
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching TCS report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePeriodChange = (e) => {
    const val = e.target.value;
    setPeriod(val);
    if (val === 'Custom') return;
    
    // Simplified period logic (can be expanded)
    const today = new Date();
    if (val === 'Today') {
      setFromDate(formatYMD(today));
      setToDate(formatYMD(today));
    } else if (val === 'This Month') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setFromDate(formatYMD(firstDay));
      setToDate(formatYMD(today));
    } else {
      setFromDate('');
      setToDate('');
    }
  };

  const handleSearch = () => {
    // Left for backwards compatibility if needed, but handled by useEffect now
    fetchReport();
  };

  const totalInvoiceValue = reportData.reduce((sum, item) => sum + (Number(item.invoiceValue) || 0), 0);
  const totalTcsCollected = reportData.reduce((sum, item) => sum + (Number(item.tcsCollected) || 0), 0);
  const totalTcsPaid = reportData.reduce((sum, item) => sum + (Number(item.tcsPaid) || 0), 0);

  const handleExport = () => {
    const doc = new jsPDF();

    // Add Title
    doc.setFontSize(18);
    doc.text("TCS Report", 14, 22);
    
    // Add Subtitle/Period Information
    doc.setFontSize(11);
    doc.setTextColor(100);
    const dateText = (fromDate && toDate) ? `Period: ${fromDate} to ${toDate}` : `Period: All Time`;
    doc.text(dateText, 14, 30);

    // Prepare Table Data
    const tableColumn = ["Date/Invoice No.", "Party Name", "Voucher Type", "Invoice Value", "TCS Collected", "TCS Paid"];
    const tableRows = [];

    reportData.forEach(row => {
      const rowData = [
        `${formatDate(row.date)}\n${row.invoiceNo}`,
        row.partyName,
        row.voucherType.replace(/_/g, ' '),
        row.invoiceValue.toFixed(2),
        row.tcsCollected.toFixed(2),
        row.tcsPaid.toFixed(2)
      ];
      tableRows.push(rowData);
    });

    // Add Totals Row
    tableRows.push([
      "", 
      "", 
      "TOTAL", 
      totalInvoiceValue.toFixed(2), 
      totalTcsCollected.toFixed(2), 
      totalTcsPaid.toFixed(2)
    ]);

    // Generate Table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' },
      willDrawCell: function(data) {
        // Make the total row bold
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      },
      columnStyles: {
        3: { halign: 'right' },
        4: { halign: 'right' },
        5: { halign: 'right' }
      }
    });

    doc.save("TCS_Report.pdf");
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-3 flex flex-col relative pb-[70px]">
      <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden flex-1">
        
        {/* Header Title */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-[14px] text-gray-700">TCS Report</h2>
        </div>

        <div className="p-4">
          {/* Controls Row */}
          <div className="flex flex-wrap items-end gap-4 mb-6">
            <div className="flex flex-col gap-1.5 w-full sm:max-w-[250px]">
              <label className="text-[13px] font-bold text-gray-800">Select Period</label>
              <select 
                value={period}
                onChange={handlePeriodChange}
                className="h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white"
              >
                <option value="">Select</option>
                <option value="Today">Today</option>
                <option value="This Month">This Month</option>
                <option value="Custom">Custom</option>
              </select>
            </div>

            {period === 'Custom' && (
              <>
                <div className="flex flex-col gap-1.5 w-full sm:max-w-[150px]">
                  <label className="text-[13px] font-bold text-gray-800">From Date</label>
                  <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none" />
                </div>
                <div className="flex flex-col gap-1.5 w-full sm:max-w-[150px]">
                  <label className="text-[13px] font-bold text-gray-800">To Date</label>
                  <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none" />
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5 w-full sm:max-w-[300px]">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={partyEnabled}
                    onChange={() => setPartyEnabled(!partyEnabled)}
                  />
                  <div className="w-8 h-4 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#007bff]"></div>
                </div>
                <label className="text-[13px] font-bold text-gray-800">Party Name</label>
              </div>
              <select 
                disabled={!partyEnabled}
                value={selectedParty}
                onChange={(e) => setSelectedParty(e.target.value)}
                className="h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white disabled:text-gray-400 disabled:bg-gray-100"
              >
                <option value="">Select Name</option>
                {parties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            </div>

          {/* Table */}
          <div className="w-full">
            <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse border border-black text-left">
              <thead>
                <tr>
                  <th className="py-2.5 px-3 border border-black text-[12px] font-bold text-gray-800 text-center leading-tight whitespace-nowrap">Date<br/>Invoice No.</th>
                  <th className="py-2.5 px-3 border border-black text-[13px] font-bold text-gray-800 text-center whitespace-nowrap">Party Name</th>
                  <th className="py-2.5 px-3 border border-black text-[13px] font-bold text-gray-800 text-center whitespace-nowrap">Voucher Type</th>
                  <th className="py-2.5 px-3 border border-black text-[13px] font-bold text-gray-800 text-center whitespace-nowrap">Invoice Value</th>
                  <th className="py-2.5 px-3 border border-black text-[13px] font-bold text-gray-800 text-center whitespace-nowrap">TCS Collected</th>
                  <th className="py-2.5 px-3 border border-black text-[13px] font-bold text-gray-800 text-center whitespace-nowrap">TCS Paid</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map(row => (
                  <tr key={row.id}>
                    <td className="py-2.5 px-3 border border-black text-[13px]">
                      {formatDate(row.date)}<br/>
                      <span className="text-gray-500">{row.invoiceNo}</span>
                    </td>
                    <td className="py-2.5 px-3 border border-black text-[13px]">{row.partyName}</td>
                    <td className="py-2.5 px-3 border border-black text-[13px]">{row.voucherType.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 px-3 border border-black text-[13px] text-right">{row.invoiceValue.toFixed(2)}</td>
                    <td className="py-2.5 px-3 border border-black text-[13px] text-right">{row.tcsCollected.toFixed(2)}</td>
                    <td className="py-2.5 px-3 border border-black text-[13px] text-right">{row.tcsPaid.toFixed(2)}</td>
                  </tr>
                ))}
                {reportData.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan="6" className="py-4 px-3 border border-black text-[13px] text-center text-gray-500">No records found</td>
                  </tr>
                )}
                <tr>
                  <td className="py-2.5 px-3 border border-black text-[13px]"></td>
                  <td className="py-2.5 px-3 border border-black text-[13px]"></td>
                  <td className="py-2.5 px-3 border border-black text-[13px] font-bold text-gray-800 text-center">Total</td>
                  <td className="py-2.5 px-3 border border-black text-[13px] font-bold text-gray-800 text-right">{totalInvoiceValue.toFixed(2)}</td>
                  <td className="py-2.5 px-3 border border-black text-[13px] font-bold text-gray-800 text-right">{totalTcsCollected.toFixed(2)}</td>
                  <td className="py-2.5 px-3 border border-black text-[13px] font-bold text-gray-800 text-right">{totalTcsPaid.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="absolute bottom-0 left-0 right-0 bg-transparent p-3 flex justify-end gap-2 pr-6">
        <button 
          onClick={() => navigate(-1)}
          className="bg-[#dc3545] hover:bg-[#c82333] text-white text-[13px] font-medium px-3 py-1.5 rounded-[3px] flex items-center justify-center gap-1 shadow-sm transition-colors"
        >
          <span className="text-[16px] leading-none mt-[-2px]">&laquo;</span> Go back
        </button>
        <button 
          onClick={() => window.open('https://web.whatsapp.com/', '_blank')}
          className="bg-[#28a745] hover:bg-[#218838] text-white text-[13px] font-medium px-3 py-1.5 rounded-[3px] flex items-center justify-center shadow-sm transition-colors"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.662-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
        </button>
        <button 
          onClick={handleExport}
          className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1.5 shadow-sm transition-colors"
        >
          <Upload className="w-4 h-4" /> Export
        </button>
      </div>

    </div>
  );
}

