import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { syncGoogleTranslate } from '../utils/language';
import { motion, AnimatePresence } from 'framer-motion';
import apiClient from '../api/apiClient';
import {
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Database,
  Layers,
  FileText,
  Calculator,
  LayoutDashboard,
  BarChart3,
  ChevronDown,
  ArrowRight,
  Star,
  Menu,
  X,
  Building,
  Settings,
  Briefcase,
  Store,
  Truck,
  RotateCcw,
  Globe,
  Book,
  Clock,
  Mail,
  MapPin,
  Phone
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { i18n, t } = useTranslation();

  useEffect(() => {
    const savedLang = localStorage.getItem('website_lang') || 'en';
    if (i18n.language !== savedLang) {
      i18n.changeLanguage(savedLang);
    }
    syncGoogleTranslate(savedLang);
  }, [i18n]);

  const changeLanguage = (e) => {
    const lang = e.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('website_lang', lang);

    if (lang === 'en') {
      document.cookie = "googtrans=/en/en; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      document.cookie = `googtrans=/en/en; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    } else {
      document.cookie = `googtrans=/en/${lang}; path=/`;
      document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
    }

    const googleSelect = document.querySelector('.goog-te-combo');
    if (googleSelect) {
      googleSelect.value = lang;
      googleSelect.dispatchEvent(new Event('change'));
    } else {
      window.location.reload();
    }
  };

  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(1);
  const [contactForm, setContactForm] = useState({ name: '', email: '', business: '', message: '' });
  const [formSuccess, setFormSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormLoading(true);
    setTimeout(() => {
      setFormLoading(false);
      setFormSuccess(true);
      setContactForm({ name: '', email: '', business: '', message: '' });
    }, 1500);
  };

  const [counters, setCounters] = useState({
    companies: 4800,
    transactions: 250000,
    gstReports: 95000,
    users: 18000
  });

  const [dynamicPlans, setDynamicPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await apiClient.get('/public/plans');
        if (response.data.success) {
          setDynamicPlans(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dynamic plans', error);
      } finally {
        setLoadingPlans(false);
      }
    };
    fetchPlans();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounters(prev => ({
        companies: Math.min(prev.companies + Math.floor(Math.random() * 2), 5000),
        transactions: Math.min(prev.transactions + Math.floor(Math.random() * 15), 260000),
        gstReports: Math.min(prev.gstReports + Math.floor(Math.random() * 5), 98000),
        users: Math.min(prev.users + Math.floor(Math.random() * 3), 19000)
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    { title: "Inventory Management", desc: "Track stocks, batches, godowns & low stock warnings.", icon: Database, color: "from-blue-500 to-indigo-600" },
    { title: `${t('POS')} Billing`, desc: "Fast billing setup with barcode scanning & thermal prints.", icon: Zap, color: "from-amber-500 to-orange-600" },
    { title: "Bill Book", desc: "Maintain clean sales & purchase invoice history.", icon: FileText, color: "from-emerald-500 to-teal-600" },
    { title: "Accounts Management", desc: "Track double-entry ledgers & daily cash balance.", icon: Calculator, color: "from-purple-500 to-pink-600" },
    { title: "Account Summary", desc: "Unified overview of cash, bank, and overall balance.", icon: BarChart3, color: "from-cyan-500 to-blue-600" },
    { title: "Inventory Summary", desc: "View category, brand, and item-wise sales report.", icon: Layers, color: "from-violet-500 to-indigo-600" },
    { title: "Final Accounts", desc: "Auto-generate Trading & P&L accounts instantly.", icon: TrendingUp, color: "from-rose-500 to-red-600" },
    { title: "GST Reports", desc: "Ready GSTR-1, GSTR-2, and GSTR-3B filings.", icon: CheckCircle, color: "from-teal-500 to-emerald-600" },
    { title: "Audit Logs", desc: "Log user activities and track deleted entries.", icon: RotateCcw, color: "from-slate-600 to-slate-800" },
    { title: "Multi Language", desc: "Available in English, Hindi, and other regional languages.", icon: Globe, color: "from-sky-500 to-blue-600" },
    { title: "Day Book Summary", desc: "View daily transaction summaries including sales & expenses.", icon: Book, color: "from-indigo-500 to-purple-600" },
    { title: "Expiry Report", desc: "Track batch expirations and get alerts for stock items.", icon: Clock, color: "from-orange-500 to-rose-600" }
  ];



  const whyChooseUs = [
    { title: "Cloud Based", desc: "Access anywhere from mobile, tablet, or laptop.", icon: Database },
    { title: "Secure Data", desc: "Fully automated, encrypted database backups.", icon: Shield },
    { title: "Fast Billing", desc: "Print receipt invoices under 5 seconds.", icon: Zap },
    { title: "GST Ready", desc: "Automatic CGST, SGST, and IGST computations.", icon: CheckCircle },
    { title: "Multi-User Access", desc: "Assign custom permissions to cashiers & staff.", icon: Users },
    { title: "Real-Time Reports", desc: "Get live sales, cash balances, and stock status.", icon: BarChart3 }
  ];

  const pricingPlans = [
    {
      name: "Starter Plan",
      desc: "For local stores & startups.",
      monthlyPrice: "₹999",
      yearlyPrice: "₹799",
      features: [
        "1 Company Profile",
        "Single User Access",
        `Standard ${t('POS')} Billing`,
        "Basic Inventory",
        "Weekly Backups"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      desc: "For growing businesses.",
      monthlyPrice: "₹1,999",
      yearlyPrice: "₹1,599",
      features: [
        "5 Company Profiles",
        "5 Team Members",
        "Multi-Warehouse Inventory",
        "GST Invoices & Reports",
        "Daily Cloud Backups",
        "Audit Log Module"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      desc: "For corporate chains.",
      monthlyPrice: "₹3,999",
      yearlyPrice: "₹3,199",
      features: [
        "Unlimited Companies",
        "Unlimited Users",
        "BOM & Godown Transfers",
        "Superadmin Access",
        "Priority 24/7 Support",
        "Custom API Integrations"
      ],
      cta: "Book Demo",
      popular: false
    }
  ];

  const workflowSteps = [
    { step: 1, title: "Register", desc: "Create your business profile." },
    { step: 2, title: "Choose Plan", desc: "Select options for your scale." },
    { step: 3, title: "Add Stock", desc: "Import or enter inventory items." },
    { step: 4, title: "Generate Bills", desc: `Bill clients via ${t('POS')} or Invoice.` },
    { step: 5, title: "Manage Accounts", desc: "Log cash ledger flow easily." },
    { step: 6, title: "GST Reports", desc: "Generate files for instant filing." }
  ];

  const testimonials = [
    {
      name: "Rajesh Sharma",
      role: "Owner, Sharma Garments",
      text: `${t('POS')} billing is lightning fast. The GST reporting tool saves us hours of manual tax calculation every single month.`,
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      name: "Anjali Gupta",
      role: "Operations, Zen Distributors",
      text: "Managing transfers across multiple godowns is super simple now. Reduced our stock leakages by 30%.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80"
    },
    {
      name: "Vikram Malhotra",
      role: "Partner, VM Associates",
      text: "The audit log feature is transparent. Reconciling registers and tracking edits is extremely reliable.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80"
    }
  ];

  const faqs = [
    { q: "Is GST Supported?", a: "Yes. Generates GSTR-1, GSTR-2, and GSTR-3B matching government formats with automatic tax splits." },
    { q: "Is Data Secure?", a: "All data is securely encrypted end-to-end and backed up on AWS servers automatically." },
    { q: "Can Multiple Users Work?", a: "Yes. Create distinct staff accounts with custom roles and track edits in live Audit Logs." },
    { q: "Is Mobile Access Available?", a: "Yes. OS Books is fully responsive and runs on any smartphone, tablet or computer." },
    { q: "Can Plans Be Changed Later?", a: "Yes. You can upgrade, downgrade or cancel your subscription plans anytime from your billing tab." }
  ];

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 font-sans selection:bg-[#4F46E5] selection:text-white overflow-x-hidden">

      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-[#4F46E5]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] right-1/4 w-[500px] h-[500px] bg-[#4F46E5]/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <mask id="blue-doc-mask-landing1">
                    <rect x="2" y="3" width="14" height="18" rx="3" fill="white" />
                    <line x1="6" y1="8" x2="11" y2="8" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="6" y1="12" x2="11" y2="12" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="6" y1="16" x2="11" y2="16" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                  </mask>
                  <rect x="2" y="3" width="14" height="18" rx="3" fill="#3b82f6" mask="url(#blue-doc-mask-landing1)" />
                  <rect x="10" y="7" width="12" height="14" rx="2" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
                  <line x1="13" y1="11" x2="19" y2="11" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="13" y1="14" x2="19" y2="14" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="13" y1="17" x2="19" y2="17" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900 flex flex-col leading-[1.1]">
                <span>Swayam</span>
                <span>Bill <span className="text-[#3b82f6]">Book</span></span>
              </span>

            </div>

            <div className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-gray-600">
              <a href="#features" className="hover:text-[#4F46E5] transition-colors">Features</a>
              <a href="#pricing" className="hover:text-[#4F46E5] transition-colors">Pricing</a>
              <a href="#faq" className="hover:text-[#4F46E5] transition-colors">FAQs</a>
              <a href="#contact" className="hover:text-[#4F46E5] transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center border border-gray-200 rounded-md px-2 py-1 hover:border-gray-300 transition-colors">
                <Globe className="w-3.5 h-3.5 text-gray-500 mr-1.5" />
                <select
                  value={(i18n.language || 'en').substring(0, 2)}
                  onChange={changeLanguage}
                  className="notranslate text-xs font-semibold text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer outline-none uppercase appearance-none"
                  translate="no"
                >
                  <option value="en">EN</option>
                  <option value="hi">HI</option>
                  <option value="gu">GU</option>
                  <option value="mr">MR</option>
                  <option value="pa">PA</option>
                  <option value="ta">TA</option>
                  <option value="te">TE</option>
                  <option value="bn">BN</option>
                  <option value="kn">KN</option>
                  <option value="ml">ML</option>
                </select>
              </div>
              <button onClick={() => navigate('/login')} className="text-xs font-semibold text-gray-700 hover:text-[#4F46E5]">Log In</button>
              <button onClick={() => navigate('/login')} className="px-4 py-2 rounded text-xs font-bold bg-[#4F46E5] text-white hover:bg-[#4338ca] shadow-md shadow-indigo-500/10">Start Trial</button>
            </div>

            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-gray-600 hover:text-gray-900 bg-gray-100 rounded-lg">
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-2">
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:text-[#4F46E5]">Features</a>
              <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:text-[#4F46E5]">Pricing</a>
              <a href="#faq" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:text-[#4F46E5]">FAQs</a>
              <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-600 hover:text-[#4F46E5]">Contact</a>
              <div className="px-3 py-2 border-t border-gray-100 mt-2">
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-gray-500 mr-2" />
                  <select
                    value={(i18n.language || 'en').substring(0, 2)}
                    onChange={changeLanguage}
                    className="notranslate text-sm font-semibold text-gray-600 bg-transparent border-none focus:ring-0 cursor-pointer outline-none uppercase appearance-none"
                    translate="no"
                  >
                    <option value="en">English (EN)</option>
                    <option value="hi">Hindi (HI)</option>
                    <option value="gu">Gujarati (GU)</option>
                    <option value="mr">Marathi (MR)</option>
                    <option value="pa">Punjabi (PA)</option>
                    <option value="ta">Tamil (TA)</option>
                    <option value="te">Telugu (TE)</option>
                    <option value="bn">Bengali (BN)</option>
                    <option value="kn">Kannada (KN)</option>
                    <option value="ml">Malayalam (ML)</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="flex-1 py-2 text-center text-xs font-semibold bg-gray-100 rounded">Log In</button>
                <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="flex-1 py-2 text-center text-xs font-semibold bg-[#4F46E5] text-white rounded">Start Trial</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4F46E5]/10 border border-[#4F46E5]/20 text-[#4F46E5] text-xs font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
                Cloud ERP & Accounting Software
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
                Complete Accounting, Inventory & {t('POS')} Billing
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage Inventory, Billing, Accounts, GST Reports, Audit Logs, and Business Operations from a single cloud-based platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <button onClick={() => navigate('/login')} className="px-6 py-3 rounded text-sm font-bold bg-[#4F46E5] text-white hover:bg-[#4338ca] shadow-lg shadow-indigo-500/10">Start Free Trial</button>
                <a href="#contact" className="px-6 py-3 rounded text-sm font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-center">Book Demo</a>
              </div>
            </div>

            <motion.div
              className="lg:col-span-7"
              whileHover={{ rotateX: 5, rotateY: -5, scale: 1.03, z: 30 }}
              style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xl p-4 transform-gpu" style={{ transform: "translateZ(10px)" }}>


                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#FAFAFA] p-2.5 rounded border border-gray-100">
                    <span className="text-[9px] text-gray-550 block font-semibold uppercase">Sales Today</span>
                    <span className="text-xs sm:text-sm font-bold text-emerald-600">₹45,280</span>
                  </div>
                  <div className="bg-[#FAFAFA] p-2.5 rounded border border-gray-100">
                    <span className="text-[9px] text-gray-550 block font-semibold uppercase">Low Stock</span>
                    <span className="text-xs sm:text-sm font-bold text-red-500">4 Items</span>
                  </div>
                  <div className="bg-[#FAFAFA] p-2.5 rounded border border-gray-100">
                    <span className="text-[9px] text-gray-550 block font-semibold uppercase">Cash Balance</span>
                    <span className="text-xs sm:text-sm font-bold text-[#4F46E5]">₹1,18,500</span>
                  </div>
                </div>

                <div className="mt-4 bg-[#FAFAFA] p-3 rounded border border-gray-100 space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-gray-500">
                    <span className="font-semibold text-gray-700">Sales Revenue Trend</span>
                    <span>Weekly</span>
                  </div>
                  <div className="h-24 flex items-end gap-1.5 justify-between pt-1">
                    {[45, 60, 50, 75, 90, 65, 80].map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-[#4F46E5] rounded-t" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. Trusted Section */}
      <section className="py-8 bg-white border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-[#FAFAFA] rounded border border-gray-100">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 block notranslate" translate="no">{counters.companies.toLocaleString()}+</span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider block">Active Companies</span>
            </div>
            <div className="p-3 bg-[#FAFAFA] rounded border border-gray-100">
              <span className="text-xl sm:text-2xl font-bold text-[#4F46E5] block notranslate" translate="no">{counters.transactions.toLocaleString()}+</span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider block">Transactions Daily</span>
            </div>
            <div className="p-3 bg-[#FAFAFA] rounded border border-gray-100">
              <span className="text-xl sm:text-2xl font-bold text-gray-900 block notranslate" translate="no">{counters.gstReports.toLocaleString()}+</span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider block">GST Filed Reports</span>
            </div>
            <div className="p-3 bg-[#FAFAFA] rounded border border-gray-100">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600 block notranslate" translate="no">{counters.users.toLocaleString()}+</span>
              <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider block">Active Users</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Overview */}
      <section id="features" className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Powerful Business Features</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">All essential tools mapped in one secure framework.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feat, i) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{
                    y: -10,
                    rotateX: 12,
                    rotateY: -12,
                    scale: 1.06,
                    boxShadow: "0px 25px 30px rgba(79, 70, 229, 0.15)"
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm cursor-pointer transform-gpu"
                  style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                >
                  <motion.div
                    whileHover={{
                      rotateX: 35,
                      rotateY: 35,
                      scale: 1.25,
                      z: 40,
                      boxShadow: "0px 15px 20px rgba(79, 70, 229, 0.2)"
                    }}
                    transition={{ type: "spring", stiffness: 350, damping: 12 }}
                    className="w-9 h-9 rounded bg-[#4F46E5]/10 flex items-center justify-center text-[#4F46E5] mb-3 shadow-sm transform-gpu cursor-pointer"
                    style={{ transformStyle: "preserve-3d", perspective: 600 }}
                  >
                    <Icon className="w-5 h-5" style={{ transform: "translateZ(10px)" }} />
                  </motion.div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{feat.title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Super Admin Panel Section */}
      <section className="pb-6 md:pb-10 pt-2 md:pt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">

            <div className="lg:col-span-5 space-y-5">
              <h2 className="text-4xl sm:text-5xl font-black text-[#0B1221] tracking-tight leading-[1.1]">Global {t('SaaS')} Management</h2>
              <p className="text-[15px] sm:text-base text-gray-600 leading-relaxed">Manage companies, handle subscription billing tiers, and analyze platform statistics instantly.</p>

              <ul className="space-y-3 text-[15px] text-gray-700 pt-1">
                <li className="flex items-center gap-2"><span className="text-gray-600 font-medium">✓</span> Company Management</li>
                <li className="flex items-center gap-2"><span className="text-gray-600 font-medium">✓</span> Plan Customizations</li>
                <li className="flex items-center gap-2"><span className="text-gray-600 font-medium">✓</span> Revenue & Log Monitoring</li>
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                  <span className="text-gray-500 text-[10px] block">Global ARR</span>
                  <span className="text-lg font-bold text-emerald-600">₹84,12,000</span>
                </div>
                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                  <span className="text-gray-500 text-[10px] block">Active Clients</span>
                  <span className="text-lg font-bold text-gray-850">1,480 Companies</span>
                </div>
                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                  <span className="text-gray-500 text-[10px] block">Response Latency</span>
                  <span className="text-lg font-bold text-[#4F46E5]">42 ms</span>
                </div>
                <div className="bg-white p-4 rounded border border-gray-200 shadow-sm">
                  <span className="text-gray-500 text-[10px] block">Daily API Pulls</span>
                  <span className="text-lg font-bold text-purple-600">85,400 Req</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 9. Pricing */}
      <section id="pricing" className="py-10 md:py-16 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Simple Pricing Plans</h2>

            <div className="inline-flex items-center bg-gray-100 p-1 rounded border border-gray-200">
              <button onClick={() => setBillingPeriod('monthly')} className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${billingPeriod === 'monthly' ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-gray-600'}`}>Monthly</button>
              <button onClick={() => setBillingPeriod('yearly')} className={`px-3 py-1.5 rounded text-[10px] font-bold transition-all ${billingPeriod === 'yearly' ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-gray-600'}`}>Yearly (Save 20%)</button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {loadingPlans ? (
              <div className="col-span-3 text-center py-10 text-gray-500 text-sm font-semibold">Loading Plans...</div>
            ) : (dynamicPlans.length > 0 ? dynamicPlans : pricingPlans).map((plan, i) => (
              <motion.div
                key={i}
                onClick={() => setSelectedPlan(i)}
                whileHover={{ scale: 1.05, rotateX: 6, rotateY: -6, z: 30, boxShadow: "0px 30px 40px rgba(0,0,0,0.1)" }}
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`bg-white border rounded-xl p-6 flex flex-col justify-between shadow-sm transform-gpu cursor-pointer transition-all duration-200 ${selectedPlan === i
                    ? 'border-[#4F46E5] ring-2 ring-[#4F46E5]/20 shadow-lg shadow-indigo-100'
                    : 'border-gray-200 hover:border-indigo-200'
                  }`}
              >
                <div className="space-y-4" style={{ transform: "translateZ(20px)" }}>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-[11px] text-gray-500">{plan.desc || 'For your business'}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-gray-900">{plan.monthlyPrice || `₹${plan.price}`}</span>
                    <span className="text-[11px] text-gray-555"></span>
                  </div>
                  <hr className="border-gray-100" />
                  <ul className="space-y-2 text-xs">
                    {(plan.features
                      ? (Array.isArray(plan.features)
                        ? plan.features
                        : Object.entries(plan.features).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: ${value}`))
                      : []
                    ).map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-gray-650">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="capitalize">{typeof feature === 'string' ? feature : feature.name || JSON.stringify(feature)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    if (plan.cta === 'Book Demo') {
                      window.location.href = '#contact';
                    } else {
                      navigate('/login');
                    }
                  }}
                  className="w-full py-2.5 mt-6 rounded text-xs font-bold bg-[#4F46E5] hover:bg-[#4338ca] text-white transform-gpu" style={{ transform: "translateZ(30px)" }}>
                  {plan.cta || 'Start Free Trial'}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. Testimonials */}
      <section className="py-10 md:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Client Reviews</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((test, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.04, rotateX: -6, rotateY: 6, z: 30, boxShadow: "0px 20px 30px rgba(0,0,0,0.1)" }}
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="bg-white border border-gray-200 p-5 rounded-xl space-y-4 flex flex-col justify-between shadow-sm transform-gpu"
              >
                <p className="text-xs sm:text-sm text-gray-650 italic" style={{ transform: "translateZ(15px)" }}>"{test.text}"</p>
                <div className="flex items-center gap-3 border-t border-gray-150 pt-3">
                  <img src={test.avatar} alt={test.name} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-950">{test.name}</h4>
                    <span className="text-[10px] text-gray-500 block">{test.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. FAQ Section */}
      <section id="faq" className="py-10 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="bg-[#FAFAFA] border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => setOpenFaq(isOpen ? null : i)} className="w-full px-5 py-4 text-left flex justify-between items-center text-xs sm:text-sm font-bold text-gray-800 hover:bg-gray-50">
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180 text-gray-800' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-5 pb-4 text-xs text-gray-600 border-t border-gray-200 pt-2">
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-10 md:py-14 bg-[#FAFAFA] border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Contact Us</h2>
            <p className="text-xs sm:text-sm text-gray-500">Have questions? Fill out the form and our team will get back to you shortly.</p>
          </div>

          <div className="bg-white border border-gray-200 p-6 sm:p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
            {formSuccess ? (
              <div className="text-center py-8 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-gray-900">Message Sent Successfully!</h3>
                <p className="text-xs text-gray-500">Thank you for reaching out. We will get in touch with you soon.</p>
                <button onClick={() => setFormSuccess(false)} className="mt-4 px-4 py-2 rounded text-xs font-semibold bg-[#4F46E5] text-white hover:bg-[#4338ca]">Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 block">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-600 block">Email Address</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full bg-[#FAFAFA] border border-gray-200 rounded p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Business Name</label>
                  <input
                    type="text"
                    required
                    value={contactForm.business}
                    onChange={(e) => setContactForm({ ...contactForm, business: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#4F46E5]"
                    placeholder="Sharma Garments"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-600 block">Message</label>
                  <textarea
                    required
                    rows="4"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full bg-[#FAFAFA] border border-gray-200 rounded p-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#4F46E5] resize-none"
                    placeholder="Tell us about your requirements..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3 rounded text-xs font-bold bg-[#4F46E5] text-white hover:bg-[#4338ca] transition-colors disabled:opacity-50"
                >
                  {formLoading ? "Sending Message..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 14. Footer */}
      <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">

            {/* Brand & Intro */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                    <mask id="blue-doc-mask-landing2">
                      <rect x="2" y="3" width="14" height="18" rx="3" fill="white" />
                      <line x1="6" y1="8" x2="11" y2="8" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="6" y1="12" x2="11" y2="12" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="6" y1="16" x2="11" y2="16" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                    </mask>
                    <rect x="2" y="3" width="14" height="18" rx="3" fill="#3b82f6" mask="url(#blue-doc-mask-landing2)" />
                    <rect x="10" y="7" width="12" height="14" rx="2" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
                    <line x1="13" y1="11" x2="19" y2="11" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="13" y1="14" x2="19" y2="14" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                    <line x1="13" y1="17" x2="19" y2="17" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white tracking-wide flex flex-col leading-[1.1]">
                  <span>Swayam</span>
                  <span>Bill <span className="text-[#3b82f6]">Book</span></span>
                </span>

              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empowering businesses with seamless accounting, inventory management, and intelligent {t('POS')} billing solutions. Experience the future of cloud ERP.
              </p>
              <div className="flex gap-4 pt-2">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, rotateY: 15, rotateX: 15, z: 10, boxShadow: "0px 5px 10px rgba(79, 70, 229, 0.2)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#4F46E5] hover:text-white transition-colors duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ transform: "translateZ(5px)" }}><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, rotateY: -15, rotateX: 15, z: 10, boxShadow: "0px 5px 10px rgba(79, 70, 229, 0.2)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#4F46E5] hover:text-white transition-colors duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ transform: "translateZ(5px)" }}><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, rotateY: 15, rotateX: -15, z: 10, boxShadow: "0px 5px 10px rgba(79, 70, 229, 0.2)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#4F46E5] hover:text-white transition-colors duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ transform: "translateZ(5px)" }}><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1, rotateY: -15, rotateX: -15, z: 10, boxShadow: "0px 5px 10px rgba(79, 70, 229, 0.2)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  style={{ transformStyle: "preserve-3d", perspective: 1000 }}
                  className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-[#4F46E5] hover:text-white transition-colors duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" style={{ transform: "translateZ(5px)" }}><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" /></svg>
                </motion.a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Product</h3>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90" /> Features</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90" /> Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90" /> Integrations</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90" /> Updates</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90" /> About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90" /> Careers</a></li>
                <li><a href="#contact" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90" /> Contact Support</a></li>
                <li><a href="#faq" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"><ChevronDown className="w-3 h-3 -rotate-90" /> FAQs</a></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-sm leading-relaxed">
                    NO. , OPP GRAM PANCHAYAT, SH 31, BELAGAVI, KARNATAKA, INDIA, 591220
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#4F46E5] flex-shrink-0" />
                  <span className="text-slate-400 text-sm">9845972853</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#4F46E5] flex-shrink-0" />
                  <span className="text-slate-400 text-sm">swayamsoftwaretarget@gmail.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 flex-shrink-0 mt-0.5 text-center text-[#4F46E5] font-bold text-xs">GST</span>
                  <span className="text-slate-400 text-sm leading-relaxed">
                    29DCDPP7499L2ZH
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-5 h-5 flex-shrink-0 mt-0.5 text-center text-[#4F46E5] font-bold text-xs">KEY</span>
                  <span className="text-slate-400 text-sm leading-relaxed">
                    pass BILL3: 1
                  </span>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Swayam Bill Book. All rights reserved.

            </p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-500 hover:text-white text-sm transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
