'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, Users, IndianRupee, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeCustomers: 0,
    avgOrderValue: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch Orders
      const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (orders) {
        let revenue = 0;
        const uniqueCustomers = new Set();

        orders.forEach(order => {
          if (order.status !== 'CANCELLED') {
            revenue += order.grand_total || 0;
          }
          if (order.shipping_address?.email) {
            uniqueCustomers.add(order.shipping_address.email);
          }
        });

        setStats({
          totalRevenue: revenue,
          totalOrders: orders.length,
          activeCustomers: uniqueCustomers.size,
          avgOrderValue: orders.length > 0 ? Math.floor(revenue / orders.length) : 0
        });

        setRecentOrders(orders.slice(0, 5)); // Top 5 recent orders
      }

      // Fetch Products for Low Stock
      const { data: products } = await supabase
        .from('products')
        .select('id, name, stock')
        .order('stock', { ascending: true })
        .limit(5);

      if (products) {
        setLowStock(products.filter(p => p.stock !== null && p.stock <= 5));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const STATS_CARDS = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-green-100 text-green-700' },
    { label: 'Total Orders', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'bg-blue-100 text-blue-700' },
    { label: 'Active Customers', value: stats.activeCustomers.toString(), icon: Users, color: 'bg-purple-100 text-purple-700' },
    { label: 'Avg. Order Value', value: `₹${stats.avgOrderValue.toLocaleString('en-IN')}`, icon: TrendingUp, color: 'bg-orange-100 text-orange-700' },
  ];
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
        {STATS_CARDS.map((stat, i) => {
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
              </div>
              <h3 className="text-gray-300 text-sm font-medium">{stat.label}</h3>
              <p className="text-2xl font-bold text-white mt-1">{isLoading ? '...' : stat.value}</p>
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
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-300">Loading...</td>
                  </tr>
                ) : recentOrders.length > 0 ? (
                  recentOrders.map((order) => {
                    const d = order.data;
                    const customerName = `${d.customer?.firstName || ''} ${d.customer?.lastName || ''}`.trim();
                    return (
                      <tr key={order.id} className="text-sm border-b border-[var(--color-primary)] border-opacity-10 hover:bg-gray-800/50">
                        <td className="py-3 font-medium text-[var(--color-primary)]">{order.id}</td>
                        <td className="py-3 text-white">{customerName}</td>
                        <td className="py-3 text-gray-300">{new Date(d.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</td>
                        <td className="py-3 font-bold text-white">₹{d.grandTotal?.toLocaleString('en-IN')}</td>
                        <td className="py-3">
                          <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold ${
                            d.status === 'CONFIRMED' ? 'bg-green-900 text-green-200' :
                            d.status === 'CANCELLED' ? 'bg-red-900 text-red-200' :
                            'bg-yellow-900 text-yellow-200'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-300">
                      No orders have been placed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {recentOrders.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--color-primary)] border-opacity-30 text-center">
                <Link href="/admin/orders" className="text-sm font-medium text-[var(--color-primary)] hover:underline">
                  View All Orders &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Alerts & Low Stock */}
        <div className="space-y-6">
          <div className="bg-gray-900 text-white p-6 rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm border-l-4 border-l-red-500">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-white">
              <AlertCircle className="text-red-500 w-5 h-5" /> Low Stock Alerts
            </h2>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-sm text-gray-300">Loading...</div>
              ) : lowStock.length > 0 ? lowStock.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-sm text-gray-200">{item.name}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${item.stock === 0 ? 'bg-red-900 text-red-200' : 'bg-orange-900 text-orange-200'}`}>
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
