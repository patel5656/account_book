import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Printer } from 'lucide-react';
import fetchOrders from '../api/orders';
import Pagination from '../components/Pagination';

export function OrderList() {
  const navigate = useNavigate();

  // State for orders and UI controls
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // Fetch orders on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchOrders();
        setOrders(data);
      } catch (e) {
        console.error('Failed to load orders', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Extract unique categories
  const uniqueCategories = [...new Set(orders.map(o => o.category).filter(Boolean))];

  // Filter orders based on category & search
  const filtered = orders.filter(o => {
    const matchesSearch = o.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All Categories' || o.category === category;
    return matchesSearch && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
  const startIdx = (currentPage - 1) * rowsPerPage;
  const paginated = filtered.slice(startIdx, startIdx + rowsPerPage);

  // Compute total amount of visible rows
  const totalAmount = filtered.reduce((sum, o) => sum + (o.amount || 0), 0);

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] p-3 flex flex-col relative pb-[70px]">
      <div className="bg-white rounded shadow-sm border border-gray-200 w-full overflow-hidden flex-1 p-4">
        
        {/* Title */}
        <div className="text-center mb-4 border border-gray-200 py-3 rounded-sm">
          <h2 className="text-[20px] font-normal text-gray-800">Order List</h2>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-4 max-w-[800px]">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-1/3 h-[34px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-600 bg-white"
              >
                <option value="All Categories">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search by Product Name"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-2/3 h-[34px] border border-gray-300 rounded-[3px] px-3 text-[13px] outline-none text-gray-800 placeholder-gray-400"
              />
        </div>

        {/* Data Table */}
        <div className="">
            <div className="w-full">
              <div className="table-scroll w-full overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 bg-white shadow-sm">
                  <thead className="bg-[#f0f4f8]">
                    <tr>
                      <th className="border border-gray-200 text-[13px] font-bold text-gray-900 py-2 px-2 w-[60px] text-center whitespace-nowrap">S.No.</th>
                      <th className="border border-gray-200 text-[13px] font-bold text-gray-900 py-2 px-2 text-center whitespace-nowrap">Product Description</th>
                      <th className="border border-gray-200 text-[13px] font-bold text-gray-900 py-2 px-2 w-[150px] text-center whitespace-nowrap">Order Quantity</th>
                      <th className="border border-gray-200 text-[13px] font-bold text-gray-900 py-2 px-2 w-[180px] text-center whitespace-nowrap">Last Purchase Price</th>
                      <th className="border border-gray-200 text-[13px] font-bold text-gray-900 py-2 px-2 w-[150px] text-center whitespace-nowrap">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="py-4 text-center text-gray-600">Loading...</td>
                      </tr>
                    ) : (
                      paginated.map((order, idx) => (
                        <tr key={order.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100 transition-colors'}>
                          <td className="border border-gray-200 py-2 px-2 text-center">{startIdx + idx + 1}</td>
                          <td className="border border-gray-200 py-2 px-2">{order.description}</td>
                          <td className="border border-gray-200 py-2 px-2 text-center">{order.quantity}</td>
                          <td className="border border-gray-200 py-2 px-2 text-center">{order.price}</td>
                          <td className="border border-gray-200 py-2 px-2 text-center">{order.amount}</td>
                        </tr>
                      ))
                    )}
                    {/* Total Row */}
                    <tr className="bg-[#f9fafb]">
                      <td className="border border-gray-200 py-2 px-2"></td>
                      <td className="border border-gray-200 py-2 px-2"></td>
                      <td className="border border-gray-200 py-2 px-2"></td>
                      <td className="border border-gray-200 py-2 px-2 text-center font-bold">Total :</td>
                      <td className="border border-gray-200 py-2 px-2 text-center font-bold">{totalAmount}</td>
                    </tr>
                  </tbody>
                </table>
                {/* Pagination */}
                <div className="flex justify-center mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </div>
            </div>
          </div>

      </div>

      {/* Footer Buttons */}
        <div className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-2 sm:p-3 flex gap-3 footer-btns z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <button
          onClick={() => window.print()}
          className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 text-[13px] font-bold px-4 py-1.5 rounded-[3px] flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" strokeWidth={2.5} /> Print
        </button>
        <button
          onClick={() => navigate(-1)}
          className="bg-[#007bff] hover:bg-[#0069d9] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center justify-center gap-1 shadow-sm transition-colors"
        >
          <span className="text-[16px] leading-none mt-[-2px]">&laquo;</span> Go back
        </button>
        <button
          onClick={() => {
            const csvContent = ['S.No.,Description,Quantity,Price,Amount', ...filtered.map((o, i) => `${i+1},${o.description},${o.quantity},${o.price},${o.amount}`)].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url; link.setAttribute('download', 'orders.csv');
            document.body.appendChild(link); link.click(); document.body.removeChild(link);
          }}
          className="bg-[#28a745] hover:bg-[#218838] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] flex items-center gap-1 shadow-sm transition-colors"
        >
          Export CSV
        </button>
      </div>

    </div>
  );
}
