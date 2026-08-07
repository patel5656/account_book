import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { syncGoogleTranslate } from '../utils/language';
import { Sidebar } from '../components/Sidebar';
import { TopNavbar } from '../components/TopNavbar';
import { FooterShortcuts } from '../components/FooterShortcuts';
import {
  LayoutDashboard,
  UserCheck,
  Package,
  Users,
  FileText,
  ClipboardList,
  FileSpreadsheet,
  FileLock2,
  Settings,
  Barcode,
  Book,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import { useGlobalShortcuts } from '../hooks/useGlobalShortcuts';

const miniMenuItems = [
  { icon: LayoutDashboard, path: '/dashboard',    label: 'Dashboard' },
  { icon: UserCheck,       path: null,            label: 'Masters',           openFull: true },
  { icon: Package,         path: null,            label: 'Inventory',         openFull: true },
  { icon: Barcode,         path: '/admin/pos',    label: 'POS Billing' },
  { icon: Book,            path: '/admin/bill-book', label: 'Bill Book' },
  { icon: Users,           path: null,            label: 'Account',           openFull: true },
  { icon: FileText,        path: null,            label: 'Account Summary',   openFull: true },
  { icon: ClipboardList,   path: null,            label: 'Inventory Summary', openFull: true },
  { icon: FileSpreadsheet, path: null,            label: 'Final Accounts',    openFull: true },
  { icon: FileLock2,       path: null,            label: "GSTR's Summary",    openFull: true },
  { icon: Settings,        path: '/admin/print-setting', label: 'Settings' },
  { icon: LogOut,          path: '/login',        label: 'Logout' },
];

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [miniHovered, setMiniHovered] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const hoverTimerRef = useRef(null);
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') || 'en';
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
    syncGoogleTranslate(savedLang);
  }, [i18n]);

  useGlobalShortcuts();

  // Close sidebar on route change on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Sync with resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
        setMiniHovered(false);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  const handleMiniEnter = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    setMiniHovered(true);
  };

  const handleMiniLeave = () => {
    hoverTimerRef.current = setTimeout(() => setMiniHovered(false), 200);
  };

  const handleMiniItemClick = (item) => {
    if (item.openFull) {
      setSidebarOpen(true);
      setMiniHovered(false);
    } else if (item.path) {
      navigate(item.path);
      setMiniHovered(false);
      if (window.innerWidth < 768) setSidebarOpen(false);
    }
  };

  // Whether the hover-expanded sidebar should overlap content
  const isExpanded = !sidebarOpen && miniHovered;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      {/* Full Sidebar (when toggled open by hamburger) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mini Sidebar — always visible on desktop when full sidebar is closed */}
      {!sidebarOpen && (
        <>
          {/* Dim overlay when mini is hovered-expanded */}
          {miniHovered && (
            <div
              className="fixed inset-0 z-[37] hidden md:block"
              onClick={() => setMiniHovered(false)}
            />
          )}

          <div
            onMouseEnter={handleMiniEnter}
            onMouseLeave={handleMiniLeave}
            className="fixed left-0 top-0 z-[38] h-screen hidden md:flex flex-col py-3 shadow-2xl transition-all duration-250 ease-in-out overflow-hidden"
            style={{
              backgroundColor: '#1A1C29',
              width: miniHovered ? '220px' : '56px',
            }}
          >
            {/* Logo Row */}
            <div className="flex items-center gap-3 px-2 mb-3 flex-shrink-0">
              <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <mask id="blue-doc-mask-dash">
                    <rect x="2" y="3" width="14" height="18" rx="3" fill="white" />
                    <line x1="6" y1="8" x2="11" y2="8" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="6" y1="12" x2="11" y2="12" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="6" y1="16" x2="11" y2="16" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                  </mask>
                  <rect x="2" y="3" width="14" height="18" rx="3" fill="#3b82f6" mask="url(#blue-doc-mask-dash)" />
                  <rect x="10" y="7" width="12" height="14" rx="2" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
                  <line x1="13" y1="11" x2="19" y2="11" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="13" y1="14" x2="19" y2="14" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="13" y1="17" x2="19" y2="17" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              {miniHovered && (
                <div className="flex flex-col overflow-hidden">
                  <span className="text-white font-medium text-[14px] leading-tight whitespace-nowrap flex flex-col">
                    <span>Swayam</span>
                    <span>Bill <span className="text-[#3b82f6]">Book</span></span>
                  </span>

                  <span className="text-slate-400 text-[10px] leading-none whitespace-nowrap">The Digital Accounting Book</span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div
              className="flex flex-col gap-[5px] w-full px-2 overflow-y-auto custom-scrollbar"
              style={{ flex: '1 1 0', minHeight: 0 }}
            >
              {miniMenuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleMiniItemClick(item)}
                  title={!miniHovered ? item.label : undefined}
                  className="w-full flex-shrink-0 flex items-center gap-3 rounded-lg py-2.5 px-2 transition-all duration-150 hover:opacity-85 active:scale-95 text-left"
                  style={{ backgroundColor: '#4F46E5' }}
                >
                  <item.icon className="w-[18px] h-[18px] text-white flex-shrink-0" strokeWidth={2.2} />
                  {miniHovered && (
                    <span className="text-white text-[13px] font-medium whitespace-nowrap overflow-hidden">
                      {item.label}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Overlay for mobile full sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-[35] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'ml-0 md:ml-[220px]' : 'ml-0 md:ml-[56px]'
        }`}
      >
        <TopNavbar toggleSidebar={toggleSidebar} isOpen={sidebarOpen} />

        <main className={`flex-1 pt-[45px] overflow-x-hidden ${location.pathname === '/dashboard' ? 'pb-24' : 'pb-0'}`}>
          {children}
        </main>

        {location.pathname === '/dashboard' && <FooterShortcuts isOpen={sidebarOpen} />}
      </div>
    </div>
  );
}
