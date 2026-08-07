import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Edit, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export function AttributeMaster() {
  const navigate = useNavigate();
  const [attributes, setAttributes] = useState([]);
  const [name, setName] = useState('');
  const [values, setValues] = useState(['']);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttributes();
  }, []);

  const fetchAttributes = async () => {
    try {
      const response = await apiClient.get('/attributes');
      setAttributes(response.data.data);
    } catch (error) {
      console.error('Error fetching attributes:', error);
    }
  };

  const handleValueChange = (index, val) => {
    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);
  };

  const addValueField = () => {
    setValues([...values, '']);
  };

  const removeValueField = (index) => {
    const newValues = values.filter((_, i) => i !== index);
    setValues(newValues);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validValues = values.filter(v => v.trim() !== '');
    if (!name.trim() || validValues.length === 0) {
      alert("Please provide an attribute name and at least one value.");
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await apiClient.put(`/attributes/${editingId}`, { name, values: validValues });
      } else {
        await apiClient.post('/attributes', { name, values: validValues });
      }
      setName('');
      setValues(['']);
      setEditingId(null);
      fetchAttributes();
    } catch (error) {
      console.error('Error saving attribute:', error);
      alert('Error saving attribute');
    }
    setLoading(false);
  };

  const handleEdit = (attr) => {
    setEditingId(attr.id);
    setName(attr.name);
    setValues(attr.values.map(v => v.value));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attribute?")) return;
    try {
      await apiClient.delete(`/attributes/${id}`);
      fetchAttributes();
    } catch (error) {
      console.error('Error deleting attribute:', error);
      alert('Error deleting attribute');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setValues(['']);
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Attribute Master</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors shadow-sm"
            >
              <X className="w-5 h-5 font-bold" strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row p-4 gap-6">
          {/* Form Section */}
          <div className="w-full md:w-[35%]">
            <div className="border border-gray-200 rounded-[3px] p-4 bg-gray-50">
              <h3 className="text-[14px] font-bold text-[#4F46E5] mb-4 border-b pb-2">
                {editingId ? 'Edit Attribute' : 'Create New Attribute'}
              </h3>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Attribute Name</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="e.g. Size, Color, RAM" 
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Values</label>
                  {values.map((val, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input 
                        value={val} 
                        onChange={(e) => handleValueChange(idx, e.target.value)} 
                        placeholder="e.g. XL, Red, 16GB" 
                        className="flex-1 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] text-gray-800 bg-white"
                      />
                      {values.length > 1 && (
                        <button type="button" onClick={() => removeValueField(idx)} className="bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1.5 rounded-[3px] transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addValueField} className="flex items-center gap-1 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-[3px] text-[12px] font-bold transition-colors w-fit shadow-sm mt-1">
                    <Plus className="h-3 w-3" strokeWidth={3} /> Add Value
                  </button>
                </div>

                <div className="flex gap-2 pt-2 border-t mt-2">
                  <button type="submit" disabled={loading} className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[6px] rounded-[3px] text-[13px] font-bold transition-colors shadow-sm disabled:opacity-50 flex-1">
                    {loading ? 'Saving...' : editingId ? 'Update' : 'Save'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={cancelEdit} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-[6px] rounded-[3px] text-[13px] font-bold transition-colors shadow-sm flex-1">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Table Section */}
          <div className="w-full md:w-[65%]">
            <div className="border border-gray-200 rounded-[3px] overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-[13px]">
                    <th className="py-2.5 px-3 font-medium">Attribute Name</th>
                    <th className="py-2.5 px-3 font-medium">Values</th>
                    <th className="py-2.5 px-3 font-medium text-right w-[100px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map(attr => (
                    <tr key={attr.id} className="border-b border-gray-100 hover:bg-gray-50 text-[13px] transition-colors">
                      <td className="py-2.5 px-3 font-bold text-[#4F46E5] align-top">{attr.name}</td>
                      <td className="py-2.5 px-3">
                        <div className="flex flex-wrap gap-1.5">
                          {attr.values.map(v => (
                            <span key={v.id} className="bg-blue-50 border border-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                              {v.value}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right align-top">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handleEdit(attr)} className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-1.5 rounded transition-colors shadow-sm">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(attr.id)} className="bg-red-100 hover:bg-red-200 text-red-700 p-1.5 rounded transition-colors shadow-sm">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {attributes.length === 0 && (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-gray-500 text-[13px]">No attributes found. Create one on the left.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
