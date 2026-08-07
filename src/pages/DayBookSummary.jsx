import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getDayBookSummary } from '../api/financial';

export function DayBookSummary() {
  const navigate = useNavigate();
  const [dateType, setDateType] = useState('Transaction Date');
  const [searchByVoucher, setSearchByVoucher] = useState(false);
  const [voucherType, setVoucherType] = useState('');
  const [withItems, setWithItems] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await getDayBookSummary(dateType, selectedDate, withItems, searchByVoucher ? voucherType : '');
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
  }, [dateType, selectedDate, withItems]);

  const handleSearch = () => {
    fetchTransactions();
  };

  const totals = transactions.reduce((acc, curr) => {
    acc.debit += (curr.debit || 0);
    acc.paymentIn += (curr.paymentIn || 0);
    acc.paymentOut += (curr.paymentOut || 0);
    acc.discount += (curr.discount || 0);
    return acc;
  }, { debit: 0, paymentIn: 0, paymentOut: 0, discount: 0 });

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

        {/* Transaction Date */}
        <div className="flex-1 max-w-[300px]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[14px] font-bold text-gray-800">Transaction Date :</span>
            <span className="text-[13px] font-bold text-[#4F46E5]">({new Date(selectedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')})</span>
          </div>
          <input 
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full min-w-0 border border-gray-300 bg-white rounded-[3px] px-3 py-1.5 text-[14px] outline-none text-gray-800 font-medium"
          />
        </div>

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
          <div className="grid grid-cols-[80px_100px_1fr_120px_100px_100px_100px_80px_80px] bg-white text-gray-800 border-b border-gray-200">
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
            transactions.map((tx) => (
              <React.Fragment key={tx.id}>
                <div className="grid grid-cols-[80px_100px_1fr_120px_100px_100px_100px_80px_80px] bg-white border-b border-gray-200">
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-center">{new Date(tx.date).toLocaleDateString('en-GB')}</div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-center">{tx.voucherNo}</div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px]">{tx.particular}</div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-center">{tx.voucherType}</div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-right font-medium">{tx.debit ? tx.debit.toFixed(2) : ''}</div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-right font-medium text-green-600">{tx.paymentIn ? tx.paymentIn.toFixed(2) : ''}</div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-right font-medium text-red-600">{tx.paymentOut ? tx.paymentOut.toFixed(2) : ''}</div>
                  <div className="border-r border-gray-200 py-2 px-2 text-[13px] text-right font-medium text-blue-600">{tx.discount ? tx.discount.toFixed(2) : ''}</div>
                  <div className="py-2 px-2 text-[13px] text-center">
                    {/* Action button */}
                  </div>
                </div>
                {/* Render items if withItems is true and tx has items */}
                {withItems && tx.items && tx.items.length > 0 && (
                  <div className="bg-gray-50 border-b border-gray-200 px-8 py-2">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500 text-left">
                          <th className="font-medium pb-1">Item</th>
                          <th className="font-medium pb-1">Qty</th>
                          <th className="font-medium pb-1">Price</th>
                          <th className="font-medium pb-1">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tx.items.map((item, i) => (
                          <tr key={i}>
                            <td className="py-1 text-gray-700">{item.product ? item.product.name : 'Unknown Product'}</td>
                            <td className="py-1 text-gray-700">{item.quantity}</td>
                            <td className="py-1 text-gray-700">{item.price.toFixed(2)}</td>
                            <td className="py-1 text-gray-700">{item.amount.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </React.Fragment>
            ))
          )}

          {/* Total Row */}
          <div className="grid grid-cols-[80px_100px_1fr_120px_100px_100px_100px_80px_80px] bg-gray-50">
            <div className="border-r border-gray-200 py-2 px-2"></div>
            <div className="border-r border-gray-200 py-2 px-2"></div>
            <div className="border-r border-gray-200 py-2 px-2"></div>
            <div className="border-r border-gray-200 py-2 px-2 text-[13px] font-bold text-center">TOTAL</div>
            <div className="border-r border-gray-200 py-2 px-2 text-[13px] font-bold text-right text-gray-800">{totals.debit > 0 ? totals.debit.toFixed(2) : 0}</div>
            <div className="border-r border-gray-200 py-2 px-2 text-[13px] font-bold text-right text-green-600">{totals.paymentIn > 0 ? totals.paymentIn.toFixed(2) : 0}</div>
            <div className="border-r border-gray-200 py-2 px-2 text-[13px] font-bold text-right text-red-600">{totals.paymentOut > 0 ? totals.paymentOut.toFixed(2) : 0}</div>
            <div className="border-r border-gray-200 py-2 px-2 text-[13px] font-bold text-right text-blue-600">{totals.discount > 0 ? totals.discount.toFixed(2) : 0}</div>
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
