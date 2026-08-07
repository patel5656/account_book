import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  X, 
  Plus, 
  GitMerge, 
  Upload,
  ChevronsUpDown,
  Trash2,
  Edit
} from 'lucide-react';
import { CategoryMasterModal } from '../components/CategoryMasterModal';

export function CategoryMaster() {
  const navigate = useNavigate();
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [rows, setRows] = useState([]);
  const [searchFilter, setSearchFilter] = useState('Category Name');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/categories');
      if (res.data.success) {
        setRows(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleCategoryAdded = () => {
      // CategoryMasterModal now saves directly to API.
      // Just refresh the list to show updated data.
      fetchCategories();
    };
    window.addEventListener('categoryAdded', handleCategoryAdded);
    return () => window.removeEventListener('categoryAdded', handleCategoryAdded);
  }, []);

  const handleEdit = (row) => {
    setEditRow(row);
    setCreateModalOpen(true);
  };

  const handleToggleStatus = async (row) => {
    try {
      const res = await apiClient.put(`/categories/${row.id}`, { isActive: !row.isActive });
      if (res.data.success) {
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, isActive: !row.isActive } : r));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const res = await apiClient.delete(`/categories/${id}`);
        if (res.data.success) {
          fetchCategories();
        }
      } catch (err) {
        console.error('Error deleting category:', err);
      }
    }
  };

  const handleExport = () => {
    const headers = ['#', 'Category Name', 'Purchase Discount', 'Sale Discount'];
    const csvRows = [headers.join(',')];
    
    rows.forEach((row, index) => {
      const csvRow = [
        index + 1,
        `"${row.name || ''}"`,
        `"${row.purchaseDiscount || '0'}"`,
        `"${row.saleDiscount || '0'}"`
      ];
      csvRows.push(csvRow.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'category_master.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRows = rows.filter(row => {
    if (!searchQuery) return true;
    const query = searchQuery.trim().toLowerCase();
    
    if (searchFilter === 'Category Name') {
      return row.name?.toLowerCase().includes(query);
    } else if (searchFilter === 'Status') {
      const statusStr = row.isActive ? 'active' : 'inactive';
      return statusStr.includes(query);
    }
    return true;
  });

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Category Details</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setMergeModalOpen(true)}
              className="flex items-center gap-1.5 bg-white text-gray-800 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <GitMerge className="w-4 h-4" />
              Merge
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" strokeWidth={2.5} />
              Export
            </button>
            <button 
              onClick={() => setCreateModalOpen(true)}
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

        {/* Filter Bar */}
        <div className="p-3 bg-white border-b border-gray-200">
          <div className="flex items-center w-full max-w-[600px]">
            <div className="flex items-center bg-white min-w-0 border border-gray-300 border-r-0 rounded-l-[3px] px-3 py-2 text-blue-500">
              <FilterIcon className="w-4 h-4" />
            </div>
            <select 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="min-w-[140px] border border-gray-300 border-l-0 px-3 py-2 text-[13px] outline-none bg-white text-gray-600 cursor-pointer"
            >
              <option value="Category Name">Category Name</option>
              <option value="Status">Status</option>
            </select>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${searchFilter}`} 
              className="flex-1 min-w-0 border border-gray-300 border-l-0 rounded-r-[3px] px-3 py-2 text-[13px] outline-none bg-white text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto bg-white p-4">
          {filteredRows.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No categories found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200 text-gray-600 text-[13px]">
                  <th className="py-2.5 px-3 font-medium">#</th>
                  <th className="py-2.5 px-3 font-medium">Category Name</th>
                  <th className="py-2.5 px-3 font-medium text-right">Purchase Discount (%)</th>
                  <th className="py-2.5 px-3 font-medium text-right">Sale Discount (%)</th>
                  <th className="py-2.5 px-3 font-medium text-center">Status</th>
                  <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 text-[13px] transition-colors">
                    <td className="py-2.5 px-3 text-gray-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-[#4F46E5]">{row.name}</td>
                    <td className="py-2.5 px-3 text-right">{row.purchaseDiscount}%</td>
                    <td className="py-2.5 px-3 text-right">{row.saleDiscount}%</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${row.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {row.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <div 
                          className={`w-[36px] h-[20px] rounded-full relative cursor-pointer transition-colors ${row.isActive ? 'bg-[#28a745]' : 'bg-gray-300'}`}
                          onClick={() => handleToggleStatus(row)}
                        >
                          <div className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${row.isActive ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                        </div>
                        <div className="flex items-center justify-end gap-0">
                          <button onClick={() => handleEdit(row)} className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-2 py-1.5 rounded-l-[3px] transition-colors shadow-sm">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(row.id)} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-2 py-1.5 rounded-r-[3px] transition-colors shadow-sm">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

      {/* Merge Modal */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setMergeModalOpen(false)}>
          <div 
            className="bg-white rounded-[4px] shadow-2xl flex flex-col w-[min(92vw,500px)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[15px]">Category Correction</h3>
              <button onClick={() => setMergeModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-6 h-6 font-bold text-[#dc3545]" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-800">Incorrect Category Name</label>
                <select className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-2 text-[14px] text-gray-500 outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] w-full font-bold">
                  <option value="">Select Name</option>
                  {rows.map(row => <option value={row.id} key={row.id}>{row.name}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-800">Correct Category Name</label>
                <select className="min-w-0 border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:border-[#4F46E5] w-full">
                  <option value="">Select Name</option>
                  {rows.map(row => <option value={row.id} key={row.id}>{row.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button 
                onClick={() => setMergeModalOpen(false)}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[4px] text-[14px] font-bold transition-colors shadow-sm"
              >
                Merge
              </button>
              <button onClick={() => setMergeModalOpen(false)} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[4px] text-[14px] transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <CategoryMasterModal 
        isOpen={createModalOpen} 
        onClose={() => { setCreateModalOpen(false); setEditRow(null); }} 
        editData={editRow}
      />

    </div>
  );
}

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
