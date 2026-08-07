import React from 'react';
import { useNavigate } from 'react-router-dom';

export function HardRefreshPage() {
  const navigate = useNavigate();

  const handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-60px)] flex items-center justify-center">
      <div className="bg-white rounded-[5px] shadow-lg flex flex-col items-center justify-center p-8 w-[450px]">
        {/* Warning Icon (SweetAlert2 style) */}
        <div className="w-20 h-20 border-[4px] border-[#f8bb86] rounded-full flex items-center justify-center mb-6">
          <span className="text-[#f8bb86] text-[60px] font-light leading-none mt-[-10px]">!</span>
        </div>

        {/* Title */}
        <h2 className="text-[#545454] text-[24px] font-semibold mb-4 text-center leading-tight">
          Are you sure to Reset Local Data?
        </h2>

        {/* Subtitle */}
        <p className="text-[#545454] text-[15px] mb-8 text-center font-light">
          You won't be able to revert this!
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleReset}
            className="bg-[#3085d6] hover:bg-[#2b77c0] text-white px-5 py-2.5 rounded-[4px] text-[15px] font-medium transition-colors border-none"
          >
            Yes, Reset it!
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="bg-[#d33] hover:bg-[#bd2d2d] text-white px-5 py-2.5 rounded-[4px] text-[15px] font-medium transition-colors border-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
