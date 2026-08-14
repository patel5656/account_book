import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  Search, 
  Bell, 
  Download, 
  Maximize2, 
  Settings, 
  RefreshCw, 
  Printer, 
  User,
  Star,
  LogOut
} from 'lucide-react';
import { cn } from '../utils';
import { ImportDataModal } from './ImportDataModal';
import { SettingsDrawer } from './SettingsDrawer';
import { ChangePasswordModal } from './ChangePasswordModal';
import { ResetDatabaseModal } from './ResetDatabaseModal';
import { LogoutModal } from './LogoutModal';
import apiClient from '../api/apiClient';

export function TopNavbar({ toggleSidebar, isOpen }) {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isResetDatabaseModalOpen, setIsResetDatabaseModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  const [validityDate, setValidityDate] = useState('');
  const [daysLeft, setDaysLeft] = useState('');

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem('user')) || {};
  } catch(e) {}
  
  const location = useLocation();
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  React.useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await apiClient.get('/auth/me');
        if (res.data?.success && res.data?.data?.company?.expireDate) {
          const expDate = new Date(res.data.data.company.expireDate);
          
          // Format date like '30-May-2026'
          const formatted = expDate.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          }).replace(/ /g, '-');
          
          setValidityDate(formatted);
          
          // Calculate days left
          const diffTime = expDate - new Date();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysLeft(diffDays > 0 ? diffDays : 0);
        } else {
          // Default fallback if not available
          setValidityDate('Unlimited');
          setDaysLeft('∞');
        }
      } catch (err) {
        console.error("Failed to fetch user validity:", err);
        setValidityDate('Unknown');
        setDaysLeft('-');
      }
    };
    fetchMe();
  }, []);

  const changeLanguage = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('app_lang', lang);
    
    if (lang === 'en') {
      document.cookie = "googtrans=/en/en; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = `googtrans=/en/en; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/`;
      document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    }

    const googleSelect = document.querySelector('.goog-te-combo');
    if (googleSelect) {
      googleSelect.value = lang;
      googleSelect.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const disabledSettingsRoutes = [
    // Masters
    '/admin/bank_details',
    '/admin/company_master',
    '/admin/customer_master',
    '/admin/category_master',
    '/admin/employee_master',
    '/admin/expense_master',
    '/admin/income_master',
    '/admin/payment_master',
    '/admin/product_master',
    '/admin/unit_catalog_master',
    '/admin/bom_master',
    '/admin/voucher_master',
    // Inventory
    '/admin/purchase',
    '/admin/purchase_return',
    '/admin/sales',
    '/admin/sales_return',
    '/admin/quotation',
    '/admin/stock_adjustment',
    '/admin/stock_inventory',
    // Account (Bank Book and below)
    '/admin/bank-ledger',
    '/admin/employee_ledger',
    '/admin/expenses-ledger/expense_ledger',
    '/admin/incomes-ledger/income_ledger',
    '/admin/cashbook-ledger/payment_ledger',
    '/admin/employee_attendance',
    // Account Summary
    '/admin/party_outstanding/customer_outstanding',
    '/admin/party_outstanding/company_outstanding',
    '/admin/stock-details',
    '/admin/sale_summary',
    '/admin/purchase_summary',
    '/admin/cash_bank_summary',
    '/admin/expenses_report/expense_ledger',
    '/admin/day_book_summary',
    '/admin/expiry_report',
    '/admin/order_list',
    // Inventory Summary
    '/admin/inventory-summary/brandwise-sale',
    '/admin/inventory-summary/brandwise-purchase',
    '/admin/inventory-summary/categorywise-sale',
    '/admin/inventory-summary/categorywise-purchase',
    '/admin/inventory-summary/itemwise-sale',
    '/admin/inventory-summary/itemwise-purchase',
    '/admin/inventory-summary/employeewise-sale',
    '/admin/inventory-summary/invoices-report',
    // Final Accounts
    '/admin/final-accounts/trading-account',
    '/admin/final-accounts/profit-loss',
    '/admin/final-accounts/balance-sheet',
    '/admin/final-accounts/tcs-report',
    // GSTR's Summary
    '/admin/gstr-summary/gstr-1',
    '/admin/gstr-summary/gstr-2',
    '/admin/gstr-summary/gstr-3b',
    '/admin/gstr-summary/sale-summary',
    '/admin/gstr-summary/sale-return',
    '/admin/gstr-summary/purchase-summary',
    '/admin/gstr-summary/purchase-return',
    '/admin/gstr-summary/gst-wise',
    '/admin/gstr-summary/hsn-wise',
    // Tools
    '/tools/complaint',
    '/tools/service-reminder',
    '/tools/hsn-gst-error',
    '/admin/items_quantity_report/1',
    '/admin/view_deleted_entry',
    '/admin/notification-permission',
    '/tools/hard-refresh',
    '/admin/invoice-details/company_purchase_order',
    '/admin/invoice-details/customer_sale_order'
  ];

  const handleSettingsClick = () => {
    if (!disabledSettingsRoutes.includes(location.pathname)) {
      setIsSettingsOpen(true);
    }
  };

  const handleFullScreenToggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(e);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handleRefresh = () => {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload(true);
  };

  return (
    <>
      <header className={`bg-white border-b border-gray-200 h-[45px] fixed top-0 right-0 z-30 transition-all duration-300 ease-in-out flex items-center justify-between px-2 sm:px-3 ${isOpen ? 'left-0 md:left-[220px]' : 'left-0 md:left-[56px]'}`}>
      
      {/* Left side */}
      <div className="flex flex-wrap items-center gap-2">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 rounded-sm hover:bg-indigo-50 text-[#4F46E5] transition-colors focus:outline-none"
        >
          <Menu className="w-[18px] h-[18px]" strokeWidth={2.5} />
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-[4px] sm:gap-[10px] flex-1 justify-end">
        {/* Validity Badge */}
        {validityDate && (
          <div className="flex flex-wrap items-center gap-1 bg-[#28a745] px-1.5 sm:px-2.5 py-0.5 rounded-full text-white flex-shrink-0">
            <span className="text-[9px] sm:text-[11px] font-medium tracking-wide whitespace-nowrap">
              <span className="hidden sm:inline">Validity - </span>
              {validityDate} <span className="font-bold hidden xs:inline">{daysLeft} days left</span>
            </span>
          </div>
        )}

        {/* Utility Icons — hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-[6px] sm:gap-[10px]">
          <IconButton icon={Bell} />
          <IconButton icon={Download} onClick={() => setIsImportModalOpen(true)} />
          <IconButton icon={Maximize2} onClick={handleFullScreenToggle} />
          <IconButton icon={Settings} onClick={handleSettingsClick} />
          <IconButton icon={RefreshCw} onClick={handleRefresh} />
        </div>
        
        {/* Always visible: Settings + Refresh on mobile */}
        <div className="flex sm:hidden items-center gap-[6px]">
          <IconButton icon={Settings} onClick={handleSettingsClick} />
          <IconButton icon={RefreshCw} onClick={handleRefresh} />
        </div>
        
        {/* Print Button */}
        <button onClick={() => window.print()} className="flex items-center gap-1 sm:gap-1.5 text-gray-500 hover:text-gray-700 sm:mx-1 flex-shrink-0">
          <Printer className="w-4 h-4" strokeWidth={2.5} />
          <span className="text-[13px] font-medium hidden md:block">Print</span>
        </button>

        {/* Language Switcher */}
        <div className="flex items-center border-l border-gray-200 pl-1 sm:pl-2">
          <select 
            value={(i18n.language || 'en').substring(0, 2)} 
            onChange={changeLanguage}
            className="notranslate text-[13px] font-medium text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer outline-none uppercase appearance-none hover:text-gray-900 transition-colors text-center"
            style={{ textAlign: 'center', textAlignLast: 'center' }}
            translate="no"
          >
            <option value="en" style={{ textAlign: 'center' }}>EN</option>
            <option value="hi" style={{ textAlign: 'center' }}>HI</option>
            <option value="gu" style={{ textAlign: 'center' }}>GU</option>
            <option value="mr" style={{ textAlign: 'center' }}>MR</option>
            <option value="pa" style={{ textAlign: 'center' }}>PA</option>
            <option value="ta" style={{ textAlign: 'center' }}>TA</option>
            <option value="te" style={{ textAlign: 'center' }}>TE</option>
            <option value="bn" style={{ textAlign: 'center' }}>BN</option>
            <option value="kn" style={{ textAlign: 'center' }}>KN</option>
            <option value="ml" style={{ textAlign: 'center' }}>ML</option>
          </select>
        </div>

        {/* User Profile */}
        <div className="relative">
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsProfileOpen(!isProfileOpen);
            }}
            className="flex items-center gap-1 sm:gap-2 pl-1 sm:pl-2 border-l border-gray-200 flex-shrink-0 focus:outline-none cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-[#4F46E5]/20 flex items-center justify-center text-[#4F46E5] overflow-hidden">
              <User className="w-[14px] h-[14px]" />
            </div>
            <span className="text-[13px] font-medium text-gray-600 hidden sm:block">Swayam Bill Book</span>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-[260px] bg-white rounded-md shadow-2xl border border-gray-200 z-50 overflow-hidden">
              {/* Top Banner section */}
              <div className="bg-[#4F46E5] text-white p-4 text-center">
                <div className="relative inline-block mt-2">
                  <div className="w-24 h-24 bg-[#5bc0de] rounded-full mx-auto flex items-center justify-center border-[3px] border-white overflow-hidden text-white shadow-sm">
                    <User className="w-16 h-16" strokeWidth={1.5} />
                  </div>
                  <span className="absolute top-0 right-[-10px] bg-[#111] text-white text-[10px] font-medium px-2 py-0.5 rounded shadow-sm">Profile</span>
                </div>
                <div className="mt-3 text-lg font-medium">{user?.name || 'Siddaling A Padasalagi'}</div>
                <div className="text-[11px] mt-1 font-medium">Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-') : '11-Feb-2025'}</div>
                <div className="text-[11px] mt-0.5 font-medium">User Rigth's : <span className="font-bold">{user?.role === 'SUPERADMIN' ? 'Super Admin' : 'Admin'}</span></div>
              </div>
              
              {/* Middle buttons */}
              <div className="p-3 border-b border-gray-200 flex justify-between gap-2 bg-white">
                <button 
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="flex-1 py-1.5 px-1 border border-[#4F46E5] text-[#4F46E5] rounded-sm text-[11px] font-medium hover:bg-[#4F46E5] hover:text-white transition-colors text-center leading-tight"
                >
                  Change<br/>Password
                </button>
                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/admin/view_user');
                  }}
                  className="flex-1 py-1.5 px-1 border border-[#4F46E5] text-[#4F46E5] rounded-sm text-[11px] font-medium hover:bg-[#4F46E5] hover:text-white transition-colors text-center leading-tight"
                >
                  Add New<br/>User
                </button>
                <button 
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsResetDatabaseModalOpen(true);
                  }}
                  className="flex-1 py-1.5 px-1 border border-[#4F46E5] text-[#4F46E5] rounded-sm text-[11px] font-medium hover:bg-[#4F46E5] hover:text-white transition-colors text-center leading-tight"
                >
                  Reset<br/>Database
                </button>
              </div>
              
              <div className="p-3 bg-white flex justify-between items-center">
                <button 
                  onClick={() => { setIsProfileOpen(false); navigate('/admin/registration'); }}
                  className="px-5 py-1.5 border border-green-600 text-green-600 rounded-sm text-[13px] font-medium hover:bg-green-50 transition-colors"
                >Profile</button>
                <button onClick={() => {
                  setIsProfileOpen(false);
                  setIsLogoutModalOpen(true);
                }} className="px-5 py-1.5 border border-[#dc3545] text-[#dc3545] rounded-sm text-[13px] font-medium hover:bg-red-50 transition-colors">Sign out</button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => {
            setIsLogoutModalOpen(true);
          }}
          className="flex items-center gap-1 sm:gap-1.5 pl-1 sm:pl-2 border-l border-gray-200 text-red-500 hover:text-red-700 flex-shrink-0 focus:outline-none transition-colors"
          title="Logout"
        >
          <LogOut className="w-[16px] h-[16px]" strokeWidth={2.5} />
          <span className="text-[13px] font-medium hidden sm:block">Logout</span>
        </button>
      </div>

    </header>
      <ImportDataModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
      />
      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
      />
      <ResetDatabaseModal 
        isOpen={isResetDatabaseModalOpen} 
        onClose={() => setIsResetDatabaseModalOpen(false)} 
      />
      <LogoutModal 
        isOpen={isLogoutModalOpen} 
        onClose={() => setIsLogoutModalOpen(false)} 
      />

      {/* Plan Expired Modal */}
      {typeof daysLeft === 'number' && daysLeft <= 0 && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-3xl">⚠️</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Plan Has Expired</h2>
            <p className="text-gray-600 mb-6">
              Your subscription plan ended on <strong>{validityDate}</strong>. Please contact the administrator or upgrade your plan to restore full access to your account.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsLogoutModalOpen(true)}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function IconButton({ icon: Icon, className, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "text-gray-500 hover:text-gray-700 transition-colors focus:outline-none",
        className
      )}
    >
      <Icon className="w-[15px] h-[15px]" strokeWidth={2.5} />
    </button>
  );
}
