import React, { useState } from 'react';
import { X, PauseCircle, Check } from 'lucide-react';

export function HoldInvoiceModal({ isOpen, onClose, onConfirm }) {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[4px] shadow-2xl w-full sm:max-w-[400px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#6c757d] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PauseCircle className="w-5 h-5 text-white" strokeWidth={2.5} />
            <h2 className="text-[16px] text-white font-medium tracking-wide">Hold Invoice</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 font-bold" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 bg-gray-50">
          
          <div className="flex flex-col text-center mt-2 mb-2">
            <h3 className="text-[16px] font-bold text-gray-800">Put this invoice on hold?</h3>
            <p className="text-[13px] text-gray-500 mt-2">You can resume working on it later from the Hold List.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[13px] font-bold text-gray-700">Reference Note (Optional)</label>
            <input 
              type="text" 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="E.g. Waiting for customer confirmation..."
              className="w-full border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] focus:outline-none focus:border-[#4F46E5]"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-5 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="bg-[#e2e8f0] hover:bg-[#cbd5e1] text-gray-800 px-4 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (onConfirm) {
                onConfirm(note);
              }
              setNote('');
              onClose();
            }}
            className="flex items-center gap-1.5 bg-[#6c757d] hover:bg-[#5a6268] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
          >
            <Check className="w-4 h-4" strokeWidth={3} />
            Confirm Hold
          </button>
        </div>

      </div>
    </div>
  );
}
