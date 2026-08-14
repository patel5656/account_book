import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, GitMerge, Plus, Printer, RefreshCw, FileDown, Filter, Search,
  CheckSquare, Square, Edit2, Trash2, Tag, AlertCircle, Eye, 
  ChevronDown, ChevronRight, Package, LayoutGrid
} from 'lucide-react';
import { ItemMasterModal } from '../components/ItemMasterModal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useSettings } from '../context/SettingsContext';
import apiClient from '../api/apiClient';

export function StockDetails() {
  const navigate = useNavigate();
  const { formatAmount, currentCurrency } = useSettings();
  const [viewMode, setViewMode] = useState('item'); // 'item' or 'brand'
  const [rows, setRows] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      if (response.data && response.data.data) {
        setRows(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [searchFilter, setSearchFilter] = useState('Product Name');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('');
  
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeIncorrectId, setMergeIncorrectId] = useState('');
  const [mergeCorrectId, setMergeCorrectId] = useState('');

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkEditFields, setBulkEditFields] = useState({ price: '', category: '', warehouse: '', status: '' });
  
  const [showPreview, setShowPreview] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState(new Set());
  const [viewModalData, setViewModalData] = useState(null);
  const [averagePrice, setAveragePrice] = useState(null);
  const [averageSalePrice, setAverageSalePrice] = useState(null);
  const [totalAveragePrice, setTotalAveragePrice] = useState(null);
  const [priceWiseStock, setPriceWiseStock] = useState([]);
  const [totalPurchaseQty, setTotalPurchaseQty] = useState(0);
  const [totalSaleQty, setTotalSaleQty] = useState(0);
  const [isLoadingAvgPrice, setIsLoadingAvgPrice] = useState(false);

  const handleViewModal = async (item) => {
    setViewModalData(item);
    setAveragePrice(null);
    setAverageSalePrice(null);
    setTotalAveragePrice(null);
    setPriceWiseStock([]);
    setTotalPurchaseQty(0);
    setTotalSaleQty(0);
    setIsLoadingAvgPrice(true);
    try {
      const res = await apiClient.get(`/products/${item.id}/average-price`);
      if (res.data && res.data.success) {
        setAveragePrice(res.data.averagePrice);
        setAverageSalePrice(res.data.averageSalePrice);
        setTotalAveragePrice(res.data.totalAveragePrice);
        setPriceWiseStock(res.data.priceWiseStock || []);
        setTotalPurchaseQty(res.data.totalPurchaseQty || 0);
        setTotalSaleQty(res.data.totalSaleQty || 0);
      } else {
        setAveragePrice(item.price || 0);
      }
    } catch (err) {
      console.error("Failed to fetch average price", err);
      setAveragePrice(item.price || 0);
    } finally {
      setIsLoadingAvgPrice(false);
    }
  };

  const handleDeleteItem = (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      apiClient.delete(`/products/${id}`).then(() => {
        setRows(prev => prev.filter(r => r.id !== id));
      }).catch(err => console.error("Failed to delete", err));
    }
  };

  const handleSaveItem = async (newItem) => {
    try {
      const payload = {
        ...newItem,
        sku: newItem.sku || `SKU${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        price: parseFloat(newItem.price) || 0,
        mrp: parseFloat(newItem.mrp) || 0,
        stock: parseInt(newItem.qty) || 0,
      };
      
      if (editData) {
        await apiClient.put(`/products/${editData.id}`, payload);
      } else {
        await apiClient.post('/products', payload);
      }
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert(error.response?.data?.message || 'Failed to save product');
    }
  };

  // Filtering
  const filtered = rows.filter(r => {
    const s = search.toLowerCase();
    let matchSearch = true;
    
    if (s) {
      if (searchFilter === 'Product Name') matchSearch = r.name?.toLowerCase().includes(s);
      else if (searchFilter === 'Product Code' || searchFilter === 'Barcode') matchSearch = r.sku?.toLowerCase().includes(s) || r.barcode?.toLowerCase().includes(s);
      else if (searchFilter === 'Company') matchSearch = r.brand?.toLowerCase().includes(s);
      else if (searchFilter === 'Category') matchSearch = r.category?.toLowerCase().includes(s);
      else if (searchFilter === 'Product Type') matchSearch = r.baseUnit?.toLowerCase().includes(s);
      else if (searchFilter === 'GST') matchSearch = String(r.tax || '').includes(s);
      else if (searchFilter === 'HSN/SAC') matchSearch = r.hsnCode?.toLowerCase().includes(s);
      else matchSearch = r.name?.toLowerCase().includes(s) || r.sku?.toLowerCase().includes(s) || r.brand?.toLowerCase().includes(s);
    }
    const matchCat = !categoryFilter || r.category === categoryFilter;
    const matchWh = !warehouseFilter || r.warehouse === warehouseFilter;
    const matchStock = !stockFilter || stockFilter === 'Show All' ||
      (stockFilter === 'Only In Stock' && r.stock > 0) ||
      (stockFilter === 'Only Negative' && r.stock < 0) ||
      (stockFilter === 'Zero Stock' && r.stock === 0) ||
      (stockFilter === 'Expire' && false) || // Not mapped yet
      (stockFilter === 'Expiry Soon' && false) || // Not mapped yet
      (stockFilter === 'Stock Aging' && false); // Not mapped yet
    return matchSearch && matchCat && matchStock && matchWh;
  });

  const brandData = {};
  filtered.forEach(r => {
    const bName = r.brand || 'Unbranded';
    if (!brandData[bName]) {
      brandData[bName] = {
        name: bName,
        items: [],
        totalQty: 0,
        totalValue: 0,
        lowStockCount: 0,
        outOfStockCount: 0
      };
    }
    const b = brandData[bName];
    b.items.push(r);
    b.totalQty += r.stock;
    b.totalValue += (r.stock * r.sale);
    if (r.stock === 0) b.outOfStockCount++;
    else if (r.stock < 10) b.lowStockCount++;
  });
  const brandList = Object.values(brandData).sort((a, b) => a.name.localeCompare(b.name));

  const toggleBrandExpand = (bName) => {
    setExpandedBrands(prev => {
      const n = new Set(prev);
      n.has(bName) ? n.delete(bName) : n.add(bName);
      return n;
    });
  };

  // Bulk Selection
  const allSelected = filtered.length > 0 && filtered.every(r => selected.has(r.id));
  const toggleAll = () => {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(r => n.delete(r.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(r => n.add(r.id)); return n; });
    }
  };
  const toggleRow = (id) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectedCount = selected.size;

  const triggerBulkAction = (action) => {
    if (selectedCount === 0) { alert('Please select at least one item first.'); return; }
    setConfirmAction(action);
    setShowConfirm(true);
  };

  const executeBulkAction = async () => {
    setShowConfirm(false);
    if (confirmAction === 'delete') {
      try {
        await Promise.all(Array.from(selected).map(id => apiClient.delete(`/products/${id}`)));
        setRows(prev => prev.filter(r => !selected.has(r.id)));
      } catch (err) {
        console.error("Failed to delete some items", err);
        alert("Failed to delete some items.");
      }
    } else if (confirmAction === 'activate') {
      setRows(prev => prev.map(r => selected.has(r.id) ? { ...r, status: 'Active' } : r));
    } else if (confirmAction === 'deactivate') {
      setRows(prev => prev.map(r => selected.has(r.id) ? { ...r, status: 'Inactive' } : r));
    } else if (confirmAction === 'bulkEdit') {
      setRows(prev => prev.map(r => {
        if (!selected.has(r.id)) return r;
        return {
          ...r,
          sale: bulkEditFields.price ? Number(bulkEditFields.price) : r.sale,
          category: bulkEditFields.category || r.category,
          warehouse: bulkEditFields.warehouse || r.warehouse,
          status: bulkEditFields.status || r.status,
        };
      }));
      setShowBulkEdit(false);
      setBulkEditFields({ price: '', category: '', warehouse: '', status: '' });
    }
    setSelected(new Set());
    setConfirmAction(null);
  };

  // Printing & Exporting
  const now = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
  const handlePrint = () => window.print();
  
  const handlePDF = async () => {
    const printElement = document.getElementById('print-report');
    if (!printElement) return;
    
    // Temporarily make it visible off-screen for html2canvas
    const originalDisplay = printElement.style.display;
    printElement.style.display = 'block';
    printElement.style.position = 'absolute';
    printElement.style.left = '-9999px';
    printElement.style.top = '-9999px';
    printElement.style.width = '210mm'; // A4 width
    printElement.style.padding = '15mm';
    printElement.style.background = 'white';
    printElement.style.color = 'black';
    
    try {
      const canvas = await html2canvas(printElement, { 
        scale: 2, 
        useCORS: true,
        onclone: (clonedDoc) => {
          const oklchRegex = /oklch\([^)]*\)/gi;
          clonedDoc.querySelectorAll('*').forEach(el => {
            if (el.style) {
              ['color', 'backgroundColor', 'borderColor'].forEach(p => {
                if (el.style[p] && oklchRegex.test(el.style[p])) el.style[p] = '#000000';
              });
              if (el.style.cssText && oklchRegex.test(el.style.cssText)) {
                el.style.cssText = el.style.cssText.replace(oklchRegex, '#000000');
              }
            }
          });
          clonedDoc.querySelectorAll('style').forEach(tag => {
            if (oklchRegex.test(tag.textContent)) tag.textContent = tag.textContent.replace(oklchRegex, '#000000');
          });
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save(viewMode === 'brand' ? 'Brandwise_Inventory_Report.pdf' : 'Inventory_Stock_Report.pdf');
    } catch (err) {
      console.error("PDF generation failed", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      // Restore styles
      printElement.style.display = originalDisplay;
      printElement.style.position = '';
      printElement.style.left = '';
      printElement.style.top = '';
      printElement.style.width = '';
      printElement.style.padding = '';
      printElement.style.background = '';
      printElement.style.color = '';
    }
  };
  
  const handleExportCSV = () => {
    if (viewMode === 'brand') {
      const headers = ['Brand Name', 'Total Items', 'Available Qty', `Total Value (${currentCurrency.symbol})`, 'Low Stock', 'Out of Stock'];
      const csvRows = [headers.join(',')];
      brandList.forEach(b => {
        csvRows.push([`"${b.name}"`, b.items.length, b.totalQty, b.totalValue, b.lowStockCount, b.outOfStockCount].join(','));
      });
      downloadBlob(csvRows.join('\n'), 'brandwise_inventory_report.csv');
    } else {
      const headers = ['#', 'SKU', 'Product Name', 'Brand', 'Category', 'Unit', 'Purchase Price', 'Sale Price', 'Stock', 'Warehouse', 'Status'];
      const csvRows = [headers.join(',')];
      filtered.forEach((r, i) => {
        csvRows.push([i+1, `"${r.sku}"`, `"${r.name}"`, `"${r.brand}"`, `"${r.category}"`, r.baseUnit, r.purchasePrice, r.sale, r.stock, `"${r.warehouse}"`, r.status].join(','));
      });
      downloadBlob(csvRows.join('\n'), 'inventory_report.csv');
    }
  };

  const downloadBlob = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.setAttribute('download', filename);
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  const categories = [...new Set(rows.map(r => r.category).filter(Boolean))];
  const warehouses = [...new Set(rows.map(r => r.warehouse).filter(Boolean))];
  const grandTotal = filtered.reduce((s, r) => s + ((r.price || 0) * (r.stock || 0)), 0);
  const totalStockQty = filtered.reduce((s, r) => s + (r.stock || 0), 0);

  return (
    <>
      {/* ======= PRINT STYLES ======= */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #print-report { display: block !important; }
          @page { margin: 15mm; size: A4 portrait; }
        }
        #print-report { display: none; }
      `}</style>

      {/* ======= HIDDEN PRINTABLE REPORT ======= */}
      <div id="print-report" style={{ fontFamily: 'Arial, sans-serif', fontSize: '11px', color: '#111' }}>
        <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '2px solid #333', paddingBottom: '10px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Swayam Bill Book</div>

          <div style={{ fontSize: '16px', fontWeight: 'bold', marginTop: '4px' }}>
            {viewMode === 'brand' ? 'Brand-wise Inventory Summary' : 'Inventory Stock Report'}
          </div>
          <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>Generated on: {now}</div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '8px', textAlign: 'center', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>Total Items</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{filtered.length}</div>
          </div>
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '8px', textAlign: 'center', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>Total Stock Qty</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#28a745' }}>{totalStockQty}</div>
          </div>
          <div style={{ flex: 1, border: '1px solid #ddd', padding: '8px', textAlign: 'center', borderRadius: '4px' }}>
            <div style={{ fontSize: '10px', color: '#666' }}>Total Stock Value</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4F46E5' }}>{formatAmount(grandTotal)}</div>
          </div>
        </div>

        {viewMode === 'brand' ? (
          <div>
            {brandList.map((b, i) => (
              <div key={b.name} style={{ marginBottom: '15px', border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ background: '#f4f6f9', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid #ccc' }}>
                  <span>{b.name}</span>
                  <span>Qty: {b.totalQty} | Value: {formatAmount(b.totalValue)}</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
                  <thead>
                    <tr style={{ background: '#eaeaea' }}>
                      <th style={{ borderBottom: '1px solid #ddd', padding: '4px 8px', textAlign: 'left' }}>SKU / Item</th>
                      <th style={{ borderBottom: '1px solid #ddd', padding: '4px 8px', textAlign: 'center' }}>Unit</th>
                      <th style={{ borderBottom: '1px solid #ddd', padding: '4px 8px', textAlign: 'right' }}>Pur. Price</th>
                      <th style={{ borderBottom: '1px solid #ddd', padding: '4px 8px', textAlign: 'right' }}>Sale Price</th>
                      <th style={{ borderBottom: '1px solid #ddd', padding: '4px 8px', textAlign: 'right' }}>Qty</th>
                      <th style={{ borderBottom: '1px solid #ddd', padding: '4px 8px', textAlign: 'right' }}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {b.items.map(item => (
                      <tr key={item.id}>
                        <td style={{ borderBottom: '1px solid #eee', padding: '4px 8px' }}>
                          <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                          <div style={{ color: '#666', fontSize: '9px' }}>{item.sku}</div>
                        </td>
                        <td style={{ borderBottom: '1px solid #eee', padding: '4px 8px', textAlign: 'center' }}>{item.baseUnit}</td>
                        <td style={{ borderBottom: '1px solid #eee', padding: '4px 8px', textAlign: 'right' }}>{formatAmount(item.purchasePrice)}</td>
                        <td style={{ borderBottom: '1px solid #eee', padding: '4px 8px', textAlign: 'right' }}>{formatAmount(item.sale)}</td>
                        <td style={{ borderBottom: '1px solid #eee', padding: '4px 8px', textAlign: 'right' }}>{item.stock}</td>
                        <td style={{ borderBottom: '1px solid #eee', padding: '4px 8px', textAlign: 'right' }}>{formatAmount(item.stock * item.sale)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10px' }}>
            <thead>
              <tr style={{ background: '#343a40', color: '#fff' }}>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left' }}>SKU / Product</th>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'left' }}>Brand</th>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'center' }}>Unit</th>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>Pur. Price</th>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>Sale Price</th>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>Qty</th>
                <th style={{ border: '1px solid #ccc', padding: '5px', textAlign: 'right' }}>Value ({currentCurrency.symbol})</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>
                    <div style={{ fontWeight: 'bold' }}>{r.name}</div>
                    <div style={{ color: '#666', fontSize: '9px' }}>{r.sku}</div>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '4px' }}>{r.brand}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'center' }}>{r.baseUnit}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>{formatAmount(r.purchasePrice)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>{formatAmount(r.sale)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>{r.stock}</td>
                  <td style={{ border: '1px solid #ddd', padding: '4px', textAlign: 'right' }}>{formatAmount(r.stock * r.sale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div style={{ marginTop: '20px', fontSize: '9px', color: '#888', textAlign: 'center' }}>System-generated report from Swayam Bill Book</div>

      </div>

      {/* ======= MAIN UI ======= */}
      <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative pb-[50px]">
        <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-white text-[16px] font-medium tracking-wide">Stock Details</h2>
            
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => setMergeModalOpen(true)} className="flex items-center gap-1.5 bg-white text-gray-800 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm">
                <GitMerge className="w-4 h-4" /> Merge
              </button>
              <button className="flex items-center gap-1.5 bg-[#343a40] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm">
                <Search className="w-4 h-4" /> Find Duplicates
              </button>
              <button onClick={() => setShowBulkEdit(true)} className="flex items-center gap-1.5 bg-[#ffc107] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm">
                <Edit2 className="w-4 h-4" /> Bulk Update
              </button>
              <button onClick={() => { setEditData(null); setAddModalOpen(true); }} className="flex items-center gap-1 bg-[#28a745] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm">
                <Plus className="w-4 h-4" strokeWidth={3} /> Add
              </button>
              <button onClick={handleExportCSV} className="flex items-center gap-1.5 bg-[#ffc107] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm">
                <FileDown className="w-4 h-4" /> Export
              </button>
              <button onClick={() => navigate('/dashboard')} className="bg-[#dc3545] text-white p-1.5 rounded-[3px] transition-colors shadow-sm">
                <X className="w-4 h-4 font-bold" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-3 border-b border-gray-200" style={{ backgroundColor: '#4F46E5' }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
               <div className="flex flex-wrap sm:flex-nowrap items-center flex-1 w-full gap-2">
                 <div className="flex items-center bg-white border border-gray-300 rounded-[3px] overflow-hidden">
                   <div className="px-2 text-blue-500"><FilterIcon className="w-4 h-4" /></div>
                   <select 
                     value={searchFilter}
                     onChange={(e) => setSearchFilter(e.target.value)}
                     className="border-l border-gray-300 px-2 py-1.5 text-[13px] outline-none bg-white text-gray-600"
                   >
                     <option>Product Name</option>
                     <option>Product Code</option>
                     <option>Barcode</option>
                     <option>Company</option>
                     <option>Category</option>
                     <option>Product Type</option>
                     <option>Gst Applicable</option>
                     <option>GST</option>
                     <option>Product Commision</option>
                     <option>HSN/SAC</option>
                   </select>
                 </div>
                 <input 
                   type="text" 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder={`Search for ${searchFilter}`} 
                   className="flex-1 min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none bg-white placeholder-gray-500"
                 />
               </div>
               <div className="w-full sm:w-auto">
                 <select 
                   value={stockFilter}
                   onChange={(e) => setStockFilter(e.target.value)}
                   className="border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none bg-white text-gray-600 w-full sm:w-[150px]"
                 >
                   <option value="Show All">Show All</option>
                   <option value="Only In Stock">Only In Stock</option>
                   <option value="Only Negative">Only Negative</option>
                   <option value="Zero Stock">Zero Stock</option>
                   <option value="Expire">Expire</option>
                   <option value="Expiry Soon">Expiry Soon</option>
                   <option value="Stock Aging">Stock Aging</option>
                 </select>
               </div>
            </div>
          </div>

          {/* Main Content Area - Cards */}
          <div className="flex-1 overflow-y-auto bg-white p-4">
            <div className="max-w-[1200px] mx-auto flex flex-col gap-4">
              {filtered.length > 0 && (
                <div className="flex items-center gap-2 bg-white p-2 rounded-[5px] shadow-sm border border-gray-200">
                  <input
                    type="checkbox"
                    checked={allSelected && filtered.length > 0}
                    onChange={toggleAll}
                    className="w-4 h-4 cursor-pointer rounded-sm"
                  />
                  <span className="text-[13px] font-medium text-gray-700">Select All</span>
                  {selectedCount > 0 && (
                    <>
                      <button
                        onClick={() => triggerBulkAction('delete')}
                        className="bg-[#dc3545] hover:bg-[#c82333] text-white px-3 py-1.5 rounded-[4px] text-[13px] font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete ({selectedCount})
                      </button>
                      <button
                        onClick={() => setSelected(new Set())}
                        className="bg-[#6c757d] hover:bg-[#5a6268] text-white px-3 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              )}
              {filtered.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-[6px] p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <input 
                        type="checkbox" 
                        className="mt-1 w-4 h-4 cursor-pointer" 
                        checked={selected.has(item.id)} 
                        onChange={() => toggleRow(item.id)} 
                      />
                      <div>
                        <div className="text-[15px] text-gray-800">
                          <span className="font-bold">#{index + 1}. {item.name}</span> - <span className="text-[#28a745] font-bold">{item.category}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-[12px] text-gray-600">
                          <span>Sale Price : <span className="text-[#28a745] border border-[#28a745] px-1.5 py-0.5 rounded font-bold">{item.price} / {item.baseUnit?.toUpperCase()}</span></span>
                          <span>MRP : <span className="border border-gray-300 px-1.5 py-0.5 rounded text-gray-700">{item.mrp} / {item.baseUnit?.toUpperCase()}</span></span>
                        </div>
                        <div className="text-[12px] text-gray-500 mt-1">Barcodes : [{item.sku}]</div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-[13px] text-gray-600 flex justify-end items-center gap-1">
                        {(item.qty != null || item.stock != null) && (
                          <>P.QTY : <span className="font-bold text-gray-800">{item.stock ?? item.qty} {item.baseUnit?.toUpperCase() || item.purchaseUnit?.toUpperCase()}</span> <span className="text-gray-300 mx-1">|</span> </>
                        )}
                        value : <span className="font-bold text-gray-800">{formatAmount((item.purchasePrice || 0) * (item.stock ?? item.qty ?? 0)).replace('₹', '')}</span>
                      </div>
                      <div className="text-[13px] text-gray-600 flex justify-end mt-0.5">
                        S.QTY : <span className="font-bold text-gray-800 ml-1">{item.secOpeningQty || 0} {item.salesUnit?.toUpperCase() || 'PCS'}</span>
                      </div>
                      <div className="text-[12px] text-gray-500 mt-1 flex justify-end gap-3">
                        <span>HSN : <span className="font-bold text-[#007bff]">{item.hsnCode}</span> <span className="text-gray-300 mx-1">|</span></span>
                        <span>GST : <span className="font-bold text-gray-700">{item.tax || 0}</span> <span className="text-gray-300 mx-1">|</span></span>
                        <span>TAXABLE : <span className="font-bold text-gray-700">{formatAmount(((item.purchasePrice || 0) * (item.stock ?? item.qty ?? 0)) / (1 + (item.tax || 0) / 100)).replace('₹', '')}</span></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between sm:justify-center sm:gap-40 items-center border-t border-gray-100 mt-4 pt-3">
                    <button onClick={() => handleViewModal(item)} className="flex items-center gap-1.5 text-[#007bff] border border-[#007bff] hover:bg-blue-50 px-4 py-1.5 rounded text-[13px] font-bold transition-colors">
                      <Eye className="w-4 h-4" /> View
                    </button>
                    <button onClick={() => navigate('/admin/items_quantity_report/' + item.id)} className="flex items-center gap-1.5 text-[#007bff] border border-[#007bff] hover:bg-blue-50 px-4 py-1.5 rounded text-[13px] font-bold transition-colors">
                      <RefreshCw className="w-4 h-4" /> History
                    </button>
                    <button onClick={() => { setEditData(item); setAddModalOpen(true); }} className="flex items-center gap-1.5 text-[#28a745] border border-[#28a745] hover:bg-green-50 px-4 py-1.5 rounded text-[13px] font-bold transition-colors">
                      <Edit2 className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDeleteItem(item.id)} className="flex items-center gap-1.5 text-[#dc3545] border border-[#dc3545] hover:bg-red-50 px-4 py-1.5 rounded text-[13px] font-bold transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fixed Footer Totals */}
        <div className="fixed bottom-0 left-[220px] right-0 bg-[#343a40] text-white grid grid-cols-3 text-center py-2.5 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
           <div className="font-bold text-[14px]">TOTAL : {filtered.length}</div>
           <div className="font-bold text-[14px]">TAXABLE TOTAL : {formatAmount(filtered.reduce((s, r) => s + ((r.stock || 0) * (r.price || 0)) * (1 - ((parseInt(r.tax) || 0)/100)), 0)).replace('₹', '')}</div>
           <div className="font-bold text-[14px]">GRAND TOTAL : {formatAmount(grandTotal).replace('₹', '')}</div>
        </div>

      </div>

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[480px] overflow-hidden">
            <div className="bg-[#4F46E5] px-4 py-2.5 flex justify-between"><h3 className="text-white font-bold text-[15px]"><Edit2 className="w-4 h-4 inline mr-2"/> Bulk Edit</h3><button onClick={() => setShowBulkEdit(false)} className="text-white"><X className="w-5 h-5"/></button></div>
            <div className="p-5 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1"><label className="text-[13px] font-bold text-gray-800">Sale Price</label><input type="number" placeholder="New price" value={bulkEditFields.price} onChange={e => setBulkEditFields(p => ({ ...p, price: e.target.value }))} className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px]"/></div>
                <div className="flex flex-col gap-1"><label className="text-[13px] font-bold text-gray-800">Category</label><select value={bulkEditFields.category} onChange={e => setBulkEditFields(p => ({ ...p, category: e.target.value }))} className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px]"><option value="">— No Change —</option>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
                <div className="flex flex-col gap-1"><label className="text-[13px] font-bold text-gray-800">Warehouse</label><select value={bulkEditFields.warehouse} onChange={e => setBulkEditFields(p => ({ ...p, warehouse: e.target.value }))} className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px]"><option value="">— No Change —</option>{warehouses.map(w => <option key={w}>{w}</option>)}</select></div>
                <div className="flex flex-col gap-1"><label className="text-[13px] font-bold text-gray-800">Status</label><select value={bulkEditFields.status} onChange={e => setBulkEditFields(p => ({ ...p, status: e.target.value }))} className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px]"><option value="">— No Change —</option><option>Active</option><option>Inactive</option></select></div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 flex justify-end gap-2 border-t border-gray-200">
              <button onClick={() => setShowBulkEdit(false)} className="bg-gray-200 px-4 py-2 rounded-[3px] text-[13px] font-medium">Cancel</button>
              <button onClick={() => { setConfirmAction('bulkEdit'); setShowConfirm(true); setShowBulkEdit(false); }} className="bg-[#4F46E5] text-white px-5 py-2 rounded-[3px] text-[13px] font-bold">Apply</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[380px] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className={`px-4 py-2.5 ${confirmAction === 'delete' ? 'bg-[#dc3545]' : 'bg-[#4F46E5]'}`}>
              <h3 className="text-white font-bold text-[14px]">⚠️ Confirm Action</h3>
            </div>
            <div className="p-5">
              <p className="text-[14px] text-gray-700">You are about to <strong>{confirmAction}</strong> <strong>{selectedCount} item(s)</strong>.</p>
            </div>
            <div className="flex justify-end gap-2 px-5 pb-4">
              <button onClick={() => { setShowConfirm(false); setConfirmAction(null); }} className="bg-gray-200 px-4 py-2 rounded-[3px] text-[13px] font-medium">Cancel</button>
              <button onClick={executeBulkAction} className={`text-white px-5 py-2 rounded-[3px] text-[13px] font-bold ${confirmAction === 'delete' ? 'bg-[#dc3545]' : 'bg-[#4F46E5]'}`}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewModalData && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3px] shadow-xl w-full max-w-[500px] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#4F46E5] px-4 py-2.5 flex justify-between items-center">
              <h3 className="text-white font-medium text-[15px]">Stock Quantity Price-wise Details</h3>
              <button onClick={() => setViewModalData(null)} className="text-[#dc3545] hover:text-red-600 transition-colors drop-shadow-sm">
                <X className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-4 bg-white">
              {/* Total Qty Section */}
              <div className="flex justify-between mb-4 mt-2 px-2 border-b border-gray-100 pb-2">
                <div className="text-[13px] text-gray-700">
                  Total Purchased: <span className="font-bold text-gray-900">{isLoadingAvgPrice ? '...' : totalPurchaseQty} {viewModalData.baseUnit?.toLowerCase()}</span>
                </div>
                <div className="text-[13px] text-gray-700">
                  Total Sold: <span className="font-bold text-gray-900">{isLoadingAvgPrice ? '...' : totalSaleQty} {viewModalData.baseUnit?.toLowerCase()}</span>
                </div>
              </div>

              <table className="w-full border-collapse border border-gray-200 text-center mb-4">
                <thead>
                  <tr className="bg-white border-b border-gray-200">
                    <th className="py-2 px-3 text-gray-800 text-[14px] font-bold border-r border-gray-200">Stock Details</th>
                    <th className="py-2 px-3 text-gray-800 text-[14px] font-bold border-r border-gray-200">Stock Price</th>
                    <th className="py-2 px-3 text-gray-800 text-[14px] font-bold">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {priceWiseStock && priceWiseStock.length > 0 ? (
                    priceWiseStock.map((batch, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-2.5 px-3 text-gray-700 text-[14px] border-r border-gray-200">
                          {batch.qty} {viewModalData.baseUnit?.toLowerCase()} @ {Number(batch.price).toFixed(2)} {batch.isOpening ? '(Opening)' : ''}
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 text-[14px] border-r border-gray-200">
                          {formatAmount(batch.amount).replace('₹', '')}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className={`bg-[#28a745] text-white text-[10px] font-bold py-1 px-2 rounded-[2px] w-[90%] mx-auto shadow-sm`}>
                            IN STOCK
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="border-b border-gray-200">
                      <td className="py-2.5 px-3 text-gray-700 text-[14px] border-r border-gray-200">
                        {viewModalData.stock} {viewModalData.baseUnit?.toLowerCase()} @ {isLoadingAvgPrice ? '...' : Number(averagePrice || viewModalData.price || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-gray-700 text-[14px] border-r border-gray-200">
                        {isLoadingAvgPrice ? '...' : formatAmount(viewModalData.stock * (averagePrice || viewModalData.price || 0)).replace('₹', '')}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className={`${viewModalData.stock > 0 ? 'bg-[#28a745]' : 'bg-[#dc3545]'} text-white text-[10px] font-bold py-1 px-2 rounded-[2px] w-[90%] mx-auto shadow-sm`}>
                          {viewModalData.stock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex justify-center gap-4 mb-4">
                <div className="bg-[#17a2b8] text-white px-3 py-1.5 rounded-[4px] font-bold text-[14px] shadow-sm">
                  {isLoadingAvgPrice ? 'Calculating...' : `Total Avg Price: ${Number(totalAveragePrice || viewModalData.purchasePrice || 0).toFixed(2)}`}
                </div>
                <div className="bg-[#007bff] text-white px-3 py-1.5 rounded-[4px] font-bold text-[14px] shadow-sm">
                  {isLoadingAvgPrice ? 'Calculating...' : `Avg Purchase Price: ${Number(averagePrice || viewModalData.purchasePrice || 0).toFixed(2)}`}
                </div>
                <div className="bg-[#28a745] text-white px-3 py-1.5 rounded-[4px] font-bold text-[14px] shadow-sm">
                  {isLoadingAvgPrice ? 'Calculating...' : `Avg Sale Price: ${Number(averageSalePrice || viewModalData.price || 0).toFixed(2)}`}
                </div>
              </div>
            </div>
            
            <div className="bg-white px-4 py-3 flex justify-end border-t border-gray-200">
              <button onClick={() => setViewModalData(null)} className="bg-[#dc3545] text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors hover:bg-[#c82333]">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-[#f4f6f9] rounded-[3px] shadow-2xl w-full max-w-[600px] overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#4F46E5] px-4 py-2.5 flex justify-between items-center">
              <h3 className="text-white font-medium text-[15px]">Item Correction</h3>
              <button onClick={() => setMergeModalOpen(false)} className="text-[#dc3545] hover:text-red-600 transition-colors drop-shadow-sm">
                <X className="w-6 h-6" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-4 bg-white flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Incorrect Product Name</label>
                <select 
                  value={mergeIncorrectId}
                  onChange={(e) => setMergeIncorrectId(e.target.value)}
                  className="border border-[#007bff] bg-[#d1ecf1] rounded-[3px] px-3 py-2 text-[14px] outline-none w-full text-gray-800 font-bold"
                >
                  <option value="">Select Incorrect Product</option>
                  {rows.map(f => <option key={f.id} value={f.id}>{f.name} ({f.sku})</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Correct Product Name</label>
                <select 
                  value={mergeCorrectId}
                  onChange={(e) => setMergeCorrectId(e.target.value)}
                  className="border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] outline-none w-full text-gray-800 font-bold"
                >
                  <option value="">Select Correct Product</option>
                  {rows.map(f => <option key={f.id} value={f.id}>{f.name} ({f.sku})</option>)}
                </select>
              </div>
            </div>
            
            <div className="bg-[#f4f6f9] px-4 py-3 flex justify-end gap-2 border-t border-gray-200">
              <button 
                onClick={async () => {
                  if (!mergeIncorrectId || !mergeCorrectId) {
                    alert("Please select both products.");
                    return;
                  }
                  if (mergeIncorrectId === mergeCorrectId) {
                    alert("Incorrect and Correct products cannot be the same.");
                    return;
                  }
                  if (window.confirm("Are you sure you want to merge these products? The incorrect product will be permanently deleted and its stock will be moved to the correct product.")) {
                    try {
                      await apiClient.post('/products/merge', {
                        incorrectProductId: mergeIncorrectId,
                        correctProductId: mergeCorrectId
                      });
                      alert("Products merged successfully!");
                      setMergeModalOpen(false);
                      setMergeIncorrectId('');
                      setMergeCorrectId('');
                      fetchProducts();
                    } catch (error) {
                      console.error("Merge error:", error);
                      alert(error.response?.data?.message || "Failed to merge products.");
                    }
                  }
                }} 
                className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[3px] text-[14px] transition-colors"
              >
                Merge
              </button>
              <button onClick={() => setMergeModalOpen(false)} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[3px] text-[14px] transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkEdit && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[800px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="bg-white px-5 py-4 flex justify-between items-center border-b border-gray-200">
              <h3 className="text-[#333] font-medium text-[20px]">Bulk Update Product Fields</h3>
              <button onClick={() => setShowBulkEdit(false)} className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none">
                <X className="w-5 h-5" strokeWidth={3} />
              </button>
            </div>
            
            {/* Body */}
            <div className="p-5 flex flex-col gap-5 bg-white">
              
              {/* Alert Box */}
              <div className="bg-[#4F46E5] rounded-[3px] p-4 text-white flex gap-3 items-start shadow-sm">
                <div className="bg-white text-[#4F46E5] rounded-full w-[20px] h-[20px] flex items-center justify-center font-bold text-[13px] flex-shrink-0 mt-[2px] leading-none">
                  i
                </div>
                <div>
                  <div className="font-bold text-[15px] mb-1">This will update 9 product(s) with the selected field value.</div>
                  <div className="text-[13px] text-[#8b3a3a] opacity-90">Only one field can be updated at a time.</div>
                </div>
              </div>
              
              {/* Select Field */}
              <div className="flex flex-col gap-1.5 mt-2">
                <label className="text-[14px] font-bold text-gray-800">
                  Select Field to Update <span className="text-red-500">*</span>
                </label>
                <select className="border border-gray-300 rounded-[3px] px-3 py-2.5 text-[14px] outline-none w-full text-gray-600 bg-white shadow-sm">
                  <option>-- Select Field --</option>
                  <option>Product Name</option>
                  <option>Category</option>
                  <option>Brand</option>
                  <option>Tax Rate</option>
                  <option>Status</option>
                </select>
              </div>

            </div>
            
            {/* Footer */}
            <div className="bg-white px-5 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button 
                onClick={() => setShowBulkEdit(false)} 
                className="bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 px-5 py-2 rounded-[3px] text-[14px] transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => setShowBulkEdit(false)} 
                className="bg-[#5c9ded] hover:bg-[#4a8cd9] text-white px-5 py-2 rounded-[3px] text-[14px] font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="font-bold">✓</span> Update 9 Product(s)
              </button>
            </div>

          </div>
        </div>
      )}

      <ItemMasterModal 
        isOpen={addModalOpen} 
        onClose={() => { setAddModalOpen(false); setEditData(null); }} 
        editData={editData}
        onSave={handleSaveItem}
        products={rows}
      />
    </>
  );
}

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
