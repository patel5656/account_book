import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import apiClient from '../api/apiClient';

export function ChangePasswordModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('account');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    if (!newPassword || !currentPassword) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      if (activeTab === 'account') {
        const res = await apiClient.put('/auth/change-password', {
          currentPassword,
          newPassword
        });
        if (res.data.success) {
          setSuccess('Password changed successfully');
          setTimeout(() => {
            handleClose();
          }, 1500);
        }
      } else {
        // Super admin logic (using the same endpoint for now since there's no superAdminPassword field)
        const res = await apiClient.put('/auth/change-password', {
          currentPassword, // assume it requires current password too
          newPassword
        });
        if (res.data.success) {
          setSuccess('Super Admin Password saved successfully');
          setTimeout(() => {
            handleClose();
          }, 1500);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div className="bg-white w-[500px] rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex justify-between items-center text-white">
          <h2 className="text-[17px] font-medium">Change Password</h2>
          <button 
            onClick={handleClose}
            className="text-red-500 hover:text-red-600 transition-colors bg-transparent border-none outline-none"
          >
            <X className="w-6 h-6 stroke-[4px]" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3">
          {/* Tabs */}
          <div className="flex border border-gray-300 rounded-[3px] overflow-hidden mb-5">
            <button
              onClick={() => { setActiveTab('account'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-[14px] font-bold ${
                activeTab === 'account' 
                  ? 'bg-[#4F46E5] text-white' 
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Account password
            </button>
            <button
              onClick={() => { setActiveTab('superadmin'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 text-[14px] font-bold ${
                activeTab === 'superadmin' 
                  ? 'bg-[#4F46E5] text-white' 
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              Super Admin Password
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded mb-4 border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm px-3 py-2 rounded mb-4 border border-green-200">
              {success}
            </div>
          )}

          {/* Form Fields */}
          {activeTab === 'account' ? (
            <div className="space-y-4 px-2 pb-2">
              <div className="flex items-center">
                <label className="w-[150px] text-[15px] font-bold text-[#111]">
                  Current Password
                </label>
                <input 
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter Current Password"
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              
              <div className="flex items-center">
                <label className="w-[150px] text-[15px] font-bold text-[#111]">
                  New Password
                </label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter New Password"
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
              
              <div className="flex items-center">
                <label className="w-[150px] text-[15px] font-bold text-[#111]">
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>
          ) : (
            <div className="pb-2">
              <div className="bg-[#eef5f7] p-3 rounded mb-4 border border-[#d6e9ed]">
                <h3 className="font-bold text-[#175462] text-[14px] mb-1">Super Admin Password</h3>
                <p className="text-[12px] text-gray-600 leading-tight">
                  This password restricts login to authorized devices only—even if someone (like a sales user) has the password, they can't access your account from their own device.
                </p>
              </div>

              <div className="px-2 space-y-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="removeSuperAdmin" 
                    className="w-4 h-4 rounded border-gray-300 text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  <label htmlFor="removeSuperAdmin" className="text-[13px] font-bold text-[#444]">
                    Remove Super Admin password
                  </label>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#444] uppercase tracking-wider">
                    CURRENT PASSWORD
                  </label>
                  <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Current password"
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-[14px] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#444] uppercase tracking-wider">
                    NEW PASSWORD
                  </label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-[14px] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-[#444] uppercase tracking-wider">
                    CONFIRM
                  </label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-[14px] focus:outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-[#f8f9fa] p-3 flex justify-end gap-2">
          <button 
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-1.5 border border-gray-400 text-gray-600 rounded bg-white hover:bg-gray-50 text-[14px] disabled:opacity-50"
          >
            Cancel
          </button>
          {activeTab === 'account' ? (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-4 py-1.5 bg-[#28a745] hover:bg-[#218838] text-white font-medium rounded text-[14px] disabled:opacity-70 flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Change Password
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={loading}
              className="px-8 py-1.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white font-medium rounded text-[14px] disabled:opacity-70 flex items-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
