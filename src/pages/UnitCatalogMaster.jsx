import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  GitMerge,
  Copy,
  Plus,
  Printer,
  RefreshCw,
  FileDown,
  Filter
} from 'lucide-react';
import { cn } from '../utils';
import { UnitCatalogMasterModal } from '../components/UnitCatalogMasterModal';
import { UnitConversionModal } from '../components/UnitConversionModal';

export function UnitCatalogMaster() {
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConvModalOpen, setIsConvModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [rows, setRows] = useState([]);
  
  const [searchFilter, setSearchFilter] = useState('Product Name');
  const [searchQuery, setSearchQuery] = useState('');

  const handleExport = () => {
    if (rows.length === 0) {
      const headers = ['#', 'Unit Name', 'GST UQC', 'Unit Value', 'Compare To'];
      const csvRows = [headers.join(',')];
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'unit_catalog_master.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    const headers = ['#', 'Unit Name', 'GST UQC', 'Unit Value', 'Compare To'];
    const csvRows = [headers.join(',')];
    
    rows.forEach((row, index) => {
      const csvRow = [
        index + 1,
        `"${row.unitName || ''}"`,
        `"${row.gstUqc || ''}"`,
        `"${row.unitValue || ''}"`,
        `"${row.compareTo || ''}"`
      ];
      csvRows.push(csvRow.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'unit_catalog_master.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col p-3">
      <div className="bg-white rounded shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-white text-[16px] font-medium tracking-wide">Stock Details</h2>
          
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setMergeModalOpen(true)}
              className="flex items-center gap-1.5 bg-white text-gray-800 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm"
            >
              <GitMerge className="w-4 h-4" />
              Merge
            </button>
            <button 
              onClick={() => setIsConvModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#4F46E5] hover:bg-[#4338ca] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm border border-[#4338ca]"
            >
              <RefreshCw className="w-4 h-4" />
              Unit Conversion
            </button>
            <button className="flex items-center gap-1.5 bg-[#343a40] hover:bg-[#23272b] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm">
              <SearchIcon className="w-4 h-4" />
              Find Duplicates
            </button>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1 bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
              Add
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button 
              onClick={() => {
                try {
                  sessionStorage.clear();
                } catch (e) {}
                window.location.reload(true);
              }}
              className="flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-800 px-3 py-1.5 rounded-[3px] text-[13px] font-medium transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
              Sync
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-[#ffc107] hover:bg-[#e0a800] text-gray-900 px-3 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
            >
              <ExcelIcon className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-[#dc3545] hover:bg-[#c82333] text-white p-1 rounded-[3px] transition-colors shadow-sm"
            >
              <X className="w-5 h-5 font-bold" strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-3 bg-white border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
             <div className="flex flex-wrap sm:flex-nowrap items-center flex-1 w-full">
               <div className="flex items-center bg-white min-w-0 border border-gray-300 border-r-0 rounded-l-[3px] px-2 py-1.5 text-blue-500">
                 <FilterIcon className="w-4 h-4" />
               </div>
               <select 
                 value={searchFilter}
                 onChange={(e) => setSearchFilter(e.target.value)}
                 className="min-w-[150px] border border-gray-300 px-2 py-1.5 text-[13px] outline-none bg-white text-gray-600 cursor-pointer"
               >
                 <option value="Product Name">Product Name</option>
                 <option value="Product Code">Product Code</option>
                 <option value="Barcode">Barcode</option>
                 <option value="Company">Company</option>
                 <option value="Category">Category</option>
                 <option value="Product Type">Product Type</option>
                 <option value="Gst Applicable">Gst Applicable</option>
                 <option value="GST">GST</option>
                 <option value="Product Commision">Product Commision</option>
                 <option value="HSN/SAC">HSN/SAC</option>
               </select>
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder={`Search for ${searchFilter}`} 
                 className="flex-1 min-w-0 border border-gray-300 border-l-0 rounded-r-[3px] px-3 py-1.5 text-[13px] outline-none bg-white text-gray-600"
               />
             </div>
             
             <div className="w-full sm:w-auto">
               <select className="w-full sm:w-auto min-w-0 border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none bg-white text-gray-600 w-full">
                 <option>Show All</option>
               </select>
             </div>
          </div>
        </div>

        {/* Data Totals Header */}
        <div className="bg-[#343a40] text-white flex flex-col sm:grid sm:grid-cols-3 text-center border-b border-gray-600 py-2.5">
           <div className="font-bold text-[13px]">
             TOTAL : 0
           </div>
           <div className="font-bold text-[13px]">
             TAXABLE TOTAL : 0
           </div>
           <div className="font-bold text-[13px]">
             GRAND TOTAL : 0
           </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white">
          {/* Empty space for future data table */}
        </div>

      </div>

      {/* Merge Modal */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setMergeModalOpen(false)}>
          <div 
            className="bg-white rounded-[4px] shadow-2xl flex flex-col w-[min(92vw,500px)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
              <h3 className="text-white font-medium text-[15px]">Item Correction</h3>
              <button onClick={() => setMergeModalOpen(false)} className="text-white hover:text-red-200 transition-colors">
                <X className="w-6 h-6 font-bold text-[#dc3545]" strokeWidth={3} />
              </button>
            </div>
            
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-800">Incorrect Product Name</label>
                <select className="border border-[#4F46E5] bg-[#e8e5ff] rounded-[4px] px-3 py-2 text-[14px] text-gray-800 focus:outline-none shadow-[0_0_0_0.2rem_rgba(79,70,229,0.25)] w-full font-bold">
                  <option value="">Select Name</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-bold text-gray-800">Correct Product Name</label>
                <select className="min-w-0 border border-gray-300 rounded-[4px] px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:border-[#4F46E5] w-full">
                  <option value="">Select Name</option>
                </select>
              </div>
            </div>
            
            <div className="bg-[#f8f9fa] px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button 
                onClick={() => setMergeModalOpen(false)}
                className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[4px] text-[14px] font-bold transition-colors shadow-sm"
              >
                Merge
              </button>
              <button onClick={() => setMergeModalOpen(false)} className="bg-[#dc3545] hover:bg-[#c82333] text-white px-4 py-1.5 rounded-[4px] text-[14px] transition-colors shadow-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <UnitCatalogMasterModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      <UnitConversionModal 
        isOpen={isConvModalOpen} 
        onClose={() => setIsConvModalOpen(false)} 
      />
    </div>
  );
}

const FilterIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const SearchIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ExcelIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="9" y1="13" x2="15" y2="19"></line>
    <line x1="15" y1="13" x2="9" y2="19"></line>
  </svg>
);
