import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  X, 
  Plus, 
  Upload, 
  ChevronsUpDown, 
  Menu, 
  Edit, 
  Trash2
} from 'lucide-react';
import { BranchMasterModal } from '../components/BranchMasterModal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function BranchMaster() {
  const navigate = useNavigate();
  
  const [searchFilter, setSearchFilter] = useState('Branch Name');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ id: null, name: '', code: '', contact: '', gstin: '', status: 'Active' });

  const [rows, setRows] = useState([]);

  const fetchBranches = async () => {
    try {
      const res = await apiClient.get('/branches');
      if (res.data.data) {
        const mapped = res.data.data.map(b => ({
          id: b.id,
          name: b.name,
          code: b.code || '',
          contact: b.contact || '',
          gstin: b.gstin || '',
          status: b.isActive ? 'Active' : 'Inactive'
        }));
        setRows(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch branches', error);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  useEffect(() => {
    const handleBranchAdded = (e) => {
      setRows(prev => [...prev, {
        id: e.detail.id,
        name: e.detail.name,
        code: e.detail.code,
        contact: e.detail.contact || '',
        gstin: e.detail.gstin || '',
        status: e.detail.isActive ? 'Active' : 'Inactive'
      }]);
    };
    window.addEventListener('branchAdded', handleBranchAdded);
    return () => window.removeEventListener('branchAdded', handleBranchAdded);
  }, []);

  const filteredRows = rows.filter(row => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (searchFilter === 'Branch Name') {
      return row.name?.toLowerCase().includes(query);
    } else if (searchFilter === 'Branch Code') {
      return row.code?.toLowerCase().includes(query);
    }
    return true;
  });

  const handleEditClick = (row) => {
    setEditFormData({ ...row });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await apiClient.put(`/branches/${editFormData.id}`, {
        name: editFormData.name,
        code: editFormData.code,
        contact: editFormData.contact,
        gstin: editFormData.gstin,
        isActive: editFormData.status === 'Active'
      });
      setEditModalOpen(false);
      fetchBranches();
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  const handleDeleteClick = async (id) => {
    try {
      await apiClient.delete(`/branches/${id}`);
      fetchBranches();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleExportPDF = () => {
    if (filteredRows.length === 0) {
      alert('No data to export');
      return;
    }
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Branch Master Report', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Generate table
    const tableColumn = ["#", "Branch Name", "Branch Code", "Contact", "GSTIN", "Status"];
    const tableRows = [];
    
    filteredRows.forEach((row, index) => {
      const rowData = [
        index + 1,
        row.name || '-',
        row.code || '-',
        row.contact || '-',
        row.gstin || '-',
        row.status || '-'
      ];
      tableRows.push(rowData);
    });
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 249, 250] }
    });
    
    doc.save(`Branch_Master_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Branch Master</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handleExportPDF}
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
              className="min-w-[130px] border border-gray-300 border-l-0 px-3 py-2 text-[13px] outline-none bg-white text-gray-600 cursor-pointer"
            >
              <option value="Branch Name">Branch Name</option>
              <option value="Branch Code">Branch Code</option>
            </select>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search for ${searchFilter}`} 
              className="flex-1 min-w-0 border border-gray-300 border-l-0 rounded-r-[3px] px-3 py-2 text-[13px] outline-none bg-white text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1">
          <div className="w-full">
            {/* Table Header */}
            <div className="grid grid-cols-[60px_1fr_150px_150px_200px_100px_120px] border-b border-gray-200">
              <HeaderCell text="#" />
              <HeaderCell text="Branch Name" />
              <HeaderCell text="Branch Code" />
              <HeaderCell text="Contact" />
              <HeaderCell text="GSTIN" />
              <HeaderCell text="Status" />
              <HeaderCell text="Action" />
            </div>

            {/* Rows */}
            {filteredRows.length > 0 ? (
              filteredRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[60px_1fr_150px_150px_200px_100px_120px] border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{index + 1}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center font-medium">{row.name}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.code || ''}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.contact || ''}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.gstin || ''}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${row.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {row.status}
                    </span>
                  </div>
                  <div className="py-2.5 px-3 flex flex-wrap items-center gap-1">
                    <ActionButton type="edit" onClick={() => handleEditClick(row)} />
                    <ActionButton type="delete" onClick={() => handleDeleteClick(row.id)} />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 px-4 text-center text-gray-500 text-[14px]">
                No branches found matching "{searchQuery}"
              </div>
            )}
            
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <span className="text-[12px] text-gray-500">Showing {filteredRows.length} of {rows.length} total</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[15px]">Edit Branch Master</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-6 h-6 font-bold text-[#dc3545]" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-800">Branch Name</label>
                  <input 
                    type="text" 
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 focus:outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-800">Branch Code</label>
                  <input 
                    type="text" 
                    value={editFormData.code}
                    onChange={(e) => setEditFormData({...editFormData, code: e.target.value})}
                    className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-800">Contact Number</label>
                  <input 
                    type="text" 
                    value={editFormData.contact}
                    onChange={(e) => setEditFormData({...editFormData, contact: e.target.value})}
                    className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-800">GSTIN</label>
                  <input 
                    type="text" 
                    value={editFormData.gstin}
                    onChange={(e) => setEditFormData({...editFormData, gstin: e.target.value})}
                    className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <label className="text-[13px] font-bold text-gray-800">Status</label>
                <div className="flex items-center gap-2">
                  <div 
                    className={`w-[36px] h-[20px] rounded-full relative cursor-pointer transition-colors ${editFormData.status === 'Active' ? 'bg-[#28a745]' : 'bg-gray-400'}`}
                    onClick={() => setEditFormData({...editFormData, status: editFormData.status === 'Active' ? 'Inactive' : 'Active'})}
                  >
                    <div className={`w-[16px] h-[16px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${editFormData.status === 'Active' ? 'translate-x-[18px]' : 'translate-x-[2px]'}`}></div>
                  </div>
                  <span className={`text-[13px] font-bold ${editFormData.status === 'Active' ? 'text-green-600' : 'text-gray-500'} select-none`}>
                    {editFormData.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button 
                onClick={handleUpdate}
                className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-4 py-1.5 rounded-[4px] text-[14px] font-bold transition-colors shadow-sm"
              >
                Update
              </button>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[4px] text-[14px] transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <BranchMasterModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />

    </div>
  );
}

const HeaderCell = ({ text }) => (
  <div className="py-2 px-3 flex items-center justify-between cursor-pointer group hover:bg-gray-50">
    <span className="text-[12px] font-bold text-gray-500 group-hover:text-gray-700">{text}</span>
    <ChevronsUpDown className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
  </div>
);

const ActionButton = ({ type, onClick }) => {
  const getStyle = () => {
    switch (type) {
      case 'menu': return 'bg-[#343a40] hover:bg-[#23272b]';
      case 'edit': return 'bg-[#4F46E5] hover:bg-[#4338ca]';
      case 'delete': return 'bg-[#dc3545] hover:bg-[#c82333]';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'menu': return <Menu className="w-3.5 h-3.5 text-white" />;
      case 'edit': return <Edit className="w-3.5 h-3.5 text-white" />;
      case 'delete': return <Trash2 className="w-3.5 h-3.5 text-white" />;
      default: return null;
    }
  };

  return (
    <button 
      onClick={onClick}
      className={`w-[26px] h-[26px] rounded-[3px] flex items-center justify-center transition-colors shadow-sm ${getStyle()}`}
    >
      {getIcon()}
    </button>
  );
};

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
