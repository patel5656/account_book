import React, { useState, useEffect } from 'react';
import { Link2, ChevronUp, Edit, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import apiClient from '../api/apiClient';
import { cn } from '../utils';
import { useSettings } from '../context/SettingsContext';
import PageSettingModal from './PageSettingModal';
import { getBarcodeSettings, createBarcodeSetting, deleteBarcodeSetting } from '../api/barcodeSettings';

export function SettingsDrawer({ isOpen, onClose }) {
  const location = useLocation();
  const { t } = useTranslation();
  const { settings, toggleSetting, updateSetting } = useSettings();
  const [currencies, setCurrencies] = useState([]);
  const [showVariantsModal, setShowVariantsModal] = useState(false);
  const [isLabelDropdownOpen, setIsLabelDropdownOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('50mm X 25mm');
  const [isPageSettingModalOpen, setIsPageSettingModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);


  const [labels, setLabels] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchCurrencies();
      fetchBarcodeLabels();
    }
  }, [isOpen]);

  const fetchBarcodeLabels = async () => {
    try {
      const response = await getBarcodeSettings();
      if (response.success) {
        setLabels(response.data);
        if (response.data.length > 0 && !selectedLabel) {
           setSelectedLabel(response.data[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching barcode templates:", error);
    }
  };

  const handleAddLabel = async (name) => {
    if (!name || name.trim() === '') return;
    const currentVal = name.trim();
    const existing = labels.find(lbl => lbl.name.toLowerCase() === currentVal.toLowerCase());
    if (!existing) {
      try {
        const response = await createBarcodeSetting({ name: currentVal });
        if (response.success) {
          setLabels([...labels, response.data]);
          setSelectedLabel(response.data.name);
        }
      } catch (error) {
        console.error("Error creating label:", error);
      }
    }
  };

  const handleDeleteLabel = async (id, name) => {
    try {
      const response = await deleteBarcodeSetting(id);
      if (response.success) {
        setLabels(labels.filter(l => l.id !== id));
        if (selectedLabel === name) {
          setSelectedLabel('');
        }
      }
    } catch (error) {
      console.error("Error deleting label:", error);
    }
  };

  const fetchCurrencies = async () => {
    try {
      const response = await apiClient.get('/currencies');
      if (response.data.success) {
        setCurrencies(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching currencies:", error);
    }
  };

  if (!isOpen) return null;

  const isLedgerRoute = location.pathname.includes('/party-ledger/');
  const isBarcodeRoute = location.pathname.includes('/barcode');
  const isStockPriceUpdateRoute = location.pathname.includes('/stock-price-update') || location.pathname.includes('/items_quantity_report');
  const isCustomerInvoiceCreation = location.pathname.includes('/customer-invoice-creation') || 
                                    location.pathname.includes('/create_invoices/company_purchase') || 
                                    location.pathname.includes('/customer-challan-creation') || 
                                    location.pathname.includes('/sales-invoice') ||
                                    location.pathname.includes('/sales-order-invoice') ||
                                    location.pathname.includes('/sales-return-invoice') ||
                                    location.pathname.includes('/quotation-invoice');
  const isInvoiceRoute = location.pathname.includes('/create_invoices/') || 
                         location.pathname.includes('/quotation-invoice') || 
                         location.pathname.includes('/stock-adjustment-invoice');

  if (isCustomerInvoiceCreation) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-transparent z-[60]" 
          onClick={onClose}
        />
        
        {/* Dropdown Menu */}
        <div className="fixed top-[45px] right-[10px] w-[260px] max-h-[calc(100vh-60px)] bg-[#2a2f35] shadow-2xl z-[70] flex flex-col animate-in fade-in duration-200 border border-gray-700/50 rounded-b-[4px]">
          
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
            <div className="space-y-[8px] flex flex-col">
               <ToggleSetting label="Show Shipping Party" checked={settings.showShippingParty} onChange={() => toggleSetting('showShippingParty')} />
               <ToggleSetting label="Show Company" checked={settings.showCompany} onChange={() => toggleSetting('showCompany')} />
               <ToggleSetting label="Show Product Code" checked={settings.showProductCode} onChange={() => toggleSetting('showProductCode')} />
               <ToggleSetting label="Show SKU" checked={settings.showSKU} onChange={() => toggleSetting('showSKU')} />
               <ToggleSetting label="Show Batch No" checked={settings.showBatchNo} onChange={() => toggleSetting('showBatchNo')} />
               <ToggleSetting label="Show GST" checked={settings.showGST} onChange={() => toggleSetting('showGST')} />
               <ToggleSetting label="Show HSN" checked={settings.showHSN} onChange={() => toggleSetting('showHSN')} />
               <ToggleSetting label="Show MRP" checked={settings.showMRP} onChange={() => toggleSetting('showMRP')} />
               <ToggleSetting label="Show Purchase Price" checked={settings.showPurchasePrice} onChange={() => toggleSetting('showPurchasePrice')} />
               <ToggleSetting label="Show Discount 1" checked={settings.showDiscount} onChange={() => toggleSetting('showDiscount')} />
               <ToggleSetting label="Show Discount 2" checked={settings.showDiscount2} onChange={() => toggleSetting('showDiscount2')} />
               <ToggleSetting label="Show Total Discount" checked={!settings.hideTotalDiscount} onChange={() => toggleSetting('hideTotalDiscount')} />
               <ToggleSetting label="Show Fright Charge" checked={!settings.hideFreightCharge} onChange={() => toggleSetting('hideFreightCharge')} />
               <ToggleSetting label="P.QTY" checked={settings.primaryOpeningQty} onChange={() => toggleSetting('primaryOpeningQty')} />
               <ToggleSetting label="P.Unit" checked={settings.pUnit} onChange={() => toggleSetting('pUnit')} />
               <ToggleSetting label="S.QTY" checked={settings.secOpeningQty} onChange={() => toggleSetting('secOpeningQty')} />
               <ToggleSetting label="S.Unit" checked={settings.sUnit} onChange={() => toggleSetting('sUnit')} />
               <ToggleSetting label="Show Price Warning" checked={settings.showPriceWarning} onChange={() => toggleSetting('showPriceWarning')} />

               {!location.pathname.toLowerCase().includes('purchase') && (
                 <ToggleSetting label="Negative Stock Lock" checked={settings.negativeStockLock} onChange={() => toggleSetting('negativeStockLock')} />
               )}
               <ToggleSetting label="Use Product Code" checked={settings.useProductCode} onChange={() => toggleSetting('useProductCode')} />
               <ToggleSetting label="Sale by Commission" checked={settings.saleByCommission} onChange={() => toggleSetting('saleByCommission')} />
               <ToggleSetting label="Manufacture" checked={settings.manufacture} onChange={() => toggleSetting('manufacture')} />
               <ToggleSetting label="Set Reminder Date" checked={settings.setReminderDate} onChange={() => toggleSetting('setReminderDate')} />
               <ToggleSetting label="Customer-wise Rate" checked={settings.customerWiseRate} onChange={() => toggleSetting('customerWiseRate')} />
               <ToggleSetting label="Show IMEI" checked={settings.showIMEI} onChange={() => toggleSetting('showIMEI')} />
               <ToggleSetting label="Show Free" checked={settings.showFreeQty} onChange={() => toggleSetting('showFreeQty')} />
               <ToggleSetting label="Show Offers" checked={settings.showOffers} onChange={() => toggleSetting('showOffers')} />
               <ToggleSetting label="Show Loyalty Points" checked={settings.showLoyaltyPoints} onChange={() => toggleSetting('showLoyaltyPoints')} />
               <ToggleSetting label="Manage Variants" checked={settings.manageVariants} onChange={() => {
                 toggleSetting('manageVariants');
                 if (!settings.manageVariants) {
                   setShowVariantsModal(true);
                 } else {
                   setShowVariantsModal(false);
                 }
               }} />
               <ToggleSetting label="Quantity Calculator" checked={settings.quantityCalculator} onChange={() => toggleSetting('quantityCalculator')} />
            </div>
            
            {/* Select Inputs at bottom of dropdown */}
            <div className="mt-4 space-y-3 pb-2">
              <div>
                <label className="block text-white text-[11px] font-bold mb-1">Customer Wise Rate Type</label>
                <select className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" value={settings.customerWiseRateType || 'Both'} onChange={(e) => updateSetting('customerWiseRateType', e.target.value)}>
                  <option value="Both">Both</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Amount">Amount</option>
                </select>
              </div>



              <div>
                <label className="block text-white text-[11px] font-bold mb-1">Voucher Head</label>
                <input type="text" value={settings.voucherHead || ''} onChange={(e) => updateSetting('voucherHead', e.target.value)} className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" />
              </div>

              <div>
                <label className="block text-white text-[11px] font-bold mb-1">Voucher Heads</label>
                <select className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" value={settings.voucherHeads || ''} onChange={(e) => updateSetting('voucherHeads', e.target.value)}>
                  <option value="">Select Voucher Head</option>
                </select>
              </div>



              <div>
                <label className="block text-white text-[11px] font-bold mb-1">Batch Date Input Type</label>
                <select className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" value={settings.batchDateInputType || 'Month'} onChange={(e) => updateSetting('batchDateInputType', e.target.value)}>
                  <option value="Month">Month</option>
                  <option value="Date">Date</option>
                  <option value="Year">Year</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-[11px] font-bold mb-1">Points Value (in %)</label>
                <input type="number" value={settings.pointsValue || 0} onChange={(e) => updateSetting('pointsValue', parseFloat(e.target.value))} className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" />
              </div>

              <div>
                <label className="block text-white text-[11px] font-bold mb-1">Invoice Round Up</label>
                <input type="number" value={settings.invoiceRoundUp || 0} onChange={(e) => updateSetting('invoiceRoundUp', parseFloat(e.target.value))} className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" />
              </div>

              <div>
                <label className="block text-white text-[11px] font-bold mb-1">TCS (in %)</label>
                <input type="number" value={settings.tcs || 0} onChange={(e) => updateSetting('tcs', parseFloat(e.target.value))} className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" />
              </div>

              <div>
                <label className="block text-white text-[11px] font-bold mb-1">Whole Sale Profit %</label>
                <input type="number" value={settings.wholeSaleProfit || 0} onChange={(e) => updateSetting('wholeSaleProfit', parseFloat(e.target.value))} className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white text-[11px] font-bold mb-1">Sale Profit %</label>
                  <input type="number" value={settings.saleProfit || 0} onChange={(e) => updateSetting('saleProfit', parseFloat(e.target.value))} className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" />
                </div>
                <div>
                  <label className="block text-white text-[11px] font-bold mb-1">Round up to</label>
                  <input type="number" value={settings.roundUpTo || 2} onChange={(e) => updateSetting('roundUpTo', parseInt(e.target.value))} className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white text-[11px] font-bold mb-1">Default Unit</label>
                  <input type="text" value={settings.defaultUnit || 'pcs'} onChange={(e) => updateSetting('defaultUnit', e.target.value)} className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" />
                </div>
                <div>
                  <label className="block text-white text-[11px] font-bold mb-1">GST UQC</label>
                  <select className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" value={settings.gstUqc || 'PCS-PIECES'} onChange={(e) => updateSetting('gstUqc', e.target.value)}>
                    <option value="PCS-PIECES">PCS-PIECES</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white text-[11px] font-bold mb-1">Default Product Type</label>
                <select className="w-full bg-white text-gray-800 text-[12px] rounded-[3px] px-2 py-1 outline-none" value={settings.defaultProductType || 'Product'} onChange={(e) => updateSetting('defaultProductType', e.target.value)}>
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                </select>
              </div>

              {/* Extra Column Table */}
              <div className="border border-gray-600 rounded-[3px] overflow-hidden mt-4">
                <div className="grid grid-cols-[1fr_1fr_30px] bg-[#1a1d21] border-b border-gray-600">
                  <div className="text-white text-[11px] font-bold p-1 border-r border-gray-600">Extra Column</div>
                  <div className="text-white text-[11px] font-bold p-1 border-r border-gray-600">Default Value</div>
                  <div className="bg-[#198754] flex items-center justify-center cursor-pointer hover:bg-[#157347]">
                    <span className="text-white text-[14px] font-bold leading-none">+</span>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_1fr_30px] bg-white">
                  <input type="text" placeholder="Ex. P.O." className="w-full text-gray-800 text-[11px] p-1 outline-none border-r border-gray-300" />
                  <input type="text" placeholder="1" className="w-full text-gray-800 text-[11px] p-1 outline-none border-r border-gray-300" />
                  <div className="bg-gray-100 flex items-center justify-center border-t border-gray-300">
                    <span className="text-gray-400 text-[10px]">#</span>
                  </div>
                </div>
              </div>

              {/* Extra Charges Table */}
              <div className="border border-gray-600 rounded-[3px] overflow-hidden mt-2">
                <div className="grid grid-cols-[1fr_30px] bg-[#1a1d21] border-b border-gray-600">
                  <div className="text-white text-[11px] font-bold p-1 text-center border-r border-gray-600">Extra Charges</div>
                  <div className="bg-[#198754] flex items-center justify-center cursor-pointer hover:bg-[#157347]">
                    <span className="text-white text-[14px] font-bold leading-none">+</span>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_30px] bg-white">
                  <input type="text" placeholder="Ex. Paking & Forwading" className="w-full text-gray-800 text-[11px] p-1 outline-none border-r border-gray-300" />
                  <div className="bg-gray-100 flex items-center justify-center border-t border-gray-300">
                    <span className="text-gray-400 text-[10px]">#</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-700/50 flex justify-end gap-2 bg-[#2a2f35] rounded-b-[4px]">
            <button 
              onClick={() => {
                alert('Settings saved successfully!');
                onClose();
              }} 
              className="bg-[#198754] hover:bg-[#157347] text-white px-3 py-1 rounded-[3px] text-[12px] font-bold transition-colors"
            >
              Save
            </button>
            <button 
              onClick={onClose}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white px-3 py-1 rounded-[3px] text-[12px] font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </>
    );
  }

  if (isInvoiceRoute) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/20 z-[60] transition-opacity" 
          onClick={onClose}
        />
        
        {/* Drawer */}
        <div className="fixed top-[45px] right-0 h-[calc(100vh-45px)] w-[280px] sm:w-[320px] bg-[#2a2f35] shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300 border-l border-b border-gray-700/50">
          
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            
            {/* Settings List */}
            <div className="space-y-[15px] mt-2">
              <ToggleSetting label="Manufacture" checked={settings.manufacture} onChange={() => toggleSetting('manufacture')} />
              <ToggleSetting label="Single Payment Mode" checked={settings.singlePaymentMode} onChange={() => toggleSetting('singlePaymentMode')} />
              <ToggleSetting label="Set Reminder Date" checked={settings.setReminderDate} onChange={() => toggleSetting('setReminderDate')} />
              <ToggleSetting label="Auto Credit Invoice" checked={settings.autoCreditInvoice} onChange={() => toggleSetting('autoCreditInvoice')} />
              <ToggleSetting label="Customer-wise Rate" checked={settings.customerWiseRate} onChange={() => toggleSetting('customerWiseRate')} />
              <ToggleSetting label="Default Cash Payment" checked={settings.defaultCashPayment} onChange={() => toggleSetting('defaultCashPayment')} />
              <ToggleSetting label="Show IMEI" checked={settings.showIMEI} onChange={() => toggleSetting('showIMEI')} />
              <ToggleSetting label="Show Free" checked={settings.showFreeQty} onChange={() => toggleSetting('showFreeQty')} />
              <ToggleSetting label="Manage Variants" checked={settings.manageVariants} onChange={() => {
                toggleSetting('manageVariants');
                if (!settings.manageVariants) {
                  setShowVariantsModal(true);
                } else {
                  setShowVariantsModal(false);
                }
              }} />
              <ToggleSetting label="Quantity Calculator" checked={settings.quantityCalculator} onChange={() => toggleSetting('quantityCalculator')} />
            </div>

            {/* Select and Input Fields */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-white text-[12.5px] font-bold mb-1">Customer Wise Rate Type</label>
                <select className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" value={settings.customerWiseRateType || 'Both'} onChange={(e) => updateSetting('customerWiseRateType', e.target.value)}>
                  <option value="Both">Both</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Amount">Amount</option>
                </select>
              </div>



              <div>
                <label className="block text-white text-[12.5px] font-bold mb-1">Voucher Head</label>
                <input 
                  type="text" 
                  value={settings.voucherHead || ''}
                  onChange={(e) => updateSetting('voucherHead', e.target.value)}
                  className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" 
                />
              </div>

              <div>
                <label className="block text-white text-[12.5px] font-bold mb-1">Voucher Heads</label>
                <select className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" value={settings.voucherHeads || ''} onChange={(e) => updateSetting('voucherHeads', e.target.value)}>
                  <option value="">Select Voucher Head</option>
                </select>
              </div>



              <div>
                <label className="block text-white text-[12.5px] font-bold mb-1">Batch Date Input Type</label>
                <select className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" value={settings.batchDateInputType || 'Month'} onChange={(e) => updateSetting('batchDateInputType', e.target.value)}>
                  <option value="Month">Month</option>
                  <option value="Date">Date</option>
                  <option value="Year">Year</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-[12.5px] font-bold mb-1">Points Value (in %)</label>
                <input type="number" value={settings.pointsValue || 0} onChange={(e) => updateSetting('pointsValue', parseFloat(e.target.value))} className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" />
              </div>

              <div>
                <label className="block text-white text-[12.5px] font-bold mb-1">Invoice Round Up</label>
                <input type="number" value={settings.invoiceRoundUp || 0} onChange={(e) => updateSetting('invoiceRoundUp', parseFloat(e.target.value))} className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" />
              </div>

              <div>
                <label className="block text-white text-[12.5px] font-bold mb-1">TCS (in %)</label>
                <input type="number" value={settings.tcs || 0} onChange={(e) => updateSetting('tcs', parseFloat(e.target.value))} className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" />
              </div>

              <div>
                <label className="block text-white text-[12.5px] font-bold mb-1">Whole Sale Profit %</label>
                <input type="number" value={settings.wholeSaleProfit || 0} onChange={(e) => updateSetting('wholeSaleProfit', parseFloat(e.target.value))} className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white text-[12.5px] font-bold mb-1">Sale Profit %</label>
                  <input type="number" value={settings.saleProfit || 0} onChange={(e) => updateSetting('saleProfit', parseFloat(e.target.value))} className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" />
                </div>
                <div>
                  <label className="block text-white text-[12.5px] font-bold mb-1">Round up to</label>
                  <input type="number" value={settings.roundUpTo || 2} onChange={(e) => updateSetting('roundUpTo', parseInt(e.target.value))} className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-white text-[12.5px] font-bold mb-1">Default Unit</label>
                  <input type="text" value={settings.defaultUnit || 'pcs'} onChange={(e) => updateSetting('defaultUnit', e.target.value)} className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" />
                </div>
                <div>
                  <label className="block text-white text-[12.5px] font-bold mb-1">GST UQC</label>
                  <select className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" value={settings.gstUqc || 'PCS-PIECES'} onChange={(e) => updateSetting('gstUqc', e.target.value)}>
                    <option value="PCS-PIECES">PCS-PIECES</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-white text-[12.5px] font-bold mb-1">Default Product Type</label>
                <select className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" value={settings.defaultProductType || 'Product'} onChange={(e) => updateSetting('defaultProductType', e.target.value)}>
                  <option value="Product">Product</option>
                  <option value="Service">Service</option>
                </select>
              </div>

              {/* Extra Column Table */}
              <div className="border border-gray-600 rounded-[3px] overflow-hidden mt-4">
                <div className="grid grid-cols-[1fr_1fr_30px] bg-[#1a1d21] border-b border-gray-600">
                  <div className="text-white text-[12px] font-bold p-1.5 border-r border-gray-600">Extra Column</div>
                  <div className="text-white text-[12px] font-bold p-1.5 border-r border-gray-600">Default Value</div>
                  <div className="bg-[#198754] flex items-center justify-center cursor-pointer hover:bg-[#157347]">
                    <span className="text-white text-[14px] font-bold leading-none">+</span>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_1fr_30px] bg-white">
                  <input type="text" placeholder="Ex. P.O." className="w-full text-gray-800 text-[12px] p-1.5 outline-none border-r border-gray-300" />
                  <input type="text" placeholder="1" className="w-full text-gray-800 text-[12px] p-1.5 outline-none border-r border-gray-300" />
                  <div className="bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-[10px]">#</span>
                  </div>
                </div>
              </div>

              {/* Extra Charges Table */}
              <div className="border border-gray-600 rounded-[3px] overflow-hidden mt-4">
                <div className="grid grid-cols-[1fr_30px] bg-[#1a1d21] border-b border-gray-600">
                  <div className="text-white text-[12px] font-bold p-1.5 text-center border-r border-gray-600">Extra Charges</div>
                  <div className="bg-[#198754] flex items-center justify-center cursor-pointer hover:bg-[#157347]">
                    <span className="text-white text-[14px] font-bold leading-none">+</span>
                  </div>
                </div>
                <div className="grid grid-cols-[1fr_30px] bg-white">
                  <input type="text" placeholder="Ex. Paking & Forwading" className="w-full text-gray-800 text-[12px] p-1.5 outline-none border-r border-gray-300" />
                  <div className="bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-[10px]">#</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-700/50 flex justify-end gap-2 bg-[#2a2f35]">
            <button onClick={onClose} className="bg-[#198754] hover:bg-[#157347] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors">
              Save
            </button>
            <button 
              onClick={onClose}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              Close
            </button>
          </div>

        </div>

      </>
    );
  }

  if (isStockPriceUpdateRoute) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/20 z-[60] transition-opacity" 
          onClick={onClose}
        />
        
        {/* Drawer */}
        <div className="fixed top-[45px] right-0 h-auto max-h-[calc(100vh-45px)] w-[280px] sm:w-[320px] bg-[#2a2f35] shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300 border-l border-b border-gray-700/50">
          
          {/* Scrollable Content */}
          <div className="overflow-y-auto p-4 custom-scrollbar">
            
            {/* Settings List */}
            <div className="space-y-[15px] mt-2">
              <ToggleSetting label="Show Product Code" checked={settings.showProductCodeField} onChange={() => toggleSetting('showProductCodeField')} />
              <ToggleSetting label="Show Brand Name" checked={settings.showBrandName} onChange={() => toggleSetting('showBrandName')} />
              <ToggleSetting label="Show Category" checked={settings.showCategory} onChange={() => toggleSetting('showCategory')} />
              <ToggleSetting label="Show GST" checked={settings.showGST} onChange={() => toggleSetting('showGST')} />
              <ToggleSetting label="Show HSN" checked={settings.showHSN} onChange={() => toggleSetting('showHSN')} />
              <ToggleSetting label="Show Cash Sale Price" checked={settings.showCashSalePrice} onChange={() => toggleSetting('showCashSalePrice')} />
              <ToggleSetting label="Show Loyalty Points (Pts)" checked={settings.showCreditSalePrice} onChange={() => toggleSetting('showCreditSalePrice')} />
              <ToggleSetting label="Show MRP" checked={settings.showMRP} onChange={() => toggleSetting('showMRP')} />
              <ToggleSetting label="Show Whole Sale Price" checked={settings.showWholeSalePrice} onChange={() => toggleSetting('showWholeSalePrice')} />
              <ToggleSetting label="Show Purchase Price" checked={settings.showPurchasePrice} onChange={() => toggleSetting('showPurchasePrice')} />
              <ToggleSetting label="Show Branches" checked={settings.showBranches} onChange={() => toggleSetting('showBranches')} />
              <ToggleSetting label="Show Stock Qty" checked={settings.showStockQty} onChange={() => toggleSetting('showStockQty')} />
            </div>

          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-700/50 flex justify-end gap-2 bg-[#2a2f35]">
            <button onClick={onClose} className="bg-[#198754] hover:bg-[#157347] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors">
              Save
            </button>
            <button 
              onClick={onClose}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </>
    );
  }

  if (isBarcodeRoute) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-transparent z-[60]" 
          onClick={onClose}
        />
        
        {/* Dropdown Menu */}
        <div className="fixed top-[45px] right-[10px] w-[260px] bg-[#2a2f35] shadow-2xl z-[70] flex flex-col animate-in fade-in duration-200 border border-gray-700/50 rounded-[4px]">
          
          <div className="p-3">
            <label className="block text-white text-[13px] font-bold mb-2">Lable Name</label>
            
            <div className="relative">
              <div className="w-full bg-white rounded-[3px] flex items-center">
                <input 
                  type="text"
                  className="flex-1 bg-transparent px-2 py-1.5 text-gray-800 text-[13px] font-bold outline-none rounded-l-[3px]"
                  value={selectedLabel}
                  onChange={(e) => setSelectedLabel(e.target.value)}
                  onClick={() => setIsLabelDropdownOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLabel(selectedLabel);
                      setIsLabelDropdownOpen(false);
                    }
                  }}
                />
                <div 
                  className="px-2 cursor-pointer h-full flex items-center justify-center"
                  onClick={() => setIsLabelDropdownOpen(!isLabelDropdownOpen)}
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              {isLabelDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-[3px] shadow-lg z-[80] overflow-hidden">
                  {labels.filter(lbl => lbl.name.toLowerCase().includes((selectedLabel || '').toLowerCase())).map((lbl, idx) => (
                    <div 
                      key={lbl.id} 
                      className={`flex items-center justify-between px-2 py-1.5 cursor-pointer ${idx % 2 === 0 ? 'bg-[#d1ecf1]' : 'bg-white'} hover:bg-gray-100`}
                      onClick={() => {
                        setSelectedLabel(lbl.name);
                        setIsLabelDropdownOpen(false);
                      }}
                    >
                      <span className="text-[13px] font-bold text-gray-800">{lbl.name}</span>
                      <div className="flex items-center gap-2">
                        <Edit 
                          className="w-3.5 h-3.5 text-[#17a2b8] cursor-pointer hover:text-[#138496]" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingLabel(lbl);
                            setIsPageSettingModalOpen(true);
                          }}
                        />
                        <Trash2 
                          className="w-3.5 h-3.5 text-[#dc3545] cursor-pointer hover:text-[#c82333]" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLabel(lbl.id, lbl.name);
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {!labels.find(lbl => lbl.name.toLowerCase() === (selectedLabel || '').toLowerCase()) && selectedLabel && selectedLabel.trim() !== '' && (
                    <div 
                      className={`flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100 ${labels.filter(lbl => lbl.name.toLowerCase().includes((selectedLabel || '').toLowerCase())).length % 2 === 0 ? 'bg-[#d1ecf1]' : 'bg-white'}`}
                      onClick={() => {
                        handleAddLabel(selectedLabel);
                        setIsLabelDropdownOpen(false);
                      }}
                    >
                      <span className="text-[14px] font-bold text-[#007bff]">+Add "{selectedLabel.trim()}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Separator line */}
          <div className="w-full border-t border-white"></div>

          {/* Footer */}
          <div className="p-2 flex justify-end gap-2 bg-[#2a2f35] rounded-b-[4px]">
            <button 
              onClick={() => {
                onClose();
              }} 
              className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors"
            >
              Save
            </button>
            <button 
              onClick={onClose}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {isPageSettingModalOpen && (
          <PageSettingModal 
            isOpen={isPageSettingModalOpen} 
            onClose={() => {
              setIsPageSettingModalOpen(false);
              setEditingLabel(null);
            }} 
            defaultLabel={editingLabel ? editingLabel.name : selectedLabel}
            labelData={editingLabel}
            onSave={() => fetchBarcodeLabels()}
          />
        )}
      </>
    );
  }

  if (isLedgerRoute) {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/20 z-[60] transition-opacity" 
          onClick={onClose}
        />
        
        {/* Drawer */}
        <div className="fixed top-[45px] right-0 h-auto max-h-[calc(100vh-45px)] w-[280px] sm:w-[320px] bg-[#2a2f35] shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300 border-l border-b border-gray-700/50">
          
          {/* Scrollable Content */}
          <div className="overflow-y-auto p-4 custom-scrollbar">
            
            {/* Settings List */}
            <div className="space-y-[15px] mt-2">
              <ToggleSetting label="Show Due Days" checked={settings.showDueDays} onChange={() => toggleSetting('showDueDays')} />
              <ToggleSetting label="Show Bank Details" checked={settings.showBankDetails} onChange={() => toggleSetting('showBankDetails')} />
              <ToggleSetting 
                label={
                  <>
                    Accounting Format<br/>
                    (Debit/Credit)
                  </>
                } 
                checked={settings.accountingFormat}
                onChange={() => toggleSetting('accountingFormat')}
              />
              <ToggleSetting label="Bill-wise Payment" checked={settings.billWisePayment} onChange={() => toggleSetting('billWisePayment')} />
            </div>

          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-700/50 flex justify-end gap-2 bg-[#2a2f35]">
            <button onClick={onClose} className="bg-[#198754] hover:bg-[#157347] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors">
              Save
            </button>
            <button 
              onClick={onClose}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-[60] transition-opacity" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-[#2a2f35] shadow-2xl z-[70] flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          {/* Gmail Connect Box */}
          <div className="bg-[#1f2328] rounded-[5px] p-4 mb-5 border border-gray-700/50">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-[#2a2f35] font-bold text-[13px]">
                  G
                </div>
                <span className="text-white font-medium text-[14px]">Gmail</span>
              </div>
              <span className="bg-[#dc3545] text-white text-[10px] px-2 py-0.5 rounded-[3px] font-medium tracking-wide">
                Not Connected
              </span>
            </div>
            <p className="text-gray-400 text-[11px] leading-tight mb-3 text-center">
              Send Invoice PDFs directly from connected Gmail
            </p>
            <button className="w-full bg-[#0d6efd] hover:bg-[#0b5ed7] text-white rounded-[3px] py-1.5 flex items-center justify-center gap-1.5 text-[13px] font-medium transition-colors">
              <Link2 className="w-4 h-4" />
              Connect Gmail
            </button>
          </div>

          {/* Settings List */}
          <div className="space-y-[10px] mb-6">
            <ToggleSetting 
              label="WhatsApp" 
              checked={settings?.whatsapp} 
              onChange={() => toggleSetting('whatsapp')} 
            />
            <ToggleSetting 
              label="Send WhatsApp" 
              checked={settings?.sendWhatsapp} 
              onChange={() => toggleSetting('sendWhatsapp')} 
            />
            <ToggleSetting 
              label="Send SMS" 
              checked={settings?.sendSms} 
              onChange={() => toggleSetting('sendSms')} 
            />
            <ToggleSetting 
              label="Customer Challan" 
              checked={settings?.showCustomerChallan} 
              onChange={() => toggleSetting('showCustomerChallan')} 
            />
            <ToggleSetting 
              label="Customer Invoice" 
              checked={settings?.showCustomerInvoice} 
              onChange={() => toggleSetting('showCustomerInvoice')} 
            />
            <ToggleSetting 
              label="Purchase Order" 
              checked={settings?.showPurchaseOrder} 
              onChange={() => toggleSetting('showPurchaseOrder')} 
            />
            <ToggleSetting 
              label="Sales Order" 
              checked={settings?.showSalesOrder} 
              onChange={() => toggleSetting('showSalesOrder')} 
            />
            <ToggleSetting 
              label="Merge Party Ledger" 
              checked={settings?.mergePartyLedger} 
              onChange={() => toggleSetting('mergePartyLedger')} 
            />
            <ToggleSetting 
              label="Party Type Both" 
              checked={settings?.partyTypeBoth} 
              onChange={() => toggleSetting('partyTypeBoth')} 
            />
            <ToggleSetting 
              label="Interest on Invoices" 
              checked={settings?.interestOnInvoices} 
              onChange={() => toggleSetting('interestOnInvoices')} 
            />
            <ToggleSetting 
              label="Variants & IMEI" 
              checked={settings?.showVariantsImei} 
              onChange={() => toggleSetting('showVariantsImei')} 
            />
          </div>

          {/* Form Fields */}
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-white text-[12.5px] font-bold mb-1.5">Currency Setting</label>
              <select 
                value={settings.currency || 'INR'}
                onChange={(e) => updateSetting('currency', e.target.value)}
                className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50"
              >
                {currencies.length > 0 ? currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol} - {c.name})
                  </option>
                )) : (
                  <>
                    <option value="INR">INR (₹ - Indian Rupee)</option>
                    <option value="USD">USD ($ - US Dollar)</option>
                    <option value="EUR">EUR (€ - Euro)</option>
                    <option value="GBP">GBP (£ - British Pound)</option>
                  </>
                )}
              </select>
            </div>
            
            <div>
              <label className="block text-white text-[12.5px] font-bold mb-1.5">Set Voucher Head</label>
              <input 
                type="text" 
                value={settings.voucherHead || ''}
                onChange={(e) => updateSetting('voucherHead', e.target.value)}
                className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" 
              />
            </div>

            <div>
              <label className="block text-white text-[12.5px] font-bold mb-1.5">Whatsapp Host</label>
              <input 
                type="text" 
                value={settings.whatsappHost || ''}
                onChange={(e) => updateSetting('whatsappHost', e.target.value)}
                className="w-full bg-white text-gray-800 text-[13px] rounded-[3px] px-2 py-1.5 outline-none focus:ring-2 focus:ring-[#4F46E5]/50" 
              />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700/50 flex justify-end gap-2 bg-[#2a2f35]">
          <button onClick={onClose} className="bg-[#198754] hover:bg-[#157347] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors">
            Save
          </button>
          <button 
            onClick={onClose}
            className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </>
  );
}

function ToggleSetting({ label, defaultChecked = false, checked, onChange }) {
  const { t } = useTranslation();
  const labelText = typeof label === 'string' ? t(`settings.${label}`, label) : label;
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5 shrink-0">
        <input 
          type="checkbox" 
          className="sr-only peer" 
          {...(checked !== undefined ? { checked, onChange } : { defaultChecked, onChange })}
        />
        <div className="w-9 h-[18px] bg-gray-400 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#0d6efd]"></div>
      </div>
      <span className="text-white text-[13px] font-bold tracking-wide select-none group-hover:text-gray-200">
        {labelText}
      </span>
    </label>
  );
}
