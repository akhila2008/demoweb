'use client';
import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Filter, Clock, CheckCircle, Package, Truck, XCircle, MoreVertical } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setStatusUpdating(orderId);
    try {
      // Get the existing order data
      const order = orders.find(o => o.id === orderId);
      if (!order) return;
      
      const updatedData = { ...order.data, status: newStatus };
      
      const { error } = await supabase
        .from('orders')
        .update({ data: updatedData })
        .eq('id', orderId);
        
      if (error) throw error;
      
      // Update local state
      setOrders(orders.map(o => o.id === orderId ? { ...o, data: updatedData } : o));
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Failed to update order status');
    } finally {
      setStatusUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_VERIFICATION':
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock className="w-3 h-3" /> Pending</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle className="w-3 h-3" /> Confirmed</span>;
      case 'SHIPPED':
        return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Package className="w-3 h-3" /> Shipped</span>;
      case 'DELIVERED':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Truck className="w-3 h-3" /> Delivered</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><XCircle className="w-3 h-3" /> Cancelled</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const filteredOrders = orders.filter(order => {
    const searchStr = searchTerm.toLowerCase();
    const idMatch = order.id.toLowerCase().includes(searchStr);
    const nameMatch = `${order.data.customer?.firstName} ${order.data.customer?.lastName}`.toLowerCase().includes(searchStr);
    return idMatch || nameMatch;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-500">Manage and track customer orders.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-[#1A1A1A]">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Customer Name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="p-16 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          /* Empty State */
          <div className="p-16 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No orders found</h2>
            <p className="text-gray-500 max-w-md">
              {searchTerm ? 'Try adjusting your search terms.' : 'When customers place orders on your store, they will appear here.'}
            </p>
          </div>
        ) : (
          /* Orders Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-800">
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Order ID</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Date</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Customer</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Total</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Payment</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm">Status</th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 text-sm text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredOrders.map((order) => {
                  const d = order.data;
                  const customerName = `${d.customer?.firstName || ''} ${d.customer?.lastName || ''}`.trim();
                  const dateObj = new Date(d.date || order.created_at);
                  const dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                  const totalStr = `₹${(d.grandTotal || 0).toLocaleString('en-IN')}`;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors group">
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{order.id}</td>
                      <td className="p-4 text-sm text-gray-500">{dateStr}</td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-white">{customerName || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{d.customer?.email}</div>
                      </td>
                      <td className="p-4 font-bold text-gray-900 dark:text-white">{totalStr}</td>
                      <td className="p-4 text-sm text-gray-500">
                        {d.paymentMethod === 'ONLINE' ? 'UPI / Online' : 'Cash on Delivery'}
                      </td>
                      <td className="p-4">{getStatusBadge(d.status)}</td>
                      <td className="p-4 text-right">
                        <select 
                          className="text-sm border border-gray-300 dark:border-gray-700 rounded-md p-1.5 dark:bg-gray-900 opacity-50 group-hover:opacity-100 focus:opacity-100 transition-opacity disabled:opacity-50 cursor-pointer hover:border-[var(--color-primary)]"
                          value={d.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          disabled={statusUpdating === order.id}
                        >
                          <option value="PENDING_VERIFICATION">Pending Verification</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
