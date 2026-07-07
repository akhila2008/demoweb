'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Users, Settings, Package, LogOut, Lock, Tag } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Check if already authenticated in this session
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');
    
    try {
      const { data, error: dbError } = await supabase
        .from('store_settings')
        .select('admin_password')
        .eq('id', 'default')
        .single();
        
      if (dbError) throw dbError;
      
      if (data && password.trim() === data.admin_password) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        document.cookie = "admin_auth=true; path=/; max-age=86400; SameSite=Strict";
        setError('');
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      console.error('Error verifying password:', err);
      // Fallback in case table doesn't exist yet
      if (password.trim() === 'admin123') {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        document.cookie = "admin_auth=true; path=/; max-age=86400; SameSite=Strict";
      } else {
        setError('Incorrect password or database not connected.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Offers & Coupons', href: '/admin/offers', icon: Tag },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="bg-gray-900 text-white p-8 rounded-xl shadow-lg border border-[var(--color-primary)] border-opacity-30 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-[var(--color-primary)]" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Admin Access</h2>
          <p className="text-center text-gray-300 mb-8">Please enter the master password to access the dashboard.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..." 
                className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button 
              type="submit" 
              disabled={isVerifying}
              className="w-full bg-[var(--color-primary)] hover:bg-[#600000] text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-70 flex justify-center items-center"
            >
              {isVerifying ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Unlock Dashboard'
              )}
            </button>
            <div className="text-center mt-4">
              <Link href="/" className="text-sm text-gray-300 hover:text-[var(--color-primary)]">
                &larr; Return to main website
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white border-r border-[var(--color-primary)] border-opacity-30 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-indian-magenta)]">
            AKHILA SAREES <span className="text-sm font-normal text-gray-300 block">Admin Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-[var(--color-primary)] border-opacity-30">
          <button 
            onClick={handleLogout}
            className="flex items-center px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="p-8 overflow-y-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
