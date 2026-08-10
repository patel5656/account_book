import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../utils';
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
  Search,
  ChevronLeft,
  Circle,
  Plus,
  ShoppingCart,
  CornerUpLeft,
  RefreshCcw,
  Receipt,
  BarChart,
  Book,
  Landmark,
  User,
  IndianRupee,
  Wallet,
  CreditCard,
  ClipboardCheck,
  X,
  TrendingUp,
  PieChart,
  Scale,
  FileOutput,
  Pin,
  Flag,
  Wrench,
  Mail,
  Barcode,
  Hash,
  Merge,
  PackageOpen,
  Tag,
  List,
  Type,
  Trash2,
  Bell,
  RefreshCw,
  Printer,
  ArrowRightLeft,
  Building2,
  Warehouse,
  LogOut,
  Import
} from 'lucide-react';
import { CashBankMasterModal } from './CashBankMasterModal';
import { PartyMasterModal } from './PartyMasterModal';
import { CategoryMasterModal } from './CategoryMasterModal';
import { EmployeeMasterModal } from './EmployeeMasterModal';
import { ExpenseMasterModal } from './ExpenseMasterModal';
import { IncomeMasterModal } from './IncomeMasterModal';
import { PaymentMasterModal } from './PaymentMasterModal';
import { ItemMasterModal } from './ItemMasterModal';
import { OfferManagementModal } from './OfferManagementModal';
// import { ProductMasterModal } from './ProductMasterModal';
import { UnitCatalogMasterModal } from './UnitCatalogMasterModal';
import { MessageTemplateModal } from './MessageTemplateModal';
import { GstUqcMergeModal } from './GstUqcMergeModal';
import { StockCorrectionModal } from './StockCorrectionModal';
import { BalanceCorrectionModal } from './BalanceCorrectionModal';
import { BranchMasterModal } from './BranchMasterModal';
import { WarehouseMasterModal } from './WarehouseMasterModal';
import { LocationMasterModal } from './LocationMasterModal';
import { useSettings } from '../context/SettingsContext';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { 
    name: 'Masters', 
    icon: UserCheck, 
    path: '#', 
    hasSubmenu: true,
    subitems: [
      { name: 'Bank Master', path: '/admin/bank_details', hasPlus: true },
      { name: 'Company Master', path: '/admin/company_master', hasPlus: true },
      { name: 'Customer Master', path: '/admin/customer_master', hasPlus: true },
      { name: 'Category Master', path: '/admin/category_master', hasPlus: true },
      { name: 'Employee Master', path: '/admin/employee_master', hasPlus: true },
      { name: 'Expense Master', path: '/admin/expense_master', hasPlus: true },
      { name: 'Income Master', path: '/admin/income_master', hasPlus: true },
      { name: 'Payment Master', path: '/admin/payment_master', hasPlus: true },
      { name: 'Item Master', path: '/admin/item_master', hasPlus: true },
      { name: 'Offer Management', path: '/admin/offer_management', hasPlus: true },
      // { name: 'Product Master', path: '/admin/product_master', hasPlus: true },
      // { name: 'Unit Catalog Master', path: '/admin/unit_catalog_master', hasPlus: true },
      { name: 'BOM Master', path: '/admin/bom_master', hasPlus: false },
      { name: 'Voucher master', path: '/admin/voucher_master', hasPlus: false },
    ]
  },
  { 
    name: 'Inventory', 
    icon: Package, 
    path: '/inventory', 
    hasSubmenu: true,
    subitems: [
      { name: 'Purchase', subtitle: '(Ctrl+P)', icon: ShoppingCart, path: '/admin/purchase', hasPlus: true },
      { name: 'Purchase Return', icon: CornerUpLeft, path: '/admin/purchase_return', hasPlus: true },
      { name: 'Warehouse Master', icon: Warehouse, path: '/admin/warehouse_master', hasPlus: true },
      { name: 'Branch Master', icon: Building2, path: '/admin/branch_master', hasPlus: true },
      { name: 'Location Master', icon: Pin, path: '/admin/location_master', hasPlus: true },
      { name: 'Stock Transfer', icon: ArrowRightLeft, path: '/admin/godown_transfer', hasPlus: false },
      { name: 'Sales', subtitle: '(Ctrl+S)', icon: ClipboardList, path: '/admin/sales', hasPlus: true },
      { name: 'Sales Return', icon: RefreshCcw, path: '/admin/sales_return', hasPlus: true },
      { name: 'Quotation', icon: Receipt, path: '/admin/quotation', hasPlus: true },
      { name: 'Stock Adjustment', icon: ShoppingCart, path: '/admin/stock_adjustment', hasPlus: true },
      { name: 'Stock Inventory', icon: BarChart, path: '/admin/stock_inventory', hasPlus: false },
    ]
  },
  { name: 'POS Billing', icon: Barcode, path: '/admin/pos' },
  { name: 'Bill Book', icon: Book, path: '/admin/bill-book' },
  { 
    name: 'Account', 
    icon: Users, 
    path: '/account', 
    hasSubmenu: true,
    subitems: [
      { name: 'Customer Ledger', subtitle: '(Ctrl+Shift+C)', icon: UserCheck, path: '/admin/party-ledger/customer_payment' },
      { name: 'Company Ledger', subtitle: '(Ctrl+Shift+M)', icon: Book, path: '/admin/party-ledger/company_payment' },
      { name: 'Bank Book', icon: Landmark, path: '/admin/bank-ledger' },
      { name: 'Employee Ledger', icon: User, path: '/admin/employee_ledger' },
      { name: 'Expenses Ledger', subtitle: '(Ctrl+E)', icon: IndianRupee, path: '/admin/expenses-ledger/expense_ledger' },
      { name: 'Incomes Ledger', subtitle: '(Ctrl+I)', icon: Wallet, path: '/admin/incomes-ledger/income_ledger' },
      { name: 'Payment Ledger', icon: CreditCard, path: '/admin/cashbook-ledger/payment_ledger' },
      { name: 'Employee Attendance', icon: ClipboardCheck, path: '/admin/employee_attendance' },
    ]
  },
  { 
    name: 'Account Summary', 
    icon: FileText, 
    path: '#', 
    hasSubmenu: true,
    subitems: [
      { name: 'Customer Outstanding', icon: UserCheck, path: '/admin/party_outstanding/customer_outstanding' },
      { name: 'Company Outstanding', icon: Users, path: '/admin/party_outstanding/company_outstanding' },
      { name: 'Stock summary', subtitle: '(F1)', icon: Package, path: '/admin/stock-details' },
      { name: 'Sale summary', icon: FileText, path: '/admin/sale_summary' },
      { name: 'Purchase summary', icon: CreditCard, path: '/admin/purchase_summary' },
      { name: 'Cash & Bank summary', icon: Landmark, path: '/admin/cash_bank_summary' },
      { name: 'Expenses summary', icon: IndianRupee, path: '/admin/expenses_report/expense_ledger' },
      { name: 'Day Book Summary', icon: ClipboardCheck, path: '/admin/day_book_summary' },
      { name: 'Expiry Report', icon: X, path: '/admin/expiry_report' },
      { name: 'Order List', icon: ClipboardList, path: '/admin/order_list' },
    ]
  },
  { 
    name: 'Inventory Summary', 
    icon: ClipboardList, 
    path: '#', 
    hasSubmenu: true,
    subitems: [
      { name: 'Brandwise Sale', icon: Circle, path: '/admin/inventory-summary/brandwise-sale' },
      { name: 'Brandwise Purchase', icon: Circle, path: '/admin/inventory-summary/brandwise-purchase' },
      { name: 'Categorywise Sale', icon: Circle, path: '/admin/inventory-summary/categorywise-sale' },
      { name: 'Categorywise Purchase', icon: Circle, path: '/admin/inventory-summary/categorywise-purchase' },
      { name: 'Item wise Sale', icon: Circle, path: '/admin/inventory-summary/itemwise-sale' },
      { name: 'Item wise Purchase', icon: Circle, path: '/admin/inventory-summary/itemwise-purchase' },
      { name: 'Employeewise Sale', icon: Circle, path: '/admin/inventory-summary/employeewise-sale' },
      { name: 'Invoices Report', icon: Circle, path: '/admin/inventory-summary/invoices-report' },
    ]
  },
  { 
    name: 'Final Accounts', 
    icon: FileSpreadsheet, 
    path: '#', 
    hasSubmenu: true,
    subitems: [
      { name: 'Trading Account', icon: TrendingUp, path: '/admin/final-accounts/trading-account' },
      { name: 'Profit and Loss Account', icon: PieChart, path: '/admin/final-accounts/profit-loss' },
      { name: 'Balance Sheet', icon: Scale, path: '/admin/final-accounts/balance-sheet' },
      { name: 'TCS Report', icon: FileOutput, path: '/admin/final-accounts/tcs-report' },
      { name: 'Daily Cash Book', icon: Book, path: '/admin/final-accounts/rojmel' },
    ]
  },
  { 
    name: "GSTR's Summary", 
    icon: FileLock2, 
    path: '#', 
    hasSubmenu: true,
    subitems: [
      { name: 'GSTR-1', icon: Pin, path: '/admin/gstr-summary/gstr-1' },
      { name: 'GSTR-2', icon: Pin, path: '/admin/gstr-summary/gstr-2' },
      { name: 'GSTR-3B', icon: Pin, path: '/admin/gstr-summary/gstr-3b' },
      { name: 'Sale Summary', icon: Pin, path: '/admin/gstr-summary/sale-summary' },
      { name: 'Sale Return', icon: Pin, path: '/admin/gstr-summary/sale-return' },
      { name: 'Purchase Summary', icon: Pin, path: '/admin/gstr-summary/purchase-summary' },
      { name: 'Purchase Return', icon: Pin, path: '/admin/gstr-summary/purchase-return' },
      { name: 'GST-WISE Summary', icon: Pin, path: '/admin/gstr-summary/gst-wise' },
      { name: 'HSN-WISE Summary', icon: Pin, path: '/admin/gstr-summary/hsn-wise' },
    ]
  },
  { 
    name: 'Tools', 
    icon: Settings, 
    path: '#', 
    hasSubmenu: true,
    subitems: [
      { name: 'Complaint', subtitle: '(Alt + C)', icon: Flag, path: '/tools/complaint' },
      { name: 'Service Reminder', icon: Wrench, path: '/tools/service-reminder' },
      { name: 'Set Message Template', icon: Mail, path: '#' },
      { name: 'BarCode', icon: Barcode, path: '/tools/barcode' },
      { name: 'Bank Statement Import', icon: Import, path: '/admin/bank_statement_import' },
      { name: 'HSN & GST Error', icon: Hash, path: '/tools/hsn-gst-error' },
      { name: 'GST UQC Merge', icon: Merge, path: '#' },
      { name: 'Stock Correction', icon: PackageOpen, path: '#' },
      { name: 'Stock Price Update', icon: Tag, path: '/tools/stock-price-update' },
      { name: 'All Balance Correction', icon: List, path: '/admin/items_quantity_report/0' },
      { name: 'Invalid Units Correction', icon: Type, path: '/admin/items_quantity_report/1' },
      { name: 'Recycle Bin', icon: Trash2, path: '/admin/view_deleted_entry' },
      { name: 'Notification Permission', icon: Bell, path: '/admin/notification-permission' },
      { name: 'Hard Refresh Local Data', icon: RefreshCw, path: '/tools/hard-refresh' },
    ]
  },
  { 
    name: 'Audit Logs', 
    icon: ClipboardList, 
    path: '/admin/audit-logs' 
  },
  { 
    name: 'Settings', 
    icon: Settings, 
    path: '#', 
    hasSubmenu: true,
    subitems: [
      { name: 'Print Setting', icon: Printer, path: '/admin/print-setting' }
    ]
  },
  { 
    name: 'Logout', 
    icon: LogOut, 
    path: '/login' 
  }
];

