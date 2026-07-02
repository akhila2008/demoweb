'use client';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  
  const shipping = subtotal > 5000 ? 0 : 150; // Free shipping over ₹5000
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Looks like you haven't added anything to your cart yet. Discover our beautiful collection of premium sarees.
        </p>
        <Link 
          href="/shop" 
          className="bg-[var(--color-primary)] hover:bg-[#600000] text-white px-8 py-3 rounded-lg font-medium transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart ({totalItems})</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items List */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {items.map((item, index) => (
                <motion.li 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={item.id} 
                  className="p-6 flex flex-col sm:flex-row gap-6"
                >
                  <div className="w-24 h-32 shrink-0 bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden relative">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          <Link href={`/product/${item.productId}`} className="hover:text-[var(--color-primary)] transition-colors">
                            {item.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Color: {item.color}</p>
                      </div>
                      <p className="text-lg font-bold text-[var(--color-primary)]">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>

                    <div className="flex justify-between items-end mt-4 sm:mt-0">
                      <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md h-10 w-28">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 text-gray-600 hover:text-[var(--color-primary)]"
                        >-</button>
                        <span className="w-full text-center font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="px-3 text-gray-600 hover:text-[var(--color-primary)] disabled:opacity-50"
                        >+</button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 flex items-center text-sm font-medium transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-1" /> Remove
                      </button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl p-6 border border-gray-200 dark:border-gray-800 sticky top-28">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-500 text-right mt-1">Add items worth ₹{(5000 - subtotal).toLocaleString('en-IN')} more for free shipping!</p>
              )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-8">
              <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span className="text-[var(--color-primary)]">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
            </div>

            <button className="w-full bg-[var(--color-primary)] hover:bg-[#600000] text-white py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-lg">
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </button>

            <div className="mt-6 flex items-center justify-center text-sm text-gray-500 gap-2">
              <ShieldCheck className="w-5 h-5 text-green-600" />
              100% Secure Checkout
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
