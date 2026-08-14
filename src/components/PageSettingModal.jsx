import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { updateBarcodeSetting } from '../api/barcodeSettings';

const ToggleSwitch = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer group py-1">
    <div className="relative shrink-0 mt-0.5">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
      <div className="w-[34px] h-[18px] bg-[#d1d5db] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[16px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-[14px] after:w-[14px] after:transition-all peer-checked:bg-[#007bff]"></div>
    </div>
    <span className="text-[13px] font-bold text-gray-800 select-none whitespace-nowrap">
      {label}
    </span>
  </label>
);

export default function PageSettingModal({ isOpen, onClose, defaultLabel = "50mm X 25mm", labelData = null, onSave }) {
  const [formData, setFormData] = useState({
    pageType: defaultLabel,
    labelsInRow: '2',
    pageBreak: 'YES',
    pageWidth: '50mm',
    pageHeight: '25mm',
    leftMargin: '0.5',
    rightMargin: '0.5',
    labelGap: '1mm',
    heightGap: '1mm'
  });

  const [showBarcodeSettings, setShowBarcodeSettings] = useState(true); // By default true to show it based on user request or user can toggle
  const [barcodeSettings, setBarcodeSettings] = useState({
    grnNumber: false,
    zeroPrice: false,
    showBrand: false,
    showMRP: true,
    showAdditionalInfo: true,
    showSalePrice: true,
    showWholeSalePrice: true,
    doubleMRP: false,
    crossMRP: false,
    showBorder: true,
    showCategory: true,
    showAutoQuantity: true,
    showLocation: false,
    showUnit: true,
    showMultiLine: true,
    showSpecialCommission: true,
    showHeading: true,
    hideBarcode: false,
    showDiscount: false,
    showSize: false,
    showColor: false,
    showImei: false,
    showBatchNo: false,
    barcodeHeading: 'SWAYAM BILL',
    headingFontSize: '',
    productFontSize: '20px',
    footerFontSize: '',
    salePriceFontSize: '50px',
    mrpFontSize: '12px',
    discountFontSize: '10px',
    barcodeHeight: '0',
    barcodeWidth: '0',
    marginTop: '0mm',
    marginBottom: '0mm',
    marginLeft: '0mm',
    marginRight: '0mm',
    registerOfficeAddress: '',
    terms: '',
    barcodeFormat: 'Format 4'
  });

  useEffect(() => {
    if (labelData) {
      setFormData({
        pageType: labelData.name || defaultLabel,
        labelsInRow: labelData.labelsInRow || '2',
        pageBreak: labelData.pageBreak || 'YES',
        pageWidth: labelData.pageWidth || '50mm',
        pageHeight: labelData.pageHeight || '25mm',
        leftMargin: labelData.leftMargin || '0.5',
        rightMargin: labelData.rightMargin || '0.5',
        labelGap: labelData.labelGap || '1mm',
        heightGap: labelData.heightGap || '1mm'
      });
      setBarcodeSettings({
        grnNumber: labelData.grnNumber || false,
        zeroPrice: labelData.zeroPrice || false,
        showBrand: labelData.showBrand || false,
        showMRP: labelData.showMRP ?? true,
        showAdditionalInfo: labelData.showAdditionalInfo || false,
        showSalePrice: labelData.showSalePrice ?? true,
        showWholeSalePrice: labelData.showWholeSalePrice || false,
        doubleMRP: labelData.doubleMRP || false,
        crossMRP: labelData.crossMRP || false,
        showBorder: labelData.showBorder ?? true,
        showCategory: labelData.showCategory || false,
        showAutoQuantity: labelData.showAutoQuantity || false,
        showLocation: labelData.showLocation || false,
        showUnit: labelData.showUnit ?? true,
        showMultiLine: labelData.showMultiLine || false,
        showSpecialCommission: labelData.showSpecialCommission || false,
        showHeading: labelData.showHeading ?? true,
        hideBarcode: labelData.hideBarcode || false,
        showDiscount: labelData.showDiscount || false,
        showSize: labelData.showSize || false,
        showColor: labelData.showColor || false,
        showImei: labelData.showImei || false,
        showBatchNo: labelData.showBatchNo || false,
        barcodeHeading: labelData.barcodeHeading || 'SWAYAM BILL',
        headingFontSize: labelData.headingFontSize || '',
        productFontSize: labelData.productFontSize || '20px',
        footerFontSize: labelData.footerFontSize || '',
        salePriceFontSize: labelData.salePriceFontSize || '50px',
        mrpFontSize: labelData.mrpFontSize || '12px',
        discountFontSize: labelData.discountFontSize || '10px',
        barcodeHeight: labelData.barcodeHeight || '0',
        barcodeWidth: labelData.barcodeWidth || '0',
        marginTop: labelData.marginTop || '0mm',
        marginBottom: labelData.marginBottom || '0mm',
        marginLeft: labelData.marginLeft || '0mm',
        marginRight: labelData.marginRight || '0mm',
        registerOfficeAddress: labelData.registerOfficeAddress || '',
        terms: labelData.terms || '',
        barcodeFormat: labelData.barcodeFormat || 'Format 4'
      });
    }
  }, [labelData, defaultLabel]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBarcodeSettingToggle = (key) => {
    setBarcodeSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleBarcodeSettingChange = (e) => {
    const { name, value } = e.target;
    setBarcodeSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleReset = () => {
    setFormData({
      pageType: defaultLabel,
      labelsInRow: '2',
      pageBreak: 'YES',
      pageWidth: '50mm',
      pageHeight: '25mm',
      leftMargin: '0.5',
      rightMargin: '0.5',
      labelGap: '1mm',
      heightGap: '1mm'
    });
  };

  const handleUpdatePageSetup = async () => {
    if (labelData && labelData.id) {
      const payload = {
        ...formData,
        ...barcodeSettings
      };
      try {
        const response = await updateBarcodeSetting(labelData.id, payload);
        if (response || response?.success) {
          if (onSave) onSave();
          onClose(); // Close on success
        }
      } catch (error) {
        console.error("Error updating page setup:", error);
      }
    } else {
      // If no ID, perhaps just close
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-[4px] w-full max-w-[800px] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-[#007bff] px-4 py-3 flex items-center justify-between rounded-t-[4px] shrink-0">
          <h2 className="text-white text-[15px] font-medium">Page Setting</h2>
          <button 
            onClick={onClose}
            className="text-[#dc3545] hover:text-[#c82333] transition-colors"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              {/* Row 1 */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">Page Type</label>
                <input 
                  type="text" 
                  name="pageType"
                  value={formData.pageType}
                  readOnly
                  className="w-full border border-[#9acfea] bg-[#d1ecf1] text-gray-800 text-[13px] rounded-[3px] px-3 py-1.5 outline-none font-bold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">Lables In Row</label>
                <input 
                  type="text" 
                  name="labelsInRow"
                  value={formData.labelsInRow}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-white text-gray-800 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">Page Break</label>
                <select 
                  name="pageBreak"
                  value={formData.pageBreak}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-white text-gray-800 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                >
                  <option value="YES">YES</option>
                  <option value="NO">NO</option>
                </select>
              </div>

              {/* Row 2 */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">Page Width</label>
                <input 
                  type="text" 
                  name="pageWidth"
                  value={formData.pageWidth}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[13px] font-bold text-gray-800">Page Height</label>
                <input 
                  type="text" 
                  name="pageHeight"
                  value={formData.pageHeight}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                />
              </div>

              {/* Row 3 */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">Left Margin</label>
                <input 
                  type="text" 
                  name="leftMargin"
                  value={formData.leftMargin}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[13px] font-bold text-gray-800">Right Margin</label>
                <input 
                  type="text" 
                  name="rightMargin"
                  value={formData.rightMargin}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                />
              </div>

              {/* Row 4 */}
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-800">Label Gap</label>
                <input 
                  type="text" 
                  name="labelGap"
                  value={formData.labelGap}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-[13px] font-bold text-gray-800">Height Gap</label>
                <input 
                  type="text" 
                  name="heightGap"
                  value={formData.heightGap}
                  onChange={handleChange}
                  className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                />
              </div>

            </div>

          {/* Action Buttons inside body */}
          <div className="mt-8 flex items-center justify-between">
            <button 
              onClick={() => setShowBarcodeSettings(!showBarcodeSettings)}
              className="flex items-center gap-1.5 border-2 border-[#007bff] text-[#007bff] bg-transparent hover:bg-[#007bff] hover:text-white px-3 py-1 rounded-[3px] text-[13px] font-medium transition-colors"
            >
              {showBarcodeSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              {showBarcodeSettings ? "Hide Barcode Settings" : "Show Barcode Settings"}
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center gap-1.5 border border-gray-400 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-[3px] text-[13px] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset Form
            </button>
          </div>

          {showBarcodeSettings && (
            <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="text-[15px] text-gray-700 mb-2">Barcode Settings</div>
              <div className="border-t border-gray-200 mb-4"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mb-6">
                <div className="flex flex-col gap-3">
                  <ToggleSwitch label="GRN Number" checked={barcodeSettings.grnNumber} onChange={() => handleBarcodeSettingToggle('grnNumber')} />

                  <ToggleSwitch label="Show Brand" checked={barcodeSettings.showBrand} onChange={() => handleBarcodeSettingToggle('showBrand')} />
                  <ToggleSwitch label="Show MRP" checked={barcodeSettings.showMRP} onChange={() => handleBarcodeSettingToggle('showMRP')} />
                  <ToggleSwitch label="Show Additional Info" checked={barcodeSettings.showAdditionalInfo} onChange={() => handleBarcodeSettingToggle('showAdditionalInfo')} />
                  <ToggleSwitch label="Show Sale Price" checked={barcodeSettings.showSalePrice} onChange={() => handleBarcodeSettingToggle('showSalePrice')} />
                  <ToggleSwitch label="Show Whole Sale Price" checked={barcodeSettings.showWholeSalePrice} onChange={() => handleBarcodeSettingToggle('showWholeSalePrice')} />
                  
                  <div className="h-4"></div> {/* spacer */}
                  
                  <ToggleSwitch label="Double MRP" checked={barcodeSettings.doubleMRP} onChange={() => handleBarcodeSettingToggle('doubleMRP')} />
                  <ToggleSwitch label="Cross MRP" checked={barcodeSettings.crossMRP} onChange={() => handleBarcodeSettingToggle('crossMRP')} />
                  <ToggleSwitch label="Show Border" checked={barcodeSettings.showBorder} onChange={() => handleBarcodeSettingToggle('showBorder')} />
                  <ToggleSwitch label="Show Size" checked={barcodeSettings.showSize} onChange={() => handleBarcodeSettingToggle('showSize')} />
                  <ToggleSwitch label="Show Color" checked={barcodeSettings.showColor} onChange={() => handleBarcodeSettingToggle('showColor')} />
                </div>
                
                <div className="flex flex-col gap-3">
                  <ToggleSwitch label="Show Category" checked={barcodeSettings.showCategory} onChange={() => handleBarcodeSettingToggle('showCategory')} />

                  <ToggleSwitch label="Show Location" checked={barcodeSettings.showLocation} onChange={() => handleBarcodeSettingToggle('showLocation')} />
                  <ToggleSwitch label="Show Unit" checked={barcodeSettings.showUnit} onChange={() => handleBarcodeSettingToggle('showUnit')} />
                  <ToggleSwitch label="Show Multi Line" checked={barcodeSettings.showMultiLine} onChange={() => handleBarcodeSettingToggle('showMultiLine')} />
                  <ToggleSwitch label="Show Special Commission" checked={barcodeSettings.showSpecialCommission} onChange={() => handleBarcodeSettingToggle('showSpecialCommission')} />
                  <ToggleSwitch label="Show Heading" checked={barcodeSettings.showHeading} onChange={() => handleBarcodeSettingToggle('showHeading')} />
                  <ToggleSwitch label="Hide Barcode" checked={barcodeSettings.hideBarcode} onChange={() => handleBarcodeSettingToggle('hideBarcode')} />
                  <ToggleSwitch label="Show Discount" checked={barcodeSettings.showDiscount} onChange={() => handleBarcodeSettingToggle('showDiscount')} />
                  <ToggleSwitch label="Show IMEI" checked={barcodeSettings.showImei} onChange={() => handleBarcodeSettingToggle('showImei')} />
                  <ToggleSwitch label="Show Batch No" checked={barcodeSettings.showBatchNo} onChange={() => handleBarcodeSettingToggle('showBatchNo')} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Barcode Heading</label>
                  <input 
                    type="text" 
                    name="barcodeHeading"
                    value={barcodeSettings.barcodeHeading}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Heading Font Size</label>
                  <input 
                    type="text" 
                    name="headingFontSize"
                    placeholder="Ex: 15px"
                    value={barcodeSettings.headingFontSize}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Product Font Size</label>
                  <input 
                    type="text" 
                    name="productFontSize"
                    value={barcodeSettings.productFontSize}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Footer Font Size</label>
                  <input 
                    type="text" 
                    name="footerFontSize"
                    placeholder="Ex: 10px"
                    value={barcodeSettings.footerFontSize}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Sale Price Font Size</label>
                  <input 
                    type="text" 
                    name="salePriceFontSize"
                    value={barcodeSettings.salePriceFontSize}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">MRP Font Size</label>
                  <input 
                    type="text" 
                    name="mrpFontSize"
                    value={barcodeSettings.mrpFontSize}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Discount Font Size</label>
                  <input 
                    type="text" 
                    name="discountFontSize"
                    value={barcodeSettings.discountFontSize}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                </div>
                <div></div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Barcode Height</label>
                  <input 
                    type="text" 
                    name="barcodeHeight"
                    value={barcodeSettings.barcodeHeight}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Barcode Width</label>
                  <input 
                    type="text" 
                    name="barcodeWidth"
                    value={barcodeSettings.barcodeWidth}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                </div>
              </div>

              {/* Label Margin Setup Box */}
              <div className="border border-gray-200 rounded-[3px] p-4 relative flex flex-col items-center justify-center my-6">
                <div className="text-[14px] text-gray-700 mb-4">Label Margin Setup</div>
                <div className="relative w-full max-w-[300px] h-[100px] flex items-center justify-center">
                  {/* Top */}
                  <input 
                    type="text" 
                    name="marginTop"
                    value={barcodeSettings.marginTop}
                    onChange={handleBarcodeSettingChange}
                    className="absolute top-0 w-[60px] text-center border border-gray-400 bg-white text-gray-700 text-[13px] rounded-[2px] px-1 py-1 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                  {/* Bottom */}
                  <input 
                    type="text" 
                    name="marginBottom"
                    value={barcodeSettings.marginBottom}
                    onChange={handleBarcodeSettingChange}
                    className="absolute bottom-0 w-[60px] text-center border border-gray-400 bg-white text-gray-700 text-[13px] rounded-[2px] px-1 py-1 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                  {/* Left */}
                  <input 
                    type="text" 
                    name="marginLeft"
                    value={barcodeSettings.marginLeft}
                    onChange={handleBarcodeSettingChange}
                    className="absolute left-0 w-[60px] text-center border border-gray-400 bg-white text-gray-700 text-[13px] rounded-[2px] px-1 py-1 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                  {/* Right */}
                  <input 
                    type="text" 
                    name="marginRight"
                    value={barcodeSettings.marginRight}
                    onChange={handleBarcodeSettingChange}
                    className="absolute right-0 w-[60px] text-center border border-gray-400 bg-white text-gray-700 text-[13px] rounded-[2px] px-1 py-1 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Register Office Address</label>
                  <select 
                    name="registerOfficeAddress"
                    value={barcodeSettings.registerOfficeAddress}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-400 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  >
                    <option value="">Hint - Multiple Address Lines</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Terms</label>
                  <select 
                    name="terms"
                    value={barcodeSettings.terms}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-400 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  >
                    <option value="">Add Terms</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[13px] font-bold text-gray-800">Barcode Format</label>
                  <select 
                    name="barcodeFormat"
                    value={barcodeSettings.barcodeFormat}
                    onChange={handleBarcodeSettingChange}
                    className="w-full border border-gray-300 bg-white text-gray-700 text-[13px] rounded-[3px] px-3 py-1.5 outline-none focus:border-[#80bdff] focus:ring-1 focus:ring-[#80bdff]"
                  >
                    <option value="Format 4">Format 4</option>
                    <option value="Format 1">Format 1</option>
                    <option value="Format 2">Format 2</option>
                    <option value="Format 3">Format 3</option>
                  </select>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f8f9fa] border-t border-gray-200 p-3 flex justify-end rounded-b-[4px] shrink-0">
          <button 
            className="bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-4 py-2 font-bold text-[14px] rounded-[3px] transition-colors"
            onClick={handleUpdatePageSetup}
          >
            Update Page Setup
          </button>
        </div>
      </div>
    </div>
  );
}
