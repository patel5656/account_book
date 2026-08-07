import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Search,
  ClipboardList,
  Eye,
  Filter
} from 'lucide-react';
import { useAuditLog } from '../context/AuditLogContext';

export function AuditLogs() {
  const navigate = useNavigate();
  const { logs, loading } = useAuditLog();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [dateFilter, setDateFilter] = useState('Today');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = log.billNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchUser = filterUser ? log.userName === filterUser : true;
      const matchModule = filterModule ? log.moduleName === filterModule : true;
      const matchAction = filterAction ? log.actionType === filterAction : true;
      let matchDate = true;
      if (dateFilter && dateFilter !== 'All Time') {
        const d = new Date(log.timestamp);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (dateFilter === 'Today') {
          if (d < today) matchDate = false;
        } else if (dateFilter === 'Yesterday') {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          if (d < yesterday || d >= today) matchDate = false;
        } else if (dateFilter === 'Last 7 Days') {
          const last7 = new Date(today);
          last7.setDate(last7.getDate() - 7);
          if (d < last7) matchDate = false;
        } else if (dateFilter === 'Last 30 Days') {
          const last30 = new Date(today);
          last30.setDate(last30.getDate() - 30);
          if (d < last30) matchDate = false;
        } else if (dateFilter === 'This Month') {
          if (d.getMonth() !== today.getMonth() || d.getFullYear() !== today.getFullYear()) matchDate = false;
        } else if (dateFilter === 'Last Month') {
          let lastMonth = today.getMonth() - 1;
          let year = today.getFullYear();
          if (lastMonth < 0) {
            lastMonth = 11;
            year--;
          }
          if (d.getMonth() !== lastMonth || d.getFullYear() !== year) matchDate = false;
        } else if (dateFilter === 'Custom Range') {
          if (fromDate && toDate) {
            const start = new Date(fromDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            if (d < start || d > end) matchDate = false;
          } else if (fromDate) {
            const start = new Date(fromDate);
            start.setHours(0, 0, 0, 0);
            if (d < start) matchDate = false;
          } else if (toDate) {
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            if (d > end) matchDate = false;
          }
        }
      }

      return matchSearch && matchUser && matchModule && matchAction && matchDate;
    });
  }, [logs, searchTerm, filterUser, filterModule, filterAction, dateFilter, fromDate, toDate]);

  const uniqueUsers = [...new Set(logs.map(l => l.userName).filter(Boolean))];
  const uniqueModules = [...new Set(logs.map(l => l.moduleName).filter(Boolean))];
  
  const openViewModal = (log) => {
    setSelectedLog(log);
    setViewModalOpen(true);
  };

  const getActionColor = (action) => {
    if (action === 'Create') return 'text-[#28a745] bg-[#d4edda] border-[#c3e6cb]';
    if (action === 'Edit') return 'text-[#004085] bg-[#cce5ff] border-[#b8daff]';
    if (action === 'Delete') return 'text-[#721c24] bg-[#f8d7da] border-[#f5c6cb]';
    return 'text-gray-800 bg-gray-200 border-gray-300';
  };

  return (
    <div className="bg-[#f8f9fa] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-white" strokeWidth={2.5} />
            <h2 className="text-white text-[16px] font-medium tracking-wide">Audit Logs & Bill Tracking</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 border-b border-gray-200 flex flex-wrap gap-4 items-end">
          
          <div className="flex-1 min-w-[200px]">
            <label className="text-[13px] font-bold text-gray-800 mb-1 block">Search Bill / Invoice No</label>
            <div className="relative">
               <input 
                 type="text" 
                 placeholder="Search..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5]"
               />
               <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div className="w-[150px]">
            <label className="text-[13px] font-bold text-gray-800 mb-1 block">Filter by User</label>
            <select 
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white"
            >
              <option value="">All Users</option>
              {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div className="w-[150px]">
            <label className="text-[13px] font-bold text-gray-800 mb-1 block">Filter by Module</label>
            <select 
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
              className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white"
            >
              <option value="">All Modules</option>
              {uniqueModules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="w-[150px]">
            <label className="text-[13px] font-bold text-gray-800 mb-1 block">Action Type</label>
            <select 
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white"
            >
              <option value="">All Actions</option>
              <option value="Create">Create</option>
              <option value="Edit">Edit</option>
              <option value="Delete">Delete</option>
            </select>
          </div>

          <div className="w-[150px]">
             <label className="text-[13px] font-bold text-gray-800 mb-1 block">Filter by Date</label>
             <select 
               value={dateFilter}
               onChange={(e) => setDateFilter(e.target.value)}
               className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white"
             >
               <option>Today</option>
               <option>Yesterday</option>
               <option>Last 7 Days</option>
               <option>Last 30 Days</option>
               <option>Last Month</option>
               <option>This Month</option>
               <option>Custom Range</option>
             </select>
          </div>

          {dateFilter === 'Custom Range' && (
            <div className="flex gap-2 items-end animate-in fade-in zoom-in duration-200">
              <div className="w-[130px]">
                <label className="text-[13px] font-bold text-gray-800 mb-1 block">From</label>
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white shadow-sm"
                />
              </div>
              <div className="w-[130px]">
                <label className="text-[13px] font-bold text-gray-800 mb-1 block">To</label>
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white shadow-sm"
                />
              </div>
            </div>
          )}

        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#343a40] text-white sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 whitespace-nowrap">Date & Time</th>
                <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 whitespace-nowrap">User</th>
                <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 whitespace-nowrap">Role</th>
                <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 whitespace-nowrap">Action Type</th>
                <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 whitespace-nowrap">Module</th>
                <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 whitespace-nowrap">Bill/Invoice No</th>
                <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 whitespace-nowrap">IP Address</th>
                <th className="px-3 py-2 text-[13px] font-bold whitespace-nowrap text-center">Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500 text-[14px]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading audit logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500 text-[14px]">
                    No audit logs found matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-[13px] text-gray-800 whitespace-nowrap">{formatDisplayDate(log.timestamp)}</td>
                    <td className="px-3 py-2 text-[13px] text-gray-800 font-medium whitespace-nowrap">{log.userName}</td>
                    <td className="px-3 py-2 text-[13px] text-gray-600 whitespace-nowrap">{log.userRole}</td>
                    <td className="px-3 py-2 text-[13px] whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-[3px] text-[11px] font-bold border ${getActionColor(log.actionType)}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[13px] text-gray-800 whitespace-nowrap">{log.moduleName}</td>
                    <td className="px-3 py-2 text-[13px] font-bold text-[#4F46E5] whitespace-nowrap">{log.billNumber || '-'}</td>
                    <td className="px-3 py-2 text-[13px] text-gray-500 whitespace-nowrap">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="px-3 py-2 text-[13px] whitespace-nowrap text-center">
                      <button 
                        onClick={() => openViewModal(log)}
                        className="bg-[#007bff] hover:bg-[#0069d9] text-white p-1 rounded-[3px] transition-colors"
                        title="View Changes"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Changes Modal */}
      {viewModalOpen && selectedLog && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[16px] flex items-center gap-2">
                <Filter className="w-5 h-5" /> 
                Audit Log Details 
                <span className="text-[12px] bg-white/20 px-2 py-0.5 rounded ml-2">ID: {selectedLog.id}</span>
              </h3>
              <button onClick={() => setViewModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-6 h-6 font-bold" strokeWidth={3} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col p-4 overflow-auto bg-[#f8f9fa]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-[4px] border border-gray-200 shadow-sm">
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Action Type</div>
                  <div className={`mt-1 inline-block px-2 py-0.5 rounded-[3px] text-[12px] font-bold border ${getActionColor(selectedLog.actionType)}`}>
                    {selectedLog.actionType}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Module</div>
                  <div className="mt-1 text-[14px] font-bold text-gray-800">{selectedLog.moduleName}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Bill/Invoice No</div>
                  <div className="mt-1 text-[14px] font-bold text-[#4F46E5]">{selectedLog.billNumber || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Date & Time</div>
                  <div className="mt-1 text-[14px] text-gray-800 font-medium">{formatDisplayDate(selectedLog.timestamp)}</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Performed By</div>
                  <div className="mt-1 text-[14px] font-bold text-gray-800">{selectedLog.userName} ({selectedLog.userRole})</div>
                </div>
                <div>
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">IP Address</div>
                  <div className="mt-1 text-[14px] text-gray-800 font-medium">{selectedLog.ipAddress || '127.0.0.1'}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {/* Previous Data */}
                <div className="bg-white border border-[#f5c6cb] rounded-[4px] overflow-hidden flex flex-col shadow-sm">
                  <div className="bg-[#f8d7da] text-[#721c24] px-3 py-2 font-bold text-[13px] border-b border-[#f5c6cb]">
                    Previous Data (Before Action)
                  </div>
                  <div className="p-3 overflow-auto flex-1 text-[13px]">
                    {selectedLog.previousData ? (
                      <pre className="text-gray-800 font-mono whitespace-pre-wrap break-all">{JSON.stringify(selectedLog.previousData, null, 2)}</pre>
                    ) : (
                      <div className="text-gray-400 italic h-full flex items-center justify-center">No previous data available.</div>
                    )}
                  </div>
                </div>

                {/* Updated Data */}
                <div className="bg-white border border-[#c3e6cb] rounded-[4px] overflow-hidden flex flex-col shadow-sm">
                  <div className="bg-[#d4edda] text-[#155724] px-3 py-2 font-bold text-[13px] border-b border-[#c3e6cb]">
                    Updated Data (After Action)
                  </div>
                  <div className="p-3 overflow-auto flex-1 text-[13px]">
                    {selectedLog.updatedData ? (
                      <pre className="text-gray-800 font-mono whitespace-pre-wrap break-all">{JSON.stringify(selectedLog.updatedData, null, 2)}</pre>
                    ) : (
                      <div className="text-gray-400 italic h-full flex items-center justify-center">No updated data available.</div>
                    )}
                  </div>
                </div>
              </div>

            </div>
            
            <div className="bg-white border-t border-gray-200 px-4 py-3 flex justify-end">
              <button 
                onClick={() => setViewModalOpen(false)} 
                className="bg-[#6c757d] hover:bg-[#5a6268] text-white px-4 py-1.5 rounded-[4px] text-[14px] transition-colors shadow-sm font-medium"
              >
                Close Details
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
