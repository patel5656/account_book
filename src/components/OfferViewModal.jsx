import React, { useState } from 'react';
import { X, Eye } from 'lucide-react';

export function OfferViewModal({ isOpen, onClose, offer }) {
  if (!isOpen || !offer) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[3px] shadow-2xl w-full max-w-[min(96vw,600px)] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between">
          <h2 className="text-[15px] text-white font-medium tracking-wide pl-4 py-2.5 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Offer Details
          </h2>
          <button onClick={onClose} className="bg-[#dc3545] hover:bg-[#c82333] h-full px-3 py-2.5 focus:outline-none transition-colors">
            <X className="w-5 h-5 text-white" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-white overflow-y-auto max-h-[calc(100vh-150px)] custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Offer Name', value: offer.name },
              { label: 'Status', value: offer.status },
              { label: 'Offer Type', value: offer.offerType },
              { label: 'Product Selection', value: offer.productSelection },
              { label: 'Discount Type', value: offer.discountType || '—' },
              { label: 'Discount Value', value: offer.discountValue || '—' },
              { label: 'Buy Qty', value: offer.buyQty ?? '—' },
              { label: 'Get Qty', value: offer.getQty ?? '—' },
              { label: 'Start Date', value: offer.startDate || '—' },
              { label: 'End Date', value: offer.endDate || '—' },
              { label: 'Schedule', value: offer.schedule || '—' },
              { label: 'Usage', value: offer.usage ?? 0 },
              { label: 'Priority', value: offer.priority || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">{label}</span>
                <span className={`text-[14px] font-medium text-gray-800 ${label === 'Status' ? (value === 'ACTIVE' ? 'text-green-500' : 'text-red-400') : ''}`}>
                  {String(value)}
                </span>
              </div>
            ))}
            {offer.offerDescription && (
              <div className="col-span-2 flex flex-col gap-1">
                <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Description</span>
                <span className="text-[14px] text-gray-800">{offer.offerDescription}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8f9fa] px-5 py-3 flex justify-end border-t border-gray-200">
          <button onClick={onClose} className="bg-[#6c757d] hover:bg-[#5a6268] text-white px-5 py-[7px] rounded-[3px] text-[14px] transition-colors shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
