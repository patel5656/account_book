import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { RefreshCw, X, Settings, Check, Printer, Type, QrCode, Image as ImageIcon, Square, Circle, Minus, Save, ChevronDown, ChevronUp, Barcode as BarcodeIcon, Info, Eye, Edit, Trash2, ScanBarcode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { getBarcodeSettings } from '../api/barcodeSettings';
import { cn } from '../utils';
import apiClient from '../api/apiClient';
import { ProductSelectDropdown } from '../components/ProductSelectDropdown';
import { ItemMasterModal } from '../components/ItemMasterModal';

// Custom YouTube SVG Icon
const YoutubeIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export function BarcodePage() {
  const navigate = useNavigate();
  const [isManufactureProduct, setIsManufactureProduct] = useState(false);
  const [isSpecialCommision, setIsSpecialCommision] = useState(false);
  const [mfgDate, setMfgDate] = useState('2026-06-03');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showDesigner, setShowDesigner] = useState(false);
  const [zoom, setZoom] = useState(200);

  // Template Designer States
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize, setGridSize] = useState('1mm');
  const [templateName, setTemplateName] = useState('');

  // Page Setup Panel States
  const [showPageSetup, setShowPageSetup] = useState(false);
  const [activePreset, setActivePreset] = useState('50mm x 25mm');
  const [pageWidth, setPageWidth] = useState('50mm');
  const [pageHeight, setPageHeight] = useState('25mm');
  const [leftMargin, setLeftMargin] = useState('0.5mm');
  const [rightMargin, setRightMargin] = useState('0.5mm');
  const [labelGap, setLabelGap] = useState('1mm');
  const [heightGap, setHeightGap] = useState('1mm');
  const [labelCount, setLabelCount] = useState('1');
  const [pageBreak, setPageBreak] = useState('No');
  const [printerType, setPrinterType] = useState('A4 Sheet');

  // Integration States
  const [products, setProducts] = useState([]);
  const [units, setUnits] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [searchMode, setSearchMode] = useState('Product Name');
  const [printList, setPrintList] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemModalData, setItemModalData] = useState(null);
  const [printRowModal, setPrintRowModal] = useState(null);
  const [printRowQty, setPrintRowQty] = useState(1);

  // Form Fields mapped to product
  const [barcodeInput, setBarcodeInput] = useState('');
  const [mrpInput, setMrpInput] = useState('0');
  const [salePriceInput, setSalePriceInput] = useState('0');
  const [wholesalePriceInput, setWholesalePriceInput] = useState('0');
  const [printQty, setPrintQty] = useState('0');
  const [batchNoInput, setBatchNoInput] = useState('');

  // Active Template State
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateName, setSelectedTemplateName] = useState('');
  const [activeTemplate, setActiveTemplate] = useState(null);

  const location = useLocation();

  useEffect(() => {
    fetchInitialData();
    if (location.state && location.state.invoiceItems) {
      const initialItems = location.state.invoiceItems.map((item, index) => ({
        id: Date.now() + index,
        productId: item.productId,
        name: item.name || 'Unknown',
        barcode: item.barcode || '',
        quantity: item.quantity || 1,
        salePrice: item.salePrice || 0,
        mrp: item.mrp || 0,
        unit: item.unit || item.unitName || '',
        category: item.category || item.categoryName || '',
        brand: item.brand || item.brandName || '',
        size: item.size || '',
        color: item.color || '',
        batchNo: item.batchNo || item.batch_no || '',
        imei: item.imei || '',
        location: item.location || item.rack || ''
      }));
      setPrintList(initialItems);
    }
  }, [location.state]);

  useEffect(() => {
    const tmpl = templates.find(t => t.name === selectedTemplateName);
    setActiveTemplate(tmpl || null);
    if (tmpl) {
      setPrinterType(tmpl.barcodeFormat === 'Thermal Roll' ? 'Thermal Roll' : 'A4 Sheet');
    }
  }, [selectedTemplateName, templates]);

  const fetchInitialData = async () => {
    try {
      const [prodRes, unitRes, templateRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/units'),
        getBarcodeSettings()
      ]);
      setProducts(prodRes.data?.data || prodRes.data?.products || (Array.isArray(prodRes.data) ? prodRes.data : []));
      setUnits(unitRes.data?.data || (Array.isArray(unitRes.data) ? unitRes.data : []));
      if (templateRes && templateRes.success) {
        setTemplates(templateRes.data);
        if (templateRes.data.length > 0) {
          setSelectedTemplateName(templateRes.data[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  const handleProductSelect = (e) => {
    const prodId = e.target.value;
    setSelectedProduct(prodId);
    if (prodId) {
      const prod = products.find(p => p.id.toString() === prodId.toString());
      if (prod) {
        setBarcodeInput(prod.barcode || '');
        setMrpInput(prod.mrp?.toString() || '0');
        setSalePriceInput(prod.salesPrice?.toString() || prod.price?.toString() || '0');
        setWholesalePriceInput(prod.wholesalePrice?.toString() || '0');
        setBatchNoInput(prod.batchNo?.toString() || prod.batch_no?.toString() || '');
        const unit = units.find(u => u.id.toString() === prod.unitId?.toString());
        setSelectedUnit(unit ? unit.name : (prod.unitId?.toString() || ''));
      }
    } else {
      setBarcodeInput('');
      setMrpInput('0');
      setSalePriceInput('0');
      setWholesalePriceInput('0');
      setBatchNoInput('');
      setSelectedUnit('');
    }
  };

  const handleAddToList = () => {
    if (!selectedProduct) return alert('Please select a product');
    if (!printQty || parseInt(printQty) <= 0) return alert('Please enter a valid quantity');

    const prod = products.find(p => p.id.toString() === String(selectedProduct));
    const newItem = {
      id: Date.now(),
      productId: selectedProduct,
      name: prod?.name || 'Unknown',
      barcode: barcodeInput,
      quantity: printQty,
      salePrice: salePriceInput,
      mrp: mrpInput,
      unit: selectedUnit,
      category: prod?.category?.name || prod?.category || '',
      brand: prod?.brand?.name || prod?.brand || '',
      size: prod?.size || '',
      color: prod?.color || '',
      batchNo: batchNoInput || prod?.batchNo || prod?.batch_no || '',
      imei: prod?.imei || '',
      location: prod?.location || prod?.rack || ''
    };
    setPrintList([...printList, newItem]);

    // Reset selection if needed, or keep it
    setPrintQty('0');
  };

  const handleRemoveFromList = (id) => {
    setPrintList(printList.filter(item => item.id !== id));
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
  };

  const handleViewItem = (item) => {
    setViewingItem(item);
  };

  const handlePresetClick = (preset) => {
    setActivePreset(preset);
    if (preset === '50mm x 25mm') {
      setPageWidth('50mm');
      setPageHeight('25mm');
      setLeftMargin('0.5mm');
      setRightMargin('0.5mm');
      setLabelGap('1mm');
      setHeightGap('1mm');
      setLabelCount('1');
    } else if (preset === '38mm x 25mm') {
      setPageWidth('38mm');
      setPageHeight('25mm');
      setLeftMargin('0.5mm');
      setRightMargin('0.5mm');
      setLabelGap('1mm');
      setHeightGap('1mm');
      setLabelCount('1');
    } else if (preset === '38mm x 25mm (2 Labels)') {
      setPageWidth('78mm');
      setPageHeight('25mm');
      setLeftMargin('0.5mm');
      setRightMargin('0.5mm');
      setLabelGap('2mm');
      setHeightGap('1mm');
      setLabelCount('2');
    } else if (preset === '100mm x 50mm') {
      setPageWidth('100mm');
      setPageHeight('50mm');
      setLeftMargin('1mm');
      setRightMargin('1mm');
      setLabelGap('2mm');
      setHeightGap('2mm');
      setLabelCount('1');
    }
  };

  const parsedWidth = parseFloat(pageWidth) || 50;
  const parsedHeight = parseFloat(pageHeight) || 25;
  const canvasWidth = Math.round(parsedWidth * 6);
  const canvasHeight = Math.round(parsedHeight * 6);

  const addElement = (type) => {
    let currentElements = [...elements];
    // Automatically remove the opposite code type to prevent user confusion (having both a QR and Barcode)
    if (type === 'barcode') {
      currentElements = currentElements.filter(el => el.type !== 'qrcode');
    } else if (type === 'qrcode') {
      currentElements = currentElements.filter(el => el.type !== 'barcode');
    }

    const offset = (currentElements.length * 15) % 150;
    const newEl = {
      id: Date.now().toString(),
      type,
      x: 40 + offset,
      y: 40 + offset,
      width: type === 'barcode' ? 140 : type === 'qrcode' ? 60 : type === 'image' ? 60 : type === 'circle' ? 40 : type === 'line' ? 120 : 80,
      height: type === 'barcode' ? 45 : type === 'qrcode' ? 60 : type === 'image' ? 60 : type === 'circle' ? 40 : type === 'line' ? 2 : 25,
      text: type === 'text' ? 'Sample Text' : type === 'barcode' ? '12345678' : type === 'qrcode' ? 'https://google.com' : type === 'image' ? 'Image' : '',
      fontSize: 12,
      field: type === 'text' ? 'Static Text' : undefined
    };
    setElements([...currentElements, newEl]);
    setSelectedId(newEl.id);
  };

  const handleMouseDown = (e, id) => {
    e.preventDefault();
    setSelectedId(id);

    const element = elements.find(el => el.id === id);
    if (!element) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startElX = element.x;
    const startElY = element.y;

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      let newX = startElX + deltaX;
      let newY = startElY + deltaY;

      // Snap to grid logic if enabled (snap to cells based on selected gridSize)
      if (snapToGrid) {
        const snapValue = (parseFloat(gridSize) || 1) * 6;
        newX = Math.round(newX / snapValue) * snapValue;
        newY = Math.round(newY / snapValue) * snapValue;
      }

      // Constrain within the canvas boundaries
      newX = Math.max(0, Math.min(canvasWidth - element.width, newX));
      newY = Math.max(0, Math.min(canvasHeight - element.height, newY));

      setElements(prev => prev.map(el => el.id === id ? { ...el, x: newX, y: newY } : el));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const selectedEl = elements.find(el => el.id === selectedId);

  if (showDesigner) {
    return (
      <div className="bg-[#f4f6f9] min-h-[calc(100vh-60px)] flex flex-col select-none">
        {/* Top Teal Bar for Designer */}
        <div className="bg-[#4F46E5] px-4 py-[6px] flex justify-between items-center text-white h-[45px]">
          <h2 className="text-[14.5px] font-medium tracking-wide">Barcode Template Designer</h2>
          <button
            onClick={() => {
              setShowDesigner(false);
              setSelectedId(null);
              setElements([]);
              setShowPageSetup(false);
            }}
            className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-300 px-3.5 h-[28px] text-[13px] font-bold rounded-[3px] flex items-center gap-1.5 focus:outline-none transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-800" strokeWidth={3} /> Close
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 py-2.5 px-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              placeholder="Template Name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="h-[32px] border border-gray-300 rounded-[3px] px-2.5 text-[13px] outline-none placeholder-gray-400 text-gray-700 bg-white focus:border-[#4F46E5] w-[200px]"
            />

            <button
              onClick={() => setShowPageSetup(!showPageSetup)}
              className={cn(
                "px-3 h-[32px] rounded-[3px] flex items-center gap-1.5 text-[13px] font-bold transition-colors focus:outline-none text-white",
                showPageSetup ? "bg-[#0b5ed7]" : "bg-[#0d6efd] hover:bg-[#0b5ed7]"
              )}
            >
              <Settings className="w-3.5 h-3.5" /> Page Setup {showPageSetup ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[13.5px] font-bold text-gray-800">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="w-4 h-4 accent-[#0d6efd]"
              />
              <span>Show Grid</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-bold text-gray-800">Zoom:</span>
              <input
                type="range"
                min="100"
                max="300"
                step="50"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-[100px] accent-[#0d6efd] cursor-pointer"
              />
              <span className="text-[13.5px] font-bold text-gray-800 w-[45px]">{zoom}%</span>
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer select-none text-[13.5px] font-bold text-gray-800">
              <input
                type="checkbox"
                checked={snapToGrid}
                onChange={(e) => setSnapToGrid(e.target.checked)}
                className="w-4 h-4 accent-[#0d6efd]"
              />
              <span>Snap to Grid</span>
            </label>

            <div className="flex items-center gap-1.5">
              <span className="text-[13.5px] font-bold text-gray-800">Grid Size:</span>
              <select
                value={gridSize}
                onChange={(e) => setGridSize(e.target.value)}
                className="h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
              >
                <option value="1mm">1mm</option>
                <option value="2mm">2mm</option>
                <option value="3mm">3mm</option>
                <option value="5mm">5mm</option>
                <option value="10mm">10mm</option>
                <option value="15mm">15mm</option>
                <option value="20mm">20mm</option>
              </select>
            </div>
          </div>

          <button
            onClick={async () => {
              try {
                const payload = {
                  name: templateName || 'Custom Template',
                  pageWidth,
                  pageHeight,
                  leftMargin,
                  rightMargin,
                  labelGap,
                  heightGap,
                  labelsInRow: labelCount,
                  pageBreak,
                  barcodeFormat: printerType,
                  elements: elements
                };

                let res;
                if (activeTemplate && activeTemplate.name === templateName) {
                  res = await apiClient.put(`/barcode-settings/${activeTemplate.id}`, payload);
                } else {
                  res = await apiClient.post('/barcode-settings', payload);
                }

                if (res.data?.success) {
                  alert('Template saved successfully!');
                  fetchInitialData();
                  setShowDesigner(false);
                  setElements([]);
                  setSelectedId(null);
                  setShowPageSetup(false);
                }
              } catch (e) {
                console.error(e);
                alert('Failed to save template');
              }
            }}
            className="bg-[#28a745] hover:bg-[#218838] text-white px-4 h-[32px] rounded-[3px] flex items-center justify-center gap-1.5 text-[13px] font-bold transition-colors focus:outline-none"
          >
            <Save className="w-4 h-4" /> Save Template
          </button>
        </div>

        {/* Page Setup Options Panel */}
        {showPageSetup && (
          <div className="bg-white border-b border-gray-200 p-5 flex flex-col gap-4 shadow-sm">
            {/* Quick Presets */}
            <div className="flex items-center gap-3">
              <span className="text-[13.5px] font-bold text-gray-800 whitespace-nowrap">Quick Presets:</span>
              <div className="flex flex-wrap gap-2">
                {['50mm x 25mm', '38mm x 25mm', '38mm x 25mm (2 Labels)', '100mm x 50mm', 'Custom'].map((preset) => {
                  const isActive = activePreset === preset;
                  return (
                    <button
                      key={preset}
                      onClick={() => handlePresetClick(preset)}
                      className={cn(
                        "px-3.5 py-1 text-[13px] font-medium border rounded-[3px] transition-all focus:outline-none",
                        isActive
                          ? "border-[#0d6efd] text-[#0d6efd] bg-[#0d6efd]/5 font-bold"
                          : "border-[#0d6efd]/40 text-[#0d6efd] bg-white hover:bg-[#0d6efd]/5"
                      )}
                    >
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13.5px] font-bold text-gray-800">Page Width</label>
                <input
                  type="text"
                  value={pageWidth}
                  onChange={(e) => {
                    setPageWidth(e.target.value);
                    setActivePreset('Custom');
                  }}
                  className="h-[34px] border border-gray-300 rounded-[3px] px-2.5 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13.5px] font-bold text-gray-800">Page Height</label>
                <input
                  type="text"
                  value={pageHeight}
                  onChange={(e) => {
                    setPageHeight(e.target.value);
                    setActivePreset('Custom');
                  }}
                  className="h-[34px] border border-gray-300 rounded-[3px] px-2.5 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13.5px] font-bold text-gray-800">Left Margin</label>
                <input
                  type="text"
                  value={leftMargin}
                  onChange={(e) => {
                    setLeftMargin(e.target.value);
                    setActivePreset('Custom');
                  }}
                  className="h-[34px] border border-gray-300 rounded-[3px] px-2.5 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13.5px] font-bold text-gray-800">Right Margin</label>
                <input
                  type="text"
                  value={rightMargin}
                  onChange={(e) => {
                    setRightMargin(e.target.value);
                    setActivePreset('Custom');
                  }}
                  className="h-[34px] border border-gray-300 rounded-[3px] px-2.5 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13.5px] font-bold text-gray-800">Label Gap</label>
                <input
                  type="text"
                  value={labelGap}
                  onChange={(e) => {
                    setLabelGap(e.target.value);
                    setActivePreset('Custom');
                  }}
                  className="h-[34px] border border-gray-300 rounded-[3px] px-2.5 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13.5px] font-bold text-gray-800">Height Gap</label>
                <input
                  type="text"
                  value={heightGap}
                  onChange={(e) => {
                    setHeightGap(e.target.value);
                    setActivePreset('Custom');
                  }}
                  className="h-[34px] border border-gray-300 rounded-[3px] px-2.5 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13.5px] font-bold text-gray-800">Label Count (per row)</label>
                <input
                  type="text"
                  value={labelCount}
                  onChange={(e) => {
                    setLabelCount(e.target.value);
                    setActivePreset('Custom');
                  }}
                  className="h-[34px] border border-gray-300 rounded-[3px] px-2.5 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13.5px] font-bold text-gray-800">Page Break</label>
                <select
                  value={pageBreak}
                  onChange={(e) => setPageBreak(e.target.value)}
                  className="h-[34px] border border-gray-300 rounded-[3px] px-2.5 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13.5px] font-bold text-gray-800">Printer Type</label>
                <select
                  value={printerType}
                  onChange={(e) => setPrinterType(e.target.value)}
                  className="h-[34px] border border-gray-300 rounded-[3px] px-2.5 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                >
                  <option value="A4 Sheet">A4 Sheet (PDF/Normal)</option>
                  <option value="Thermal Roll">Thermal Roll</option>
                </select>
              </div>
            </div>

            {/* Info Banner */}
            <div className="bg-[#4F46E5] text-white py-2.5 px-4 rounded-[3px] flex items-center gap-2 text-[13px] font-medium mt-2">
              <Info className="w-4 h-4 flex-shrink-0" />
              <span>Common sizes: 50mm x 25mm, 38mm x 25mm, 100mm x 50mm. Adjust margins and gaps for proper printing alignment.</span>
            </div>
          </div>
        )}

        {/* Main Work Area */}
        <div className="flex-1 bg-white flex overflow-hidden">
          {/* Left Elements Sidebar */}
          <div className="w-[200px] border-r border-gray-200 p-4 bg-white flex flex-col overflow-y-auto">
            <h3 className="text-[14.5px] font-bold text-gray-800 mb-3 select-none">Elements</h3>
            <div className="flex flex-col border border-gray-200 rounded-[4px] overflow-hidden">
              <button
                onClick={() => addElement('text')}
                className="w-full flex items-center gap-3 px-4 h-[42px] bg-white hover:bg-[#f8f9fa] border-b border-gray-150 last:border-b-0 text-gray-700 transition-colors text-[13px] font-semibold focus:outline-none"
              >
                <span className="font-serif font-bold text-[15px] text-gray-600 w-4 h-4 flex items-center justify-center">A</span>
                <span>Text</span>
              </button>
              <button
                onClick={() => addElement('barcode')}
                className="w-full flex items-center gap-3 px-4 h-[42px] bg-white hover:bg-[#f8f9fa] border-b border-gray-150 last:border-b-0 text-gray-700 transition-colors text-[13px] font-semibold focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-500">
                  <line x1="3" y1="5" x2="3" y2="19" />
                  <line x1="6" y1="5" x2="6" y2="19" />
                  <line x1="10" y1="5" x2="10" y2="19" />
                  <line x1="14" y1="5" x2="14" y2="19" />
                  <line x1="18" y1="5" x2="18" y2="19" />
                  <line x1="21" y1="5" x2="21" y2="19" />
                </svg>
                <span>Barcode</span>
              </button>
              <button
                onClick={() => addElement('qrcode')}
                className="w-full flex items-center gap-3 px-4 h-[42px] bg-white hover:bg-[#f8f9fa] border-b border-gray-150 last:border-b-0 text-gray-700 transition-colors text-[13px] font-semibold focus:outline-none"
              >
                <QrCode className="w-4 h-4 text-gray-500" />
                <span>QR Code</span>
              </button>
              <button
                onClick={() => addElement('image')}
                className="w-full flex items-center gap-3 px-4 h-[42px] bg-white hover:bg-[#f8f9fa] border-b border-gray-150 last:border-b-0 text-gray-700 transition-colors text-[13px] font-semibold focus:outline-none"
              >
                <ImageIcon className="w-4 h-4 text-gray-500" />
                <span>Image</span>
              </button>
              <button
                onClick={() => addElement('rectangle')}
                className="w-full flex items-center gap-3 px-4 h-[42px] bg-white hover:bg-[#f8f9fa] border-b border-gray-150 last:border-b-0 text-gray-700 transition-colors text-[13px] font-semibold focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-500">
                  <rect x="3" y="3" width="18" height="18" rx="0" />
                </svg>
                <span>Rectangle</span>
              </button>
              <button
                onClick={() => addElement('circle')}
                className="w-full flex items-center gap-3 px-4 h-[42px] bg-white hover:bg-[#f8f9fa] border-b border-gray-150 last:border-b-0 text-gray-700 transition-colors text-[13px] font-semibold focus:outline-none"
              >
                <Circle className="w-4 h-4 text-gray-500" />
                <span>Circle</span>
              </button>
              <button
                onClick={() => addElement('line')}
                className="w-full flex items-center gap-3 px-4 h-[42px] bg-white hover:bg-[#f8f9fa] border-b border-gray-150 last:border-b-0 text-gray-700 transition-colors text-[13px] font-semibold focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-gray-500">
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>Line</span>
              </button>
            </div>
          </div>

          {/* Middle Design Canvas */}
          <div
            onClick={() => setSelectedId(null)}
            className="flex-1 bg-[#f1f3f5] flex items-center justify-center p-8 overflow-auto relative"
          >
            <div
              className="bg-white border-[3px] border-black shadow-lg relative overflow-hidden transition-transform duration-150 ease-out origin-center"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: `${canvasWidth}px`,
                height: `${canvasHeight}px`,
                backgroundImage: showGrid ? 'linear-gradient(to right, #ccc 1px, transparent 1px), linear-gradient(to bottom, #ccc 1px, transparent 1px)' : 'none',
                backgroundSize: `${(parseFloat(gridSize) || 1) * 6}px ${(parseFloat(gridSize) || 1) * 6}px`,
                transform: `scale(${zoom / 100})`,
              }}
            >
              {elements.map((el) => (
                <div
                  key={el.id}
                  onMouseDown={(e) => handleMouseDown(e, el.id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(el.id);
                  }}
                  className={cn(
                    "absolute cursor-move select-none flex items-center justify-center",
                    selectedId === el.id ? "z-50" : "z-10"
                  )}
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                  }}
                >
                  {/* Highlight outline if selected */}
                  {selectedId === el.id && (
                    <div className="absolute inset-[-2px] border-[2px] border-blue-500 pointer-events-none rounded-[1px]">
                      <div className="absolute top-[-3px] left-[-3px] w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <div className="absolute top-[-3px] right-[-3px] w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <div className="absolute bottom-[-3px] left-[-3px] w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <div className="absolute bottom-[-3px] right-[-3px] w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    </div>
                  )}

                  {/* Render based on element type */}
                  {el.type === 'text' && (
                    <span
                      style={{ fontSize: `${el.fontSize}px` }}
                      className="font-bold text-black whitespace-nowrap block select-none pointer-events-none"
                    >
                      {el.text}
                    </span>
                  )}

                  {el.type === 'barcode' && (
                    <div className="w-full h-full bg-white flex items-center justify-center pointer-events-none select-none overflow-hidden [&>svg]:w-full [&>svg]:h-full">
                      <Barcode value={el.text || '12345678'} width={el.width / 100} height={el.height - 15} fontSize={10} margin={0} displayValue={true} />
                    </div>
                  )}

                  {el.type === 'qrcode' && (
                    <div className="w-full h-full bg-white flex items-center justify-center pointer-events-none select-none">
                      <QRCodeSVG value={el.text || '12345'} size={Math.min(el.width, el.height)} />
                    </div>
                  )}

                  {el.type === 'image' && (
                    <div className="w-full h-full bg-gray-100 border border-dashed border-gray-400 flex items-center justify-center text-[10px] text-gray-500 font-bold p-1 pointer-events-none select-none">
                      <ImageIcon className="w-3.5 h-3.5 mr-0.5 text-gray-400" />
                      <span className="truncate">{el.text || 'Image'}</span>
                    </div>
                  )}

                  {el.type === 'rectangle' && (
                    <div className="w-full h-full border-[2px] border-black bg-transparent pointer-events-none select-none" />
                  )}

                  {el.type === 'circle' && (
                    <div className="w-full h-full border-[2px] border-black rounded-full bg-transparent pointer-events-none select-none" />
                  )}

                  {el.type === 'line' && (
                    <div className="w-full h-0 border-t-[2px] border-black pointer-events-none select-none" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Properties Sidebar */}
          <div className="w-[220px] border-l border-gray-200 p-4 bg-white flex flex-col overflow-y-auto">
            <h3 className="text-[14.5px] font-bold text-gray-800 mb-3 select-none">Properties</h3>
            {selectedEl ? (
              <div className="flex flex-col gap-3">
                <div className="text-[12px] font-bold text-gray-700">
                  Type: <span className="text-[#0d6efd] uppercase">{selectedEl.type}</span>
                </div>

                {/* X & Y position */}
                <div className="flex gap-2">
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-gray-500">Position X (px)</label>
                    <input
                      type="number"
                      value={selectedEl.x}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(canvasWidth - selectedEl.width, Number(e.target.value)));
                        setElements(prev => prev.map(el => el.id === selectedId ? { ...el, x: val } : el));
                      }}
                      className="h-[28px] border border-gray-300 rounded-[3px] px-1.5 text-[12px] outline-none text-gray-700 bg-white"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-gray-500">Position Y (px)</label>
                    <input
                      type="number"
                      value={selectedEl.y}
                      onChange={(e) => {
                        const val = Math.max(0, Math.min(canvasHeight - selectedEl.height, Number(e.target.value)));
                        setElements(prev => prev.map(el => el.id === selectedId ? { ...el, y: val } : el));
                      }}
                      className="h-[28px] border border-gray-300 rounded-[3px] px-1.5 text-[12px] outline-none text-gray-700 bg-white"
                    />
                  </div>
                </div>

                {/* Width & Height */}
                {selectedEl.type !== 'line' && (
                  <div className="flex gap-2">
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-gray-500">Width (px)</label>
                      <input
                        type="number"
                        value={selectedEl.width}
                        onChange={(e) => {
                          const val = Math.max(10, Math.min(canvasWidth - selectedEl.x, Number(e.target.value)));
                          setElements(prev => prev.map(el => el.id === selectedId ? { ...el, width: val } : el));
                        }}
                        className="h-[28px] border border-gray-300 rounded-[3px] px-1.5 text-[12px] outline-none text-gray-700 bg-white"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-gray-500">Height (px)</label>
                      <input
                        type="number"
                        value={selectedEl.height}
                        onChange={(e) => {
                          const val = Math.max(10, Math.min(canvasHeight - selectedEl.y, Number(e.target.value)));
                          setElements(prev => prev.map(el => el.id === selectedId ? { ...el, height: val } : el));
                        }}
                        className="h-[28px] border border-gray-300 rounded-[3px] px-1.5 text-[12px] outline-none text-gray-700 bg-white"
                      />
                    </div>
                  </div>
                )}

                {/* Text Content (Value) */}
                {['text', 'barcode', 'qrcode', 'image'].includes(selectedEl.type) && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-gray-500">Content Value</label>
                    <input
                      type="text"
                      value={selectedEl.text}
                      onChange={(e) => setElements(prev => prev.map(el => el.id === selectedId ? { ...el, text: e.target.value } : el))}
                      className="h-[28px] border border-gray-300 rounded-[3px] px-2 text-[12px] outline-none text-gray-700 bg-white"
                    />
                  </div>
                )}

                {/* Data Binding for Text */}
                {selectedEl.type === 'text' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-gray-500">Data Binding</label>
                    <select
                      value={selectedEl.field || 'Static Text'}
                      onChange={(e) => {
                        const field = e.target.value;
                        let defaultText = selectedEl.text;
                        if (field === 'Product Name') defaultText = 'Product Name';
                        if (field === 'MRP') defaultText = 'Γé╣0';
                        if (field === 'Sale Price') defaultText = 'Γé╣0';
                        if (field === 'Company Name') defaultText = 'SWAYAM BILL';
                        setElements(prev => prev.map(el => el.id === selectedId ? { ...el, field, text: field === 'Static Text' ? el.text : defaultText } : el));
                      }}
                      className="h-[28px] border border-gray-300 rounded-[3px] px-2 text-[12px] outline-none text-gray-700 bg-white mb-2"
                    >
                      <option value="Static Text">Static Text</option>
                      <option value="Product Name">Product Name</option>
                      <option value="MRP">MRP</option>
                      <option value="Sale Price">Sale Price</option>
                      <option value="Company Name">Company Name</option>
                    </select>
                  </div>
                )}

                {/* Font Size */}
                {selectedEl.type === 'text' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-gray-500">Font Size (px)</label>
                    <input
                      type="number"
                      value={selectedEl.fontSize}
                      onChange={(e) => setElements(prev => prev.map(el => el.id === selectedId ? { ...el, fontSize: Number(e.target.value) } : el))}
                      className="h-[28px] border border-gray-300 rounded-[3px] px-1.5 text-[12px] outline-none text-gray-700 bg-white"
                    />
                  </div>
                )}

                <button
                  onClick={() => {
                    setElements(prev => prev.filter(el => el.id !== selectedId));
                    setSelectedId(null);
                  }}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded-[3px] text-[12px] font-bold transition-colors focus:outline-none flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Delete Element
                </button>
              </div>
            ) : (
              <p className="text-[13px] text-gray-500 font-medium select-none">
                Select an element to edit properties
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (showTemplates) {
    return (
      <div className="bg-[#f4f6f9] min-h-[calc(100vh-60px)] flex flex-col">
        {/* Top Teal Bar for Templates */}
        <div className="bg-[#4F46E5] px-4 py-[6px] flex justify-between items-center text-white h-[45px]">
          <h2 className="text-[14.5px] font-medium tracking-wide">Barcode Templates</h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowDesigner(true)}
              className="bg-[#28a745] hover:bg-[#218838] text-white px-3.5 h-8 rounded-[3px] flex items-center justify-center gap-1 text-[13px] font-bold transition-colors focus:outline-none"
            >
              <span className="text-[15px] leading-none">+</span> New Template
            </button>
            <button
              onClick={() => setShowTemplates(false)}
              className="w-8 h-8 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-[3px] flex items-center justify-center transition-colors focus:outline-none"
            >
              <X className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white flex flex-col p-6">
          <div className="flex-1 border border-gray-150 rounded-[3px] bg-white flex flex-col items-center justify-center min-h-[350px] shadow-sm">
            <p className="text-gray-600 text-[14px] font-medium text-center">
              No templates found. Create your first template to get started.
            </p>
            <button
              onClick={() => setShowDesigner(true)}
              className="mt-4 bg-[#0d6efd] hover:bg-[#0b5ed7] text-white px-4 py-2 rounded-[3px] flex items-center gap-1.5 text-[13px] font-bold transition-colors focus:outline-none"
            >
              <span className="text-[15px] leading-none">+</span> Create Template
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-60px)] flex flex-col print:bg-white print:min-h-0 print:h-auto print:block">
      <div className="print:hidden flex-1 flex flex-col">
        {/* Top Teal Bar */}
        <div className="bg-[#4F46E5] px-4 py-[6px] flex justify-between items-center text-white h-[45px]">
          <h2 className="text-[14.5px] font-medium tracking-wide">Barcode</h2>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 bg-red-600 hover:bg-red-700 text-white rounded-[3px] flex items-center justify-center transition-colors focus:outline-none">
              <YoutubeIcon className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 rounded-[3px] flex items-center justify-center transition-colors focus:outline-none">
              <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 bg-[#dc3545] hover:bg-[#c82333] text-white rounded-[3px] flex items-center justify-center transition-colors focus:outline-none"
            >
              <X className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-white flex flex-col">
          {/* Main Form Area */}
          <div className="p-6 flex flex-col">
            <div className="flex flex-col md:flex-row gap-6 items-stretch">

              {/* Left Form */}
              <div className="flex-1 flex flex-col gap-4">

                {/* Barcode Template */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-gray-800">Barcode Template</label>
                  <div className="flex gap-1.5">
                    <div className="flex-1 relative flex">
                      <input
                        list="barcode-templates"
                        value={selectedTemplateName}
                        onChange={e => setSelectedTemplateName(e.target.value)}
                        placeholder="Select Template (or use default)"
                        className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                      />
                      <datalist id="barcode-templates">
                        {templates.map(t => <option key={t.id} value={t.name} />)}
                      </datalist>
                    </div>
                    <button
                      onClick={() => {
                        if (activeTemplate) {
                          setTemplateName(activeTemplate.name);
                          setPageWidth(activeTemplate.pageWidth || '50mm');
                          setPageHeight(activeTemplate.pageHeight || '25mm');
                          setLeftMargin(activeTemplate.leftMargin || '0.5mm');
                          setRightMargin(activeTemplate.rightMargin || '0.5mm');
                          setLabelGap(activeTemplate.labelGap || '1mm');
                          setHeightGap(activeTemplate.heightGap || '1mm');
                          setLabelCount(activeTemplate.labelsInRow || '1');
                          setPageBreak(activeTemplate.pageBreak || 'No');

                          let loadedElements = [];
                          try {
                            loadedElements = typeof activeTemplate.elements === 'string'
                              ? JSON.parse(activeTemplate.elements)
                              : (activeTemplate.elements || []);
                          } catch (e) { }
                          setElements(loadedElements);
                        } else {
                          setElements([]);
                          setTemplateName('');
                        }
                        setShowDesigner(true);
                      }}
                      className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-2.5 rounded-[3px] flex items-center justify-center transition-colors focus:outline-none"
                      title="Edit Template in Designer"
                    >
                      <Settings className="w-4 h-4" strokeWidth={2} />
                    </button>
                  </div>
                </div>

                {/* Row 1: Product Select, Product Units, Barcode */}
                <div className="flex gap-4 items-end">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        onClick={() => setSearchMode(prev => prev === 'Product Name' ? 'Product Code' : 'Product Name')}
                        className="bg-[#4F46E5] text-white text-[11px] font-bold px-2 py-0.5 rounded-[2px] leading-none select-none cursor-pointer whitespace-nowrap"
                        title="Click to toggle search mode"
                      >
                        {searchMode === 'Product Code' ? 'Product Code' : 'Product Name'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div
                          onClick={() => setIsManufactureProduct(!isManufactureProduct)}
                          className={cn(
                            "w-[32px] h-[18px] rounded-full relative cursor-pointer border transition-colors duration-200",
                            isManufactureProduct ? "bg-[#0d6efd] border-[#0d6efd]" : "bg-gray-300 border-gray-400"
                          )}
                        >
                          <div className={cn(
                            "w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] transition-transform duration-200",
                            isManufactureProduct ? "translate-x-[16px]" : "translate-x-[2px]"
                          )}></div>
                        </div>
                        <span className="text-[13px] font-bold text-gray-800 select-none">Manufacture Product</span>
                      </div>
                    </div>
                    <div className="w-full h-[32px] border border-gray-300 bg-[#a6cdec] rounded-[3px] focus-within:border-[#4F46E5]">
                      <ProductSelectDropdown
                        products={products}
                        value={selectedProduct}
                        onChange={(id) => handleProductSelect({ target: { value: id } })}
                        onEdit={(data) => {
                          setItemModalData(data);
                          setIsItemModalOpen(true);
                        }}
                        onDelete={() => { }}
                        searchMode={searchMode}
                      />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-gray-800">Product Units</label>
                    <div className="flex-1 relative flex">
                      <input
                        list="product-units-list"
                        value={selectedUnit}
                        onChange={(e) => setSelectedUnit(e.target.value)}
                        placeholder="Select Unit"
                        className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                      />
                      <datalist id="product-units-list">
                        {units.map(u => (
                          <option key={u.id} value={u.name} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-gray-800">Barcode</label>
                    <input
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Barcode Number"
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none placeholder-gray-400 text-gray-700 bg-white focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                {/* Row 2: MRP, Sale Price & Whole Sale Price */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-gray-800">MRP</label>
                    <input
                      type="text"
                      value={mrpInput}
                      onChange={(e) => setMrpInput(e.target.value)}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-gray-800">Sale Price</label>
                    <input
                      type="text"
                      value={salePriceInput}
                      onChange={(e) => setSalePriceInput(e.target.value)}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-gray-800">Whole Sale Price</label>
                    <input
                      type="text"
                      value={wholesalePriceInput}
                      onChange={(e) => setWholesalePriceInput(e.target.value)}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                    />
                  </div>
                </div>

                {/* Row 3 (Conditional): Date of Manufacture, Batch No., Net Quantity */}
                {isManufactureProduct && (
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[13px] font-bold text-gray-800">Date of Manufacture</label>
                      <input
                        type="date"
                        value={mfgDate}
                        onChange={(e) => setMfgDate(e.target.value)}
                        className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[13px] font-bold text-gray-800">Batch No.</label>
                      <input
                        type="text"
                        value={batchNoInput}
                        onChange={(e) => setBatchNoInput(e.target.value)}
                        placeholder="Enter Batch No."
                        className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none placeholder-gray-400 text-gray-700 bg-white focus:border-[#4F46E5]"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[13px] font-bold text-gray-800">Net Quantity</label>
                      <input
                        type="text"
                        defaultValue="0"
                        className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>
                )}

                {/* Row 4 (Conditional): Marketed By, Marketed Address */}
                {isManufactureProduct && (
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-[13px] font-bold text-gray-800">Marketed By</label>
                      <input
                        type="text"
                        placeholder="Enter Marketed By"
                        className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none placeholder-gray-400 text-gray-700 bg-white focus:border-[#4F46E5]"
                      />
                    </div>
                    <div className="flex-[2] flex flex-col gap-1.5">
                      <label className="text-[13px] font-bold text-gray-800">Marketed Address</label>
                      <input
                        type="text"
                        placeholder="Enter Marketed Address"
                        className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none placeholder-gray-400 text-gray-700 bg-white focus:border-[#4F46E5]"
                      />
                    </div>
                  </div>
                )}

                {/* Row 5: Quantity to Print & Auto Quantity */}
                <div className="flex gap-4">
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-gray-800">Quantity to Print</label>
                    <input
                      type="number"
                      value={printQty}
                      onChange={(e) => setPrintQty(e.target.value)}
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <label className="text-[13px] font-bold text-gray-800">Auto Quantity</label>
                    <input
                      type="text"
                      defaultValue="0"
                      className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 bg-white focus:border-[#4F46E5]"
                    />
                  </div>
                  <div className="flex-1"></div>
                </div>

              </div>

              {/* Right Preview */}
              <div className="w-full md:w-[380px] flex flex-col">
                <div className="w-full h-full min-h-[190px] border border-gray-800 bg-[#f8f9fa] flex flex-col items-center justify-center rounded-[3px] p-4 gap-6">

                  {selectedProduct ? (
                    <div className="bg-white border border-gray-300 shadow-sm p-3 w-[240px] flex flex-col items-center text-center">
                      <span className="text-[14px] font-bold text-gray-900 mb-1 leading-tight">{products.find(p => p.id.toString() === selectedProduct.toString())?.name || 'Product'}</span>

                      <div className="flex items-center gap-3 text-[11px] font-bold text-gray-800 mb-2">
                        <span>MRP: {mrpInput}</span>
                        <span>Price: {salePriceInput}</span>
                      </div>

                      <Barcode value={barcodeInput || '1234567890'} width={1.5} height={40} fontSize={13} margin={0} displayValue={true} />
                    </div>
                  ) : (
                    <div className="text-gray-400 text-[13px] font-medium flex flex-col items-center">
                      <BarcodeIcon className="w-10 h-10 mb-2 opacity-30" />
                      <span>No product selected for preview</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <div
                      onClick={() => setIsSpecialCommision(!isSpecialCommision)}
                      className={cn(
                        "w-[32px] h-[18px] rounded-full relative cursor-pointer transition-colors duration-200 border",
                        isSpecialCommision ? "bg-[#0d6efd] border-[#0d6efd]" : "bg-gray-300 border-gray-400"
                      )}
                    >
                      <div className={cn(
                        "w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] transition-transform duration-200 shadow-sm",
                        isSpecialCommision ? "translate-x-[16px]" : "translate-x-[2px]"
                      )}></div>
                    </div>
                    <span className="text-[13px] font-bold text-gray-800 select-none">Special Commision</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-center mt-6 mb-2">
              <button
                onClick={handleAddToList}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors focus:outline-none"
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} /> Submit
              </button>
              <button onClick={() => window.print()} className="bg-[#4F46E5] hover:bg-[#4338ca] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium flex items-center justify-center gap-1.5 transition-colors focus:outline-none">
                <Printer className="w-[14px] h-[14px]" strokeWidth={2} /> Print
              </button>
            </div>
          </div>

          {/* Bottom Table */}
          <div className="w-full mb-1">
            <div className="table-scroll w-full overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#343a40] text-white">
                    <th className="py-[6px] px-2 text-left text-[11px] font-bold border-r border-gray-500 w-[60px] whitespace-nowrap">S/NO</th>
                    <th className="py-[6px] px-2 text-left text-[11px] font-bold border-r border-gray-500 whitespace-nowrap">Product Name</th>
                    <th className="py-[6px] px-2 text-left text-[11px] font-bold border-r border-gray-500 whitespace-nowrap">Barcode</th>
                    <th className="py-[6px] px-2 text-left text-[11px] font-bold border-r border-gray-500 w-[150px] whitespace-nowrap">Quantity to Print</th>
                    <th className="py-[6px] px-2 text-left text-[11px] font-bold border-r border-gray-500 w-[120px] whitespace-nowrap">Sale Price</th>
                    <th className="py-[6px] px-2 text-center text-[11px] font-bold uppercase w-[80px] whitespace-nowrap">ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {printList.map((item, index) => (
                    <React.Fragment key={item.id}>
                      <tr className="border-b border-gray-200">
                        <td className="py-2 px-2 text-left text-[12px] font-medium border-r border-gray-200">{index + 1}</td>
                        <td className="py-2 px-2 text-left text-[12px] font-medium border-r border-gray-200">{item.name}</td>
                        <td className="py-2 px-2 text-left text-[12px] font-medium border-r border-gray-200">{item.barcode}</td>
                        <td className="py-2 px-2 text-left text-[12px] font-medium border-r border-gray-200">{item.quantity}</td>
                        <td className="py-2 px-2 text-left text-[12px] font-medium border-r border-gray-200">{item.salePrice}</td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setPrintRowQty(item.quantity || 1);
                                setPrintRowModal(item);
                              }}
                              className="text-[#4F46E5] hover:text-[#4338ca] bg-[#e0f7fa] p-1.5 rounded-sm transition-colors focus:outline-none"
                              title="Print"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditItem(item)}
                              className="text-[#0d6efd] hover:text-[#0b5ed7] bg-[#e6f0ff] p-1.5 rounded-sm transition-colors focus:outline-none"
                              title="Edit"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleRemoveFromList(item.id)}
                              className="text-[#dc3545] hover:text-[#c82333] bg-[#fce4e4] p-1.5 rounded-sm transition-colors focus:outline-none"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {printRowModal && printRowModal.id === item.id && (
                        <tr className="bg-[#8fbce8] border-b border-[#7da9d6] print:hidden">
                          <td colSpan="6" className="py-2 px-4">
                            <div className="flex items-center justify-center gap-4">
                              <span className="text-[#1a365d] font-bold text-[13px]">Enter Quantity to Print:</span>
                              <input
                                type="number"
                                value={printRowQty}
                                onChange={(e) => setPrintRowQty(e.target.value)}
                                className="w-[60px] h-[26px] bg-[#d0e5f5] border border-blue-400 rounded-[3px] text-center font-bold text-blue-700 outline-none"
                                min="1"
                              />
                              <button
                                onClick={() => {
                                  window.print();
                                  setTimeout(() => setPrintRowModal(null), 100);
                                }}
                                className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1 rounded-[3px] font-bold text-[12px] flex items-center gap-1 shadow-sm"
                              >
                                <Printer className="w-3.5 h-3.5" /> Print
                              </button>
                              <button
                                onClick={() => setPrintRowModal(null)}
                                className="bg-[#6c757d] hover:bg-[#5a6268] text-white px-3 py-1 rounded-[3px] font-bold text-[12px] flex items-center gap-1 shadow-sm"
                              >
                                <X className="w-3.5 h-3.5" /> Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                  {printList.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-gray-500 text-[12px]">No barcodes added to print list.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="h-6 w-full border border-t-0 border-gray-300"></div>
          </div>
        </div>

        {/* Edit Modal */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-white rounded-[3px] p-5 w-[400px] shadow-2xl">
              <h2 className="text-[15px] font-bold text-gray-800 mb-4 border-b pb-2">Edit Print Item</h2>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-gray-800">Quantity to Print</label>
                  <input
                    type="number"
                    className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 focus:border-[#4F46E5]"
                    value={editingItem.quantity}
                    onChange={e => setEditingItem({ ...editingItem, quantity: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-gray-800">Sale Price</label>
                  <input
                    type="text"
                    className="w-full h-[32px] border border-gray-300 rounded-[3px] px-2 text-[13px] outline-none text-gray-700 focus:border-[#4F46E5]"
                    value={editingItem.salePrice}
                    onChange={e => setEditingItem({ ...editingItem, salePrice: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 justify-end mt-4">
                  <button className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors" onClick={() => setEditingItem(null)}>Cancel</button>
                  <button className="bg-[#0d6efd] hover:bg-[#0b5ed7] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors" onClick={() => {
                    setPrintList(printList.map(i => i.id === editingItem.id ? editingItem : i));
                    setEditingItem(null);
                  }}>Save Changes</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Item Master Modal (for adding/editing products) */}
        <ItemMasterModal
          isOpen={isItemModalOpen}
          onClose={() => setIsItemModalOpen(false)}
          editData={itemModalData}
          onSave={async (newItem) => {
            try {
              // Auto-create category if new
              if (newItem.category && newItem.category.trim() !== '') {
                try {
                  const catRes = await apiClient.get('/categories');
                  const existingCategories = catRes.data?.data || [];
                  const exists = existingCategories.some(
                    c => c.name.toLowerCase() === newItem.category.trim().toLowerCase()
                  );
                  if (!exists) {
                    await apiClient.post('/categories', {
                      name: newItem.category.trim(),
                      purchaseDiscount: 0,
                      saleDiscount: 0,
                      isActive: true,
                      attributes: []
                    });
                  }
                } catch (catErr) {
                  console.error('Failed to auto-create category:', catErr);
                }
              }

              const payload = {
                ...newItem,
                sku: newItem.sku || `SKU${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
                price: parseFloat(newItem.price) || 0,
                mrp: parseFloat(newItem.mrp) || 0,
                stock: parseInt(newItem.qty) || 0,
              };

              const isEdit = itemModalData && itemModalData.id;
              const res = isEdit
                ? await apiClient.put(`/products/${itemModalData.id}`, payload)
                : await apiClient.post('/products', payload);

              if (res.data?.success) {
                await fetchInitialData();
                if (res.data.data && res.data.data.id) {
                  setSelectedProduct(res.data.data.id.toString());
                } else if (!isEdit) {
                  // Try to select by name if ID isn't returned
                  const updatedProdRes = await apiClient.get('/products');
                  const allProds = updatedProdRes.data?.data || [];
                  const justAdded = allProds.find(p => p.name === payload.name);
                  if (justAdded) setSelectedProduct(justAdded.id.toString());
                }
              }
            } catch (error) {
              console.error('Failed to save product:', error);
              alert('Failed to save product');
            }
            setIsItemModalOpen(false);
          }}
          products={products}
        />
      </div>

      {/* Hidden Print Section for QR Codes */}
      <style>
        {`
          @media print {
            @page {
              size: ${(activeTemplate?.barcodeFormat === 'Thermal Roll' || printerType === 'Thermal Roll') ? `${(parseInt(activeTemplate?.labelsInRow || labelCount) > 1 && (activeTemplate?.pageWidth || pageWidth || '50mm') === '50mm') ? '78mm' : (activeTemplate?.pageWidth || pageWidth || '50mm')} ${activeTemplate?.pageHeight || pageHeight || '25mm'}` : (parseInt(activeTemplate?.labelsInRow || labelCount) > 1 ? 'A4 portrait' : `${activeTemplate?.pageWidth || pageWidth || '50mm'} ${activeTemplate?.pageHeight || pageHeight || '25mm'}`)};
              margin: ${(activeTemplate?.barcodeFormat === 'Thermal Roll' || printerType === 'Thermal Roll') ? `${activeTemplate?.marginTop || '0mm'} ${activeTemplate?.marginRight || '0mm'} ${activeTemplate?.marginBottom || '0mm'} ${activeTemplate?.marginLeft || '0mm'}` : (parseInt(activeTemplate?.labelsInRow || labelCount) > 1 ? '10mm 8mm' : `${activeTemplate?.marginTop || '0mm'} ${activeTemplate?.marginRight || '0mm'} ${activeTemplate?.marginBottom || '0mm'} ${activeTemplate?.marginLeft || '0mm'}`)};
            }
            html, body, #root {
              margin: 0 !important;
              padding: 0 !important;
              background-color: white !important;
              height: auto !important;
              min-height: 0 !important;
            }
            body * { visibility: hidden; }
            #qr-print-section, #qr-print-section * { visibility: visible; }
            #qr-print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              display: ${parseInt(activeTemplate?.labelsInRow || labelCount) > 1 ? 'grid' : 'flex'};
              ${parseInt(activeTemplate?.labelsInRow || labelCount) > 1 ? `grid-template-columns: repeat(${parseInt(activeTemplate?.labelsInRow || labelCount)}, 1fr);` : 'flex-wrap: wrap;'}
              gap: ${activeTemplate?.labelGap || labelGap || '2mm'} ${activeTemplate?.heightGap || heightGap || '2mm'};
              padding: 0;
              margin: 0;
              box-sizing: border-box;
            }
            .print-item {
              width: ${parseInt(activeTemplate?.labelsInRow || labelCount) > 1 ? '100%' : (activeTemplate?.pageWidth || pageWidth || '50mm')};
              height: ${(activeTemplate?.barcodeFormat === 'Thermal Roll' || printerType === 'Thermal Roll') ? (activeTemplate?.pageHeight || pageHeight || '25mm') : (parseInt(activeTemplate?.labelsInRow || labelCount) > 1 ? (activeTemplate?.pageHeight || pageHeight || '45mm') : (activeTemplate?.pageHeight || pageHeight || '25mm'))};
              overflow: hidden;
              box-sizing: border-box;
              margin: 0;
              padding: 3mm 4mm;
              border: 1.5px solid #000 !important;
              border-radius: 4px;
              background: white;
              display: flex;
              justify-content: space-between;
              align-items: center;
              ${parseInt(activeTemplate?.labelsInRow || labelCount) > 1
            ? 'page-break-inside: avoid; break-inside: avoid; page-break-after: avoid; break-after: avoid;'
            : (pageBreak === 'Yes' ? 'page-break-after: always; break-after: page;' : 'page-break-inside: avoid; break-inside: avoid;')}
            }
          }
        `}
      </style>
      <div id="qr-print-section" className="hidden print:flex print:flex-wrap">
        {(() => {
          const itemsToPrint = printRowModal
            ? Array.from({ length: Math.max(1, parseInt(printRowQty) || 1) }).map(() => printRowModal)
            : printList.flatMap(item => Array.from({ length: Math.max(1, parseInt(item.quantity) || 1) }).map(() => item));

          return itemsToPrint.map((item, i) => {
            const fullProd = products.find(p => p.id?.toString() === item.productId?.toString());
            let tmplElements = [];
            if (activeTemplate?.elements) {
              try {
                tmplElements = typeof activeTemplate.elements === 'string' ? JSON.parse(activeTemplate.elements) : activeTemplate.elements;
              } catch (err) {
                console.warn('Failed to parse active template elements:', err);
              }
            }

            return (
              <div key={i} className="print-item bg-white p-[2mm] border-[1.5px] border-black box-border flex items-center justify-between">
                <div className="flex flex-col items-start justify-center flex-1 min-w-0 pr-1">
                  {(activeTemplate?.showHeading !== false) && (
                    <span style={{ fontSize: '9px' }} className="font-bold text-[#034694] leading-none uppercase w-full break-words line-clamp-1 overflow-hidden">
                      {activeTemplate?.barcodeHeading || 'SWAYAM BILL'}
                    </span>
                  )}
                  <span style={{ fontSize: '11px', lineHeight: '1.1' }} className="font-extrabold text-[#034694] uppercase mt-[2px] break-words line-clamp-2 overflow-hidden w-full">
                    {item.name}
                  </span>
                  <div className="flex flex-col mt-[2px] w-full">
                    {(activeTemplate?.showCategory === true) && (
                      <span style={{ fontSize: '9px' }} className="font-bold text-[#034694] w-full break-words line-clamp-1 overflow-hidden">
                        <span className="text-black font-semibold">Cat: </span>{item.category || item.categoryName || fullProd?.category || ''}
                      </span>
                    )}
                    {(activeTemplate?.showBrand === true) && (
                      <span style={{ fontSize: '9px' }} className="font-bold text-[#034694] w-full break-words line-clamp-1 overflow-hidden">
                        <span className="text-black font-semibold">Brand: </span>{item.brand || item.brandName || fullProd?.brand || ''}
                      </span>
                    )}
                    {(activeTemplate?.showSize === true) && (
                      <span style={{ fontSize: '9px' }} className="font-bold text-[#034694] w-full break-words line-clamp-1 overflow-hidden">
                        <span className="text-black font-semibold">Size: </span>{item.size || fullProd?.size || ''}
                      </span>
                    )}
                    {(activeTemplate?.showColor === true) && (
                      <span style={{ fontSize: '9px' }} className="font-bold text-[#034694] w-full break-words line-clamp-1 overflow-hidden">
                        <span className="text-black font-semibold">Color: </span>{item.color || fullProd?.color || fullProd?.colour || ''}
                      </span>
                    )}
                    {(activeTemplate?.showUnit === true) && (
                      <span style={{ fontSize: '9px' }} className="font-bold text-[#034694] w-full break-words line-clamp-1 overflow-hidden">
                        <span className="text-black font-semibold">Unit: </span>{item.unit || item.primaryUnit || fullProd?.baseUnit || fullProd?.salesUnit || ''}
                      </span>
                    )}
                    {(activeTemplate?.showBatchNo === true) && (
                      <span style={{ fontSize: '9px' }} className="font-bold text-[#034694] w-full break-words line-clamp-1 overflow-hidden">
                        <span className="text-black font-semibold">Batch: </span>{item.batchNo || item.batch_no || fullProd?.batchNo || fullProd?.batch_no || ''}
                      </span>
                    )}
                    {(activeTemplate?.showImei === true) && (
                      <span style={{ fontSize: '9px' }} className="font-bold text-[#034694] w-full break-words line-clamp-1 overflow-hidden">
                        <span className="text-black font-semibold">IMEI: </span>{item.imei || fullProd?.imei || ''}
                      </span>
                    )}
                    {(activeTemplate?.showLocation === true) && (
                      <span style={{ fontSize: '9px' }} className="font-bold text-[#034694] w-full break-words line-clamp-1 overflow-hidden">
                        <span className="text-black font-semibold">Loc: </span>{item.location || item.rack || fullProd?.location || fullProd?.rack || ''}
                      </span>
                    )}
                    {(activeTemplate?.showMRP !== false) && (
                      <span style={{ fontSize: '9px' }} className="font-bold text-[#034694] w-full break-words line-clamp-1 overflow-hidden">
                        <span className="text-black font-semibold">MRP: </span>{item.mrp || 0}
                      </span>
                    )}
                    {(activeTemplate?.showSalePrice !== false) && (
                      <span style={{ fontSize: '9px' }} className="font-bold text-[#034694] w-full break-words line-clamp-1 overflow-hidden">
                        <span className="text-black font-semibold">Price: </span>{item.salePrice || item.price || 0}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center shrink-0 w-[45px]">
                  {!activeTemplate?.hideBarcode && (
                    <>
                      {(!tmplElements || tmplElements.length === 0) ? (
                        <QRCodeSVG
                          value={item.barcode || item.id?.toString() || '12345'}
                          size={35}
                        />
                      ) : tmplElements?.some(el => el.type === 'barcode') ? (
                        <Barcode
                          value={item.barcode || item.id?.toString() || '12345'}
                          width={1}
                          height={25}
                          fontSize={9}
                          margin={0}
                          displayValue={false}
                          background="transparent"
                        />
                      ) : tmplElements?.some(el => el.type === 'qrcode') ? (
                        <QRCodeSVG
                          value={item.barcode || item.id?.toString() || '12345'}
                          size={45}
                        />
                      ) : tmplElements?.some(el => el.type === 'image') ? (
                        <div className="w-[45px] h-[45px] border border-dashed border-gray-400 flex flex-col items-center justify-center text-[9px] text-gray-500 font-bold p-1 overflow-hidden bg-gray-100">
                          <ImageIcon className="w-4 h-4 text-gray-400 shrink-0 mb-0.5" />
                          <span className="truncate">Image</span>
                        </div>
                      ) : tmplElements?.some(el => el.type === 'circle') ? (
                        <div className="w-[45px] h-[45px] border-[1.5px] border-black box-border rounded-full"></div>
                      ) : tmplElements?.some(el => el.type === 'rectangle') ? (
                        <div className="w-[45px] h-[45px] border-[1.5px] border-black box-border"></div>
                      ) : tmplElements?.some(el => el.type === 'line') ? (
                        <div className="w-[45px] h-[1.5px] bg-black"></div>
                      ) : tmplElements?.some(el => el.type === 'text') ? (
                        <span style={{ fontSize: `${tmplElements.find(el => el.type === 'text').fontSize || 12}px` }} className="font-bold text-black text-center break-words px-1">
                          {tmplElements.find(el => el.type === 'text').field === 'Product Name' ? item.name :
                            tmplElements.find(el => el.type === 'text').field === 'MRP' ? `${item.mrp || 0}` :
                              tmplElements.find(el => el.type === 'text').field === 'Sale Price' ? `${item.salePrice || item.price || 0}` :
                                tmplElements.find(el => el.type === 'text').text}
                        </span>
                      ) : null}

                      {(!tmplElements || tmplElements.length === 0 || tmplElements.some(el => el.type === 'barcode' || el.type === 'qrcode')) && (
                        <span style={{ fontSize: '8px' }} className="font-bold text-[#034694] mt-[2px] tracking-wide w-full text-center">
                          {item.barcode || item.id?.toString() || '12345'}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          });
        })()}
      </div>

    </div>
  );
}
