import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit, Trash2, Filter, ChevronDown, X, Phone, MapPin, DollarSign } from 'lucide-react';

export function SupplierSelectDropdown({ suppliers, value, onChange, onEdit, onDelete, searchMode = 'Company Name' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const [menuRect, setMenuRect] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isOutsideTrigger = dropdownRef.current && !dropdownRef.current.contains(event.target);
      const isOutsideMenu = !event.target.closest('.supplier-dropdown-menu');
      
      if (isOutsideTrigger && isOutsideMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    const handleScroll = (event) => {
      if (event.target && event.target.closest && event.target.closest('.supplier-dropdown-menu')) {
        return; 
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

  const selectedSupplier = suppliers.find(s => s.id === parseInt(value)) || null;

  const filteredSuppliers = suppliers.filter(s => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    switch (searchMode) {
      case 'Mobile No':
        return s.phone?.toLowerCase().includes(term) || s.mobile?.toLowerCase().includes(term);
      case 'City':
        return s.city?.toLowerCase().includes(term);
      case 'Company Name':
      default:
        return s.name?.toLowerCase().includes(term);
    }
  });

  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const itemRefs = useRef([]);

  useEffect(() => {
    setHighlightedIndex(filteredSuppliers.length > 0 ? 0 : -1);
  }, [searchTerm, suppliers]);

  useEffect(() => {
    itemRefs.current = itemRefs.current.slice(0, filteredSuppliers.length);
  }, [filteredSuppliers]);

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
        return next >= filteredSuppliers.length ? 0 : next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => {
        const next = prev - 1;
        return next < 0 ? filteredSuppliers.length - 1 : next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredSuppliers.length === 0 && searchTerm.trim()) {
        onEdit({ name: searchTerm, type: 'CUSTOMER', status: 'Active', balance: 0, partyType: 'company' });
        setIsOpen(false);
      } else if (highlightedIndex >= 0 && highlightedIndex < filteredSuppliers.length) {
        handleSelect(filteredSuppliers[highlightedIndex].id);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (supplierId) => {
    onChange(supplierId);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative w-full h-full flex items-center" ref={dropdownRef}>
      <div 
        className="flex-1 h-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none font-bold text-gray-800 bg-white flex items-center justify-between cursor-pointer hover:border-blue-400 min-w-0"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate flex-1 text-left">
          {selectedSupplier ? selectedSupplier.name : <span className="text-gray-400 font-normal">Select Supplier...</span>}
        </span>
        <div className="flex items-center gap-1 ml-1" onClick={(e) => e.stopPropagation()}>
          {selectedSupplier && (
            <span
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange("");
                setSearchTerm('');
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 cursor-pointer flex items-center justify-center rounded hover:bg-gray-100"
              title="Clear Supplier"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" onClick={() => setIsOpen(!isOpen)} />
        </div>
      </div>
      
      {isOpen && menuRect && createPortal(
        <div 
          className="supplier-dropdown-menu bg-white border border-gray-300 shadow-2xl rounded-[3px] z-[9999] flex flex-col max-h-[200px]"
          style={{
            position: 'fixed',
            top: `${menuRect.bottom + 2}px`,
            left: `${menuRect.left}px`,
            width: '450px',
            maxWidth: '90vw'
          }}
        >
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

          <div className="overflow-y-scroll flex-1 pos-product-scroll">
            {filteredSuppliers.length === 0 ? (
              <div className="p-4 text-center flex flex-col items-center justify-center gap-2">
                <span className="text-sm text-gray-500 font-medium">No suppliers found</span>
                {searchTerm.trim() && (
                  <button 
                    onClick={() => {
                      onEdit({ name: searchTerm, type: 'CUSTOMER', status: 'Active', balance: 0, partyType: 'company' });
                      setIsOpen(false);
                    }}
                    className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[12px] font-bold transition-colors shadow-sm"
                  >
                    + Add "{searchTerm}"
                  </button>
                )}
              </div>
            ) : (
              filteredSuppliers.map((s, index) => {
                const isHighlighted = index === highlightedIndex;
                const dueAmount = s.dueAmount || s.balance || 0;
                return (
                  <div 
                    key={s.id} 
                    ref={el => itemRefs.current[index] = el}
                    className={`flex items-center justify-between p-2 border-b transition-colors cursor-pointer ${
                      isHighlighted 
                        ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-500/10' 
                        : (index % 2 === 0 ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-100')
                    } hover:bg-indigo-50/50`}
                    onClick={() => handleSelect(s.id)}
                  >
                    <div className="flex-1 flex flex-col min-w-0 pr-4">
                      <span className="text-[13px] font-bold text-gray-800 truncate">{s.name}</span>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-[11px]">
                         {(s.phone || s.mobile) && (
                           <span className="text-gray-600 flex items-center gap-0.5">
                             <Phone className="w-3 h-3" /> {s.phone || s.mobile}
                           </span>
                         )}
                         {s.city && (
                           <span className="text-gray-600 flex items-center gap-0.5">
                             <MapPin className="w-3 h-3" /> {s.city}
                           </span>
                         )}
                         <span className="text-[#dc3545] font-bold flex items-center gap-0.5">
                           Due: ₹{Number(dueAmount).toFixed(2)}
                         </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(s); setIsOpen(false); }}
                        className="text-[#4F46E5] hover:text-[#4338ca] bg-[#e0f7fa] p-1 rounded-sm transition-colors"
                        title="Edit Supplier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(s.id); }}
                        className="text-[#dc3545] hover:text-[#c82333] bg-[#fce4e4] p-1 rounded-sm transition-colors"
                        title="Delete Supplier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
