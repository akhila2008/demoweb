'use client';
import { useState, useEffect } from 'react';
import { Settings, Save, Lock, Store, Bell, CreditCard, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState('Akhila Sarees');
  const [email, setEmail] = useState('contact@akhilasarees.com');
  const [contactPhone, setContactPhone] = useState('+91 9876543210');
  const [currency, setCurrency] = useState('INR');
  const [deliveryCharge, setDeliveryCharge] = useState(150);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(5000);
  
  // Payment Settings
  const [upiId, setUpiId] = useState('8143227553@ybl');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('store');

  // Security Settings
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'default')
        .single();

      if (error) throw error;

      if (data) {
        if (data.store_name) setStoreName(data.store_name);
        if (data.email) setEmail(data.email);
        if (data.contact_phone) setContactPhone(data.contact_phone);
        if (data.currency) setCurrency(data.currency);
        if (data.delivery_charge !== undefined) setDeliveryCharge(data.delivery_charge);
        if (data.free_shipping_threshold !== undefined) setFreeShippingThreshold(data.free_shipping_threshold);
        if (data.upi_id) setUpiId(data.upi_id);
        if (data.bank_name) setBankName(data.bank_name);
        if (data.account_number) setAccountNumber(data.account_number);
        if (data.ifsc_code) setIfscCode(data.ifsc_code);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Fallback to localStorage if db isn't setup
      const saved = localStorage.getItem('akhila_store_settings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.storeName) setStoreName(parsed.storeName);
          if (parsed.email) setEmail(parsed.email);
          if (parsed.contactPhone) setContactPhone(parsed.contactPhone);
          if (parsed.currency) setCurrency(parsed.currency);
          if (parsed.deliveryCharge !== undefined) setDeliveryCharge(parsed.deliveryCharge);
          if (parsed.freeShippingThreshold !== undefined) setFreeShippingThreshold(parsed.freeShippingThreshold);
          if (parsed.upiId) setUpiId(parsed.upiId);
          if (parsed.bankName) setBankName(parsed.bankName);
          if (parsed.accountNumber) setAccountNumber(parsed.accountNumber);
          if (parsed.ifscCode) setIfscCode(parsed.ifscCode);
        } catch (e) {}
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const dbSettings = {
      store_name: storeName,
      email,
      contact_phone: contactPhone,
      currency,
      delivery_charge: Number(deliveryCharge),
      free_shipping_threshold: Number(freeShippingThreshold),
      upi_id: upiId,
      bank_name: bankName,
      account_number: accountNumber,
      ifsc_code: ifscCode,
      updated_at: new Date().toISOString()
    };
    
    try {
      const { error } = await supabase
        .from('store_settings')
        .update(dbSettings)
        .eq('id', 'default');
        
      if (error) throw error;
      
      // Also update localStorage as a fallback
      localStorage.setItem('akhila_store_settings', JSON.stringify({
        storeName, email, contactPhone, currency, 
        deliveryCharge: Number(deliveryCharge), 
        freeShippingThreshold: Number(freeShippingThreshold),
        upiId, bankName, accountNumber, ifscCode
      }));
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings to database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    
    try {
      // First verify old password
      const { data, error: verifyError } = await supabase
        .from('store_settings')
        .select('admin_password')
        .eq('id', 'default')
        .single();
        
      if (verifyError) throw verifyError;
      
      // Allow fallback if no password exists in DB yet, or if it matches
      const currentDbPassword = data?.admin_password;
      const currentLocalPassword = localStorage.getItem('admin_password') || 'admin123';
      
      if (currentDbPassword && oldPassword !== currentDbPassword) {
        // Also check if they might be using local password if db just got setup
        if (oldPassword !== currentLocalPassword) {
          setPasswordError('Old password is incorrect.');
          setIsUpdatingPassword(false);
          return;
        }
      }

      // Update password
      const { error: updateError } = await supabase
        .from('store_settings')
        .update({ admin_password: newPassword, updated_at: new Date().toISOString() })
        .eq('id', 'default');
        
      if (updateError) throw updateError;
      
      // Update local storage as well for fallback
      localStorage.setItem('admin_password', newPassword);

      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update password:', err);
      setPasswordError('Failed to save to database. Check connection.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-300">Manage your store preferences and account settings.</p>
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
          <button 
            onClick={() => setActiveTab('store')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors text-left ${
              activeTab === 'store' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            <Store className="w-4 h-4" /> Store Details
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors text-left ${
              activeTab === 'payments' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Payments
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-colors text-left ${
              activeTab === 'security' 
                ? 'bg-[var(--color-primary)] text-white' 
                : 'text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900'
            }`}
          >
            <Lock className="w-4 h-4" /> Security
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg font-medium text-sm transition-colors text-left opacity-50 cursor-not-allowed">
            <Bell className="w-4 h-4" /> Notifications (Coming Soon)
          </button>
        </div>

        {/* Settings Content */}
        <div className="md:col-span-3 space-y-6">
          {activeTab === 'store' && (
            <>
              <div className="bg-gray-900 text-white rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm p-6">
            <h2 className="text-lg font-bold text-white mb-4 border-b border-[var(--color-primary)] border-opacity-30 pb-2">Store Profile</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Store Name</label>
                <input 
                  type="text" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Help Center Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Help Center Phone</label>
                <input 
                  type="text" 
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="e.g. +91 9876543210"
                  className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Store Currency</label>
                <select 
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 text-white rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm p-6">
            <h2 className="text-lg font-bold text-white mb-4 border-b border-[var(--color-primary)] border-opacity-30 pb-2">Shipping Configuration</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Standard Delivery Charge (₹)</label>
                <input 
                  type="number" 
                  value={deliveryCharge}
                  onChange={(e) => setDeliveryCharge(Number(e.target.value))}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Free Shipping Threshold (₹) - Enter 0 to disable</label>
                <input 
                  type="number" 
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  onWheel={(e) => (e.target as HTMLInputElement).blur()}
                  className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>
            </>
          )}

          {activeTab === 'payments' && (
            <>
              <div className="bg-gray-900 text-white rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm p-6">
                <h2 className="text-lg font-bold text-white mb-4 border-b border-[var(--color-primary)] border-opacity-30 pb-2">UPI Settings</h2>
                <p className="text-sm text-gray-300 mb-4">Enter your store's UPI ID. Customers choosing Pay Online will be asked to pay to this UPI ID.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">UPI ID (e.g., store@okhdfcbank)</label>
                    <input 
                      type="text" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="Enter UPI ID"
                      className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 text-white rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm p-6">
                <h2 className="text-lg font-bold text-white mb-4 border-b border-[var(--color-primary)] border-opacity-30 pb-2">Bank Details (Optional)</h2>
                <p className="text-sm text-gray-300 mb-4">Enter your bank details for direct transfers. Leave blank if you only want to accept UPI.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Bank Name</label>
                    <select 
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                    >
                      <option value="">Select a Bank...</option>
                      <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Punjab National Bank (PNB)">Punjab National Bank (PNB)</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="Union Bank of India">Union Bank of India</option>
                      <option value="Bank of India">Bank of India</option>
                      <option value="IndusInd Bank">IndusInd Bank</option>
                      <option value="Yes Bank">Yes Bank</option>
                      <option value="IDFC First Bank">IDFC First Bank</option>
                      <option value="Federal Bank">Federal Bank</option>
                      <option value="Indian Bank">Indian Bank</option>
                      <option value="Central Bank of India">Central Bank of India</option>
                      <option value="Other">Other...</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Account Number</label>
                    <input 
                      type="text" 
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="Enter Account Number"
                      className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">IFSC Code</label>
                    <input 
                      type="text" 
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      placeholder="Enter IFSC Code"
                      className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'security' && (
            <div className="bg-gray-900 text-white rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm p-6">
              <h2 className="text-lg font-bold text-white mb-4 border-b border-[var(--color-primary)] border-opacity-30 pb-2">Change Password</h2>
              
              <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
                {passwordError && (
                  <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-md text-sm">
                    {passwordError}
                  </div>
                )}
                {passwordSuccess && (
                  <div className="p-3 bg-green-100 border border-green-200 text-green-700 rounded-md text-sm">
                    Password updated successfully!
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Old Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 pr-10 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 pr-10 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 pr-10 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isUpdatingPassword}
                    className="flex items-center gap-2 bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-md hover:bg-[#800000]/90 transition-colors disabled:opacity-50"
                  >
                    <Lock className="w-5 h-5" /> 
                    {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab !== 'security' && (
            <div className="flex justify-end gap-3">
              <button className="px-6 py-2 bg-gray-800 text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
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
          )}
        </div>

      </div>
    </div>
  );
}
