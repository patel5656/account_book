import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Landmark, 
  ArrowRightLeft, 
  FileSpreadsheet, 
  Wand2, 
  CloudUpload, 
  Save 
} from 'lucide-react';
import apiClient from '../api/apiClient';

export function BankStatementImport() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [importType, setImportType] = useState('excel');
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };
  const [invertColumns, setInvertColumns] = useState(false);
  const [matchNarration, setMatchNarration] = useState(false);

  // Integration States
  const [banks, setBanks] = useState([]);
  const [selectedBank, setSelectedBank] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchBanks();
  }, []);

  const fetchBanks = async () => {
    try {
      const res = await apiClient.get('/banks');
      setBanks(res.data?.data || res.data?.banks || (Array.isArray(res.data) ? res.data : []));
    } catch (error) {
      console.error('Error fetching banks:', error);
    }
  };

  const handleUpload = async () => {
    if (!selectedBank) return alert('Please select a bank book first.');
    if (!selectedFile) return alert('Please choose a statement file.');

    const formData = new FormData();
    formData.append('statementFile', selectedFile);
    formData.append('bankName', banks.find(b => b.id.toString() === selectedBank)?.name || '');
    formData.append('accountNumber', banks.find(b => b.id.toString() === selectedBank)?.accountNo || '');
    
    setIsUploading(true);
    try {
      await apiClient.post('/bank-statements', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Bank statement imported successfully!');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error importing statement:', error);
      alert('Failed to import bank statement.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-45px)] flex flex-col relative">
      <div className="bg-white m-3 mt-0 shadow-sm border border-gray-200 flex-1 flex flex-col">
        
        {/* Top Header */}
        <div className="bg-[#4F46E5] flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <h2 className="text-white font-bold text-[16px]">Bank Statement Import</h2>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#dc3545] p-1.5 rounded-sm shadow-sm hover:bg-[#c82333] transition-colors"
          >
            <X className="w-4 h-4 text-white font-bold" strokeWidth={3} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 flex flex-col gap-4 overflow-y-auto">
          
          {/* Progress Steps */}
          <div className="flex items-center gap-6 pb-2 text-[13px] font-bold">
            <div className="flex items-center gap-2 text-[#4F46E5]">
              <div className="w-5 h-5 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[11px]">1</div>
              Setup
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-4">
            
            {/* Left Column */}
            <div className="flex flex-col gap-4">
              
              {/* Bank Book Section */}
              <div className="border border-gray-200 rounded-[4px] bg-white">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 font-bold text-[#4F46E5] text-[14px]">
                  <Landmark className="w-4 h-4" />
                  Bank book
                </div>
                <div className="p-4">
                  <label className="block text-[13px] font-bold text-gray-800 mb-1.5">Bank book <span className="text-red-500">*</span></label>
                  <select 
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full max-w-[400px] border border-gray-300 rounded-[3px] px-3 py-2 text-[13px] outline-none focus:border-[#4F46E5] bg-white text-gray-700"
                  >
                    <option value="">Select cash / bank account</option>
                    {banks.map(b => (
                      <option key={b.id} value={b.id}>{b.name} - {b.accountNo}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Import Type Section */}
              <div className="border border-gray-200 rounded-[4px] bg-white">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 font-bold text-[#4F46E5] text-[14px]">
                  <ArrowRightLeft className="w-4 h-4" />
                  How do you want to import?
                </div>
                <div className="p-4">
                  <div className="flex border border-gray-300 rounded-[4px] overflow-hidden w-fit">
                    <button 
                      onClick={() => setImportType('excel')}
                      className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-colors ${importType === 'excel' ? 'bg-[#4F46E5] text-white border-r border-[#4F46E5]' : 'bg-white text-gray-600 border-r border-gray-300 hover:bg-gray-50'}`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel (XLS / XLSX)
                    </button>
                    <button 
                      onClick={() => setImportType('ai')}
                      className={`flex items-center gap-2 px-4 py-2 text-[13px] font-medium transition-colors ${importType === 'ai' ? 'bg-[#4F46E5] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Wand2 className="w-4 h-4" />
                      PDF / Image
                    </button>
                  </div>
                </div>
              </div>

              {/* Upload Section */}
              <div className="border border-gray-200 rounded-[4px] bg-white">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-gray-100 font-bold text-[#4F46E5] text-[14px]">
                  <CloudUpload className="w-4 h-4" />
                  Upload statement
                </div>
                <div className="p-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-[6px] bg-gray-50 flex flex-col items-center justify-center p-10 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept={importType === 'excel' ? ".xls,.xlsx,.csv" : ".pdf,.png,.jpg,.jpeg"}
                      onChange={handleFileChange}
                    />
                    <div className="bg-[#4F46E5] text-white p-2.5 rounded-[4px] mb-3">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                    {selectedFile ? (
                      <>
                        <h3 className="font-bold text-[15px] text-[#4F46E5] mb-1">{selectedFile.name}</h3>
                        <p className="text-gray-500 text-[13px]">Click to change file</p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-bold text-[15px] text-gray-800 mb-1">Choose a statement file...</h3>
                        <p className="text-gray-500 text-[13px]">Click to browse or drop a file here</p>
                      </>
                    )}
                  </div>
                  {selectedFile && (
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-2 rounded-[3px] text-[13px] font-medium transition-colors disabled:opacity-70"
                      >
                        {isUploading ? 'Importing...' : 'Upload & Import'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-4">
              
              {/* Quick Guide */}
              <div className="border border-gray-200 rounded-[4px] bg-white p-4">
                <h3 className="font-bold text-[14px] text-gray-800 mb-3">Quick guide</h3>
                <ol className="text-[12px] text-gray-600 space-y-3 list-decimal pl-4">
                  <li><span className="font-bold text-gray-800">Select bank book first</span> — presets and validation use it.</li>
                  <li>Upload Excel or use AI for PDF / images — AI opens provider & key settings.</li>
                  <li>Date range for duplicate check is taken automatically from your data.</li>
                  <li>Map columns, group by keyword, validate, then import.</li>
                  <li><span className="bg-[#343a40] text-white px-1.5 py-0.5 rounded text-[10px]">Enter</span> submit visible <span className="bg-[#343a40] text-white px-1.5 py-0.5 rounded text-[10px]">Ctrl+Enter</span> import all</li>
                </ol>
              </div>

              {/* Settings */}
              <div className="border border-gray-200 rounded-[4px] bg-white p-4 flex flex-col gap-4">
                
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setInvertColumns(!invertColumns)}>
                  <div className={`w-[36px] h-[18px] rounded-full relative transition-colors duration-200 border ${invertColumns ? 'bg-[#007bff] border-[#007bff]' : 'bg-gray-300 border-gray-400'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 shadow-sm ${invertColumns ? 'right-[2px]' : 'left-[2px]'}`}></div>
                  </div>
                  <label className="text-[13px] font-bold text-gray-800 cursor-pointer">Invert debit / credit columns</label>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-bold text-gray-800">Duplicate amount tolerance (₹)</label>
                  <input 
                    type="number" 
                    defaultValue="0"
                    className="w-full border border-gray-300 rounded-[3px] px-3 py-1.5 text-[13px] outline-none focus:border-[#4F46E5]"
                  />
                </div>

                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setMatchNarration(!matchNarration)}>
                  <div className={`w-[36px] h-[18px] rounded-full relative transition-colors duration-200 border ${matchNarration ? 'bg-[#007bff] border-[#007bff]' : 'bg-gray-300 border-gray-400'}`}>
                    <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-[1px] transition-all duration-200 shadow-sm ${matchNarration ? 'right-[2px]' : 'left-[2px]'}`}></div>
                  </div>
                  <label className="text-[13px] font-bold text-gray-800 cursor-pointer">Match narration in duplicate check</label>
                </div>

                <button className="mt-2 w-full flex items-center justify-center gap-2 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-[3px] text-[13px] font-medium transition-colors">
                  <Save className="w-4 h-4 text-gray-500" />
                  Save as default settings
                </button>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
