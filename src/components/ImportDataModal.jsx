import React, { useState, useRef } from 'react';
import { X, FileDown, FileUp, Loader2 } from 'lucide-react';
import apiClient from '../api/apiClient';

export function ImportDataModal({ isOpen, onClose }) {
  const [importFrom, setImportFrom] = useState('General Import');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLicenced, setIsLicenced] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const getButtonText = () => {
    if (isLoading) return 'Importing...';
    switch (importFrom) {
      case 'Tally': return 'Import from Tally';
      case 'Vyapar': return 'Import from Vyapar';
      case 'General Import': return 'Import Data';
      case 'Excel (.xlsx)': default: return 'Import from Excel';
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validation for General Import and Excel Import
      if (importFrom === 'General Import') {
        if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
          alert("Invalid file type. Please upload a .csv file.");
          e.target.value = null;
          return;
        }
      } else if (importFrom === 'Excel (.xlsx)') {
        const fileExt = file.name.split('.').pop().toLowerCase();
        if (fileExt !== 'xlsx' && fileExt !== 'xls') {
          alert("Invalid file type. Please upload an Excel (.xlsx or .xls) file.");
          e.target.value = null;
          return;
        }
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("File is too large. Maximum allowed size is 5MB.");
        e.target.value = null;
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleCheckboxChange = (type) => {
    setSelectedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleImport = async () => {
    if (!selectedFile) {
      alert("Please browse and select a file first.");
      return;
    }

    if (importFrom === 'General Import' || importFrom === 'Excel (.xlsx)') {
      if (selectedTypes.length === 0) {
        alert("Please select at least one import sequence (e.g., Master).");
        return;
      }
 
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('selectedTypes', JSON.stringify(selectedTypes));
 
      try {
        const response = await apiClient.post('/import/general', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
 
        if (response.data.success) {
          alert(`Successfully imported ${response.data.importedCount} records.`);
          handleClose();
        } else {
          alert(response.data.message || 'Import failed.');
        }
      } catch (error) {
        console.error('Import error:', error);
        alert(error.response?.data?.message || 'Error occurred during import.');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Dummy behavior for other imports
      alert(`Successfully imported data from ${selectedFile.name}`);
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setSelectedTypes([]);
    setIsLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/40">
      <div className="bg-white rounded-[3px] shadow-xl w-full sm:max-w-[500px] md:max-w-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#007bff] pl-4 pr-0 flex items-center justify-between h-[45px]">
          <h2 className="text-[15px] sm:text-[16px] text-white font-medium">Import Data</h2>
          <button 
            onClick={handleClose}
            disabled={isLoading}
            className="text-white h-full px-3.5 hover:bg-[#0069d9] disabled:opacity-50 transition-colors flex items-center justify-center"
          >
            <X className="w-[18px] h-[18px]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 md:p-6 flex-1 bg-white max-h-[80vh] overflow-y-auto">
          
          <div className="mb-6">
            <label className="block text-[14px] sm:text-[15px] font-bold text-gray-800 mb-2">Import From :</label>
            <select 
              value={importFrom}
              onChange={(e) => setImportFrom(e.target.value)}
              disabled={isLoading}
              className="w-full border border-gray-300 rounded-[3px] px-3 py-[7px] text-[14px] text-gray-700 outline-none focus:border-[#007bff] focus:ring-[3px] focus:ring-[#007bff]/20 transition-all cursor-pointer disabled:bg-gray-100"
            >
              <option value="General Import">General Import</option>
              <option value="Tally">Tally</option>
              <option value="Vyapar">Vyapar</option>
              <option value="Excel (.xlsx)">Excel (.xlsx)</option>
            </select>
          </div>

          {importFrom !== 'Tally' && (
            <div className="flex flex-col sm:flex-row border border-gray-300 rounded-[3px] overflow-hidden mb-2">
              <div className="flex-1 px-3 py-[7px] text-[14px] text-gray-500 bg-white sm:border-r border-b sm:border-b-0 border-gray-300 flex items-center truncate">
                {selectedFile ? selectedFile.name : `Select Import File (File Type : ${importFrom === 'Excel (.xlsx)' ? 'Excel' : 'CSV'})`}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept={importFrom === 'General Import' ? '.csv' : '.csv,.xlsx,.xls'}
                disabled={isLoading}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="bg-[#e9ecef] px-4 py-[9px] sm:py-[7px] text-[14px] font-medium text-gray-700 hover:bg-[#dde2e6] transition-colors cursor-pointer disabled:opacity-50"
              >
                Browse
              </button>
            </div>
          )}

          {importFrom === 'Tally' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[14px] font-bold text-gray-800">Select Company :</label>
                  <div className="flex items-center gap-2 text-[13px] text-gray-700">
                    <span className="font-semibold">Trial</span>
                    <button
                      type="button"
                      onClick={() => setIsLicenced(!isLicenced)}
                      className={`w-8 h-[18px] rounded-full flex items-center px-[2px] cursor-pointer transition-colors duration-200 ease-in-out ${isLicenced ? 'bg-[#17a2b8]' : 'bg-gray-300'}`}
                    >
                      <div className={`w-[14px] h-[14px] rounded-full transition-transform duration-200 ease-in-out ${isLicenced ? 'bg-[#0c5460] translate-x-[14px]' : 'bg-gray-500 translate-x-0'}`}></div>
                    </button>
                    <span className="font-semibold">Licenced</span>
                  </div>
                </div>
                <select className="w-full border border-gray-300 rounded-[3px] px-3 py-[7px] text-[14px] text-gray-700 outline-none focus:border-[#007bff] focus:ring-[3px] focus:ring-[#007bff]/20 transition-all cursor-pointer">
                  <option></option>
                </select>
              </div>

              <div>
                <p className="text-[14px] text-gray-700 mb-3">Note : Please Select one of the Following.</p>
                <label className="block text-[14px] font-bold text-gray-800 mb-2">Import Type :</label>
                <select className="w-full border border-gray-300 rounded-[3px] px-3 py-[7px] text-[14px] text-gray-700 outline-none focus:border-[#007bff] focus:ring-[3px] focus:ring-[#007bff]/20 transition-all cursor-pointer">
                  <option>Master</option>
                  <option>Product Master</option>
                  <option>Daybook</option>
                </select>
              </div>

              <div>
                <label className="block text-[14px] font-bold text-gray-800 mb-2">Max Records per Import :</label>
                <select className="w-full border border-gray-300 rounded-[3px] px-3 py-[7px] text-[14px] text-gray-700 outline-none focus:border-[#007bff] focus:ring-[3px] focus:ring-[#007bff]/20 transition-all cursor-pointer">
                  <option>1</option>
                  <option>10</option>
                  <option>50</option>
                  <option>100</option>
                </select>
              </div>
            </div>
          )}

          {(importFrom === 'General Import' || importFrom === 'Excel (.xlsx)') && (
            <div className="mt-4">
              <p className="text-[13px] sm:text-[14px] text-gray-700 mb-3">Note : Please Import the File In this Sequence only</p>
              <div className="space-y-3">
                {['Master', 'Product Master', 'Vouchers', 'Vouchers Details', 'Transactions'].map((label) => (
                  <label key={label} className="flex items-center gap-2.5 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedTypes.includes(label)}
                      onChange={() => handleCheckboxChange(label)}
                      disabled={isLoading}
                      className="w-4 h-4 sm:w-[18px] sm:h-[18px] border-gray-300 rounded-[2px] text-blue-600 focus:ring-0 cursor-pointer disabled:opacity-50" 
                    />
                    <span className="text-[14px] sm:text-[15px] font-bold text-gray-800">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`bg-[#f8f9fa] border-t border-gray-200 px-4 py-3 sm:px-5 ${importFrom === 'Tally' ? 'flex flex-col sm:flex-row justify-between items-center gap-3' : ''}`}>
          <button 
            onClick={handleImport}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 text-white px-4 py-2 sm:px-3 sm:py-1.5 rounded-[3px] text-[14px] sm:text-[15px] font-medium transition-all shadow-sm focus:ring-[3px] outline-none disabled:opacity-70 disabled:cursor-not-allowed ${
              importFrom === 'Tally' ? 'bg-[#17a2b8] hover:bg-[#138496] focus:ring-[#17a2b8]/50 w-full sm:w-auto' : 'bg-[#007bff] hover:bg-[#0069d9] focus:ring-[#007bff]/50 w-full sm:w-auto'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-[16px] h-[16px] animate-spin" strokeWidth={2.5} />
            ) : (
              <FileDown className="w-[16px] h-[16px]" strokeWidth={2.5} />
            )}
            {getButtonText()}
          </button>

          {importFrom === 'Tally' && (
            <button 
              disabled={isLoading}
              className="flex items-center justify-center gap-2 bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 sm:px-3 sm:py-1.5 rounded-[3px] text-[14px] sm:text-[15px] font-medium transition-all shadow-sm focus:ring-[3px] focus:ring-[#28a745]/50 outline-none w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <FileUp className="w-[16px] h-[16px]" strokeWidth={2.5} />
              Export to Tally
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
