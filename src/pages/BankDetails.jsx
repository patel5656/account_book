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
  Trash2,
  ScanBarcode
} from 'lucide-react';
import { QRCodeGenerator } from '../components/QRCodeGenerator';

export function BankDetails() {
  const navigate = useNavigate();
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const [activeToggle, setActiveToggle] = useState(true);
  const [newBookName, setNewBookName] = useState('');
  const [newType, setNewType] = useState('CASH BOOK');
  const [newAddress, setNewAddress] = useState('');
  const [newBranch, setNewBranch] = useState('');
  const [newIfsc, setNewIfsc] = useState('');
  const [newAccountNo, setNewAccountNo] = useState('');

  const [editBookName, setEditBookName] = useState('');
  const [editType, setEditType] = useState('');
  const [mergeDropdownOpen, setMergeDropdownOpen] = useState(false);

  const [searchFilter, setSearchFilter] = useState('Bank Name');
  const [searchQuery, setSearchQuery] = useState('');

  const [incorrectBankId, setIncorrectBankId] = useState('');
  const [correctBankId, setCorrectBankId] = useState('');
  const [correctBankName, setCorrectBankName] = useState('Select Name');

  const [rows, setRows] = useState([]);

  const fetchBanks = async () => {
    try {
      const res = await apiClient.get('/banks');
      if (res.data.success) {
        setRows(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching banks from backend:', err);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleInternalSubmit = async () => {
    if (newBookName.trim() !== '') {
      try {
        const res = await apiClient.post('/banks', {
          name: newBookName,
          type: newType,
          balance: 0,
          address: newAddress,
          branch: newBranch,
          ifsc: newIfsc,
          accountNo: newAccountNo
        });
        if (res.data.success) {
          fetchBanks();
        }
      } catch (err) {
        console.error('Error creating bank account:', err);
      }
    }
    setNewBookName('');
    setNewType('CASH BOOK');
    setNewAddress('');
    setNewBranch('');
    setNewIfsc('');
    setNewAccountNo('');
    setCreateModalOpen(false);
  };

  const filteredRows = rows.filter(row => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (searchFilter === 'Bank Name') {
      return row.name?.toLowerCase().includes(query);
    } else if (searchFilter === 'Address') {
      return row.address?.toLowerCase().includes(query);
    } else if (searchFilter === 'Book Type') {
      return row.type?.toLowerCase().includes(query);
    }
    return true;
  });

  const handleEditClick = (row) => {
    setSelectedRow(row);
    setEditBookName(row.name || '');
    setEditType(row.type || 'CASH BOOK');
    setEditModalOpen(true);
  };

  const handleViewClick = (row) => {
    setSelectedRow(row);
    setViewModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this bank account?')) {
      try {
        const res = await apiClient.delete(`/banks/${id}`);
        if (res.data.success) {
          fetchBanks();
        }
      } catch (err) {
        console.error('Error deleting bank:', err);
      }
    }
  };

  const handleUpdateSubmit = async () => {
    if (editBookName.trim() !== '' && selectedRow) {
      try {
        const res = await apiClient.put(`/banks/${selectedRow.id}`, {
          name: editBookName,
          type: editType
        });
        if (res.data.success) {
          fetchBanks();
        }
      } catch (err) {
        console.error('Error updating bank:', err);
      }
      setEditModalOpen(false);
    }
  };
  const handleMergeSubmit = async () => {
    if (!incorrectBankId || !correctBankId) {
      alert('Please select both incorrect and correct bank accounts');
      return;
    }
    try {
      const res = await apiClient.post('/banks/merge', {
        sourceBankId: incorrectBankId,
        targetBankId: correctBankId
      });
      if (res.data.success) {
        alert('Bank accounts merged successfully');
        fetchBanks();
        setMergeModalOpen(false);
        setIncorrectBankId('');
        setCorrectBankId('');
        setCorrectBankName('Select Name');
      }
    } catch (err) {
      console.error('Error merging banks:', err);
      alert(err.response?.data?.message || 'Error merging bank accounts');
    }
  };

  const handleExport = () => {
    const headers = ['Bank Name', 'Address', 'Branch', 'IFSC Code', 'Account No', 'Book Type', 'Balance'];
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    filteredRows.forEach(row => {
      const rowData = [
        `"${row.name || ''}"`,
        `"${row.address || ''}"`,
        `"${row.branch || ''}"`,
        `"${row.ifsc || ''}"`,
        `"${row.accountNo || ''}"`,
        `"${row.type || ''}"`,
        `"${row.balance || 0}"`
      ];
      csvRows.push(rowData.join(','));
    });
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'bank_details.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Bank Details</h2>
          
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
                setActiveToggle(true);
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
          <div className="flex items-center w-full max-w-[600px]">
            <div className="flex items-center bg-white min-w-0 border border-gray-300 border-r-0 rounded-l-[3px] px-3 py-2 text-blue-500">
              <FilterIcon className="w-4 h-4" />
            </div>
            <select 
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="min-w-[130px] border border-gray-300 border-l-0 px-3 py-2 text-[13px] outline-none bg-white text-gray-600 cursor-pointer"
            >
              <option value="Bank Name">Bank Name</option>
              <option value="Address">Address</option>
              <option value="Book Type">Book Type</option>
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
          <div className="min-w-[1100px] w-full">
            {/* Table Header */}
            <div className="grid grid-cols-[50px_2fr_2fr_1.5fr_1.5fr_2fr_1.5fr_100px_120px] border-b border-gray-200">
              <HeaderCell text="#" />
              <HeaderCell text="Bank Name" />
              <HeaderCell text="Address" />
              <HeaderCell text="Branch" />
              <HeaderCell text="IFSC Code" />
              <HeaderCell text="Account No" />
              <HeaderCell text="Book Type" />
              <HeaderCell text="Balance" />
              <HeaderCell text="Action" />
            </div>

            {/* Rows */}
            {filteredRows.length > 0 ? (
              filteredRows.map((row, index) => (
                <div key={row.id} className="grid grid-cols-[50px_2fr_2fr_1.5fr_1.5fr_2fr_1.5fr_100px_120px] border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{index + 1}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center truncate">{row.name}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center truncate">{row.address || ''}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center truncate">{row.branch || ''}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center truncate">{row.ifsc || ''}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center truncate">{row.accountNo || ''}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center truncate">{row.type}</div>
                  <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.balance}</div>
                  <div className="py-2.5 px-3 flex flex-wrap items-center gap-1">
                    <ActionButton type="menu" onClick={() => handleViewClick(row)} />
                    <ActionButton type="edit" onClick={() => handleEditClick(row)} />
                    <ActionButton type="delete" onClick={() => handleDeleteClick(row.id)} />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 px-4 text-center text-gray-500 text-[14px]">
                No bank details found matching "{searchQuery}"
              </div>
            )}
            
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <span className="text-[12px] text-gray-500">Showing {filteredRows.length} of {rows.length} total</span>
        </div>
      </div>

      {/* Edit Modal (Screenshot 1) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[15px]">Cash/Bank Master</h3>
              <button 
                onClick={() => setEditModalOpen(false)}
                className="text-white hover:text-red-200 transition-colors"
              >
                <X className="w-6 h-6 font-bold text-[#dc3545]" strokeWidth={3} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-5">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-end mb-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-800">Book Name</label>
                  <input 
                    type="text" 
                    value={editBookName}
                    onChange={(e) => setEditBookName(e.target.value)}
                    className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 focus:outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)]"
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div 
                    onClick={() => setActiveToggle(!activeToggle)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${activeToggle ? 'bg-[#007bff]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full transition-all shadow-sm ${activeToggle ? 'left-[22px]' : 'left-[2px]'}`} />
                  </div>
                  <span className="text-[13px] font-bold text-gray-800">Active</span>
                </div>
                
                <div className="flex flex-col gap-2 w-[250px]">
                  <label className="text-[13px] font-bold text-gray-800">Type</label>
                  <select 
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="min-w-0 border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-600 outline-none focus:border-[#4F46E5]"
                  >
                    <option value="CASH BOOK">CASH BOOK</option>
                    <option value="BANK BOOK">BANK BOOK</option>
                    <option value="WALLET-BOOK">WALLET-BOOK</option>
                    <option value="LOAN BOOK">LOAN BOOK</option>
                    <option value="NON-PAYMENT BOOK">NON-PAYMENT BOOK</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button 
                onClick={handleUpdateSubmit}
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

      {/* View Modal (Screenshot 2) */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setViewModalOpen(false)}>
          <div 
            className="bg-white p-6 rounded shadow-2xl flex flex-col items-center w-[300px]"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-[#004085] text-xl font-bold mb-1 tracking-tight">Your Firm Name</h2>
            <h3 className="text-[#004085] text-[15px] font-bold mb-2">{selectedRow?.name}</h3>
            
            <div className="flex flex-col items-center my-3">
              <QRCodeGenerator
                amount={0}
                merchantName="Your Firm Name"
                billId={selectedRow?.id?.toString() || ''}
                upiId="merchant@upi"
              />
            </div>
            
            <div className="flex justify-between w-full mt-4">
              <span className="text-[#004085] font-bold text-[13px]">MRP : 0/-</span>
              <span className="text-[#004085] font-bold text-[13px]">PRICE : 0/-</span>
            </div>
          </div>
        </div>
      )}

      {/* Merge Modal (Bank Correction) */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setMergeDropdownOpen(false)}>
          <div className="bg-white rounded-[4px] shadow-2xl w-[400px] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between rounded-t-[4px]">
              <h3 className="text-white font-medium text-[15px]">Bank Correction</h3>
              <button onClick={() => setMergeModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-6 h-6 font-bold text-[#dc3545]" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">Incorrect Bank Name</label>
                <select 
                  value={incorrectBankId}
                  onChange={(e) => setIncorrectBankId(e.target.value)}
                  className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-2 text-[14px] text-gray-800 outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold"
                >
                  <option value="">Select Name</option>
                  {rows.map(row => <option value={row.id} key={row.id}>{row.name}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-1 relative">
                <label className="text-[13px] font-bold text-gray-800">Correct Bank Name</label>
                <div 
                  onClick={() => setMergeDropdownOpen(!mergeDropdownOpen)}
                  className="min-w-0 border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] text-gray-800 outline-none flex justify-between items-center cursor-pointer bg-white"
                >
                  <span className={correctBankName === 'Select Name' ? "text-gray-400" : "text-gray-800 font-bold"}>{correctBankName}</span>
                  <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                </div>
                
                {mergeDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-[4px] shadow-lg max-h-[250px] overflow-y-auto z-50">
                    <div className="px-3 py-1.5 bg-[#add8e6] text-gray-500 text-sm font-bold border-b border-gray-200">Select Name</div>
                    {rows.map(row => (
                      <div 
                        key={row.id} 
                        className={`p-3 hover:bg-[#add8e6] cursor-pointer border-b border-gray-200 last:border-b-0 flex justify-between items-start transition-colors`}
                        onClick={() => { 
                          setCorrectBankId(row.id);
                          setCorrectBankName(row.name);
                          setMergeDropdownOpen(false); 
                        }}
                      >
                        <div className="flex flex-col">
                          <div className="font-bold text-[14px] text-gray-800">{row.name}</div>
                          <div className={`text-[12px] mt-0.5 ${row.type === 'CASH BOOK' ? 'text-[#28a745]' : 'text-[#ffc107]'}`}>{row.type}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                           <span className="text-[13px] text-gray-800">{row.balance}</span>
                           <div className="flex items-center gap-1.5 mt-1">
                             <Edit 
                               className="w-4 h-4 text-[#4F46E5] hover:text-blue-700" 
                               onClick={(e) => { e.stopPropagation(); setMergeDropdownOpen(false); setMergeModalOpen(false); handleEditClick(row); }} 
                             />
                             <Trash2 
                               className="w-4 h-4 text-[#dc3545] hover:text-red-700" 
                               onClick={(e) => { e.stopPropagation(); handleDeleteClick(row.id); }} 
                             />
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end gap-2 rounded-b-[4px]">
              <button 
                onClick={handleMergeSubmit}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors shadow-sm"
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

      {/* Create New Modal (Cash/Bank Master) */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[15px]">Cash/Bank Master</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-6 h-6 font-bold text-[#dc3545]" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-5">
              <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-end mb-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-gray-800">Book Name</label>
                  <input 
                    type="text" 
                    value={newBookName}
                    onChange={(e) => setNewBookName(e.target.value)}
                    placeholder="Enter Bank Name Or UPI Name"
                    className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold"
                  />
                </div>
                
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <div 
                    onClick={() => setActiveToggle(!activeToggle)}
                    className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${activeToggle ? 'bg-[#007bff]' : 'bg-gray-300'}`}
                  >
                    <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full transition-all shadow-sm ${activeToggle ? 'left-[22px]' : 'left-[2px]'}`} />
                  </div>
                  <span className="text-[13px] font-bold text-gray-800">Active</span>
                </div>
                
                <div className="flex flex-col gap-2 w-[250px]">
                  <label className="text-[13px] font-bold text-gray-800">Type</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="min-w-0 border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-600 outline-none focus:border-[#4F46E5]"
                  >
                    <option>CASH BOOK</option>
                    <option>BANK BOOK</option>
                    <option>WALLET-BOOK</option>
                    <option>LOAN BOOK</option>
                    <option>NON-PAYMENT BOOK</option>
                  </select>
                </div>
              </div>

              {/* Additional Fields */}
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800">Account No</label>
                    <input 
                      type="text" 
                      value={newAccountNo}
                      onChange={(e) => setNewAccountNo(e.target.value)}
                      placeholder="Enter Account No"
                      className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800">IFSC Code</label>
                    <input 
                      type="text" 
                      value={newIfsc}
                      onChange={(e) => setNewIfsc(e.target.value)}
                      placeholder="Enter IFSC Code"
                      className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold"
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800">Branch</label>
                    <input 
                      type="text" 
                      value={newBranch}
                      onChange={(e) => setNewBranch(e.target.value)}
                      placeholder="Enter Branch Name"
                      className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-2">
                    <label className="text-[13px] font-bold text-gray-800">Address</label>
                    <input 
                      type="text" 
                      value={newAddress}
                      onChange={(e) => setNewAddress(e.target.value)}
                      placeholder="Enter Bank Address"
                      className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 placeholder-gray-400 focus:outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button 
                onClick={handleInternalSubmit}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors shadow-sm"
              >
                Submit
              </button>
              <button onClick={() => setCreateModalOpen(false)} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[4px] text-[14px] transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
