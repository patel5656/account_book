import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { X, Printer, Calendar, Paperclip, PlusSquare, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';
import { cn } from '../utils';
import { EmployeeMasterModal } from '../components/EmployeeMasterModal';

// Inline Youtube SVG
const YoutubeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
  </svg>
);

export function EmployeeLedger() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const dropdownRef = useRef(null);
  const dateInputRef = useRef(null);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  // Form State
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [remark, setRemark] = useState('');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  };

  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef(null);

  const filteredEmployees = employees.filter(emp => (emp.name || emp.employeeName || '').toLowerCase().includes((employeeSearch || '').toLowerCase()));

  useEffect(() => {
    setHighlightedIndex(filteredEmployees.length > 0 ? 0 : -1);
  }, [employeeSearch, employees]);

  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const child = listRef.current.children[highlightedIndex];
      if (child) {
        child.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex(prev => {
        const next = prev + 1;
        return next >= filteredEmployees.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsDropdownOpen(true);
      setHighlightedIndex(prev => {
        const next = prev - 1;
        return next < 0 ? filteredEmployees.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredEmployees.length) {
        handleSelectEmployee(filteredEmployees[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
    }
  };
  
  useEffect(() => {
    fetchEmployees();
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    const handleEmployeeUpdated = async (e) => {
      try {
        const res = await apiClient.put(`/employees/${e.detail.id}`, {
          name: e.detail.employeeName,
          mobile: e.detail.mobileNumber,
          city: e.detail.city,
          joiningDate: e.detail.joiningDate,
          designation: e.detail.designation,
          salary: e.detail.salary,
          paidHoliday: e.detail.paidHoliday,
          commission: e.detail.commission,
          specialCommission: e.detail.specialCommission,
          totalSaleCommission: e.detail.totalSaleCommission,
          commissionOnManufacturing: e.detail.commissionOnManufacturing === 'YES' ? 1 : 0
        });
        if (res.data.success) {
          fetchEmployees();
          if (selectedEmployee?.id === e.detail.id) {
            fetchTransactions({ id: e.detail.id });
          }
        }
      } catch (err) {
        console.error('Error updating employee:', err);
        alert(err.response?.data?.message || 'Failed to update employee');
      }
    };
    window.addEventListener('employeeUpdated', handleEmployeeUpdated);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('employeeUpdated', handleEmployeeUpdated);
    };
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    try {
      const res = await apiClient.get('/employees');
      if (res.data.success) {
        setEmployees(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching employees', err);
    }
  };

  const fetchTransactions = async (employee) => {
    try {
      const res = await apiClient.get(`/employees/${employee.id}/transactions`);
      if (res.data.success) {
        setTransactions(res.data.data);
        setSelectedEmployee(res.data.employee); // Updates balance
      }
    } catch (err) {
      console.error('Error fetching transactions', err);
    }
  };

  const handleSelectEmployee = (emp) => {
    setEmployeeSearch(emp.name);
    setSelectedEmployee(emp);
    setIsDropdownOpen(false);
    
    // Auto-fill salary from Employee Master
    if (emp.salary) {
      setSalaryAmount(emp.salary.toString());
      setIsPaid(false); // Switch to salary mode
    } else {
      setSalaryAmount('');
    }
    
    fetchTransactions(emp);
  };

  const handleAddEntry = async () => {
    if (!selectedEmployee) return alert('Please select an employee first');
    
    // Validate
    const amtSalary = parseFloat(salaryAmount) || 0;
    const amtPaid = parseFloat(paidAmount) || 0;
    
    if (amtSalary === 0 && amtPaid === 0) {
      return alert('Please enter Salary or Paid amount');
    }
    if (amtSalary > 0 && amtPaid > 0) {
      return alert('You can only enter Salary OR Paid amount at one time, not both. Toggle the Paid switch to change mode.');
    }

    try {
      const payload = {
        date: entryDate,
        type: isPaid ? 'PAYMENT' : 'SALARY',
        amount: isPaid ? amtPaid : amtSalary,
        discount: isPaid ? (parseFloat(discountAmount) || 0) : 0,
        remark
      };

      const res = await apiClient.post(`/employees/${selectedEmployee.id}/transactions`, payload);
      if (res.data.success) {
        setSalaryAmount('');
        setPaidAmount('');
        setDiscountAmount('');
        setRemark('');
        fetchTransactions(selectedEmployee);
        fetchEmployees();
      }
    } catch (err) {
      console.error('Error adding transaction', err);
      alert('Failed to add transaction');
    }
  };

  const handleDeleteEmployee = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await apiClient.delete(`/employees/${id}`);
        setEmployees(employees.filter(emp => emp.id !== id));
        if (selectedEmployee?.id === id) {
          setSelectedEmployee(null);
          setTransactions([]);
          setEmployeeSearch("");
        }
      } catch (err) {
        console.error('Error deleting employee', err);
        alert(err.response?.data?.message || 'Failed to delete employee.');
      }
    }
  };

  const handleDeleteEntry = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const res = await apiClient.delete(`/employees/transactions/${transactionId}`);
        if (res.data.success) {
          fetchTransactions(selectedEmployee);
          fetchEmployees();
        }
      } catch (err) {
        console.error('Error deleting transaction', err);
        alert('Failed to delete transaction');
      }
    }
  };

  const handleEditEmployee = (e, emp) => {
    e.stopPropagation();
    setIsDropdownOpen(false);
    
    // Map fields so EmployeeMasterModal can read them properly
    const formattedEmp = {
      ...emp,
      employeeName: emp.name,
      mobileNumber: emp.mobile,
      city: emp.city,
      isActive: true,
      isSalaryMonth: true
    };
    
    setEditingEmployee(formattedEmp);
    setEditModalOpen(true);
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>
      
      <input type="file" ref={fileInputRef} className="hidden" />
      <div id="printable-area" className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Employee Ledger</h2>
          
          <div className="flex flex-wrap items-center gap-2 no-print">
            <button className="flex items-center justify-center bg-white text-gray-800 w-[34px] h-[32px] rounded-[3px] transition-colors">
              <YoutubeIcon className="w-5 h-5 text-[#ff0000]" />
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors"
            >
              <X className="w-5 h-5 font-bold" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="p-3 border-b border-gray-200 no-print">
          <div className="flex flex-col gap-1 w-full max-w-[min(96vw,600px)]">
             <div className="flex justify-between items-center px-1">
               <label className="text-[13px] font-bold text-gray-800">Employee Name</label>
               <span className="text-[13px] font-bold text-[#dc3545]">Account Balance : ₹{(selectedEmployee?.balance || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span>
             </div>
             <div className="relative w-full" ref={dropdownRef}>
               <div className="relative flex items-center cursor-pointer" onClick={() => setIsDropdownOpen(true)}>
                 <input 
                   type="text"
                   value={employeeSearch}
                   onChange={(e) => {
                     setEmployeeSearch(e.target.value);
                     setIsDropdownOpen(true);
                   }}
                   onKeyDown={handleKeyDown}
                   placeholder="Select Name"
                   className="w-full bg-[#add8e6] border border-[#add8e6] text-[#0056b3] placeholder-[#0056b3] rounded-[3px] px-3 py-1.5 pr-10 text-[14px] outline-none font-medium cursor-pointer"
                 />
                 <div className="absolute right-2 flex items-center gap-1.5 text-[#0056b3]">
                   <X className="w-3 h-3 hover:text-gray-800 cursor-pointer" onClick={(e) => { e.stopPropagation(); setEmployeeSearch(''); setSelectedEmployee(null); setTransactions([]); }} />
                   {isDropdownOpen ? <ChevronUp className="w-4 h-4 cursor-pointer hover:text-gray-800" /> : <ChevronDown className="w-4 h-4 cursor-pointer hover:text-gray-800" />}
                 </div>
               </div>
               
               {isDropdownOpen && (
                 <div ref={listRef} className="absolute top-full left-0 w-full mt-0.5 bg-white border border-gray-300 rounded-[3px] shadow-xl z-50 max-h-[300px] overflow-y-auto">
                   {filteredEmployees.map((emp, index) => {
                     const isHighlighted = index === highlightedIndex;
                     return (
                       <div 
                         key={emp.id} 
                         onClick={() => handleSelectEmployee(emp)}
                         className={`p-2 border-b transition-colors cursor-pointer flex justify-between ${
                           isHighlighted 
                             ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10' 
                             : (selectedEmployee?.id === emp.id ? 'bg-[#add8e6] border-gray-200' : 'bg-white border-gray-150')
                         } hover:bg-indigo-50/50`}
                       >
                         <div className="flex flex-col">
                           <span className="font-bold text-[13px] text-gray-900">{emp.name}</span>
                           <span className="text-[11px] text-gray-800 font-medium mt-0.5">{emp.city || ''} {emp.mobile ? `Mobile: ${emp.mobile}` : ''}</span>
                         </div>
                         <div className="flex flex-col items-end justify-between">
                           <span className="text-[13px] text-gray-800 font-medium">₹{(emp.balance || 0).toLocaleString()}</span>
                           <div className="flex gap-2 mt-1">
                             <Edit2 className="w-3.5 h-3.5 text-[#4F46E5] hover:text-cyan-700" onClick={(e) => handleEditEmployee(e, emp)} />
                             <Trash2 className="w-3.5 h-3.5 text-[#dc3545] hover:text-red-700" onClick={(e) => handleDeleteEmployee(e, emp.id)} />
                           </div>
                         </div>
                       </div>
                     );
                   })}
                   {filteredEmployees.length === 0 && (
                     <div className="p-3 text-center text-[12px] text-gray-500">No employees found</div>
                   )}
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-x-auto overflow-y-hidden min-h-0 w-full">
          <div className="min-w-[900px] flex flex-col h-full">
            {/* Table Header */}
            <div className="bg-[#343a40] text-white grid grid-cols-[50px_130px_1fr_100px_120px_100px_100px_80px] text-center border-b border-gray-600">
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                #
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                DATE
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Other Information
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Salary
              </div>
              <div 
                className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer select-none no-print"
                onClick={() => setIsPaid(!isPaid)}
              >
                <div className={`w-[30px] h-[16px] rounded-full relative border transition-colors ${isPaid ? 'bg-[#dc3545] border-[#c82333]' : 'bg-[#28a745] border-[#218838]'}`}>
                  <div className={`w-[12px] h-[12px] bg-white rounded-full absolute top-[1px] transition-all ${isPaid ? 'left-[1px]' : 'right-[1px]'}`}></div>
                </div>
                Paid
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Discount
              </div>
              <div className="border-r border-gray-600 py-2.5 text-[13px] font-bold flex items-center justify-center">
                Balance
              </div>
              <div className="py-2.5 text-[13px] font-bold flex items-center justify-center uppercase">
                Action
              </div>
            </div>

            {/* Render added entries */}
            {transactions.map((entry, index) => (
              <div key={entry.id} className="grid grid-cols-[50px_130px_1fr_100px_120px_100px_100px_80px] bg-white border-b border-gray-200">
                <div className="border-r border-gray-200 flex items-center justify-center p-1 bg-gray-100 text-[13px]">
                  {index + 1}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {new Date(entry.date).toLocaleDateString()}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {entry.remark || '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600 font-bold">
                  {entry.type === 'SALARY' ? <span className="text-gray-800">{entry.amount.toFixed(2)}</span> : '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold">
                  {entry.type === 'PAYMENT' ? <span className="text-[#28a745]">{entry.amount.toFixed(2)}</span> : '-'}
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-600">
                  {entry.discount > 0 ? entry.discount.toFixed(2) : '-'}
                </div>
                <div className={`border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold ${entry.balance < 0 ? 'text-[#28a745]' : 'text-[#dc3545]'}`}>
                  {Math.abs(entry.balance).toFixed(2)} {entry.balance < 0 ? 'Cr' : 'Dr'}
                </div>
                <div className="p-1 flex items-center justify-center bg-gray-50 no-print">
                  <button onClick={() => handleDeleteEntry(entry.id)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}

            {/* Input Row */}
            <div className="grid grid-cols-[50px_130px_1fr_100px_120px_100px_100px_80px] bg-white border-b border-gray-200 no-print">
              <div className="border-r border-gray-200 flex items-center justify-center p-1 bg-[#343a40]">
                <span className="text-white text-[12px] font-bold">#</span>
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center relative">
                <input 
                  ref={dateInputRef}
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="absolute w-0 h-0 opacity-0 -z-10"
                />
                <input 
                  type="text" 
                  readOnly
                  value={formatDisplayDate(entryDate)}
                  className="w-full h-[32px] border border-gray-300 border-r-0 rounded-l-[3px] px-2 text-[13px] outline-none text-gray-600"
                />
                <button 
                  onClick={() => {
                    try {
                      dateInputRef.current?.showPicker();
                    } catch (e) {
                      dateInputRef.current?.focus();
                    }
                  }}
                  className="h-[32px] border border-gray-300 border-l-0 px-2 flex items-center justify-center rounded-r-[3px] text-gray-500 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                </button>
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                 <input 
                   type="text" 
                   value={remark}
                   onChange={e => setRemark(e.target.value)}
                   placeholder="Enter Other Information" 
                   className="w-full h-[32px] px-2 text-[13px] outline-none text-center placeholder-gray-400 border border-transparent focus:border-gray-300 rounded-[3px]" 
                 />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input 
                  type="number" 
                  value={salaryAmount}
                  onChange={e => {
                    setSalaryAmount(e.target.value);
                    if (e.target.value) setIsPaid(false);
                  }}
                  disabled={isPaid}
                  placeholder="0"
                  className={cn(
                    "w-full h-[32px] rounded-[3px] px-2 text-[13px] outline-none text-center font-bold",
                    isPaid ? "bg-gray-100 border border-gray-300 text-gray-400" : "bg-white border border-[#ffcccc] bg-[#fff0f0]"
                  )} 
                />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input 
                  type="number" 
                  value={paidAmount}
                  onChange={e => {
                    setPaidAmount(e.target.value);
                    if (e.target.value) setIsPaid(true);
                  }}
                  disabled={!isPaid}
                  placeholder="0"
                  className={cn(
                    "w-full h-[32px] rounded-[3px] px-2 text-[13px] outline-none text-center font-bold",
                    !isPaid ? "bg-gray-100 border border-gray-300 text-gray-400" : "bg-[#f0fdf4] border border-[#bbf7d0]"
                  )} 
                />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center">
                <input 
                  type="number" 
                  value={discountAmount}
                  onChange={e => setDiscountAmount(e.target.value)}
                  disabled={!isPaid}
                  placeholder="0"
                  className={cn(
                    "w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-center",
                    !isPaid && "bg-gray-100 text-gray-400"
                  )} 
                />
              </div>
              <div className="border-r border-gray-200 p-1 flex items-center bg-[#e9ecef]">
                <input type="text" value={selectedEmployee ? Math.abs(selectedEmployee.balance).toFixed(2) : "0"} className="w-full h-[32px] bg-transparent text-[13px] font-bold text-gray-600 outline-none text-center" readOnly />
              </div>
              <div className="bg-[#343a40] flex items-center justify-center gap-1.5 p-1">
                <button onClick={() => fileInputRef.current?.click()} className="bg-white p-1 rounded-sm shadow-sm hover:bg-gray-100">
                  <Paperclip className="w-4 h-4 text-gray-600" strokeWidth={2.5} />
                </button>
                <button onClick={handleAddEntry} className="text-[#28a745] hover:text-green-400">
                  <PlusSquare className="w-6 h-6" strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Total Row */}
            <div className="grid grid-cols-[50px_130px_1fr_100px_120px_100px_100px_80px] bg-white border-b border-gray-200 mt-auto">
              <div className="col-span-3 border-r border-gray-200 p-2 flex items-center justify-end pr-4">
                <span className="font-bold text-[14px] text-gray-800">Total :</span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {transactions.reduce((acc, curr) => curr.type === 'SALARY' ? acc + curr.amount : acc, 0).toFixed(2)}
                </span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {transactions.reduce((acc, curr) => curr.type === 'PAYMENT' ? acc + curr.amount : acc, 0).toFixed(2)}
                </span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-gray-800">
                  {transactions.reduce((acc, curr) => acc + curr.discount, 0).toFixed(2)}
                </span>
              </div>
              <div className="border-r border-gray-200 p-2 flex items-center justify-center">
                <span className="font-bold text-[14px] text-[#dc3545]">
                  {selectedEmployee ? Math.abs(selectedEmployee.balance).toFixed(2) : "0.00"}
                </span>
              </div>
              <div className="p-2 flex items-center justify-center no-print">
              </div>
            </div>

          </div>
        </div>

      </div>
      
      <EmployeeMasterModal 
        isOpen={editModalOpen} 
        onClose={() => {
          setEditModalOpen(false);
          setEditingEmployee(null);
        }} 
        employee={editingEmployee}
      />
    </div>
  );
}
