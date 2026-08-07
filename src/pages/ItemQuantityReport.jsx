import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Filter, Upload, BarChart2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import apiClient from '../api/apiClient';
import { ProductSelectDropdown } from '../components/ProductSelectDropdown';

export function ItemQuantityReport() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState({ product: null, transactions: [], openingStock: 0 });
  const [loading, setLoading] = useState(true);
  const [searchParty, setSearchParty] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (id && id !== '0') {
      fetchReport();
    } else {
      setLoading(false);
      setReportData({ product: null, transactions: [], openingStock: 0 });
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products');
      const allProds = res.data.products || res.data.data || res.data;
      setProducts(allProds || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/products/${id}/quantity-report`);
      if (res.data.success) {
        setReportData(res.data);
      }
    } catch (error) {
      console.error('Error fetching item quantity report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const doc = new jsPDF();
    doc.text("Item Quantity Report", 14, 15);
    
    if (reportData.product) {
      doc.text(`Product: ${reportData.product.name}`, 14, 25);
      doc.text(`Opening Stock: ${reportData.openingStock}`, 14, 32);
    }

    const tableColumn = ["#", "Party Name", "Date", "Type", "QTY IN", "QTY OUT", "PRICE", "TOTAL", "STOCK"];
    const tableRows = [];

    let filteredTransactions = reportData.transactions || [];
    if (searchParty) {
      filteredTransactions = filteredTransactions.filter(t => t.partyName.toLowerCase().includes(searchParty.toLowerCase()));
    }

    filteredTransactions.forEach((trx, index) => {
      const dateStr = new Date(trx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
      const rowData = [
        index + 1,
        trx.partyName,
        dateStr,
        trx.type.replace('_', ' '),
        trx.qtyIn > 0 ? trx.qtyIn : '-',
        trx.qtyOut > 0 ? trx.qtyOut : '-',
        trx.price,
        trx.total,
        trx.runningStock
      ];
      tableRows.push(rowData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: reportData.product ? 40 : 25,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    doc.save(`Item_Quantity_Report_${reportData.product ? reportData.product.name : 'Unknown'}.pdf`);
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-60px)] flex flex-col">
      {/* Top Teal Bar */}
      <div className="bg-[#4F46E5] px-4 py-[6px] flex justify-between items-center text-white">
        <h2 className="text-[14.5px] font-medium tracking-wide">Item Quantity Report</h2>
        
        <div className="flex flex-wrap items-center gap-1.5 ml-2">
          <button 
            onClick={handleExport}
            className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-[5px] rounded-[3px] text-[12px] font-bold flex items-center gap-1.5 transition-colors"
          >
            <Upload className="w-[14px] h-[14px]" strokeWidth={2.5} /> Export
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-2 py-[5px] rounded-[3px] flex items-center justify-center transition-colors ml-1"
          >
            <X className="w-[14px] h-[14px]" strokeWidth={3} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4">
        {/* Product & Party Selection */}
        <div className="bg-white border border-gray-200 rounded-[3px] shadow-sm mb-4 flex flex-col sm:flex-row gap-4 p-4">
          <div className="flex-1">
             <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Select Product</label>
             <div className="border border-gray-300 rounded-[3px] h-[34px]">
               <ProductSelectDropdown
                 products={products}
                 value={id === '0' ? '' : id}
                 onChange={(newId) => navigate(`/admin/items_quantity_report/${newId || '0'}`)}
                 onEdit={() => {}}
                 onDelete={() => {}}
                 searchMode="Product Name"
               />
             </div>
          </div>
          <div className="flex-1">
             <label className="text-[12px] font-bold text-gray-700 mb-1.5 block">Search Party</label>
             <div className="flex border border-gray-300 rounded-[3px] h-[34px] overflow-hidden">
                <div className="flex items-center px-3 border-r border-gray-300 bg-gray-50">
                  <Filter className="w-4 h-4 text-[#007bff]" strokeWidth={2.5} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search for Party Name" 
                  value={searchParty}
                  onChange={(e) => setSearchParty(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-[13px] outline-none text-gray-700 placeholder-gray-400 bg-white"
                />
             </div>
          </div>
        </div>

        {/* Opening Quantity Box */}
        <div className="bg-[#343a40] text-white rounded-[4px] p-3 flex justify-between items-center mb-4 shadow-sm">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-gray-300" />
            <span className="text-[14px] font-bold text-gray-200">Opening Quantity {reportData.product ? `(${reportData.product.name})` : ''}</span>
          </div>
          <div className="bg-[#495057] px-3 py-1 rounded-[12px] text-[13px] font-bold border border-gray-600">
            {reportData.openingStock}
          </div>
        </div>

        {loading ? (
          <div className="p-4 text-center text-gray-500">Loading report...</div>
        ) : !id || id === '0' ? (
          <div className="p-4 text-center text-gray-500">Please select a valid product to view the report.</div>
        ) : (
          reportData.transactions
            .filter(t => t.partyName.toLowerCase().includes(searchParty.toLowerCase()))
            .map((trx, index) => {
              const dateStr = new Date(trx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' }).replace(/ /g, '-');
              const isPurchase = trx.type === 'PURCHASE' || trx.type === 'PURCHASE_RETURN';
              const headerColor = isPurchase ? 'bg-[#198754]' : 'bg-[#e06666]';
              const badgeColor = isPurchase ? 'bg-[#28a745]' : 'bg-[#e06666]';
              const displayType = trx.type.replace('_', ' ');

              return (
                <div key={trx.id} className="bg-white rounded-[4px] shadow-sm border border-gray-200 mb-4 overflow-hidden">
                  <div className={`${headerColor} text-white px-4 py-2 flex justify-between items-center`}>
                    <div className="font-bold text-[14px] capitalize">{trx.partyName}</div>
                    <div className="flex items-center gap-2">
                      <span className="bg-white text-gray-800 text-[12px] font-bold px-2 py-0.5 rounded-[12px]">{dateStr}</span>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-center text-[13px]">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold">
                        <tr>
                          <th className="py-2 px-2 border-r border-gray-200 w-[60px]">#</th>
                          <th className="py-2 px-4 border-r border-gray-200 text-left">Product Name</th>
                          <th className="py-2 px-4 border-r border-gray-200">QTY IN</th>
                          <th className="py-2 px-4 border-r border-gray-200">QTY OUT</th>
                          <th className="py-2 px-4 border-r border-gray-200">PRICE</th>
                          <th className="py-2 px-4 border-r border-gray-200">TOTAL</th>
                          <th className="py-2 px-4">STOCK</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-600">
                        <tr className="border-b border-gray-200">
                          <td className="py-2 px-2 border-r border-gray-200">{index + 1}</td>
                          <td className="py-2 px-4 border-r border-gray-200 text-left">{trx.productName}</td>
                          <td className="py-2 px-4 border-r border-gray-200">{trx.qtyIn > 0 ? trx.qtyIn : '-'}</td>
                          <td className="py-2 px-4 border-r border-gray-200">{trx.qtyOut > 0 ? trx.qtyOut : '-'}</td>
                          <td className="py-2 px-4 border-r border-gray-200">{trx.price}</td>
                          <td className="py-2 px-4 border-r border-gray-200">{trx.total}</td>
                          <td className="py-2 px-4">{trx.runningStock}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="bg-[#e9ecef] px-4 py-2 flex justify-between items-center">
                    <span className={`${badgeColor} text-white text-[11px] font-bold px-3 py-1 rounded-[12px] uppercase`}>{displayType}</span>
                    <button 
                      onClick={() => {
                        const invoiceId = trx.invoiceId;
                        let targetPath = '';
                        if (trx.type === 'PURCHASE') targetPath = `/admin/create_invoices/company_purchase?id=${invoiceId}`;
                        else if (trx.type === 'PURCHASE_RETURN') targetPath = `/admin/create_invoices/company_purchase_return?id=${invoiceId}`;
                        else if (trx.type === 'SALES_RETURN') targetPath = `/admin/sales-return-invoice?id=${invoiceId}`;
                        else targetPath = `/admin/sales-invoice?id=${invoiceId}`;
                        navigate(targetPath);
                      }}
                      className="bg-[#343a40] hover:bg-[#23272b] text-white text-[12px] font-bold px-4 py-1.5 rounded-[3px] transition-colors"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
