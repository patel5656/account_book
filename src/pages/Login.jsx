import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Mail, Lock, ShieldCheck, TrendingUp, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import apiClient from '../api/apiClient';

export const Login = () => {
  // Autofill credentials setup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      if (user.role === 'SUPERADMIN') {
        window.location.href = '/superadmin/dashboard';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-white">
      {/* Left Side - Branding & Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-[#1A1C29] via-[#2A2D43] to-[#4F46E5] p-12 flex-col justify-between relative overflow-hidden">
        
        {/* Abstract Background Shapes for Modern Aesthetic */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-30">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-indigo-500 blur-[100px] animate-pulse" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-400 blur-[80px]"></div>
        </div>

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <mask id="blue-doc-mask-login1">
                  <rect x="2" y="3" width="14" height="18" rx="3" fill="white" />
                  <line x1="6" y1="8" x2="11" y2="8" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="6" y1="12" x2="11" y2="12" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="6" y1="16" x2="11" y2="16" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                </mask>
                <rect x="2" y="3" width="14" height="18" rx="3" fill="#3b82f6" mask="url(#blue-doc-mask-login1)" />
                <rect x="10" y="7" width="12" height="14" rx="2" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
                <line x1="13" y1="11" x2="19" y2="11" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="13" y1="14" x2="19" y2="14" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="13" y1="17" x2="19" y2="17" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-white text-2xl font-semibold tracking-wide flex flex-col leading-tight">
                 <span>Swayam</span>
                 <span>Bill <span className="text-[#3b82f6]">Book</span></span>
               </span>

               <span className="text-[11px] text-indigo-200 leading-none">The Digital Accounting Book</span>
            </div>
          </div>
        </div>

        {/* Main Hero Text */}
        <div className="relative z-10 text-white space-y-6 max-w-lg mt-8">
          <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
            Manage your finances <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-blue-200">
              with confidence.
            </span>
          </h1>
          <p className="text-indigo-100/80 text-lg leading-relaxed font-light">
            A comprehensive digital accounting solution designed to streamline your inventory, billing, and GST compliance in real-time.
          </p>
          
          {/* Feature Badges */}
          <div className="pt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md py-2 px-4 rounded-full border border-white/10 shadow-xl">
              <ShieldCheck className="w-5 h-5 text-indigo-300" />
              <span className="text-sm font-medium">100% Secure</span>
            </div>
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md py-2 px-4 rounded-full border border-white/10 shadow-xl">
              <TrendingUp className="w-5 h-5 text-indigo-300" />
              <span className="text-sm font-medium">Real-time Analytics</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-indigo-200/60 text-sm">
          &copy; {new Date().getFullYear()} Swayam Bill Book. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-[#FAFAFA] relative">
        
        {/* Back to Home / Logout Button */}
        <button 
          onClick={() => navigate('/')}
          className="absolute top-8 right-8 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Mobile Logo (Visible only on small screens) */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
           <div className="w-10 h-10 flex items-center justify-center shrink-0">
             <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <mask id="blue-doc-mask-login2">
                  <rect x="2" y="3" width="14" height="18" rx="3" fill="white" />
                  <line x1="6" y1="8" x2="11" y2="8" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="6" y1="12" x2="11" y2="12" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="6" y1="16" x2="11" y2="16" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                </mask>
                <rect x="2" y="3" width="14" height="18" rx="3" fill="#3b82f6" mask="url(#blue-doc-mask-login2)" />
                <rect x="10" y="7" width="12" height="14" rx="2" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
                <line x1="13" y1="11" x2="19" y2="11" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="13" y1="14" x2="19" y2="14" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="13" y1="17" x2="19" y2="17" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
             </svg>
           </div>
           <span className="text-gray-900 text-xl font-bold tracking-wide flex flex-col leading-[1.1]">
             <span>Swayam</span>
             <span>Bill <span className="text-[#3b82f6]">Book</span></span>
           </span>

        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Form Header */}
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Please enter your details to sign in to your account.
            </p>
          </div>



          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-5">
              
              {/* Email Field */}
              <div>
                <label 
                  htmlFor="email" 
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email or Username
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-200 bg-white shadow-sm sm:text-sm"
                    placeholder="admin@swayambillbook.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label 
                  htmlFor="password" 
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all duration-200 bg-white shadow-sm sm:text-sm"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer transition-colors"
                />
                <label 
                  htmlFor="remember-me" 
                  className="ml-2 block text-sm text-gray-600 cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-[#4F46E5] hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg shadow-indigo-500/30 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center tracking-wide">
                    Sign In
                    <LogIn className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                  </span>
                )}
              </button>
            </div>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <a href="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 transition-colors">
                Register Now
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
