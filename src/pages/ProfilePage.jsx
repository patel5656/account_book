import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, Calendar, Edit2, Save, X, Loader } from 'lucide-react';
import apiClient from '../api/apiClient';

export function ProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    role: '',
    createdAt: null
  });
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Fetch profile from DB on mount
  useEffect(() => {
    setLoading(true);
    apiClient.get('/auth/me')
      .then(res => {
        if (res.data.success) {
          const u = res.data.data;
          setProfile(u);
          setEditName(u.name || '');
          setEditEmail(u.email || '');
          // Also update localStorage so other parts of app have fresh data
          const stored = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({ ...stored, ...u }));
        }
      })
      .catch(err => {
        console.error('Failed to load profile:', err);
        // Fallback to localStorage if API fails
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        setProfile(stored);
        setEditName(stored.name || '');
        setEditEmail(stored.email || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      }).replace(/ /g, '-')
    : '';

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const res = await apiClient.put('/auth/me', { name: editName, email: editEmail });
      if (res.data.success) {
        const updated = res.data.data;
        setProfile(updated);
        // Update localStorage as well
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...stored, ...updated }));
        setIsEditing(false);
      }
    } catch (err) {
      setError('Failed to save profile. Please try again.');
      console.error('Save profile error:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(profile.name || '');
    setEditEmail(profile.email || '');
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader className="w-8 h-8 animate-spin text-[#4F46E5]" />
          <p className="text-[14px]">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center bg-gray-100 p-6">
      
      {/* Profile Card */}
      <div className="bg-white w-full max-w-2xl rounded-lg shadow overflow-hidden">

        {/* Teal Header with Avatar */}
        <div className="bg-[#4F46E5] flex flex-col items-center py-8 relative">
          <div className="w-24 h-24 rounded-full bg-[#15919f] border-4 border-white flex items-center justify-center shadow-lg mb-3">
            <User className="w-14 h-14 text-white" strokeWidth={1.5} />
          </div>
          <h2 className="text-white text-[22px] font-bold tracking-wide">{profile.name || 'User'}</h2>
          {memberSince && (
            <p className="text-teal-100 text-[13px] mt-0.5">Member since {memberSince}</p>
          )}
          <p className="text-teal-100 text-[13px]">
            User Right's : <span className="font-bold text-white capitalize">{profile.role ? profile.role.replace('_', ' ') : ''}</span>
          </p>
        </div>

        {/* Info Section */}
        <div className="p-6 space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-2 rounded">
              {error}
            </div>
          )}

          {/* Full Name */}
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Full Name</p>
              {isEditing ? (
                <input 
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-[14px] focus:outline-none focus:border-[#4F46E5] mt-0.5"
                />
              ) : (
                <p className="text-[15px] font-semibold text-gray-800">{profile.name || <span className="text-gray-400 font-normal text-[13px]">Not set</span>}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Email</p>
              {isEditing ? (
                <input 
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-[14px] focus:outline-none focus:border-[#4F46E5] mt-0.5"
                />
              ) : (
                <p className="text-[15px] font-semibold text-gray-800">{profile.email || <span className="text-gray-400 font-normal text-[13px]">Not set</span>}</p>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-4 border-b border-gray-100 pb-4">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">User Role</p>
              <p className="text-[15px] font-semibold text-gray-800 capitalize">
                {profile.role ? profile.role.replace(/_/g, ' ') : ''}
              </p>
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#4F46E5]" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Member Since</p>
              <p className="text-[15px] font-semibold text-gray-800">{memberSince || <span className="text-gray-400 font-normal text-[13px]">Not available</span>}</p>
            </div>
          </div>

        </div>

        {/* Footer Buttons */}
        <div className="border-t border-gray-200 bg-gray-50 p-4 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 border border-gray-300 text-gray-600 rounded bg-white hover:bg-gray-50 text-[14px] font-medium transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#4F46E5] hover:bg-[#4338ca] text-white font-medium rounded text-[14px] transition-colors disabled:opacity-70"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2 border border-gray-300 text-gray-600 rounded bg-white hover:bg-gray-50 text-[14px] font-medium transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#4F46E5] hover:bg-[#4338ca] text-white font-medium rounded text-[14px] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit Profile
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
