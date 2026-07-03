'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Wallet, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", 
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", 
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", 
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function CheckoutPage() {
  const { items, subtotal: total, clearCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '',
    paymentMethod: 'ONLINE'
  });
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [orderId, setOrderId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    fetchStoreSettings();
    
    // Load from localStorage if present
    const savedForm = localStorage.getItem('akhila_checkout_form');
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {}
    }
  }, []);

  // Autofill from database for logged in users
  useEffect(() => {
    if (user) {
      const fetchLastOrder = async () => {
        const { data, error } = await supabase
          .from('orders')
          .select('data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (!error && data?.data?.customer) {
          const c = data.data.customer;
          setFormData(prev => {
            // Only autofill if local form address is mostly empty
            if (!prev.address && !prev.phone) {
              return {
                ...prev,
                firstName: c.firstName || '',
                lastName: c.lastName || '',
                phone: c.phone || '',
                address: c.address || '',
                city: c.city || '',
                state: c.state || '',
                pincode: c.pincode || ''
              };
            }
            return prev;
          });
        }
      };
      fetchLastOrder();
    }
  }, [user]);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem('akhila_checkout_form', JSON.stringify(formData));
  }, [formData]);

  const fetchStoreSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .eq('id', 'default')
        .single();
        
      if (!error && data) {
        setStoreSettings({
          deliveryCharge: data.delivery_charge,
          freeShippingThreshold: data.free_shipping_threshold,
          upiId: data.upi_id,
          accountNumber: data.account_number,
          ifscCode: data.ifsc_code,
          bankName: data.bank_name
        });
        return;
      }
    } catch (err) {
      console.error('Error fetching store settings:', err);
    }
    
    // Fallback to localStorage if db isn't setup
    const saved = localStorage.getItem('akhila_store_settings');
    if (saved) {
      try {
        setStoreSettings(JSON.parse(saved));
      } catch (e) {}
    }
  };

  const deliveryCharge = storeSettings?.deliveryCharge !== undefined ? storeSettings.deliveryCharge : 150;
  const freeShippingThreshold = storeSettings?.freeShippingThreshold !== undefined ? storeSettings.freeShippingThreshold : 5000;
  
  const shipping = (freeShippingThreshold > 0 && total >= freeShippingThreshold) ? 0 : deliveryCharge;

  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount.includes('%')) {
      const percentage = parseInt(appliedCoupon.discount.replace(/[^0-9]/g, ''));
      if (!isNaN(percentage)) discountAmount = Math.floor(total * (percentage / 100));
    } else {
      const amount = parseInt(appliedCoupon.discount.replace(/[^0-9]/g, ''));
      if (!isNaN(amount)) discountAmount = amount;
    }
    if (discountAmount > total) discountAmount = total;
  }

  const grandTotal = total - discountAmount + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .ilike('data->>code', couponCode.trim())
        .eq('data->>status', 'Active')
        .single();
        
      if (error || !data) {
        setCouponError('Invalid or expired coupon code');
        setAppliedCoupon(null);
      } else {
        // Extract the nested 'data' object which contains the coupon details
        setAppliedCoupon(data.data);
      }
    } catch (err) {
      setCouponError('Failed to verify coupon');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'paymentMethod') {
      setFormData({ ...formData, paymentMethod: e.target.value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    
    const newOrderId = `ORD-${Math.floor(Math.random() * 100000) + 10000}`;
    
    // For COD, process immediately
    if (formData.paymentMethod === 'COD') {
      await saveOrderToSupabase(newOrderId, 'CONFIRMED', null);
      setIsProcessing(false);
      setOrderId(newOrderId);
      setStep(3);
      clearCart();
      return;
    }

    // --- RAZORPAY ONLINE PAYMENT FLOW ---
    
    // 1. Load Razorpay script
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      setIsProcessing(false);
      return;
    }

    try {
      // 2. Create order on our server
      const createOrderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal, receipt: newOrderId }),
      });
      const orderData = await createOrderRes.json();
      
      if (!createOrderRes.ok) throw new Error(orderData.error);

      // 3. Save order to Supabase as PENDING initially
      await saveOrderToSupabase(newOrderId, 'PENDING_PAYMENT', null);

      // 4. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use public key from env
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Akhila Sarees",
        description: "Payment for Order " + newOrderId,
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            // 5. Verify payment on server
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                supabase_order_id: newOrderId
              })
            });
            
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok) {
              setOrderId(newOrderId);
              setStep(3);
              clearCart();
            } else {
              alert("Payment verification failed! " + verifyData.error);
            }
          } catch (err) {
            console.error("Verification error", err);
            alert("An error occurred during verification.");
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#d4af37" // Indian Gold
        }
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        alert("Payment Failed: " + response.error.description);
        setIsProcessing(false);
      });
      paymentObject.open();
    } catch (error) {
      console.error("Payment init failed:", error);
      alert("Could not initialize payment. Please try again.");
    }
    
    setIsProcessing(false);
  };

  const saveOrderToSupabase = async (orderId: string, status: string, paymentId: string | null) => {
    const orderData = {
      customer: formData,
      items: items,
      subtotal: total,
      shipping: shipping,
      discount: discountAmount,
      couponCode: appliedCoupon?.code || null,
      grandTotal: grandTotal,
      status: status,
      paymentMethod: formData.paymentMethod,
      paymentId: paymentId,
      date: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('orders')
      .insert([{ id: orderId, user_id: user?.id || null, data: orderData }]);
      
    if (error) console.error("Error saving order:", error);
  };

  const isAddressValid = !!(
    formData.firstName.trim() && 
    formData.lastName.trim() && 
    formData.email.trim() && 
    formData.phone.trim() && 
    formData.address.trim() && 
    formData.city.trim() && 
    formData.state.trim() && 
    formData.pincode.trim()
  );

  if (step === 3) {
    const isOnline = formData.paymentMethod === 'ONLINE';
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${isOnline ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h1 className="text-3xl font-bold text-white mb-4">
          {isOnline ? 'Order Pending Verification' : 'Order Confirmed!'}
        </h1>
        <p className="text-gray-200 mb-8 max-w-lg">
          {isOnline 
            ? `We have received your order details. Our team will manually verify your UPI payment and send you a confirmation message once verified. Order ID: #${orderId}`
            : `Thank you for your purchase. Your elegant sarees will reach you soon. Order ID: #${orderId}`
          }
        </p>
        <button onClick={() => router.push('/shop')} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-md font-medium">
          Continue Shopping
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center min-h-[60vh] flex flex-col justify-center items-center">
        <ShieldCheck className="w-16 h-16 text-[var(--color-primary)] mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Login Required</h1>
        <p className="text-gray-300 mb-8 max-w-md">
          Please log in or create an account to proceed with checkout and place your order.
        </p>
        <div className="flex gap-4">
          <button onClick={() => router.push('/login?redirect=/checkout')} className="bg-[var(--color-primary)] text-white hover:bg-[#600000] px-8 py-3 rounded-md font-medium transition-colors">
            Login
          </button>
          <button onClick={() => router.push('/signup?redirect=/checkout')} className="bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-8 py-3 rounded-md font-medium transition-colors">
            Sign Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Forms */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Address Step */}
          <div className={`bg-gray-900 p-6 rounded-xl border ${step === 1 ? 'border-[var(--color-primary)] shadow-md' : 'border-[var(--color-primary)] border-opacity-30 opacity-60'}`}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span> 
              Shipping Address
            </h2>
            
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white" />
                  <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white" />
                  <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white" />
                </div>
                <input name="address" placeholder="Complete Address" value={formData.address} onChange={handleInputChange} className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white text-white" />
                <div className="grid grid-cols-3 gap-4">
                  <input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white" />
                  <select name="state" value={formData.state} onChange={handleInputChange} className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white cursor-pointer appearance-none">
                    <option value="" disabled>Select State</option>
                    {INDIAN_STATES.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  <input name="pincode" placeholder="PIN Code" value={formData.pincode} onChange={handleInputChange} className="w-full border border-[var(--color-primary)] border-opacity-50 rounded-md p-3 bg-gray-900 text-white" />
                </div>
                <button 
                  onClick={() => setStep(2)} 
                  disabled={!isAddressValid}
                  className={`px-6 py-3 rounded-md font-medium mt-4 transition-colors ${
                    !isAddressValid 
                      ? 'bg-gray-300 dark:bg-gray-800 text-gray-300 cursor-not-allowed' 
                      : 'bg-[var(--color-primary)] text-white hover:bg-[#600000]'
                  }`}
                >
                  Proceed to Payment
                </button>
              </motion.div>
            )}
          </div>

          {/* Coupon Code Block */}
          <div className={`bg-gray-900 p-6 rounded-xl border ${step === 2 ? 'border-[var(--color-primary)] shadow-md mb-6' : 'border-[var(--color-primary)] border-opacity-30 opacity-60 mb-6'}`}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">%</span> 
              Apply Coupon
            </h2>
            
            {step === 2 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code" 
                    disabled={!!appliedCoupon}
                    className="flex-1 bg-black border border-[var(--color-primary)] border-opacity-50 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[var(--color-primary)] disabled:opacity-50"
                  />
                  {appliedCoupon ? (
                    <button 
                      onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                      className="bg-red-900/30 text-red-500 border border-red-900/50 hover:bg-red-900/50 px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button 
                      onClick={handleApplyCoupon}
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      className="bg-[var(--color-primary)] hover:bg-[#600000] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
                {appliedCoupon && <p className="text-green-500 text-xs mt-2">Coupon '{appliedCoupon.code}' applied! (₹{discountAmount} off)</p>}
              </motion.div>
            ) : (
              <div className="text-gray-400 text-sm">
                Complete address step first
              </div>
            )}
          </div>

          {/* Payment Step */}
          <div className={`bg-gray-900 p-6 rounded-xl border ${step === 2 ? 'border-[var(--color-primary)] shadow-md' : 'border-[var(--color-primary)] border-opacity-30 opacity-60'}`}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span> 
              Payment Method
            </h2>
            
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <label className="flex items-center p-4 border border-[var(--color-primary)] border-opacity-30 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 text-white">
                  <input type="radio" name="paymentMethod" value="ONLINE" checked={formData.paymentMethod === 'ONLINE'} onChange={handleInputChange} className="text-[var(--color-primary)]" />
                  <CreditCard className="w-6 h-6 ml-4 mr-4 text-[var(--color-primary)]" />
                  <div>
                    <div className="font-medium text-white">Pay Online (UPI / Bank Transfer)</div>
                    <div className="text-sm text-gray-300">Google Pay, PhonePe, Paytm, Navi</div>
                  </div>
                </label>
                
                {formData.paymentMethod === 'ONLINE' && (
                  <div className="ml-8 p-4 bg-gray-900 text-white rounded-md border border-[var(--color-primary)] border-opacity-30 space-y-4">
                    <p className="text-sm text-gray-200">
                      You will be redirected to the secure Razorpay Checkout to complete your payment of <strong>₹{grandTotal.toLocaleString('en-IN')}</strong> using UPI, Card, or Netbanking.
                    </p>
                  </div>
                )}
                
                <label className="flex items-center p-4 border border-[var(--color-primary)] border-opacity-30 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 text-white">
                  <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInputChange} className="text-[var(--color-primary)]" />
                  <Wallet className="w-6 h-6 ml-4 mr-4 text-gray-300" />
                  <div>
                    <div className="font-medium text-white">Cash on Delivery</div>
                    <div className="text-sm text-gray-300">Pay when you receive the order</div>
                  </div>
                </label>
                
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep(1)} className="border border-[var(--color-primary)] border-opacity-50 text-gray-300 px-6 py-3 rounded-md font-medium">
                    Back
                  </button>
                  {formData.paymentMethod === 'ONLINE' ? (
                    <button 
                      onClick={handlePayment} 
                      disabled={isProcessing}
                      className="px-6 py-3 rounded-md font-bold flex-grow shadow-md flex items-center justify-center gap-2 transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                      <ShieldCheck className="w-5 h-5" /> {isProcessing ? 'Connecting...' : 'Pay Securely with Razorpay'}
                    </button>
                  ) : (
                    <button 
                      onClick={handlePayment} 
                      disabled={isProcessing}
                      className="px-6 py-3 rounded-md font-bold flex-grow shadow-md flex items-center justify-center gap-2 transition-colors bg-[var(--color-indian-gold)] text-gray-900 hover:bg-[#E6C200] disabled:opacity-50"
                    >
                      <ShieldCheck className="w-5 h-5" /> {isProcessing ? 'Processing...' : 'Place Order'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
          
        </div>

        {/* Order Summary (Sidebar) */}
        <div className="w-full lg:w-1/3">
          <div className="bg-black rounded-xl border border-[var(--color-primary)] border-opacity-30 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-white mb-4">Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 rounded bg-gray-200 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-white line-clamp-2">{item.name}</div>
                    <div className="text-xs text-gray-300">Qty: {item.quantity}</div>
                    <div className="font-medium text-[var(--color-primary)]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-[var(--color-primary)] border-opacity-30 pt-4 space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-200">Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-500 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-200">Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}</span>
              </div>
            </div>
            
            <div className="border-t border-[var(--color-primary)] border-opacity-30 pt-4 flex justify-between items-center">
              <span className="font-bold text-white">You Pay</span>
              <span className="text-2xl font-bold text-[var(--color-primary)]">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
