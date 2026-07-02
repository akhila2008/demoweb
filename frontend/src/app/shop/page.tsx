'use client';
import { useState, useEffect } from 'react';
import { loadProducts } from '@/lib/storage';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, SlidersHorizontal } from 'lucide-react';

// Mock data for initial UI (now loaded dynamically)
const INITIAL_PRODUCTS: any[] = [];

export default function ShopPage() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<any[]>(INITIAL_PRODUCTS);

  useEffect(() => {
    // Sync with products added in the admin panel via IndexedDB
    const fetchInitialData = async () => {
      try {
        const savedProducts = await loadProducts();
        if (savedProducts && savedProducts.length > 0) {
          setProducts(savedProducts);
        }
      } catch (e) {
        console.error('Failed to load products in shop', e);
      }
    };
    
    fetchInitialData();
    
    // Listen for cross-component updates
    const handleUpdate = () => fetchInitialData();
    window.addEventListener('akhila_products_updated', handleUpdate);
    return () => window.removeEventListener('akhila_products_updated', handleUpdate);
  }, []);

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
                {['Silk', 'Cotton', 'Banarasi', 'Organza', 'Chiffon', 'Georgette'].map(category => (
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
          {products.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl text-gray-500 mb-4">No sarees available at the moment.</p>
              <p className="text-gray-400">Please check back soon for our new collection!</p>
            </div>
          ) : (
            products.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-[#121212] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
              >
                <Link href={`/product/${product.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900">
                    {product.isVideo ? (
                      <video 
                        src={product.image} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                      />
                    ) : (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    {/* Quick Add Button */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="bg-white/90 dark:bg-black/90 text-gray-900 dark:text-white backdrop-blur-sm px-6 py-2 rounded-full font-medium shadow-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                        Quick View
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col h-full justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{product.name}</h3>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[var(--color-primary)] font-bold">₹{product.price.toLocaleString('en-IN')}</div>
                    
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex gap-1">
                        {product.colors.slice(0, 3).map((colorName: string) => {
                          // Simple mapping for demo purposes. Real app would share the const array
                          const hexMap: Record<string, string> = {
                            'Red': '#EF4444', 'Maroon': '#800000', 'Blue': '#3B82F6', 
                            'Green': '#10B981', 'Gold': '#F59E0B', 'Pink': '#EC4899', 
                            'Purple': '#8B5CF6', 'Black': '#1F2937'
                          };
                          return (
                            <div 
                              key={colorName}
                              className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm"
                              style={{ backgroundColor: hexMap[colorName] || '#ccc' }}
                              title={colorName}
                            />
                          );
                        })}
                        {product.colors.length > 3 && (
                          <div className="w-3.5 h-3.5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-[8px] text-gray-500 border border-gray-200 dark:border-gray-700">
                            +
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
