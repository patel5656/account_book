import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit, Trash2, Filter, ChevronDown, Package, ScanBarcode, X } from 'lucide-react';
import { BarcodeScannerModal } from './BarcodeScannerModal';
import { useSettings } from '../context/SettingsContext';

export function ProductSelectDropdown({ products, value, selectedVariant, onChange, onEdit, onDelete, showPurchasePrice, searchMode = 'Product Name' }) {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProductId, setExpandedProductId] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [menuRect, setMenuRect] = useState(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside both the trigger and the portal menu
      const isOutsideTrigger = dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isOutsideMenu = !event.target.closest('.product-dropdown-menu');
      
      if (isOutsideTrigger && isOutsideMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    // Update position on scroll instead of closing, but ignore internal menu scrolling
    const handleScroll = (event) => {
      if (event.target && event.target.closest && event.target.closest('.product-dropdown-menu')) {
        return; // Let the menu itself scroll
      }
      if (dropdownRef.current) {
        setMenuRect(dropdownRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  // Focus input and calculate position when dropdown opens
  useEffect(() => {
    if (isOpen) {
      if (dropdownRef.current) {
        setMenuRect(dropdownRef.current.getBoundingClientRect());
      }
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen]);

  const selectedProduct = products.find(p => p.id === parseInt(value)) || null;

  const filteredProducts = products.filter(p => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    switch (searchMode) {
      case 'Product Code':
        return p.sku?.toLowerCase().includes(term);
      case 'Barcode':
        return p.barcode?.toLowerCase().includes(term);
      case 'Batch No':
        return p.batchNo?.toLowerCase().includes(term);
      case 'Product Name':
      default:
        return p.name?.toLowerCase().includes(term) || p.sku?.toLowerCase().includes(term);
    }
  });

  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const itemRefs = useRef([]);

  // Reset highlight index when filter results change
  useEffect(() => {
    setHighlightedIndex(filteredProducts.length > 0 ? 0 : -1);
  }, [searchTerm, products]);

  // Sync ref array size
  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filteredProducts.length);
  }, [filteredProducts]);

  // Auto-scroll focused item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [highlightedIndex]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const next = prev + 1;
        return next >= filteredProducts.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const next = prev - 1;
        return next < 0 ? filteredProducts.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts.length === 0 && searchTerm.trim()) {
        onEdit({ name: searchTerm });
        setIsOpen(false);
      } else if (highlightedIndex >= 0 && highlightedIndex < filteredProducts.length) {
        handleSelect(filteredProducts[highlightedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (productId, variant = null) => {
    onChange(productId, variant);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full h-full flex items-center gap-1" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <div 
        className="flex-1 h-full border border-transparent rounded-[3px] px-2 py-1 text-[13px] outline-none font-bold text-gray-800 bg-transparent flex items-center justify-between cursor-pointer hover:border-gray-300 min-w-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate flex-1 text-left">
          {(() => {
            if (!selectedProduct) return <span className="text-gray-400 font-normal">Enter {searchMode}</span>;
            let skuStr = (settings?.showSKU && selectedProduct.sku) ? ` - SKU: ${selectedProduct.sku.replace(/-\d{9,}.*$/, '')}` : '';
            let subItemsList = [];
            if (selectedProduct.subItems) {
              try {
                subItemsList = typeof selectedProduct.subItems === 'string' ? JSON.parse(selectedProduct.subItems) : selectedProduct.subItems;
              } catch (e) {}
            }
            let variantStr = '';
            if (selectedVariant && selectedVariant.name) {
              variantStr = ` - ${selectedVariant.name}`;
            } else if (settings?.manageVariants) {
              if (Array.isArray(subItemsList) && subItemsList.length > 0) {
                variantStr = ` (${subItemsList.length} Variant${subItemsList.length > 1 ? 's' : ''}: ${subItemsList.map(v => [v.size, v.color].filter(Boolean).join('/')).filter(Boolean).join(', ')})`;
              } else if (selectedProduct.colour || selectedProduct.colorVariant || selectedProduct.size) {
                variantStr = ` (${[selectedProduct.size ? `Size: ${selectedProduct.size}` : '', (selectedProduct.colour || selectedProduct.colorVariant) ? `Color: ${selectedProduct.colour || selectedProduct.colorVariant}` : ''].filter(Boolean).join(', ')})`;
              }
            }
            return `${selectedProduct.name}${skuStr}${variantStr}`;
          })()}
        </span>
        <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
          {selectedProduct && (
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange("");
                setSearchTerm('');
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 cursor-pointer flex items-center justify-center rounded hover:bg-gray-100"
              title="Clear Product"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" onClick={() => setIsOpen(!isOpen)} />
        </div>
      </div>
      
      {/* Barcode Scanner Button */}
      {searchMode === 'Barcode' && (
         <div 
           className="w-7 h-7 flex items-center justify-center bg-[#f4f7f6] border border-gray-300 rounded-[3px] hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0 shadow-sm"
           onClick={(e) => { 
             e.stopPropagation();
             setIsOpen(false);
             setIsScannerOpen(true);
           }}
           title="Scan Barcode"
         >
           <ScanBarcode className="w-4 h-4 text-gray-700" />
         </div>
      )}

      {/* Dropdown Menu (Portal) */}
      {isOpen && menuRect && createPortal(
        <div 
          className="product-dropdown-menu bg-white border border-gray-300 shadow-2xl rounded-[3px] z-[9999] flex flex-col max-h-[350px]"
          style={{
            position: 'fixed',
            top: `${menuRect.bottom + 2}px`,
            left: `${menuRect.left}px`,
            width: '450px',
            maxWidth: '90vw'
          }}
        >
          {/* Header & Search */}
          <div className="bg-[#343a40] text-white p-2 flex items-center gap-2 border-b border-gray-600 rounded-t-[3px]">
             <div className="flex-1 flex bg-[#a6cdec] rounded-[3px] px-2 py-1.5 border border-blue-300 items-center">
               <input 
                 ref={inputRef}
                 type="text" 
                 placeholder={`Enter ${searchMode}`} 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 onKeyDown={handleKeyDown}
                 className="w-full bg-transparent border-none outline-none text-[13px] text-gray-800 font-bold placeholder-gray-500"
               />
             </div>
             <div className="bg-[#117a8b] text-white px-2 py-1.5 rounded-[3px] flex items-center gap-1 text-[12px] font-bold">
                <Filter className="w-3.5 h-3.5" /> {searchMode}
             </div>
          </div>

          {/* Product List */}
          <div className="overflow-y-auto flex-1 custom-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-sm text-gray-500 font-medium">No products found</span>
                {searchTerm.trim() && (
                  <button 
                    onClick={() => {
                      onEdit({ name: searchTerm });
                      setIsOpen(false);
                    }}
                    className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[12px] font-bold transition-colors shadow-sm"
                  >
                    + Add "{searchTerm}"
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map((p, index) => {
                const isHighlighted = index === highlightedIndex;
                return (
                  <div 
                    key={p.id} 
                    ref={el => itemRefs.current[index] = el}
                    className={`flex items-center justify-between p-2 border-b transition-colors cursor-pointer ${
                      isHighlighted 
                        ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10' 
                        : (index % 2 === 0 ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100')
                    } hover:bg-indigo-50/50`}
                    onClick={() => handleSelect(p.id)}
                  >
                    <div className="flex-1 flex flex-col min-w-0 pr-4">
                      <span className="text-[13px] font-bold text-gray-800 truncate">{p.name}</span>
                      {(() => {
                        if (!settings?.manageVariants) return null;
                        let subItemsList = [];
                        if (p.subItems) {
                          try {
                            subItemsList = typeof p.subItems === 'string' ? JSON.parse(p.subItems) : p.subItems;
                          } catch (e) {}
                        }
                        if (Array.isArray(subItemsList) && subItemsList.length > 0) {
                          const isExpanded = expandedProductId === p.id;
                          return (
                            <div className="flex flex-col mt-1" onClick={e => e.stopPropagation()}>
                              <button 
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setExpandedProductId(isExpanded ? null : p.id);
                                }}
                                className="w-max text-[10px] bg-indigo-600 text-white hover:bg-indigo-700 px-2 py-0.5 rounded font-bold shadow-sm flex items-center gap-1 transition-colors"
                              >
                                {isExpanded ? <ChevronDown className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                                {subItemsList.length} Variant{subItemsList.length > 1 ? 's' : ''}
                              </button>
                              
                              {isExpanded && (
                                <div className="mt-2 flex flex-col gap-1 border border-indigo-100 rounded bg-indigo-50/50 p-1">
                                  {subItemsList.map((v, vIdx) => (
                                    <div 
                                      key={vIdx} 
                                      onClick={() => handleSelect(p.id, v)}
                                      className="flex justify-between items-center bg-white p-1.5 border border-gray-200 rounded cursor-pointer hover:bg-indigo-100 hover:border-indigo-300 transition-colors"
                                    >
                                      <span className="text-[11px] font-bold text-gray-800">
                                        {[v.name, v.size ? `Size: ${v.size}` : '', v.color ? `Color: ${v.color}` : ''].filter(Boolean).join(' - ')}
                                      </span>
                                      {v.price > 0 && <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">₹{Number(v.price).toFixed(2)}</span>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        } else if (p.size || p.colour || p.colorVariant) {
                          return (
                            <div className="flex items-center gap-2 mt-0.5">
                              {p.size && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">Size: {p.size}</span>}
                              {(p.colour || p.colorVariant) && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Color: {p.colour || p.colorVariant}</span>}
                            </div>
                          );
                        }
                        return null;
                      })()}
                      {p.description && (
                        <span className="text-[11px] text-gray-500 truncate mt-0.5 pr-2 block" title={p.description}>
                          {p.description}
                        </span>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-[11px] font-bold">
                         <span className="text-red-500">MRP : {Number(p.mrp || 0).toFixed(2)}</span>
                         <span className="text-green-600">PRICE : {Number(p.price || 0).toFixed(2)}</span>
                         {showPurchasePrice && (
                           <span className="text-blue-500">P-PRICE : {Number(p.purchasePrice || 0).toFixed(2)}</span>
                         )}
                         {(p.wholesalePrice > 0) && (
                           <span className="text-gray-500">W-PRICE : {Number(p.wholesalePrice || 0).toFixed(2)}</span>
                         )}
                      </div>
                      {/* Conversion Badge */}
                      {(p.baseUnit && p.salesUnit && p.baseUnit !== p.salesUnit) && (
                        <div className="mt-1.5 flex items-center gap-2 bg-[#e2e8f0] px-2.5 py-1 rounded-full border border-gray-300 w-max shadow-sm">
                          <Package className="w-3.5 h-3.5 text-gray-600" />
                          <span className="text-[11px] text-gray-800">
                            <strong className="font-black">{p.stock || 0}</strong> {p.baseUnit}
                          </span>
                          <span className="text-gray-500 font-bold text-[11px]">/</span>
                          <span className="text-[11px] text-gray-800">
                            <strong className="font-black">{p.secOpeningQty || 0}</strong> {p.salesUnit}
                          </span>
                          <span className="text-[10px] text-gray-500 italic ml-1 font-bold">
                            (1 {p.baseUnit.toLowerCase()} = {p.conversionRate || 10} {p.salesUnit.toLowerCase()})
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {/* Stock Badge */}
                      <div className="bg-[#0d6efd] text-white text-[11px] font-bold px-2 py-1 rounded-[3px] min-w-[50px] text-center shadow-sm">
                        {p.stock || 0} pcs
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(p); setIsOpen(false); }}
                          className="text-[#4F46E5] hover:text-[#4338ca] bg-[#e0f7fa] p-1 rounded-sm transition-colors"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(p.id); }}
                          className="text-[#dc3545] hover:text-[#c82333] bg-[#fce4e4] p-1 rounded-sm transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal 
        isOpen={isScannerOpen} 
        onClose={() => setIsScannerOpen(false)}
        onScan={(scannedText) => {
           setSearchTerm(scannedText);
           setIsOpen(true);
        }}
      />
    </div>
  );
}
