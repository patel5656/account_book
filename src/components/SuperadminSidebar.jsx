import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Headset,
  Settings,
  Search,
  LogOut,
  ChevronLeft
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/superadmin/dashboard' },
  { name: 'Companies', icon: Building2, path: '/superadmin/companies' },
  { name: 'Subscriptions', icon: CreditCard, path: '/superadmin/subscriptions' },
  { name: 'Global Settings', icon: Settings, path: '/superadmin/settings' },
  { name: 'Logout', icon: LogOut, path: '/login' }
];

export function SuperadminSidebar({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMenuItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-[220px] transition-transform duration-300 ease-in-out flex flex-col",
        "bg-[#1A1C29] shadow-2xl",
        !isOpen ? "-translate-x-full" : "translate-x-0"
      )}
    >
      {/* Logo Area */}
      <div className="flex flex-col items-center justify-center py-4 px-2">
        <h1 className="text-2xl font-normal text-white flex items-center gap-2 w-full px-2">
          <div className="w-10 h-10 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <mask id="blue-doc-mask-sidebar">
                <rect x="2" y="3" width="14" height="18" rx="3" fill="white" />
                <line x1="6" y1="8" x2="11" y2="8" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="6" y1="12" x2="11" y2="12" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="6" y1="16" x2="11" y2="16" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              </mask>
              <rect x="2" y="3" width="14" height="18" rx="3" fill="#3b82f6" mask="url(#blue-doc-mask-sidebar)" />
              <rect x="10" y="7" width="12" height="14" rx="2" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
              <line x1="13" y1="11" x2="19" y2="11" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="13" y1="14" x2="19" y2="14" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="13" y1="17" x2="19" y2="17" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex flex-col gap-1">
            <span className="leading-[1.1] tracking-wide font-medium flex flex-col">
              <span>Swayam</span>
              <span>Bill <span className="text-[#3b82f6]">Book</span></span>
            </span>

            <span className="text-[10px] text-slate-300 leading-none">The Digital Accounting Book</span>
          </div>
        </h1>
      </div>

      {/* Search Box */}
      <div className="px-3 pb-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search menus"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#232635] text-sm text-white rounded-[4px] pl-3 pr-8 py-1.5 focus:outline-none placeholder-[#71717A] border border-transparent focus:border-blue-500"
          />
          <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white font-bold" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <nav className="flex flex-col gap-1 px-2">
          {filteredMenuItems.map((item) => (
            <div key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center justify-between px-3 py-[10px] text-[13px] font-medium transition-colors min-h-[40px] rounded-lg",
                  isActive && item.path !== '#' && item.path !== '/login'
                    ? "bg-[#4F46E5] text-white shadow-sm shadow-indigo-500/20"
                    : "text-gray-400 hover:text-white hover:bg-[#252733]"
                )}
                onClick={(e) => {
                  if (item.name === 'Logout') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                  }
                  if (item.path === '#') {
                    e.preventDefault();
                  } else if (onClose && window.innerWidth < 768) {
                    onClose();
                  }
                }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <item.icon className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
                  <span className="tracking-wide">{item.name}</span>
                </div>
              </NavLink>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
