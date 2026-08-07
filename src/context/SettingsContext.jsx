import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const SUPPORTED_CURRENCIES = {
  INR: { code: 'INR', locale: 'en-IN', symbol: '₹' },
  USD: { code: 'USD', locale: 'en-US', symbol: '$' },
  EUR: { code: 'EUR', locale: 'de-DE', symbol: '€' },
  GBP: { code: 'GBP', locale: 'en-GB', symbol: '£' }
};

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('sidebar_settings_v3');
    let parsed = {};
    if (saved) {
      try {
        parsed = JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      showCustomerChallan: true,
      showCustomerInvoice: false,
      showPurchaseOrder: true,
      showSalesOrder: false,
      showSKU: false,
      showVariantsImei: true,
      currency: 'INR',
      showOffers: false,
      showLoyaltyPoints: false,
      ...parsed
    };
  });

  useEffect(() => {
    // Sync initial settings from backend if user is logged in
    const token = localStorage.getItem('token');
    if (!token) return;

    apiClient.get('/settings')
      .then(res => {
        if (res.data.success && res.data.data) {
          setSettings(prev => ({ ...prev, ...res.data.data }));
        }
      })
      .catch(err => console.error("Failed to load settings from server:", err));
  }, []);

  const toggleSetting = async (key) => {
    const newValue = !settings[key];
    const newSettings = { ...settings, [key]: newValue };
    setSettings(newSettings);
    localStorage.setItem('sidebar_settings_v3', JSON.stringify(newSettings));
    
    // Sync to backend
    try {
      await apiClient.put('/settings', { [key]: newValue });
    } catch (error) {
      console.error("Failed to sync setting:", error);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('sidebar_settings_v3', JSON.stringify(newSettings));
    
    // Sync to backend
    try {
      await apiClient.put('/settings', { [key]: value });
    } catch (error) {
      console.error("Failed to sync setting:", error);
    }
  };

  const formatAmount = (amount) => {
    const num = Number(amount) || 0;
    const current = SUPPORTED_CURRENCIES[settings.currency] || SUPPORTED_CURRENCIES.INR;
    return new Intl.NumberFormat(current.locale, {
      style: 'currency',
      currency: current.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const currentCurrency = SUPPORTED_CURRENCIES[settings.currency] || SUPPORTED_CURRENCIES.INR;

  return (
    <SettingsContext.Provider value={{ settings, toggleSetting, updateSetting, formatAmount, currentCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}

