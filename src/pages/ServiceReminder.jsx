import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, Calendar, Plus, 
  Check, Bell, MessageCircle, Mail, Clock, 
  Edit, Trash2, Smartphone, Send, Eye
} from 'lucide-react';
import apiClient from '../api/apiClient';

export function ServiceReminder() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('payment'); // 'payment' | 'service'
  const [isLeftToggled, setIsLeftToggled] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState(null); // id of reminder for dropdown

  const [paymentReminders, setPaymentReminders] = useState([]);
  const [serviceReminders, setServiceReminders] = useState([]);
  const [customers, setCustomers] = useState([]);

  // Filter states
  const [filters, setFilters] = useState({
    type: 'All Types',
    status: 'All Status',
    search: '',
    startDate: '',
    endDate: ''
  });

  // Form states for Add Reminder Modal
  const [formData, setFormData] = useState({
    // Service form fields
    serviceType: 'Service Due',
    customerId: '',
    serviceName: '',
    lastServiceDate: '',
    nextServiceDate: '',
    reminderDate: '',
    repeatReminder: 'Never',
    customNotes: '',
    // Payment form fields
    reminderType: 'Customer Payment',
    partyName: '',
    invoiceNo: '',
    dueAmount: '',
    dueDate: ''
  });
  
  const [editId, setEditId] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  useEffect(() => {
    fetchServiceReminders();
    fetchPaymentReminders();
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await apiClient.get('/customers');
      setCustomers(res.data.data || res.data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    }
  };

  const fetchPaymentReminders = async () => {
    try {
      const res = await apiClient.get('/invoices');
      if (res.data && res.data.data) {
        const mapped = res.data.data.map(inv => ({
          id: inv.id,
          name: inv.customer ? inv.customer.name : 'Unknown',
          type: inv.type,
          invoiceNo: inv.invoiceNo,
          dueAmount: inv.totalAmount.toFixed(2),
          dueDate: new Date(inv.date).toLocaleDateString(),
          rawDate: new Date(inv.date),
          pendingBalance: inv.totalAmount.toFixed(2),
          status: inv.status || 'Pending'
        }));
        setPaymentReminders(mapped);
      }
    } catch (error) {
      console.error('Error fetching payment reminders:', error);
    }
  };

  const fetchServiceReminders = async () => {
    try {
      const res = await apiClient.get('/service-reminders');
      setServiceReminders(res.data);
    } catch (error) {
      console.error('Error fetching service reminders:', error);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    if (viewMode) {
      setIsAddModalOpen(false);
      return;
    }
    
    if (activeTab === 'payment') {
      // Payment reminders update is mock for now since there's no invoice put endpoint
      setIsAddModalOpen(false);
      alert(editId ? 'Payment reminder updated successfully' : 'Payment reminder added successfully');
      return;
    }
    
    try {
      const selectedCustomer = customers.find(c => c.id === Number(formData.customerId));
      
      const payload = {
        partyName: selectedCustomer ? selectedCustomer.name : 'Unknown Customer',
        productName: formData.serviceName || formData.serviceType,
        serviceDate: formData.nextServiceDate || new Date(),
        status: 'Pending',
        note: formData.customNotes || (editId ? 'Reminder updated' : 'New reminder added')
      };
      
      if (editId) {
        await apiClient.put(`/service-reminders/${editId}`, payload);
      } else {
        await apiClient.post('/service-reminders', payload);
      }
      
      fetchServiceReminders();
      setIsAddModalOpen(false);
      setFormData({
        serviceType: 'Service Due',
        customerId: '',
        serviceName: '',
        lastServiceDate: '',
        nextServiceDate: '',
        reminderDate: '',
        repeatReminder: 'Never',
        customNotes: ''
      });
      setEditId(null);
      alert(editId ? 'Reminder updated successfully' : 'Reminder added successfully');
    } catch (error) {
      console.error('Error creating/updating reminder:', error);
    }
  };

  const handleDeleteReminder = async (id, type) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        if (type === 'service') {
          await apiClient.delete(`/service-reminders/${id}`);
          fetchServiceReminders();
        } else {
          // If there's an API for invoice deletion, call it here, otherwise just alert for now.
          alert('Delete function for payment reminders is not active.');
        }
      } catch (error) {
        console.error('Error deleting reminder:', error);
      }
    }
  };

  const handleMarkPaid = async (id) => {
    if (window.confirm('Are you sure you want to mark this invoice as paid?')) {
      try {
        await apiClient.put(`/invoices/${id}/mark-paid`);
        fetchPaymentReminders();
      } catch (error) {
        console.error('Error marking invoice as paid:', error);
        alert('Failed to mark invoice as paid.');
      }
    }
  };

  const handleEdit = (rem, type) => {
    setEditId(rem.id);
    setViewMode(false);
    
    if (type === 'payment') {
      setFormData({
        ...formData,
        reminderType: rem.type === 'SALES' ? 'Customer Payment' : 'Supplier Payment',
        partyName: rem.name || '',
        invoiceNo: rem.invoiceNo || '',
        dueAmount: rem.dueAmount || '',
        dueDate: rem.dueDate ? new Date(rem.dueDate).toISOString().split('T')[0] : ''
      });
      setIsAddModalOpen(true);
      return;
    }
    
    const cust = customers.find(c => c.name === rem.partyName);
    
    setFormData({
      ...formData,
      serviceType: 'Service Due', // Fallback since it's combined with serviceName
      customerId: cust ? cust.id : '',
      serviceName: rem.productName,
      lastServiceDate: '',
      nextServiceDate: rem.serviceDate ? new Date(rem.serviceDate).toISOString().split('T')[0] : '',
      reminderDate: '',
      repeatReminder: 'Never',
      customNotes: rem.note || ''
    });
    setIsAddModalOpen(true);
  };

  const handleView = (rem, type) => {
    setEditId(rem.id);
    setViewMode(true);
    
    if (type === 'payment') {
      setFormData({
        ...formData,
        reminderType: rem.type === 'SALES' ? 'Customer Payment' : 'Supplier Payment',
        partyName: rem.name || '',
        invoiceNo: rem.invoiceNo || '',
        dueAmount: rem.dueAmount || '',
        dueDate: rem.dueDate ? new Date(rem.dueDate).toISOString().split('T')[0] : ''
      });
      setIsAddModalOpen(true);
      return;
    }
    
    const cust = customers.find(c => c.name === rem.partyName);
    
    setFormData({
      ...formData,
      serviceType: 'Service Due',
      customerId: cust ? cust.id : '',
      serviceName: rem.productName,
      lastServiceDate: '',
      nextServiceDate: rem.serviceDate ? new Date(rem.serviceDate).toISOString().split('T')[0] : '',
      reminderDate: '',
      repeatReminder: 'Never',
      customNotes: rem.note || ''
    });
    setIsAddModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'overdue': return 'bg-red-100 text-red-700';
      case 'upcoming': return 'bg-blue-100 text-blue-700';
      default: return 'bg-yellow-100 text-yellow-700';
    }
  };

  const toggleActionMenu = (id) => {
    if (activeActionMenu === id) setActiveActionMenu(null);
    else setActiveActionMenu(id);
  };

  const handleSearch = () => {
    // Left for backwards compatibility if user clicks the button
  };

  const getFilteredData = (data, tabType) => {
    return data.filter(item => {
      // 1. Type Filter
      if (filters.type !== 'All Types') {
        if (tabType === 'payment') {
          if (filters.type === 'Customer Due' && item.type !== 'SALES') return false;
          if (filters.type === 'Supplier Due' && item.type !== 'PURCHASE') return false;
          // EMI / Schedule is a placeholder, won't match standard invoices
        } else {
          const pName = (item.productName || '').toLowerCase();
          if (!pName.includes(filters.type.toLowerCase())) {
             const noteStr = (item.note || '').toLowerCase();
             if (!noteStr.includes(filters.type.toLowerCase())) return false;
          }
        }
      }

      // 2. Status Filter
      if (filters.status !== 'All Status') {
        const itemStatus = item.status || 'Pending';
        if (itemStatus.toLowerCase() !== filters.status.toLowerCase()) {
          return false;
        }
      }
      
      // 3. Date Range Filter
      if (filters.startDate || filters.endDate) {
        const itemDate = item.rawDate || new Date(item.serviceDate);
        if (itemDate && !isNaN(itemDate.getTime())) {
          const checkDate = new Date(itemDate);
          checkDate.setHours(0,0,0,0);
          
          if (filters.startDate) {
            const start = new Date(filters.startDate);
            start.setHours(0,0,0,0);
            if (checkDate < start) return false;
          }
          if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(0,0,0,0);
            if (checkDate > end) return false;
          }
        }
      }
      
      // 4. Search text Filter
      if (filters.search) {
        const s = filters.search.toLowerCase();
        let match = false;
        if (tabType === 'payment') {
          match = (item.name && String(item.name).toLowerCase().includes(s)) || 
                  (item.invoiceNo && String(item.invoiceNo).toLowerCase().includes(s));
        } else {
          match = (item.partyName && String(item.partyName).toLowerCase().includes(s)) || 
                  (item.productName && String(item.productName).toLowerCase().includes(s));
        }
        if (!match) return false;
      }
      
      return true;
    });
  };

  const displayedPaymentReminders = getFilteredData(paymentReminders, 'payment');
  const displayedServiceReminders = getFilteredData(serviceReminders, 'service');

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-60px)] flex flex-col relative" onClick={() => activeActionMenu && setActiveActionMenu(null)}>
      {/* Top Teal Bar */}
      <div className="bg-[#4F46E5] px-4 py-[6px] flex justify-between items-center text-white shadow-sm">
        <h2 className="text-[14.5px] font-medium tracking-wide">Reminder Management</h2>
        <button 
          onClick={() => navigate(-1)}
          className="bg-[#dc3545] hover:bg-[#c82333] text-white px-2.5 py-[6px] rounded-[3px] flex items-center justify-center transition-colors"
        >
          <X className="w-[14px] h-[14px]" strokeWidth={3} />
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4 flex gap-6 pt-2">
        <button 
          onClick={() => setActiveTab('payment')}
          className={`pb-2 text-[13.5px] font-medium border-b-2 transition-colors ${activeTab === 'payment' ? 'border-[#4F46E5] text-[#4F46E5]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Payment Reminders
        </button>
        <button 
          onClick={() => setActiveTab('service')}
          className={`pb-2 text-[13.5px] font-medium border-b-2 transition-colors ${activeTab === 'service' ? 'border-[#4F46E5] text-[#4F46E5]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Service Reminders
        </button>
      </div>

      {/* Filters Row */}
      <div className="px-4 py-2.5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="text-[#007bff]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#007bff" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V6.58579C21 6.851 20.8946 7.10536 20.7071 7.29289L14 14V21C14 21.5523 13.5523 22 13 22H11C10.4477 22 10 21.5523 10 21V14L3.29289 7.29289C3.10536 7.10536 3 6.851 3 6.58579V4Z" />
            </svg>
          </div>
          
          <select 
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="w-[140px] h-[30px] border border-gray-300 rounded-[3px] px-2 text-[12.5px] outline-none text-gray-600 bg-white focus:border-[#4F46E5]"
          >
            <option>All Types</option>
            {activeTab === 'payment' ? (
              <>
                <option>Customer Due</option>
                <option>Supplier Due</option>
                <option>EMI / Schedule</option>
              </>
            ) : (
              <>
                <option>Service Due</option>
                <option>AMC Renewal</option>
                <option>Warranty Expiry</option>
              </>
            )}
          </select>

          <select 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="w-[130px] h-[30px] border border-gray-300 rounded-[3px] px-2 text-[12.5px] outline-none text-gray-600 bg-white focus:border-[#4F46E5]"
          >
            <option>All Status</option>
            <option>Pending</option>
            <option>PAID</option>
            <option>Completed</option>
            <option>Overdue</option>
            <option>Upcoming</option>
          </select>

          <input 
            type="text" 
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            placeholder={activeTab === 'payment' ? "Search Name/Invoice" : "Search Service/Customer"}
            className="w-[200px] h-[30px] border border-gray-300 rounded-[3px] px-2 text-[12.5px] outline-none text-gray-700 bg-white placeholder-gray-400 focus:border-[#4F46E5]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5">
            <input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-[120px] h-[30px] border border-gray-300 rounded-[3px] px-2 text-[12.5px] outline-none text-gray-600 bg-white focus:border-[#4F46E5]"
            />
            <span className="text-gray-500 text-[12px]">to</span>
            <input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-[120px] h-[30px] border border-gray-300 rounded-[3px] px-2 text-[12.5px] outline-none text-gray-600 bg-white focus:border-[#4F46E5]"
            />
          </div>

          <button 
            onClick={handleSearch}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-3.5 py-[5px] rounded-[3px] text-[12.5px] font-medium flex items-center justify-center transition-colors shadow-sm"
          >
            Search
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-3.5 py-[5px] rounded-[3px] text-[12.5px] font-medium flex items-center justify-center transition-colors shadow-sm gap-1.5"
          >
            <Plus className="w-[14px] h-[14px]" /> Add Reminder
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 overflow-auto">
        <div className="bg-white border border-gray-200 rounded-[3px] shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9fa] border-b border-gray-200 text-gray-700 text-[13px]">
                {activeTab === 'payment' ? (
                  <>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200">Name / Party</th>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200">Ref / Invoice No</th>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200 text-right">Due Amount</th>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200 text-right">Pending Bal.</th>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200 text-center">Due Date</th>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200 text-center">Status</th>
                  </>
                ) : (
                  <>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200">Service Name</th>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200">Customer Name</th>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200 text-center">Service Date</th>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200 text-center">Next Service</th>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200 text-center">Reminder Date</th>
                    <th className="py-2.5 px-3 font-semibold border-r border-gray-200 text-center">Status</th>
                  </>
                )}
                <th className="py-2.5 px-3 font-semibold text-center w-[80px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'payment' ? (
                displayedPaymentReminders.map((rem) => (
                  <tr key={rem.id} className="border-b border-gray-100 hover:bg-gray-50 text-[12.5px] text-gray-700">
                    <td className="py-2 px-3 border-r border-gray-100 font-medium text-[#4F46E5]">
                      {rem.name}
                      <div className="text-[10px] text-gray-500 font-normal">{rem.type}</div>
                    </td>
                    <td className="py-2 px-3 border-r border-gray-100">{rem.invoiceNo}</td>
                    <td className="py-2 px-3 border-r border-gray-100 text-center">₹{rem.dueAmount}</td>
                    <td className="py-2 px-3 border-r border-gray-100 text-center font-medium text-red-500">₹{rem.pendingBalance}</td>
                    <td className="py-2 px-3 border-r border-gray-100 text-center">{rem.dueDate}</td>
                    <td className="py-2 px-3 border-r border-gray-100 text-center">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[11px] font-medium ${getStatusColor(rem.status)}`}>
                        {rem.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleView(rem, 'payment'); }}
                          className="text-[#4F46E5] hover:bg-[#4F46E5]/10 p-1.5 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-[15px] h-[15px]" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(rem, 'payment'); }}
                          className="text-green-600 hover:bg-green-50 p-1.5 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-[15px] h-[15px]" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleMarkPaid(rem.id); }}
                          className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded transition-colors"
                          title="Mark as Paid"
                        >
                          <Check className="w-[15px] h-[15px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                displayedServiceReminders.map((rem) => (
                  <tr key={rem.id} className="border-b border-gray-100 hover:bg-gray-50 text-[12.5px] text-gray-700">
                    <td className="py-2 px-3 border-r border-gray-100">
                      <div className="font-medium text-[#4F46E5]">{rem.productName || 'Service'}</div>
                      <div className="text-[11px] text-gray-500 truncate w-[150px]">{rem.note || '-'}</div>
                    </td>
                    <td className="py-2 px-3 border-r border-gray-100">{rem.partyName}</td>
                    <td className="py-2 px-3 border-r border-gray-100 text-center">{new Date(rem.serviceDate).toLocaleDateString()}</td>
                    <td className="py-2 px-3 border-r border-gray-100 text-center font-medium">-</td>
                    <td className="py-2 px-3 border-r border-gray-100 text-center text-[#4F46E5]">-</td>
                    <td className="py-2 px-3 border-r border-gray-100 text-center">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[11px] font-medium ${getStatusColor(rem.status)}`}>
                        {rem.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleView(rem, 'service'); }}
                          className="text-[#4F46E5] hover:bg-[#4F46E5]/10 p-1.5 rounded transition-colors"
                          title="View"
                        >
                          <Eye className="w-[15px] h-[15px]" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEdit(rem, 'service'); }}
                          className="text-green-600 hover:bg-green-50 p-1.5 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-[15px] h-[15px]" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteReminder(rem.id, 'service'); }}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-[15px] h-[14px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {(activeTab === 'payment' && displayedPaymentReminders.length === 0) || (activeTab === 'service' && displayedServiceReminders.length === 0) ? (
            <div className="p-8 text-center text-gray-500 text-[13px]">
              No reminders found matching your criteria.
            </div>
          ) : null}
        </div>
      </div>

      {/* Add/Edit Reminder Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3px] shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center bg-[#4F46E5] px-4 py-[10px] text-white">
              <h3 className="font-medium text-[15px]">
                {viewMode ? 'View Service Reminder' : editId ? 'Edit Service Reminder' : 'Add New Service Reminder'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="hover:bg-white/20 p-1 rounded">
                <X className="w-[16px] h-[16px]" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 grid grid-cols-2 gap-4">
              {activeTab === 'payment' ? (
                <>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Reminder Type *</label>
                    <select 
                      value={formData.reminderType}
                      onChange={(e) => setFormData({...formData, reminderType: e.target.value})}
                      disabled={viewMode}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] disabled:bg-gray-100"
                    >
                      <option>Customer Payment</option>
                      <option>Supplier Payment</option>
                      <option>EMI Schedule</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Party Name *</label>
                    <input 
                      type="text" 
                      value={formData.partyName}
                      onChange={(e) => setFormData({...formData, partyName: e.target.value})}
                      disabled={viewMode}
                      placeholder="Select/Search Party" 
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] disabled:bg-gray-100" 
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Invoice / Ref No</label>
                    <input 
                      type="text" 
                      value={formData.invoiceNo}
                      onChange={(e) => setFormData({...formData, invoiceNo: e.target.value})}
                      disabled={viewMode}
                      placeholder="e.g. INV-100" 
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] disabled:bg-gray-100" 
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Due Amount (₹) *</label>
                    <input 
                      type="number" 
                      value={formData.dueAmount}
                      onChange={(e) => setFormData({...formData, dueAmount: e.target.value})}
                      disabled={viewMode}
                      placeholder="0.00" 
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] disabled:bg-gray-100" 
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Due Date *</label>
                    <input 
                      type="date" 
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      disabled={viewMode}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] disabled:bg-gray-100" 
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Service Type *</label>
                    <select 
                      value={formData.serviceType}
                      onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                      disabled={viewMode}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] disabled:bg-gray-100"
                    >
                      <option>Service Due</option>
                      <option>AMC Renewal</option>
                      <option>Warranty Expiry</option>
                      <option>Maintenance</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Customer Name *</label>
                    <select 
                      value={formData.customerId}
                      onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                      disabled={viewMode}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] bg-white disabled:bg-gray-100"
                    >
                      <option value="">Select Customer</option>
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Service Name / Item</label>
                    <input 
                      type="text" 
                      value={formData.serviceName}
                      onChange={(e) => setFormData({...formData, serviceName: e.target.value})}
                      disabled={viewMode}
                      placeholder="e.g. AC Repair" 
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] disabled:bg-gray-100" 
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Last Service Date</label>
                    <input 
                      type="date" 
                      value={formData.lastServiceDate}
                      onChange={(e) => setFormData({...formData, lastServiceDate: e.target.value})}
                      disabled={viewMode}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] disabled:bg-gray-100" 
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Next Service Date *</label>
                    <input 
                      type="date" 
                      value={formData.nextServiceDate}
                      onChange={(e) => setFormData({...formData, nextServiceDate: e.target.value})}
                      disabled={viewMode}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] disabled:bg-gray-100" 
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Auto Reminder Date</label>
                    <input 
                      type="date" 
                      value={formData.reminderDate}
                      onChange={(e) => setFormData({...formData, reminderDate: e.target.value})}
                      disabled={viewMode}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] disabled:bg-gray-100" 
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Repeat Reminder</label>
                    <select 
                      value={formData.repeatReminder}
                      onChange={(e) => setFormData({...formData, repeatReminder: e.target.value})}
                      disabled={viewMode}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] disabled:bg-gray-100"
                    >
                      <option>Never</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                      <option>Yearly</option>
                    </select>
                  </div>
                  <div className="col-span-2 mt-1">
                    <label className="block text-[12.5px] text-gray-700 font-medium mb-1">Custom Notes / Remarks</label>
                    <textarea 
                      value={formData.customNotes}
                      onChange={(e) => setFormData({...formData, customNotes: e.target.value})}
                      disabled={viewMode}
                      placeholder="Any additional details..." 
                      className="w-full h-[60px] border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5] resize-none disabled:bg-gray-100"
                    ></textarea>
                  </div>
                </>
              )}
              
            </div>

            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button 
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded-[3px] text-[13px] font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              {!viewMode && (
                <button 
                  type="submit"
                  onClick={handleCreateReminder}
                  className="bg-[#4F46E5] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium hover:bg-[#4338ca] transition-colors"
                >
                  {editId ? 'Update Reminder' : 'Save Reminder'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
