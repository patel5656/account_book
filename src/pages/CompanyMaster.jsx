import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  CalendarDays,
  Save
} from 'lucide-react';
import { PartyMasterModal } from '../components/PartyMasterModal';

export function CompanyMaster() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [mergeIncorrect, setMergeIncorrect] = useState('');
  const [mergeCorrect, setMergeCorrect] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);

  const [followReason, setFollowReason] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [followupHistory, setFollowupHistory] = useState([]);
  
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/customers?type=COMPANY');
      if (res.data.success) {
        setRows(res.data.data.map(p => ({
          ...p,
          mobile: p.phone || p.mobile || '',
          msgSent: '0'
        })));
      }
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleMerge = async () => {
    if (!mergeIncorrect || !mergeCorrect || mergeIncorrect === mergeCorrect) {
      alert('Please select two different parties to merge.');
      return;
    }
    try {
      await apiClient.delete(`/customers/${mergeIncorrect}`);
      fetchCompanies();
      setMergeIncorrect('');
      setMergeCorrect('');
      setMergeModalOpen(false);
      alert('Merge successful! Incorrect party has been removed.');
    } catch (error) {
      console.error('Merge failed:', error);
      alert('Merge failed. Please try again.');
    }
  };

  useEffect(() => {
    const handlePartyAdded = async (e) => {
      if (e.detail.type === 'COMPANY') {
        try {
          const payload = {
            name: e.detail.name,
            phone: e.detail.mobile,
            mobile: e.detail.mobile,
            city: e.detail.city || '',
            address: e.detail.address || '',
            gstin: e.detail.gstin || '',
            partyTags: e.detail.partyTags || '',
            balance: 0,
            status: 'Active',
            type: 'COMPANY',
            dueDays: parseInt(e.detail.dueDays, 10),
            drugLicense: e.detail.drugLicense,
            pinCode: e.detail.pinCode,
            gstApplicable: e.detail.gstApplicable,
            state: e.detail.state,
            email: e.detail.emailAddress,
            partyType: e.detail.partyType,
            otherMobileNo: e.detail.otherMobileNo,
            partyLimit: parseFloat(e.detail.partyLimit),
            interestRate: parseFloat(e.detail.interestRate),
            loyaltyPoints: parseInt(e.detail.loyaltyPoints, 10),
            joiningDate: e.detail.joiningDate,
            wholeParty: e.detail.wholeParty,
            sezParty: e.detail.sezParty,
            focParty: e.detail.focParty
          };
          const res = await apiClient.post('/customers', payload);
          if (res.data.success) {
            fetchCompanies();
          }
        } catch (error) {
          console.error('Failed to create company/supplier:', error);
        }
      }
    };
    window.addEventListener('partyAdded', handlePartyAdded);
    return () => window.removeEventListener('partyAdded', handlePartyAdded);
  }, []);

  const fetchFollowups = async (customerId) => {
    try {
      const res = await apiClient.get(`/followups/customer/${customerId}`);
      if (res.data.success) {
        setFollowupHistory(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch followups:', error);
    }
  };

  const handleEditClick = (row) => {
    setEditRow(row);
    setEditModalOpen(true);
  };

  const handleViewClick = (row) => {
    setSelectedRow(row);
    setFollowReason('');
    const today = new Date();
    setReminderDate(today.toISOString().split('T')[0]);
    fetchFollowups(row.id);
    setViewModalOpen(true);
  };

  const handleSubmitFollowup = async () => {
    if (!selectedRow || !followReason.trim()) return;
    try {
      const payload = {
        reason: followReason,
        reminderDate: reminderDate
      };
      const res = await apiClient.post(`/followups/customer/${selectedRow.id}`, payload);
      if (res.data.success) {
        setFollowReason('');
        fetchFollowups(selectedRow.id);
      }
    } catch (error) {
      console.error('Failed to submit followup:', error);
    }
  };

  const handleDeleteFollowup = async (id) => {
    if (window.confirm('Are you sure you want to delete this followup?')) {
      try {
        const res = await apiClient.delete(`/followups/${id}`);
        if (res.data.success) {
          fetchFollowups(selectedRow.id);
        }
      } catch (error) {
        console.error('Failed to delete followup:', error);
      }
    }
  };

  const handleEditSubmit = async () => {
    if (editRow) {
      try {
        const payload = {
          name: editRow.name,
          phone: editRow.mobile,
          mobile: editRow.mobile,
          address: editRow.address || '',
          gstin: editRow.gstin || '',
          partyTags: editRow.partyTags || '',
          status: editRow.status || 'Active',
          dueDays: parseInt(editRow.dueDays, 10),
          drugLicense: editRow.drugLicense,
          pinCode: editRow.pinCode,
          gstApplicable: editRow.gstApplicable,
          state: editRow.stateName || editRow.state,
          email: editRow.emailAddress || editRow.email,
          partyType: editRow.partyType,
          otherMobileNo: editRow.otherMobileNo,
          partyLimit: parseFloat(editRow.partyLimit),
          interestRate: parseFloat(editRow.interestRate),
          loyaltyPoints: parseInt(editRow.loyaltyPoints, 10),
          joiningDate: editRow.joiningDate,
          wholeParty: editRow.wholeParty,
          sezParty: editRow.sezParty,
          focParty: editRow.focParty
        };
        const res = await apiClient.put(`/customers/${editRow.id}`, payload);
        if (res.data.success) {
          fetchCompanies();
        }
      } catch (error) {
        console.error('Failed to update company/supplier:', error);
      }
      setEditModalOpen(false);
      setEditRow(null);
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this company/supplier?')) {
      try {
        const res = await apiClient.delete(`/customers/${id}`);
        if (res.data.success) {
          fetchCompanies();
        }
      } catch (error) {
        console.error('Failed to delete company:', error);
      }
    }
  };

  const handleExport = () => {
    const headers = ['Party Name', 'Mobile No', 'City', 'Type', 'Balance'];
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    rows.forEach(row => {
      const rowData = [
        `"${row.name || ''}"`,
        `"${row.mobile || ''}"`,
        `"${row.city || ''}"`,
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
    link.setAttribute('download', 'company_master.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleWhatsApp = () => {
    if (!selectedRow) {
      alert("Please select a company first by clicking on their row.");
      return;
    }
    const mobile = (selectedRow.mobile || '').replace(/\D/g, '');
    if (!mobile || mobile.length < 10) {
      alert("Selected company does not have a valid mobile number.");
      return;
    }
    const formattedMobile = mobile.startsWith('91') && mobile.length > 10 ? mobile : `91${mobile}`;
    window.open(`https://wa.me/${formattedMobile}`, '_blank');
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">{t('company_master.title')}</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setMergeModalOpen(true)}
              className="flex items-center gap-1.5 bg-white text-gray-800 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <GitMerge className="w-4 h-4" />{t('company_master.merge')}
            </button>
            <button 
              onClick={handleWhatsApp}
              className="flex items-center justify-center bg-[#28a745] hover:bg-[#218838] text-white p-1.5 rounded-[3px] transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" strokeWidth={2.5} />{t('company_master.export')}
            </button>
            <button 
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />{t('company_master.create_new')}
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
        <div className="p-3 bg-white">
          <div className="flex items-center w-full max-w-full">
            <div className="flex items-center bg-white min-w-0 border border-gray-300 border-r-0 rounded-l-[3px] px-3 py-2 text-blue-500">
              <FilterIcon className="w-4 h-4" />
            </div>
            <select className="min-w-0 border border-gray-300 border-l-0 px-3 py-2 text-[13px] outline-none bg-white text-gray-600 w-full">
              <option>{t('company_master.party_name')}</option>
              <option>City</option>
              <option>Mobile No</option>
              <option>Party Tags</option>
            </select>
            <input 
              type="text" 
              placeholder="Search for Party Name" 
              className="flex-1 min-w-0 border border-gray-300 border-l-0 rounded-r-[3px] px-3 py-2 text-[13px] outline-none bg-white text-gray-800 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-x-auto data-grid-scroll">
          <div className="w-full min-w-[1000px]">
            {/* Table Header */}
            <div className="grid grid-cols-[40px_minmax(150px,1.5fr)_minmax(120px,1fr)_minmax(150px,1.5fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(120px,1fr)_minmax(80px,1fr)_minmax(100px,1fr)_120px] border-b border-gray-200 bg-white">
              <HeaderCell text="#" />
              <HeaderCell text="Company Name" />
              <HeaderCell text="City" />
              <HeaderCell text="Address" />
              <HeaderCell text="GSTIN" />
              <HeaderCell text="Mobile No" />
              <HeaderCell text="Balance" />
              <HeaderCell text="Party Tags" />
              <HeaderCell text="Points" />
              <HeaderCell text="Msg Sent" />
              <HeaderCell text="Action" />
            </div>

            {/* Rows */}
            {rows.map((row, index) => (
              <div 
                key={row.id} 
                onClick={() => setSelectedRow(row)}
                className={`grid grid-cols-[40px_minmax(150px,1.5fr)_minmax(120px,1fr)_minmax(150px,1.5fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(100px,1fr)_minmax(120px,1fr)_minmax(80px,1fr)_minmax(100px,1fr)_120px] border-b border-gray-200 hover:bg-indigo-50/50 cursor-pointer transition-colors bg-white ${selectedRow?.id === row.id ? 'bg-indigo-50/70 font-semibold' : ''}`}
              >
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{index + 1}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.name || row.customerName}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center truncate" title={row.city}>{row.city || ''}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center truncate" title={row.address}>{row.address || ''}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.gstin || ''}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.mobile || row.mobileNo || ''}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.balance || '0'}</div>
                <div className="py-2.5 px-3 text-[13px] text-gray-700 flex items-center">{row.partyTags || ''}</div>
                <div className="py-2.5 px-3 text-[13px] text-[#28a745] font-bold flex items-center">{row.loyaltyPoints || 0}</div>
                <div className="py-2.5 px-3 flex items-center">
                  <div className="bg-[#ffc107] text-gray-900 px-2 py-0.5 rounded-[3px] text-[12px] font-bold">
                    {row.msgSent || '0'}
                  </div>
                </div>
                <div className="py-2.5 px-3 flex flex-wrap items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <ActionButton type="calendar" onClick={() => handleViewClick(row)} />
                  <ActionButton type="edit_teal" onClick={() => handleEditClick(row)} />
                  <ActionButton type="delete" onClick={() => handleDeleteClick(row.id)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 bg-white">
          <span className="text-[12px] text-gray-500">{rows.length} total</span>
        </div>

      </div>

      {/* Merge Modal (Company Correction) */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-[400px] mx-4 overflow-hidden flex flex-col">
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[15px]">{t('company_master.company_correction')}</h3>
              <button onClick={() => setMergeModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-6 h-6 font-bold text-[#dc3545]" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">{t('company_master.incorrect_name')}</label>
                <select 
                  value={mergeIncorrect}
                  onChange={(e) => setMergeIncorrect(e.target.value)}
                  className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-2 text-[14px] text-gray-800 outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold"
                >
                  <option value="">{t('company_master.select_name')}</option>
                  {rows.map(row => (
                    <option key={row.id} value={row.id}>{row.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">{t('company_master.correct_name')}</label>
                <select 
                  value={mergeCorrect}
                  onChange={(e) => setMergeCorrect(e.target.value)}
                  className="min-w-0 border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] text-gray-800 outline-none focus:border-[#4F46E5]"
                >
                  <option value="">{t('company_master.select_name')}</option>
                  {rows.map(row => (
                    <option key={row.id} value={row.id}>{row.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={handleMerge} className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors shadow-sm">
                {t('company_master.merge')}
              </button>
              <button onClick={() => setMergeModalOpen(false)} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[4px] text-[14px] transition-colors shadow-sm">
                {t('company_master.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Modal (Company Master) */}
      <PartyMasterModal 
        isOpen={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        defaultType="COMPANY" 
      />

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[4px] shadow-2xl w-full sm:max-w-[750px] max-h-[95vh] overflow-hidden flex flex-col">
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[15px]">{t('company_master.edit_company')}</h3>
              <button onClick={() => setEditModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-6 h-6 font-bold text-[#dc3545]" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-5 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {/* Row 1 */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Party Name</label>
                    <input 
                      type="text" 
                      value={editRow?.name || ''}
                      onChange={(e) => setEditRow({...editRow, name: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Mobile No</label>
                    <input 
                      type="text" 
                      value={editRow?.mobile || ''}
                      onChange={(e) => setEditRow({...editRow, mobile: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                {/* Row 2 */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">City</label>
                    <input 
                      type="text" 
                      value={editRow?.city || ''}
                      onChange={(e) => setEditRow({...editRow, city: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Address</label>
                    <input 
                      type="text" 
                      value={editRow?.address || ''}
                      onChange={(e) => setEditRow({...editRow, address: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">GSTIN</label>
                    <input 
                      type="text" 
                      value={editRow?.gstin || ''}
                      onChange={(e) => setEditRow({...editRow, gstin: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Party Tags</label>
                    <input 
                      type="text" 
                      value={editRow?.partyTags || ''}
                      onChange={(e) => setEditRow({...editRow, partyTags: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">State</label>
                    <input 
                      type="text" 
                      value={editRow?.stateName || editRow?.state || ''}
                      onChange={(e) => setEditRow({...editRow, stateName: e.target.value, state: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Email Address</label>
                    <input 
                      type="email" 
                      value={editRow?.emailAddress || editRow?.email || ''}
                      onChange={(e) => setEditRow({...editRow, emailAddress: e.target.value, email: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Pin Code</label>
                    <input 
                      type="text" 
                      value={editRow?.pinCode || ''}
                      onChange={(e) => setEditRow({...editRow, pinCode: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Drug License</label>
                    <input 
                      type="text" 
                      value={editRow?.drugLicense || ''}
                      onChange={(e) => setEditRow({...editRow, drugLicense: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                {/* Row 5 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Other Mobile No</label>
                    <input 
                      type="text" 
                      value={editRow?.otherMobileNo || ''}
                      onChange={(e) => setEditRow({...editRow, otherMobileNo: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">GST Applicable</label>
                    <select 
                      value={editRow?.gstApplicable || 'GST'}
                      onChange={(e) => setEditRow({...editRow, gstApplicable: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] bg-white"
                    >
                      <option value="GST">GST</option>
                      <option value="COMPOSITION">COMPOSITION</option>
                      <option value="UNREGISTERED">UNREGISTERED</option>
                      <option value="CONSUMER">CONSUMER</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Party Type</label>
                    <select 
                      value={editRow?.partyType || 'company'}
                      onChange={(e) => setEditRow({...editRow, partyType: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] bg-white"
                    >
                      <option value="company">company</option>
                      <option value="retailer">retailer</option>
                      <option value="distributor">distributor</option>
                    </select>
                  </div>
                </div>

                {/* Row 6 */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Due Days</label>
                    <input 
                      type="text" 
                      value={editRow?.dueDays || ''}
                      onChange={(e) => setEditRow({...editRow, dueDays: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Party Limit</label>
                    <input 
                      type="text" 
                      value={editRow?.partyLimit || ''}
                      onChange={(e) => setEditRow({...editRow, partyLimit: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Interest / Month</label>
                    <input 
                      type="text" 
                      value={editRow?.interestRate || ''}
                      onChange={(e) => setEditRow({...editRow, interestRate: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-800">Loyalty Points</label>
                    <input 
                      type="text" 
                      value={editRow?.loyaltyPoints || ''}
                      onChange={(e) => setEditRow({...editRow, loyaltyPoints: e.target.value})}
                      className="border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5]"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button onClick={handleEditSubmit} className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[4px] text-[14px] font-medium transition-colors shadow-sm">
                {t('company_master.update')}
              </button>
              <button onClick={() => setEditModalOpen(false)} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[4px] text-[14px] transition-colors shadow-sm">
                {t('company_master.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal (Followup) */}
      {viewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setViewModalOpen(false)}>
          <div 
            className="bg-white rounded-[4px] shadow-2xl flex flex-col w-full max-w-[650px] mx-4 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[15px]">Followup</h3>
              <button onClick={() => setViewModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-6 h-6 font-bold text-[#dc3545]" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-4 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-[13px] font-bold text-gray-800">Last Reason for Follow-up:</label>
                  <input 
                    type="text" 
                    value={followReason}
                    onChange={(e) => setFollowReason(e.target.value)}
                    className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 focus:outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold w-full"
                  />
                </div>
                <div className="flex flex-col gap-2 w-full sm:w-[180px]">
                  <div className="flex justify-between items-center">
                    <label className="text-[13px] font-bold text-gray-800">Set Reminder Date:</label>
                    <Trash2 className="w-4 h-4 text-[#dc3545] cursor-pointer invisible" />
                  </div>
                  <div className="relative">
                    <input 
                      type="date" 
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="min-w-0 border border-gray-300 rounded-[4px] px-3 py-1.5 text-[14px] text-gray-800 w-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <h4 className="text-[13px] font-bold text-gray-800">Follow-up History</h4>
                <div className="border border-gray-200 rounded-[4px] overflow-hidden">
                  <div className="table-scroll w-full overflow-x-auto h-[200px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-[#f8f9fa] sticky top-0">
                        <tr>
                          <th className="py-2 px-3 text-[13px] font-bold text-[#495057] border-b border-gray-200 whitespace-nowrap">Date</th>
                          <th className="py-2 px-3 text-[13px] font-bold text-[#495057] border-b border-gray-200 whitespace-nowrap">Reason</th>
                          <th className="py-2 px-3 text-[13px] font-bold text-[#495057] border-b border-gray-200 text-center whitespace-nowrap w-[60px]">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {followupHistory.length > 0 ? (
                          followupHistory.map(f => (
                            <tr key={f.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-2 px-3 text-[13px] text-gray-800">{new Date(f.reminderDate).toLocaleDateString('en-GB')}</td>
                              <td className="py-2 px-3 text-[13px] text-gray-800">{f.reason}</td>
                              <td className="py-2 px-3 text-center">
                                <button onClick={() => handleDeleteFollowup(f.id)} className="text-red-500 hover:text-red-700">
                                  <Trash2 className="w-4 h-4 inline" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="py-8 text-center text-[13px] text-gray-500 bg-[#f4f6f9]">No follow-ups found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button 
                onClick={handleSubmitFollowup}
                className="flex items-center gap-1.5 bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[4px] text-[14px] font-bold transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" />
                Submit
              </button>
              <button onClick={() => setViewModalOpen(false)} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[4px] text-[14px] transition-colors shadow-sm">
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
      case 'edit_teal': return 'bg-[#4F46E5] hover:bg-[#4338ca]';
      case 'delete': return 'bg-[#dc3545] hover:bg-[#c82333]';
      case 'calendar': return 'bg-[#28a745] hover:bg-[#218838]';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'menu': return <Menu className="w-3.5 h-3.5 text-white" />;
      case 'edit': return <Edit className="w-3.5 h-3.5 text-white" />;
      case 'edit_teal': return <Edit className="w-3.5 h-3.5 text-white" />;
      case 'delete': return <Trash2 className="w-3.5 h-3.5 text-white" />;
      case 'calendar': return <CalendarDays className="w-3.5 h-3.5 text-white" />;
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
