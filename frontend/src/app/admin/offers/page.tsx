'use client';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  const [newOffer, setNewOffer] = useState({
    title: '',
    code: '',
    discount: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        // Extract the nested 'data' object for state
        setOffers(data.map(d => ({ ...d.data, db_id: d.id })));
      }
    } catch (e) {
      console.error('Failed to load offers from database', e);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOffer.title || !newOffer.discount) return;
    
    let imageUrl = previewImage;

    // Optional: Upload image if a new file is selected
    if (previewImageFile) {
      const fileExt = previewImageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage.from('product-media').upload(fileName, previewImageFile);
      if (!error) {
        const { data: urlData } = supabase.storage.from('product-media').getPublicUrl(fileName);
        imageUrl = urlData.publicUrl;
      }
    }
    
    if (editingOfferId) {
      const updatedOfferData = {
        id: editingOfferId,
        title: newOffer.title,
        code: newOffer.code ? newOffer.code.trim().toUpperCase() : '',
        discount: newOffer.discount,
        status: newOffer.status,
        image: imageUrl || null
      };

      const { error } = await supabase.from('offers').update({ data: updatedOfferData }).eq('id', editingOfferId);
      if (!error) {
        setOffers(offers.map(o => o.id === editingOfferId ? { ...o, ...updatedOfferData } : o));
      }
    } else {
      const newId = Math.random().toString(36).substr(2, 9);
      const addedOfferData = {
        id: newId,
        title: newOffer.title,
        code: newOffer.code ? newOffer.code.trim().toUpperCase() : '',
        discount: newOffer.discount,
        status: newOffer.status,
        image: imageUrl || null
      };
      
      const { error } = await supabase.from('offers').insert([{ id: newId, data: addedOfferData }]);
      if (!error) {
        setOffers([...offers, addedOfferData]);
      }
    }

    resetForm();
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return;
    
    const { error } = await supabase.from('offers').delete().eq('id', offerId);
    if (!error) {
      setOffers(offers.filter(o => o.id !== offerId));
    } else {
      console.error('Failed to delete offer:', error);
      alert('Failed to delete offer from database.');
    }
  };

  const resetForm = () => {
    setIsAddModalOpen(false);
    setEditingOfferId(null);
    setNewOffer({ title: '', code: '', discount: '', status: 'Active' });
    setPreviewImage(null);
    setPreviewImageFile(null);
  };

  const openEditModal = (offer: any) => {
    setEditingOfferId(offer.id);
    setNewOffer({
      title: offer.title,
      code: offer.code || '',
      discount: offer.discount,
      status: offer.status || 'Active'
    });
    setPreviewImage(offer.image);
    setPreviewImageFile(offer.imageFile || null);
    setIsAddModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Offers & Coupons</h1>
          <p className="text-gray-300">Manage your sales, promotional banners, and discount codes.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="bg-[var(--color-primary)] hover:bg-[#600000] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add New Offer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-gray-900 rounded-xl border border-[var(--color-primary)] border-opacity-30">
            <Tag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">No offers available</h3>
            <p className="text-gray-300">Click "Add New Offer" to create your first promotion.</p>
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="bg-gray-900 text-white rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm overflow-hidden flex flex-col">
              {offer.image ? (
                <div className="h-40 w-full bg-gray-100 overflow-hidden">
                  <img src={offer.image} alt={offer.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-40 w-full bg-gray-800 flex items-center justify-center">
                  <Tag className="w-12 h-12 text-gray-200" />
                </div>
              )}
              
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{offer.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      offer.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {offer.status}
                    </span>
                  </div>
                  
                  <div className="text-2xl font-black text-[var(--color-primary)] mb-4">
                    {offer.discount}
                  </div>
                  
                  {offer.code && (
                    <div className="inline-block border-2 border-dashed border-[var(--color-primary)] border-opacity-50 rounded-md px-3 py-1 bg-gray-50 bg-gray-900 text-white text-sm font-mono tracking-wider font-bold mb-4">
                      {offer.code}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-primary)] border-opacity-30 mt-4">
                  <button 
                    onClick={() => openEditModal(offer)}
                    className="text-blue-600 hover:text-blue-800 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteOffer(offer.id)}
                    className="text-red-600 hover:text-red-800 bg-red-50 dark:bg-red-900/20 p-2 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Offer Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 text-white rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-[var(--color-primary)] border-opacity-30 flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingOfferId ? 'Edit Offer' : 'Add New Offer'}</h2>
                <button onClick={resetForm} className="text-gray-300 hover:text-gray-800 dark:hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddOffer} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Banner Image (Optional)</label>
                  <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--color-primary)] border-opacity-50 border-dashed rounded-md hover:border-[var(--color-primary)] transition-colors cursor-pointer relative w-full">
                    <div className="space-y-1 text-center w-full">
                      {previewImage ? (
                        <div className="w-full h-32 mx-auto rounded overflow-hidden relative">
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <svg className="mx-auto h-12 w-12 text-gray-200" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <div className="flex text-sm text-gray-200 justify-center mt-2">
                        <span className="font-medium text-[var(--color-primary)] hover:text-[#600000]">Click to upload a banner</span>
                        <input type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Offer Title</label>
                  <input 
                    required
                    type="text" 
                    value={newOffer.title}
                    onChange={(e) => setNewOffer({...newOffer, title: e.target.value})}
                    className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]" 
                    placeholder="e.g. Diwali Mega Sale"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Discount Details</label>
                    <input 
                      required
                      type="text" 
                      value={newOffer.discount}
                      onChange={(e) => setNewOffer({...newOffer, discount: e.target.value})}
                      className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]" 
                      placeholder="e.g. 50% OFF"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Coupon Code (Optional)</label>
                    <input 
                      type="text" 
                      value={newOffer.code}
                      onChange={(e) => setNewOffer({...newOffer, code: e.target.value.toUpperCase()})}
                      className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)] font-mono uppercase" 
                      placeholder="DIWALI50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select 
                    value={newOffer.status}
                    onChange={(e) => setNewOffer({...newOffer, status: e.target.value})}
                    className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white focus:ring-[var(--color-primary)]"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Upcoming">Upcoming</option>
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={resetForm}
                    className="flex-1 bg-gray-800 text-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[var(--color-primary)] hover:bg-[#600000] text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    {editingOfferId ? 'Update Offer' : 'Save Offer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
