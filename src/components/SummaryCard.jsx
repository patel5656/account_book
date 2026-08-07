import React from 'react';
import { Plus, ArrowRightCircle } from 'lucide-react';
import { cn } from '../utils';

export function SummaryCard({ title, amount, color, icon: Icon, isPrivacyOn, onPlusClick, onMoreInfoClick }) {
  const iconColors = {
    green: "text-[#A855F7]", 
    blue: "text-[#3B82F6]", 
    yellow: "text-[#F59E0B]", 
    red: "text-[#EF4444]", 
  };

  const footerBgColors = {
    green: "bg-[#A855F7]/10",
    blue: "bg-[#3B82F6]/10",
    yellow: "bg-[#F59E0B]/10",
    red: "bg-[#EF4444]/10",
  };

  return (
    <div 
      onClick={onMoreInfoClick}
      className="bg-white rounded overflow-hidden shadow-sm flex flex-col relative cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 group border border-gray-100"
    >
      <div className="p-4 flex-1">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
             <div className={cn("p-2.5 rounded-lg shrink-0", footerBgColors[color])}>
               <Icon className={cn("w-7 h-7", iconColors[color])} strokeWidth={2} />
             </div>
             <div className="flex flex-col">
               <span className="text-[14px] font-medium text-gray-500 leading-tight mb-0.5">{title}</span>
               <span className={`text-[20px] font-bold text-gray-800 leading-none transition-all duration-300 ${isPrivacyOn ? 'blur-[6px] select-none' : ''}`}>{amount}</span>
             </div>
          </div>
          {onPlusClick && (
            <button 
              onClick={(e) => { e.stopPropagation(); onPlusClick && onPlusClick(); }}
              className={cn("hover:opacity-80 transition-colors bg-gray-50 p-1.5 rounded-full shrink-0", iconColors[color])}
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
            </button>
          )}
        </div>
      </div>
      
      <div 
        className={cn(
          "w-full py-1.5 px-4 flex items-center justify-center gap-1.5 text-sm transition-colors font-medium tracking-wide",
          footerBgColors[color], iconColors[color]
        )}
      >
        More info <ArrowRightCircle className="w-[15px] h-[15px] group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}
