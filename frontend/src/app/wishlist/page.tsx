'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart, items: cartItems } = useCart();

  const handleAddToCart = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if already in cart
    if (cartItems.some(cartItem => cartItem.productId === item.id)) return;
    
    addToCart({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image,
      fabric: 'Silk' // fallback
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-4 mb-8">
        <Heart className="w-8 h-8 text-red-500 fill-current" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
        <span className="text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full text-sm font-medium">
          {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="text-center py-24 bg-gray-50 dark:bg-[#121212] rounded-2xl border border-gray-200 dark:border-gray-800">
          <Heart className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Save your favorite sarees here to buy them later. Explore our collection and click the heart icon to add items.
          </p>
          <Link href="/shop" className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#600000] transition-colors inline-block shadow-md">
            Explore Collection
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishlistItems.map((item) => {
            const isAddedToCart = cartItems.some(cItem => cItem.productId === item.id);
            
            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-[#121212] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group flex flex-col"
              >
                <Link href={`/product/${item.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100 dark:bg-gray-900">
                  {item.image.endsWith('.mp4') ? (
                    <video src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" autoPlay loop muted playsInline />
                  ) : (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  )}
                  
                  {/* Remove Button */}
                  <div className="absolute top-3 right-3 z-10">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist(item.id);
                      }}
                      className="p-2 bg-white/80 dark:bg-black/80 backdrop-blur-md rounded-full shadow-md text-gray-500 hover:text-red-500 transition-colors"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Link>
                
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate" title={item.name}>{item.name}</h3>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="text-[var(--color-primary)] font-bold">₹{item.price.toLocaleString('en-IN')}</div>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <div className="text-gray-400 line-through text-xs">₹{item.originalPrice.toLocaleString('en-IN')}</div>
                      )}
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => handleAddToCart(e, item)}
                    disabled={isAddedToCart}
                    className={`mt-4 w-full py-2.5 rounded-md font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                      isAddedToCart 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isAddedToCart ? 'Added to Cart' : 'Add to Cart'}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
