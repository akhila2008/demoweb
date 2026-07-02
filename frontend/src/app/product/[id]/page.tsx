'use client';
import { useState, use, useEffect } from 'react';
import { loadProducts } from '@/lib/storage';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Share2, Star, Truck, ShieldCheck, Check } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
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
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        color: product.color,
        quantity: quantity,
        maxStock: product.stock
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const savedProducts = await loadProducts();
        const foundProduct = savedProducts.find((p: any) => p.id === unwrappedParams.id);
        
        if (foundProduct) {
          // Find linked products for color swatches
          let variants: any[] = [];
          if (foundProduct.groupId) {
            variants = savedProducts.filter((p: any) => p.groupId === foundProduct.groupId);
          } else {
            variants = [foundProduct]; // just itself
          }
          setLinkedVariants(variants);

          // Adapt the product structure
          setProduct({
            id: foundProduct.id,
            name: foundProduct.name,
            price: foundProduct.price,
            description: `Experience the epitome of elegance with this authentic ${foundProduct.category} saree. Perfect for any occasion with a stunning design.`,
            fabric: foundProduct.category,
            color: foundProduct.colors && foundProduct.colors.length > 0 ? foundProduct.colors.join(', ') : 'As shown',
            blouse: 'Includes 0.8m unstitched matching blouse piece',
            washCare: 'Dry Clean Only. Keep away from direct sunlight.',
            stock: foundProduct.stock,
            isVideo: foundProduct.isVideo,
            isVideos: foundProduct.isVideos,
            // Use dynamic images array if available, otherwise mock it
            images: foundProduct.images && foundProduct.images.length > 0 
              ? foundProduct.images 
              : [foundProduct.image]
          });
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
        <p className="text-gray-500 mb-8">The saree you are looking for does not exist or has been removed.</p>
        <Link href="/shop" className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#600000]">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8">
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
            <span className="text-gray-900 dark:text-gray-300">Silk Sarees</span>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Image Gallery */}
        <div className="w-full lg:w-1/2 flex flex-col-reverse md:flex-row gap-4">
          <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible md:w-24 shrink-0">
            {product.images.map((img: string, idx: number) => (
              <button 
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`border-2 rounded-lg overflow-hidden h-24 min-w-[6rem] ${activeImage === idx ? 'border-[var(--color-primary)]' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                {(product.isVideos?.[idx] || (product.isVideo && idx === 0)) ? (
                  <video src={img} className="w-full h-full object-cover" muted playsInline />
                ) : (
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
          <div className="flex-grow bg-gray-100 dark:bg-gray-900 rounded-2xl overflow-hidden aspect-[3/4] relative group cursor-zoom-in">
            <motion.div
              key={activeImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              {(product.isVideos?.[activeImage] || (product.isVideo && activeImage === 0)) ? (
                <video src={product.images[activeImage]} className="w-full h-full object-cover" autoPlay loop muted playsInline />
              ) : (
                <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              )}
            </motion.div>
          </div>
        </div>

        {/* Product Info */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-[var(--color-indian-gold)]">
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current" />
              <Star className="w-5 h-5 fill-current text-gray-300" />
              <span className="text-gray-600 dark:text-gray-400 text-sm ml-2">(42 Reviews)</span>
            </div>
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">In Stock ({product.stock})</span>
          </div>

          {/* Linked Color Variants */}
          {linkedVariants.length > 1 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">Available Colors</h3>
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
            <span className="text-sm text-gray-500 font-normal ml-2">incl. of all taxes</span>
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
            {product.description}
          </p>

          {/* Quantity and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg h-12 w-32 shrink-0">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors"
              >-</button>
              <input 
                type="number" 
                value={quantity}
                readOnly
                className="w-full text-center bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-medium" 
              />
              <button 
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                className="px-4 py-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors"
              >+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`flex-grow h-12 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors shadow-md ${
                added 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : product.stock === 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[var(--color-primary)] hover:bg-[#600000] text-white'
              }`}
            >
              {added ? (
                <><Check className="w-5 h-5" /> Added to Cart</>
              ) : (
                <><ShoppingCart className="w-5 h-5" /> {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</>
              )}
            </button>
            
            <button className="h-12 w-12 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded-lg hover:border-[var(--color-indian-magenta)] hover:text-[var(--color-indian-magenta)] transition-colors shrink-0">
              <Heart className="w-5 h-5" />
            </button>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Fabric</span>
                <span className="font-medium text-gray-900 dark:text-white">{product.fabric}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Color</span>
                <span className="font-medium text-gray-900 dark:text-white">{product.color}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Blouse Piece</span>
                <span className="font-medium text-gray-900 dark:text-white">{product.blouse}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Wash Care</span>
                <span className="font-medium text-gray-900 dark:text-white">{product.washCare}</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <Truck className="w-4 h-4 mr-2 text-[var(--color-primary)]" /> Free Shipping
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                <ShieldCheck className="w-4 h-4 mr-2 text-[var(--color-primary)]" /> Secure Checkout
              </div>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-[var(--color-primary)]">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
