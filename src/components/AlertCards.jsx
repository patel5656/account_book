import React from 'react';
import { Hourglass, AlertTriangle, ShoppingCart, Bell, Package, ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils';

export function AlertCards({ alerts, isPrivacyOn }) {
  const navigate = useNavigate();
  
  const cards = [
    {
      title: "Expired Products",
      number: alerts?.expiredCount?.toString() || "0",
      subtitle: "Already Expired Products",
      icon: AlertTriangle,
      theme: "orange",
      bgClass: "bg-orange-50 border-orange-100",
      textClass: "text-orange-600",
      btnClass: "bg-orange-100 text-orange-700 hover:bg-orange-200",
      watermark: AlertTriangle,
      path: "/admin/expiry_report",
    },
    {
      title: "Reorder Quantity",
      number: alerts?.reorderCount?.toString() || "0",
      subtitle: "Products Need Reorder",
      icon: ShoppingCart,
      theme: "blue",
      bgClass: "bg-blue-50 border-blue-100",
      textClass: "text-blue-600",
      btnClass: "bg-blue-100 text-blue-700 hover:bg-blue-200",
      watermark: ShoppingCart,
      path: "/admin/order_list",
    },
    {
      title: "Reminder",
      number: alerts?.remindersCount?.toString() || "0",
      subtitle: "Payment & Follow-up",
      icon: Bell,
      theme: "purple",
      bgClass: "bg-purple-50 border-purple-100",
      textClass: "text-purple-600",
      btnClass: "bg-purple-100 text-purple-700 hover:bg-purple-200",
      watermark: Bell,
      path: "/tools/service-reminder",
    },
    {
      title: "Day Book Summary",
      metrics: [
        { label: 'Receipts', value: `₹${alerts?.daybook?.receipts?.toFixed(2) || '0'}` },
        { label: 'Payments', value: `₹${alerts?.daybook?.payments?.toFixed(2) || '0'}` },
        { label: 'Cash In', value: `₹${alerts?.daybook?.cashIn?.toFixed(2) || '0'}` },
        { label: 'Cash Out', value: `₹${alerts?.daybook?.cashOut?.toFixed(2) || '0'}` },
        { label: 'Balance', value: `₹${alerts?.daybook?.balance?.toFixed(2) || '0'}` },
        { label: 'Txns', value: alerts?.daybook?.txnsCount?.toString() || '0' },
      ],
      icon: FileText,
      theme: "green",
      bgClass: "bg-green-50 border-green-100",
      textClass: "text-green-600",
      btnClass: "bg-green-100 text-green-700 hover:bg-green-200",
      watermark: FileText,
      path: "/admin/day_book_summary",
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {cards.map((card, index) => (
        <div 
          key={index} 
          onClick={() => navigate(card.path)}
          className={cn(
            "rounded-xl border p-4 flex flex-col relative overflow-hidden transition-transform hover:-translate-y-1 cursor-pointer",
            card.bgClass
          )}
        >
          {/* Watermark Icon */}
          <div className="absolute -right-4 top-12 opacity-10">
            <card.watermark className={cn("w-24 h-24", card.textClass)} strokeWidth={3} />
          </div>

          {/* Header */}
          <div className="flex items-center gap-2 mb-4 relative z-10">
            <card.icon className={cn("w-5 h-5", card.textClass)} strokeWidth={2.5} />
            <span className="font-bold text-gray-800 text-[14px]">{card.title}</span>
          </div>

          {/* Body */}
          <div className="flex flex-col mb-4 relative z-10 h-[40px] justify-center">
            {card.metrics ? (
              <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                {card.metrics.map((m, i) => (
                  <div key={i} className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-600 font-medium">{m.label}:</span>
                    <span className={`font-bold text-gray-900 transition-all duration-300 ${isPrivacyOn ? 'blur-[5px] select-none' : ''}`}>{m.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <h3 className={`text-3xl font-bold text-gray-900 leading-none mb-1 transition-all duration-300 ${isPrivacyOn ? 'blur-[6px] select-none' : ''}`}>{card.number}</h3>
                <p className="text-[11px] text-gray-600 font-medium">{card.subtitle}</p>
              </>
            )}
          </div>

          {/* Footer Button */}
          <button className={cn(
            "mt-auto w-full py-2 rounded-lg flex items-center justify-center gap-2 text-xs font-bold transition-colors relative z-10",
            card.btnClass
          )}>
            View Details <ArrowRight className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
        </div>
      ))}
    </div>
  );
}
