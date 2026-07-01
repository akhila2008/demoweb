'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Users, Settings, Package, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#121212] border-r border-gray-200 dark:border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-indian-magenta)]">
            AKHILA SAREES <span className="text-sm font-normal text-gray-500 block">Admin Panel</span>
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
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[var(--color-primary)] text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button className="flex items-center px-4 py-3 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
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
