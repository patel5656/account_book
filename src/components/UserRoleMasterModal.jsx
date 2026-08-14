import React, { useState } from 'react';
import { X } from 'lucide-react';

export function UserRoleMasterModal({ isOpen, onClose, defaultRoleName, onSave }) {
  const [roleName, setRoleName] = useState(defaultRoleName || '');
  const [activeTab, setActiveTab] = useState('Masters');

  // Sync state when defaultRoleName changes
  React.useEffect(() => {
    if (defaultRoleName) {
      setRoleName(defaultRoleName);
    }
  }, [defaultRoleName]);

  const tabs = [
    'Dashboard',
    'Masters',
    'Inventory',
    'POS Billing',
    'Bill Book',
    'Account',
    'Account Summary',
    'Inventory Summary',
    'Final Accounts',
    'GSTR\'s Summary',
    'Tools',
    'Audit Logs',
    'Settings'
  ];

  // All possible permission columns structure
  const masterPermissionColumns = [
    { key: 'view', label: 'View' },
    { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' },
    { key: 'undoMerge', label: 'Undo Merge' },
    { key: 'export', label: 'Export' },
    { key: 'backdateAccess', label: 'Backdate Access' },
    { key: 'showBalance', label: 'Show Balance' }
  ];

  const standardPermissionColumns = [
    { key: 'view', label: 'View' },
    { key: 'create', label: 'Create' },
    { key: 'edit', label: 'Edit' },
    { key: 'delete', label: 'Delete' }
  ];

  const viewOnlyPermissionColumns = [
    { key: 'view', label: 'View' }
  ];

  const viewOnlyTabs = [
    'Dashboard',
    'Account Summary',
    'Inventory Summary',
    'Final Accounts',
    'GSTR\'s Summary',
    'Audit Logs'
  ];

  const permissionColumns = 
    activeTab === 'Masters' 
      ? masterPermissionColumns 
      : viewOnlyTabs.includes(activeTab) 
        ? viewOnlyPermissionColumns 
        : standardPermissionColumns;

  // Define software menus & submenus based on active tab
  const getSubmenusForTab = (tab) => {
    switch (tab) {
      case 'Dashboard':
        return ['Dashboard View'];
      case 'Masters':
        return [
          'Bank Master',
          'Company Master',
          'Customer Master',
          'Category Master',
          'Employee Master',
          'Expense Master',
          'Income Master',
          'Payment Master',
          'Item Master',
          'Offer Management',
          'BOM Master',
          'Voucher master'
        ];
      case 'Inventory':
        return [
          'Purchase Order',
          'Purchase',
          'Purchase Return',
          'Sale Order',
          'Warehouse Master',
          'Branch Master',
          'Customer Challan',
          'Customer Invoice',
          'Location Master',
          'Stock Transfer',
          'Sales',
          'Sales Return',
          'Quotation',
          'Stock Adjustment',
          'Stock Inventory'
        ];
      case 'POS Billing':
        return ['POS Billing'];
      case 'Bill Book':
        return ['Bill Book'];
      case 'Account':
        return [
          'Customer Ledger',
          'Company Ledger',
          'Bank Book',
          'Employee Ledger',
          'Expenses Ledger',
          'Incomes Ledger',
          'Payment Ledger',
          'Employee Attendance'
        ];
      case 'Account Summary':
        return [
          'Customer Outstanding',
          'Company Outstanding',
          'Stock summary',
          'Sale summary',
          'Purchase summary',
          'Cash & Bank summary',
          'Expenses summary',
          'Day Book Summary',
          'Expiry Report',
          'Order List'
        ];
      case 'Inventory Summary':
        return [
          'Brandwise Sale',
          'Brandwise Purchase',
          'Categorywise Sale',
          'Categorywise Purchase',
          'Item wise Sale',
          'Item wise Purchase',
          'Employeewise Sale',
          'Invoices Report'
        ];
      case 'Final Accounts':
        return [
          'Trading Account',
          'Profit and Loss Account',
          'Balance Sheet',
          'TCS Report',
          'Daily Cash Book'
        ];
      case 'GSTR\'s Summary':
        return [
          'GSTR-1',
          'GSTR-2',
          'GSTR-3B',
          'Sale Summary',
          'Sale Return',
          'Purchase Summary',
          'Purchase Return',
          'GST-WISE Summary',
          'HSN-WISE Summary'
        ];
      case 'Tools':
        return [
          'Complaint',
          'Service Reminder',
          'Set Message Template',
          'BarCode',
          'Bank Statement Import',
          'HSN & GST Error',
          'GST UQC Merge',
          'Stock Correction',
          'Stock Price Update',
          'All Balance Correction',
          'Invalid Units Correction',
          'Recycle Bin',
          'Notification Permission',
          'Hard Refresh Local Data'
        ];
      case 'Audit Logs':
        return ['Audit Logs View'];
      case 'Settings':
        return ['Print Setting'];
      default:
        return [];
    }
  };

  // State to hold permissions structure: { [submenuName]: { view: boolean, create: boolean, ... } }
  const [permissions, setPermissions] = useState({});

  const togglePermission = (submenu, columnKey) => {
    setPermissions((prev) => {
      const submenuPerms = prev[submenu] || {};
      return {
        ...prev,
        [submenu]: {
          ...submenuPerms,
          [columnKey]: !submenuPerms[columnKey]
        }
      };
    });
  };

  const handleCheckAll = () => {
    const currentSubmenus = getSubmenusForTab(activeTab);
    const isMasters = activeTab === 'Masters';
    const isViewOnly = viewOnlyTabs.includes(activeTab);
    setPermissions((prev) => {
      const updated = { ...prev };
      currentSubmenus.forEach((submenu) => {
        updated[submenu] = isMasters
          ? {
              view: true,
              create: true,
              edit: true,
              delete: true,
              undoMerge: true,
              export: true,
              backdateAccess: true,
              showBalance: true
            }
          : isViewOnly
            ? {
                view: true
              }
            : {
                view: true,
                create: true,
                edit: true,
                delete: true
              };
      });
      return updated;
    });
  };

  const handleUncheckAll = () => {
    const currentSubmenus = getSubmenusForTab(activeTab);
    const isMasters = activeTab === 'Masters';
    const isViewOnly = viewOnlyTabs.includes(activeTab);
    setPermissions((prev) => {
      const updated = { ...prev };
      currentSubmenus.forEach((submenu) => {
        updated[submenu] = isMasters
          ? {
              view: false,
              create: false,
              edit: false,
              delete: false,
              undoMerge: false,
              export: false,
              backdateAccess: false,
              showBalance: false
            }
          : isViewOnly
            ? {
                view: false
              }
            : {
                view: false,
                create: false,
                edit: false,
                delete: false
              };
      });
      return updated;
    });
  };

  if (!isOpen) return null;

  const submenus = getSubmenusForTab(activeTab);

  const handleSave = () => {
    if (!roleName.trim()) return;
    onSave(roleName.trim(), permissions);
  };

  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
    >
      <div className="bg-[#f0f4f8] w-full max-w-7xl rounded-md shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-[#0e9aa7] px-5 py-3 flex justify-between items-center text-white">
          <h2 className="text-[18px] font-bold">User Role Master</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors bg-red-600 rounded px-1.5 py-0.5 flex items-center justify-center"
          >
            <X className="w-5 h-5 stroke-[3px]" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-[14px] font-bold text-gray-700 mb-1">Enter User Role</label>
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Accountant"
              className="w-full border border-gray-300 rounded px-3 py-2 text-[14px] outline-none focus:border-[#0e9aa7]"
            />
          </div>

          <h3 className="text-[18px] font-bold text-gray-700 border-b pb-1 mt-4">User's Permissions</h3>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1.5 border-b border-gray-300 pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-[13px] font-semibold rounded border transition-all ${
                  activeTab === tab
                    ? 'bg-white text-[#0e9aa7] border-[#0e9aa7] shadow-sm'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Bulk Toggles */}
          <div className="flex items-center gap-6 py-2">
            <button
              onClick={handleCheckAll}
              className="flex items-center gap-1.5 text-[13px] font-bold text-gray-700 hover:text-black bg-white px-2 py-1 rounded border shadow-sm"
            >
              <div className="w-4 h-4 rounded-full border-2 border-gray-400 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
              </div>
              Check All
            </button>
            <button
              onClick={handleUncheckAll}
              className="flex items-center gap-1.5 text-[13px] font-bold text-gray-700 hover:text-black bg-white px-2 py-1 rounded border shadow-sm"
            >
              <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
              Uncheck All
            </button>
          </div>

          {/* Permissions Grid / Table */}
          <div className="border border-gray-200 rounded overflow-hidden shadow-sm bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-200 text-[12px] font-bold text-gray-600 uppercase tracking-wider">
                    <th className="py-2.5 px-4 text-center border-r border-gray-200 min-w-[200px]">Permissions</th>
                    {permissionColumns.map((col) => (
                      <th key={col.key} className="py-2.5 px-2 text-center border-r border-gray-200 font-bold">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submenus.map((submenu) => (
                    <tr key={submenu} className="border-b border-gray-200 hover:bg-gray-50 text-[13px]">
                      <td className="py-2 px-4 font-semibold text-gray-700 border-r border-gray-200 text-center">
                        {submenu}
                      </td>
                      {permissionColumns.map((col) => {
                        const isChecked = !!(permissions[submenu] && permissions[submenu][col.key]);
                        return (
                          <td key={col.key} className="py-2 px-2 text-center border-r border-gray-200">
                            <div className="flex justify-center items-center">
                              <button
                                onClick={() => togglePermission(submenu, col.key)}
                                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-[#dc3545]`}
                                style={{ backgroundColor: isChecked ? '#dc3545' : '#888' }}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    isChecked ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-white p-4 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded bg-white hover:bg-gray-50 text-[14px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!roleName.trim()}
            className="px-6 py-2 bg-[#0e9aa7] hover:bg-[#0c8893] text-white font-semibold rounded text-[14px] transition-colors disabled:opacity-50"
          >
            Save Role Permissions
          </button>
        </div>
      </div>
    </div>
  );
}
