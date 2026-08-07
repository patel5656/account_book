import React, { useState, useEffect } from 'react';
import { X, Plus, Save } from 'lucide-react';
import apiClient from '../api/apiClient';

export function ProductSettingModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [commissionTypes, setCommissionTypes] = useState([]);

  useEffect(() => {
    if (isOpen) {
      apiClient.get('/settings')
        .then(res => {
          if (res.data?.success && res.data.data) {
            setSettings(res.data.data);
          }
        })
        .catch(err => console.error("Failed to load settings:", err));

      apiClient.get('/commission-types')
        .then(res => {
          if (res.data?.data) {
            setCommissionTypes(res.data.data.map(c => c.name));
          }
        })
        .catch(err => console.error("Failed to load commission types:", err));
    }
  }, [isOpen]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await apiClient.put('/settings', settings);
      onClose();
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !settings) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-[3px] shadow-2xl w-full sm:max-w-[800px] flex flex-col h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between px-4 py-2.5">
          <h2 className="text-[15px] text-white font-bold tracking-wide">Product Setting</h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={onClose} 
              className="bg-white hover:bg-gray-100 p-0.5 rounded-[2px] transition-colors"
            >
              <X className="w-4 h-4 text-[#dc3545]" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex flex-col gap-6 bg-white custom-scrollbar">
          
          {/* EXTRA COLUMNS */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-[#4b5563] uppercase tracking-wider">EXTRA COLUMNS</h3>
            <div className="flex items-end gap-3">
              <div className="flex flex-col gap-1 w-1/3">
                <label className="text-[12px] font-bold text-gray-700">Name</label>
                <input type="text" value={settings.extraColumnsName || ''} onChange={e => updateSetting('extraColumnsName', e.target.value)} className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
              </div>
              <div className="flex flex-col gap-1 w-1/3">
                <label className="text-[12px] font-bold text-gray-700">Default</label>
                <input type="text" value={settings.extraColumnsDefault || ''} onChange={e => updateSetting('extraColumnsDefault', e.target.value)} className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" />
              </div>
              <button className="bg-[#28a745] hover:bg-[#218838] w-[30px] h-[30px] rounded-[3px] flex items-center justify-center transition-colors shadow-sm">
                <Plus className="w-4 h-4 text-white" strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-[12px] text-gray-500 mt-1">No extra columns yet.</p>
          </div>

          <hr className="border-gray-200" />

          {/* DEFAULTS */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-[#4b5563] uppercase tracking-wider">DEFAULTS</h3>
            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1 w-1/2">
                <label className="text-[12px] font-bold text-gray-700">Commission</label>
                <select 
                  value={settings.defaultCommission || ''} 
                  onChange={(e) => updateSetting('defaultCommission', e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] text-gray-700"
                >
                  <option value=""></option>
                  {commissionTypes.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <label className="text-[12px] font-bold text-gray-700">Barcode heads</label>
                <input 
                  type="text"
                  value={settings.barcodeHeads || '* M'}
                  onChange={(e) => updateSetting('barcodeHeads', e.target.value)}
                  className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5] text-gray-700"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* SUB INVENTORY */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold text-[#4b5563] uppercase tracking-wider">SUB INVENTORY</h3>
            <div 
              onClick={() => updateSetting('showSubInventory', !settings.showSubInventory)}
              className="flex items-center gap-2 cursor-pointer w-max"
            >
              <div className={`w-[36px] h-[18px] rounded-full relative transition-colors ${settings.showSubInventory ? 'bg-[#4F46E5]' : 'bg-gray-300'}`}>
                <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${settings.showSubInventory ? 'translate-x-[20px]' : 'translate-x-[2px]'}`}></div>
              </div>
              <span className="text-[13px] text-gray-600">Show Sub Inventory in Product Master</span>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* FIELD VISIBILITY */}
          <div className="flex flex-col gap-2">
            <h3 className="text-[13px] font-bold text-[#4b5563] uppercase tracking-wider">FIELD VISIBILITY</h3>
            <p className="text-[11px] text-gray-500 font-medium">Switch <strong className="text-gray-800">on</strong> = show - <strong className="text-gray-800">off</strong> = hide</p>
          </div>

          <hr className="border-gray-200" />

          {/* Product Form */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[14px] font-bold text-[#4F46E5]">Product Form</h4>
            <div className="grid grid-cols-4 gap-4">
              <Toggle label="Product code" checked={!!settings.showProductCodeField} onChange={(v) => updateSetting('showProductCodeField', v)} />
              <Toggle label="Brand" checked={!!settings.showBrandField} onChange={(v) => updateSetting('showBrandField', v)} />
              <Toggle label="Category" checked={!!settings.showCategoryField} onChange={(v) => updateSetting('showCategoryField', v)} />
              <Toggle label="GST" checked={!!settings.showGstApplicableField} onChange={(v) => updateSetting('showGstApplicableField', v)} />
              <Toggle label="HSN" checked={!!settings.showHsnField} onChange={(v) => updateSetting('showHsnField', v)} />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Sale Prices */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[14px] font-bold text-[#4F46E5]">Sale Prices</h4>
            <div className="grid grid-cols-3 gap-4">
              <Toggle label="MRP" checked={!!settings.showMRP} onChange={(v) => updateSetting('showMRP', v)} />
              <Toggle label="Sale / cash price" checked={true} /> {/* Always true usually */}
              <Toggle label="Credit sale price" checked={!!settings.showCreditSalePrice} onChange={(v) => updateSetting('showCreditSalePrice', v)} />
              <Toggle label="Wholesale price" checked={!!settings.showWholesalePrice} onChange={(v) => updateSetting('showWholesalePrice', v)} />
              <Toggle label="Special price" checked={!!settings.showSpecialPrice} onChange={(v) => updateSetting('showSpecialPrice', v)} />
              <Toggle label="Super special price" checked={!!settings.showSuperSpecialPrice} onChange={(v) => updateSetting('showSuperSpecialPrice', v)} />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Others */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[14px] font-bold text-[#4F46E5]">Others</h4>
            <div className="grid grid-cols-4 gap-4">
              <Toggle label="Opening stock" checked={!!settings.showOpeningStock} onChange={(v) => updateSetting('showOpeningStock', v)} />
              <Toggle label="Minimum quantity" checked={!!settings.showMinimumQuantity} onChange={(v) => updateSetting('showMinimumQuantity', v)} />
              <Toggle label="Reorder quantity" checked={!!settings.showReorderQuantity} onChange={(v) => updateSetting('showReorderQuantity', v)} />
              <Toggle label="Auto quantity" checked={!!settings.showAutoQuantity} onChange={(v) => updateSetting('showAutoQuantity', v)} />
              <Toggle label="Multi location" checked={!!settings.showMultiLocation} onChange={(v) => updateSetting('showMultiLocation', v)} />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Units */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[14px] font-bold text-[#4F46E5]">Units</h4>
            <div className="grid grid-cols-2 gap-4">
              <Toggle label="Unit section" checked={!!settings.showUnitSection} onChange={(v) => updateSetting('showUnitSection', v)} />
              <Toggle label="Barcode" checked={!!settings.showBarcodeField} onChange={(v) => updateSetting('showBarcodeField', v)} />
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* PURCHASE PRICE CODE */}
          <div className="flex flex-col gap-4 mb-4">
            <h3 className="text-[13px] font-bold text-[#4F46E5] uppercase tracking-wider">PURCHASE PRICE CODE</h3>
            <Toggle label="Show purchase price as code" checked={!!settings.showPurchasePriceCode} onChange={(v) => updateSetting('showPurchasePriceCode', v)} />
            <p className="text-[12px] text-gray-600 font-medium">Assign one letter to each digit 0-9 (for example, 0→A, 5→S). For 14 bills, also turn on <strong className="text-gray-800">Show Secret Price</strong> in Print Settings.</p>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex flex-col gap-1 w-[120px]">
                <label className="text-[13px] font-bold text-gray-800">Markup %</label>
                <input 
                  type="number" 
                  value={settings.purchasePriceMarkup || 0} 
                  onChange={(e) => updateSetting('purchasePriceMarkup', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-[3px] px-2 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]" 
                />
              </div>
            </div>

            <div className="grid grid-cols-10 gap-2 mt-4">
              {[0,1,2,3,4,5,6,7,8,9].map(d => {
                const mapStr = settings.purchasePriceCodeMap || "OABCDEFGHI";
                const letter = mapStr[d] || ' ';
                return (
                  <div key={d} className="flex flex-col text-center border border-gray-300 rounded-[3px] overflow-hidden">
                    <div className="bg-white py-1 font-bold text-[13px] text-gray-800">{d}</div>
                    <input 
                      type="text" 
                      maxLength={1}
                      value={letter}
                      onChange={(e) => {
                        const newArr = mapStr.split('').length === 10 ? mapStr.split('') : "OABCDEFGHI".split('');
                        newArr[d] = e.target.value.toUpperCase() || ' ';
                        updateSetting('purchasePriceCodeMap', newArr.join(''));
                      }}
                      className="bg-[#e9ecef] py-1 font-bold text-[13px] text-gray-800 border-t border-gray-300 text-center outline-none focus:bg-white" 
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center gap-2 cursor-pointer w-max" onClick={() => onChange(!checked)}>
      <div className={`w-[36px] h-[18px] rounded-full relative transition-colors ${checked ? 'bg-[#4F46E5]' : 'bg-gray-300'}`}>
        <div className={`w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-transform ${checked ? 'translate-x-[20px]' : 'translate-x-[2px]'}`}></div>
      </div>
      <span className="text-[13px] text-gray-600 font-medium">{label}</span>
    </div>
  );
}
