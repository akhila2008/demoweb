'use client';
import { useState } from 'react';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Kanjivaram Silk', price: 15999, stock: 12, category: 'Silk' },
  { id: '2', name: 'Banarasi Brocade', price: 12500, stock: 0, category: 'Banarasi' },
  { id: '3', name: 'Pure Cotton Handloom', price: 3500, stock: 45, category: 'Cotton' },
];

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products Management</h1>
          <p className="text-gray-500">Manage your saree inventory and categories.</p>
        </div>
        <button className="bg-[var(--color-primary)] hover:bg-[#600000] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-5 h-5" /> Add New Saree
        </button>
      </div>

      <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-[#1A1A1A]">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-4 dark:bg-gray-900 focus:ring-[var(--color-primary)] w-full sm:w-auto">
              <option>All Categories</option>
              <option>Silk</option>
              <option>Cotton</option>
              <option>Banarasi</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212]">
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {MOCK_PRODUCTS.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="p-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                  <td className="p-4 text-gray-500">{product.category}</td>
                  <td className="p-4 text-gray-900 dark:text-white font-medium">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.stock > 10 ? 'bg-green-100 text-green-700' : 
                      product.stock > 0 ? 'bg-orange-100 text-orange-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end gap-3">
                    <button className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-md transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm text-gray-500">
          <div>Showing 1 to 3 of 3 entries</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800" disabled>Previous</button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 bg-gray-50 text-gray-900 font-medium">1</button>
            <button className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
