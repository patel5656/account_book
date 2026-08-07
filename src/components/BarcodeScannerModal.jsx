import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export function BarcodeScannerModal({ isOpen, onClose, onScan }) {
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!isOpen) return;
    
    // Configure scanner
    const config = { 
      fps: 10, 
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [0] // Camera scan only, no file upload for simpler UI
    };
    
    const scanner = new Html5QrcodeScanner("reader", config, false);
    
    const onScanSuccess = (decodedText, decodedResult) => {
      // Handle the scanned code
      onScan(decodedText);
      scanner.clear();
      onClose();
    };
    
    const onScanFailure = (error) => {
      // handle scan failure, usually better to ignore and keep scanning
    };
    
    scanner.render(onScanSuccess, onScanFailure);
    
    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [isOpen, onScan, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[999999] flex items-center justify-center p-4">
      <div className="bg-white rounded-[5px] w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        <div className="bg-[#343a40] p-3 text-white flex items-center justify-between">
          <h2 className="font-bold text-[14px]">Scan Barcode</h2>
          <button onClick={onClose} className="hover:bg-gray-700 p-1 rounded transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-4 flex flex-col items-center justify-center min-h-[300px]">
          {error && <div className="text-red-500 mb-2 text-sm font-bold">{error}</div>}
          <div id="reader" className="w-full"></div>
          <p className="text-[12px] text-gray-500 mt-4 text-center">
            Point your camera at a barcode to scan it automatically.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
