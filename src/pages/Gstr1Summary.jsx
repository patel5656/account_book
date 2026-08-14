import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ExternalLink, Share2, MessageCircle, Loader, X } from 'lucide-react';
import apiClient from '../api/apiClient';
import { exportToExcel } from '../utils/excelExport';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
export function Gstr1Summary() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState('This Month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRangeStr, setDateRangeStr] = useState('');
  const [companyDetails, setCompanyDetails] = useState(null);
  const [isCustomRangeModalOpen, setIsCustomRangeModalOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);

  const fetchSummary = async (selectedPeriod, customStart, customEnd) => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      if (selectedPeriod === 'Last Month') {
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

      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      
      const options = { day: '2-digit', month: 'short', year: 'numeric' };
      setDateRangeStr(`From ${startDate.toLocaleDateString('en-GB', options).replace(/ /g, '-')} To ${endDate.toLocaleDateString('en-GB', options).replace(/ /g, '-')}`);

      const res = await apiClient.get(`/gstr/gstr-1?startDate=${startStr}&endDate=${endStr}`);
      if (res.data.success) {
        setData(res.data.data);
        if (res.data.company) {
          setCompanyDetails(res.data.company);
        }
      }
    } catch (err) {
      console.error('Error fetching GSTR-1 summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(period && period !== 'Custom Range' && period !== 'Select') {
        fetchSummary(period);
    }
  }, [period]);

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('b2b');

      // Row 1
      worksheet.mergeCells('A1:M1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'Summary For B2B, SEZ, DE (4A, 4B, 6B, 6C)';
      titleCell.font = { name: 'Arial', size: 12, bold: true };
      titleCell.alignment = { horizontal: 'left', vertical: 'middle' };

      // Calculate Summary
      const b2bInvoices = data?.b2b?.invoices || [];
      const uniqueRecipients = new Set(b2bInvoices.map(inv => inv.gstin)).size;
      const totalInvoicesCount = b2bInvoices.length;
      const totalInvoiceValue = b2bInvoices.reduce((sum, inv) => sum + (inv.invoiceValue || 0), 0);
      const totalTaxableValue = b2bInvoices.reduce((sum, inv) => sum + (inv.taxableValue || 0), 0);
      const totalCess = b2bInvoices.reduce((sum, inv) => sum + (inv.cessAmount || 0), 0);

      // Row 2 Labels
      worksheet.getCell('A2').value = 'No. of Recipients';
      worksheet.getCell('A2').font = { bold: true };
      worksheet.getCell('C2').value = 'No. of Invoice';
      worksheet.getCell('C2').font = { bold: true };
      worksheet.getCell('E2').value = 'Total Invoice';
      worksheet.getCell('E2').font = { bold: true };
      worksheet.getCell('L2').value = 'Total Taxable Value';
      worksheet.getCell('L2').font = { bold: true };
      worksheet.getCell('M2').value = 'Total Cess';
      worksheet.getCell('M2').font = { bold: true };

      // Row 3 Values
      worksheet.getCell('A3').value = uniqueRecipients;
      worksheet.getCell('C3').value = totalInvoicesCount;
      worksheet.getCell('E3').value = totalInvoiceValue;
      worksheet.getCell('E3').numFmt = '0.00';
      worksheet.getCell('L3').value = totalTaxableValue;
      worksheet.getCell('L3').numFmt = '0.00';
      worksheet.getCell('M3').value = totalCess;
      worksheet.getCell('M3').numFmt = '0.00';

      // Row 4 Headers
      const headers = [
        'GSTIN/UIN of Recipient', 'Receiver Name', 'Invoice Number', 'Invoice date',
        'Invoice Value', 'Place Of Supply', 'Reverse Charge', 'Applicable %',
        'Invoice Type', 'E-Commerce GSTIN', 'GST Rate', 'Taxable Value', 'Cess Amount'
      ];
      const headerRow = worksheet.getRow(4);
      headerRow.values = headers;
      headerRow.eachCell((cell) => {
        cell.font = { bold: true };
      });

      // Data Rows (from Row 5)
      b2bInvoices.forEach((inv, index) => {
        const row = worksheet.getRow(5 + index);
        row.getCell(1).value = inv.gstin || '';
        row.getCell(2).value = inv.receiverName || '';
        row.getCell(3).value = inv.invoiceNo || '';
        
        if (inv.invoiceDate) {
           const d = new Date(inv.invoiceDate);
           row.getCell(4).value = d;
           row.getCell(4).numFmt = 'dd-mmm-yy';
        }

        row.getCell(5).value = inv.invoiceValue || 0;
        row.getCell(5).numFmt = '0.00';

        row.getCell(6).value = inv.placeOfSupply || '';
        row.getCell(7).value = inv.reverseCharge || 'N';
        row.getCell(8).value = inv.applicablePercent || '';
        row.getCell(9).value = inv.invoiceType || 'Regular B2B';
        row.getCell(10).value = inv.ecommerceGstin || '';
        
        row.getCell(11).value = inv.gstRate || 0;
        row.getCell(11).numFmt = '0.00';

        row.getCell(12).value = inv.taxableValue || 0;
        row.getCell(12).numFmt = '0.00';

        row.getCell(13).value = inv.cessAmount || 0;
        row.getCell(13).numFmt = '0.00';
      });

      // Auto fit columns
      worksheet.columns.forEach((column, i) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, cell => {
          const columnLength = cell.value ? cell.value.toString().length : 10;
          if (columnLength > maxLength) {
            maxLength = columnLength;
          }
        });
        column.width = maxLength < 15 ? 15 : maxLength + 2;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `GSTR1_B2B_${dateRangeStr.replace(/ /g, '_')}.xlsx`);

      alert("Report Exported Successfully");
    } catch (err) {
      console.error("Export Failed", err);
      alert(err.message || "Failed to export report");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadJson = () => {
    const exportData = {
      gstin: companyDetails?.gstin || "",
      fp: "072026",
      version: "GST3.2.4",
      hash: "hash",
      b2b: data?.b2b ? [data.b2b] : [],
      b2cl: data?.b2cLarge ? [data.b2cLarge] : [],
      b2cs: data?.b2cSmall ? [data.b2cSmall] : [],
      exp: data?.exports ? [data.exports] : [],
      cdnr: data?.cdnr ? [data.cdnr] : [],
      cdnur: data?.cdnur ? [data.cdnur] : [],
      nil: data?.nilRated ? { inv: [data.nilRated] } : { inv: [] },
      hsn: data?.hsnB2b ? { data: [data.hsnB2b] } : { data: [] }
    };
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `returns_072026_R1_${companyDetails?.gstin || 'offline'}.json`;
    link.click();
    setIsJsonModalOpen(false);
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Particular', 'No. of Vouchers', 'Taxable Values', 'IGST', 'CGST', 'SGST', 'Cess', 'Tax Amount', 'Invoice Amount'],
      ['Total', data?.total?.count||0, data?.total?.taxable||0, data?.total?.igst||0, data?.total?.cgst||0, data?.total?.sgst||0, data?.total?.cess||0, data?.total?.taxAmt||0, data?.total?.invoiceAmt||0]
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "gstr1_summary.csv";
    link.click();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'GSTR1 Summary',
        text: 'Check out the GSTR1 Summary',
        url: window.location.href,
      }).catch(console.error);
    } else {
      alert('Sharing is not supported on this browser.');
    }
  };

  const renderRow = (title, key, rowClass = "text-gray-600", valClass = "font-bold text-gray-700", indent = true) => {
    const rowData = data && data[key] ? data[key] : { count: 0, taxable: 0, igst: 0, cgst: 0, sgst: 0, cess: 0, taxAmt: 0, invoiceAmt: 0 };
    return (
      <tr className="hover:bg-blue-50 transition-colors cursor-pointer">
        <td className={`py-2 ${indent ? 'px-6' : 'px-3'} border border-black text-[13px] ${rowClass}`}>{title}</td>
        <td className={`py-2 px-2 border border-black text-center text-[13px] ${valClass}`}>{rowData.count || 0}</td>
        <td className="py-2 px-2 border border-black text-center text-[13px]">{rowData.taxable ? rowData.taxable.toFixed(2) : ''}</td>
        <td className="py-2 px-2 border border-black text-center text-[13px]">{rowData.igst ? rowData.igst.toFixed(2) : ''}</td>
        <td className="py-2 px-2 border border-black text-center text-[13px]">{rowData.cgst ? rowData.cgst.toFixed(2) : ''}</td>
        <td className="py-2 px-2 border border-black text-center text-[13px]">{rowData.sgst ? rowData.sgst.toFixed(2) : ''}</td>
        <td className="py-2 px-2 border border-black text-center text-[13px]">{rowData.cess ? rowData.cess.toFixed(2) : ''}</td>
        <td className="py-2 px-2 border border-black text-center text-[13px]">{rowData.taxAmt ? rowData.taxAmt.toFixed(2) : ''}</td>
        <td className="py-2 px-2 border border-black text-center text-[13px]">{rowData.invoiceAmt ? rowData.invoiceAmt.toFixed(2) : ''}</td>
      </tr>
    );
  };

  const renderEmptyHeaderRow = (title) => (
    <tr className="hover:bg-blue-50 transition-colors cursor-pointer">
        <td className="py-2 px-3 border border-black text-[13px] font-bold text-gray-800">{title}</td>
        <td className="py-2 px-2 border border-black text-center text-[13px]"></td>
        <td className="py-2 px-2 border border-black text-center text-[13px]"></td>
        <td className="py-2 px-2 border border-black text-center text-[13px]"></td>
        <td className="py-2 px-2 border border-black text-center text-[13px]"></td>
        <td className="py-2 px-2 border border-black text-center text-[13px]"></td>
        <td className="py-2 px-2 border border-black text-center text-[13px]"></td>
        <td className="py-2 px-2 border border-black text-center text-[13px]"></td>
        <td className="py-2 px-2 border border-black text-center text-[13px]"></td>
    </tr>
  );

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-4 flex flex-col relative pb-[80px]">
      
      {/* Top Control */}
      <div className="mb-4 flex flex-col gap-1.5 w-full sm:max-w-[250px]">
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

      {/* Main Card */}
      <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden">
        
        {/* Header */}
        <div className="text-center py-4">
          <h2 className="text-[14px] text-gray-700 mb-1">GSTR1 Summary</h2>
          <p className="text-[14px] font-bold text-gray-800">{dateRangeStr}</p>
        </div>

        {/* Table */}
        <div className="px-4 pb-4 w-full">
          <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse border border-black text-left">
            <thead>
              <tr>
                <th className="py-2.5 px-3 border border-black text-[13px] font-bold text-gray-800 text-center w-[35%] whitespace-nowrap">Particular</th>
                <th className="py-2.5 px-2 border border-black text-[13px] font-bold text-gray-800 text-center leading-tight w-[7%] whitespace-nowrap">No. of<br/>Vouchers.</th>
                <th className="py-2.5 px-2 border border-black text-[13px] font-bold text-gray-800 text-center w-[10%] whitespace-nowrap">Taxable Values</th>
                <th className="py-2.5 px-2 border border-black text-[13px] font-bold text-gray-800 text-center w-[6%] whitespace-nowrap">IGST</th>
                <th className="py-2.5 px-2 border border-black text-[13px] font-bold text-gray-800 text-center w-[6%] whitespace-nowrap">CGST</th>
                <th className="py-2.5 px-2 border border-black text-[13px] font-bold text-gray-800 text-center w-[6%] whitespace-nowrap">SGST</th>
                <th className="py-2.5 px-2 border border-black text-[13px] font-bold text-gray-800 text-center w-[6%] whitespace-nowrap">Cess</th>
                <th className="py-2.5 px-2 border border-black text-[13px] font-bold text-gray-800 text-center w-[10%] whitespace-nowrap">Tax Amount</th>
                <th className="py-2.5 px-2 border border-black text-[13px] font-bold text-gray-800 text-center w-[14%] whitespace-nowrap">Invoice<br/>Amount</th>
              </tr>
            </thead>
            <tbody>
              {renderEmptyHeaderRow("B2B Invoices - 4A, 4B, 4C, 6B, 6C")}
              {renderRow("Taxable Sales", "b2b")}
              {renderRow("Reverse charge supplies", "reverseCharge")}
              
              {renderRow("B2C(Large) Invoices - 5A, 5B", "b2cLarge", "font-bold text-gray-800", "font-bold text-gray-700", false)}
              {renderRow("B2C(Small) Invoices - 7", "b2cSmall", "font-bold text-gray-800", "font-bold text-gray-700", false)}
              {renderRow("Credit/Debit Notes(Registered) - 9B", "cdnr", "font-bold text-gray-800", "font-bold text-gray-700", false)}
              {renderRow("Credit/Debit Notes(Unregistered) - 9B", "cdnur", "font-bold text-gray-800", "font-bold text-gray-700", false)}
              {renderRow("Exports Invoices -6A", "exports", "font-bold text-gray-800", "font-bold text-gray-700", false)}
              
              {renderEmptyHeaderRow("Tax Liability(Advances received) - 11A(1),11A(2)")}
              {renderEmptyHeaderRow("Adjustment of Advances - I I B(I), II B(2)")}
              {renderEmptyHeaderRow("Nil Rated Invoices - 8A, 8B, 8C, 8D")}
              
              {renderRow("Nil Rated Supplies", "nilRated")}
              {renderRow("Exempted Supplies", "exempted")}
              {renderRow("Non-GST Supplies", "nonGst")}
              
              {renderRow("Total", "total", "font-bold text-[#4F46E5]", "font-bold text-gray-800", false)}
              
              {renderRow("HSN/SAC summary (b2b)", "hsnB2b", "font-bold text-gray-800", "font-bold text-gray-800", false)}
              {renderRow("HSN/SAC summary (b2c)", "hsnB2c", "font-bold text-gray-800", "font-bold text-gray-800", false)}
              {renderEmptyHeaderRow("Document Summary")}

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
                    fetchSummary('Custom Range', customStartDate, customEndDate);
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

      {/* JSON Export Modal */}
      {isJsonModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-sm shadow-xl w-full max-w-[900px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#ffc107] flex items-center justify-between pl-4 pr-1 py-1.5">
              <h2 className="text-[15px] text-gray-900 font-bold">Confirm GSTR-1 JSON Export</h2>
              <button 
                onClick={() => setIsJsonModalOpen(false)}
                className="text-[#dc3545] hover:text-[#c82333] transition-colors p-1 bg-white rounded-sm"
              >
                <X className="w-5 h-5 stroke-[3px]" />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-4 bg-gray-50 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-gray-700 bg-white p-2 border border-gray-200 rounded-sm">
                <p><span className="font-bold">GSTIN:</span> {companyDetails?.gstin || 'Not Provided'}</p>
                <p><span className="font-bold">Period:</span> {dateRangeStr.replace('From ', '').replace(' To ', ' to ')} (fp: 072026)</p>
                <p><span className="font-bold">File:</span> returns_072026_R1_{companyDetails?.gstin || 'offline'}.json</p>
                <p><span className="font-bold">Schema:</span> GST3.2.4</p>
              </div>
              
              {/* Table container */}
              <div className="border border-gray-300 rounded-sm bg-white overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-left">
                  <thead>
                    <tr className="bg-gray-700 text-white">
                      <th className="py-2 px-3 border border-gray-400 text-[12px] font-bold text-center w-[35%] whitespace-nowrap">Particular</th>
                      <th className="py-2 px-2 border border-gray-400 text-[12px] font-bold text-center leading-tight w-[7%] whitespace-nowrap">No. of<br/>Vouchers.</th>
                      <th className="py-2 px-2 border border-gray-400 text-[12px] font-bold text-center w-[10%] whitespace-nowrap">Taxable Values</th>
                      <th className="py-2 px-2 border border-gray-400 text-[12px] font-bold text-center w-[6%] whitespace-nowrap">IGST</th>
                      <th className="py-2 px-2 border border-gray-400 text-[12px] font-bold text-center w-[6%] whitespace-nowrap">CGST</th>
                      <th className="py-2 px-2 border border-gray-400 text-[12px] font-bold text-center w-[6%] whitespace-nowrap">SGST</th>
                      <th className="py-2 px-2 border border-gray-400 text-[12px] font-bold text-center w-[6%] whitespace-nowrap">Cess</th>
                      <th className="py-2 px-2 border border-gray-400 text-[12px] font-bold text-center w-[10%] whitespace-nowrap">Tax Amount</th>
                      <th className="py-2 px-2 border border-gray-400 text-[12px] font-bold text-center w-[14%] whitespace-nowrap">Invoice<br/>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderEmptyHeaderRow("B2B Invoices - 4A, 4B, 4C, 6B, 6C")}
                    {renderRow("Taxable Sales", "b2b")}
                    {renderRow("Reverse charge supplies", "reverseCharge")}
                    
                    {renderRow("B2C(Large) Invoices - 5A, 5B", "b2cLarge", "font-bold text-gray-800", "font-bold text-gray-700", false)}
                    {renderRow("B2C(Small) Invoices - 7", "b2cSmall", "font-bold text-gray-800", "font-bold text-gray-700", false)}
                    {renderRow("Credit/Debit Notes(Registered) - 9B", "cdnr", "font-bold text-gray-800", "font-bold text-gray-700", false)}
                    {renderRow("Credit/Debit Notes(Unregistered) - 9B", "cdnur", "font-bold text-gray-800", "font-bold text-gray-700", false)}
                    {renderRow("Exports Invoices -6A", "exports", "font-bold text-gray-800", "font-bold text-gray-700", false)}
                    
                    {renderEmptyHeaderRow("Tax Liability(Advances received) - 11A(1),11A(2)")}
                    {renderEmptyHeaderRow("Adjustment of Advances - 11B(1), 11B(2)")}
                  </tbody>
                </table>
              </div>

              {/* Warning */}
              <div className="bg-[#ffc107] p-3 rounded-sm flex flex-col gap-1 text-[13px] text-gray-900 font-medium">
                <p className="font-bold">2 warning(s) — file can still download, fix before portal upload if needed:</p>
                <ul className="list-disc pl-5 font-normal">
                  <li>HSN/SAC details not provided for some items.</li>
                  <li>Some invoices have missing place of supply.</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white px-4 py-3 flex justify-end gap-2 border-t border-gray-200">
              <button 
                onClick={() => setIsJsonModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-1.5 rounded-sm text-[13px] font-medium transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDownloadJson}
                className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-4 py-1.5 rounded-sm text-[13px] font-medium transition-colors flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" /> Download JSON
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Buttons */}`
      <div className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-2 sm:p-3 footer-btns z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button 
          onClick={() => navigate(-1)}
          className="bg-[#007bff] hover:bg-[#0069d9] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1 shadow-sm transition-colors"
        >
          <span className="text-[16px] leading-none mt-[-2px]">&laquo;</span> Go back
        </button>
        <button 
          onClick={handleShare}
          className="bg-[#28a745] hover:bg-[#218838] text-white text-[13px] font-medium px-3 py-1.5 rounded-[3px] flex items-center justify-center shadow-sm transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
        <button 
          onClick={() => window.open('https://web.whatsapp.com/', '_blank')}
          className="bg-[#28a745] hover:bg-[#218838] text-white text-[13px] font-medium px-3 py-1.5 rounded-[3px] flex items-center justify-center shadow-sm transition-colors">
          <MessageCircle className="w-4 h-4 fill-white" />
        </button>
        <button 
          onClick={() => setIsJsonModalOpen(true)}
          disabled={loading}
          className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1.5 shadow-sm transition-colors disabled:opacity-70">
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Export to Json
        </button>
        <button 
          onClick={handleExportExcel}
          className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1.5 shadow-sm transition-colors">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

    </div>
  );
}
