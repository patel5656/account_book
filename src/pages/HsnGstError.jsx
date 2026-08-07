import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ChevronsLeft } from 'lucide-react';
import apiClient from '../api/apiClient';

export function HsnGstError() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('both');
  const [period, setPeriod] = useState('select');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [products, setProducts] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get('/products');
      const allProds = res.data.products || res.data.data || res.data;
      
      // Map it to include GST as a formatted string for the dropdown if needed
      const mapped = allProds.map(p => ({
        ...p,
        hsn: p.hsnCode || '',
        gst: p.tax ? `@${p.tax} %` : '@0 %'
      }));
      setProducts(mapped);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.post('/products/bulk-hsn-gst', {
        products: products
      });
      alert('Changes saved successfully!');
      fetchProducts();
    } catch (error) {
      console.error('Error saving HSN/GST:', error);
      alert('Failed to save changes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle filtering
  const filteredProducts = products.filter(product => {
    if (filterType === 'both') return true;
    if (filterType === 'hsn') return !product.hsn || product.hsn.trim() === '';
    if (filterType === 'gst') return !product.gst || product.gst === '@0 %';
    return true;
  });

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-60px)] flex flex-col p-4 justify-between">
      <div className="bg-white border border-gray-200 rounded-[3px] shadow-sm flex flex-col">
        
        {/* Header */}
        <div className="px-4 py-3 flex justify-between items-center border-b border-gray-200">
          <h2 className="text-[15px] text-gray-800">HSN & GST Error</h2>
          <button className="bg-[#007bff] hover:bg-[#0069d9] text-white px-3 py-1 text-[12px] font-bold rounded-[3px]">
            HSN & GST
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 flex flex-col gap-2 border-b border-gray-200">
          <label className="text-[13px] font-bold text-gray-800">Select Period</label>
          <div className="flex flex-wrap items-center gap-8">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-[300px] h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
            >
              <option value="select">Select</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_quarter">This Quarter</option>
              <option value="last_quarter">Last Quarter</option>
              <option value="custom_range">Custom Range</option>
            </select>
            
            {period === 'custom_range' && (
              <div className="flex items-center gap-2">
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-[130px] h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                />
                <span className="text-[13px] text-gray-500 font-bold">To</span>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[130px] h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                />
              </div>
            )}
            
            <div className="flex flex-wrap items-center gap-6 ml-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="filterType"
                  checked={filterType === 'both'}
                  onChange={() => setFilterType('both')}
                  className="w-3.5 h-3.5 accent-[#007bff]"
                />
                <span className="text-[13px] text-gray-700">Show HSN & GST</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="filterType"
                  checked={filterType === 'hsn'}
                  onChange={() => setFilterType('hsn')}
                  className="w-3.5 h-3.5 accent-[#007bff]"
                />
                <span className="text-[13px] text-gray-700">Show HSN only</span>
              </label>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="filterType"
                  checked={filterType === 'gst'}
                  onChange={() => setFilterType('gst')}
                  className="w-3.5 h-3.5 accent-[#007bff]"
                />
                <span className="text-[13px] text-gray-700">Show GST only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="w-full">
          <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white">
                  <th className="py-2 px-4 text-center text-[12px] font-bold text-gray-800 border-b border-r border-gray-300 w-[80px] whitespace-nowrap">#</th>
                  <th className="py-2 px-4 text-center text-[12px] font-bold text-gray-800 border-b border-r border-gray-300 whitespace-nowrap">Product Name</th>
                  <th className="py-2 px-4 text-center text-[12px] font-bold text-gray-800 border-b border-r border-gray-300 w-[200px] whitespace-nowrap">HSN/SAC</th>
                  <th className="py-2 px-4 text-center text-[12px] font-bold text-gray-800 border-b border-gray-300 w-[200px] whitespace-nowrap">GST</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={product.id === 2 ? 'bg-[#bfe5f0]' : 'bg-white'}>
                    <td className="py-2 px-4 text-center text-[13px] border-b border-r border-gray-300 w-[80px] font-bold text-gray-700">
                      {product.id}
                    </td>
                    <td className="py-2 px-4 text-center text-[13px] text-[#007bff] font-bold hover:underline cursor-pointer border-b border-r border-gray-300">
                      {product.name}
                    </td>
                    <td className="py-2 px-4 border-b border-r border-gray-300 w-[200px]">
                      <input 
                        type="text" 
                        placeholder="HSN Code"
                        value={product.hsn}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProducts(prev => prev.map(p => p.id === product.id ? { ...p, hsn: val } : p));
                        }}
                        className="w-full h-[32px] border border-red-500 rounded-[3px] px-2.5 text-[13px] outline-none text-gray-700 bg-white placeholder-gray-400"
                      />
                    </td>
                    <td className="py-2 px-4 border-b border-gray-300 w-[200px]">
                      <select 
                        value={product.gst}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProducts(prev => prev.map(p => p.id === product.id ? { ...p, gst: val } : p));
                        }}
                        className="w-full h-[32px] border border-red-500 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white"
                      >
                        <option value="@0 %">@0 %</option>
                        <option value="@5 %">@5 %</option>
                        <option value="@12 %">@12 %</option>
                        <option value="@18 %">@18 %</option>
                        <option value="@28 %">@28 %</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-2 mt-4 pt-2">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 rounded-[3px] text-[13px] font-bold flex items-center gap-1.5 transition-colors focus:outline-none disabled:opacity-70"
        >
          <Download className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save'}
        </button>
        <button 
          onClick={() => navigate(-1)}
          className="bg-[#007bff] hover:bg-[#0069d9] text-white px-4 py-2 rounded-[3px] text-[13px] font-bold flex items-center gap-1.5 transition-colors focus:outline-none"
        >
          <ChevronsLeft className="w-3.5 h-3.5" /> Go back
        </button>
      </div>
    </div>
  );
}
