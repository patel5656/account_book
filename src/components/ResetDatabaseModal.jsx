import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import apiClient from '../api/apiClient';

export function ResetDatabaseModal({ isOpen, onClose }) {
  const [password, setPassword] = useState('');
  const [deleteMasterData, setDeleteMasterData] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleReset = async () => {
    setError('');
    setSuccess('');

    if (!password) {
      setError('Admin password is required');
      return;
    }

    // Confirm prompt before deleting
    if (!window.confirm('Are you absolutely sure you want to delete all transaction data? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/settings/reset-database', {
        password,
        deleteMasterData
      });

      if (res.data.success) {
        setSuccess('Database reset successfully.');
        setTimeout(() => {
          handleClose();
          // Optionally reload the page to clear all frontend state
          window.location.reload();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset database');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setDeleteMasterData(false);
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4" 
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div className="bg-white w-full max-w-md rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-3 flex justify-between items-center text-white">
          <h2 className="text-[16px] font-medium tracking-wide">Reset Database</h2>
          <button 
            onClick={handleClose}
            className="text-[#dc3545] hover:text-[#c82333] transition-colors"
          >
            <X className="w-6 h-6 stroke-[4px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          <h3 className="text-[17px] text-gray-800 mb-6 text-center">
            Do you want to Reset all Transaction Data ?
          </h3>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 w-full rounded mb-4 border border-red-200 text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm px-4 py-2 w-full rounded mb-4 border border-green-200 text-center">
              {success}
            </div>
          )}

          <div className="flex items-center justify-center gap-3 w-full mb-4">
            <label className="text-[14px] font-bold text-gray-900">
              Password
            </label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Admin Password"
              className="w-48 bg-[#add8e6] border border-[#add8e6] rounded px-3 py-1.5 text-[14px] placeholder-gray-500 font-medium focus:outline-none focus:ring-2 focus:ring-[#4F46E5]"
            />
          </div>

          <div className="flex items-center justify-center gap-2 mb-2 w-full">
            <input 
              type="checkbox" 
              id="deleteMasterData"
              checked={deleteMasterData}
              onChange={(e) => setDeleteMasterData(e.target.checked)}
              className="w-4 h-4 rounded border-gray-400 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
            />
            <label htmlFor="deleteMasterData" className="text-[14px] text-gray-800 cursor-pointer">
              Also Delete Master data.
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8f9fa] border-t border-gray-200 p-3 flex justify-between items-center">
          <button 
            onClick={handleReset}
            disabled={loading}
            className="px-4 py-1.5 bg-[#dc3545] hover:bg-[#c82333] text-white font-medium rounded text-[14px] transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Yes, Delete
          </button>
          <button 
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded bg-white hover:bg-gray-50 text-[14px] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
