import React, { useState, useEffect } from 'react';
import { cn } from '../utils';
import apiClient from '../api/apiClient';

export function NotificationPermission() {
  const [isPaymentReminderEnabled, setIsPaymentReminderEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await apiClient.get('/settings');
      if (res.data.success) {
        setIsPaymentReminderEnabled(res.data.data.paymentReminderEnabled || false);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await apiClient.put('/settings', {
        paymentReminderEnabled: isPaymentReminderEnabled
      });
      if (res.data.success) {
        alert('Notification settings saved successfully!');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings.');
    }
  };

  return (
    <div className="bg-[#f4f6f9] min-h-[calc(100vh-60px)] flex flex-col p-4">
      {/* Main Container */}
      <div className="bg-white rounded-[3px] shadow-sm flex flex-col overflow-hidden border border-gray-200">
        
        {/* Title Bar */}
        <div className="bg-[#4F46E5] px-4 py-[8px] text-white">
          <h2 className="text-[14px] font-medium tracking-wide">Notification Permission</h2>
        </div>

        {/* Content Area */}
        <div className="flex flex-col">
          {/* Header Row */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-[#f8f9fa]">
            <span className="text-[13px] font-bold text-gray-800">Notification Name</span>
            <span className="text-[13px] font-bold text-gray-800 mr-8">Enable/Disable</span>
          </div>

          {/* Item Row */}
          <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 bg-white">
            <span className="text-[13px] text-gray-700">Payment Reminder</span>
            <div className="mr-14">
              <div 
                onClick={() => setIsPaymentReminderEnabled(!isPaymentReminderEnabled)}
                className={cn(
                  "w-10 h-5 rounded-full relative cursor-pointer transition-colors duration-200 border",
                  isPaymentReminderEnabled ? "bg-[#007bff] border-[#007bff]" : "bg-[#6c757d] border-[#6c757d]"
                )}
              >
                <div className={cn(
                  "w-[14px] h-[14px] bg-white rounded-full absolute top-[2px] shadow-sm transition-all duration-200",
                  isPaymentReminderEnabled ? "right-[3px]" : "left-[3px]"
                )}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Container */}
      <div className="flex justify-center mt-6">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-[#24529b] hover:bg-[#1e4482] text-white px-5 py-[6px] rounded-[3px] text-[13px] font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
