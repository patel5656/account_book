import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Plus } from 'lucide-react';
import apiClient from '../api/apiClient';

export function UnitCatalogMasterModal({ isOpen, onClose }) {
  const [units, setUnits] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    uqc: 'PCS-PIECES',
    value: '1',
    compareTo: '—'
  });

  useEffect(() => {
    if (isOpen) {
      fetchUnits();
    }
  }, [isOpen]);

  const fetchUnits = async () => {
    try {
      const response = await apiClient.get('/units');
      if (response.data && response.data.data) {
        setUnits(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch units:", error);
    }
  };

  if (!isOpen) return null;

  const handleAddOrUpdate = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a Unit Name.");
      return;
    }
    
    try {
      if (editId) {
        await apiClient.put(`/units/${editId}`, formData);
        setEditId(null);
      } else {
        await apiClient.post('/units', formData);
      }
      setFormData({ name: '', uqc: 'PCS-PIECES', value: '1', compareTo: '—' });
      fetchUnits();
    } catch (error) {
      console.error("Failed to save unit:", error);
      alert("Failed to save unit. Ensure the server is running.");
    }
  };

  const handleEdit = (unit) => {
    setEditId(unit.id);
    setFormData({ name: unit.name, uqc: unit.uqc, value: unit.value, compareTo: unit.compareTo });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this unit?")) return;
    try {
      await apiClient.delete(`/units/${id}`);
      if (editId === id) {
        setEditId(null);
        setFormData({ name: '', uqc: 'PCS-PIECES', value: '1', compareTo: '—' });
      }
      fetchUnits();
    } catch (error) {
      console.error("Failed to delete unit:", error);
      alert("Failed to delete unit.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded shadow-lg w-full max-w-[min(98vw,800px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
          <h2 className="text-white text-[16px] font-medium">Unit Catalog</h2>
          <button 
            onClick={onClose}
            className="text-[#dc3545] hover:text-red-600 transition-colors"
          >
            <X className="w-6 h-6 font-bold" strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4">
          <p className="text-gray-500 text-[13px]">
            Define units once here. Product Master and invoices use this catalog when adding units to products.
          </p>

          {/* Add unit section */}
          <div className="border border-gray-200 rounded-[3px] p-3">
            <h3 className="text-[#4F46E5] text-[13px] font-bold mb-3">Add unit</h3>
            
            <div className="grid grid-cols-12 gap-3 mb-3">
              <div className="col-span-12 sm:col-span-4">
                <label className="block text-[13px] font-bold text-gray-700 mb-1">Unit Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-blue-400 bg-blue-100/50 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                />
              </div>
              <div className="col-span-12 sm:col-span-4">
                <label className="block text-[13px] font-bold text-gray-700 mb-1">GST UQC</label>
                <select 
                  value={formData.uqc}
                  onChange={e => setFormData({...formData, uqc: e.target.value})}
                  className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow bg-white text-gray-700">
                  <option value="PCS-PIECES">PCS-PIECES</option>
                  <option value="KGS-KILOGRAMS">KGS-KILOGRAMS</option>
                  <option value="LTR-LITRES">LTR-LITRES</option>
                  <option value="MTR-METERS">MTR-METERS</option>
                  <option value="NOS-NUMBERS">NOS-NUMBERS</option>
                </select>
              </div>
              <div className="col-span-12 sm:col-span-2">
                <label className="block text-[13px] font-bold text-gray-700 mb-1">Unit Value</label>
                <input 
                  type="text" 
                  value={formData.value}
                  onChange={e => setFormData({...formData, value: e.target.value})}
                  className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                />
              </div>
              <div className="col-span-12 sm:col-span-2">
                <label className="block text-[13px] font-bold text-gray-700 mb-1">Compare To</label>
                <input 
                  type="text" 
                  value={formData.compareTo}
                  onChange={e => setFormData({...formData, compareTo: e.target.value})}
                  className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow"
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={handleAddOrUpdate}
                className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
              >
                {editId ? <Edit className="w-4 h-4" strokeWidth={3} /> : <Plus className="w-4 h-4" strokeWidth={3} />}
                {editId ? 'Update' : 'Add'}
              </button>
            </div>
          </div>

          {/* Units in catalog section */}
          <div>
            <h3 className="text-[13px] font-bold text-gray-800 mb-2">Units in catalog</h3>
            
            <div className="border border-gray-200 rounded-[3px] overflow-x-auto">
              <table className="w-full min-w-[min(96vw,600px)]">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 w-12 border-r border-gray-200 whitespace-nowrap">#</th>
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">Unit Name</th>
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">GST UQC</th>
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">Unit Value</th>
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">Compare To</th>
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 w-24 whitespace-nowrap"></th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit, index) => (
                    <tr key={unit.id}>
                      <td className="py-2 px-3 text-center text-[13px] text-gray-700 border-r border-gray-200">{index + 1}</td>
                      <td className="py-2 px-3 text-center text-[13px] font-bold text-gray-800 border-r border-gray-200">{unit.name}</td>
                      <td className="py-2 px-3 text-center text-[13px] text-gray-600 border-r border-gray-200">{unit.uqc}</td>
                      <td className="py-2 px-3 text-center text-[13px] text-gray-700 border-r border-gray-200">{unit.value}</td>
                      <td className="py-2 px-3 text-center text-[13px] text-gray-700 border-r border-gray-200">{unit.compareTo}</td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-0">
                          <button onClick={() => handleEdit(unit)} className="bg-[#4F46E5] hover:bg-[#4338ca] text-white p-1.5 rounded-l-[3px] transition-colors">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(unit.id)} className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1.5 rounded-r-[3px] transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {units.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-[13px] text-gray-500">No units added yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 bg-white">
          <button 
            onClick={onClose}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm"
          >
            Save
          </button>
          <button 
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
