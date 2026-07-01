'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, SlidersHorizontal } from 'lucide-react';

// Mock data for initial UI
const MOCK_PRODUCTS = [
  { id: '1', name: 'Kanjivaram Silk Saree', price: 15999, image: 'https://images.unsplash.com/photo-1610189013233-0c46643fc08a?q=80&w=600&auto=format&fit=crop', category: 'Silk', color: 'Maroon' },
  { id: '2', name: 'Banarasi Brocade Saree', price: 12500, image: 'https://images.unsplash.com/photo-1583391733958-d150dcddf723?q=80&w=600&auto=format&fit=crop', category: 'Banarasi', color: 'Gold' },
  { id: '3', name: 'Pure Cotton Handloom', price: 3500, image: 'https://images.unsplash.com/photo-1596455607563-ad6193f78b78?q=80&w=600&auto=format&fit=crop', category: 'Cotton', color: 'Blue' },
  { id: '4', name: 'Organza Party Wear', price: 8900, image: 'https://images.unsplash.com/photo-1617261313411-9653195f1fa4?q=80&w=600&auto=format&fit=crop', category: 'Organza', color: 'Pink' },
  { id: '5', name: 'Chiffon Elegance', price: 6200, image: 'https://images.unsplash.com/photo-1589465885857-44edb59bbff2?q=80&w=600&auto=format&fit=crop', category: 'Chiffon', color: 'Green' },
  { id: '6', name: 'Bridal Heavy Work', price: 25000, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop', category: 'Silk', color: 'Red' },
];

export default function ShopPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
      
      {/* Mobile Filter Toggle */}
      <div className="md:hidden flex justify-between items-center w-full mb-4">
        <h1 className="text-2xl font-bold">All Sarees</h1>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-md"
        >
          <SlidersHorizontal className="w-5 h-5" /> Filters
        </button>
      </div>

      {/* Sidebar Filters */}
      <aside className={`w-full md:w-1/4 ${isFilterOpen ? 'block' : 'hidden'} md:block`}>
        <div className="sticky top-24 bg-white dark:bg-[#121212] p-6 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Filter className="w-5 h-5" /> Filters
          </h2>
          
          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="font-semibold mb-3 flex justify-between items-center cursor-pointer">
                Fabric <ChevronDown className="w-4 h-4" />
              </h3>
              <div className="space-y-2">
                {['Silk', 'Cotton', 'Banarasi', 'Organza', 'Chiffon'].map(category => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                    <span className="text-gray-600 dark:text-gray-300">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold mb-3 flex justify-between items-center cursor-pointer">
                Price <ChevronDown className="w-4 h-4" />
              </h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="price" className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className="text-gray-600 dark:text-gray-300">Under ₹5,000</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="price" className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className="text-gray-600 dark:text-gray-300">₹5,000 - ₹15,000</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="price" className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className="text-gray-600 dark:text-gray-300">Over ₹15,000</span>
                </label>
              </div>
            </div>

            {/* Color Filter */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <h3 className="font-semibold mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {['#800000', '#FFD700', '#50C878', '#4169E1', '#FF00FF', '#1A1A1A'].map(color => (
                  <button 
                    key={color} 
                    className="w-8 h-8 rounded-full border-2 border-transparent hover:border-gray-400 focus:border-gray-900 dark:focus:border-white transition-all shadow-sm"
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Product Grid */}
      <div className="w-full md:w-3/4">
        <div className="hidden md:flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Sarees</h1>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Sort by:</span>
            <select className="bg-white dark:bg-[#121212] border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] p-2">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PRODUCTS.map((product) => (
            <motion.div 
              key={product.id}
              whileHover={{ y: -5 }}
              className="bg-white dark:bg-[#121212] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
            >
              <Link href={`/product/${product.id}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Quick Add Button */}
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white/90 dark:bg-black/90 text-gray-900 dark:text-white backdrop-blur-sm px-6 py-2 rounded-full font-medium shadow-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                      Quick View
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
                  <div className="mt-2 text-[var(--color-primary)] font-bold">₹{product.price.toLocaleString('en-IN')}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
