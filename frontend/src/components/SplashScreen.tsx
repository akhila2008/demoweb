'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Only show the splash screen once per session
    const hasSeenSplash = sessionStorage.getItem('has_seen_splash');
    if (!hasSeenSplash) {
      setShowSplash(true);
      sessionStorage.setItem('has_seen_splash', 'true');
      
      // Force hide it just in case animation gets stuck, so it doesn't block the site
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showSplash) return null;

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden pointer-events-auto"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, delay: 3.5 }}
        >
          {/* Namaskaram Lady (Background) */}
          <motion.div 
            className="absolute inset-0 z-0 flex flex-col items-center justify-center bg-[#0a0500]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2, delay: 1 }}
          >
            <img 
              src="/namaskaram_lady.jpg" 
              alt="Welcome" 
              className="w-full h-full object-contain opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/80 opacity-80"></div>
            
            <motion.div 
              className="absolute bottom-20 text-center z-10"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 2 }}
            >
              <h1 className="text-5xl md:text-7xl font-brand text-[#D4AF37] mb-2 drop-shadow-2xl">Namaskaram</h1>
              <p className="text-xl text-gray-300 tracking-widest uppercase">Welcome to Akhila Sarees</p>
            </motion.div>
          </motion.div>

          {/* Left Door */}
          <motion.div 
            className="absolute top-0 left-0 bottom-0 w-1/2 z-10 bg-[#3e2723] border-r-4 border-[#5d4037] shadow-[10px_0_30px_rgba(0,0,0,0.8)]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 40px,
                rgba(0,0,0,0.2) 40px,
                rgba(0,0,0,0.2) 42px
              ), url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 h80 v80 h-80 z' fill='none' stroke='%235d4037' stroke-width='4'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23D4AF37' stroke-width='2' opacity='0.3'/%3E%3C/svg%3E")`,
              backgroundSize: '100% 100%, 200px 200px'
            }}
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{ duration: 2.5, ease: [0.6, 0.01, -0.05, 0.9], delay: 0.5 }}
          >
            {/* Door handle / accents */}
            <div className="absolute top-1/2 right-4 w-4 h-32 bg-[#D4AF37] rounded-full shadow-lg transform -translate-y-1/2 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#8c7324] border-2 border-[#D4AF37]"></div>
            </div>
          </motion.div>

          {/* Right Door */}
          <motion.div 
            className="absolute top-0 right-0 bottom-0 w-1/2 z-10 bg-[#3e2723] border-l-4 border-[#5d4037] shadow-[-10px_0_30px_rgba(0,0,0,0.8)]"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 40px,
                rgba(0,0,0,0.2) 40px,
                rgba(0,0,0,0.2) 42px
              ), url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 10 h80 v80 h-80 z' fill='none' stroke='%235d4037' stroke-width='4'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23D4AF37' stroke-width='2' opacity='0.3'/%3E%3C/svg%3E")`,
              backgroundSize: '100% 100%, 200px 200px'
            }}
            initial={{ x: 0 }}
            animate={{ x: "100%" }}
            transition={{ duration: 2.5, ease: [0.6, 0.01, -0.05, 0.9], delay: 0.5 }}
          >
            {/* Door handle / accents */}
            <div className="absolute top-1/2 left-4 w-4 h-32 bg-[#D4AF37] rounded-full shadow-lg transform -translate-y-1/2 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#8c7324] border-2 border-[#D4AF37]"></div>
            </div>
          </motion.div>

          {/* Center split line that disappears instantly */}
          <motion.div 
            className="absolute top-0 bottom-0 left-1/2 w-1 bg-black z-20 transform -translate-x-1/2"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.1, delay: 0.5 }}
          />

        </motion.div>
      )}
    </AnimatePresence>
  );
}
