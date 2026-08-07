import React, { useState, useEffect } from 'react';
import { X, Settings, Image as ImageIcon } from 'lucide-react';
import apiClient from '../api/apiClient';

export function PartyMasterModal({ isOpen, onClose, defaultType = 'COMPANY', editData, onSave }) {
  const [isActive, setIsActive] = useState(true);
  const [partyName, setPartyName] = useState('');
  const [dueDays, setDueDays] = useState('7');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('');
  const [partyTags, setPartyTags] = useState('');
  const [drugLicense, setDrugLicense] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [gstin, setGstin] = useState('');
  const [gstApplicable, setGstApplicable] = useState('GST');
  const [stateName, setStateName] = useState('Karnataka');
  const [emailAddress, setEmailAddress] = useState('');
  const [partyType, setPartyType] = useState('company');
  const [otherMobileNo, setOtherMobileNo] = useState('');
  const [partyLimit, setPartyLimit] = useState('0');
  const [interestRate, setInterestRate] = useState('0');
  const [loyaltyPoints, setLoyaltyPoints] = useState('0');
  const [joiningDate, setJoiningDate] = useState('2026-06-04');
  const [toggles, setToggles] = useState({
    moreInfo: false
  });
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [showPartyTags, setShowPartyTags] = useState(true);
  const [showDueDate, setShowDueDate] = useState(true);
  const [defaultDueDaysSettings, setDefaultDueDaysSettings] = useState('7');
  const [availableTags, setAvailableTags] = useState([]);
  const [extraColumns, setExtraColumns] = useState([]);
  const [newExtraColumn, setNewExtraColumn] = useState({ name: '', defaultValue: '' });

  const toggleSwitch = (key) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/party-tags')
        .then(res => {
          if (res.data.success) setAvailableTags(res.data.data);
        })
        .catch(() => setAvailableTags([]));

      apiClient.get('/party-settings')
        .then(res => {
          if (res.data.success && res.data.data) {
            const settings = res.data.data;
            setShowPartyTags(settings.showPartyTags);
            setShowDueDate(settings.showDueDate);
            setDefaultDueDaysSettings(settings.defaultDueDays.toString());
            setDueDays(settings.defaultDueDays.toString());
            setExtraColumns(Array.isArray(settings.extraColumns) ? settings.extraColumns : []);
          }
        })
        .catch(err => console.error("Failed to fetch settings", err));
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && editData) {
      setPartyName(editData.name || '');
      setMobileNumber(editData.mobile || editData.phone || '');
      setCity(editData.city || '');
      setPartyTags(editData.partyTags || '');
      setDrugLicense(editData.drugLicense || '');
      setAddress(editData.address || '');
      setPinCode(editData.pinCode || '');
      setGstin(editData.gstin || '');
      setGstApplicable(editData.gstApplicable || 'GST');
      setStateName(editData.state || 'Karnataka');
      setEmailAddress(editData.emailAddress || '');
      setPartyType(editData.partyType || 'company');
      setOtherMobileNo(editData.otherMobileNo || '');
      setPartyLimit(editData.partyLimit || '0');
      setInterestRate(editData.interestRate || '0');
      setLoyaltyPoints(editData.loyaltyPoints || '0');
      if (editData.joiningDate) setJoiningDate(editData.joiningDate);
      if (editData.dueDays) setDueDays(editData.dueDays);
    } else if (isOpen && !editData) {
      setPartyName('');
      setMobileNumber('');
      setCity('');
      setPartyTags('');
      setDrugLicense('');
      setAddress('');
      setPinCode('');
      setGstin('');
      setGstApplicable('GST');
      setStateName('Karnataka');
      setEmailAddress('');
      setPartyType('company');
      setOtherMobileNo('');
      setPartyLimit('0');
      setInterestRate('0');
      setLoyaltyPoints('0');
      setJoiningDate('2026-06-04');
      setDueDays('7');
    }
  }, [isOpen, editData]);

  const handleAddExtraColumn = () => {
    if (newExtraColumn.name.trim() === '') return;
    setExtraColumns(prev => [...prev, { name: newExtraColumn.name.trim(), defaultValue: newExtraColumn.defaultValue.trim() }]);
    setNewExtraColumn({ name: '', defaultValue: '' });
  };

  const handleDeleteExtraColumn = (index) => {
    setExtraColumns(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveSettings = async () => {
    try {
      // Agar new input mein kuch likha hai to auto-add karo before saving
      let finalColumns = extraColumns;
      if (newExtraColumn.name.trim() !== '') {
        finalColumns = [...extraColumns, { name: newExtraColumn.name.trim(), defaultValue: newExtraColumn.defaultValue.trim() }];
        setExtraColumns(finalColumns);
        setNewExtraColumn({ name: '', defaultValue: '' });
      }
      await apiClient.put('/party-settings', {
        defaultDueDays: defaultDueDaysSettings,
        showPartyTags,
        showDueDate,
        extraColumns: finalColumns
      });
      setIsSettingOpen(false);
      setDueDays(defaultDueDaysSettings);
    } catch (error) {
      console.error("Failed to save settings", error);
      alert("Failed to save settings. Please try again.");
    }
  };

  const handleSubmit = () => {
    const dataObj = { 
      name: partyName, 
      phone: mobileNumber,
      mobile: mobileNumber, 
      city: city,
      partyTags: partyTags,
      type: defaultType, 
      balance: editData?.balance || 0,
      address,
      pinCode,
      gstin,
      gstApplicable,
      state: stateName,
      emailAddress,
      partyType,
      otherMobileNo,
      partyLimit,
      interestRate,
      loyaltyPoints,
      joiningDate,
      dueDays,
      drugLicense,
    };

    if (editData?.id) {
      dataObj.id = editData.id;
    }

    if (onSave) {
      if (partyName.trim() !== '') {
        onSave(dataObj);
      }
    } else if (partyName.trim() !== '') {
      dataObj.id = dataObj.id || Date.now();
      window.dispatchEvent(new CustomEvent('partyAdded', { detail: dataObj }));
    }

    setPartyName('');
    setDueDays('7');
    setMobileNumber('');
    setCity('');
    setPartyTags('');
    setDrugLicense('');
    setAddress('');
    setPinCode('');
    setGstin('');
    setGstApplicable('GST');
    setStateName('Karnataka');
    setEmailAddress('');
    setPartyType('company');
    setOtherMobileNo('');
    setPartyLimit('0');
    setInterestRate('0');
    setLoyaltyPoints('0');
    setJoiningDate('2026-06-04');
    setIsActive(true);
    setToggles({ moreInfo: false });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
        <div className="bg-white rounded-[3px] shadow-2xl w-full sm:max-w-[750px] max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          
          {/* Header */}
          <div className="bg-[#4F46E5] flex items-center justify-between">
            <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5">Party Master</h2>
            <div className="flex items-center">
              <button 
                onClick={() => setIsSettingOpen(true)}
                className="text-white hover:text-gray-200 px-3 py-2.5 focus:outline-none transition-colors"
              >
                <Settings className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button 
                onClick={onClose} 
                className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors"
              >
                <X className="w-5 h-5 text-white" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 bg-white overflow-y-auto flex-1">
            <div className="flex flex-col gap-4">
              
              {/* Row 1: Party Name, Active, Due Days */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label className="text-[14px] font-bold text-gray-800">Party Name</label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-[#0d6efd]' : 'bg-gray-300'}`}
                        onClick={() => setIsActive(!isActive)}
                      >
                        <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isActive ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                      </div>
                      <span className="text-[13px] font-bold text-gray-800 select-none">Active</span>
                    </div>
                    {showDueDate && (
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-gray-800">Due Days</span>
                        <input 
                          type="text" 
                          value={dueDays}
                          onChange={(e) => setDueDays(e.target.value)}
                          className="w-[60px] border border-gray-300 rounded-[3px] px-2 py-1 text-[13px] outline-none focus:border-[#4F46E5] text-center"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <input 
                  type="text" 
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="Enter Name"
                  className="w-full border border-gray-300 bg-[#a6cdec] placeholder-gray-500 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] font-bold"
                />
              </div>
              
              {/* Row 2: Mobile Number & City */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex flex-col gap-1">
                  <label className="text-[14px] font-bold text-gray-800">Mobile Number</label>
                  <input 
                    type="text" 
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Hint - Better to use WhatsApp Number"
                    className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1 relative">
                  <label className="text-[14px] font-bold text-gray-800">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Enter city"
                    className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                  />
                </div>
              </div>

              {/* Row 3: Party Tags */}
              {showPartyTags && (
                <div className="flex flex-col gap-1 relative">
                  <label className="text-[14px] font-bold text-gray-800">Party Tags</label>
                  <input
                    type="text"
                    list="party-tags-list"
                    value={partyTags}
                    onChange={(e) => setPartyTags(e.target.value)}
                    placeholder="Select or enter tag"
                    className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                  />
                  <datalist id="party-tags-list">
                    {availableTags.map(tag => (
                      <option key={tag.id} value={tag.name} />
                    ))}
                  </datalist>
                </div>
              )}

              {/* Row 5: More Info Toggle */}
              <div className="flex items-center mt-4 px-2">
                <div className="flex flex-col items-center gap-2">
                  <div 
                    className={`w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${toggles.moreInfo ? 'bg-[#0d6efd]' : 'bg-gray-300'}`}
                    onClick={() => toggleSwitch('moreInfo')}
                  >
                    <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${toggles.moreInfo ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                  </div>
                  <span className="text-[11px] font-bold text-gray-800">More Info</span>
                </div>
              </div>

              {/* Conditional More Info Fields */}
              {toggles.moreInfo && (
                <>
                  {/* Address */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[14px] font-bold text-gray-800">Address</label>
                    <input 
                      type="text" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter Full Address"
                      className="w-full border border-gray-300 bg-[#a6cdec] placeholder-gray-500 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] font-bold"
                    />
                  </div>

                  {/* Pin Code, Gstin, Gst Applicable */}
                  <div className="grid grid-cols-[1.2fr_2fr_1.2fr] gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[14px] font-bold text-gray-800">Pin Code</label>
                      <input 
                        type="text" 
                        value={pinCode}
                        onChange={(e) => setPinCode(e.target.value)}
                        placeholder="Enter Pin Code"
                        className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[14px] font-bold text-gray-800">Gstin</label>
                      <input 
                        type="text" 
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="Enter Gst Number"
                        className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                    <div className="flex flex-col gap-1 relative">
                      <label className="text-[14px] font-bold text-gray-800">Gst Applicable</label>
                      <input
                        type="text"
                        list="gst-applicable-list"
                        value={gstApplicable}
                        onChange={(e) => setGstApplicable(e.target.value)}
                        placeholder="Select or enter GST type"
                        className="w-full border border-gray-300 bg-white rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                      />
                      <datalist id="gst-applicable-list">
                        <option value="GST" />
                        <option value="COMPOSITION" />
                        <option value="UNREGISTERED" />
                        <option value="CONSUMER" />
                      </datalist>
                    </div>
                  </div>

                  {/* State, Email Address, Party Type */}
                  <div className="grid grid-cols-[1.2fr_2fr_1.2fr] gap-4">
                    <div className="flex flex-col gap-1 relative">
                      <label className="text-[14px] font-bold text-gray-800">State</label>
                      <input
                        type="text"
                        list="state-list"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                        placeholder="Select or enter state"
                        className="w-full border border-gray-300 bg-white rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                      />
                      <datalist id="state-list">
                        <option value="Karnataka" />
                        <option value="Delhi" />
                        <option value="Maharashtra" />
                        <option value="Uttar Pradesh" />
                        <option value="Gujarat" />
                      </datalist>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[14px] font-bold text-gray-800">Email Address</label>
                      <input 
                        type="text" 
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="Enter Email Address"
                        className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                    <div className="flex flex-col gap-1 relative">
                      <label className="text-[14px] font-bold text-gray-800">Party Type</label>
                      <input
                        type="text"
                        list="party-type-list"
                        value={partyType}
                        onChange={(e) => setPartyType(e.target.value)}
                        placeholder="Select or enter party type"
                        className="w-full border border-gray-300 bg-white rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                      />
                      <datalist id="party-type-list">
                        <option value="company" />
                        <option value="retailer" />
                        <option value="distributor" />
                      </datalist>
                    </div>
                  </div>

                  {/* Other Mobile No, Party Limit, Interest Rate/Month, Loyalty Points */}
                  <div className="grid grid-cols-[1.2fr_1fr_1fr_1.2fr] gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[14px] font-bold text-gray-800">Other Mobile No</label>
                      <input 
                        type="text" 
                        value={otherMobileNo}
                        onChange={(e) => setOtherMobileNo(e.target.value)}
                        placeholder="Enter Other Mobile"
                        className="w-full border border-gray-300 bg-white placeholder-gray-400 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[14px] font-bold text-gray-800">Party Limit</label>
                      <input 
                        type="text" 
                        value={partyLimit}
                        onChange={(e) => setPartyLimit(e.target.value)}
                        className="w-full border border-gray-300 bg-white rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[14px] font-bold text-gray-800">Interest Rate/Month</label>
                      <input 
                        type="text" 
                        value={interestRate}
                        onChange={(e) => setInterestRate(e.target.value)}
                        className="w-full border border-gray-300 bg-white rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[14px] font-bold text-gray-800">Loyalty Points</label>
                      <input 
                        type="text" 
                        value={loyaltyPoints}
                        onChange={(e) => setLoyaltyPoints(e.target.value)}
                        className="w-full border border-gray-300 bg-white rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>

                  {/* Joining Date */}
                  <div className="grid grid-cols-[1.2fr_2fr_1.2fr] gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[14px] font-bold text-gray-800">Joining Date</label>
                      <div className="relative">
                        <input 
                          type="date" 
                          value={joiningDate}
                          onChange={(e) => setJoiningDate(e.target.value)}
                          className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[14px] outline-none focus:border-[#4F46E5] text-gray-700 bg-white"
                        />
                      </div>
                    </div>
                    <div></div>
                    <div></div>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Footer */}
          <div className="bg-white px-5 py-4 flex justify-end gap-2 border-t border-gray-100">
            <button 
              onClick={handleSubmit}
              className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors"
            >
              Submit
            </button>
            <button 
              onClick={onClose}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </div>

      {/* Party Setting Modal */}
      {isSettingOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white shadow-2xl w-full sm:max-w-[750px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#4F46E5] flex items-center justify-between">
              <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5">Party Setting</h2>
              <button 
                onClick={() => setIsSettingOpen(false)} 
                className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors"
              >
                <X className="w-5 h-5 text-white" strokeWidth={3} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 bg-white overflow-y-auto">
              <div className="border border-gray-200 rounded-sm overflow-hidden mb-6">
                <div className="grid grid-cols-[40px_1fr_1fr_40px] text-center bg-white border-b border-gray-200">
                  <div className="py-2 text-[13px] font-bold text-gray-800 border-r border-gray-200 flex items-center justify-center">#</div>
                  <div className="py-2 text-[13px] font-bold text-gray-800 border-r border-gray-200">Extra Column</div>
                  <div className="py-2 text-[13px] font-bold text-gray-800 border-r border-gray-200">Default Value</div>
                  <div className="py-2"></div>
                </div>

                {/* Saved extra column rows */}
                {extraColumns.map((col, index) => (
                  <div key={index} className="grid grid-cols-[40px_1fr_1fr_40px] text-center bg-white items-center p-1 border-b border-gray-100">
                    <div className="text-[13px] font-bold text-gray-800 flex items-center justify-center">{index + 1}</div>
                    <div className="px-1">
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => setExtraColumns(prev => prev.map((c, i) => i === index ? { ...c, name: e.target.value } : c))}
                        className="w-full border border-blue-300 bg-[#a6cdec] rounded-[3px] px-2 py-1.5 text-[13px] outline-none font-bold"
                      />
                    </div>
                    <div className="px-1">
                      <input
                        type="text"
                        value={col.defaultValue}
                        onChange={(e) => setExtraColumns(prev => prev.map((c, i) => i === index ? { ...c, defaultValue: e.target.value } : c))}
                        className="w-full border border-gray-300 bg-white rounded-[3px] px-2 py-1.5 text-[13px] outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => handleDeleteExtraColumn(index)}
                        className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-sm shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* New row input */}
                <div className="grid grid-cols-[40px_1fr_1fr_40px] text-center bg-white items-center p-1">
                  <div className="text-[13px] font-bold text-gray-800 flex items-center justify-center">#</div>
                  <div className="px-1">
                    <input
                      type="text"
                      value={newExtraColumn.name}
                      onChange={(e) => setNewExtraColumn(prev => ({ ...prev, name: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddExtraColumn()}
                      placeholder="Ex. Firm Name | Vehicle No"
                      className="w-full border border-blue-300 bg-[#a6cdec] placeholder-gray-500 rounded-[3px] px-2 py-1.5 text-[13px] outline-none font-bold"
                    />
                  </div>
                  <div className="px-1">
                    <input
                      type="text"
                      value={newExtraColumn.defaultValue}
                      onChange={(e) => setNewExtraColumn(prev => ({ ...prev, defaultValue: e.target.value }))}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddExtraColumn()}
                      className="w-full border border-gray-300 bg-white rounded-[3px] px-2 py-1.5 text-[13px] outline-none"
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <button
                      onClick={handleAddExtraColumn}
                      className="bg-[#28a745] hover:bg-[#218838] text-white p-1 rounded-sm shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path></svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-end">
                <div className="flex flex-col gap-1 w-[250px]">
                  <label className="text-[14px] font-bold text-gray-800">Default Due Days</label>
                  <input 
                    type="text" 
                    value={defaultDueDaysSettings}
                    onChange={(e) => setDefaultDueDaysSettings(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] outline-none"
                  />
                  <span className="text-[11px] text-gray-500">Default: 7 days (used when party due date is not set)</span>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className={`w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${showPartyTags ? 'bg-[#007bff]' : 'bg-gray-300'}`}
                    onClick={() => setShowPartyTags(!showPartyTags)}
                  >
                    <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${showPartyTags ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                  </div>
                  <span className="text-[13px] font-bold text-gray-800 select-none cursor-pointer" onClick={() => setShowPartyTags(!showPartyTags)}>Show Party Tags</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div 
                    className={`w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${showDueDate ? 'bg-[#007bff]' : 'bg-gray-300'}`}
                    onClick={() => setShowDueDate(!showDueDate)}
                  >
                    <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${showDueDate ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                  </div>
                  <span className="text-[13px] font-bold text-gray-800 select-none cursor-pointer" onClick={() => setShowDueDate(!showDueDate)}>Show Due Date</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-white px-5 py-4 flex justify-end gap-2 border-t border-gray-100">
              <button 
                onClick={handleSaveSettings}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors"
              >
                Save
              </button>
              <button 
                onClick={() => setIsSettingOpen(false)}
                className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
