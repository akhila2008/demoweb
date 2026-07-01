'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Background Image - Using a gradient placeholder since actual images aren't provided yet */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#800000] via-[#500000] to-black z-0">
          <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg"
          >
            The Essence of <br/><span className="text-[var(--color-indian-gold)]">True Indian Heritage</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg md:text-xl text-gray-200 mb-10 max-w-2xl mx-auto drop-shadow-md"
          >
            Discover our premium collection of handcrafted sarees, blending traditional elegance with modern sophistication.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Link href="/shop" className="inline-block bg-[var(--color-indian-gold)] text-gray-900 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-[#E6C200] transition-all transform hover:-translate-y-1">
              Explore Collections
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Collections Section */}
      <section className="py-20 bg-[var(--background)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">Curated Collections</h2>
            <div className="w-24 h-1 bg-[var(--color-primary)] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Collection Card 1 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 flex flex-col justify-end p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Bridal Silk</h3>
                <Link href="/shop?category=bridal" className="text-[var(--color-indian-gold)] font-medium group-hover:underline">Shop Now &rarr;</Link>
              </div>
              <div className="absolute inset-0 bg-[#800000] opacity-80 group-hover:scale-105 transition-transform duration-700"></div>
            </motion.div>

            {/* Collection Card 2 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 flex flex-col justify-end p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Banarasi Heritage</h3>
                <Link href="/shop?category=banarasi" className="text-[var(--color-indian-gold)] font-medium group-hover:underline">Shop Now &rarr;</Link>
              </div>
              <div className="absolute inset-0 bg-[#4169E1] opacity-80 group-hover:scale-105 transition-transform duration-700"></div>
            </motion.div>

            {/* Collection Card 3 */}
            <motion.div 
              whileHover={{ y: -10 }}
              className="relative rounded-2xl overflow-hidden aspect-[3/4] group cursor-pointer shadow-md"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 flex flex-col justify-end p-8">
                <h3 className="text-2xl font-bold text-white mb-2">Cotton Everyday</h3>
                <Link href="/shop?category=cotton" className="text-[var(--color-indian-gold)] font-medium group-hover:underline">Shop Now &rarr;</Link>
              </div>
              <div className="absolute inset-0 bg-[#50C878] opacity-80 group-hover:scale-105 transition-transform duration-700"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-gray-50 dark:bg-[#1A1A1A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900 dark:text-white">Crafted with Passion & Tradition</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
              Every saree in our collection tells a story. Woven by master artisans across India, our pieces are more than just clothing—they are a celebration of centuries-old techniques passed down through generations.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full mr-3"></span> Authentic Handloom
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full mr-3"></span> Premium Quality Fabrics
              </li>
              <li className="flex items-center text-gray-700 dark:text-gray-300">
                <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full mr-3"></span> Direct from Weavers
              </li>
            </ul>
            <Link href="/about" className="text-[var(--color-primary)] font-semibold hover:underline">Read Our Story &rarr;</Link>
          </div>
          <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FF00FF] to-[#800000] opacity-80"></div>
            {/* Placeholder for a beautiful image */}
            <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
              [Brand Image Video/Hero]
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
