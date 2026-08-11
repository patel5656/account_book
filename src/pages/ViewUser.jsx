import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Filter, Edit, Trash2 } from 'lucide-react';
import { RegisterUserModal } from '../components/RegisterUserModal';

export function ViewUser() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('User Name');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  // Get user from local storage or use a default
  let currentUser = { name: 'SIDDALING A PADASALAGI', role: 'admin' };
  try {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.name) {
      currentUser = {
        name: storedUser.name.toUpperCase(),
        role: storedUser.role === 'SUPERADMIN' ? 'superadmin' : 'admin'
      };
    }
  } catch (e) { }

  return (
    <div className="w-full h-full bg-white flex flex-col p-2 sm:p-4 animate-in fade-in duration-200">

      {/* Header Bar */}
      <div className="bg-[#4F46E5] text-white px-3 py-1.5 flex justify-between items-center rounded-t-md shadow-sm">
        <h2 className="text-[16px] font-medium tracking-wide">Users</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1 rounded-sm text-[13px] font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            New User
          </button>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-2 py-1 rounded-sm transition-colors"
          >
            <X className="w-4 h-4 stroke-[3px]" />
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-gray-50 border-x border-b border-gray-200 p-2 flex items-center gap-2">
        <div className="flex bg-white border border-gray-300 rounded-sm overflow-hidden h-8 min-w-[150px]">
          <div className="px-2 flex items-center justify-center text-blue-500 border-r border-gray-200">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 px-2 text-[13px] text-gray-600 outline-none cursor-pointer"
          >
            <option value="User Name">User Name</option>
            <option value="Role">User Role</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search for..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 h-8 px-3 border border-gray-300 rounded-sm text-[13px] outline-none focus:border-[#4F46E5]"
        />
      </div>

      {/* Table */}
      <div className="mt-0 overflow-x-auto border-x border-b border-gray-200">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#343a40] text-white text-[13px]">
              <th className="py-2 px-3 w-[50px] text-center border-r border-gray-600 font-bold">#</th>
              <th className="py-2 px-3 border-r border-gray-600 font-bold text-center">User Name</th>
              <th className="py-2 px-3 w-[120px] border-r border-gray-600 font-bold text-center">User Role</th>
              <th className="py-2 px-3 w-[100px] font-bold text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200 hover:bg-gray-50 bg-white">
              <td className="py-2 px-3 text-center text-[13px] border-r border-gray-200">1</td>
              <td className="py-2 px-3 text-center text-[13px] text-gray-800 border-r border-gray-200">
                {currentUser.name}
              </td>
              <td className="py-2 px-3 text-center text-[13px] text-gray-800 border-r border-gray-200">
                {currentUser.role}
              </td>
              <td className="py-2 px-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <button className="bg-[#4F46E5] hover:bg-[#4338ca] text-white p-1 rounded-sm transition-colors">
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-sm transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <RegisterUserModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </div>
  );
}
