import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Edit, Trash2 } from 'lucide-react';
import { getDayBookSummary } from '../api/financial';
import apiClient from '../api/apiClient';

export function DayBookSummary() {
  const navigate = useNavigate();
  const [dateType, setDateType] = useState('Transaction Date');
  const [searchByVoucher, setSearchByVoucher] = useState(false);
  const [voucherType, setVoucherType] = useState('');
  const [withItems, setWithItems] = useState(false);
  const [dateFilter, setDateFilter] = useState('Today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let apiFromDate = '';
      let apiToDate = '';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'Today') {
        apiFromDate = today.toISOString().split('T')[0];
        apiToDate = apiFromDate;
      } else if (dateFilter === 'Yesterday') {
        const y = new Date(today);
        y.setDate(y.getDate() - 1);
        apiFromDate = y.toISOString().split('T')[0];
        apiToDate = apiFromDate;
      } else if (dateFilter === 'Last 7 Days') {
        const l7 = new Date(today);
        l7.setDate(l7.getDate() - 7);
        apiFromDate = l7.toISOString().split('T')[0];
        apiToDate = today.toISOString().split('T')[0];
      } else if (dateFilter === 'Last 30 Days') {
        const l30 = new Date(today);
        l30.setDate(l30.getDate() - 30);
        apiFromDate = l30.toISOString().split('T')[0];
        apiToDate = today.toISOString().split('T')[0];
      } else if (dateFilter === 'This Month') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        apiFromDate = firstDay.toISOString().split('T')[0];
        apiToDate = today.toISOString().split('T')[0];
      } else if (dateFilter === 'Last Month') {
        const firstDayLM = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLM = new Date(today.getFullYear(), today.getMonth(), 0);
        apiFromDate = firstDayLM.toISOString().split('T')[0];
        apiToDate = lastDayLM.toISOString().split('T')[0];
      } else if (dateFilter === 'Custom Range') {
        apiFromDate = startDate;
        apiToDate = endDate;
      }

      const response = await getDayBookSummary(dateType, apiFromDate, apiToDate, withItems, searchByVoucher ? voucherType : '');
      if (response.data && response.data.success) {
        setTransactions(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching day book summary:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [dateType, dateFilter, startDate, endDate, withItems, searchByVoucher, voucherType]);

  const handleEdit = (tx) => {
    const idParts = tx.id.split('_');
    const prefix = idParts[0];
    const dbId = idParts[1];

    if (prefix === 'inv') {
      if (tx.voucherType === 'SALES') {
        navigate(`/admin/sales-invoice?id=${dbId}`);
      } else if (tx.voucherType === 'PURCHASE') {
        navigate(`/admin/create_invoices/company_purchase?id=${dbId}`);
      } else if (tx.voucherType === 'SALES_RETURN') {
        navigate(`/admin/sales-return-invoice?id=${dbId}`);
      } else if (tx.voucherType === 'PURCHASE_RETURN') {
        navigate(`/admin/create_invoices/company_purchase_return?id=${dbId}`);
      }
    } else if (prefix === 'pay') {
      alert('Edit for payment/receipt is not fully implemented yet.');
    } else if (prefix === 'exp') {
      navigate(`/admin/expenses-ledger/expense_ledger?id=${dbId}`);
    } else if (tx.voucherType === 'ADJUSTMENT') {
      navigate(`/admin/stock-adjustment?id=${dbId}`);
    }
  };

  const handleDelete = async (tx) => {
    if (!window.confirm(`Are you sure you want to delete this ${tx.voucherType} transaction?`)) return;
    
    try {
      const idParts = tx.id.split('_');
      const prefix = idParts[0];
      const dbId = idParts[1];

      if (prefix === 'inv') {
        await apiClient.delete(`/inventory/${dbId}`);
      } else if (prefix === 'pay') {
        await apiClient.delete(`/payments/transactions/${dbId}`);
      } else if (prefix === 'exp') {
        await apiClient.delete(`/expenses/transactions/${dbId}`);
      }
      
      fetchTransactions();
    } catch (error) {
      console.error("Delete error:", error);
      alert('Failed to delete. Please try again.');
    }
  };

  const handleSearch = () => {
    fetchTransactions();
  };

  const totals = transactions.reduce((acc, curr) => {
    const isInvoice = ['SALES', 'PURCHASE', 'SALES_RETURN', 'PURCHASE_RETURN'].includes(curr.voucherType);
    const displayDebit = isInvoice ? (curr.debit || 0) + (curr.paymentIn || 0) + (curr.paymentOut || 0) : (curr.debit || 0);
    
    let displayPaymentIn = curr.paymentIn || 0;
    // POS bills are typically cash sales
    if (curr.voucherNo && curr.voucherNo.startsWith('POS-') && displayPaymentIn === 0) {
      displayPaymentIn = displayDebit;
    }

    acc.debit += displayDebit;
    acc.paymentIn += displayPaymentIn;
    acc.paymentOut += (curr.paymentOut || 0);
    acc.discount += (curr.discount || 0);
    return acc;
  }, { debit: 0, paymentIn: 0, paymentOut: 0, discount: 0 });

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  return (
    <div className="bg-white min-h-[calc(100vh-45px)] p-6 relative pb-16">
      
      {/* Title */}
      <h1 className="text-[22px] font-bold text-[#0d1c2f] text-center mb-6">
        DAY BOOK SUMMARY
      </h1>

      {/* Filter Section 1 */}
      <div className="mb-4">
        <div className="flex flex-wrap items-center gap-4 mb-2">
          <span className="text-[14px] font-bold text-gray-800">Date Type:</span>
          
          <div 
            className="flex flex-wrap items-center gap-1.5 cursor-pointer"
            onClick={() => setDateType('Transaction Date')}
          >
            <input type="radio" checked={dateType === 'Transaction Date'} readOnly className="w-4 h-4 text-blue-500 accent-blue-500" />
            <span className={`text-[14px] ${dateType === 'Transaction Date' ? 'font-bold text-[#007bff]' : 'text-gray-600'}`}>Transaction Date</span>
          </div>

          <div 
            className="flex flex-wrap items-center gap-1.5 cursor-pointer ml-2"
            onClick={() => setDateType('Modified Date')}
          >
            <input type="radio" checked={dateType === 'Modified Date'} readOnly className="w-4 h-4 text-blue-500 accent-blue-500" />
            <span className={`text-[14px] ${dateType === 'Modified Date' ? 'font-bold text-[#007bff]' : 'text-gray-600'}`}>Modified Date</span>
          </div>

          <div 
            className="flex flex-wrap items-center gap-2 ml-4 cursor-pointer select-none"
            onClick={() => setWithItems(!withItems)}
          >
            <div className={`w-[36px] h-[20px] rounded-full relative transition-colors ${withItems ? 'bg-blue-500' : 'bg-[#d6d8db]'}`}>
              <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${withItems ? 'right-[3px]' : 'left-[3px]'}`}></div>
            </div>
            <span className="text-[14px] font-bold text-gray-800">With Items</span>
          </div>
        </div>

        <p className="text-[12px] text-gray-500 mb-6">
          <span className="font-bold">Transaction Date:</span> Filter by the date when the transaction occurred. <span className="font-bold">Modified Date:</span> Filter by the date when the transaction was last updated.
        </p>
      </div>

      {/* Filter Section 2 */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-end">
        
        {/* Search by Voucher Type */}
        <div className="flex-1 max-w-[300px]">
          <div 
            className="flex flex-wrap items-center gap-2 mb-2 cursor-pointer select-none"
            onClick={() => setSearchByVoucher(!searchByVoucher)}
          >
            <div className={`w-[36px] h-[20px] rounded-full relative transition-colors ${searchByVoucher ? 'bg-blue-500' : 'bg-[#d6d8db]'}`}>
              <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${searchByVoucher ? 'right-[3px]' : 'left-[3px]'}`}></div>
            </div>
            <span className="text-[14px] font-bold text-gray-800">Search by Voucher Type :</span>
          </div>
          <select 
            value={voucherType}
            onChange={(e) => setVoucherType(e.target.value)}
            disabled={!searchByVoucher}
            className="w-full min-w-0 border border-gray-300 bg-gray-50 rounded-[3px] px-3 py-1.5 text-[14px] outline-none text-gray-700 disabled:opacity-50"
          >
            <option value="">All</option>
            <option value="SALES">Sales</option>
            <option value="PURCHASE">Purchase</option>
            <option value="PAYMENT">Payment</option>
            <option value="RECEIPT">Receipt</option>
            <option value="EXPENSE">Expense</option>
          </select>
        </div>

        {/* Filter: Transaction Date */}
        <div className="flex-1 max-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[14px] font-bold text-gray-800">{dateType === 'Transaction Date' ? 'Transaction Date' : 'Modified Date'} :</span>
          </div>
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full min-w-0 border border-gray-300 bg-white rounded-[3px] px-3 py-1.5 text-[14px] outline-none text-gray-800 font-medium"
          >
            <option>All Time</option>
            <option>Today</option>
            <option>Yesterday</option>
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
            <option>This Month</option>
            <option>Last Month</option>
            <option>Custom Range</option>
          </select>
        </div>

        {/* Custom Date Range Picker */}
        {dateFilter === 'Custom Range' && (
          <div className="flex gap-2 w-auto items-end animate-in fade-in zoom-in duration-200">
            <div className="w-[130px]">
              <label className="block text-[13px] font-bold text-gray-800 mb-1">From</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full min-w-0 border border-gray-300 bg-white rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-gray-800 font-medium"
              />
            </div>
            <div className="w-[130px]">
              <label className="block text-[13px] font-bold text-gray-800 mb-1">To</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full min-w-0 border border-gray-300 bg-white rounded-[3px] px-2 py-1.5 text-[13px] outline-none text-gray-800 font-medium"
              />
            </div>
          </div>
        )}

        {/* Search Button */}
        <div>
          <button onClick={handleSearch} className="bg-[#007bff] hover:bg-[#0069d9] text-white px-4 py-1.5 rounded-[3px] flex items-center gap-1.5 text-[14px] font-bold transition-colors shadow-sm">
            <Search className="w-4 h-4" strokeWidth={2.5} />
            Search
          </button>
        </div>

      </div>

      {/* Data Table */}
      <div className="border border-gray-200 rounded-sm">
        <div className="w-full">
          {/* Header */}
          <div className="grid grid-cols-[100px_160px_1fr_110px_90px_90px_90px_80px_80px] bg-white text-gray-800 border-b border-gray-200">
            <div className="border-r border-gray-200 py-2.5 px-2 text-[13px] font-bold text-center">Date</div>
            <div className="border-r border-gray-200 py-2.5 px-2 text-[13px] font-bold text-center">Voucher No</div>
            <div className="border-r border-gray-200 py-2.5 px-2 text-[13px] font-bold text-center">Particular</div>
            <div className="border-r border-gray-200 py-2.5 px-2 text-[13px] font-bold text-center">Voucher Type</div>
            <div className="border-r border-gray-200 py-2.5 px-2 text-[13px] font-bold text-center">Debit</div>
            <div className="border-r border-gray-200 py-2.5 px-2 text-[13px] font-bold text-center">Payment In</div>
            <div className="border-r border-gray-200 py-2.5 px-2 text-[13px] font-bold text-center">Payment Out</div>
            <div className="border-r border-gray-200 py-2.5 px-2 text-[13px] font-bold text-center">Discount</div>
            <div className="py-2.5 px-2 text-[13px] font-bold text-center">Action</div>
          </div>

          {/* Table Body */}
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="bg-white border-b border-gray-200 h-[38px] text-center py-2 text-sm text-gray-500">
              No transactions found
            </div>
          ) : (
            transactions.map((tx) => {
              const isInvoice = ['SALES', 'PURCHASE', 'SALES_RETURN', 'PURCHASE_RETURN'].includes(tx.voucherType);
              const displayDebit = isInvoice ? (tx.debit || 0) + (tx.paymentIn || 0) + (tx.paymentOut || 0) : (tx.debit || 0);
              
              let displayPaymentIn = tx.paymentIn || 0;
              if (tx.voucherNo && tx.voucherNo.startsWith('POS-') && displayPaymentIn === 0) {
                displayPaymentIn = displayDebit;
              }

              return (
              <React.Fragment key={tx.id}>
                <div className="grid grid-cols-[100px_160px_1fr_110px_90px_90px_90px_80px_80px] bg-white border-b border-gray-200 items-center">
                  <div className="border-r border-gray-200 py-2 px-2 flex flex-col items-center justify-center text-center">
                    <span className="text-[13px] text-gray-800">{formatDate(tx.date)}</span>
                    <span className="text-[10px] text-gray-600 mt-0.5 whitespace-nowrap">({tx.userName || 'ADMIN'})</span>
                  </div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-center break-all">{tx.voucherNo}</div>
                  <div className="border-r border-gray-200 py-2 px-2 flex flex-col items-center justify-center text-center">
                    <span className="text-[13px] text-gray-800">{tx.particular || '-'}</span>
                    {tx.voucherType === 'SALES' || tx.voucherType === 'RECEIPT' || displayPaymentIn > 0 ? (
                      <span className="text-[#28a745] text-[12px] mt-0.5 font-medium tracking-tight">In: {tx.paymentMode || 'Cash Account'}</span>
                    ) : tx.voucherType === 'PURCHASE' || tx.voucherType === 'PAYMENT' || tx.paymentOut > 0 ? (
                      <span className="text-[#dc3545] text-[12px] mt-0.5 font-medium tracking-tight">Out: {tx.paymentMode || 'Cash Account'}</span>
                    ) : null}
                  </div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-center text-gray-700">{tx.voucherType === 'SALES' ? 'Sale' : tx.voucherType === 'PURCHASE' ? 'Purchase' : tx.voucherType}</div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-center text-gray-800">{displayDebit ? displayDebit.toLocaleString() : '0'}</div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-center text-gray-800">{displayPaymentIn ? displayPaymentIn.toLocaleString() : '0'}</div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-center text-gray-800">{tx.paymentOut ? tx.paymentOut.toLocaleString() : '0'}</div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-center text-gray-800">{tx.discount ? tx.discount.toLocaleString() : '0'}</div>
                  <div className="py-2 px-2 flex justify-center items-center gap-1.5">
                    <button onClick={() => handleEdit(tx)} className="bg-[#17a2b8] hover:bg-[#138496] text-white p-[3px] rounded-[3px] transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(tx)} className="bg-[#dc3545] hover:bg-[#c82333] text-white p-[3px] rounded-[3px] transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {/* Render items if withItems is true and tx has items */}
                {withItems && tx.items && tx.items.length > 0 && (
                  <div className="bg-gray-50 border-b border-gray-200 px-8 py-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500 text-left">
                          <th className="font-medium pb-1">Item</th>
                          <th className="font-medium pb-1">P.Qty</th>
                          <th className="font-medium pb-1">S.Qty</th>
                          <th className="font-medium pb-1">Price</th>
                          <th className="font-medium pb-1">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tx.items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-1 text-gray-700">{item.product ? item.product.name : 'Unknown Product'}</td>
                            <td className="py-1 text-gray-700">{item.quantity || 0}</td>
                            <td className="py-1 text-gray-700">{item.freeQty || 0}</td>
                            <td className="py-1 text-gray-700">{item.price.toFixed(2)}</td>
                            <td className="py-1 text-gray-700">{item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </React.Fragment>
              );
            })
          )}

          {/* Total Row */}
          <div className="grid grid-cols-[100px_160px_1fr_110px_90px_90px_90px_80px_80px] bg-gray-50">
            <div className="border-r border-gray-200 py-2 px-2"></div>
            <div className="border-r border-gray-200 py-2 px-2"></div>
            <div className="border-r border-gray-200 py-2 px-2"></div>
            <div className="border-r border-gray-200 py-2 px-2 text-[13px] font-bold text-center">TOTAL</div>
            <div className="border-r border-gray-200 py-2 px-2 text-[13px] font-bold text-center text-gray-800">{totals.debit > 0 ? totals.debit.toLocaleString() : '0'}</div>
            <div className="border-r border-gray-200 py-2 px-2 text-[13px] font-bold text-center text-gray-800">{totals.paymentIn > 0 ? totals.paymentIn.toLocaleString() : '0'}</div>
            <div className="border-r border-gray-200 py-2 px-2 text-[13px] font-bold text-center text-gray-800">{totals.paymentOut > 0 ? totals.paymentOut.toLocaleString() : '0'}</div>
            <div className="border-r border-gray-200 py-2 px-2 text-[13px] font-bold text-center text-gray-800">{totals.discount > 0 ? totals.discount.toLocaleString() : '0'}</div>
            <div className="py-2 px-2"></div>
          </div>
        </div>
      </div>

      {/* Bottom Go Back Button */}
      <div className="pt-4 flex justify-end">
        <button 
          onClick={() => navigate(-1)}
          className="bg-[#007bff] hover:bg-[#0069d9] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1 shadow-sm transition-colors"
        >
          <span className="text-[16px] leading-none mt-[-2px]">&laquo;</span> Go back
        </button>
      </div>

    </div>
  );
}
