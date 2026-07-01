'use client';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getCartTotal } = useCartStore();

  const total = getCartTotal();
  const gst = total * 0.12; // Assuming 12% GST for sarees
  const shipping = total > 5000 ? 0 : 250;
  const grandTotal = total + gst + shipping;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your cart is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">Looks like you haven't added any elegant sarees to your cart yet.</p>
        <Link href="/shop" className="bg-[var(--color-primary)] hover:bg-[#600000] text-white px-8 py-3 rounded-md font-medium transition-colors shadow-md">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Shopping Cart</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items List */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-500 uppercase tracking-wider">
              <div className="sm:col-span-6">Product</div>
              <div className="sm:col-span-2 text-center">Price</div>
              <div className="sm:col-span-2 text-center">Quantity</div>
              <div className="sm:col-span-2 text-right">Total</div>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {items.map((item) => (
                <motion.div 
                  layout
                  key={item.id} 
                  className="p-4 sm:grid sm:grid-cols-12 gap-4 items-center flex flex-col sm:flex-row"
                >
                  <div className="sm:col-span-6 flex items-center gap-4 w-full">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="w-20 h-24 rounded-md overflow-hidden shrink-0 bg-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <Link href={`/product/${item.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-[var(--color-primary)] transition-colors line-clamp-2">
                        {item.name}
                      </Link>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2 text-center w-full sm:w-auto flex justify-between sm:block mt-4 sm:mt-0">
                    <span className="sm:hidden text-gray-500">Price:</span>
                    <span className="font-medium">₹{item.price.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="sm:col-span-2 flex justify-center w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="px-3 py-1 text-gray-500 hover:text-[var(--color-primary)]"
                      >-</button>
                      <input 
                        type="number" 
                        value={item.quantity}
                        readOnly
                        className="w-10 text-center bg-transparent border-none p-0 text-sm focus:ring-0" 
                      />
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-3 py-1 text-gray-500 hover:text-[var(--color-primary)]"
                      >+</button>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2 text-right w-full sm:w-auto flex justify-between sm:block mt-4 sm:mt-0">
                    <span className="sm:hidden text-gray-500">Total:</span>
                    <span className="font-bold text-[var(--color-primary)]">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">GST (12%)</span>
                <span className="font-medium text-gray-900 dark:text-white">₹{gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {shipping === 0 ? <span className="text-green-500 uppercase text-xs font-bold tracking-wider">Free</span> : `₹${shipping.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mb-6 flex justify-between items-center">
              <span className="text-base font-bold text-gray-900 dark:text-white">Grand Total</span>
              <span className="text-2xl font-bold text-[var(--color-primary)]">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>

            <Link href="/checkout" className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] hover:bg-[#600000] text-white py-4 rounded-lg font-bold transition-colors shadow-lg">
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Link>
            
            <div className="mt-4 flex flex-col gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Coupon Code" 
                  className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg py-3 px-4 text-sm focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)]"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-3 rounded-md font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
