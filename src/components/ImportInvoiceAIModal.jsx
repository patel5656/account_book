import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle } from 'lucide-react';

export function ImportInvoiceAIModal({ isOpen, onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[4px] shadow-2xl w-full sm:max-w-[500px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-[#4F46E5] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-white" strokeWidth={2.5} />
            <h2 className="text-[16px] text-white font-medium tracking-wide">Import Invoice (AI)</h2>
          </div>
          <button 
            onClick={handleClose}
            className="text-white hover:text-red-200 transition-colors flex items-center justify-center"
          >
            <X className="w-5 h-5 font-bold" strokeWidth={3} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-4 bg-gray-50">
          
          <div className="flex flex-col text-center">
            <h3 className="text-[15px] font-bold text-gray-800">Upload Invoice Document</h3>
            <p className="text-[13px] text-gray-500 mt-1">Our AI will automatically extract items, quantities, and prices.</p>
          </div>

          <div 
            className={`border-2 border-dashed rounded-lg transition-colors p-8 flex flex-col items-center justify-center cursor-pointer group ${selectedFile ? 'border-green-500 bg-green-50' : 'border-[#4F46E5]/40 bg-[#4F46E5]/5 hover:bg-[#4F46E5]/10'}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                setSelectedFile(e.dataTransfer.files[0]);
              }
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
            />
            {selectedFile ? (
              <>
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-[14px] font-bold text-green-600 text-center">{selectedFile.name}</span>
                <span className="text-[12px] text-gray-500 mt-1">Click to change file</span>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-6 h-6 text-[#4F46E5]" />
                </div>
                <span className="text-[14px] font-bold text-[#4F46E5]">Click to browse or drag and drop</span>
                <span className="text-[12px] text-gray-500 mt-1">Supported formats: PDF, JPG, PNG (Max 5MB)</span>
              </>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 sm:px-5 flex justify-end gap-2">
          <button 
            onClick={handleClose}
            className="bg-[#6c757d] hover:bg-[#5a6268] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (!selectedFile) {
                alert("Please select a file to upload first.");
                return;
              }
              alert("AI Processing started for: " + selectedFile.name);
              handleClose();
            }}
            className="flex items-center gap-1.5 bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-bold transition-colors shadow-sm"
          >
            <UploadCloud className="w-4 h-4" strokeWidth={3} />
            Process with AI
          </button>
        </div>

      </div>
    </div>
  );
}
