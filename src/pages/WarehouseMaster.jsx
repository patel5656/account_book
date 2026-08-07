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
import { WarehouseMasterModal } from '../components/WarehouseMasterModal';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export function WarehouseMaster() {
  const navigate = useNavigate();
  
  const [searchFilter, setSearchFilter] = useState('Warehouse Name');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ 
    id: null, 
    name: '', 
    code: '', 
    branchId: '', 
    locationId: '', 
    manager: '', 
    status: 'Active' 
  });

  const [rows, setRows] = useState([]);
  const [branches, setBranches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [warehousesRes, branchesRes, locationsRes] = await Promise.all([
        apiClient.get('/warehouses'),
        apiClient.get('/branches'),
        apiClient.get('/locations')
      ]);

      if (branchesRes.data && branchesRes.data.data) {
        setBranches(branchesRes.data.data);
      }
      if (locationsRes.data && locationsRes.data.data) {
        setLocations(locationsRes.data.data);
      }
      if (warehousesRes.data && warehousesRes.data.data) {
        const mapped = warehousesRes.data.data.map(w => ({
          id: w.id,
          name: w.name,
          code: `WH-${w.id}`,
          branchId: w.branchId ? w.branchId.toString() : '',
          branchName: w.branch?.name || 'All Branches',
          locationId: w.locationId ? w.locationId.toString() : '',
          locationName: w.locRef?.name || 'All Locations',
          manager: w.location || '',
          status: w.isActive ? 'Active' : 'Inactive'
        }));
        setRows(mapped);
      }
    } catch (error) {
      console.error('Failed to load warehouse master details', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleWarehouseAdded = (e) => {
      fetchData(); // Simplest way to ensure all relations are fetched properly
    };
    window.addEventListener('warehouseAdded', handleWarehouseAdded);
    return () => window.removeEventListener('warehouseAdded', handleWarehouseAdded);
  }, []);

  const filteredRows = rows.filter(row => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (searchFilter === 'Warehouse Name') {
      return row.name?.toLowerCase().includes(query);
    } else if (searchFilter === 'Warehouse Code') {
      return row.code?.toLowerCase().includes(query);
    }
    return true;
  });

  const handleEditClick = (row) => {
    setEditFormData({
      id: row.id,
      name: row.name,
      code: row.code,
      branchId: row.branchId || '',
      locationId: row.locationId || '',
      manager: row.manager,
      status: row.status
    });
    setEditModalOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await apiClient.put(`/warehouses/${editFormData.id}`, {
        name: editFormData.name,
        location: editFormData.manager,
        isActive: editFormData.status === 'Active',
        branchId: editFormData.branchId ? parseInt(editFormData.branchId, 10) : null,
        locationId: editFormData.locationId ? parseInt(editFormData.locationId, 10) : null
      });
      setEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Update failed', error);
      alert('Update failed');
    }
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) {
      return;
    }
    try {
      await apiClient.delete(`/warehouses/${id}`);
      fetchData();
    } catch (error) {
      console.error('Delete failed', error);
      alert('Delete failed');
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
    doc.text('Warehouse Master Report', 14, 22);
    
    // Add date
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Generate table
    const tableColumn = ["#", "Warehouse Name", "WH Code", "Linked Branch", "Location", "Manager", "Status"];
    const tableRows = [];
    
    filteredRows.forEach((row, index) => {
      const rowData = [
        index + 1,
        row.name || '-',
        row.code || '-',
        row.branchName || '-',
        row.locationName || '-',
        row.manager || '-',
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
    
    doc.save(`Warehouse_Master_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`);
  };

  // Filter locations for Edit Modal based on selected branch
  const filteredLocationsForEdit = locations.filter(
    (loc) => loc.branchId === parseInt(editFormData.branchId, 10)
  );

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Warehouse Master</h2>
          
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
              <option value="Warehouse Name">Warehouse Name</option>
              <option value="Warehouse Code">Warehouse Code</option>
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
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[900px] w-full">
            {/* Table Header */}
            <div className="grid grid-cols-[60px_1fr_120px_180px_180px_150px_100px_120px] border-b border-gray-200 bg-gray-50">
              <HeaderCell text="#" />
              <HeaderCell text="Warehouse Name" />
              <HeaderCell text="WH Code" />
              <HeaderCell text="Linked Branch" />
              <HeaderCell text="Location" />
              <HeaderCell text="Manager" />
              <HeaderCell text="Status" />
              <HeaderCell text="Action" />
            </div>

            {/* Rows */}
            {loading ? (
              <div className="py-8 px-4 text-center text-gray-500 text-[14px]">
                Loading warehouses...
              </div>
            ) : filteredRows.length > 0 ? (
              filteredRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[60px_1fr_120px_180px_180px_150px_100px_120px] border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{index + 1}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center font-medium">{row.name}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.code || ''}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center font-medium text-indigo-600">{row.branchName}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center font-medium text-teal-600">{row.locationName}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.manager || ''}</div>
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
                No warehouses found matching "{searchQuery}"
              </div>
            )}
            
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <span className="text-[12px] text-gray-500">Showing {filteredRows.length} of {rows.length} total</span>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[15px]">Edit Warehouse Master</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-6 h-6 font-bold text-[#dc3545]" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-5">
              <div className="flex flex-col gap-4">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800">Warehouse Name</label>
                    <input 
                      type="text" 
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                      className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 focus:outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800">WH Code</label>
                    <input 
                      type="text" 
                      value={editFormData.code}
                      onChange={(e) => setEditFormData({...editFormData, code: e.target.value})}
                      disabled
                      className="border border-gray-300 bg-gray-100 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-500 focus:outline-none cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800">Link to Branch</label>
                    <select 
                      value={editFormData.branchId}
                      onChange={(e) => setEditFormData({...editFormData, branchId: e.target.value, locationId: ''})}
                      className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 focus:outline-none focus:border-[#4F46E5] bg-white"
                    >
                      <option value="">Select Branch</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800">Location</label>
                    <select 
                      value={editFormData.locationId}
                      onChange={(e) => setEditFormData({...editFormData, locationId: e.target.value})}
                      disabled={!editFormData.branchId}
                      className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 focus:outline-none focus:border-[#4F46E5] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">Select Location</option>
                      {filteredLocationsForEdit.map((loc) => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 col-span-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800">Manager</label>
                    <input 
                      type="text" 
                      value={editFormData.manager}
                      onChange={(e) => setEditFormData({...editFormData, manager: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800">Status</label>
                    <div className="flex items-center gap-2 mt-2">
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
      <WarehouseMasterModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} />

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
