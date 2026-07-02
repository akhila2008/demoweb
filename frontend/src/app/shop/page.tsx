'use client';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { loadProducts } from '@/lib/storage';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Filter, ChevronDown, SlidersHorizontal, Check, Heart } from 'lucide-react';
import { AVAILABLE_COLORS } from '@/lib/colors';
import { useWishlist } from '@/context/WishlistContext';

import { useSearchParams } from 'next/navigation';

function ShopContent() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search')?.toLowerCase() || '';
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [pendingFilters, setPendingFilters] = useState({ fabrics: [] as string[], price: '', colors: [] as string[], occasions: [] as string[] });
  const [activeFilters, setActiveFilters] = useState({ fabrics: [] as string[], price: '', colors: [] as string[], occasions: [] as string[] });

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

  const handleFabricToggle = (fabric: string) => {
    setPendingFilters(prev => ({
      ...prev,
      fabrics: prev.fabrics.includes(fabric) 
        ? prev.fabrics.filter(f => f !== fabric) 
        : [...prev.fabrics, fabric]
    }));
  };

  const handleColorToggle = (color: string) => {
    setPendingFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color) 
        ? prev.colors.filter(c => c !== color) 
        : [...prev.colors, color]
    }));
  };

  const handleOccasionToggle = (occasion: string) => {
    setPendingFilters(prev => ({
      ...prev,
      occasions: prev.occasions.includes(occasion) 
        ? prev.occasions.filter(o => o !== occasion) 
        : [...prev.occasions, occasion]
    }));
  };

  const applyFilters = () => {
    setActiveFilters(pendingFilters);
    if (window.innerWidth < 768) setIsFilterOpen(false); // Close mobile filter
  };

  const clearFilters = () => {
    const emptyFilters = { fabrics: [], price: '', colors: [], occasions: [] };
    setPendingFilters(emptyFilters);
    setActiveFilters(emptyFilters);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Fabric filter
      if (activeFilters.fabrics.length > 0 && !activeFilters.fabrics.includes(p.category)) return false;
      
      // Price filter
      if (activeFilters.price === 'under_5000' && p.price >= 5000) return false;
      if (activeFilters.price === '5000_15000' && (p.price < 5000 || p.price > 15000)) return false;
      if (activeFilters.price === 'over_15000' && p.price <= 15000) return false;

      // Color filter
      if (activeFilters.colors.length > 0) {
        if (!p.colors || p.colors.length === 0) return false;
        const hasMatchingColor = activeFilters.colors.some((c: string) => p.colors.includes(c));
        if (!hasMatchingColor) return false;
      }

      // Occasion filter
      if (activeFilters.occasions.length > 0) {
        if (!p.occasions || p.occasions.length === 0) return false;
        const hasMatchingOccasion = activeFilters.occasions.some((o: string) => p.occasions.includes(o));
        if (!hasMatchingOccasion) return false;
      }

      // Search query filter
      if (searchParam) {
        const matchesName = p.name.toLowerCase().includes(searchParam);
        const matchesCategory = p.category.toLowerCase().includes(searchParam);
        const matchesColor = p.colors?.some((c: string) => c.toLowerCase().includes(searchParam));
        if (!matchesName && !matchesCategory && !matchesColor) return false;
      }

      return true;
    });
  }, [products, activeFilters, searchParam]);

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
        <div className="sticky top-24 bg-gray-900 p-6 rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm">
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
                  <label key={category} className="flex items-center space-x-2 cursor-pointer group">
                    <div className={`w-5 h-5 border rounded flex items-center justify-center ${pendingFilters.fabrics.includes(category) ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-primary)] border-opacity-50 group-hover:border-[var(--color-primary)]'}`}>
                      {pendingFilters.fabrics.includes(category) && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={pendingFilters.fabrics.includes(category)}
                      onChange={() => handleFabricToggle(category)} 
                    />
                    <span className="text-gray-600 dark:text-gray-300">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Occasion Filter */}
            <div className="pt-4 border-t border-[var(--color-primary)] border-opacity-30">
              <h3 className="font-semibold mb-3 flex justify-between items-center cursor-pointer">
                Occasion <ChevronDown className="w-4 h-4" />
              </h3>
              <div className="space-y-2">
                {['Party', 'Daily Wear', 'Wedding', 'Haldi', 'Festive', 'Casual'].map(occasion => (
                  <label key={occasion} className="flex items-center space-x-2 cursor-pointer group">
                    <div className={`w-5 h-5 border rounded flex items-center justify-center ${pendingFilters.occasions.includes(occasion) ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[var(--color-primary)] border-opacity-50 group-hover:border-[var(--color-primary)]'}`}>
                      {pendingFilters.occasions.includes(occasion) && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={pendingFilters.occasions.includes(occasion)}
                      onChange={() => handleOccasionToggle(occasion)} 
                    />
                    <span className="text-gray-600 dark:text-gray-300">{occasion}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="pt-4 border-t border-[var(--color-primary)] border-opacity-30">
              <h3 className="font-semibold mb-3 flex justify-between items-center cursor-pointer">
                Price <ChevronDown className="w-4 h-4" />
              </h3>
              <div className="space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="price" checked={pendingFilters.price === 'under_5000'} onChange={() => setPendingFilters(prev => ({...prev, price: 'under_5000'}))} className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className="text-gray-600 dark:text-gray-300">Under ₹5,000</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="price" checked={pendingFilters.price === '5000_15000'} onChange={() => setPendingFilters(prev => ({...prev, price: '5000_15000'}))} className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className="text-gray-600 dark:text-gray-300">₹5,000 - ₹15,000</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="radio" name="price" checked={pendingFilters.price === 'over_15000'} onChange={() => setPendingFilters(prev => ({...prev, price: 'over_15000'}))} className="text-[var(--color-primary)] focus:ring-[var(--color-primary)]" />
                  <span className="text-gray-600 dark:text-gray-300">Over ₹15,000</span>
                </label>
                <button type="button" onClick={() => setPendingFilters(prev => ({...prev, price: ''}))} className="text-xs text-[var(--color-primary)] hover:underline mt-2 inline-block">Clear Price Selection</button>
              </div>
            </div>

            {/* Color Filter */}
            <div className="pt-4 border-t border-[var(--color-primary)] border-opacity-30">
              <h3 className="font-semibold mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_COLORS.map(color => (
                  <button 
                    key={color.name} 
                    onClick={() => handleColorToggle(color.name)}
                    className={`w-8 h-8 rounded-full border-2 transition-all shadow-sm flex items-center justify-center ${pendingFilters.colors.includes(color.name) ? 'border-gray-900 dark:border-white scale-110' : 'border-transparent hover:border-gray-400'}`}
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Color ${color.name}`}
                    title={color.name}
                  >
                    {pendingFilters.colors.includes(color.name) && (
                      <Check className={`w-4 h-4 ${['White', 'Cream', 'Silver', 'Yellow'].includes(color.name) ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="pt-6 mt-6 border-t border-[var(--color-primary)] border-opacity-30 flex flex-col gap-3">
              <button 
                onClick={applyFilters}
                className="w-full bg-[var(--color-primary)] hover:bg-[#600000] text-white py-3 rounded-lg font-medium transition-colors shadow-md"
              >
                Apply Filters
              </button>
              <button 
                onClick={clearFilters}
                className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-300 py-3 rounded-lg font-medium transition-colors"
              >
                Clear All
              </button>
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
            <select className="bg-gray-900 border border-[var(--color-primary)] border-opacity-50 text-gray-300 text-sm rounded-md focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] p-2">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest Arrivals</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 text-center">
              <p className="text-xl text-gray-500 mb-4">No sarees match your selected filters.</p>
              <button onClick={clearFilters} className="text-[var(--color-primary)] hover:underline font-medium">Clear Filters</button>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <motion.div 
                key={product.id}
                whileHover={{ y: -5 }}
                className="bg-gray-900 rounded-xl overflow-hidden border border-[var(--color-primary)] border-opacity-30 shadow-sm hover:shadow-md transition-all group"
              >
                <Link href={`/product/${product.id}`}>
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
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
                      <button className="bg-black/90 text-white backdrop-blur-sm px-6 py-2 rounded-full font-medium shadow-lg hover:bg-[var(--color-primary)] hover:text-white transition-colors">
                        Quick View
                      </button>
                    </div>
                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                         onClick={(e) => { 
                           e.preventDefault(); 
                           e.stopPropagation();
                           toggleWishlist({
                             id: product.id,
                             name: product.name,
                             price: product.price,
                             originalPrice: product.originalPrice,
                             image: product.image
                           }); 
                         }}
                         className="p-2 bg-black/80 backdrop-blur-md rounded-full shadow-md hover:scale-110 transition-transform"
                      >
                        <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300 hover:text-red-500'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col h-full justify-between">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">{product.category}</div>
                    <h3 className="font-semibold text-white truncate">{product.name}</h3>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-[var(--color-primary)] font-bold">₹{product.price.toLocaleString('en-IN')}</div>
                    
                    {product.colors && product.colors.length > 0 && (
                      <div className="flex gap-1">
                        {product.colors.slice(0, 3).map((colorName: string) => {
                          const hex = AVAILABLE_COLORS.find(c => c.name === colorName)?.hex || '#ccc';
                          return (
                            <div 
                              key={colorName}
                              className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm"
                              style={{ backgroundColor: hex }}
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

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">Loading products...</div>}>
      <ShopContent />
    </Suspense>
  );
}
