'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('home_animated')) {
      setIsFirstVisit(true);
      sessionStorage.setItem('home_animated', 'true');
    }
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const baseDelay = isFirstVisit ? 4.2 : 0; // Wait for splash screen to finish if it's the first visit

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Deep Royal Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary)] via-[#7b1fa2] to-[var(--color-secondary)] z-0">
          {/* Subtle Mandala Background Image Overlay */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 50m-40 0a40 40 0 1 0 80 0a40 40 0 1 0 -80 0M50 20a30 30 0 1 0 0 60a30 30 0 1 0 0 -60M28 50a22 22 0 1 0 44 0a22 22 0 1 0 -44 0' fill='none' stroke='%23D4AF37' stroke-width='1.5' stroke-opacity='1'/%3E%3Cpath d='M50 10 L60 40 L90 50 L60 60 L50 90 L40 60 L10 50 L40 40 Z' fill='none' stroke='%23D4AF37' stroke-width='1' stroke-opacity='0.8'/%3E%3C/svg%3E\")", backgroundSize: '120px 120px', animation: 'spin 120s linear infinite'}}></div>
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto glass-panel p-12 rounded-3xl border border-white/20 shadow-2xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: baseDelay }}
          >
            <span className="text-[var(--color-indian-gold)] uppercase tracking-[0.3em] text-sm font-bold mb-4 block">Namaste & Welcome To</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, delay: baseDelay + 0.3, type: "spring", stiffness: 100 }}
            className="text-6xl md:text-8xl font-brand font-bold text-white mb-6 leading-tight drop-shadow-2xl"
          >
            Akhila Sarees
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: baseDelay + 0.6 }}
            className="text-lg md:text-2xl text-gray-100 mb-10 max-w-2xl mx-auto font-light tracking-wide"
          >
            Step into a world of royal elegance. Discover hand-woven masterpieces tailored for your most precious moments.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: baseDelay + 1.0 }}
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
            <h2 className="text-4xl md:text-5xl font-brand font-bold mb-4 text-[var(--color-primary)] dark:text-[var(--color-accent)]">Curated Collections</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Collection Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.5 }}
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
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Crafted with Passion & Tradition</h2>
            <p className="text-gray-200 mb-8 leading-relaxed text-lg">
              Every saree in our collection tells a story. Woven by master artisans across India, our pieces are more than just clothing—they are a celebration of centuries-old techniques passed down through generations.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-gray-300">
                <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full mr-3"></span> Authentic Handloom
              </li>
              <li className="flex items-center text-gray-300">
                <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full mr-3"></span> Premium Quality Fabrics
              </li>
              <li className="flex items-center text-gray-300">
                <span className="w-2 h-2 bg-[var(--color-primary)] rounded-full mr-3"></span> Direct from Weavers
              </li>
            </ul>
            <Link href="/about" className="text-[var(--color-primary)] font-semibold hover:underline">Read Our Story &rarr;</Link>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative h-96 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FF00FF] to-[#800000] opacity-80"></div>
            {/* Placeholder for a beautiful image */}
            <div className="absolute inset-0 flex items-center justify-center text-white font-medium">
              [Brand Image Video/Hero]
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
