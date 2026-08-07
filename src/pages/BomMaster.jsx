import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  X, 
  Plus, 
  RefreshCw,
  Trash2,
  Edit
} from 'lucide-react';
import { BomMasterModal } from '../components/BomMasterModal';

export function BomMaster() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBoms = async () => {
    try {
      const res = await apiClient.get('/boms');
      if (res.data.success) {
        setRows(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch BOMs:', err);
    }
  };

  useEffect(() => {
    fetchBoms();
  }, []);

  useEffect(() => {
    const handleBomAdded = () => {
      fetchBoms();
    };
    window.addEventListener('bomAdded', handleBomAdded);
    return () => window.removeEventListener('bomAdded', handleBomAdded);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this BOM Master?')) {
      try {
        const res = await apiClient.delete(`/boms/${id}`);
        if (res.data.success) {
          fetchBoms();
        }
      } catch (err) {
        console.error('Failed to delete BOM:', err);
      }
    }
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setIsAddModalOpen(true);
  };

  const handleToggleStatus = async (row) => {
    try {
      const res = await apiClient.put(`/boms/${row.id}`, { isActive: !row.isActive });
      if (res.data.success) {
        setRows(prev => prev.map(r => r.id === row.id ? { ...r, isActive: !row.isActive } : r));
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status.');
    }
  };

  const filteredRows = rows.filter(row => 
    !searchQuery || (row.name && row.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">BOM Master Details</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={fetchBoms}
              className="flex items-center gap-1.5 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Sync
            </button>
            <button 
              onClick={() => { setEditRow(null); setIsAddModalOpen(true); }}
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
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search BOM Name" 
            className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] outline-none bg-white text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto bg-white p-4">
          {filteredRows.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No BOM masters found.</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200 text-gray-600 text-[13px]">
                  <th className="py-2.5 px-3 font-medium">#</th>
                  <th className="py-2.5 px-3 font-medium">BOM Name</th>
                  <th className="py-2.5 px-3 font-medium">Items Count</th>
                  <th className="py-2.5 px-3 font-medium text-center">Status</th>
                  <th className="py-2.5 px-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, idx) => (
                  <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 text-[13px] transition-colors">
                    <td className="py-2.5 px-3 text-gray-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-[#4F46E5]">{row.name}</td>
                    <td className="py-2.5 px-3 text-gray-700">{row.items?.length || 0} product(s)</td>
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

      <BomMasterModal 
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setEditRow(null); }}
        editData={editRow}
      />
    </div>
  );
}
