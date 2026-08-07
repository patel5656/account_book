import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Edit, ChevronDown, Edit3, Plus } from 'lucide-react';
import apiClient from '../api/apiClient';
import { CashBankMasterModal } from './CashBankMasterModal';

export function PaymentStatusModal({ isOpen, onClose, totalAmount = 0, dueAmount = 0, finalAmount = 0, onSaveSuccess, isSales = false, salesPersons = [] }) {
  const billAmount = parseFloat(totalAmount) || parseFloat(finalAmount) || parseFloat(dueAmount) || 0;
  const [banks, setBanks] = useState([]);
  const [paymentRows, setPaymentRows] = useState([
    { id: Date.now(), bankId: '', amount: billAmount, isCheque: false, chequeNo: '', chequeDate: '' }
  ]);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBankMasterOpen, setIsBankMasterOpen] = useState(false);
  const [salesPerson, setSalesPerson] = useState('');
  const [commission, setCommission] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchBanks();
      setPaymentRows([
        { id: Date.now(), bankId: '', amount: billAmount, isCheque: false, chequeNo: '', chequeDate: '' }
      ]);
      setOpenDropdownId(null);
      setSalesPerson('');
      setCommission('');
    }
  }, [isOpen, totalAmount, finalAmount, dueAmount]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!salesPerson || !salesPerson.trim()) {
      setCommission('0.00');
      return;
    }
    const foundEmp = salesPersons.find(
      sp => (sp.name || sp.employeeName || '').trim().toLowerCase() === salesPerson.trim().toLowerCase()
    );
    if (foundEmp) {
      const val = parseFloat(foundEmp.commission) || parseFloat(foundEmp.totalSaleCommission) || parseFloat(foundEmp.specialCommission) || 0;
      const currentAmt = parseFloat(dueAmount || totalAmount || 0);
      
      let calc = 0;
      if (val >= 100) {
        // If commission in Employee Master is 100 or higher (e.g. 100, 500, 2000), treat as fixed rupee commission
        calc = val;
      } else if (val > 0) {
        // If commission is less than 100 (e.g. 5%, 10%), calculate percentage of bill amount
        calc = (currentAmt * val) / 100;
      } else {
        calc = 0;
      }
      setCommission(calc.toFixed(2));
    }
  }, [salesPerson, salesPersons, dueAmount, totalAmount]);

  const fetchBanks = async () => {
    try {
      const res = await apiClient.get('/banks');
      if (res.data?.success && res.data.data && res.data.data.length > 0) {
        let fetchedBanks = [...res.data.data];
        const hasOtherAccount = fetchedBanks.some(b => b.name.toLowerCase() === 'other account');
        if (!hasOtherAccount) {
          fetchedBanks.push({ id: 9999, name: 'other account', type: 'NON-PAYMENT BOOK', balance: -32900 });
        }
        setBanks(fetchedBanks);
      } else {
        setBanks([
          { id: 1, name: 'Cash Account', type: 'CASH BOOK', balance: -205551 },
          { id: 2, name: 'PHONE PAY', type: 'BANK BOOK', balance: 0 },
          { id: 3, name: 'UPI', type: 'BANK BOOK', balance: 10900 },
          { id: 4, name: 'other account', type: 'NON-PAYMENT BOOK', balance: -32900 },
        ]);
      }
    } catch (err) {
      console.error('Failed to fetch banks:', err);
      // Fallback defaults if DB is empty
      setBanks([
        { id: 1, name: 'Cash Account', type: 'CASH BOOK', balance: -205551 },
        { id: 2, name: 'PHONE PAY', type: 'BANK BOOK', balance: 0 },
        { id: 3, name: 'UPI', type: 'BANK BOOK', balance: 10900 },
        { id: 4, name: 'other account', type: 'NON-PAYMENT BOOK', balance: -32900 },
      ]);
    }
  };

  if (!isOpen) return null;

  const handleEditBank = async (bank, e) => {
    e.stopPropagation();
    if (bank.id === 9999) {
      alert("Cannot edit default fallback account.");
      return;
    }
    const newName = window.prompt("Edit Bank Name:", bank.name);
    if (!newName || newName === bank.name) return;
    try {
      const res = await apiClient.put(`/banks/${bank.id}`, { name: newName });
      if (res.data?.success) {
        fetchBanks();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update bank.");
    }
  };

  const handleDeleteBank = async (bankId, e) => {
    e.stopPropagation();
    if (bankId === 9999) {
      alert("Cannot delete default fallback account.");
      return;
    }
    const confirmDelete = window.confirm("Are you sure you want to delete this bank?");
    if (!confirmDelete) return;
    try {
      const res = await apiClient.delete(`/banks/${bankId}`);
      if (res.data?.success) {
        fetchBanks();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to delete bank.");
    }
  };

  const handleAddPaymentRow = () => {
    setPaymentRows([...paymentRows, { id: Date.now(), bankId: '', amount: 0, isCheque: false, chequeNo: '', chequeDate: '' }]);
  };

  const handleRemoveRow = (id) => {
    if (paymentRows.length === 1) {
      setPaymentRows([{ id: Date.now(), bankId: '', amount: 0, isCheque: false, chequeNo: '', chequeDate: '' }]);
    } else {
      setPaymentRows(paymentRows.filter(r => r.id !== id));
    }
  };

  const handleUpdateRow = (id, field, value) => {
    setPaymentRows(paymentRows.map(r => r.id === id ? { ...r, [field]: value } : r));
    if (field === 'bankId') {
      setOpenDropdownId(null);
      setSearchQuery('');
    }
  };

  const handleSavePayments = () => {
    if (onSaveSuccess) {
      if (isSales) {
        onSaveSuccess({ paymentRows, salesPerson, commission });
      } else {
        onSaveSuccess(paymentRows);
      }
    }
    onClose();
  };

  const getTypeColor = (type) => {
    if (type === 'NON-PAYMENT BOOK') return 'text-[#d39e00]'; // Yellowish
    return 'text-[#28a745]'; // Greenish for CASH/BANK
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-[650px] flex flex-col animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2.5 flex items-center justify-between text-white border-b border-white/10 rounded-t-[4px]">
          <h3 className="font-bold text-[16px] tracking-wide">Payment Status</h3>
          <button onClick={onClose} className="hover:text-red-300 transition-colors">
            <X className="w-6 h-6 text-red-500" strokeWidth={3} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 bg-[#f0f4f5] text-gray-800 flex flex-col min-h-[300px]">
          

          <div className="flex justify-end mb-2">
            <span className="text-red-600 font-bold text-[14px]">
              Due Amount : { (billAmount - paymentRows.reduce((sum, row) => sum + (parseFloat(row.amount) || 0), 0)).toFixed(2) }
            </span>
          </div>

          {/* Table */}
          <div className="border border-gray-300 rounded-[3px] bg-white shadow-sm flex-1">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-bold">
                  <th className="p-2 w-[40px]">#</th>
                  <th className="p-2">Bank/UPI</th>
                  <th className="p-2 w-[120px]">Amount</th>
                  <th className="p-2 w-[70px] text-center">Action</th>
                </tr>
              </thead>
              <tbody ref={dropdownRef}>
                {paymentRows.map((row, index) => {
                  const selectedBank = banks.find(b => b.id === parseInt(row.bankId));
                  return (
                    <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50 align-top">
                      <td className="p-2 font-bold text-gray-600 pt-3">{index + 1}</td>
                      <td className="p-2 relative">
                        {/* Custom Dropdown Trigger */}
                        <div 
                          className={`w-full border rounded-[3px] px-2 py-1.5 flex justify-between items-center cursor-pointer select-none
                            ${openDropdownId === row.id ? 'border-[#4338ca] bg-[#4F46E5] text-white shadow-[0_0_0_2px_rgba(79,70,229,0.25)]' : 'border-gray-300 bg-[#e0e7ff] text-gray-700'}
                          `}
                          onClick={() => {
                            if (openDropdownId === row.id) {
                              setOpenDropdownId(null);
                            } else {
                              setOpenDropdownId(row.id);
                              setSearchQuery('');
                            }
                          }}
                        >
                          <input
                            type="text"
                            value={openDropdownId === row.id ? searchQuery : (selectedBank ? selectedBank.name : '')}
                            placeholder="| Cash/Bank Name"
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (openDropdownId !== row.id) {
                                setOpenDropdownId(row.id);
                                setSearchQuery('');
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (!searchQuery.trim()) return;
                                const exactMatch = banks.find(b => b.name.toLowerCase() === searchQuery.trim().toLowerCase());
                                if (exactMatch) {
                                  handleUpdateRow(row.id, 'bankId', exactMatch.id);
                                } else {
                                  setIsBankMasterOpen(true);
                                  setOpenDropdownId(null);
                                }
                              }
                            }}
                            className={`w-full bg-transparent outline-none font-semibold text-[13px] ${openDropdownId === row.id ? 'text-white placeholder:text-gray-100' : 'text-gray-700 placeholder:text-gray-600'}`}
                          />
                          <ChevronDown className={`w-4 h-4 ${openDropdownId === row.id ? 'text-white' : 'text-gray-500'}`} />
                        </div>

                        {/* Custom Dropdown List */}
                        {openDropdownId === row.id && (
                          <div className="absolute top-[100%] left-2 right-2 mt-1 bg-white border border-gray-300 shadow-xl rounded-[3px] z-[120] max-h-[250px] overflow-y-auto">
                            {banks.filter(b => b.name.toLowerCase().includes(searchQuery.toLowerCase())).map(b => (
                              <div 
                                key={b.id} 
                                className="px-3 py-2 border-b border-gray-200 hover:bg-[#e0e7ff] cursor-pointer flex justify-between items-center transition-colors"
                                onClick={() => handleUpdateRow(row.id, 'bankId', b.id)}
                              >
                                <div className="flex flex-col">
                                  <span className="font-bold text-gray-800 text-[13px]">{b.name}</span>
                                  <span className={`text-[11px] font-bold ${getTypeColor(b.type)} uppercase`}>{b.type}</span>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <span className="text-[13px] text-gray-600 font-medium">
                                    {b.balance ? b.balance.toLocaleString('en-IN') : 0}
                                  </span>
                                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                      className="text-[#4F46E5] hover:text-[#4338ca]"
                                      onClick={(e) => handleEditBank(b, e)}
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button 
                                      className="text-red-500 hover:text-red-700"
                                      onClick={(e) => handleDeleteBank(b.id, e)}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div 
                              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 cursor-pointer flex justify-center items-center text-[#4F46E5] font-bold text-[13px] transition-colors"
                              onClick={() => {
                                setIsBankMasterOpen(true);
                                setOpenDropdownId(null);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-1" /> Create New Bank
                            </div>
                          </div>
                        )}

                        {row.isCheque && (
                          <div className="mt-2 flex gap-4 w-full">
                            <div className="flex-1">
                              <label className="text-[12px] font-bold text-gray-800 block mb-1">Cheque Number</label>
                              <input 
                                type="text" 
                                placeholder="Enter Cheque Number" 
                                value={row.chequeNo || ''}
                                onChange={(e) => handleUpdateRow(row.id, 'chequeNo', e.target.value)}
                                className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[12px] outline-none bg-white"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-[12px] font-bold text-gray-800 block mb-1">Cheque Date</label>
                              <input 
                                type="date" 
                                value={row.chequeDate || ''}
                                onChange={(e) => handleUpdateRow(row.id, 'chequeDate', e.target.value)}
                                className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[12px] outline-none bg-white"
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="p-2 pt-2">
                        <input
                          type="number"
                          value={row.amount}
                          onChange={(e) => handleUpdateRow(row.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-right font-bold text-gray-800 outline-none focus:border-[#4F46E5]"
                        />
                      </td>
                      <td className="p-2 pt-2 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1 select-none cursor-pointer" onClick={() => handleUpdateRow(row.id, 'isCheque', !row.isCheque)}>
                          <div className={`w-8 h-4 rounded-full relative transition-colors ${row.isCheque ? 'bg-blue-500' : 'bg-gray-300'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-[2px] transition-transform ${row.isCheque ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                          </div>
                          <span className="text-[11px] font-bold whitespace-nowrap uppercase">BY CHEQUE</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveRow(row.id)}
                          className="bg-[#c83742] hover:bg-[#b02a34] text-white p-1.5 rounded-[3px] transition-colors inline-flex items-center justify-center shadow-sm w-fit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {isSales && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[14px] font-bold text-gray-800">Sales Person</label>
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-bold text-gray-800">Commission :</span>
                  <input 
                    type="text"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                    className="w-[90px] border border-gray-300 rounded-[3px] px-1.5 py-0.5 text-[13px] text-right font-bold text-gray-800 outline-none bg-white shadow-sm"
                  />
                </div>
              </div>
              <div className="relative">
                <input 
                  list="sales-person-list"
                  type="text"
                  value={salesPerson}
                  onChange={(e) => setSalesPerson(e.target.value)}
                  placeholder="Select Sales Person"
                  className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-gray-700 bg-white shadow-sm pr-16"
                />
                {salesPerson && (
                  <X 
                    className="absolute right-7 top-[7px] w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" 
                    onClick={() => {
                      setSalesPerson('');
                      setCommission('0.00');
                    }} 
                  />
                )}
                <ChevronDown className="absolute right-2 top-[7px] w-4 h-4 text-gray-400 pointer-events-none" />
                <datalist id="sales-person-list">
                  {salesPersons.map(sp => (
                    <option key={sp.id} value={sp.name || sp.employeeName} />
                  ))}
                </datalist>
              </div>
            </div>
          )}


          <div className="flex justify-between items-center mt-4 pt-2">
            <button
              type="button"
              onClick={handleAddPaymentRow}
              className="text-[#4F46E5] hover:underline font-bold text-[13px]"
            >
              + Add Bank / Payment Mode Row
            </button>
            <button
              type="button"
              onClick={handleSavePayments}
              className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-6 py-1.5 rounded-[3px] font-bold text-[13px] shadow-md transition-colors"
            >
              Save
            </button>
          </div>

        </div>

      </div>

      <CashBankMasterModal 
        isOpen={isBankMasterOpen}
        onClose={() => setIsBankMasterOpen(false)}
        initialBookName={searchQuery}
        onSuccess={async (payload) => {
          try {
            const res = await apiClient.post('/banks', payload);
            if (res.data?.success) {
              setIsBankMasterOpen(false);
              fetchBanks();
            } else {
              alert("Failed to save bank.");
            }
          } catch (err) {
            console.error("Error creating bank:", err);
            alert(err.response?.data?.message || "Error creating bank.");
          }
        }}
      />
    </div>
  );
}
