import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { syncGoogleTranslate } from '../utils/language';
import { SuperadminSidebar } from '../components/SuperadminSidebar';
import { SuperadminNavbar } from '../components/SuperadminNavbar';

export function SuperadminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLang = localStorage.getItem('app_lang') || 'en';
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
    syncGoogleTranslate(savedLang);
  }, [i18n]);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <SuperadminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-[35] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-0 md:ml-[220px]' : 'ml-0'}`}>
        <SuperadminNavbar toggleSidebar={toggleSidebar} isOpen={sidebarOpen} />
        
        <main className="flex-1 pt-[45px] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
