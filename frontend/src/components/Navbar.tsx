'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, User, Menu, X, Search, Share2, ArrowRight, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { totalItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

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
    <nav className="sticky top-0 z-50 w-full bg-black border-b border-[var(--color-primary)] border-opacity-30 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] font-brand">
              <img src="/logo.png?v=4" alt="Akhila Sarees Logo" className="h-16 w-16 object-contain mix-blend-screen rounded-full" />
              AKHILA SAREES
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-gray-300 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-accent)] font-medium transition-colors">
              Collections
            </Link>
            <Link href="/shop?category=wedding" className="text-gray-300 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-accent)] font-medium transition-colors">
              Wedding
            </Link>
            <Link href="/shop?category=silk" className="text-gray-300 hover:text-[var(--color-primary)] dark:hover:text-[var(--color-accent)] font-medium transition-colors">
              Silk Sarees
            </Link>
          </div>

          {/* Desktop Icons */}
          <div className="hidden md:flex items-center space-x-6">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <button onClick={handleShareSite} title="Share Website" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
            <Link href="/cart" className="relative text-gray-400 hover:text-[var(--color-primary)] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-[var(--color-primary)] focus:outline-none ml-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu and icons */}
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/cart" className="relative text-gray-400 hover:text-[var(--color-primary)] transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400 hover:text-[var(--color-primary)] focus:outline-none">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Expanding Search Bar (Desktop) */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSearchSubmit} className="py-4 border-t border-[var(--color-primary)] border-opacity-30 flex items-center gap-4">
                <div className="relative flex-grow">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for sarees, colors, or fabrics..." 
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-transparent focus:border-gray-300 dark:focus:border-gray-700 rounded-full outline-none transition-colors"
                    autoFocus
                  />
                </div>
                <button type="submit" className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:bg-[#600000] transition-colors shrink-0">
                  Search <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 w-full md:w-64 bg-gray-900 border-b md:border md:border-t-0 border-[var(--color-primary)] md:rounded-bl-xl shadow-2xl shadow-[var(--color-primary)]/20"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link href="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[var(--color-primary)] hover:bg-gray-800 rounded-md transition-colors">
              Home
            </Link>
            <div className="md:hidden">
              <Link href="/shop" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[var(--color-primary)] hover:bg-gray-800 rounded-md transition-colors">
                Collections
              </Link>
              <Link href="/shop?category=wedding" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[var(--color-primary)] hover:bg-gray-800 rounded-md transition-colors">
                Wedding
              </Link>
              <Link href="/shop?category=silk" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[var(--color-primary)] hover:bg-gray-800 rounded-md transition-colors">
                Silk Sarees
              </Link>
            </div>
            <Link href="/wishlist" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[var(--color-primary)] hover:bg-gray-800 rounded-md transition-colors flex justify-between items-center">
              <span>Wishlist</span>
              {wishlistItems.length > 0 && (
                <span className="bg-[var(--color-primary)] text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
            
            <div className="border-t border-gray-700 my-2"></div>
            
            {user ? (
              <Link href="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[var(--color-primary)] hover:bg-gray-800 rounded-md transition-colors">
                My Profile
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-gray-300 hover:text-[var(--color-primary)] hover:bg-gray-800 rounded-md transition-colors">
                  Log In
                </Link>
                <Link href="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-base font-medium text-[var(--color-primary)] hover:bg-gray-800 rounded-md transition-colors">
                  Sign Up
                </Link>
              </>
            )}
            
            <button onClick={() => { handleShareSite(); setIsOpen(false); }} className="w-full text-left block px-3 py-2 text-base font-medium text-gray-300 hover:text-[var(--color-primary)] hover:bg-gray-800 rounded-md transition-colors">
              Share Website
            </button>
          </div>
        </motion.div>
      )}
    </nav>
  );
}
