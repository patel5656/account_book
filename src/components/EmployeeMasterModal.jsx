import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

export function EmployeeMasterModal({ isOpen, onClose, employee }) {
  const [isActive, setIsActive] = useState(true);
  const [isSalaryMonth, setIsSalaryMonth] = useState(true);
  
  const [employeeName, setEmployeeName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [city, setCity] = useState('');
  const [joiningDate, setJoiningDate] = useState('2026-05-25');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('0');
  const [openingBalance, setOpeningBalance] = useState('0');
  const [openingBalanceType, setOpeningBalanceType] = useState('DUE');
  const [paidHoliday, setPaidHoliday] = useState('0');
  const [commission, setCommission] = useState('0');
  const [specialCommission, setSpecialCommission] = useState('0');
  const [totalSaleCommission, setTotalSaleCommission] = useState('0');
  const [commissionOnManufacturing, setCommissionOnManufacturing] = useState('NO');

  useEffect(() => {
    if (employee && isOpen) {
      setEmployeeName(employee.employeeName || '');
      setMobileNumber(employee.mobileNumber || '');
      setCity(employee.city || '');
      setJoiningDate(employee.joiningDate || '2026-05-25');
      setDesignation(employee.designation || '');
      setSalary(employee.salary || '0');
      // existing employees don't show opening balance easily unless we fetch it. We will just leave it at 0 for edit mode.
      setOpeningBalance('0'); 
      setOpeningBalanceType('DUE');
      setPaidHoliday(employee.paidHoliday || '0');
      setCommission(employee.commission || '0');
      setSpecialCommission(employee.specialCommission || '0');
      setTotalSaleCommission(employee.totalSaleCommission || '0');
      setCommissionOnManufacturing(employee.commissionOnManufacturing || 'NO');
      setIsActive(employee.isActive !== false);
      setIsSalaryMonth(employee.isSalaryMonth !== false);
    } else if (isOpen && !employee) {
      setEmployeeName('');
      setMobileNumber('');
      setCity('');
      setJoiningDate('2026-05-25');
      setDesignation('');
      setSalary('0');
      setOpeningBalance('0');
      setOpeningBalanceType('DUE');
      setPaidHoliday('0');
      setCommission('0');
      setSpecialCommission('0');
      setTotalSaleCommission('0');
      setCommissionOnManufacturing('NO');
      setIsActive(true);
      setIsSalaryMonth(true);
    }
  }, [employee, isOpen]);

  const handleSubmit = () => {
    if (employeeName.trim() !== '') {
      const detail = { 
        id: employee ? employee.id : Date.now(), 
        employeeName, 
        mobileNumber, 
        city, 
        joiningDate, 
        designation, 
        salary, 
        openingBalance,
        openingBalanceType,
        paidHoliday, 
        commission, 
        specialCommission, 
        totalSaleCommission, 
        commissionOnManufacturing,
        isActive,
        isSalaryMonth
      };
      const eventName = employee ? 'employeeUpdated' : 'employeeAdded';
      window.dispatchEvent(new CustomEvent(eventName, { detail }));
    }
    setEmployeeName('');
    setMobileNumber('');
    setCity('');
    setJoiningDate('2026-05-25');
    setDesignation('');
    setSalary('0');
    setOpeningBalance('0');
    setOpeningBalanceType('DUE');
    setPaidHoliday('0');
    setCommission('0');
    setSpecialCommission('0');
    setTotalSaleCommission('0');
    setCommissionOnManufacturing('NO');
    setIsActive(true);
    setIsSalaryMonth(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(96vw,700px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5">Employee Master</h2>
          <button 
            onClick={onClose} 
            className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors"
          >
            <X className="w-5 h-5 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white">
          <div className="flex flex-col gap-4">
            
            {/* Row 1: Employee Name */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[14px] font-bold text-gray-800">Employee Name</label>
                <div className="flex flex-wrap items-center gap-2">
                  <div 
                    className={`w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors ${isActive ? 'bg-[#0d6efd]' : 'bg-gray-300'}`}
                    onClick={() => setIsActive(!isActive)}
                  >
                    <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${isActive ? 'translate-x-[16px]' : 'translate-x-[2px]'}`}></div>
                  </div>
                  <span className="text-[13px] font-bold text-gray-800 select-none">{isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <input 
                type="text" 
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Enter Employee Name"
                className="w-full border border-[#4F46E5] bg-[#e8e5ff] placeholder-gray-500 rounded-[3px] px-3 py-2 text-[14px] outline-none focus:border-[#4F46E5] shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] font-bold"
              />
            </div>

            {/* Row 2: Mobile Number, City */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Mobile Number</label>
                <input 
                  type="text" 
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="Enter Mobile Number"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">City</label>
                <input 
                  type="text" 
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter City"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            {/* Row 3: Joining Date, Designation, Salary */}
            <div className="grid grid-cols-[1fr_1.5fr_1fr] gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Joining Date</label>
                <div className="relative">
                  <input 
                    type="date" 
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-700"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Designation</label>
                <input 
                  type="text" 
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Enter Designation"
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Salary</label>
                <input 
                  type="text" 
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            {/* Row 4: Opening Balance */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Opening Balance</label>
                <input 
                  type="text" 
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Balance Type</label>
                <select 
                  value={openingBalanceType}
                  onChange={(e) => setOpeningBalanceType(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                >
                  <option value="DUE">Due (Salary pending)</option>
                  <option value="ADVANCE">Advance (Given in advance)</option>
                </select>
              </div>
            </div>

            {/* Row 5: Paid Holiday, Commission, Special Commission */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Paid Holiday</label>
                <input 
                  type="text" 
                  value={paidHoliday}
                  onChange={(e) => setPaidHoliday(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Commission</label>
                <input 
                  type="text" 
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Special Commission</label>
                <input 
                  type="text" 
                  value={specialCommission}
                  onChange={(e) => setSpecialCommission(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
            </div>

            {/* Row 5: Total Sale Commission, Commission on Manufacturing */}
            <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Total Sale Commission</label>
                <input 
                  type="text" 
                  value={totalSaleCommission}
                  onChange={(e) => setTotalSaleCommission(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-gray-800">Commision on Manufacturing</label>
                <select 
                  value={commissionOnManufacturing}
                  onChange={(e) => setCommissionOnManufacturing(e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-3 py-[6px] text-[14px] outline-none focus:border-[#4F46E5] text-gray-600 bg-white"
                >
                  <option value="NO">NO</option>
                  <option value="YES">YES</option>
                </select>
              </div>
              <div></div> {/* Empty column for alignment */}
            </div>
            
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8f9fa] px-5 py-3 flex justify-end gap-2 border-t border-gray-200">
          <button 
            onClick={handleSubmit}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
          >
            Submit
          </button>
          <button 
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-[7px] rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
