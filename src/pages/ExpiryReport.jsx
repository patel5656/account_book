import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Loader2 } from 'lucide-react';
import { getExpiryReport } from '../api/inventory';

export function ExpiryReport() {
  const navigate = useNavigate();
  
  const [filterType, setFilterType] = useState('Expired Already');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const data = await getExpiryReport(filterType, startDate, endDate);
      setReportData(data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch expiry report data.');
    } finally {
      setLoading(false);
    }
  };

  const renderTable = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-10 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading report...
        </div>
      );
    }
    
    if (error) {
      return <div className="text-center text-red-500 py-4">{error}</div>;
    }

    if (hasSearched && reportData.length === 0) {
      return <div className="text-center text-gray-500 py-4 font-medium">No expiring products found for this range.</div>;
    }

    if (!hasSearched) {
      return (
        <div className="text-center text-gray-500 text-[14px] font-normal py-4">
          Select date range and click Search to load expiry report.
        </div>
      );
    }

    return (
      <div className="overflow-x-auto border border-gray-200 rounded-[3px] mt-4">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-[#f8f9fa] border-b border-gray-200 text-[13px] font-bold text-gray-700">
              <th className="p-3">Product Name</th>
              <th className="p-3">SKU</th>
              <th className="p-3">Category</th>
              <th className="p-3">Current Stock</th>
              <th className="p-3">Expiry Date</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 text-[13px] text-gray-700">
                <td className="p-3 font-medium text-[#007bff]">{item.name}</td>
                <td className="p-3">{item.sku || '-'}</td>
                <td className="p-3">{item.category || '-'}</td>
                <td className="p-3 font-medium">{item.stock}</td>
                <td className="p-3 font-bold text-red-500">{item.expiryMonth}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex items-center justify-between">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Expiry Report</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors"
          >
            <X className="w-5 h-5 font-bold" strokeWidth={4} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <div className="flex flex-col gap-2 w-full max-w-[min(92vw,500px)] mb-6">
            <div className="flex flex-wrap items-center gap-20">
              <label className="text-[14px] font-bold text-gray-800">Expiry In :</label>
            </div>
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1">
                  <select 
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full h-[34px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-800 appearance-none pr-8 bg-white font-medium cursor-pointer focus:border-[#4F46E5]"
                  >
                    <option value="Expired Already">Expired Already</option>
                    <option value="Next 7 Days">Next 7 Days</option>
                    <option value="Next 15 Days">Next 15 Days</option>
                    <option value="Next 30 Days">Next 30 Days</option>
                    <option value="Next 3 Months">Next 3 Months</option>
                    <option value="Next 6 Months">Next 6 Months</option>
                    <option value="Custom Date Range">Custom Date Range</option>
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-wrap items-center gap-1 pointer-events-none text-gray-400">
                    <X className="w-3 h-3" />
                    <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[5px] border-transparent border-t-gray-500"></div>
                  </div>
                </div>
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-[#007bff] hover:bg-[#0069d9] disabled:bg-[#80bdf5] text-white px-4 py-1.5 rounded-[3px] flex items-center gap-1.5 text-[14px] font-bold transition-colors shadow-sm"
                >
                  <Search className="w-4 h-4" strokeWidth={2.5} />
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {filterType === 'Custom Date Range' && (
                <div className="flex items-center gap-2 mt-1">
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 h-[34px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-800 focus:border-[#4F46E5]"
                  />
                  <span className="text-[13px] text-gray-500 font-bold">TO</span>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 h-[34px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-800 focus:border-[#4F46E5]"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 bg-white">
            {renderTable()}
          </div>
        </div>

      </div>
    </div>
  );
}
