'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, X, Search, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems } = useCart();

  const handleShareSite = async () => {
    const shareData = {
      title: 'Akhila Sarees',
      text: 'Check out these beautiful premium sarees at Akhila Sarees!',
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      alert('Website link copied to clipboard!');
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-indian-magenta)]">
              <img src="/logo.png?v=3" alt="Akhila Sarees Logo" className="h-16 w-16 object-contain mix-blend-multiply dark:mix-blend-screen dark:invert rounded-full" />
              AKHILA SAREES
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-accent)] font-medium transition-colors">
              Collections
            </Link>
            <Link href="/shop?category=wedding" className="text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-accent)] font-medium transition-colors">
              Wedding
            </Link>
            <Link href="/shop?category=silk" className="text-gray-700 dark:text-gray-300 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-accent)] font-medium transition-colors">
              Silk Sarees
            </Link>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button className="text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={handleShareSite} title="Share Website" className="text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <Link href="/cart" className="relative text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <Link href="/login" className="text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors">
              <User className="w-5 h-5" />
            </Link>
          </div>

          {/* Mobile menu and cart */}
          <div className="md:hidden flex items-center space-x-4">
            <Link href="/cart" className="relative text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-400 hover:text-[var(--color-primary)] focus:outline-none">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-white dark:bg-[#121212] border-b border-gray-200 dark:border-gray-800"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/shop" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
              Collections
            </Link>
            <Link href="/shop?category=wedding" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
              Wedding
            </Link>
            <Link href="/shop?category=silk" className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md">
              Silk Sarees
            </Link>
            <div className="flex space-x-6 px-3 py-4 border-t border-gray-200 dark:border-gray-800">
              <Link href="/login" className="flex items-center text-gray-600 dark:text-gray-400">
                <User className="w-5 h-5 mr-2" /> Profile
              </Link>
              <button onClick={handleShareSite} className="flex items-center text-gray-600 dark:text-gray-400">
                <Share2 className="w-5 h-5 mr-2" /> Share
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
