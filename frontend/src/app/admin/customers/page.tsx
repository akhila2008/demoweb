'use client';
import { Users, Search, Filter } from 'lucide-react';

export default function AdminCustomersPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Customers</h1>
          <p className="text-gray-300">View and manage your registered customers.</p>
        </div>
      </div>

      <div className="bg-gray-900 text-white rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-primary)] border-opacity-30 flex flex-col sm:flex-row gap-4 justify-between items-center bg-black">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-200" />
            <input 
              type="text" 
              placeholder="Search customers by name or email..." 
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-primary)] border-opacity-50 rounded-lg bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 border border-[var(--color-primary)] border-opacity-50 rounded-lg py-2 px-4 bg-gray-900 text-white text-white hover:bg-gray-800 hover:bg-gray-700 transition-colors w-full sm:w-auto justify-center">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-[var(--color-primary)]/10 dark:bg-[var(--color-primary)]/20 rounded-full flex items-center justify-center mb-6 border-4 border-white dark:border-[#121212] shadow-sm">
            <Users className="w-10 h-10 text-[var(--color-primary)]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Customer Database Secured</h2>
          <p className="text-gray-200 max-w-md mb-8 leading-relaxed">
            For maximum security and privacy, your customer profiles, passwords, and sensitive information are securely managed directly inside your Supabase Vault.
          </p>
          <a 
            href="https://supabase.com/dashboard/project/_/auth/users" 
            target="_blank" 
            rel="noreferrer"
            className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3.5 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors shadow-md flex items-center gap-2"
          >
            <Users className="w-5 h-5" />
            View Customers in Supabase
          </a>
        </div>
        
      </div>
    </div>
  );
}
