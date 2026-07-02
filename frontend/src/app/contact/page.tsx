'use client';
import { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('akhila_store_settings');
    if (saved) {
      try {
        setStoreSettings(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const email = storeSettings?.email || 'contact@akhilasarees.com';
  const phone = storeSettings?.contactPhone || '+91 9876543210';
  const storeName = storeSettings?.storeName || 'Akhila Sarees';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-brand font-bold mb-4 text-[var(--color-primary)] dark:text-[var(--color-accent)]">Help Center & Contact Us</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] mx-auto rounded-full mb-6"></div>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          Have a question about our collections or need help with an order? We are here to assist you.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Information */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-8 rounded-3xl"
        >
          <h2 className="text-2xl font-bold text-white mb-8 font-brand">Get in Touch</h2>
          
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="bg-[var(--color-primary)]/10 p-3 rounded-full text-[var(--color-primary)] dark:text-[var(--color-accent)]">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Phone Support</h3>
                <p className="text-gray-400 mb-2">Mon-Fri from 9am to 6pm.</p>
                <a href={`tel:${phone}`} className="text-[var(--color-primary)] dark:text-[var(--color-accent)] font-medium hover:underline text-lg">
                  {phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[var(--color-primary)]/10 p-3 rounded-full text-[var(--color-primary)] dark:text-[var(--color-accent)]">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Email Us</h3>
                <p className="text-gray-400 mb-2">Our friendly team is here to help.</p>
                <a href={`mailto:${email}`} className="text-[var(--color-primary)] dark:text-[var(--color-accent)] font-medium hover:underline text-lg">
                  {email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[var(--color-primary)]/10 p-3 rounded-full text-[var(--color-primary)] dark:text-[var(--color-accent)]">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Office</h3>
                <p className="text-gray-400">
                  {storeName} Headquarters<br/>
                  123 Heritage Lane, Silk District<br/>
                  Hyderabad, Telangana 500001
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-[var(--color-primary)]/10 p-3 rounded-full text-[var(--color-primary)] dark:text-[var(--color-accent)]">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Business Hours</h3>
                <p className="text-gray-400">
                  Monday - Saturday: 10:00 AM - 8:00 PM<br/>
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-panel p-8 rounded-3xl"
        >
          <h2 className="text-2xl font-bold text-white mb-8 font-brand">Send us a Message</h2>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert('Message sent successfully!'); }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                <input type="text" className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-lg p-3 dark:bg-black/50 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all" placeholder="Jane" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                <input type="text" className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-lg p-3 dark:bg-black/50 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all" placeholder="Doe" required />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input type="email" className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-lg p-3 dark:bg-black/50 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all" placeholder="jane@example.com" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
              <textarea rows={5} className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-lg p-3 dark:bg-black/50 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all resize-none" placeholder="How can we help you?" required></textarea>
            </div>

            <button type="submit" className="w-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
              <Send className="w-5 h-5" /> Send Message
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
