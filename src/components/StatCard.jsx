import React from 'react';
import { Plus, Eye, ArrowRightCircle, ShoppingBag, Wallet, Package, CreditCard } from 'lucide-react';
import { cn } from '../utils';

export function StatCard({ 
  title, 
  amount, 
  color, 
  showEye, 
  isPrivacyOn,
  onPlusClick, 
  onEyeClick, 
  onMoreInfoClick 
}) {
  const iconBgStyles = {
    teal: "bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30",
    green: "bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30",
    yellow: "bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-500/30",
    red: "bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30",
  };

  const textColors = {
    teal: "text-[#2563EB]",
    green: "text-[#22C55E]",
    yellow: "text-[#F59E0B]",
    red: "text-[#EF4444]",
  };

  const footerBgColors = {
    teal: "bg-[#2563EB]/10",
    green: "bg-[#22C55E]/10",
    yellow: "bg-[#F59E0B]/10",
    red: "bg-[#EF4444]/10",
  };

  const IconComponent = {
    teal: ShoppingBag,
    green: Wallet,
    yellow: Package,
    red: CreditCard,
  }[color];

  return (
    <div 
      onClick={onMoreInfoClick}
      className="bg-white rounded overflow-hidden shadow-sm flex flex-col relative cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 group border border-gray-100"
    >
      <div className="p-4 flex-1 flex flex-col justify-between min-h-[90px]">
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            {/* Left Icon */}
            <div className={cn("w-[50px] h-[50px] rounded-full flex items-center justify-center text-white shrink-0", iconBgStyles[color])}>
               <IconComponent className="w-6 h-6" strokeWidth={2} />
            </div>
            
            {/* Title & Amount */}
            <div className="flex flex-col">
              <p className="text-[14px] font-medium text-gray-500 tracking-wide mb-0.5">{title}</p>
              <h3 className={`text-[24px] font-bold text-gray-800 leading-none transition-all duration-300 ${isPrivacyOn ? 'blur-[6px] select-none' : ''}`}>{amount}</h3>
            </div>
          </div>
          
          {/* Top Right Actions */}
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onPlusClick && onPlusClick(); }}
              className={cn("hover:opacity-80 transition-colors bg-gray-50 p-1.5 rounded-full", textColors[color])}
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
            </button>
            {showEye && (
              <button 
                onClick={(e) => { e.stopPropagation(); onEyeClick && onEyeClick(); }}
                className={cn("hover:opacity-80 transition-colors bg-gray-50 p-1.5 rounded-full", textColors[color])}
              >
                <Eye className="w-4 h-4" strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
        
      </div>
      
      {/* Footer: More Info */}
      <div 
        className={cn(
          "w-full py-1.5 px-4 flex items-center justify-center gap-1.5 text-sm transition-colors font-medium tracking-wide",
          footerBgColors[color], textColors[color]
        )}
      >
        More info <ArrowRightCircle className="w-[15px] h-[15px] group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
