'use client';
import { Users, Search, Filter } from 'lucide-react';

export default function AdminCustomersPage() {
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Customers</h1>
          <p className="text-gray-500">View and manage your registered customers.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-[#1A1A1A]">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customers by name or email..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-4 dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors w-full sm:w-auto justify-center">
              <Filter className="w-4 h-4" /> Filter
            </button>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-16 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No customers yet</h2>
          <p className="text-gray-500 max-w-md">
            When users sign up for an account on your website to make a purchase, their profiles and contact information will appear here.
          </p>
        </div>
        
      </div>
    </div>
  );
}
