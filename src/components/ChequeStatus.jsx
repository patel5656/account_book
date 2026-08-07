import React, { useState } from 'react';
import { PieChart, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../utils';

export function ChequeStatus() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Pending');

  return (
    <div className="bg-white rounded shadow-sm border border-gray-200 mt-4 overflow-hidden mb-6">
      {/* Header */}
      <div 
        className="flex items-center p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex flex-wrap items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-400" />
          )}
          <PieChart className="w-[18px] h-[18px] text-gray-700" />
          <h3 className="text-[15px] font-medium text-gray-800 select-none">
            Cheque Status <span className="text-gray-500 font-normal text-sm">(Last 30 Days)</span>
          </h3>
        </div>
      </div>

      {/* Collapsible Content */}
      <div className={cn("transition-all duration-300", isOpen ? "block" : "hidden")}>
        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 px-4 pb-3 text-[13px]">
          <button 
            className={activeTab === 'Pending' ? "bg-[#007bff] text-white px-3 py-1 rounded-sm transition-colors" : "text-gray-600 hover:text-gray-900 px-2 py-1 transition-colors"}
            onClick={(e) => { e.stopPropagation(); setActiveTab('Pending'); }}
          >
            Pending
          </button>
          <button 
            className={activeTab === 'Return' ? "bg-[#007bff] text-white px-3 py-1 rounded-sm transition-colors" : "text-gray-600 hover:text-gray-900 px-2 py-1 transition-colors"}
            onClick={(e) => { e.stopPropagation(); setActiveTab('Return'); }}
          >
            Return
          </button>
          <button 
            className={activeTab === 'Clear' ? "bg-[#007bff] text-white px-3 py-1 rounded-sm transition-colors" : "text-gray-600 hover:text-gray-900 px-2 py-1 transition-colors"}
            onClick={(e) => { e.stopPropagation(); setActiveTab('Clear'); }}
          >
            Clear
          </button>
        </div>
        {/* Table Header */}
      <div className="border-y border-gray-200 bg-white grid grid-cols-5 text-center py-2.5">
        <div className="font-bold text-[13px] text-gray-800">Cheque Date</div>
        <div className="font-bold text-[13px] text-gray-800">Other Information</div>
        <div className="font-bold text-[13px] text-gray-800">Cheque In</div>
        <div className="font-bold text-[13px] text-gray-800">Cheque Out</div>
        <div className="font-bold text-[13px] text-gray-800">Action</div>
      </div>

      {/* Empty State Body */}
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <h4 className="text-[15px] font-bold text-gray-800 mb-2">No cheque have been received or given</h4>
        <p className="text-[13px] text-gray-600 mb-8 max-w-md">
          Whenever you receive or make a payment with a cheque, you will find all the information about it here.
        </p>
        
        {/* Placeholder Graphic */}
        <div className="bg-[#2d3238] rounded-md w-[120px] h-[70px] relative flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-white"></div>
          {/* Corner dots */}
          <div className="absolute top-1 left-1 w-0 h-0 border-t-[8px] border-t-white border-r-[8px] border-r-transparent rounded-tl-sm opacity-20"></div>
          <div className="absolute top-1 right-1 w-0 h-0 border-t-[8px] border-t-white border-l-[8px] border-l-transparent rounded-tr-sm opacity-20"></div>
          <div className="absolute bottom-1 left-1 w-0 h-0 border-b-[8px] border-b-white border-r-[8px] border-r-transparent rounded-bl-sm opacity-20"></div>
          <div className="absolute bottom-1 right-1 w-0 h-0 border-b-[8px] border-b-white border-l-[8px] border-l-transparent rounded-br-sm opacity-20"></div>
        </div>
      </div>
      </div>
    </div>
  );
}