export function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [isBankMasterModalOpen, setIsBankMasterModalOpen] = useState(false);
  const [isCompanyMasterModalOpen, setIsCompanyMasterModalOpen] = useState(false);
  const [isCustomerMasterModalOpen, setIsCustomerMasterModalOpen] = useState(false);
  const [isCategoryMasterModalOpen, setIsCategoryMasterModalOpen] = useState(false);
  const [isEmployeeMasterModalOpen, setIsEmployeeMasterModalOpen] = useState(false);
  const [isExpenseMasterModalOpen, setIsExpenseMasterModalOpen] = useState(false);
  const [isIncomeMasterModalOpen, setIsIncomeMasterModalOpen] = useState(false);
  const [isPaymentMasterModalOpen, setIsPaymentMasterModalOpen] = useState(false);
  const [isItemMasterModalOpen, setIsItemMasterModalOpen] = useState(false);
  const [isOfferManagementModalOpen, setIsOfferManagementModalOpen] = useState(false);
  const [isProductMasterModalOpen, setIsProductMasterModalOpen] = useState(false);
  const [isUnitCatalogMasterModalOpen, setIsUnitCatalogMasterModalOpen] = useState(false);
  const [isMessageTemplateModalOpen, setIsMessageTemplateModalOpen] = useState(false);
  const [isGstUqcMergeModalOpen, setIsGstUqcMergeModalOpen] = useState(false);
  const [isStockCorrectionModalOpen, setIsStockCorrectionModalOpen] = useState(false);
  const [isBalanceCorrectionModalOpen, setIsBalanceCorrectionModalOpen] = useState(false);
  const [isBranchMasterModalOpen, setIsBranchMasterModalOpen] = useState(false);
  const [isWarehouseMasterModalOpen, setIsWarehouseMasterModalOpen] = useState(false);
  const [isLocationMasterModalOpen, setIsLocationMasterModalOpen] = useState(false);
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSubmenu = (name, e) => {
    e.preventDefault();
    setOpenSubmenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  // Compute dynamic menu items based on settings
  const displayMenuItems = menuItems.map(item => {
    if (item.name === 'Inventory') {
      const dynamicSubitems = [...item.subitems];
      
      // Insert new items if settings are enabled
      let offset = 0;
      if (settings?.showPurchaseOrder) {
        dynamicSubitems.splice(0, 0, { name: 'Purchase Order', icon: ShoppingCart, path: '/admin/invoice-details/company_purchase_order', hasPlus: true });
        offset++;
      }
      if (settings?.showSalesOrder) {
        dynamicSubitems.splice(2 + offset, 0, { name: 'Sale Order', icon: ShoppingCart, path: '/admin/invoice-details/customer_sale_order', hasPlus: true });
        offset++;
      }
      if (settings?.showCustomerChallan) {
        dynamicSubitems.splice(4 + offset, 0, { name: 'Customer Challan', icon: FileText, path: '/admin/invoice-details/customer_challan_invoice', hasPlus: true });
        offset++;
      }
      if (settings?.showCustomerInvoice) {
        dynamicSubitems.splice(4 + offset, 0, { name: 'Customer Invoice', icon: FileText, path: '/admin/invoice-details/customer_sale', hasPlus: true });
        offset++;
      }

      return { ...item, subitems: dynamicSubitems };
    }
    return item;
  });

  const filteredMenuItems = displayMenuItems.map(item => {
    // If it's not a submenu item, just check its name
    if (!item.hasSubmenu || !item.subitems) {
      if (item.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return item;
      }
      return null;
    }

    // If it has a submenu, filter its subitems
    const filteredSubitems = item.subitems.filter(sub => 
      sub.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Keep the main item if its name matches OR it has matching subitems
    if (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || filteredSubitems.length > 0) {
      return { ...item, subitems: filteredSubitems };
    }

    return null;
  }).filter(Boolean);

  return (
    <>
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
            placeholder="Search"
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
                className={cn(
                  "flex items-center justify-between px-3 py-[10px] text-[13px] font-medium transition-colors min-h-[40px] rounded-lg",
                  "bg-[#4F46E5] text-white shadow-sm shadow-indigo-500/20 hover:opacity-90"
                )}
                onClick={(e) => {
                  if (item.name === 'Logout') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                  }
                  if (item.hasSubmenu) {
                    toggleSubmenu(item.name, e);
                  } else if (onClose && window.innerWidth < 768) {
                    onClose();
                  }
                }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <item.icon className="w-[18px] h-[18px] text-white" strokeWidth={2.5} />
                  <span className="tracking-wide">{t(`sidebar.${item.name}`, item.name)}</span>
                </div>
                {item.hasSubmenu && (
                   <ChevronLeft 
                     className={cn(
                       "w-[14px] h-[14px] text-white transition-transform", 
                       openSubmenus[item.name] && "-rotate-90"
                     )} 
                     strokeWidth={3} 
                   />
                )}
              </NavLink>
              
              {/* Render Submenu if it exists and is open */}
              {item.hasSubmenu && item.subitems && openSubmenus[item.name] && (
                <div className="flex flex-col bg-[#131522] py-1 rounded-lg mt-1 mb-2">
                  {item.subitems.map(subitem => (
                    <NavLink
                      key={subitem.name}
                      to={subitem.path}
                      onClick={(e) => {
                        if (onClose && window.innerWidth < 768 && subitem.path !== '#') {
                          setTimeout(() => onClose(), 150);
                        }
                        if (subitem.name === 'Set Message Template') {
                          e.preventDefault();
                          setIsMessageTemplateModalOpen(true);
                        } else if (subitem.name === 'GST UQC Merge') {
                          e.preventDefault();
                          setIsGstUqcMergeModalOpen(true);
                        } else if (subitem.name === 'Stock Correction') {
                          e.preventDefault();
                          setIsStockCorrectionModalOpen(true);
                        } else if (subitem.name === 'All Balance Correction') {
                          // Allow navigation but also open modal
                          setIsBalanceCorrectionModalOpen(true);
                        }
                      }}
                      className={({ isActive }) => {
                        const isThisModalOpen = 
                          (subitem.name === 'Set Message Template' && isMessageTemplateModalOpen) ||
                          (subitem.name === 'GST UQC Merge' && isGstUqcMergeModalOpen) ||
                          (subitem.name === 'Stock Correction' && isStockCorrectionModalOpen);
                          
                        const anyModalOpen = isMessageTemplateModalOpen || isGstUqcMergeModalOpen || isStockCorrectionModalOpen;
                        
                        const isItemActive = (isActive && subitem.path !== '#' && !anyModalOpen) || isThisModalOpen;

                        return cn(
                          "flex items-center justify-between text-[13px] transition-all duration-150 cursor-pointer group mx-2 px-3 py-[8px] rounded-[4px]",
                          isItemActive
                            ? "bg-[#4F46E5] text-white font-medium shadow-md shadow-indigo-500/20" 
                            : "text-gray-400 hover:text-white hover:bg-[#252733]"
                        );
                      }}
                    >
                      {({ isActive }) => {
                        const isThisModalOpen = 
                          (subitem.name === 'Set Message Template' && isMessageTemplateModalOpen) ||
                          (subitem.name === 'GST UQC Merge' && isGstUqcMergeModalOpen) ||
                          (subitem.name === 'Stock Correction' && isStockCorrectionModalOpen);
                          
                        const anyModalOpen = isMessageTemplateModalOpen || isGstUqcMergeModalOpen || isStockCorrectionModalOpen;
                        
                        const isItemActive = (isActive && subitem.path !== '#' && !anyModalOpen) || isThisModalOpen;

                        return (
                        <>
                          <div className="flex items-start gap-3 mt-0.5">
                            {subitem.icon ? (
                              <subitem.icon className="w-4 h-4 mt-[2px]" strokeWidth={isItemActive ? 2.5 : 2} />
                            ) : (
                              <Circle className="w-4 h-4 mt-[2px]" strokeWidth={isItemActive ? 2.5 : 2} />
                            )}
                            <div className="flex flex-col">
                              <span className={isItemActive ? "font-medium" : ""}>{t(`sidebar_sub.${subitem.name}`, subitem.name)}</span>
                              {subitem.subtitle && <span className="text-[10px] opacity-70 leading-none mt-1">{subitem.subtitle}</span>}
                            </div>
                          </div>
                          {subitem.hasPlus && (
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (subitem.name === 'Bank Master') {
                                  setIsBankMasterModalOpen(true);
                                } else if (subitem.name === 'Branch Master') {
                                  setIsBranchMasterModalOpen(true);
                                } else if (subitem.name === 'Warehouse Master') {
                                  setIsWarehouseMasterModalOpen(true);
                                } else if (subitem.name === 'Location Master') {
                                  setIsLocationMasterModalOpen(true);
                                } else if (subitem.name === 'Company Master') {
                                  setIsCompanyMasterModalOpen(true);
                                } else if (subitem.name === 'Customer Master') {
                                  setIsCustomerMasterModalOpen(true);
                                } else if (subitem.name === 'Category Master') {
                                  setIsCategoryMasterModalOpen(true);
                                } else if (subitem.name === 'Employee Master') {
                                  setIsEmployeeMasterModalOpen(true);
                                } else if (subitem.name === 'Expense Master') {
                                  setIsExpenseMasterModalOpen(true);
                                } else if (subitem.name === 'Income Master') {
                                  setIsIncomeMasterModalOpen(true);
                                } else if (subitem.name === 'Payment Master') {
                                  setIsPaymentMasterModalOpen(true);
                                } else if (subitem.name === 'Item Master') {
                                  setIsItemMasterModalOpen(true);
                                } else if (subitem.name === 'Offer Management') {
                                  setIsOfferManagementModalOpen(true);
                                } else if (subitem.name === 'Unit Catalog Master') {
                                  setIsUnitCatalogMasterModalOpen(true);
                                } else if (subitem.name === 'Purchase') {
                                  navigate('/admin/create_invoices/company_purchase');
                                } else if (subitem.name === 'Purchase Order') {
                                  navigate('/admin/create_invoices/company_purchase_order');
                                } else if (subitem.name === 'Purchase Return') {
                                  navigate('/admin/create_invoices/company_purchase_return');
                                } else if (subitem.name === 'POS') {
                                  navigate('/admin/pos');
                                } else if (subitem.name === 'Sale Order') {
                                  navigate('/admin/sales-order-invoice');
                                } else if (subitem.name === 'Customer Invoice') {
                                  navigate('/admin/customer-invoice-creation');
                                } else if (subitem.name === 'Customer Challan') {
                                  navigate('/admin/customer-challan-creation');
                                } else if (subitem.name === 'Sales') {
                                  navigate('/admin/sales-invoice');
                                } else if (subitem.name === 'Sales Return') {
                                  navigate('/admin/sales-return-invoice');
                                } else if (subitem.name === 'Quotation') {
                                  navigate('/admin/quotation-invoice');
                                } else if (subitem.name === 'Stock Adjustment') {
                                  navigate('/admin/stock-adjustment-invoice');
                                } else if (subitem.name === 'Customer Outstanding') {
                                  navigate('/admin/party-ledger/customer_payment');
                                } else if (subitem.name === 'Company Outstanding') {
                                  navigate('/admin/party-ledger/company_payment');
                                } else if (subitem.name === 'Cash & Bank summary') {
                                  navigate('/admin/bank-ledger');
                                }
                              }}
                              className="z-10 cursor-pointer"
                            >
                              {isItemActive ? (
                                <div className="w-[20px] h-[20px] flex items-center justify-center rounded-full bg-white/20">
                                  <Plus className="w-3 h-3 text-white" strokeWidth={4} />
                                </div>
                              ) : (
                                <Plus className="w-3 h-3 text-white opacity-80 group-hover:opacity-100" strokeWidth={3} />
                              )}
                            </div>
                          )}
                        </>
                        );
                      }}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>


    </aside>
    <CashBankMasterModal 
      isOpen={isBankMasterModalOpen} 
      onClose={() => setIsBankMasterModalOpen(false)} 
    />
    <PartyMasterModal
      isOpen={isCompanyMasterModalOpen}
      onClose={() => setIsCompanyMasterModalOpen(false)}
      defaultType="COMPANY"
    />
    <PartyMasterModal
      isOpen={isCustomerMasterModalOpen}
      onClose={() => setIsCustomerMasterModalOpen(false)}
      defaultType="CUSTOMER"
    />
    <CategoryMasterModal
      isOpen={isCategoryMasterModalOpen}
      onClose={() => setIsCategoryMasterModalOpen(false)}
    />
    <EmployeeMasterModal
      isOpen={isEmployeeMasterModalOpen}
      onClose={() => setIsEmployeeMasterModalOpen(false)}
    />
    <ExpenseMasterModal
      isOpen={isExpenseMasterModalOpen}
      onClose={() => setIsExpenseMasterModalOpen(false)}
    />
    <IncomeMasterModal
      isOpen={isIncomeMasterModalOpen}
      onClose={() => setIsIncomeMasterModalOpen(false)}
    />
    <PaymentMasterModal
      isOpen={isPaymentMasterModalOpen}
      onClose={() => setIsPaymentMasterModalOpen(false)}
    />
    <ItemMasterModal
      isOpen={isItemMasterModalOpen}
      onClose={() => setIsItemMasterModalOpen(false)}
    />
    <OfferManagementModal
      isOpen={isOfferManagementModalOpen}
      onClose={() => setIsOfferManagementModalOpen(false)}
    />
    {/* <ProductMasterModal
      isOpen={isProductMasterModalOpen}
      onClose={() => setIsProductMasterModalOpen(false)}
    /> */}
    <UnitCatalogMasterModal
      isOpen={isUnitCatalogMasterModalOpen}
      onClose={() => setIsUnitCatalogMasterModalOpen(false)}
    />
    <MessageTemplateModal
      isOpen={isMessageTemplateModalOpen}
      onClose={() => setIsMessageTemplateModalOpen(false)}
    />
    <GstUqcMergeModal
      isOpen={isGstUqcMergeModalOpen}
      onClose={() => setIsGstUqcMergeModalOpen(false)}
    />
    <StockCorrectionModal
      isOpen={isStockCorrectionModalOpen}
      onClose={() => setIsStockCorrectionModalOpen(false)}
    />
    <BalanceCorrectionModal
      isOpen={isBalanceCorrectionModalOpen}
      onClose={() => setIsBalanceCorrectionModalOpen(false)}
    />
    <BranchMasterModal
      isOpen={isBranchMasterModalOpen}
      onClose={() => setIsBranchMasterModalOpen(false)}
    />
    <WarehouseMasterModal
      isOpen={isWarehouseMasterModalOpen}
      onClose={() => setIsWarehouseMasterModalOpen(false)}
    />
    <LocationMasterModal
      isOpen={isLocationMasterModalOpen}
      onClose={() => setIsLocationMasterModalOpen(false)}
    />
    </>
  );
}
