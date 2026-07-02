'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { User as UserIcon, LogOut, Package, MapPin } from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    
    if (user) {
      setProfileData({
        name: user.user_metadata?.full_name || 'Customer',
        email: user.email,
        joinDate: new Date(user.created_at).toLocaleDateString()
      });
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (loading || !user) {
    return <div className="min-h-[60vh] flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <div className="flex flex-col items-center text-center border-b border-gray-200 dark:border-gray-800 pb-6 mb-6">
              <div className="w-20 h-20 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                {profileData?.name?.charAt(0) || 'U'}
              </div>
              <h2 className="text-xl font-bold">{profileData?.name}</h2>
              <p className="text-gray-500 text-sm">{profileData?.email}</p>
              <p className="text-gray-400 text-xs mt-2">Member since {profileData?.joinDate}</p>
            </div>
            
            <nav className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-900 dark:text-white font-medium">
                <UserIcon className="w-5 h-5 text-[var(--color-primary)]" /> My Profile
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-400 font-medium transition-colors">
                <Package className="w-5 h-5" /> My Orders
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg text-gray-600 dark:text-gray-400 font-medium transition-colors">
                <MapPin className="w-5 h-5" /> Addresses
              </button>
              
              <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg font-medium transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full md:w-3/4">
          <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 sm:p-8">
            <h1 className="text-2xl font-bold mb-6">Account Details</h1>
            
            <div className="space-y-6 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profileData?.name || ''} 
                  readOnly 
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={profileData?.email || ''} 
                  readOnly 
                  className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg"
                />
              </div>
            </div>
            
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">When you purchase your first premium saree, the order details will appear here.</p>
                <button 
                  onClick={() => router.push('/shop')}
                  className="bg-[var(--color-primary)] hover:bg-[#600000] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
