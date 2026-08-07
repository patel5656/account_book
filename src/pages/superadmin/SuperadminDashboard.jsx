import React, { useState, useEffect } from 'react';
import { Building2, CreditCard, Headset, TrendingUp, Users, Activity } from 'lucide-react';
import apiClient from '../../api/apiClient';

export function SuperadminDashboard() {
  const [metrics, setMetrics] = useState({
    totalActiveCompanies: 0,
    mrr: 0,
    activeSubscriptions: 0,
    inactiveSubscriptions: 0,
  });
  const [recentCompanies, setRecentCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [metricsRes, companiesRes] = await Promise.all([
          apiClient.get('/dashboard/metrics'),
          apiClient.get('/companies')
        ]);
        
        if (metricsRes.data.success) {
          setMetrics(metricsRes.data.data);
        }
        if (companiesRes.data.success) {
          // Take the 3 most recently created companies
          const sorted = companiesRes.data.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setRecentCompanies(sorted.slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  const stats = [
    { title: 'Total Active Companies', value: metrics.totalActiveCompanies, icon: Building2, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Monthly Recurring Revenue', value: `₹${metrics.mrr.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { title: 'Active Subscriptions', value: metrics.activeSubscriptions, icon: CreditCard, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Inactive Subscriptions', value: metrics.inactiveSubscriptions, icon: CreditCard, color: 'text-rose-600', bg: 'bg-rose-100' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Superadmin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your SaaS platform's performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>

          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Companies */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2 text-gray-500" />
            Recently Onboarded Companies
          </h3>
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-gray-500 text-sm">Loading recent companies...</p>
            ) : recentCompanies.length > 0 ? (
              recentCompanies.map((company) => (
                <div key={company.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                  <div>
                    <p className="font-semibold text-gray-900">{company.name}</p>
                    <p className="text-xs text-gray-500">Owner: {company.ownerName}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${company.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                    {company.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No companies found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
