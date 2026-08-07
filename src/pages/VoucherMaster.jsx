import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  X,
  ChevronsUpDown,
  Plus,
  Trash2,
  RefreshCw,
  Edit
} from 'lucide-react';
import { VoucherMasterModal } from '../components/VoucherMasterModal';

export function VoucherMaster() {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState('Voucher Type');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const fetchVouchers = async () => {
    try {
      const res = await apiClient.get('/vouchers');
      if (res.data.success) {
        setRows(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch vouchers:', err);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, []);

  const filteredRows = rows.filter(row => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (searchFilter === 'Voucher Type') {
      return row.type && row.type.toLowerCase().includes(query);
    }
    if (searchFilter === 'Voucher Id') {
      return row.voucherId && row.voucherId.toLowerCase().includes(query);
    }
    if (searchFilter === 'Voucher Head') {
      return row.head && row.head.toLowerCase().includes(query);
    }
    return true;
  });

  const handleSaveVoucher = async (data) => {
    try {
      if (editRow) {
        const res = await apiClient.put(`/vouchers/${editRow.id}`, data);
        if (res.data.success) fetchVouchers();
      } else {
        const res = await apiClient.post('/vouchers', data);
        if (res.data.success) fetchVouchers();
      }
      setIsModalOpen(false);
      setEditRow(null);
    } catch (err) {
      console.error('Failed to save voucher:', err);
    }
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      try {
        const res = await apiClient.delete(`/vouchers/${id}`);
        if (res.data.success) fetchVouchers();
      } catch (err) {
        console.error('Failed to delete voucher:', err);
      }
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded-[3px] shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex items-center justify-between">
          <h2 className="text-white text-[15px] font-medium tracking-wide">Voucher Details</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setEditRow(null); setIsModalOpen(true); }}
              className="flex items-center gap-1.5 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Create New
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:opacity-90 text-white p-1 rounded-[3px] shadow-sm transition-opacity"
            >
              <X className="w-5 h-5 font-bold" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-white border-b border-gray-200 flex justify-center sm:justify-start">
          <div className="flex items-center w-full">
            <div className="flex items-center bg-white border border-gray-300 border-r-0 rounded-l-[3px] px-3 py-1.5 text-[#007bff]">
              <FilterIcon className="w-4 h-4" />
            </div>
            <select 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="min-w-[140px] border border-gray-300 border-l-0 px-3 py-1.5 text-[13px] outline-none bg-white text-gray-700 cursor-pointer"
            >
              <option value="Voucher Type">Voucher Type</option>
              <option value="Voucher Id">Voucher Id</option>
              <option value="Voucher Head">Voucher Head</option>
            </select>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for..." 
              className="flex-1 min-w-0 border border-gray-300 border-l-0 rounded-r-[3px] px-3 py-1.5 text-[13px] outline-none bg-white text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto bg-white p-4">
          <table className="w-full text-left border border-gray-200">
            <thead>
              <tr className="bg-white border-b border-gray-200 text-gray-600 text-[12px]">
                <th className="border-r border-gray-200 w-[50px]"><HeaderCell text="#" /></th>
                <th className="border-r border-gray-200 w-[45%]"><HeaderCell text="Voucher Type" /></th>
                <th className="border-r border-gray-200 w-[25%]"><HeaderCell text="Voucher Head" /></th>
                <th className="border-r border-gray-200 w-[15%]"><HeaderCell text="Voucher Id" /></th>
                <th className="border-r border-gray-200 w-[100px]"><HeaderCell text="Action" /></th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-8 border-t border-gray-200">No vouchers found.</td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-100 text-[13px] transition-colors">
                    <td className="py-2 px-3 text-gray-700 border-r border-gray-200">{idx + 1}</td>
                    <td className="py-2 px-3 text-gray-700 border-r border-gray-200">{row.type}</td>
                    <td className="py-2 px-3 text-gray-700 border-r border-gray-200">{row.head || ''}</td>
                    <td className="py-2 px-3 text-gray-700 border-r border-gray-200">{row.voucherId}</td>
                    <td className="py-2 px-3 border-r border-gray-200">
                      <div className="flex items-center justify-start gap-1">
                        <button onClick={() => handleEdit(row)} className="bg-[#17a2b8] hover:bg-[#138496] text-white p-1 rounded-[3px] transition-colors shadow-sm">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(row.id)} className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      <VoucherMasterModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditRow(null); }}
        onSave={handleSaveVoucher}
        editData={editRow}
      />
    </div>
  );
}

const HeaderCell = ({ text }) => (
  <div className="py-2 px-3 flex items-center justify-between cursor-pointer group hover:bg-gray-50">
    <span className="text-[12px] font-medium text-gray-500 group-hover:text-gray-700">{text}</span>
    <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
  </div>
);

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
