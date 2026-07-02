'use client';
import { useState } from 'react';
import { Settings, Save, Lock, Store, Bell, CreditCard } from 'lucide-react';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('Akhila Sarees');
  const [email, setEmail] = useState('akhila@example.com');
  const [currency, setCurrency] = useState('INR');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500">Manage your store preferences and account settings.</p>
        </div>
        {showSuccess && (
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm font-medium animate-pulse">
            Settings saved successfully!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Settings Navigation */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium text-sm transition-colors text-left">
            <Store className="w-4 h-4" /> Store Details
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg font-medium text-sm transition-colors text-left">
            <Lock className="w-4 h-4" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg font-medium text-sm transition-colors text-left">
            <Bell className="w-4 h-4" /> Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg font-medium text-sm transition-colors text-left">
            <CreditCard className="w-4 h-4" /> Payments
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-800 pb-2">Store Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
                <input 
                  type="text" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900 focus:ring-[var(--color-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Currency</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900 focus:ring-[var(--color-primary)]"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--color-primary)] hover:bg-[#600000] text-white'
              }`}
            >
              <Save className="w-4 h-4" /> 
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
