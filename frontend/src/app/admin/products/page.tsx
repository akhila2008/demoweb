'use client';
import { useState, useEffect } from 'react';
import { loadProducts, saveProducts } from '@/lib/storage';
import { Plus, Search, Edit, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AVAILABLE_COLORS } from '@/lib/colors';
import Link from 'next/link';

const INITIAL_PRODUCTS: any[] = [];

export default function AdminProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewImageFiles, setPreviewImageFiles] = useState<any[]>([]);
  const [previewIsVideo, setPreviewIsVideo] = useState<boolean[]>([]);

  const [isInitialized, setIsInitialized] = useState(false);

  // Load products from IndexedDB on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const savedProducts = await loadProducts();
        if (savedProducts && savedProducts.length > 0) {
          setProducts(savedProducts);
        }
      } catch (e) {
        console.error('Failed to load products from IndexedDB', e);
      }
      setIsInitialized(true);
    };
    fetchInitialData();
  }, []);

  // Save products to IndexedDB whenever they change
  useEffect(() => {
    if (isInitialized) {
      saveProducts(products).catch(e => console.error('Failed to save to IndexedDB', e));
    }
  }, [products, isInitialized]);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    stock: '',
    category: 'Silk',
    groupId: '',
    colors: [] as string[]
  });

  const handleColorToggle = (colorName: string) => {
    setNewProduct(prev => {
      if (prev.colors.includes(colorName)) {
        return { ...prev, colors: prev.colors.filter(c => c !== colorName) };
      } else {
        return { ...prev, colors: [...prev.colors, colorName] };
      }
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length > 0) {
      const updatedFiles = [...previewImageFiles, ...newFiles];
      setPreviewImageFiles(updatedFiles);
      setPreviewImages(updatedFiles.map(file => URL.createObjectURL(file)));
      setPreviewIsVideo(updatedFiles.map(f => f.type.startsWith('video/')));
    }
  };

  const removePreviewImage = (indexToRemove: number) => {
    const updatedFiles = previewImageFiles.filter((_, idx) => idx !== indexToRemove);
    const updatedImages = previewImages.filter((_, idx) => idx !== indexToRemove);
    setPreviewImageFiles(updatedFiles);
    setPreviewImages(updatedImages);
    setPreviewIsVideo(updatedFiles.map(f => f.type.startsWith('video/')));
  };

  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !newProduct.groupId) return;
    
    if (editingProductId) {
      // Update existing product
      setProducts(products.map(p => {
        if (p.id === editingProductId) {
          return {
            ...p,
            name: newProduct.name,
            price: Number(newProduct.price),
            stock: Number(newProduct.stock),
            category: newProduct.category,
            groupId: newProduct.groupId,
            colors: newProduct.colors,
            image: previewImages.length > 0 ? previewImages[0] : p.image,
            images: previewImages.length > 0 ? previewImages : (p.images || [p.image]),
            imageFile: previewImageFiles.length > 0 ? previewImageFiles[0] : p.imageFile,
            imageFiles: previewImageFiles.length > 0 ? previewImageFiles : p.imageFiles,
            isVideo: previewIsVideo.length > 0 ? previewIsVideo[0] : p.isVideo,
            isVideos: previewIsVideo.length > 0 ? previewIsVideo : (p.isVideos || [p.isVideo])
          };
        }
        return p;
      }));
    } else {
      // Add new product
      const defaultImg = 'https://images.unsplash.com/photo-1583391733958-d150dcddf723?q=80&w=200&auto=format&fit=crop';
      const addedProduct = {
        id: Math.random().toString(36).substr(2, 9),
        name: newProduct.name,
        price: Number(newProduct.price),
        stock: Number(newProduct.stock),
        category: newProduct.category,
        groupId: newProduct.groupId,
        colors: newProduct.colors,
        image: previewImages.length > 0 ? previewImages[0] : defaultImg,
        images: previewImages.length > 0 ? previewImages : [defaultImg],
        imageFile: previewImageFiles.length > 0 ? previewImageFiles[0] : null,
        imageFiles: previewImageFiles,
        isVideo: previewIsVideo.length > 0 ? previewIsVideo[0] : false,
        isVideos: previewIsVideo
      };
      setProducts([...products, addedProduct]);
    }

    setIsAddModalOpen(false);
    setEditingProductId(null);
    setNewProduct({ name: '', price: '', stock: '', category: 'Silk', groupId: '', colors: [] });
    setPreviewImages([]);
    setPreviewImageFiles([]);
    setPreviewIsVideo([]);
  };

  const openEditModal = (product: any) => {
    setEditingProductId(product.id);
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category,
      groupId: product.groupId || '',
      colors: product.colors || []
    });
    setPreviewImages(product.images || (product.image ? [product.image] : []));
    setPreviewImageFiles(product.imageFiles || (product.imageFile ? [product.imageFile] : []));
    setPreviewIsVideo(product.isVideos || (product.imageFile ? [product.isVideo] : []));
    setIsAddModalOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Products Management</h1>
          <p className="text-gray-500">Manage your saree inventory and categories.</p>
        </div>
        <button 
          onClick={() => {
            setEditingProductId(null);
            setNewProduct({ name: '', price: '', stock: '', category: 'Silk', groupId: '', colors: [] });
            setPreviewImages([]);
            setPreviewImageFiles([]);
            setIsAddModalOpen(true);
          }}
          className="bg-[var(--color-primary)] hover:bg-[#600000] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add New Saree
        </button>
      </div>

      <div className="bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50 dark:bg-[#1A1A1A]">
          <div className="relative w-full sm:w-96">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg dark:bg-gray-900 focus:ring-[var(--color-primary)]"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <select className="border border-gray-300 dark:border-gray-700 rounded-lg py-2 px-4 dark:bg-gray-900 focus:ring-[var(--color-primary)] w-full sm:w-auto">
              <option>All Categories</option>
              <option>Silk</option>
              <option>Cotton</option>
              <option>Banarasi</option>
              <option>Georgette</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[#121212]">
                <th className="p-4 w-16">Image</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Category</th>
                <th className="p-4">Colors</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No sarees added yet. Click "Add New Saree" to get started.
                  </td>
                </tr>
              ) : (
                products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="p-4">
                      <Link href={`/product/${product.id}`} className="block w-12 h-16 rounded overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity">
                        {product.isVideos?.[0] || product.isVideo ? (
                          <video src={product.image} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                        ) : (
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </Link>
                    </td>
                    <td className="p-4 font-medium text-gray-900 dark:text-white">
                      <Link href={`/product/${product.id}`} className="hover:text-[var(--color-primary)] hover:underline transition-colors">
                        {product.name}
                      </Link>
                    </td>
                    <td className="p-4 text-gray-500">{product.category}</td>
                    <td className="p-4">
                      <div className="flex gap-1 flex-wrap w-24">
                        {product.colors && product.colors.map((colorName: string) => {
                          const hex = AVAILABLE_COLORS.find(c => c.name === colorName)?.hex || '#ccc';
                          return (
                            <div 
                              key={colorName} 
                              className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 shadow-sm" 
                              style={{ backgroundColor: hex }}
                              title={colorName}
                            />
                          );
                        })}
                        {(!product.colors || product.colors.length === 0) && <span className="text-xs text-gray-400">None</span>}
                      </div>
                    </td>
                    <td className="p-4 text-gray-900 dark:text-white font-medium">₹{product.price.toLocaleString('en-IN')}</td>
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
                        onClick={() => setProducts(products.filter(p => p.id !== product.id))}
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
              className="bg-white dark:bg-[#121212] rounded-xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingProductId ? 'Edit Saree' : 'Add New Saree'}</h2>
                <button onClick={() => { setIsAddModalOpen(false); setPreviewImages([]); setEditingProductId(null); }} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Media (Carousel)</label>
                  <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-md hover:border-[var(--color-primary)] transition-colors cursor-pointer relative w-full">
                    <div className="space-y-1 text-center w-full">
                      {previewImages.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full">
                          {previewImages.map((img, idx) => (
                            <div key={idx} className="w-24 h-32 shrink-0 rounded overflow-hidden relative group">
                              {previewIsVideo[idx] ? (
                                <video src={img} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                              ) : (
                                <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                              )}
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
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                      <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center mt-2">
                        <span className="font-medium text-[var(--color-primary)] hover:text-[#600000]">Select multiple photos/videos</span>
                        <input type="file" multiple accept="image/*,video/*" className="sr-only" onChange={handleImageChange} />
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Saree Name</label>
                  <input 
                    required
                    type="text" 
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900 focus:ring-[var(--color-primary)]" 
                    placeholder="e.g. Red Banarasi Silk"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                    <input 
                      required
                      type="number" 
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900 focus:ring-[var(--color-primary)]" 
                      placeholder="9999"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity</label>
                    <input 
                      required
                      type="number" 
                      onWheel={(e) => (e.target as HTMLInputElement).blur()}
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900 focus:ring-[var(--color-primary)]" 
                      placeholder="10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900 focus:ring-[var(--color-primary)]"
                    >
                      <option value="Silk">Silk</option>
                      <option value="Cotton">Cotton</option>
                      <option value="Banarasi">Banarasi</option>
                      <option value="Kanjivaram">Kanjivaram</option>
                      <option value="Linen">Linen</option>
                      <option value="Georgette">Georgette</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1" title="Give identical Model Numbers to group variants together.">Model Number</label>
                    <input 
                      required
                      type="text" 
                      value={newProduct.groupId}
                      onChange={(e) => setNewProduct({...newProduct, groupId: e.target.value})}
                      className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900 focus:ring-[var(--color-primary)]" 
                      placeholder="e.g. Saree-123"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Colors</label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {AVAILABLE_COLORS.map(color => (
                      <label 
                        key={color.name} 
                        className={`flex items-center justify-center p-2 rounded-md border cursor-pointer transition-colors ${
                          newProduct.colors.includes(color.name) 
                            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 ring-1 ring-[var(--color-primary)]' 
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          className="sr-only" 
                          checked={newProduct.colors.includes(color.name)}
                          onChange={() => handleColorToggle(color.name)}
                        />
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-5 h-5 rounded-full border border-gray-300 shadow-sm" style={{ backgroundColor: color.hex }}></div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">{color.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 bg-[var(--color-primary)] hover:bg-[#600000] text-white px-4 py-3 rounded-lg font-medium transition-colors"
                  >
                    {editingProductId ? 'Update Saree' : 'Save Saree'}
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
