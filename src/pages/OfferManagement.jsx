import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Gift,
  Tag,
  Calendar,
  Shield,
  Search,
  ChevronDown,
  Trash2,
  CalendarClock,
  Clock,
  Pencil,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { OfferManagementModal } from '../components/OfferManagementModal';
import { OfferViewModal } from '../components/OfferViewModal';

export function OfferManagement() {
  const navigate = useNavigate();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editOffer, setEditOffer] = useState(null);
  const [viewOffer, setViewOffer] = useState(null);

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Computed stats from real data
  const totalUsage = offers.reduce((sum, o) => sum + (o.usage || 0), 0);
  const activeCount = offers.filter(o => o.status === 'ACTIVE').length;
  const inactiveCount = offers.filter(o => o.status === 'INACTIVE').length;
  const scheduledCount = offers.filter(o => o.startDate && o.endDate).length;
  const topOffer = offers.reduce((best, o) => (!best || (o.usage || 0) > (best.usage || 0)) ? o : best, null);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/offers');
      setOffers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch offers:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this offer?')) return;
    try {
      await apiClient.delete(`/offers/${id}`);
      setOffers(offers.filter(offer => offer.id !== id));
    } catch (error) {
      console.error('Failed to delete offer:', error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await apiClient.patch(`/offers/${id}/toggle-status`);
      const updated = response.data.data;
      setOffers(offers.map(o => o.id === id ? updated : o));
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const renderIcon = (iconName) => {
    if (iconName === 'CalendarClock') return <CalendarClock className="w-4 h-4" />;
    if (iconName === 'Clock') return <Clock className="w-4 h-4" />;
    return null;
  };

  return (
    <div className="bg-[#f8f9fc] min-h-[calc(100vh-45px)] p-4 md:p-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-[20px] md:text-[22px] font-semibold text-gray-800"></h1>
        <button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-[#295dec] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-md text-[14px] font-medium flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Create Promotion
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between h-24 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[14px] text-gray-500 font-medium">Total Offer Usage</span>
            <Gift className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
          </div>
          <span className="text-3xl font-bold text-gray-800">{totalUsage}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between h-24 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[14px] text-gray-500 font-medium">Active / Inactive</span>
            <Tag className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
          </div>
          <span className="text-3xl font-bold text-gray-800">{activeCount} / {inactiveCount}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between h-24 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[14px] text-gray-500 font-medium">Scheduled Offers</span>
            <Calendar className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
          </div>
          <span className="text-3xl font-bold text-gray-800">{scheduledCount}</span>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex flex-col justify-between h-24 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[14px] text-gray-500 font-medium">Top Performing</span>
            <Shield className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-bold text-gray-800 truncate">
            {topOffer ? topOffer.name : '—'}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 bg-gray-50/50 w-full md:w-64 focus-within:border-blue-500 focus-within:bg-white transition-colors">
            <Search className="w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search..."
              className="bg-transparent border-none outline-none text-[14px] w-full text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 bg-white cursor-pointer hover:bg-gray-50">
            <span className="text-[14px] text-gray-700 font-medium">All Status</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap md:whitespace-normal">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                <th className="py-4 px-6 text-[13px] font-semibold text-gray-500 md:w-[18%]">Offer Name</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-gray-500 md:w-[16%]">Type &amp; Target</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-gray-500 md:w-[13%]">Offer Value</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-gray-500 md:w-[18%]">Schedule</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-gray-500 text-center md:w-[7%]">Usage</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-gray-500 text-center md:w-[7%]">Priority</th>
                <th className="py-4 px-6 text-[13px] font-semibold text-gray-500 md:w-[8%]">Status</th>
                <th className="py-4 px-4 text-[13px] font-semibold text-gray-500 text-center md:w-[13%]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-[14px]">Loading offers...</td>
                </tr>
              ) : offers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-[14px]">No offers found. Click "Create Promotion" to add one.</td>
                </tr>
              ) : (
                offers.map((offer) => (
                  <tr key={offer.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="text-[14px] font-bold text-gray-800">{offer.name}</span>
                        {offer.minCart && offer.minCart !== '-' && (
                          <span className="text-[12px] text-gray-500">Min Cart: {offer.minCart}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5 items-start">
                        <span className="text-[11px] font-bold tracking-wider text-[#295dec] uppercase">
                          {offer.type}
                        </span>
                        <span className="text-[10px] font-bold text-[#3b82f6] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100/50">
                          {offer.target}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[14px] font-bold text-gray-800">{offer.offerValue}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        {offer.scheduleIcon && renderIcon(offer.scheduleIcon)}
                        <span className={`text-[13px] ${offer.schedule === 'Always Active' ? 'italic' : 'font-medium text-gray-600'}`}>
                          {offer.schedule}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-[14px] font-bold text-gray-800">{offer.usage}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-[13px] font-medium text-gray-500">{offer.priority}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-[11px] font-bold tracking-wider ${
                        offer.status === 'ACTIVE' ? 'text-green-500' : 'text-red-400'
                      }`}>
                        {offer.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* View */}
                        <button
                          onClick={() => setViewOffer(offer)}
                          title="View Offer"
                          className="p-1.5 text-blue-500 hover:text-white bg-blue-50 hover:bg-blue-500 rounded-md border border-blue-100 hover:border-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Toggle Active/Inactive */}
                        <button
                          onClick={() => handleToggleStatus(offer.id)}
                          title={offer.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-md border transition-all duration-200 shadow-sm hover:shadow-md ${offer.status === 'ACTIVE' ? 'text-green-500 hover:text-white bg-green-50 hover:bg-green-500 border-green-100 hover:border-green-500' : 'text-gray-400 hover:text-white bg-gray-50 hover:bg-gray-500 border-gray-100 hover:border-gray-500'}`}
                        >
                          {offer.status === 'ACTIVE'
                            ? <ToggleRight className="w-3.5 h-3.5" />
                            : <ToggleLeft className="w-3.5 h-3.5" />}
                        </button>
                        {/* Edit */}
                        <button
                          onClick={() => setEditOffer(offer)}
                          title="Edit Offer"
                          className="p-1.5 text-yellow-500 hover:text-white bg-yellow-50 hover:bg-yellow-500 rounded-md border border-yellow-100 hover:border-yellow-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {/* Delete */}
                        <button 
                          onClick={() => handleDelete(offer.id)}
                          title="Delete Offer"
                          className="p-1.5 text-red-400 hover:text-white bg-red-50 hover:bg-red-500 rounded-md border border-red-100 hover:border-red-500 transition-all duration-200 shadow-sm hover:shadow-md"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Create Modal */}
      <OfferManagementModal 
        isOpen={createModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        onSubmit={() => {
          fetchOffers();
        }}
      />

      {/* Edit Modal */}
      <OfferManagementModal
        isOpen={!!editOffer}
        editData={editOffer}
        onClose={() => setEditOffer(null)}
        onSubmit={() => {
          fetchOffers();
          setEditOffer(null);
        }}
      />

      {/* View Modal */}
      <OfferViewModal
        isOpen={!!viewOffer}
        offer={viewOffer}
        onClose={() => setViewOffer(null)}
      />

    </div>
  );
}

export default OfferManagement;
