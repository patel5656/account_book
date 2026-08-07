import React, { useState, useEffect } from 'react';
import { X, Trash2, Save } from 'lucide-react';
import apiClient from '../api/apiClient';

export function FollowupModal({ isOpen, onClose, customerId }) {
  const [followReason, setFollowReason] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [followupHistory, setFollowupHistory] = useState([]);

  useEffect(() => {
    if (isOpen && customerId) {
      setFollowReason('');
      const today = new Date();
      setReminderDate(today.toISOString().split('T')[0]);
      fetchFollowups(customerId);
    }
  }, [isOpen, customerId]);

  const fetchFollowups = async (id) => {
    try {
      const res = await apiClient.get(`/followups/customer/${id}`);
      if (res.data && res.data.success) {
        setFollowupHistory(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch followups:', error);
    }
  };

  const handleSubmitFollowup = async () => {
    if (!followReason.trim()) return;
    try {
      const payload = {
        reason: followReason,
        reminderDate: reminderDate
      };
      const res = await apiClient.post(`/followups/customer/${customerId}`, payload);
      if (res.data && res.data.success) {
        setFollowReason('');
        fetchFollowups(customerId);
      }
    } catch (error) {
      console.error('Failed to submit followup:', error);
    }
  };

  const handleDeleteFollowup = async (id) => {
    if (window.confirm('Are you sure you want to delete this followup?')) {
      try {
        const res = await apiClient.delete(`/followups/${id}`);
        if (res.data && res.data.success) {
          fetchFollowups(customerId);
        }
      } catch (error) {
        console.error('Failed to delete followup:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-[4px] shadow-2xl flex flex-col w-full max-w-[650px] mx-4 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
          <h3 className="text-white font-medium text-[15px]">Followup</h3>
          <button onClick={onClose} className="text-white hover:text-red-200 transition-colors">
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
          <button onClick={onClose} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[4px] text-[14px] transition-colors shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
