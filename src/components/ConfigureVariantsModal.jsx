import React from 'react';
import { X } from 'lucide-react';

export function ConfigureVariantsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 z-[80] transition-opacity" 
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[#2a2f35] rounded-md shadow-2xl z-[90] flex flex-col border border-gray-700">
        
        <div className="flex justify-between items-center p-3 border-b border-gray-700 bg-[#1f2328] rounded-t-md">
          <h2 className="text-white font-bold text-sm">Configure Variants</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-4 text-gray-300 text-sm">
          <p>Variant configuration options will be implemented here.</p>
        </div>
        
        <div className="p-3 border-t border-gray-700 flex justify-end gap-2 bg-[#1f2328] rounded-b-md">
          <button 
            onClick={onClose}
            className="bg-[#198754] hover:bg-[#157347] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
          >
            Save
          </button>
          <button 
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
