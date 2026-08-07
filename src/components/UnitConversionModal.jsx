import React, { useState, useEffect } from 'react';
import { X, Edit, Trash2, Plus, Calculator } from 'lucide-react';
import apiClient from '../api/apiClient';

export function UnitConversionModal({ isOpen, onClose }) {
  const [isActive, setIsActive] = useState(true);
  const [catalogUnits, setCatalogUnits] = useState([]);
  const [conversions, setConversions] = useState([]);
  const [editId, setEditId] = useState(null);
  
  // State for Auto Calculation Demo
  const [demoBaseQty, setDemoBaseQty] = useState(1);
  const [baseUnit, setBaseUnit] = useState('');
  const [convUnit, setConvUnit] = useState('');
  const [convQty, setConvQty] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Auto calculated result
  const calculatedResult = demoBaseQty * (convQty || 0);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      const [unitsRes, convRes] = await Promise.all([
        apiClient.get('/units'),
        apiClient.get('/unit-conversions')
      ]);
      if (unitsRes.data && unitsRes.data.data) {
        setCatalogUnits(unitsRes.data.data);
        if (unitsRes.data.data.length > 0 && !baseUnit) {
          setBaseUnit(unitsRes.data.data[0].name);
        }
        if (unitsRes.data.data.length > 1 && !convUnit) {
          setConvUnit(unitsRes.data.data[1].name);
        } else if (unitsRes.data.data.length > 0 && !convUnit) {
          setConvUnit(unitsRes.data.data[0].name);
        }
      }
      if (convRes.data && convRes.data.data) {
        setConversions(convRes.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!baseUnit || !convUnit || !convQty) {
      alert("Please fill in all conversion fields.");
      return;
    }
    
    const payload = {
      baseUnit,
      baseQty: 1,
      targetUnit: convUnit,
      targetQty: convQty,
      isActive
    };

    try {
      if (editId) {
        await apiClient.put(`/unit-conversions/${editId}`, payload);
        setEditId(null);
      } else {
        await apiClient.post('/unit-conversions', payload);
      }
      
      setConvQty('');
      setIsActive(true);
      fetchData();
    } catch (error) {
      console.error("Failed to save conversion:", error);
      alert("Failed to save conversion.");
    }
  };

  const handleEdit = (conv) => {
    setEditId(conv.id);
    setBaseUnit(conv.baseUnit);
    setConvUnit(conv.targetUnit);
    setConvQty(conv.targetQty);
    setIsActive(conv.isActive);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this conversion?")) return;
    try {
      await apiClient.delete(`/unit-conversions/${id}`);
      if (editId === id) {
        setEditId(null);
        setConvQty('');
        setIsActive(true);
      }
      fetchData();
    } catch (error) {
      console.error("Failed to delete conversion:", error);
      alert("Failed to delete conversion.");
    }
  };

  const handleToggleStatus = async (conv) => {
    try {
      await apiClient.put(`/unit-conversions/${conv.id}`, {
        isActive: !conv.isActive
      });
      fetchData();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update status.");
    }
  };

  const filteredConversions = conversions.filter(c => 
    c.baseUnit.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.targetUnit.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded shadow-2xl w-full max-w-[min(96vw,800px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Unit Conversion</h2>
          <button 
            onClick={onClose}
            className="text-[#dc3545] hover:text-red-600 transition-colors"
          >
            <X className="w-6 h-6 font-bold" strokeWidth={3} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-140px)] custom-scrollbar">
          
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-[3px] text-[13px]">
            Define conversion ratios between units. E.g., <strong>1 BOX = 12 PCS</strong>. The system will automatically calculate quantities based on these rules.
          </div>

          {/* Add Conversion Section */}
          <div className="border border-gray-300 rounded-[3px] p-4 bg-white shadow-sm relative">
            <h3 className="text-[#4F46E5] text-[14px] font-bold mb-4">Add / Edit Conversion</h3>
            
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <label className="text-[13px] font-bold text-gray-800">Status</label>
              <div 
                className={`w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-[#0d6efd]' : 'bg-gray-300'}`}
                onClick={() => setIsActive(!isActive)}
              >
                <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isActive ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
              </div>
              <span className="text-[12px] font-bold text-gray-600">{isActive ? 'Active' : 'Inactive'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-700">Base Unit (e.g. 1 BOX)</label>
                <div className="flex items-center gap-2">
                  <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-[3px] px-3 py-[7px] text-[13px] font-bold text-gray-600">
                    1
                  </span>
                  <select 
                    value={baseUnit}
                    onChange={(e) => setBaseUnit(e.target.value)}
                    className="w-full border border-[#4F46E5] bg-[#e8e5ff] rounded-r-[3px] px-2 py-1.5 text-[14px] outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold text-gray-800"
                  >
                    {catalogUnits.map((u) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-700">Equals To (=)</label>
                <div className="flex items-center justify-center h-full pb-1 text-gray-400">
                  <Calculator className="w-5 h-5" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-700">Conversion (e.g. 12 PCS)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={convQty}
                    onChange={(e) => setConvQty(Number(e.target.value))}
                    placeholder="Qty"
                    className="w-[80px] border border-gray-300 rounded-[3px] px-2 py-1.5 text-[14px] outline-none focus:border-[#4F46E5] text-gray-800 text-center font-bold"
                  />
                  <select 
                    value={convUnit}
                    onChange={(e) => setConvUnit(e.target.value)}
                    className="w-full border border-[#4F46E5] bg-[#e8e5ff] rounded-[3px] px-2 py-1.5 text-[14px] outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold text-gray-800"
                  >
                    {catalogUnits.map((u) => (
                      <option key={u.id} value={u.name}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Auto Conversion Demo */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-[3px] p-3 mb-4 flex flex-col sm:flex-row items-center gap-3">
              <span className="text-[13px] font-bold text-yellow-800">Auto Calculation Test:</span>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={demoBaseQty}
                  onChange={(e) => setDemoBaseQty(Number(e.target.value))}
                  className="w-[60px] border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none text-center font-bold"
                />
                <span className="text-[13px] font-bold text-gray-700">{baseUnit}</span>
                <span className="text-[13px] font-bold text-gray-500">=</span>
                <div className="bg-white border border-gray-300 rounded-[3px] px-3 py-1 text-[14px] font-bold text-green-700 min-w-[80px] text-center shadow-sm">
                  {calculatedResult}
                </div>
                <span className="text-[13px] font-bold text-gray-700">{convUnit}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                onClick={handleAddOrUpdate}
                className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[7px] rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
              >
                {editId ? <Edit className="w-4 h-4" strokeWidth={3} /> : <Plus className="w-4 h-4" strokeWidth={3} />}
                {editId ? 'Update Conversion' : 'Add Conversion'}
              </button>
            </div>
          </div>

          {/* Conversions List Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-gray-800">Conversion List</h3>
              <input 
                type="text" 
                placeholder="Search conversion..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] w-[200px]"
              />
            </div>
            
            <div className="border border-gray-200 rounded-[3px] overflow-x-auto shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 w-12 border-r border-gray-200 whitespace-nowrap">#</th>
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">Base Unit</th>
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">Formula</th>
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">Target Unit</th>
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 border-r border-gray-200 whitespace-nowrap">Status</th>
                    <th className="py-2 px-3 text-center text-[13px] font-bold text-gray-700 w-24 whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredConversions.map((conv, index) => (
                    <tr key={conv.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3 text-center text-[13px] text-gray-700 border-r border-gray-200">{index + 1}</td>
                      <td className="py-2 px-3 text-center text-[13px] font-bold text-blue-700 border-r border-gray-200 bg-blue-50/50">{conv.baseQty} {conv.baseUnit}</td>
                      <td className="py-2 px-3 text-center text-[13px] text-gray-500 font-bold border-r border-gray-200">=</td>
                      <td className="py-2 px-3 text-center text-[13px] font-bold text-green-700 border-r border-gray-200 bg-green-50/50">{conv.targetQty} {conv.targetUnit}</td>
                      <td className="py-2 px-3 text-center border-r border-gray-200">
                        <div 
                          className={`mx-auto w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${conv.isActive ? 'bg-[#28a745]' : 'bg-gray-300'}`}
                          onClick={() => handleToggleStatus(conv)}
                          title={conv.isActive ? "Click to deactivate" : "Click to activate"}
                        >
                          <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${conv.isActive ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className="flex items-center justify-center gap-0">
                          <button onClick={() => handleEdit(conv)} className="bg-[#4F46E5] hover:bg-[#4338ca] text-white p-1.5 rounded-l-[3px] transition-colors shadow-sm">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(conv.id)} className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1.5 rounded-r-[3px] transition-colors shadow-sm">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredConversions.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-[13px] text-gray-500">No conversions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2 bg-[#f8f9fa]">
          <button 
            onClick={onClose}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-[7px] rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
          >
            Save All
          </button>
          <button 
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-5 py-[7px] rounded-[3px] text-[13px] font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
