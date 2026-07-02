import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-100 dark:bg-zinc-950 pt-16 pb-8 border-t border-[var(--color-primary)] border-opacity-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] font-brand">
              <img src="/logo.png" alt="Akhila Sarees Logo" className="h-10 w-10 object-contain mix-blend-multiply dark:mix-blend-screen rounded-full" />
              AKHILA SAREES
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Embrace the elegance of traditional Indian heritage with our premium collection of handcrafted sarees. Perfect for every occasion.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Shop</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/shop?category=new" className="hover:text-[var(--color-primary)] transition-colors">New Arrivals</Link></li>
              <li><Link href="/shop?category=bestsellers" className="hover:text-[var(--color-primary)] transition-colors">Best Sellers</Link></li>
              <li><Link href="/shop?category=wedding" className="hover:text-[var(--color-primary)] transition-colors">Wedding Collection</Link></li>
              <li><Link href="/shop?category=silk" className="hover:text-[var(--color-primary)] transition-colors">Silk Sarees</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/contact" className="hover:text-[var(--color-primary)] transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-[var(--color-primary)] transition-colors">FAQs</Link></li>
              <li><Link href="/shipping" className="hover:text-[var(--color-primary)] transition-colors">Shipping & Returns</Link></li>
              <li><Link href="/track" className="hover:text-[var(--color-primary)] transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Newsletter</h4>
            <p className="text-sm text-gray-400 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="px-4 py-2 bg-white dark:bg-gray-900 border border-[var(--color-primary)] border-opacity-50 rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] flex-grow text-sm"
              />
              <button 
                type="submit" 
                className="bg-[var(--color-primary)] hover:bg-[#600000] text-white px-4 py-2 rounded-md transition-colors text-sm font-medium"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-[var(--color-primary)] border-opacity-30 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            &copy; {new Date().getFullYear()} Akhila Sarees. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-500 dark:text-gray-500">
            <Link href="/privacy" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[var(--color-primary)] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
