import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  X, 
  Plus, 
  GitMerge, 
  Upload,
  ChevronsUpDown,
  Menu,
  Edit,
  Trash2
} from 'lucide-react';
import { EmployeeMasterModal } from '../components/EmployeeMasterModal';

export function EmployeeMaster() {
  const navigate = useNavigate();
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeIncorrect, setMergeIncorrect] = useState('');
  const [mergeCorrect, setMergeCorrect] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [rows, setRows] = useState([]);
  const [searchFilter, setSearchFilter] = useState('Employee Name');
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get('/employees');
      if (res.data.success) {
        setRows(res.data.data.map(emp => ({
          id: emp.id,
          employeeName: emp.name,
          mobileNumber: emp.mobile || '',
          city: emp.city || '',
          joiningDate: emp.joiningDate || '',
          designation: emp.designation || '',
          salary: emp.salary || 0,
          paidHoliday: emp.paidHoliday || 0,
          commission: emp.commission || 0,
          specialCommission: emp.specialCommission || 0,
          totalSaleCommission: emp.totalSaleCommission || 0,
          commissionOnManufacturing: emp.commissionOnManufacturing || 0
        })));
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleMerge = async () => {
    if (!mergeIncorrect || !mergeCorrect || mergeIncorrect === mergeCorrect) {
      alert('Please select two different employees to merge.');
      return;
    }
    try {
      await apiClient.delete(`/employees/${mergeIncorrect}`);
      fetchEmployees();
      setMergeIncorrect('');
      setMergeCorrect('');
      setMergeModalOpen(false);
      alert('Merge successful! Incorrect employee has been removed.');
    } catch (error) {
      console.error('Merge failed:', error);
      alert('Merge failed. Please try again.');
    }
  };

  useEffect(() => {
    const handleEmployeeAdded = async (e) => {
      try {
        const res = await apiClient.post('/employees', {
          name: e.detail.employeeName,
          mobile: e.detail.mobileNumber,
          city: e.detail.city,
          joiningDate: e.detail.joiningDate,
          designation: e.detail.designation,
          salary: e.detail.salary,
          paidHoliday: e.detail.paidHoliday,
          commission: e.detail.commission,
          specialCommission: e.detail.specialCommission,
          totalSaleCommission: e.detail.totalSaleCommission,
          commissionOnManufacturing: e.detail.commissionOnManufacturing === 'YES' ? 1 : 0,
          openingBalance: e.detail.openingBalance,
          openingBalanceType: e.detail.openingBalanceType
        });
        if (res.data.success) {
          fetchEmployees();
        }
      } catch (err) {
        console.error('Error creating employee:', err);
      }
    };
    const handleEmployeeUpdated = async (e) => {
      try {
        const res = await apiClient.put(`/employees/${e.detail.id}`, {
          name: e.detail.employeeName,
          mobile: e.detail.mobileNumber,
          city: e.detail.city,
          joiningDate: e.detail.joiningDate,
          designation: e.detail.designation,
          salary: e.detail.salary,
          paidHoliday: e.detail.paidHoliday,
          commission: e.detail.commission,
          specialCommission: e.detail.specialCommission,
          totalSaleCommission: e.detail.totalSaleCommission,
          commissionOnManufacturing: e.detail.commissionOnManufacturing === 'YES' ? 1 : 0
        });
        if (res.data.success) {
          fetchEmployees();
        }
      } catch (err) {
        console.error('Error updating employee:', err);
      }
    };
    window.addEventListener('employeeAdded', handleEmployeeAdded);
    window.addEventListener('employeeUpdated', handleEmployeeUpdated);
    return () => {
      window.removeEventListener('employeeAdded', handleEmployeeAdded);
      window.removeEventListener('employeeUpdated', handleEmployeeUpdated);
    };
  }, []);

  const filteredRows = rows.filter(row => {
    let match = true;
    if (fromDate) {
      if (!row.joiningDate) match = false;
      else if (new Date(row.joiningDate) < new Date(fromDate)) match = false;
    }
    if (toDate) {
      if (!row.joiningDate) match = false;
      else if (new Date(row.joiningDate) > new Date(toDate)) match = false;
    }
    if (searchQuery) {
      if (searchFilter === 'Employee Name') {
        if (!row.employeeName?.toLowerCase().includes(searchQuery.toLowerCase())) match = false;
      } else if (searchFilter === 'Address') {
         if (!row.city?.toLowerCase().includes(searchQuery.toLowerCase())) match = false;
      } else if (searchFilter === 'Mobile No') {
         if (!row.mobileNumber?.toLowerCase().includes(searchQuery.toLowerCase())) match = false;
      }
    }
    return match;
  });

  const handleExport = () => {
    if (filteredRows.length === 0) {
      const headers = ['#', 'Employee Name', 'Mobile Number', 'City', 'Joining Date', 'Designation', 'Salary', 'Paid Holiday', 'Commission', 'Special Commission', 'Total Sale Commission', 'Commission on Manufacturing'];
      const csvRows = [headers.join(',')];
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employee_master.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    const headers = ['#', 'Employee Name', 'Mobile Number', 'City', 'Joining Date', 'Designation', 'Salary', 'Paid Holiday', 'Commission', 'Special Commission', 'Total Sale Commission', 'Commission on Manufacturing'];
    const csvRows = [headers.join(',')];
    
    filteredRows.forEach((row, index) => {
      const csvRow = [
        index + 1,
        `"${row.employeeName || ''}"`,
        `"${row.mobileNumber || ''}"`,
        `"${row.city || ''}"`,
        `"${row.joiningDate || ''}"`,
        `"${row.designation || ''}"`,
        `"${row.salary || ''}"`,
        `"${row.paidHoliday || ''}"`,
        `"${row.commission || ''}"`,
        `"${row.specialCommission || ''}"`,
        `"${row.totalSaleCommission || ''}"`,
        `"${row.commissionOnManufacturing || ''}"`
      ];
      csvRows.push(csvRow.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'employee_master.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Employee Details</h2>
          
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
              onClick={() => {
                setEditingRow(null);
                setCreateModalOpen(true);
              }}
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
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center w-full max-w-[600px]">
              <div className="flex items-center bg-white min-w-0 border border-gray-300 border-r-0 rounded-l-[3px] px-3 py-2 text-blue-500">
                <FilterIcon className="w-4 h-4" />
              </div>
              <select 
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="min-w-[140px] border border-gray-300 border-l-0 px-3 py-2 text-[13px] outline-none bg-white text-gray-600 cursor-pointer"
              >
                <option value="Employee Name">Employee Name</option>
                <option value="Address">Address</option>
                <option value="Mobile No">Mobile No</option>
              </select>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search for ${searchFilter}`} 
                className="flex-1 min-w-0 border border-gray-300 border-l-0 rounded-r-[3px] px-3 py-2 text-[13px] outline-none bg-white text-gray-800 placeholder-gray-400"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-[13px] font-bold text-gray-700">From:</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-gray-700"
              />
              <label className="text-[13px] font-bold text-gray-700 ml-2">To:</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-x-auto data-grid-scroll">
          <div className="w-full min-w-[1500px]">
            {/* Table Header */}
            <div className="grid grid-cols-[50px_2fr_1.5fr_1fr_1fr_1.5fr_1fr_1fr_1fr_1.5fr_1.5fr_1.5fr_110px] border-b border-gray-200 bg-white">
              <HeaderCell text="#" />
              <HeaderCell text="Employee Name" />
              <HeaderCell text="Mobile No" />
              <HeaderCell text="City" />
              <HeaderCell text="Joining Date" />
              <HeaderCell text="Designation" />
              <HeaderCell text="Salary" />
              <HeaderCell text="Paid Holiday" />
              <HeaderCell text="Commission" />
              <HeaderCell text="Special Comm." />
              <HeaderCell text="Total Sale Comm." />
              <HeaderCell text="Mfg Comm." />
              <HeaderCell text="Action" />
            </div>

            {/* Rows */}
            {filteredRows.map((row, index) => (
              <div key={row.id} className="grid grid-cols-[50px_2fr_1.5fr_1fr_1fr_1.5fr_1fr_1fr_1fr_1.5fr_1.5fr_1.5fr_110px] border-b border-gray-200 hover:bg-gray-50 transition-colors bg-white">
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{index + 1}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.employeeName}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.mobileNumber}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.city}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.joiningDate}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.designation}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.salary}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.paidHoliday || '0'}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.commission || '0'}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.specialCommission || '0'}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.totalSaleCommission || '0'}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.commissionOnManufacturing || '-'}</div>
                <div className="py-2.5 px-3 flex flex-wrap items-center gap-1">
                  <ActionButton type="edit" onClick={() => {
                    setEditingRow(row);
                    setCreateModalOpen(true);
                  }} />
                  <ActionButton type="delete" onClick={async () => {
                    if (window.confirm('Are you sure you want to delete this employee?')) {
                      try {
                        const res = await apiClient.delete(`/employees/${row.id}`);
                        if (res.data.success) {
                          fetchEmployees();
                        }
                      } catch (err) {
                        console.error('Error deleting employee:', err);
                      }
                    }
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <span className="text-[12px] text-gray-500">{filteredRows.length} total</span>
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
              <h3 className="text-white font-medium text-[15px]">Employee Correction</h3>
              <button onClick={() => setMergeModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-6 h-6 font-bold text-[#dc3545]" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-800">Incorrect Employee Name</label>
                <select 
                  value={mergeIncorrect}
                  onChange={(e) => setMergeIncorrect(e.target.value)}
                  className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-2 text-[14px] text-gray-800 focus:outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] w-full font-bold"
                >
                  <option value="">Select Name</option>
                  {rows.map(row => <option key={row.id} value={row.id}>{row.employeeName}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-800">Correct Employee Name</label>
                <select 
                  value={mergeCorrect}
                  onChange={(e) => setMergeCorrect(e.target.value)}
                  className="min-w-0 border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:border-[#4F46E5] w-full"
                >
                  <option value="">Select Name</option>
                  {rows.map(row => <option key={row.id} value={row.id}>{row.employeeName}</option>)}
                </select>
              </div>
            </div>
            
            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button 
                onClick={handleMerge}
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

      <EmployeeMasterModal 
        isOpen={createModalOpen} 
        onClose={() => {
          setCreateModalOpen(false);
          setEditingRow(null);
        }} 
        employee={editingRow}
      />

    </div>
  );
}

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

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
