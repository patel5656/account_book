import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Loader } from 'lucide-react';
import { cn } from '../utils';
import apiClient from '../api/apiClient';

const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", 
  "Chandigarh", "Chattisgarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi", "Goa", 
  "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", 
  "Kerala", "Ladakh", "Lakshadweep Islands", "Madhya Pradesh", "Maharashtra", "Mizoram", 
  "Nagaland", "Odisha", "Pondicherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export function FirmRegistration() {
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showBankInfo, setShowBankInfo] = useState(false);
  const [gstRegistered, setGstRegistered] = useState(false);
  
  // Real DB fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [logo, setLogo] = useState(null);
  
  // Dummy fields (not in DB yet)
  const [stateName, setStateName] = useState('');
  const [isStateDropdownOpen, setIsStateDropdownOpen] = useState(false);
  const [gstin, setGstin] = useState('');
  const [location, setLocation] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [website, setWebsite] = useState('');
  const [stamp, setStamp] = useState(null);

  // Bank fields
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankBranch, setBankBranch] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    fetchCompanyDetails();
  }, []);

  const fetchCompanyDetails = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/companies/me');
      if (res.data.success && res.data.data) {
        const comp = res.data.data;
        setName(comp.name || '');
        setPhone(comp.phone || '');
        setAddress(comp.address || '');
        setOwnerName(comp.ownerName || '');
        setOwnerEmail(comp.ownerEmail || '');
        setLogo(comp.logo || null);
      }
      
      const settingsRes = await apiClient.get('/settings');
      if (settingsRes.data.success && settingsRes.data.data?.printSettings?.bankDetails) {
        const bd = settingsRes.data.data.printSettings.bankDetails;
        if (bd.bankName || bd.bankAccountName || bd.bankBranch || bd.bankIfsc || bd.bankAccountNo || bd.upiId) {
          setBankName(bd.bankName || '');
          setBankAccountName(bd.bankAccountName || '');
          setBankBranch(bd.bankBranch || '');
          setBankIfsc(bd.bankIfsc || '');
          setBankAccountNo(bd.bankAccountNo || '');
          setUpiId(bd.upiId || '');
          setShowBankInfo(true);
        }
      }
    } catch (err) {
      setError('Failed to load company details.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await apiClient.put('/companies/me', {
        name,
        phone,
        address,
        ownerName,
        ownerEmail,
        logo
      });

      // Update bank details in settings
      const settingsRes = await apiClient.get('/settings');
      const currentPrintSettings = settingsRes.data?.data?.printSettings || {};
      
      await apiClient.put('/settings', {
        printSettings: {
          ...currentPrintSettings,
          bankDetails: {
            bankName,
            bankAccountName,
            bankBranch,
            bankIfsc,
            bankAccountNo,
            upiId
          }
        }
      });

      if (res.data.success) {
        setSuccess('Firm details updated successfully!');
      }
    } catch (err) {
      setError('Failed to update firm details.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleStampChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setStamp(URL.createObjectURL(e.target.files[0]));
    }
  };
  
  const removeLogo = () => setLogo(null);
  const removeStamp = () => setStamp(null);

  if (loading) {
    return (
      <div className="bg-[#f8f9fa] min-h-[calc(100vh-45px)] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-[#4F46E5]" />
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] min-h-[calc(100vh-45px)] flex flex-col">
      <div className="bg-white m-3 rounded shadow-sm border border-gray-200 flex-1 flex flex-col relative overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between px-3 py-2">
          <h2 className="text-white font-medium text-[15px]">Firm Registration</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-[#dc3545] hover:text-red-700 bg-[#f8f9fa] rounded-sm p-0.5"
          >
            <X className="w-[18px] h-[18px] font-bold" strokeWidth={4} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 p-4 overflow-y-auto">
          {error && (
            <div className="bg-red-50 text-red-600 text-[13px] px-4 py-2 rounded mb-4 border border-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 text-[13px] px-4 py-2 rounded mb-4 border border-green-200">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            
            {/* Firm Name */}
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-1">Firm Name</label>
              <input 
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Firm Name / Business Name" 
                className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-1">Contact Number</label>
              <input 
                type="text" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Hint - Better to use First Number as WhatsApp Number" 
                className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-1">Address</label>
              <input 
                type="text" 
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Hint - Multiple Address Lines on Invoices can be Possible" 
                className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            {/* State */}
            <div className="relative">
              <label className="block text-[13px] font-bold text-gray-800 mb-1">State</label>
              <input 
                type="text"
                value={stateName}
                onChange={e => {
                  setStateName(e.target.value);
                  setIsStateDropdownOpen(true);
                }}
                onFocus={() => setIsStateDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsStateDropdownOpen(false), 200)}
                placeholder="Enter State"
                className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5] bg-white"
              />
              <div 
                className="pointer-events-none absolute bottom-0 right-0 flex h-[31px] items-center px-2 text-gray-500 cursor-pointer"
                onClick={() => setIsStateDropdownOpen(!isStateDropdownOpen)}
              >
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
              {isStateDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-[3px] shadow-lg max-h-[200px] overflow-y-auto">
                  {INDIAN_STATES
                    .filter(s => s.toLowerCase().includes(stateName.toLowerCase()))
                    .map(s => (
                      <div
                        key={s}
                        className="px-3 py-1.5 text-[13px] hover:bg-[#4F46E5] hover:text-white cursor-pointer text-gray-700"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent onBlur from firing before click
                          setStateName(s);
                          setIsStateDropdownOpen(false);
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  {INDIAN_STATES.filter(s => s.toLowerCase().includes(stateName.toLowerCase())).length === 0 && (
                      <div className="px-3 py-1.5 text-[13px] text-gray-500">No state found</div>
                  )}
                </div>
              )}
            </div>

            {/* Gstin */}
            <div>
              <div className="flex items-center justify-between mb-1">
                 <label className="block text-[13px] font-bold text-gray-800">Gstin</label>
                 <div className="flex flex-wrap items-center gap-2">
                   <div 
                     className={cn(
                       "w-8 h-[18px] rounded-full relative cursor-pointer transition-colors duration-200",
                       gstRegistered ? "bg-[#3b82f6]" : "bg-gray-300"
                     )}
                     onClick={() => setGstRegistered(!gstRegistered)}
                   >
                     <div className={cn(
                       "w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform duration-200",
                       gstRegistered ? "left-[16px]" : "left-[2px]"
                     )}></div>
                   </div>
                   <span className="text-[12px] font-bold text-gray-800">Gst Registred</span>
                 </div>
              </div>
              <input 
                type="text" 
                value={gstin}
                onChange={e => setGstin(e.target.value)}
                placeholder="Enter Gst Number" 
                disabled={!gstRegistered}
                className={cn(
                  "w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none",
                  !gstRegistered ? "bg-gray-100 cursor-not-allowed text-gray-400" : "bg-white focus:border-[#4F46E5]"
                )}
              />
            </div>

            {/* Empty column for grid alignment */}
            <div className="hidden md:block"></div>

            {/* More Information */}
            <div className="col-span-1 md:col-span-2 pt-2">
               <div className="flex flex-wrap items-center gap-2">
                 <div 
                   className={cn(
                     "w-8 h-[18px] rounded-full relative cursor-pointer transition-colors duration-200",
                     showMoreInfo ? "bg-[#3b82f6]" : "bg-gray-300"
                   )}
                   onClick={() => setShowMoreInfo(!showMoreInfo)}
                 >
                   <div className={cn(
                     "w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform duration-200",
                     showMoreInfo ? "left-[16px]" : "left-[2px]"
                   )}></div>
                 </div>
                 <span className="text-[12px] font-bold text-gray-800">More Information</span>
               </div>
            </div>

            {showMoreInfo && (
              <div className="col-span-1 md:col-span-2 mt-1">
                {/* 3 Columns Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 mb-5">
                    <div>
                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Owner Name</label>
                        <input type="text" value={ownerName} onChange={e => setOwnerName(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Location</label>
                        <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Pin Code</label>
                        <input type="text" value={pinCode} onChange={e => setPinCode(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                </div>
                
                {/* 2 Columns Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 mb-5">
                    <div>
                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Email Address</label>
                        <input type="email" value={ownerEmail} onChange={e => setOwnerEmail(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                    <div>
                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Website</label>
                        <input type="text" value={website} onChange={e => setWebsite(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                    </div>
                </div>

                {/* 4 Columns (Logo, Stamp, Whatsapp, API KEY) */}
                <div className="flex flex-col md:flex-row gap-6 mb-5">
                    <div className="w-full md:w-[220px]">
                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Logo</label>
                        <div className="border border-dashed border-gray-300 rounded h-[220px] flex items-center justify-center relative overflow-hidden bg-white group text-center p-4">
                            {logo ? (
                                <>
                                  <img src={logo} alt="Logo preview" className="w-full h-full object-contain" />
                                  <button onClick={removeLogo} className="absolute top-1 right-1 bg-white rounded-full p-0.5 text-red-500 hover:text-red-700 shadow-sm opacity-100 transition-opacity">
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                            ) : (
                                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                                  <span className="text-[12px] text-gray-400">Drag and drop or paste files here or <span className="text-blue-500 font-medium hover:underline">Browse..</span></span>
                                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                </label>
                            )}
                        </div>
                    </div>
                    
                    <div className="w-full md:w-[220px]">
                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Stamp/Signature</label>
                        <div className="border border-dashed border-gray-300 rounded h-[120px] flex items-center justify-center bg-white text-center p-4 relative overflow-hidden group">
                            {stamp ? (
                                <>
                                  <img src={stamp} alt="Stamp preview" className="w-full h-full object-contain" />
                                  <button onClick={removeStamp} className="absolute top-1 right-1 bg-white rounded-full p-0.5 text-red-500 hover:text-red-700 shadow-sm border border-gray-200 opacity-100 transition-opacity">
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                            ) : (
                                <label className="w-full h-full flex items-center justify-center cursor-pointer">
                                  <span className="text-[12px] text-gray-400">Drag and drop or paste files here or <span className="text-blue-500 font-medium hover:underline">Browse..</span></span>
                                  <input type="file" className="hidden" accept="image/*" onChange={handleStampChange} />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 content-start">
                        <div>
                            <label className="block text-[13px] font-bold text-gray-800 mb-1">Add WhatsApp Number</label>
                            <div className="relative">
                                <input 
                                  type="text" 
                                  placeholder="Hint - Better to use First Number as WhatsApp"
                                  className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5] text-gray-700 bg-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Banks Information */}
                <div className="mb-2">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div 
                          className={cn(
                            "w-8 h-[18px] rounded-full relative cursor-pointer transition-colors duration-200",
                            showBankInfo ? "bg-[#3b82f6]" : "bg-gray-300"
                          )}
                          onClick={() => setShowBankInfo(!showBankInfo)}
                        >
                            <div className={cn(
                              "w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform duration-200",
                              showBankInfo ? "left-[16px]" : "left-[2px]"
                            )}></div>
                        </div>
                        <span className="text-[12px] font-bold text-gray-800">Add Banks Information for Invoices</span>
                    </div>
                    
                    {showBankInfo && (
                        <div className="border border-gray-200 bg-white">
                            <div className="flex flex-wrap md:flex-nowrap gap-4 px-4 py-3 items-end">
                                <div className="w-full md:w-[200px]">
                                    <label className="block text-[13px] font-bold text-gray-800 mb-1">Financial Year</label>
                                    <div className="relative">
                                        <select className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5] bg-white appearance-none">
                                            <option>26-27</option>
                                            <option>25-26</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                          </svg>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 w-full">
                                    <label className="block text-[13px] font-bold text-gray-800 mb-1">LUT/Bond NO</label>
                                    <input type="text" className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                                </div>
                            </div>
                            
                            <div className="px-4 pb-4 flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Bank Name</label>
                                        <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Bank's Account Name</label>
                                        <input type="text" value={bankAccountName} onChange={(e) => setBankAccountName(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Branch</label>
                                        <input type="text" value={bankBranch} onChange={(e) => setBankBranch(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                    <div>
                                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Bank IFSC</label>
                                        <input type="text" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="md:col-span-1">
                                        <label className="block text-[13px] font-bold text-gray-800 mb-1">Bank Account Number</label>
                                        <input type="text" value={bankAccountNo} onChange={(e) => setBankAccountNo(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                    <div className="md:col-span-1">
                                        <label className="block text-[13px] font-bold text-gray-800 mb-1">UPI ID</label>
                                        <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5]" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

              </div>
            )}
            
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#f8f9fa] border-t border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleUpdate}
              disabled={saving}
              className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 text-[13px] font-medium px-5 py-1.5 rounded-[3px] transition-colors border border-transparent disabled:opacity-70 flex items-center gap-2"
            >
              {saving && <Loader className="w-4 h-4 animate-spin text-gray-900" />}
              Update
            </button>
            {success && <span className="text-green-600 text-[13px] font-medium">{success}</span>}
            {error && <span className="text-red-600 text-[13px] font-medium">{error}</span>}
          </div>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-white hover:bg-gray-50 text-gray-700 text-[13px] font-medium px-5 py-1.5 rounded-[3px] min-w-0 border border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
