import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { 
  X, 
  Search, 
  Calendar, 
  RefreshCw,
  PlusSquare,
  Edit,
  Check,
  Printer,
  ChevronDown,
  PlusCircle,
  Grip,
  SlidersHorizontal
} from 'lucide-react';

// Inline Youtube SVG to avoid lucide-react export issues
const YoutubeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M21.582,6.186c-0.23-0.86-0.908-1.538-1.768-1.768C18.254,4,12,4,12,4S5.746,4,4.186,4.418 c-0.86,0.23-1.538,0.908-1.768,1.768C2,7.746,2,12,2,12s0,4.254,0.418,5.814c0.23,0.86,0.908,1.538,1.768,1.768 C5.746,20,12,20,12,20s6.254,0,7.814-0.418c0.861-0.23,1.538-0.908,1.768-1.768C22,16.254,22,12,22,12S22,7.746,21.582,6.186z M10,15.464V8.536L16,12L10,15.464z" />
  </svg>
);

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

export function StockAdjustmentForm() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([
    { productId: '', name: '', currentStock: 0, actualQuantity: 0, price: 0 }
  ]);
  const [invoiceNo, setInvoiceNo] = useState(`ADJ-${new Date().getTime()}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [remark, setRemark] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await apiClient.get('/products');
        if (res.data?.success) {
          setProducts(res.data.data.filter(p => p.status === 'Active' || p.status === 'ACTIVE'));
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    };
    fetchProducts();
  }, []);

  const handleProductChange = (index, productId) => {
    const product = products.find(p => p.id === parseInt(productId, 10));
    if (product) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        productId: product.id,
        name: product.name,
        currentStock: product.stock,
        actualQuantity: product.stock, // Initially no change
        price: product.purchasePrice || product.price || 0
      };
      
      // Add a new empty row if this was the last row
      if (index === items.length - 1) {
        newItems.push({ productId: '', name: '', currentStock: 0, actualQuantity: 0, price: 0 });
      }
      setItems(newItems);
    }
  };

  const handleActualQtyChange = (index, val) => {
    const newItems = [...items];
    newItems[index].actualQuantity = val === '' ? '' : Number(val);
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    if (newItems.length === 0) {
      newItems.push({ productId: '', name: '', currentStock: 0, actualQuantity: 0, price: 0 });
    }
    setItems(newItems);
  };

  const calculateRowAmount = (item) => {
    if (!item.productId) return 0;
    const diff = Number(item.actualQuantity || 0) - Number(item.currentStock || 0);
    return diff * Number(item.price || 0);
  };

  const summary = items.reduce((acc, item) => {
    if (!item.productId) return acc;
    const diff = Number(item.actualQuantity || 0) - Number(item.currentStock || 0);
    const amt = diff * Number(item.price || 0);
    if (diff > 0) {
      acc.increaseQty += diff;
      acc.increaseAmt += amt;
    } else if (diff < 0) {
      acc.decreaseQty += Math.abs(diff);
      acc.decreaseAmt += Math.abs(amt);
    }
    return acc;
  }, { increaseQty: 0, increaseAmt: 0, decreaseQty: 0, decreaseAmt: 0 });

  const totalItemsCount = items.filter(i => i.productId && (Number(i.actualQuantity || 0) !== Number(i.currentStock || 0))).length;
  const netProfit = summary.increaseAmt - summary.decreaseAmt;

  const handleSave = async () => {
    const validItems = items.filter(i => i.productId && (Number(i.actualQuantity || 0) !== Number(i.currentStock || 0)));
    
    if (validItems.length === 0) {
      alert("No stock changes to save.");
      return;
    }

    const payload = {
      invoiceNo,
      date,
      remark,
      totalAmount: netProfit,
      items: validItems.map(item => {
        const diff = Number(item.actualQuantity || 0) - Number(item.currentStock || 0);
        return {
          productId: item.productId,
          quantity: diff, // Negative for decrease, positive for increase
          price: item.price,
          amount: diff * item.price
        };
      })
    };

    try {
      const res = await apiClient.post('/inventory/ADJUSTMENT', payload);
      if (res.data) {
        alert("Stock adjustment saved successfully!");
        setItems([{ productId: '', name: '', currentStock: 0, actualQuantity: 0, price: 0 }]);
        setInvoiceNo(`ADJ-${new Date().getTime()}`);
        setRemark('');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to save stock adjustment");
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col relative pb-12">
      <div className="bg-white m-3 mt-0 shadow-sm border border-gray-200 flex-1 flex flex-col">
        
        {/* Top Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between px-3 py-1.5">
          <h2 className="text-white font-medium text-[15px]">Stock Adjustment</h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <button className="bg-white p-1 rounded-sm shadow-sm">
              <YoutubeIcon className="w-4 h-4 text-[#ff0000]" />
            </button>
            <button className="bg-[#ffc107] p-1 rounded-sm shadow-sm">
              <RefreshCw className="w-4 h-4 text-white" strokeWidth={3} />
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] p-1 rounded-sm shadow-sm hover:bg-[#c82333] transition-colors"
            >
              <X className="w-4 h-4 text-white font-bold" strokeWidth={4} />
            </button>
          </div>
        </div>

        {/* Top Form Controls */}
        <div className="p-3 border-b border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
             <div className="bg-[#e8f4fd] p-2 rounded-full mt-1">
               <SlidersHorizontal className="w-5 h-5 text-[#007bff]" />
             </div>
             <div className="flex flex-col">
               <h3 className="text-[#007bff] font-bold text-[16px]">Stock Adjustment</h3>
               <p className="text-[11px] text-gray-500 font-medium">Increase or decrease stock as per physical verification to match actual inventory.</p>
             </div>
          </div>
          
          <div className="flex flex-col items-end justify-center gap-3">
             <div className="flex items-center justify-end w-full sm:max-w-[320px]">
               <label className="text-[13px] font-bold text-gray-800 w-[80px] text-right mr-2">Invoice No :</label>
               <div className="flex-1 flex items-center">
                 <input 
                   type="text" 
                   value={invoiceNo}
                   onChange={(e) => setInvoiceNo(e.target.value)}
                   className="w-full min-w-0 border border-gray-300 border-r-0 rounded-l-[3px] px-3 py-1 text-[13px] bg-white text-gray-600 outline-none focus:border-[#4F46E5]"
                 />
                 <button className="bg-[#4F46E5] text-white px-3 py-1 border border-[#4F46E5] rounded-r-[3px]">
                   <Search className="w-4 h-4" />
                 </button>
               </div>
             </div>
             <div className="flex items-center justify-end w-full sm:max-w-[320px]">
               <label className="text-[13px] font-bold text-gray-800 w-[80px] text-right mr-2">Date :</label>
               <div className="flex-1 flex items-center">
                 <input 
                   type="date"
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                   className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1 text-[13px] bg-white text-gray-600 outline-none"
                 />
               </div>
             </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 min-h-[300px]">
          <div className="w-full">
            {/* Table Header */}
            <div className="bg-[#343a40] text-white grid grid-cols-[50px_1fr_120px_150px_120px_120px_80px] text-center border-b border-gray-600">
              <div className="border-r border-gray-600 py-2 text-[12px] font-bold leading-tight flex flex-col justify-center">
                S.NO.<br/>#
              </div>
              <div className="border-r border-gray-600 py-2 text-[12px] font-bold flex items-center justify-center uppercase">
                Product Name
              </div>
              <div className="border-r border-gray-600 py-2 text-[12px] font-bold flex items-center justify-center uppercase">
                Current Stock
              </div>
              <div className="border-r border-gray-600 py-2 text-[12px] font-bold flex items-center justify-center uppercase">
                Actual Quantity
              </div>
              <div className="border-r border-gray-600 py-2 text-[12px] font-bold flex flex-col justify-center leading-tight uppercase">
                <span className="font-normal text-[10px]">(Tax Included)</span>
                <div className="flex items-center justify-center gap-1 mt-0.5">
                  <div className="w-[20px] h-[10px] bg-[#117a8b] rounded-full relative">
                    <div className="w-[8px] h-[8px] bg-white rounded-full absolute top-[1px] left-[1px]"></div>
                  </div>
                  Price
                </div>
              </div>
              <div className="border-r border-gray-600 py-2 text-[12px] font-bold flex items-center justify-center uppercase">
                Amount
              </div>
              <div className="py-2 text-[12px] font-bold flex items-center justify-center uppercase">
                Action
              </div>
            </div>

            {/* Dynamic Input Rows */}
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-[50px_1fr_120px_150px_120px_120px_80px] bg-white border-b border-gray-200">
                <div className="border-r border-gray-200 flex items-center justify-center p-1 bg-gray-100 text-[12px] font-bold">
                  {index + 1}
                </div>
                <div className="border-r border-gray-200 p-1 flex">
                  <select 
                    value={item.productId}
                    onChange={(e) => handleProductChange(index, e.target.value)}
                    className="w-full px-2 py-1 text-[13px] outline-none border border-gray-300 rounded-[3px] bg-white"
                  >
                    <option value="">Select Product...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                    ))}
                  </select>
                </div>
                <div className="border-r border-gray-200 p-1 flex items-center justify-center text-[13px] text-gray-700 bg-[#f8f9fa] font-medium">
                  {item.currentStock}
                </div>
                <div className="border-r border-gray-200 p-1 flex">
                   <input 
                     type="number" 
                     value={item.actualQuantity}
                     onChange={(e) => handleActualQtyChange(index, e.target.value)}
                     disabled={!item.productId}
                     className="w-full border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-center disabled:bg-gray-100" 
                   />
                </div>
                <div className="border-r border-gray-200 p-1">
                  <input 
                    type="number" 
                    value={item.price}
                    onChange={(e) => {
                      const newItems = [...items];
                      newItems[index].price = e.target.value;
                      setItems(newItems);
                    }}
                    disabled={!item.productId}
                    className="w-full h-full border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-right disabled:bg-gray-100" 
                  />
                </div>
                <div className={`border-r border-gray-200 p-1 flex items-center justify-center text-[13px] font-bold ${calculateRowAmount(item) > 0 ? 'text-[#28a745]' : calculateRowAmount(item) < 0 ? 'text-[#dc3545]' : 'text-gray-500'}`}>
                  {calculateRowAmount(item).toFixed(2)}
                </div>
                <div className="bg-[#f8f9fa] flex items-center justify-center gap-2 p-1">
                  <button onClick={() => removeItem(index)} className="text-[#dc3545] hover:text-red-600 bg-red-50 p-1.5 rounded-[3px]">
                    <X className="w-4 h-4" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            ))}
            
          </div>
        </div>

        {/* Calculations Area */}
        <div className="bg-white border-t border-gray-200 p-4 grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">
          {/* Left Side (Totals, Remark, Terms) */}
          <div className="flex flex-col gap-4">
            
            <div className="flex flex-wrap items-center gap-2 text-[14px] font-bold text-gray-800">
              Total Items (Changed) : <span className="text-[#007bff]">{totalItemsCount}</span>
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-800 mb-1">Remark</label>
              <textarea 
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Remark..." 
                className="w-full min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] focus:outline-none focus:border-[#4F46E5] resize-none h-[40px] text-gray-800"
              />
            </div>

            <div className="flex flex-col text-[13px]">
               <div className="flex flex-wrap items-center gap-1 mb-1 text-gray-500 text-[15px]">
                 Terms <PlusCircle className="w-4 h-4 text-[#4F46E5] cursor-pointer" />
               </div>
               <span className="font-bold text-gray-600">1.Goods once sold will not be taken back or exchanged</span>
            </div>

          </div>

          {/* Right Side (Summary Calculations) */}
          <div className="flex flex-col">
             <div className="table-scroll w-full overflow-x-auto">
            <table className="w-full text-sm">
                <thead>
                   <tr className="border-b-2 border-gray-300">
                     <th className="text-left font-bold text-gray-700 py-1 whitespace-nowrap">Summary</th>
                     <th className="text-right font-bold text-gray-700 py-1 whitespace-nowrap">Qty</th>
                     <th className="text-right font-bold text-gray-700 py-1 whitespace-nowrap">Amount</th>
                   </tr>
                </thead>
                <tbody>
                   <tr className="border-b border-gray-200">
                     <td className="py-2 font-bold text-[#28a745]">Increase</td>
                     <td className="py-2 text-right font-bold text-gray-800">{summary.increaseQty}</td>
                     <td className="py-2 text-right font-bold text-gray-800">{summary.increaseAmt.toFixed(2)}</td>
                   </tr>
                   <tr className="border-b border-gray-200">
                     <td className="py-2 font-bold text-[#dc3545]">Decrease</td>
                     <td className="py-2 text-right font-bold text-gray-800">{summary.decreaseQty}</td>
                     <td className="py-2 text-right font-bold text-gray-800">{summary.decreaseAmt.toFixed(2)}</td>
                   </tr>
                   <tr>
                     <td className="py-2 font-bold text-[#28a745] flex items-center gap-1"><span className="w-3 h-[2px] bg-[#28a745]"></span> Net Profit / Loss</td>
                     <td className="py-2 text-right font-bold text-[#28a745]"></td>
                     <td className={`py-2 text-right font-bold ${netProfit >= 0 ? 'text-[#28a745]' : 'text-[#dc3545]'}`}>{netProfit.toFixed(2)}</td>
                   </tr>
                </tbody>
             </table>
          </div>
          </div>

        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 md:left-[220px] right-0 bg-[#343a40] z-40 px-4 py-2 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="flex flex-wrap items-center gap-1 text-[12px] font-bold">
          <span className="text-white">Net Value Change:</span>
          <span className={netProfit >= 0 ? "text-[#28a745]" : "text-[#dc3545]"}>{netProfit.toFixed(2)}</span>
        </div>
        
        <div className="flex items-center justify-center gap-1.5 flex-1 max-w-[400px] mx-auto">
          <button onClick={handleSave} className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] transition-colors">
            <Check className="w-4 h-4" strokeWidth={3} />
            Save
          </button>
          
          <button className="flex items-center gap-1 bg-[#4F46E5] hover:bg-[#4338ca] text-white px-3 py-1.5 rounded-[3px] text-[13px] transition-colors">
            <Printer className="w-4 h-4" strokeWidth={3} />
            Print
          </button>

          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 bg-[#dc3545] hover:bg-[#c82333] text-white px-3 py-1.5 rounded-[3px] text-[13px] transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={3} />
            Close
          </button>
        </div>

        <button className="flex items-center gap-2 bg-[#23272b] hover:bg-[#1d2124] text-white px-3 py-1.5 rounded-[3px] text-[12px] border border-gray-600 transition-colors invisible sm:visible">
          <Grip className="w-4 h-4" />
          Shortcut keys
          <ChevronDown className="w-3.5 h-3.5 ml-1" strokeWidth={3} />
        </button>
      </div>

    </div>
  );
}
