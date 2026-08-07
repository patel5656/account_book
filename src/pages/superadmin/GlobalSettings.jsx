import React, { useState } from 'react';
import { Settings, Shield, BellRing, Database, CreditCard } from 'lucide-react';

export function GlobalSettings() {
  const [activeTab, setActiveTab] = useState('general');
  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Global Settings</h1>
        <p className="text-gray-500 mt-1">Master configurations and system-wide controls</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Settings Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-2 pt-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 ${activeTab === 'general' ? 'border-[#4F46E5] text-[#4F46E5]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            General Settings
          </button>
          <button 
            onClick={() => setActiveTab('payment')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 ${activeTab === 'payment' ? 'border-[#4F46E5] text-[#4F46E5]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Payment Gateway
          </button>
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-8">
          {activeTab === 'general' ? (
            <>
              <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-gray-400" />
              Security Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (Minutes)</label>
                <input type="number" defaultValue={60} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Login Attempts</label>
                <input type="number" defaultValue={5} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <input type="checkbox" id="2fa" defaultChecked className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
              <label htmlFor="2fa" className="text-sm text-gray-700">Force Two-Factor Authentication (2FA) for all Superadmins</label>
            </div>
          </div>

          <hr className="border-gray-200" />

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BellRing className="w-5 h-5 mr-2 text-gray-400" />
              System Alerts
            </h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive emails for new company registrations</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4F46E5]"></div>
              </label>
            </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-gray-400" />
                  Payment Integration
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Key ID</label>
                    <input type="text" placeholder="rzp_test_..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay Key Secret</label>
                    <input type="password" placeholder="••••••••••••••••" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <input type="checkbox" id="test-mode" defaultChecked className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                  <label htmlFor="test-mode" className="text-sm text-gray-700">Enable Test Mode for Payments</label>
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end pt-4">
            <button className="bg-[#4F46E5] text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
