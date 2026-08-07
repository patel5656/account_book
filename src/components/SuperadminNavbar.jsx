import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Maximize2, RefreshCw, User, LogOut } from 'lucide-react';
import { cn } from '../utils';

export function SuperadminNavbar({ toggleSidebar, isOpen }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  const handleFullScreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.error(e));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const handleRefresh = () => {
    try { sessionStorage.clear(); } catch (e) {}
    window.location.reload(true);
  };

  return (
    <header className={`bg-white border-b border-gray-200 h-[45px] fixed top-0 right-0 z-30 transition-all duration-300 ease-in-out flex items-center justify-between px-2 sm:px-3 ${isOpen ? 'left-0 md:left-[220px]' : 'left-0'}`}>
      
      {/* Left side */}
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-sm hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none"
        >
          <Menu className="w-[18px] h-[18px]" strokeWidth={2.5} />
        </button>
        <span className="ml-3 text-sm font-semibold text-gray-700 hidden sm:block">Superadmin Console</span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-[6px] sm:gap-[10px] overflow-hidden justify-end">
        
        {/* Utility Icons */}
        <div className="hidden sm:flex items-center gap-[10px]">
          <IconButton icon={Maximize2} onClick={handleFullScreenToggle} />
          <IconButton icon={RefreshCw} onClick={handleRefresh} />
        </div>

        {/* User Profile */}
        <button className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-gray-200 flex-shrink-0">
          <div className="w-6 h-6 rounded-full bg-[#4F46E5]/20 flex items-center justify-center text-[#4F46E5] overflow-hidden">
            <User className="w-[14px] h-[14px]" />
          </div>
          <span className="text-[13px] font-medium text-gray-600 hidden sm:block">Superadmin</span>
        </button>

        {/* Logout Button */}
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }}
          className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2 border-l border-gray-200 text-red-500 hover:text-red-700 flex-shrink-0 focus:outline-none transition-colors"
          title="Logout"
        >
          <LogOut className="w-[16px] h-[16px]" strokeWidth={2.5} />
          <span className="text-[13px] font-medium hidden sm:block">Logout</span>
        </button>
      </div>
    </header>
  );
}

function IconButton({ icon: Icon, className, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={cn("text-gray-500 hover:text-gray-700 transition-colors focus:outline-none", className)}
    >
      <Icon className="w-[15px] h-[15px]" strokeWidth={2.5} />
    </button>
  );
}
