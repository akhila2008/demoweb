'use client';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, IndianRupee, AlertCircle } from 'lucide-react';

const STATS = [
  { label: 'Total Revenue', value: '₹0', icon: IndianRupee, color: 'bg-green-100 text-green-700' },
  { label: 'Total Orders', value: '0', icon: ShoppingBag, color: 'bg-blue-100 text-blue-700' },
  { label: 'Active Customers', value: '0', icon: Users, color: 'bg-purple-100 text-purple-700' },
  { label: 'Avg. Order Value', value: '₹0', icon: TrendingUp, color: 'bg-orange-100 text-orange-700' },
];

const LOW_STOCK: any[] = [];

export default function AdminDashboardPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Overview</h1>
          <p className="text-gray-300">Welcome back, Admin. Here is your store's performance.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {STATS.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gray-900 text-white p-6 rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-300 bg-gray-800 px-2 py-1 rounded-full">0%</span>
              </div>
              <h3 className="text-gray-300 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-gray-900 text-white p-6 rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm">
          <h2 className="text-xl font-bold mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-300 border-b border-[var(--color-primary)] border-opacity-30">
                  <th className="pb-3 font-medium">Order ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-300">
                    No orders have been placed yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Low Stock */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-6 rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm border-l-4 border-l-red-500">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <AlertCircle className="text-red-500 w-5 h-5" /> Low Stock Alerts
            </h2>
            <div className="space-y-4">
              {LOW_STOCK.length > 0 ? LOW_STOCK.map(item => (
                <div key={item.name} className="flex justify-between items-center">
                  <span className="text-sm text-gray-200">{item.name}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                  </span>
                </div>
              )) : (
                <div className="text-sm text-gray-300">All products have sufficient stock.</div>
              )}
            </div>
            <button className="w-full mt-4 text-sm font-medium text-[var(--color-primary)] hover:underline">
              View Inventory Report &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
