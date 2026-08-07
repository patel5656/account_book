import React from 'react';
import { X } from 'lucide-react';

export function LoadingSheetModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[4px] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">
        
        {/* Modal Header */}
        <div className="bg-[#ffc107] px-4 py-3 flex items-center justify-between">
          <h3 className="text-gray-900 font-medium text-[16px]">Select Invoices for Loading Sheet</h3>
          <button onClick={onClose} className="text-[#dc3545] hover:text-red-700 transition-colors">
            <X className="w-7 h-7 font-bold" strokeWidth={4} />
          </button>
        </div>
        
        <div className="flex-1 flex flex-col p-4 overflow-hidden">
          {/* Actions row */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-[14px] text-gray-700">Select Invoices</span>
            <div className="flex flex-wrap items-center gap-2">
              <button className="border border-[#007bff] text-[#007bff] hover:bg-blue-50 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors">
                Select All
              </button>
              <button className="border border-gray-400 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors">
                Deselect All
              </button>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-bold text-gray-800">Filter by Salesman</label>
              <select className="min-w-0 border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] text-gray-500 outline-none w-full shadow-sm bg-white">
                <option>Select Salesman</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[14px] font-bold text-gray-800">Filter by Party Tags</label>
              <select className="min-w-0 border border-gray-300 rounded-[3px] px-3 py-2 text-[14px] text-gray-500 outline-none w-full shadow-sm bg-white">
                <option>Select Party Tags</option>
              </select>
            </div>
          </div>

          {/* Data Table */}
          <div className="flex-1 overflow-auto border border-gray-200">
            <div className="table-scroll w-full overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#343a40] text-white sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-[14px] font-bold w-[40px] border-r border-gray-600 whitespace-nowrap">#</th>
                    <th className="px-3 py-2 text-[14px] font-bold border-r border-gray-600 whitespace-nowrap">Invoice No</th>
                    <th className="px-3 py-2 text-[14px] font-bold border-r border-gray-600 whitespace-nowrap">Party Name</th>
                    <th className="px-3 py-2 text-[14px] font-bold border-r border-gray-600 whitespace-nowrap">Date</th>
                    <th className="px-3 py-2 text-[14px] font-bold whitespace-nowrap">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Empty table rows */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="bg-[#f8f9fa] border-t border-gray-200 px-4 py-3 flex justify-between items-center">
          <div className="text-[14px] text-gray-600">
            Selected: 0 of 0
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={onClose} 
              className="bg-[#6c757d] hover:bg-[#5a6268] text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button className="bg-[#28a745] hover:bg-[#218838] opacity-80 text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm">
              Send WhatsApp PDFs
            </button>
            <button className="bg-[#28a745] hover:bg-[#218838] opacity-80 text-white px-4 py-1.5 rounded-[3px] text-[14px] font-medium transition-colors shadow-sm">
              Generate Loading Sheet
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
