'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AVAILABLE_COLORS } from '@/lib/colors';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';
import { addProduct, updateProduct, deleteProduct, deleteProductImage } from '@/app/actions/admin';

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    price: '', 
    stock: '', 
    category_id: '',
    description: '',
    groupId: '', 
    colors: [] as string[], 
    occasions: [] as string[] 
  });

  // Image State
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewImageFiles, setPreviewImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<{id: string, url: string}[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch Categories
      const { data: cats, error: catError } = await supabase.from('categories').select('*').order('name');
      if (catError) throw catError;
      setCategories(cats || []);

      if (cats && cats.length > 0 && !newProduct.category_id) {
        setNewProduct(prev => ({ ...prev, category_id: cats[0].id }));
      }

      // Fetch Products
      const { data: prods, error: prodError } = await supabase
        .from('products')
        .select(`
          id, name, price, stock, description, is_active, category_id,
          categories ( name ),
          product_images ( id, url, sort_order ),
          colors, occasions
        `)
        .order('created_at', { ascending: false });
      
      if (prodError) throw prodError;
      
      // Map to frontend expected shape
      const mapped = (prods || []).map(p => {
        const sortedImages = (p.product_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
        return {
          ...p,
          category: (p.categories as any)?.name,
          images: sortedImages,
          image: sortedImages.length > 0 ? sortedImages[0].url : '',
          colors: p.colors || [],
          occasions: p.occasions || []
        };
      });
      setProducts(mapped);
    } catch (error) {
      console.error('Error fetching admin products data:', error);
    }
  };

  const uploadImages = async (files: File[]) => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${ext}`;
      const { data, error } = await supabase.storage.from('product-media').upload(fileName, file);
      if (error) {
        console.error('Upload error:', error);
        continue;
      }
      const { data: { publicUrl } } = supabase.storage.from('product-media').getPublicUrl(fileName);
      urls.push(publicUrl);
    }
    return urls;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length > 0) {
      const updatedFiles = [...previewImageFiles, ...newFiles];
      setPreviewImageFiles(updatedFiles);
      setPreviewImages(updatedFiles.map(file => URL.createObjectURL(file)));
    }
  };

  const removePreviewImage = (indexToRemove: number) => {
    const updatedFiles = previewImageFiles.filter((_, idx) => idx !== indexToRemove);
    const updatedImages = previewImages.filter((_, idx) => idx !== indexToRemove);
    setPreviewImageFiles(updatedFiles);
    setPreviewImages(updatedImages);
  };

  const handleRemoveExistingImage = async (imageId: string) => {
    try {
      await deleteProductImage(imageId);
      setExistingImages(existingImages.filter(img => img.id !== imageId));
      fetchData(); // Refresh UI
    } catch (err) {
      console.error('Failed to delete image:', err);
      alert('Failed to delete image');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.category_id) return;
    
    setIsSubmitting(true);
    try {
      // 1. Upload new images if any
      const newUrls = await uploadImages(previewImageFiles);
      
      const payload = {
        name: newProduct.name,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        category_id: newProduct.category_id,
        description: newProduct.description,
        colors: newProduct.colors,
        occasions: newProduct.occasions
      };

      if (editingProductId) {
        const res = await updateProduct(editingProductId, payload, newUrls);
        if (!res.success) throw new Error(res.error);
      } else {
        const res = await addProduct(payload, newUrls);
        if (!res.success) throw new Error(res.error);
      }

      // Refresh list
      await fetchData();

      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      console.error('Failed to save product:', err);
      alert('Error saving product: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(productId);
      await fetchData();
    } catch (err) {
      console.error('Failed to delete product:', err);
      alert('Failed to delete product');
    }
  };

  const openEditModal = (product: any) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id || (categories.length > 0 ? categories[0].id : ''),
      description: product.description || '',
      groupId: '',
      colors: product.colors || [],
      occasions: product.occasions || []
    });
    setExistingImages(product.images || []);
    setPreviewImages([]);
    setPreviewImageFiles([]);
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setEditingProductId(null);
    setNewProduct({ 
      name: '', 
      price: '', 
      stock: '', 
      category_id: categories.length > 0 ? categories[0].id : '',
      description: '',
      groupId: '', 
      colors: [], 
      occasions: [] 
    });
    setExistingImages([]);
    setPreviewImages([]);
    setPreviewImageFiles([]);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Products Management</h1>
          <p className="text-gray-300">Manage your saree inventory and categories.</p>
        </div>
        <button 
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="bg-[var(--color-primary)] hover:bg-[#600000] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add New Saree
        </button>
      </div>

      <div className="bg-gray-900 text-white rounded-xl border border-[var(--color-primary)] border-opacity-30 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--color-primary)] border-opacity-30 flex flex-col sm:flex-row gap-4 justify-between items-center bg-black">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-200" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--color-primary)] border-opacity-50 rounded-lg bg-gray-900 text-white focus:ring-[var(--color-primary)]"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-300 uppercase tracking-wider border-b border-[var(--color-primary)] border-opacity-30 bg-gray-900">
                <th className="p-4 w-16">Image</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-300">
                    No sarees found in database.
                  </td>
                </tr>
              ) : (
                products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 text-white/50 transition-colors">
                    <td className="p-4">
                      <Link href={`/product/${product.id}`} className="block w-12 h-16 rounded overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity">
                        {product.image ? (
                           product.image.endsWith('.mp4') ? (
                            <video src={product.image} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                           ) : (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                           )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-800"><ImageIcon className="w-4 h-4 text-gray-500" /></div>
                        )}
                      </Link>
                    </td>
                    <td className="p-4 font-medium text-white">
                      <Link href={`/product/${product.id}`} className="hover:text-[var(--color-primary)] hover:underline transition-colors">
                        {product.name}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-300">{product.category || 'Uncategorized'}</td>
                    <td className="p-4 text-white font-medium">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 10 ? 'bg-green-100 text-green-700' : 
                        product.stock > 0 ? 'bg-orange-100 text-orange-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-3">
                      <button 
                        onClick={() => openEditModal(product)}
                        className="text-blue-600 hover:text-blue-800 bg-blue-50 p-2 rounded-md transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-800 bg-red-50 p-2 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900 text-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-[var(--color-primary)] border-opacity-30 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold">{editingProductId ? 'Edit Saree' : 'Add New Saree'}</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-300 hover:text-gray-800 dark:hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddProduct} className="p-6 space-y-4 overflow-y-auto grow">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Product Media</label>
                  
                  {/* Existing Images */}
                  {existingImages.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-2 w-full">
                      {existingImages.map((img) => (
                        <div key={img.id} className="w-24 h-32 shrink-0 rounded overflow-hidden relative group border border-gray-700">
                          {img.url.endsWith('.mp4') ? (
                            <video src={img.url} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                          ) : (
                            <img src={img.url} className="w-full h-full object-cover" />
                          )}
                          <button 
                            type="button"
                            onClick={(e) => { e.preventDefault(); handleRemoveExistingImage(img.id); }}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-[var(--color-primary)] border-opacity-50 border-dashed rounded-md hover:border-[var(--color-primary)] transition-colors cursor-pointer relative w-full">
                    <div className="space-y-1 text-center w-full">
                      {previewImages.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full">
                          {previewImages.map((img, idx) => (
                            <div key={idx} className="w-24 h-32 shrink-0 rounded overflow-hidden relative group border border-gray-700">
                              <img src={img} className="w-full h-full object-cover" />
                              <button 
                                type="button"
                                onClick={(e) => { e.preventDefault(); removePreviewImage(idx); }}
                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-500" />
                      )}
                      <div className="flex text-sm text-gray-200 justify-center mt-2">
                        <span className="font-medium text-[var(--color-primary)] hover:text-[#600000]">Select photos to upload</span>
                        <input type="file" multiple accept="image/*,video/*" className="sr-only" onChange={handleImageChange} />
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Saree Name</label>
                  <input 
                    required
                    type="text" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white focus:ring-[var(--color-primary)]" 
                    placeholder="e.g. Red Banarasi Silk"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Price (₹)</label>
                    <input 
                      required
                      type="number" 
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white focus:ring-[var(--color-primary)]" 
                      placeholder="9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Stock Quantity</label>
                    <input 
                      required
                      type="number" 
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white focus:ring-[var(--color-primary)]" 
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                  <select 
                    required
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({...newProduct, category_id: e.target.value})}
                    className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white focus:ring-[var(--color-primary)]"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  <textarea 
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white focus:ring-[var(--color-primary)] min-h-[80px]" 
                    placeholder="Brief description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Available Colors</label>
                  <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto p-2 border border-gray-700 rounded-lg">
                    {AVAILABLE_COLORS.map(c => (
                      <label key={c.name} className="flex items-center space-x-2 bg-black px-3 py-1.5 rounded-full border border-gray-800 cursor-pointer hover:border-gray-600 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={newProduct.colors.includes(c.name)}
                          onChange={(e) => {
                            if (e.target.checked) setNewProduct({...newProduct, colors: [...newProduct.colors, c.name]});
                            else setNewProduct({...newProduct, colors: newProduct.colors.filter(col => col !== c.name)});
                          }}
                          className="rounded bg-gray-900 border-gray-700 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <span className="w-4 h-4 rounded-full border border-gray-700" style={{ backgroundColor: c.hex }}></span>
                        <span className="text-sm text-gray-300">{c.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Occasions</label>
                  <div className="flex flex-wrap gap-2 p-2 border border-gray-700 rounded-lg">
                    {['Wedding', 'Party', 'Casual', 'Festival', 'Office', 'Bridal'].map(occ => (
                      <label key={occ} className="flex items-center space-x-2 bg-black px-3 py-1.5 rounded-full border border-gray-800 cursor-pointer hover:border-gray-600 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={newProduct.occasions.includes(occ)}
                          onChange={(e) => {
                            if (e.target.checked) setNewProduct({...newProduct, occasions: [...newProduct.occasions, occ]});
                            else setNewProduct({...newProduct, occasions: newProduct.occasions.filter(o => o !== occ)});
                          }}
                          className="rounded bg-gray-900 border-gray-700 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                        />
                        <span className="text-sm text-gray-300">{occ}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-800 text-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 bg-[var(--color-primary)] hover:bg-[#600000] text-white px-4 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : (editingProductId ? 'Update Saree' : 'Save Saree')}
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
