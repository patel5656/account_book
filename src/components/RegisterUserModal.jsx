import React, { useState } from 'react';
import { X, User, Lock, Building2, Wallet, Loader } from 'lucide-react';
import apiClient from '../api/apiClient';

export function RegisterUserModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Staff');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [selectedFirms, setSelectedFirms] = useState(['swayam billing software']);
  const [store, setStore] = useState('');
  const [book, setBook] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    
    if (!name || !password || !role) {
      setError('Please fill all required basic details');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/register-sub-user', {
        name,
        password,
        role: role === 'Admin' ? 'COMPANY_ADMIN' : 'STAFF',
        allowFirms: selectedFirms,
        stores: store ? [store] : [],
        books: book ? [book] : []
      });

      if (res.data.success) {
        setSuccess('User registered successfully!');
        setTimeout(() => {
          handleClose();
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setRole('Staff');
    setPassword('');
    setConfirmPassword('');
    setSelectedFirms(['swayam billing software']);
    setStore('');
    setBook('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div className="bg-[#f0f4f8] w-full max-w-5xl rounded-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-[#4F46E5] px-5 py-3 flex justify-between items-start text-white">
          <div>
            <h2 className="text-[18px] font-bold">Register New User</h2>
            <p className="text-[13px] text-teal-100 mt-0.5">Create account and set firm-wise access</p>
          </div>
          <button 
            onClick={handleClose}
            className="text-red-500 hover:text-red-600 transition-colors bg-transparent border-none outline-none mt-1"
          >
            <X className="w-6 h-6 stroke-[4px]" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-sm px-3 py-2 rounded border border-green-200">
              {success}
            </div>
          )}

          {/* Basic Details */}
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
            <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-4">BASIC DETAILS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Full name" 
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-[14px] focus:outline-none focus:border-[#4F46E5]" 
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center bg-gray-100 border-l border-gray-300 rounded-r">
                    <User className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
              
              {/* User Role */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1">User Role</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    list="roleList"
                    placeholder="Select Role" 
                    className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] text-gray-600 focus:outline-none focus:border-[#4F46E5] bg-white" 
                  />
                  <datalist id="roleList">
                    <option value="Admin" />
                    <option value="Staff" />
                  </datalist>
                  <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password" 
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-[14px] focus:outline-none focus:border-[#4F46E5]" 
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center bg-gray-100 border-l border-gray-300 rounded-r">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Retype password" 
                    className="w-full border border-gray-300 rounded px-3 py-2 pr-10 text-[14px] focus:outline-none focus:border-[#4F46E5]" 
                  />
                  <div className="absolute right-0 top-0 bottom-0 w-10 flex items-center justify-center bg-gray-100 border-l border-gray-300 rounded-r">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Firm Access */}
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
            <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-4">FIRM ACCESS</h3>
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-1">Allow Firms</label>
              <div className="w-full border border-gray-300 rounded p-1.5 flex flex-wrap gap-1 items-center bg-white min-h-[38px]">
                {selectedFirms.map(firm => (
                  <div key={firm} className="bg-[#e8f0fe] text-[#1a73e8] text-[13px] flex items-center gap-1.5 px-2 py-0.5 rounded border border-[#d2e3fc]">
                    <span 
                      className="cursor-pointer hover:text-red-500"
                      onClick={() => setSelectedFirms(selectedFirms.filter(f => f !== firm))}
                    >
                      ×
                    </span>
                    {firm}
                  </div>
                ))}
                <div className="flex-1 min-w-[50px] flex justify-end">
                  <span className="text-gray-400 cursor-pointer px-2 text-[10px]">▼</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stores & Books by Firm */}
          <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">STORES & BOOKS BY FIRM</h3>
              <span className="text-[12px] text-gray-400">Empty selection = all allowed for that firm</span>
            </div>
            
            <div className="mb-4">
              <button className="bg-teal-50 border border-[#4F46E5] text-[#111] px-3 py-1.5 rounded-full text-[13px] font-medium flex items-center gap-2">
                swayam billing software
                <span className="text-gray-500 text-[11px] font-bold">S:{store ? '1' : 'All'}</span>
                <span className="text-gray-500 text-[11px] font-bold">B:{book ? '1' : 'All'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded border border-gray-100">
              {/* Stores */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="flex items-center gap-1.5 text-[13px] font-bold text-[#1a237e]">
                    <Building2 className="w-4 h-4" />
                    Stores
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">{store ? 'Selected' : 'All stores'}</span>
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    value={store}
                    onChange={e => setStore(e.target.value)}
                    list="storesList"
                    placeholder="Select stores (or leave empty for all)"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-600 focus:outline-none focus:border-[#4F46E5] bg-white" 
                  />
                  <datalist id="storesList">
                    <option value="Main Store" />
                    <option value="Branch 1" />
                  </datalist>
                  <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </div>

              {/* Cash & Bank */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="flex items-center gap-1.5 text-[13px] font-bold text-[#1a237e]">
                    <Wallet className="w-4 h-4" />
                    Cash & Bank
                  </label>
                  <span className="text-[11px] text-gray-400 font-medium">{book ? 'Selected' : 'All books'}</span>
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    value={book}
                    onChange={e => setBook(e.target.value)}
                    list="booksList"
                    placeholder="Select books (or leave empty for all)"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-[13px] text-gray-600 focus:outline-none focus:border-[#4F46E5] bg-white" 
                  />
                  <datalist id="booksList">
                    <option value="Cash Book" />
                    <option value="Bank Book" />
                  </datalist>
                  <div className="absolute right-3 top-0 bottom-0 flex items-center pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white p-3 flex justify-end gap-2 shrink-0">
          <button 
            onClick={handleClose}
            disabled={loading}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded bg-white hover:bg-gray-50 text-[14px] font-medium transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-medium rounded text-[14px] transition-colors disabled:opacity-70 flex items-center gap-2"
          >
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            Register User
          </button>
        </div>
      </div>
    </div>
  );
}
