'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Package, User, Heart, MapPin, LogOut, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_ORDERS: any[] = [];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-gray-900 text-white rounded-xl border border-[var(--color-primary)] border-opacity-30 overflow-hidden">
            <div className="p-6 border-b border-[var(--color-primary)] border-opacity-30">
              <div className="w-16 h-16 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                A
              </div>
              <h2 className="font-bold text-lg">Akhila</h2>
              <p className="text-sm text-gray-300">akhila@example.com</p>
            </div>
            <div className="flex flex-col py-2">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'orders' ? 'text-[var(--color-primary)] bg-red-50 dark:bg-red-900/10 border-l-4 border-[var(--color-primary)]' : 'text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 border-l-4 border-transparent'}`}
              >
                <Package className="w-5 h-5 mr-3" /> Orders
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'profile' ? 'text-[var(--color-primary)] bg-red-50 dark:bg-red-900/10 border-l-4 border-[var(--color-primary)]' : 'text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 border-l-4 border-transparent'}`}
              >
                <User className="w-5 h-5 mr-3" /> Profile Details
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'wishlist' ? 'text-[var(--color-primary)] bg-red-50 dark:bg-red-900/10 border-l-4 border-[var(--color-primary)]' : 'text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 border-l-4 border-transparent'}`}
              >
                <Heart className="w-5 h-5 mr-3" /> Wishlist
              </button>
              <button 
                onClick={() => setActiveTab('addresses')}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${activeTab === 'addresses' ? 'text-[var(--color-primary)] bg-red-50 dark:bg-red-900/10 border-l-4 border-[var(--color-primary)]' : 'text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-900 border-l-4 border-transparent'}`}
              >
                <MapPin className="w-5 h-5 mr-3" /> Addresses
              </button>
              <button className="flex items-center px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-l-4 border-transparent mt-4">
                <LogOut className="w-5 h-5 mr-3" /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow">
          
          {activeTab === 'orders' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold mb-6">Order History</h2>
              
              <div className="space-y-4">
                {MOCK_ORDERS.map(order => (
                  <div key={order.id} className="bg-gray-900 text-white rounded-xl border border-[var(--color-primary)] border-opacity-30 p-6 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex gap-4 items-center w-full md:w-auto">
                      <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 shrink-0">
                        <img src={order.items[0].image} alt="product" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{order.id}</div>
                        <div className="text-sm text-gray-300">{order.date}</div>
                        <div className="text-sm font-medium mt-1">{order.items[0].name} {order.items.length > 1 && `+ ${order.items.length - 1} more`}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between md:flex-col items-center md:items-end w-full md:w-auto border-t md:border-t-0 border-[var(--color-primary)] border-opacity-30 pt-4 md:pt-0">
                      <div className="font-bold text-lg">₹{order.total.toLocaleString('en-IN')}</div>
                      <div className={`text-sm font-medium mt-1 px-3 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {order.status}
                      </div>
                    </div>
                    
                    <div className="hidden md:flex text-gray-200">
                      <ChevronRight className="w-6 h-6" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h2 className="text-2xl font-bold mb-6">Profile Details</h2>
              <div className="bg-gray-900 text-white rounded-xl border border-[var(--color-primary)] border-opacity-30 p-6 max-w-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                    <input type="text" defaultValue="Akhila" className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                    <input type="email" defaultValue="akhila@example.com" disabled className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-50 dark:bg-gray-800 text-gray-300 cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                    <input type="tel" defaultValue="+91 9876543210" className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]" />
                  </div>
                  <button className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-md font-medium mt-4">
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  );
}
