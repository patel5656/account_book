import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  X, 
  Plus, 
  Upload,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { ItemMasterModal } from '../components/ItemMasterModal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useSettings } from '../context/SettingsContext';

export function ItemMaster() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('items'); // 'items' | 'boms'
  const [showQuantities, setShowQuantities] = useState(false);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOption, setSearchOption] = useState('All Search Options');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterBrand, setFilterBrand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Extract real dynamic data from database rows
  const uniqueCategories = [...new Set(rows.map(r => r.category).filter(Boolean))].sort();
  const uniqueBrands = [...new Set(rows.map(r => r.brand).filter(Boolean))].sort();

  // Apply filters
  const filteredRows = rows.filter(r => {
    if (viewMode === 'boms' && !r.hasBom) return false;
    if (filterCategory && r.category !== filterCategory) return false;
    if (filterBrand && r.brand !== filterBrand) return false;
    if (filterStatus === 'instock' && r.qty <= 0) return false;
    if (filterStatus === 'outofstock' && r.qty > 0) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (searchOption === 'Item Name') return r.name?.toLowerCase().includes(q);
      if (searchOption === 'Item Code / SKU') return r.sku?.toLowerCase().includes(q);
      if (searchOption === 'Barcode') return r.barcode?.toLowerCase().includes(q);
      return r.name?.toLowerCase().includes(q) || r.sku?.toLowerCase().includes(q) || r.barcode?.toLowerCase().includes(q);
    }
    return true;
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/products');
      if (res.data.success) {
        setRows(res.data.data.map((p) => ({
          ...p,
          qty: p.stock,
          hasBom: Boolean(p.hasBom),
          synced: true
        })));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (newItem) => {
    try {
      // Auto-create the category if it's new and not already in Category Master
      if (newItem.category && newItem.category.trim() !== '') {
        try {
          const catRes = await apiClient.get('/categories');
          const existingCategories = catRes.data?.data || [];
          const exists = existingCategories.some(
            c => c.name.toLowerCase() === newItem.category.trim().toLowerCase()
          );
          if (!exists) {
            await apiClient.post('/categories', {
              name: newItem.category.trim(),
              purchaseDiscount: 0,
              saleDiscount: 0,
              isActive: true,
              attributes: []
            });
          }
        } catch (catErr) {
          console.error('Failed to auto-create category:', catErr);
        }
      }

      const payload = {
        ...newItem,
        sku: newItem.sku || `SKU${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        price: parseFloat(newItem.price) || 0,
        mrp: parseFloat(newItem.mrp) || 0,
        stock: parseInt(newItem.qty) || 0,
      };
      
      if (editRow) {
        const res = await apiClient.put(`/products/${editRow.id}`, payload);
        if (res.data.success) {
          fetchProducts();
        }
      } else {
        const res = await apiClient.post('/products', payload);
        if (res.data.success) {
          fetchProducts();
        }
      }
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setCreateModalOpen(true);
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this item?')) {
      try {
        const res = await apiClient.delete(`/products/${id}`);
        if (res.data.success) {
          setRows(prev => prev.filter(r => r.id !== id));
        }
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert(error.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleExport = () => {
    const doc = new jsPDF({ orientation: 'landscape' }); // Landscape to fit more columns
    
    // Add professional header
    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229); // Indigo 600
    doc.text('Swayam Bill Book - Item Master Report', 14, 22);

    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`View Mode: ${viewMode === 'boms' ? 'BOM List' : 'Item List'}`, 14, 36);

    let headers = [['#', 'Item Name', 'Variants/IMEI', 'Category', 'Brand', 'SKU', 'Barcode', 'MRP', 'Sale Price', 'Loyalty Pts', 'Stock', 'Is BOM']];
    if (viewMode === 'boms') {
      headers = [['#', 'Item Name', 'BOM Name', 'Components', 'Variants/IMEI', 'Category', 'Brand', 'SKU', 'MRP', 'Sale Price', 'Loyalty Pts', 'Stock']];
    }

    const tableData = filteredRows.map((row, idx) => {
      let bomCount = 0;
      if (row.bomRecipe) {
        try {
          const recipe = typeof row.bomRecipe === 'string' ? JSON.parse(row.bomRecipe) : row.bomRecipe;
          if (Array.isArray(recipe)) bomCount = recipe.length;
        } catch(e) {}
      }

      const variants = [row.memorySize, row.colorVariant].filter(Boolean).join(' | ') + (row.enableImei ? ' (IMEI)' : '');

      if (viewMode === 'boms') {
        return [
          idx + 1,
          row.name || '-',
          row.bomName || '-',
          bomCount.toString(),
          variants || '-',
          row.category || '-',
          row.brand || '-',
          row.sku || '-',
          `Rs.${row.mrp || 0}`,
          `Rs.${row.price || 0}`,
          (row.creditSalePrice || 0).toString(),
          (row.qty || 0).toString()
        ];
      } else {
        return [
          idx + 1,
          row.name || '-',
          variants || '-',
          row.category || '-',
          row.brand || '-',
          row.sku || '-',
          row.barcode || '-',
          `Rs.${row.mrp || 0}`,
          `Rs.${row.price || 0}`,
          (row.creditSalePrice || 0).toString(),
          (row.qty || 0).toString(),
          row.hasBom ? 'Yes' : 'No'
        ];
      }
    });

    // Generate PDF table using autoTable function
    try {
      autoTable(doc, {
        startY: 45,
        head: headers,
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 8, cellPadding: 3 },
        alternateRowStyles: { fillColor: [249, 250, 251] },
      });
    } catch (err) {
      console.error('Error generating PDF table:', err);
      alert('Failed to generate PDF. See console for details.');
      return;
    }

    console.log('Exporting', viewMode, filteredRows.length, 'rows');
    doc.save(viewMode === 'boms' ? 'BOM_List_Report.pdf' : 'Item_Master_Report.pdf');
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Item Master Details</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" strokeWidth={2.5} />
              Export
            </button>
            <button 
              onClick={() => { setEditRow(null); setCreateModalOpen(true); }}
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

        {/* Filter Bar & View Toggle */}
        <div className="p-3 bg-white border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex bg-gray-200 p-1 rounded-[3px] w-fit">
              <button 
                onClick={() => setViewMode('items')} 
                className={`px-4 py-1.5 text-[13px] font-bold rounded-[3px] transition-colors ${viewMode === 'items' ? 'bg-white shadow-sm text-[#4F46E5]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                Item List
              </button>
              <button 
                onClick={() => setViewMode('boms')} 
                className={`px-4 py-1.5 text-[13px] font-bold rounded-[3px] transition-colors ${viewMode === 'boms' ? 'bg-white shadow-sm text-[#4F46E5]' : 'text-gray-600 hover:text-gray-900'}`}
              >
                BOM List
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center w-full max-w-full gap-2">
            <div className="flex items-center flex-1 bg-white border border-gray-300 rounded-[3px] focus-within:border-blue-500 overflow-hidden shadow-sm">
              <div className="px-3 text-blue-500 bg-gray-50 border-r border-gray-300 h-full flex items-center justify-center">
                <FilterIcon className="w-4 h-4" />
              </div>
              <select value={searchOption} onChange={e => setSearchOption(e.target.value)} className="px-2 py-2 text-[13px] outline-none bg-transparent text-gray-700 border-r border-gray-300 min-w-[120px] font-medium">
                <option>All Search Options</option>
                <option>Item Name</option>
                <option>Item Code / SKU</option>
                <option>Barcode</option>
              </select>
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products..." 
                className="flex-1 px-3 py-2 text-[13px] outline-none bg-transparent text-gray-800 placeholder-gray-400"
              />
            </div>
            
            <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] outline-none bg-white text-gray-700 w-full sm:w-[150px] shadow-sm">
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <div className="flex items-center gap-2 border border-gray-300 rounded-[3px] px-3 py-2 bg-white shadow-sm w-full sm:w-auto">
              <span className="text-[13px] font-bold text-gray-700 whitespace-nowrap">Detailed Qty</span>
              <div 
                onClick={() => setShowQuantities(!showQuantities)}
                className={`w-[36px] h-[20px] rounded-full relative cursor-pointer transition-colors ${showQuantities ? 'bg-[#4F46E5]' : 'bg-gray-400'}`}
              >
                <div className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${showQuantities ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
              </div>
            </div>

            <select value={filterBrand} onChange={e => setFilterBrand(e.target.value)} className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] outline-none bg-white text-gray-700 w-full sm:w-[140px] shadow-sm">
              <option value="">All Brands</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] outline-none bg-white text-gray-700 w-full sm:w-[130px] shadow-sm">
              <option value="">Stock Status</option>
              <option value="instock">In Stock</option>
              <option value="outofstock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Table Area */}
        <div className="flex-1 overflow-auto bg-white p-4">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2 mt-10">
              <PackageIcon className="w-12 h-12 text-gray-300" />
              <p className="text-[14px]">No items found. Click "Create New" to add one.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200 text-gray-600 text-[13px] whitespace-nowrap">
                  <th className="py-2 px-3 font-medium">#</th>
                  <th className="py-2 px-3 font-medium">Item Name</th>
                  {viewMode === 'boms' && <th className="py-2 px-3 font-medium">BOM Name</th>}
                  {viewMode === 'boms' && <th className="py-2 px-3 font-medium text-center">Components</th>}
                  {settings?.showVariantsImei !== false && <th className="py-2 px-3 font-medium">Variants & IMEI</th>}
                  <th className="py-2 px-3 font-medium">Category</th>
                  <th className="py-2 px-3 font-medium">Brand</th>
                  <th className="py-2 px-3 font-medium">Code/SKU</th>
                  <th className="py-2 px-3 font-medium">Barcode</th>
                  <th className="py-2 px-3 font-medium text-right">Purchase Price</th>
                  <th className="py-2 px-3 font-medium text-right">MRP</th>
                  <th className="py-2 px-3 font-medium text-right">Sale Price</th>
                  <th className="py-2 px-3 font-medium text-right">Loyalty Pts</th>
                  {showQuantities ? (
                    <>
                      <th className="py-2 px-3 font-medium text-right">P.QTY</th>
                      <th className="py-2 px-3 font-medium text-right">S.QTY</th>
                    </>
                  ) : (
                    <th className="py-2 px-3 font-medium text-right">Stock</th>
                  )}
                  <th className="py-2 px-3 pr-5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => {
                  let bomCount = 0;
                  if (viewMode === 'boms' && row.bomRecipe) {
                    try {
                      const recipe = typeof row.bomRecipe === 'string' ? JSON.parse(row.bomRecipe) : row.bomRecipe;
                      if (Array.isArray(recipe)) bomCount = recipe.length;
                    } catch(e) {}
                  }

                  return (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 text-[13px] transition-colors whitespace-nowrap">
                    <td className="py-2 px-3 text-gray-500">{idx + 1}</td>
                    <td className="py-2 px-3 font-bold text-[#4F46E5]">
                      {row.name}
                      {row.hasBom && <span className="ml-2 bg-blue-100 text-blue-800 text-[9px] px-1.5 py-0.5 rounded-[3px] font-bold uppercase tracking-wide">BOM</span>}
                    </td>
                    {viewMode === 'boms' && (
                      <td className="py-2 px-3 text-gray-700 font-medium">
                        {row.bomName || '-'}
                        {row.isMultiLevel && <span className="ml-1 bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.5 rounded-[3px] font-bold uppercase tracking-wide">Multi</span>}
                      </td>
                    )}
                    {viewMode === 'boms' && (
                      <td className="py-2 px-3 text-center">
                        <span className="bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full text-[11px] font-bold text-gray-700">{bomCount} items</span>
                      </td>
                    )}
                    {settings?.showVariantsImei !== false && (
                      <td className="py-2 px-3">
                        <div className="flex flex-wrap gap-1">
                          {row.memorySize && <span className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-[3px] leading-tight">{row.memorySize}</span>}
                          {row.colorVariant && <span className="bg-gray-100 border border-gray-200 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-[3px] leading-tight">{row.colorVariant}</span>}
                          {row.enableImei && <span className="bg-purple-100 border border-purple-200 text-purple-800 text-[10px] px-1.5 py-0.5 rounded-[3px] font-bold leading-tight" title="IMEI Tracking Enabled">IMEI</span>}
                        </div>
                      </td>
                    )}
                    <td className="py-2 px-3 text-gray-600">{row.category}</td>
                    <td className="py-2 px-3 text-gray-600 font-medium">{row.brand}</td>
                    <td className="py-2 px-3 text-gray-600">{row.sku}</td>
                    <td className="py-2 px-3 text-gray-600 font-mono text-[12px]">{row.barcode}</td>
                    <td className="py-2 px-3 text-gray-500 font-medium text-right">₹{row.purchasePrice || 0}</td>
                    <td className="py-2 px-3 text-gray-500 font-medium text-right">₹{row.mrp}</td>
                    <td className="py-2 px-3 text-gray-800 font-bold text-right">₹{row.price}</td>
                    <td className="py-2 px-3 text-blue-600 font-bold text-right">{row.creditSalePrice || 0}</td>
                    {showQuantities ? (
                      <>
                        <td className="py-2 px-3 text-gray-800 font-bold text-right">{row.qty || 0}</td>
                        <td className="py-2 px-3 text-gray-800 font-bold text-right">{row.secOpeningQty || 0}</td>
                      </>
                    ) : (
                      <td className="py-2 px-3 text-gray-800 font-bold text-right">
                        {row.qty < 20 ? (
                          <span className="text-red-600">{row.qty || 0}</span>
                        ) : (
                          row.qty || 0
                        )}
                      </td>
                    )}
                    <td className="py-2 px-3 pr-5">
                      <div className="flex items-center justify-end gap-0.5">
                        <button 
                          onClick={() => handleEdit(row)} 
                          className="text-[#28a745] hover:bg-green-50 p-1.5 rounded-[3px] transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <div className="w-[1px] h-3 bg-gray-300 mx-0.5"></div>
                        <button 
                          onClick={() => handleEdit(row)} 
                          className="text-[#4F46E5] hover:bg-indigo-50 p-1.5 rounded-[3px] transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                        <div className="w-[1px] h-3 bg-gray-300 mx-0.5"></div>
                        <button 
                          onClick={() => handleDelete(row.id)} 
                          className="text-[#dc3545] hover:bg-red-50 p-1.5 rounded-[3px] transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )})}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={viewMode === 'boms' ? (showQuantities ? "15" : "14") : (showQuantities ? "13" : "12")} className="py-8 text-center text-gray-500 text-[13px]">
                      No {viewMode === 'boms' ? 'BOMs' : 'Items'} found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

      </div>

      <ItemMasterModal 
        isOpen={createModalOpen} 
        onClose={() => { setCreateModalOpen(false); setEditRow(null); }} 
        onSave={handleCreateProduct}
        editData={editRow}
        products={rows}
      />

    </div>
  );
}

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const PackageIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const BarcodeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 5v14M8 5v14M12 5v14M17 5v14M21 5v14"/>
  </svg>
);

const GlobeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    <path d="M2 12h20"/>
  </svg>
);

const Settings2Icon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
  </svg>
);

const ArrowRightLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m16 3 4 4-4 4"/>
    <path d="M20 7H4"/>
    <path d="m8 21-4-4 4-4"/>
    <path d="M4 17h16"/>
  </svg>
);
