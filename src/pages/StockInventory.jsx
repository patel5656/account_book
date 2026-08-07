import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, Eye, Edit } from 'lucide-react';
import apiClient from '../api/apiClient';

export function StockInventory() {
  const navigate = useNavigate();

  // Toggles
  const [zeroToggle, setZeroToggle] = useState(false);
  const [searchToggle, setSearchToggle] = useState(false);

  // Search
  const [searchText, setSearchText] = useState('');

  // Date filter
  const [dateRange, setDateRange] = useState('Custom Range');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Branch, Location, Warehouse filters
  const [branches, setBranches] = useState([]);
  const [locations, setLocations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');

  // Data
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Current display date label
  const today = new Date();
  const displayDate = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-');

  // Compute date ranges based on selection
  const computeDateRange = (range) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    switch (range) {
      case 'Today': {
        return { start: todayStr, end: todayStr };
      }
      case 'Yesterday': {
        const y = new Date(now);
        y.setDate(now.getDate() - 1);
        const ys = y.toISOString().split('T')[0];
        return { start: ys, end: ys };
      }
      case 'Last 7 Days': {
        const s = new Date(now);
        s.setDate(now.getDate() - 6);
        return { start: s.toISOString().split('T')[0], end: todayStr };
      }
      case 'Last 30 Days': {
        const s = new Date(now);
        s.setDate(now.getDate() - 29);
        return { start: s.toISOString().split('T')[0], end: todayStr };
      }
      case 'This Month': {
        const s = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start: s.toISOString().split('T')[0], end: todayStr };
      }
      case 'Last Month': {
        const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const e = new Date(now.getFullYear(), now.getMonth(), 0);
        return { start: s.toISOString().split('T')[0], end: e.toISOString().split('T')[0] };
      }
      default:
        return { start: '', end: '' };
    }
  };

  const fetchInventory = useCallback(async (sd, ed, search, branch, location, warehouse) => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (sd) params.startDate = sd;
      if (ed) params.endDate = ed;
      if (search && search.trim() !== '') params.search = search.trim();
      if (branch) params.branchId = branch;
      if (location) params.locationId = location;
      if (warehouse) params.warehouseId = warehouse;

      const res = await apiClient.get('/products/stock-inventory', { params });
      if (res.data.success) {
        setInventoryData(res.data.data || []);
      } else {
        setError('Failed to load data');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading stock inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch filter metadata on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [branchesRes, locationsRes, warehousesRes] = await Promise.all([
          apiClient.get('/branches'),
          apiClient.get('/locations'),
          apiClient.get('/warehouses')
        ]);
        if (branchesRes.data?.data) setBranches(branchesRes.data.data);
        if (locationsRes.data?.data) setLocations(locationsRes.data.data);
        if (warehousesRes.data?.data) setWarehouses(warehousesRes.data.data);
      } catch (err) {
        console.error('Failed to load metadata in StockInventory', err);
      }
    };
    fetchMetadata();
    fetchInventory('', '', '', '', '', '');
  }, [fetchInventory]);

  // Handle dynamic dropdown filtering logic in UI
  const filteredLocations = selectedBranchId 
    ? locations.filter(l => l.branchId === parseInt(selectedBranchId, 10)) 
    : locations;

  const filteredWarehouses = warehouses.filter(w => {
    const matchesBranch = !selectedBranchId || w.branchId === parseInt(selectedBranchId, 10);
    const matchesLocation = !selectedLocationId || w.locationId === parseInt(selectedLocationId, 10);
    return matchesBranch && matchesLocation;
  });

  // Handle date range dropdown change
  const handleDateRangeChange = (val) => {
    setDateRange(val);
    if (val !== 'Custom Range') {
      const { start, end } = computeDateRange(val);
      setStartDate(start);
      setEndDate(end);
    }
  };

  // Handle search button click
  const handleSearch = () => {
    let sd = startDate;
    let ed = endDate;
    if (dateRange !== 'Custom Range') {
      const computed = computeDateRange(dateRange);
      sd = computed.start;
      ed = computed.end;
    }
    fetchInventory(
      sd, 
      ed, 
      searchToggle ? searchText : '', 
      selectedBranchId, 
      selectedLocationId, 
      selectedWarehouseId
    );
  };

  // Filter by zero toggle
  const filteredData = inventoryData.filter(item => {
    if (!zeroToggle) {
      // Without zero: hide items where closing stock = 0
      return item.closingStock !== 0;
    }
    return true; // With zero: show all
  });

  // Totals
  const totalOpening = filteredData.reduce((acc, cur) => acc + (cur.openingStock || 0), 0);
  const totalPurchase = filteredData.reduce((acc, cur) => acc + (cur.purchaseQty || 0), 0);
  const totalSale = filteredData.reduce((acc, cur) => acc + (cur.saleQty || 0), 0);
  const totalClosing = filteredData.reduce((acc, cur) => acc + (cur.closingStock || 0), 0);

  const getClosingColor = (val) => {
    if (val < 0) return 'text-red-500';
    if (val === 0) return 'text-gray-400';
    return 'text-[#4F46E5]';
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3 relative">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Stock Inventory</h2>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[13px] font-bold ${!zeroToggle ? 'text-white' : 'text-white/60'}`}>Without zero</span>
              <div
                onClick={() => setZeroToggle(!zeroToggle)}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors border border-white/30 ${zeroToggle ? 'bg-[#007bff]' : 'bg-white/20'}`}
              >
                <div className={`absolute top-[2px] w-4 h-4 bg-white rounded-full transition-all shadow-sm ${zeroToggle ? 'left-[22px]' : 'left-[2px]'}`} />
              </div>
              <span className={`text-[13px] font-bold ${zeroToggle ? 'text-white' : 'text-white/60'}`}>With zero</span>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors shadow-sm ml-2"
            >
              <X className="w-5 h-5 font-bold" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="p-3 bg-white border-b border-gray-200 flex flex-col gap-3">
          
          {/* Top Row: Search and Date */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end flex-wrap">
            
            {/* Search Toggle + Input */}
            <div className="flex flex-col w-full md:w-[320px]">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <div
                  onClick={() => setSearchToggle(!searchToggle)}
                  className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${searchToggle ? 'bg-[#007bff]' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-[2px] w-3 h-3 bg-white rounded-full transition-all shadow-sm ${searchToggle ? 'left-[18px]' : 'left-[2px]'}`} />
                </div>
                <span className="text-[13px] font-bold text-gray-800">Search by Anything :</span>
              </div>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                disabled={!searchToggle}
                placeholder={searchToggle ? 'Search product name...' : ''}
                className="w-full border border-gray-300 bg-[#e9ecef] rounded-[3px] px-3 py-1.5 text-[14px] outline-none focus:border-[#4F46E5] focus:bg-white transition-colors h-[34px] disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Date Range */}
            <div className="flex items-end gap-2 flex-wrap">
              <div className="flex flex-col">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[13px] font-bold text-gray-800">Date</span>
                  <span className="text-[11px] font-bold text-[#4F46E5] ml-2">({displayDate})</span>
                </div>
                <select
                  value={dateRange}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="border border-gray-300 rounded-[3px] px-2 py-1.5 text-[14px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white h-[34px]"
                >
                  <option>Today</option>
                  <option>Yesterday</option>
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last Month</option>
                  <option>This Month</option>
                  <option>Custom Range</option>
                </select>
              </div>

              {/* Custom date inputs */}
              {dateRange === 'Custom Range' && (
                <>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-gray-600 mb-1">From</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] h-[34px]"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[12px] text-gray-600 mb-1">To</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] h-[34px]"
                    />
                  </div>
                </>
              )}
            </div>

          </div>

          {/* Bottom Row: Branch, Location, Warehouse filters */}
          <div className="flex flex-wrap items-end gap-3 pt-2 border-t border-gray-100">
            
            {/* Branch Selector */}
            <div className="flex flex-col w-[200px]">
              <span className="text-[13px] font-bold text-gray-800 mb-1">Filter by Branch</span>
              <select
                value={selectedBranchId}
                onChange={(e) => {
                  setSelectedBranchId(e.target.value);
                  setSelectedLocationId('');
                  setSelectedWarehouseId('');
                }}
                className="border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white h-[34px]"
              >
                <option value="">All Branches</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            {/* Location Selector */}
            <div className="flex flex-col w-[200px]">
              <span className="text-[13px] font-bold text-gray-800 mb-1">Filter by Location</span>
              <select
                value={selectedLocationId}
                onChange={(e) => {
                  setSelectedLocationId(e.target.value);
                  setSelectedWarehouseId('');
                }}
                className="border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white h-[34px]"
              >
                <option value="">All Locations</option>
                {filteredLocations.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Warehouse Selector */}
            <div className="flex flex-col w-[200px]">
              <span className="text-[13px] font-bold text-gray-800 mb-1">Filter by Warehouse</span>
              <select
                value={selectedWarehouseId}
                onChange={(e) => setSelectedWarehouseId(e.target.value)}
                className="border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] text-gray-700 outline-none focus:border-[#4F46E5] bg-white h-[34px]"
              >
                <option value="">All Warehouses</option>
                {filteredWarehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleSearch}
              className="flex items-center justify-center bg-[#28a745] hover:bg-[#218838] text-white px-4 rounded-[3px] transition-colors shadow-sm h-[34px] font-medium text-[13px] gap-1"
            >
              <Search className="w-4 h-4" />
              Apply Filters
            </button>

          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto bg-white">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-[#343a40] text-white sticky top-0 z-10">
                <tr>
                  <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 text-center w-[60px] whitespace-nowrap">S.NO.</th>
                  <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 whitespace-nowrap">Product Name</th>
                  <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 whitespace-nowrap w-[150px]">Branch</th>
                  <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 whitespace-nowrap w-[150px]">Location</th>
                  <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 whitespace-nowrap w-[150px]">Warehouse</th>
                  <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 text-center w-[110px] whitespace-nowrap">Opening Stock</th>
                  <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 text-center w-[110px] whitespace-nowrap">Purchase Qty</th>
                  <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 text-center w-[110px] whitespace-nowrap">Sale Qty</th>
                  <th className="px-3 py-2 text-[13px] font-bold border-r border-gray-600 text-center w-[110px] whitespace-nowrap">Closing Stock</th>
                  <th className="px-3 py-2 text-[13px] font-bold text-center w-[100px] whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="10" className="text-center py-10 text-gray-500 text-[14px]">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#4F46E5] border-t-transparent rounded-full animate-spin" />
                        Loading stock data...
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-red-500 text-[14px]">{error}</td>
                  </tr>
                )}

                {!loading && !error && filteredData.length === 0 && (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-500 text-[14px]">No products found.</td>
                  </tr>
                )}

                {!loading && !error && filteredData.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors">
                    <td className="px-3 py-2 border-r border-gray-100 text-center text-[13px] text-gray-500">{index + 1}</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-[13px] font-medium text-gray-800">{item.name}</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-[13px] text-gray-600 font-medium">{item.branchName}</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-[13px] text-gray-600 font-medium">{item.locationName}</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-[13px] text-gray-600 font-medium">{item.warehouseName}</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-center text-[13px] text-gray-600">{item.openingStock}</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-center text-[13px] text-blue-600 font-medium">{item.purchaseQty}</td>
                    <td className="px-3 py-2 border-r border-gray-100 text-center text-[13px] text-orange-500 font-medium">{item.saleQty}</td>
                    <td className={`px-3 py-2 border-r border-gray-100 text-center text-[13px] font-bold ${getClosingColor(item.closingStock)}`}>
                      {item.closingStock}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/items_quantity_report/${item.id}`)}
                          className="text-[#007bff] hover:bg-blue-50 p-1.5 rounded-[3px] transition-colors"
                          title="View History"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate('/admin/item_master')}
                          className="text-[#28a745] hover:bg-green-50 p-1.5 rounded-[3px] transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {/* Totals row */}
                {!loading && filteredData.length > 0 && (
                  <tr className="bg-gray-100 border-t-2 border-gray-300">
                    <td className="px-3 py-2 border-r border-gray-200"></td>
                    <td className="px-3 py-2 border-r border-gray-200"></td>
                    <td className="px-3 py-2 border-r border-gray-200"></td>
                    <td className="px-3 py-2 border-r border-gray-200"></td>
                    <td className="px-3 py-2 border-r border-gray-200 text-right font-bold text-[14px] text-gray-800">Total :</td>
                    <td className="px-3 py-2 border-r border-gray-200 text-center font-bold text-[14px] text-gray-800">{totalOpening}</td>
                    <td className="px-3 py-2 border-r border-gray-200 text-center font-bold text-[14px] text-blue-600">{totalPurchase}</td>
                    <td className="px-3 py-2 border-r border-gray-200 text-center font-bold text-[14px] text-orange-500">{totalSale}</td>
                    <td className={`px-3 py-2 border-r border-gray-200 text-center font-bold text-[14px] ${getClosingColor(totalClosing)}`}>{totalClosing}</td>
                    <td className="px-3 py-2"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
