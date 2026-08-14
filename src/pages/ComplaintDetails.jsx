import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Settings, Calendar, Image as ImageIcon, Plus } from 'lucide-react';
import apiClient from '../api/apiClient';

export function ComplaintDetails() {
  const navigate = useNavigate();
  const [isCustomerEnabled, setIsCustomerEnabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showTechnician, setShowTechnician] = useState(true);
  const [extraColumns, setExtraColumns] = useState([{ name: '', type: 'Text', default: '' }]);
  const [selectedDateFilter, setSelectedDateFilter] = useState('Today');
  const [isCustomDateModalOpen, setIsCustomDateModalOpen] = useState(false);
  const [customFromDate, setCustomFromDate] = useState('2000-01-01');
  const [customToDate, setCustomToDate] = useState('2026-07-30');

  // Form states
  const [complainDate, setComplainDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [partyName, setPartyName] = useState('');
  const [productName, setProductName] = useState('');
  const [technicianName, setTechnicianName] = useState('');
  const [complainDetails, setComplainDetails] = useState('');
  const [serviceAmount, setServiceAmount] = useState('0');
  const [remark, setRemark] = useState('');
  const [location, setLocation] = useState('');

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedDateFilter !== 'Custom Range' || (customFromDate && customToDate)) {
      fetchComplaints();
    }
  }, [selectedDateFilter]);

  const fetchInitialData = async () => {
    try {
      const [custRes, prodRes, empRes, setRes] = await Promise.all([
        apiClient.get('/customers'),
        apiClient.get('/products'),
        apiClient.get('/employees'),
        apiClient.get('/settings')
      ]);
      setCustomers(custRes.data.data || custRes.data);
      setProducts(prodRes.data.products || prodRes.data.data || prodRes.data);
      setEmployees(empRes.data.data || empRes.data);
      if (setRes.data.success && setRes.data.data) {
        setShowTechnician(setRes.data.data.showTechnician ?? true);
        if (setRes.data.data.complainExtraColumn) {
          try {
            setExtraColumns(JSON.parse(setRes.data.data.complainExtraColumn));
          } catch(e) {}
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const fetchComplaints = async () => {
    try {
      let url = `/complaints?dateFilter=${encodeURIComponent(selectedDateFilter)}`;
      if (selectedDateFilter === 'Custom Range') {
        url += `&fromDate=${customFromDate}&toDate=${customToDate}`;
      }
      const res = await apiClient.get(url);
      setComplaints(res.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    }
  };

  const handleSubmitComplain = async () => {
    try {
      await apiClient.post('/complaints', {
        complainDate,
        partyName,
        productName,
        technicianName,
        details: complainDetails,
        serviceAmount,
        remark,
        location
      });
      alert("Complain Booked Successfully!");
      setIsModalOpen(false);
      fetchComplaints();
      
      // Reset form fields
      setPartyName('');
      setProductName('');
      setTechnicianName('');
      setComplainDetails('');
      setServiceAmount('0');
      setRemark('');
      setLocation('');
    } catch (error) {
      console.error('Error booking complain:', error);
      alert('Failed to book complain');
    }
  };

  const handleSaveSettings = async () => {
    try {
      const res = await apiClient.put('/settings', {
        showTechnician,
        complainExtraColumn: JSON.stringify(extraColumns)
      });
      if (res.data.success) {
        setIsSettingsModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col relative w-full overflow-hidden">
      {/* Top Teal Bar */}
      <div className="bg-[#4F46E5] px-4 py-[6px] flex justify-between items-center text-white shadow-sm">
        <h2 className="text-[14.5px] font-medium tracking-wide">Complain Summary</h2>
        <div className="flex flex-wrap items-center gap-1.5">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-[4px] rounded-[3px] text-[13px] font-medium flex items-center gap-1 transition-colors"
          >
            <span className="text-lg leading-none mt-[-2px]">+</span> Book New
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-2.5 py-[6px] rounded-[3px] flex items-center justify-center transition-colors"
          >
            <X className="w-[14px] h-[14px]" strokeWidth={3} />
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="px-4 py-3 border-b border-gray-200 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 bg-white shadow-sm">
        {/* Customer Name Toggle & Select */}
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <div className="flex flex-wrap items-center gap-2 px-1">
            <div 
              onClick={() => setIsCustomerEnabled(!isCustomerEnabled)}
              className={`w-8 h-[18px] rounded-full relative cursor-pointer border transition-colors duration-200 ${isCustomerEnabled ? 'bg-[#4F46E5] border-[#4F46E5]' : 'bg-gray-300 border-gray-400'}`}
            >
              <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 ${isCustomerEnabled ? 'right-[2px]' : 'left-[2px]'}`}></div>
            </div>
            <label className="text-[13px] font-bold text-gray-800">Customer Name</label>
          </div>
          <select 
            disabled={!isCustomerEnabled}
            className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-400 bg-white disabled:bg-gray-50 focus:border-[#4F46E5]"
          >
            <option>Select Name</option>
            {customers.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Barcode */}
        <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
          <label className="text-[13px] font-bold text-gray-800 px-1">Barcode</label>
          <input 
            type="text" 
            placeholder="Barcode"
            className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white placeholder-gray-400 focus:border-[#4F46E5]"
          />
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
          <label className="text-[13px] font-bold text-gray-800 px-1">Status</label>
          <select className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]">
            <option>All</option>
            <option selected>Pending</option>
            <option>Running</option>
            <option>Done</option>
            <option>Delivered</option>
            <option>Cancelled</option>
          </select>
        </div>

        {/* Filter By */}
        <div className="flex flex-col gap-1 flex-1 min-w-[150px]">
          <label className="text-[13px] font-bold text-gray-800 px-1">Filter By</label>
          <select className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]">
            <option>Complain Date</option>
            <option>Delivery Date</option>
          </select>
        </div>

        {/* Date & Search */}
        <div className="flex flex-col gap-1 flex-1 min-w-[300px]">
          <label className="text-[13px] font-bold text-gray-800 px-1">Date<span className="text-[#17a2b8]">(01-Jan-2000 to 30-Jul-2026)</span></label>
          <div className="flex gap-2">
            <select 
              value={selectedDateFilter}
              onChange={(e) => {
                setSelectedDateFilter(e.target.value);
                if (e.target.value === 'Custom Range') {
                  setIsCustomDateModalOpen(true);
                }
              }}
              className="flex-1 h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
            >
              <option>Today</option>
              <option>Yesterday</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Month</option>
              <option>Last Month</option>
              <option>Custom Range</option>
            </select>
            <button onClick={() => fetchComplaints()} className="bg-[#007bff] hover:bg-[#0069d9] text-white px-4 py-[5px] rounded-[3px] text-[13px] font-medium flex items-center justify-center gap-1 transition-colors">
              <Search className="w-3.5 h-3.5" strokeWidth={3} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Empty State / List */}
      <div className="flex-1 p-4 flex flex-col min-h-0">
        <div className="flex-1 bg-white border border-gray-200 rounded-[3px] shadow-sm overflow-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="px-4 py-2 text-[13px] font-bold text-gray-700">Date</th>
              <th className="px-4 py-2 text-[13px] font-bold text-gray-700">Party</th>
              <th className="px-4 py-2 text-[13px] font-bold text-gray-700">Product</th>
              {showTechnician && <th className="px-4 py-2 text-[13px] font-bold text-gray-700">Technician</th>}
              <th className="px-4 py-2 text-[13px] font-bold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map(c => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-2 text-[13px]">{new Date(c.complainDate).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-[13px]">{c.partyName}</td>
                <td className="px-4 py-2 text-[13px]">{c.productName}</td>
                {showTechnician && <td className="px-4 py-2 text-[13px]">{c.technicianName}</td>}
                <td className="px-4 py-2 text-[13px]">{c.status}</td>
              </tr>
            ))}
            {complaints.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-4 text-gray-500 text-[13px]">No complaints found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>

      {/* Complain Master Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[650px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#4F46E5] flex items-center justify-between text-white pl-4 py-2.5">
              <h2 className="text-[15px] font-bold tracking-wide">Complain Master</h2>
              <div className="flex items-center">
                <button 
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="text-white hover:text-gray-200 focus:outline-none transition-colors px-3"
                >
                  <Settings className="w-[18px] h-[18px]" strokeWidth={2.5} />
                </button>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors"
                >
                  <X className="w-5 h-5 text-white" strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-4">
              
              {/* Date */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">Date:</label>
                <div className="flex items-center border border-gray-300 rounded-[3px] overflow-hidden focus-within:border-[#4F46E5] bg-white">
                  <input 
                    type="date"
                    value={complainDate}
                    onChange={(e) => setComplainDate(e.target.value)}
                    className="w-full h-[32px] px-3 text-[13px] outline-none text-gray-700 bg-white"
                  />
                </div>
              </div>

              {/* Party Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">Party Name</label>
                <select 
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full h-[32px] border border-[#a6cdec] bg-[#b8daff]/20 text-gray-700 rounded-[3px] px-3 text-[13px] outline-none focus:border-[#4F46E5] font-bold"
                >
                  <option value="">Select Name</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Product Name */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">Product Name</label>
                <select 
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full h-[32px] border border-gray-300 rounded-[3px] px-3 text-[13px] outline-none focus:border-[#4F46E5] text-gray-650 bg-white"
                >
                  <option value="">Select Name</option>
                  {products.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Technician Name */}
              {showTechnician && (
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Technician Name</label>
                  <select 
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full h-[32px] border border-gray-300 rounded-[3px] px-3 text-[13px] outline-none focus:border-[#4F46E5] text-gray-650 bg-white"
                  >
                    <option value="">Select Name</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.name}>{e.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Complain Details & Service Amount */}
              <div className="grid grid-cols-[3fr_1fr] gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Complain Details</label>
                  <input 
                    type="text" 
                    value={complainDetails}
                    onChange={(e) => setComplainDetails(e.target.value)}
                    placeholder="Enter Complain Details"
                    className="w-full h-[32px] border border-gray-300 rounded-[3px] px-3 text-[13px] outline-none focus:border-[#4F46E5] placeholder-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Service Amount</label>
                  <input 
                    type="number" 
                    value={serviceAmount}
                    onChange={(e) => setServiceAmount(e.target.value)}
                    className="w-full h-[32px] border border-gray-300 rounded-[3px] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              {/* Remark & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Remark</label>
                  <input 
                    type="text" 
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Remark"
                    className="w-full h-[32px] border border-gray-300 rounded-[3px] px-3 text-[13px] outline-none focus:border-[#4F46E5] placeholder-gray-400"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Location</label>
                  <input 
                    type="text" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Location"
                    className="w-full h-[32px] border border-gray-300 rounded-[3px] px-3 text-[13px] outline-none focus:border-[#4F46E5] placeholder-gray-400"
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end items-center gap-2">
              <button className="bg-[#6c757d] hover:bg-[#5a6268] text-white p-2 rounded-[3px] flex items-center justify-center mr-auto">
                <ImageIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={handleSubmitComplain}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
              >
                Submit
              </button>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Complain Setting Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[750px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#4F46E5] flex items-center justify-between text-white pl-4 py-2.5">
              <h2 className="text-[18px] font-normal tracking-wide">Complain Setting</h2>
              <button 
                onClick={() => setIsSettingsModalOpen(false)} 
                className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors ml-auto"
              >
                <X className="w-5 h-5 text-white" strokeWidth={3} />
              </button>
            </div>

            {/* Body */}
            <div className="p-4 flex flex-col gap-5">
              
              {/* Table */}
              <div className="w-full overflow-hidden border border-gray-200 rounded-[3px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-gray-200">
                      <th className="py-2.5 px-3 text-[13px] font-bold text-gray-800 text-center w-[40px] border-r border-gray-200">#</th>
                      <th className="py-2.5 px-3 text-[13px] font-bold text-gray-800 text-center border-r border-gray-200">Extra Column</th>
                      <th className="py-2.5 px-3 text-[13px] font-bold text-gray-800 text-center w-[150px] border-r border-gray-200">Column Type</th>
                      <th className="py-2.5 px-3 text-[13px] font-bold text-gray-800 text-center w-[250px] border-r border-gray-200">Default Value</th>
                      <th className="py-2.5 px-3 text-[13px] font-bold text-gray-800 text-center w-[50px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {extraColumns.map((col, index) => (
                      <tr key={index} className="border-b bg-gray-50/50">
                        <td className="py-2 px-3 text-center border-r border-gray-200">{index + 1}</td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <input 
                            type="text" 
                            value={col.name}
                            onChange={(e) => {
                              const newCols = [...extraColumns];
                              newCols[index].name = e.target.value;
                              setExtraColumns(newCols);
                            }}
                            placeholder="Ex. Visit Person | Visit Date"
                            className="w-full h-[32px] border border-gray-300 rounded-[3px] px-3 text-[13px] outline-none focus:border-[#4F46E5] placeholder-gray-400"
                          />
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <input 
                            list="column-types"
                            value={col.type}
                            onChange={(e) => {
                              const newCols = [...extraColumns];
                              newCols[index].type = e.target.value;
                              setExtraColumns(newCols);
                            }}
                            className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none focus:border-[#4F46E5] text-gray-700 bg-white"
                          />
                          <datalist id="column-types">
                            <option value="Text" />
                            <option value="Number" />
                            <option value="Date" />
                          </datalist>
                        </td>
                        <td className="py-2 px-3 border-r border-gray-200">
                          <input 
                            type="text"
                            value={col.default}
                            onChange={(e) => {
                              const newCols = [...extraColumns];
                              newCols[index].default = e.target.value;
                              setExtraColumns(newCols);
                            }}
                            className="w-full h-[32px] border border-gray-300 rounded-[3px] px-3 text-[13px] outline-none focus:border-[#4F46E5]"
                          />
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button 
                            onClick={() => setExtraColumns([...extraColumns, { name: '', type: 'Text', default: '' }])}
                            className="bg-[#28a745] hover:bg-[#218838] text-white p-1 rounded-[3px] transition-colors focus:outline-none"
                          >
                            <Plus className="w-5 h-5" strokeWidth={3} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Toggle Show Technician */}
              <div className="flex items-center gap-2.5 pt-1 pb-16">
                <div 
                  onClick={() => setShowTechnician(!showTechnician)}
                  className={`w-10 h-[22px] rounded-full relative cursor-pointer transition-colors duration-200 ${showTechnician ? 'bg-[#007bff]' : 'bg-gray-300 border-gray-400'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-[3px] transition-all duration-200 shadow-sm ${showTechnician ? 'right-[3px]' : 'left-[3px]'}`}></div>
                </div>
                <label className="text-[14px] font-bold text-gray-900 cursor-pointer" onClick={() => setShowTechnician(!showTechnician)}>Show Technician</label>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button 
                onClick={handleSaveSettings}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[3px] text-[15px] font-normal transition-colors shadow-sm"
              >
                Save
              </button>
              <button 
                onClick={() => setIsSettingsModalOpen(false)}
                className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[3px] text-[15px] font-normal transition-colors shadow-sm"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Custom Date Range Modal */}
      {isCustomDateModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white shadow-xl w-full max-w-[450px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#4F46E5] flex items-center justify-between text-white pl-4 py-2.5">
              <h2 className="text-[17px] font-normal tracking-wide">Select Date Range</h2>
              <button 
                onClick={() => setIsCustomDateModalOpen(false)} 
                className="text-[#ff4d4f] hover:text-[#d9363e] px-4 py-1 focus:outline-none transition-colors"
              >
                <X className="w-6 h-6" strokeWidth={4} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 flex gap-6">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[13px] font-bold text-gray-800">From Date</label>
                <input 
                  type="date"
                  value={customFromDate}
                  onChange={(e) => setCustomFromDate(e.target.value)}
                  className="w-full h-[36px] border border-gray-300 bg-[#b8daff] rounded-[3px] px-3 text-[14px] outline-none text-gray-700 focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[13px] font-bold text-gray-800">To Date</label>
                <input 
                  type="date"
                  value={customToDate}
                  onChange={(e) => setCustomToDate(e.target.value)}
                  className="w-full h-[36px] border border-gray-300 rounded-[3px] px-3 text-[14px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="bg-[#f8f9fa] px-4 py-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => {
                  setIsCustomDateModalOpen(false);
                  fetchComplaints();
                }}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-5 py-2 rounded-[3px] text-[14px] font-bold transition-colors shadow-sm"
              >
                Search
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
