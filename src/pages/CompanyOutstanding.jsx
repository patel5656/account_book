import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Calendar, FileDown, Printer, MessageCircle, Send, CheckSquare, Square, Edit2, Trash2, RefreshCw, AlertCircle, Filter, FileText, ClipboardList } from 'lucide-react';
import { WhatsAppReminderModal } from '../components/WhatsAppReminderModal';
import { FollowupModal } from '../components/FollowupModal';
import { useSettings } from '../context/SettingsContext';
import apiClient from '../api/apiClient';

export function CompanyOutstanding() {
  const navigate = useNavigate();
  const { formatAmount, currentCurrency } = useSettings();
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [waModal, setWaModal] = useState({ open: false, company: null });
  const [followupModal, setFollowupModal] = useState({ open: false, id: null });
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkStatus, setBulkStatus] = useState('');

  useEffect(() => {
    fetchOutstandingData();
  }, []);

  const fetchOutstandingData = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/customers?type=COMPANY');
      if (res.data && res.data.success) {
        const companies = res.data.data;
        const outstandingList = companies.map(c => {
          const balance = parseFloat(c.balance) || 0;
          let status = balance > 0 ? 'Pending' : 'Paid';
          
          // Simplified days due logic for company-level outstanding
          const dueDays = c.dueDays || 7;
          let daysDue = 0;
          let formattedDueDate = '-';
          
          if (balance > 0) {
            // Assume the balance is due from their joining date or today if not present
            const baseDate = c.createdAt ? new Date(c.createdAt) : new Date();
            const dueDateObj = new Date(baseDate);
            dueDateObj.setDate(dueDateObj.getDate() + dueDays);
            
            if (new Date() > dueDateObj) {
              status = 'Overdue';
            }
            
            const diffTime = Math.abs(new Date() - baseDate);
            daysDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            const day = String(dueDateObj.getDate()).padStart(2, '0');
            const month = String(dueDateObj.getMonth() + 1).padStart(2, '0');
            const year = dueDateObj.getFullYear();
            formattedDueDate = `${day}-${month}-${year}`;
          }

          return {
            id: c.id,
            name: c.name || 'Unknown',
            city: c.city || 'N/A',
            invoiceNo: '-', // No invoice no at company level
            dueAmount: balance,
            balance: balance,
            dueDate: formattedDueDate,
            daysDue: daysDue,
            mobile: c.mobile || c.phone || '',
            status: status
          };
        });
        
        setRows(outstandingList);
      }
    } catch (error) {
      console.error('Failed to fetch outstanding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['#', 'Company Name', 'Invoice No', 'Due Amount', 'Balance', 'Due Date', 'Mobile', 'Status'],
      ...filtered.map((c, i) => [
        i + 1, c.name, c.invoiceNo, c.dueAmount, c.balance, c.dueDate, c.mobile, c.status
      ])
    ].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "company_outstanding.csv";
    link.click();
  };

  const filtered = rows.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.invoiceNo.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const unpaidCompanies = rows.filter(c => c.status !== 'Paid');
  const grandTotal = rows.filter(c => c.status !== 'Paid').reduce((s, c) => s + c.balance, 0);

  const handleBulkSend = () => {
    setBulkConfirm(false);
    const validCompanies = unpaidCompanies.filter(c => /^[6-9]\d{9}$/.test((c.mobile || '').replace(/\D/g, '')));
    if (validCompanies.length === 0) { alert('No companies with valid mobile numbers.'); return; }
    alert(`Opening WhatsApp for ${validCompanies.length} companies. Allow popups!`);
    validCompanies.forEach((c, i) => {
      const msg = `Dear ${c.name},\n\nYour payment of ${formatAmount(c.balance)} against Invoice #${c.invoiceNo} is pending.\n\nKindly make the payment at the earliest.\n\nThank You,\nSwayam Bill Book`;

      setTimeout(() => window.open(`https://wa.me/91${c.mobile.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank'), i * 600);
    });
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 print:hidden">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Company Outstanding</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => navigate('/admin/party-ledger/company_payment')}
              className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors">
              <Plus className="w-4 h-4" strokeWidth={3} /> Create New
            </button>
            <button onClick={() => navigate('/admin/service_reminder')} className="flex items-center gap-1.5 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm">
              <Calendar className="w-4 h-4" /> View Reminders
            </button>
            <button onClick={() => setBulkConfirm(true)}
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1da851] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm">
              <Send className="w-4 h-4" /> Send Reminders
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-1.5 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors">
              <FileDown className="w-4 h-4" strokeWidth={2.5} /> Export
            </button>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors">
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-[#f0f4f8] border-b border-gray-200 px-3 py-2 print:hidden flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center w-full max-w-[600px] border border-[#a6cdec] rounded overflow-hidden">
            <div className="px-3 py-2 bg-white border-r border-[#a6cdec] text-blue-500">
              <FilterIcon className="w-4 h-4" />
            </div>
            <select className="px-2 py-2 text-[13px] outline-none bg-white text-gray-600 border-r border-[#a6cdec] min-w-[120px]">
              <option>Company Name</option>
              <option>City</option>
            </select>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search for Company Name"
              className="flex-1 min-w-0 px-3 py-2 text-[13px] outline-none bg-[#add8e6] text-[#0056b3] placeholder-[#0056b3]/70 font-medium" />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-bold text-gray-700">Till Date :</span>
              <span className="text-[13px] font-bold text-gray-700">Outstanding</span>
              <div className="w-[32px] h-[18px] bg-[#4F46E5] rounded-full relative cursor-pointer">
                <div className="w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] translate-x-[16px] shadow-sm"></div>
              </div>
              <span className="text-[13px] text-gray-600">Advance</span>
            </div>
            <div className="flex items-center border border-gray-300 rounded overflow-hidden">
              <input type="date" defaultValue="2026-07-03"
                className="w-[130px] border-0 px-2 py-1.5 text-[13px] outline-none text-gray-600 bg-white" />
              <button className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 text-[13px] font-medium transition-colors border-l border-gray-300">Search</button>
            </div>
          </div>
        </div>

        {/* List Body */}
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          <div className="max-w-[1200px] mx-auto flex flex-col gap-3">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-[14px] bg-white rounded border border-gray-200">No outstanding records found.</div>
            ) : filtered.map((c, idx) => (
              <div key={c.id} className="bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start p-4">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-[#0d6efd] text-[15px] font-medium uppercase">{c.name}</h3>
                    <span className="text-[#0d6efd] text-[13px]">{c.mobile ? `+91 ${c.mobile}` : ''}</span>
                    <span className="text-gray-600 text-[13px] uppercase mt-0.5">{c.city}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[#dc3545] font-bold text-[16px]">{formatAmount(c.balance)}</span>
                    <span className="text-gray-400 text-[12px]">{c.daysDue} days</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 p-3 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setWaModal({ open: true, company: { ...c, dueAmount: formatAmount(c.dueAmount), balance: formatAmount(c.balance) } })}
                      className="flex items-center gap-1.5 border border-[#0d6efd] text-[#0d6efd] hover:bg-blue-50 px-4 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors bg-white">
                      <MessageCircle className="w-4 h-4 fill-[#0d6efd] text-white" /> Send Message
                    </button>
                    <button 
                      onClick={() => navigate('/admin/party-ledger/company_payment', { state: { company: c } })}
                      className="flex items-center gap-1.5 border border-[#28a745] text-[#28a745] hover:bg-green-50 px-4 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors bg-white">
                      <FileText className="w-4 h-4" /> View Ledger
                    </button>
                    {idx === 3 && ( // Just an example to match the image where some have View Unpaid Invoices
                      <button className="flex items-center gap-1.5 border border-[#4F46E5] text-[#4F46E5] hover:bg-cyan-50 px-4 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors bg-white">
                        <ClipboardList className="w-4 h-4 fill-[#4F46E5] text-white" /> View Unpaid Invoices
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => setFollowupModal({ open: true, id: c.id })}
                    className="flex items-center gap-1.5 border border-[#ffc107] text-[#ffc107] hover:bg-yellow-50 px-4 py-1.5 rounded-[4px] text-[13px] font-medium transition-colors bg-white">
                    <Calendar className="w-4 h-4 fill-[#ffc107] text-white" /> Set Reminders
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WhatsAppReminderModal
        isOpen={waModal.open}
        onClose={() => setWaModal({ open: false, company: null })}
        customer={waModal.company}
      />

      <FollowupModal
        isOpen={followupModal.open}
        onClose={() => setFollowupModal({ open: false, id: null })}
        customerId={followupModal.id}
      />
    </div>
  );
}

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);
