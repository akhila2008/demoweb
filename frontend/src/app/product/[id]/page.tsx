'use client';
import { useState, use, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Star, Truck, ShieldCheck, Check, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { AVAILABLE_COLORS } from '@/lib/colors';

const MOCK_PRODUCT = {
  id: '1',
  name: 'Premium Kanjivaram Bridal Silk Saree',
  price: 24999,
  description: 'Experience the epitome of South Indian bridal elegance with this authentic Kanjivaram silk saree. Handwoven with pure mulberry silk threads and intricate zari work featuring traditional peacock and temple motifs along the border and pallu.',
  fabric: 'Pure Mulberry Silk',
  color: 'Deep Maroon with Gold Zari',
  blouse: 'Includes 0.8m unstitched matching blouse piece',
  washCare: 'Dry Clean Only. Keep away from direct sunlight.',
  stock: 12,
  images: [
    'https://images.unsplash.com/photo-1610189013233-0c46643fc08a?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583391733958-d150dcddf723?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop',
  ]
};

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [product, setProduct] = useState<any>(null);
  const [linkedVariants, setLinkedVariants] = useState<any[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const { items, addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const router = useRouter();

  const isAdded = product && items.some(item => item.productId === product.id);

  const handleAddToCart = () => {
    if (product) {
      if (isAdded) {
        router.push('/cart');
      } else {
        addToCart({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          color: product.color,
          quantity: quantity,
          maxStock: product.stock
        });
      }
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data: p, error } = await supabase
          .from('products')
          .select(`
            id, name, price, stock, description, is_active,
            categories ( name ),
            product_images ( id, url, sort_order ),
            colors, occasions
          `)
          .eq('id', unwrappedParams.id)
          .single();
          
        if (p) {
          const sortedImages = (p.product_images || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
          const mappedProduct = {
            ...p,
            category: (p.categories as any)?.name || 'Uncategorized',
            images: sortedImages.map((img: any) => img.url),
            color: (p.colors && p.colors.length > 0) ? p.colors.join(', ') : 'Not Specified',
            fabric: (p.categories as any)?.name || 'Premium Saree',
            blouse: 'Includes 0.8m unstitched matching blouse piece',
            washCare: 'Dry Clean Only. Keep away from direct sunlight.'
          };
          setProduct(mappedProduct);
          setLinkedVariants([]);
        }
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    };
    
    fetchProduct();
  }, [unwrappedParams.id]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-24 text-center">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-300 mb-8">The saree you are looking for does not exist or has been removed.</p>
        <Link href="/shop" className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#600000]">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-300 mb-8">
        <ol className="list-none p-0 inline-flex">
          <li className="flex items-center">
            <Link href="/" className="hover:text-[var(--color-primary)]">Home</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <Link href="/shop" className="hover:text-[var(--color-primary)]">Shop</Link>
            <span className="mx-2">/</span>
          </li>
          <li className="flex items-center">
            <span className="text-gray-900 text-gray-300">Silk Sarees</span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible md:w-24 shrink-0">
            {product.images?.length > 0 && product.images.map((img: string, idx: number) => {
              const isVid = img.toLowerCase().endsWith('.mp4') || img.toLowerCase().endsWith('.webm');
              return (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`border-2 rounded-lg overflow-hidden h-24 min-w-[6rem] ${activeImage === idx ? 'border-[var(--color-primary)]' : 'border-transparent opacity-70 hover:opacity-100'}`}
                >
                  {isVid ? (
                    <video src={img} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex-grow bg-gray-900 text-white rounded-2xl overflow-hidden aspect-[3/4] relative group cursor-zoom-in">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full bg-gray-800 flex items-center justify-center"
            >
              {product.images?.length > 0 ? (
                (() => {
                  const activeImgUrl = product.images[activeImage];
                  const isVid = activeImgUrl.toLowerCase().endsWith('.mp4') || activeImgUrl.toLowerCase().endsWith('.webm');
                  return isVid ? (
                    <video src={activeImgUrl} className="w-full h-full object-cover" autoPlay loop muted playsInline />
                  ) : (
                    <img src={activeImgUrl} alt={product.name} className="w-full h-full object-cover" />
                  );
                })()
              ) : (
                <div className="text-gray-500">No Image Available</div>
              )}
            </motion.div>
            
            {/* Mobile Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === 0 ? product.images.length - 1 : prev - 1); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/80 p-2 rounded-full shadow-md text-gray-100 hover:bg-white md:hidden"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setActiveImage(prev => prev === product.images.length - 1 ? 0 : prev + 1); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/80 p-2 rounded-full shadow-md text-gray-100 hover:bg-white md:hidden"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                
                {/* Dots indicator for mobile */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
                  {product.images.map((_: any, idx: number) => (
                    <div 
                      key={idx} 
                      className={`h-2 rounded-full transition-all ${activeImage === idx ? 'w-6 bg-[var(--color-primary)]' : 'w-2 bg-white/60 dark:bg-gray-600/60'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-[var(--color-indian-gold)]">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current text-gray-300" />
              <span className="text-gray-200 text-sm ml-2">(42 Reviews)</span>
            </div>
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">In Stock ({product.stock})</span>
          </div>

          {/* Linked Color Variants */}
          {linkedVariants.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 text-gray-300 mb-2">Available Colors</h3>
              <div className="flex gap-3">
                {linkedVariants.map((variant) => {
                  const isCurrent = variant.id === product.id;
                  const mainColor = variant.colors?.[0] || 'Unknown';
                  const hex = AVAILABLE_COLORS.find(c => c.name === mainColor)?.hex || '#ccc';
                  
                  return (
                    <Link 
                      key={variant.id} 
                      href={`/product/${variant.id}`}
                      title={mainColor}
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform ${isCurrent ? 'border-[var(--color-primary)] scale-110' : 'border-transparent hover:scale-110'}`}
                    >
                      <span className="w-6 h-6 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: hex }}></span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="text-3xl font-bold text-[var(--color-primary)] mb-6">
            ₹{product.price.toLocaleString('en-IN')}
            <span className="text-sm text-gray-300 font-normal ml-2">incl. of all taxes</span>
          </div>

          <p className="text-gray-600 text-gray-300 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Quantity and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center border border-[var(--color-primary)] border-opacity-50 rounded-lg h-12 w-32 shrink-0">
              <button 
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="px-4 py-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
              >-</button>
              <input 
                type="number" 
                value={quantity}
                readOnly
                className="w-full text-center bg-transparent border-none focus:ring-0 text-white font-medium cursor-default" 
              />
              <button 
                type="button"
                onClick={() => setQuantity(prev => Math.min(Number(product.stock), prev + 1))}
                className="px-4 py-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
              >+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0 && !isAdded}
              className={`flex-grow h-12 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-md ${
                isAdded 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : product.stock === 0 
                    ? 'bg-gray-300 text-gray-300 cursor-not-allowed'
                    : 'bg-[var(--color-primary)] hover:bg-[#600000] text-white'
              }`}
            >
              {isAdded ? (
                <>Go to Cart <ArrowRight className="w-5 h-5" /></>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</>
              )}
            </button>
            
            <button 
              onClick={() => toggleWishlist({
                id: product.id,
                name: product.name,
                price: product.price,
                originalPrice: product.originalPrice,
                image: product.images[0]
              })}
              className={`h-12 w-12 flex items-center justify-center border rounded-lg transition-colors shrink-0 ${
                isInWishlist(product.id) 
                  ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/20' 
                  : 'border-[var(--color-primary)] border-opacity-50 hover:border-red-500 hover:text-red-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Additional Info */}
          <div className="border-t border-[var(--color-primary)] border-opacity-30 pt-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-gray-300">Fabric</span>
                <span className="font-medium text-white">{product.fabric}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-300">Color</span>
                <span className="font-medium text-white">{product.color}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-300">Blouse Piece</span>
                <span className="font-medium text-white">{product.blouse}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-300">Wash Care</span>
                <span className="font-medium text-white">{product.washCare}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4 border-t border-[var(--color-primary)] border-opacity-30">
              <div className="flex items-center text-sm text-gray-200">
                <Truck className="w-4 h-4 mr-2 text-[var(--color-primary)]" /> Free Shipping
              </div>
              <div className="flex items-center text-sm text-gray-200">
                <ShieldCheck className="w-4 h-4 mr-2 text-[var(--color-primary)]" /> Secure Checkout
              </div>
              <div className="flex items-center text-sm text-gray-200 cursor-pointer hover:text-[var(--color-primary)]">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
