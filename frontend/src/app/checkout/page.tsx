'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, ShoppingBag, Plus, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { checkoutSchema } from '@/lib/validations/checkout';

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
  
  // Amazon-like Accordion State: 1 = Address, 2 = Payment, 3 = Review
  const [activeStep, setActiveStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  // Addresses State
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isFetchingAddresses, setIsFetchingAddresses] = useState(true);

  // Form State for New Address
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '',
    addressLine1: '', addressLine2: '', city: '', state: '', pincode: ''
  });
  const [formErrors, setFormErrors] = useState<any>({});

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('ONLINE'); // ONLINE or COD

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  useEffect(() => {
    fetchStoreSettings();
    if (user) {
      fetchUserAddresses();
    } else {
      setIsFetchingAddresses(false);
      setShowNewAddressForm(true);
    }
  }, [user]);

  const fetchStoreSettings = async () => {
    try {
      const { data, error } = await supabase.from('store_settings').select('*').eq('id', 'default').single();
      if (!error && data) setStoreSettings(data);
    } catch (err) {}
  };

  const fetchUserAddresses = async () => {
    setIsFetchingAddresses(true);
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user?.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        setSavedAddresses(data);
        setSelectedAddressId(data[0].id);
        setShowNewAddressForm(false);
      } else {
        setShowNewAddressForm(true);
      }
    } catch (e) {
      console.error("Error fetching addresses:", e);
    } finally {
      setIsFetchingAddresses(false);
    }
  };

  // Calculations
  const deliveryCharge = storeSettings?.delivery_charge !== undefined ? Number(storeSettings.delivery_charge) : 150;
  const freeShippingThreshold = storeSettings?.free_shipping_threshold !== undefined ? Number(storeSettings.free_shipping_threshold) : 5000;
  const shipping = (freeShippingThreshold > 0 && total >= freeShippingThreshold) ? 0 : Number(deliveryCharge);
  
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
  const grandTotal = Number(total) - Number(discountAmount) + Number(shipping);

  const handleAddressSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setFormErrors({});

    if (showNewAddressForm) {
      try {
        // Validate with Zod before proceeding
        // Note: Using a slightly modified schema for direct fields
        if (!formData.firstName) throw new Error("First name is required");
        if (!formData.phone || formData.phone.length !== 10) throw new Error("Valid 10-digit phone required");
        if (!formData.addressLine1) throw new Error("Address is required");
        if (!formData.city) throw new Error("City is required");
        if (!formData.state) throw new Error("State is required");
        if (!formData.pincode || formData.pincode.length !== 6) throw new Error("Valid 6-digit pincode required");

        if (user) {
          // Save to database
          const { data, error } = await supabase.from('addresses').insert({
            user_id: user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            is_default: savedAddresses.length === 0
          }).select().single();

          if (error) throw error;
          
          if (data) {
            setSavedAddresses([data, ...savedAddresses]);
            setSelectedAddressId(data.id);
            setShowNewAddressForm(false);
          }
        } else {
          // Guest checkout - generate a mock ID
          const guestAddress = { id: 'guest-' + Date.now(), ...formData };
          setSavedAddresses([guestAddress]);
          setSelectedAddressId(guestAddress.id);
          setShowNewAddressForm(false);
        }
        
        setActiveStep(2);
      } catch (error: any) {
        setFormErrors({ general: error.message });
        return;
      }
    } else {
      if (!selectedAddressId) {
        setFormErrors({ general: "Please select a delivery address." });
        return;
      }
      setActiveStep(2);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsApplyingCoupon(true);
    setCouponError('');
    
    try {
      // First try to fetch from the database
      const { data, error } = await supabase.from('offers').select('*');
      
      let foundCoupon = false;
      if (!error && data) {
        const offerData = data.find(o => o.data?.code === couponCode.trim().toUpperCase() && o.data?.status === 'Active');
        if (offerData) {
          setAppliedCoupon({ code: offerData.data.code, discount: offerData.data.discount });
          foundCoupon = true;
        }
      }
      
      if (!foundCoupon) {
        // Fallback or hardcoded checks
        const cleanCode = couponCode.trim().toUpperCase();
        if (cleanCode === 'WELCOME10') {
          setAppliedCoupon({ code: 'WELCOME10', discount: '10%' });
        } else if (cleanCode === 'SAVE20') {
          setAppliedCoupon({ code: 'SAVE20', discount: '20%' });
        } else if (cleanCode === 'FLAT500') {
          setAppliedCoupon({ code: 'FLAT500', discount: '500' });
        } else {
          setCouponError('Invalid coupon code');
        }
      }
    } catch (e) {
      setCouponError('Error applying coupon. Please try again.');
    }
    
    setIsApplyingCoupon(false);
  };

  const getSelectedAddress = () => {
    return savedAddresses.find(a => a.id === selectedAddressId);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      alert("Please login to place an order.");
      router.push('/login?redirect=/checkout');
      return;
    }

    const address = getSelectedAddress();
    if (!address) return;

    setIsProcessing(true);

    try {
      const orderPayload = {
        userId: user?.id,
        address: address,
        items: items,
        subtotal: total,
        shipping: shipping,
        discount: discountAmount,
        grandTotal: grandTotal,
        paymentMethod: paymentMethod,
        coupon: appliedCoupon
      };

      // Create Order API Call
      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to initialize payment');

      if (paymentMethod === 'ONLINE') {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: "Vastrini",
          description: "Order Checkout",
          order_id: data.id,
          handler: async function (response: any) {
            // Verify Payment
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                orderId: data.dbOrderId // Internal reference
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              clearCart();
              router.push(`/checkout/success?order=${data.dbOrderId}`);
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          },
          prefill: {
            name: `${address.first_name} ${address.last_name}`,
            email: user?.email || '',
            contact: address.phone
          },
          theme: { color: "#D4AF37" }
        };

        const rzp1 = new (window as any).Razorpay(options);
        rzp1.on('payment.failed', function (response: any) {
          alert("Payment failed: " + response.error.description);
          setIsProcessing(false);
        });
        rzp1.open();
      } else {
        // COD
        clearCart();
        router.push(`/checkout/success?order=${data.dbOrderId}`);
      }

    } catch (err: any) {
      alert(err.message || 'An error occurred during checkout');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="bg-[#111] p-8 rounded-xl border border-gray-800 text-center max-w-md w-full">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-400 mb-6">Add some products to your cart to checkout.</p>
          <button onClick={() => router.push('/shop')} className="w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  const StepHeader = ({ step, title, isActive, isCompleted }: any) => (
    <div className={`flex items-center gap-4 p-4 ${isActive ? 'bg-[#1a1a1a]' : 'bg-[#111]'} cursor-pointer rounded-t-lg`} 
         onClick={() => isCompleted && setActiveStep(step)}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
        isActive ? 'bg-[var(--color-primary)] text-white' : 
        isCompleted ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'
      }`}>
        {isCompleted && !isActive ? <Check className="w-5 h-5" /> : step}
      </div>
      <h2 className={`text-xl font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>{title}</h2>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] py-12">
      <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Accordion */}
        <div className="w-full lg:w-2/3 space-y-6">
          
          {/* STEP 1: DELIVERY ADDRESS */}
          <div className={`border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 ${activeStep === 1 ? 'ring-2 ring-[var(--color-primary)] ring-opacity-50' : ''}`}>
            <StepHeader step={1} title="Delivery Address" isActive={activeStep === 1} isCompleted={activeStep > 1} />
            
            <AnimatePresence>
              {activeStep === 1 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#111] p-6 border-t border-gray-800">
                  {isFetchingAddresses ? (
                    <div className="text-gray-400 text-center py-4">Loading addresses...</div>
                  ) : (
                    <div className="space-y-4">
                      {/* Saved Addresses */}
                      {!showNewAddressForm && savedAddresses.length > 0 && (
                        <div className="space-y-3">
                          {savedAddresses.map((addr) => (
                            <div key={addr.id} 
                                 className={`p-4 border rounded-lg cursor-pointer flex items-start gap-4 transition-colors ${
                                   selectedAddressId === addr.id ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-10' : 'border-gray-800 hover:border-gray-600'
                                 }`}
                                 onClick={() => setSelectedAddressId(addr.id)}>
                              <div className="mt-1">
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddressId === addr.id ? 'border-[var(--color-primary)]' : 'border-gray-500'}`}>
                                  {selectedAddressId === addr.id && <div className="w-2.5 h-2.5 bg-[var(--color-primary)] rounded-full"></div>}
                                </div>
                              </div>
                              <div>
                                <p className="font-bold text-white text-lg">{addr.first_name} {addr.last_name}</p>
                                <p className="text-gray-400 text-sm">{addr.address_line1} {addr.address_line2}</p>
                                <p className="text-gray-400 text-sm">{addr.city}, {addr.state} {addr.pincode}</p>
                                <p className="text-gray-400 text-sm mt-1">Phone: {addr.phone}</p>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => setShowNewAddressForm(true)} className="flex items-center gap-2 text-[var(--color-primary)] font-medium hover:underline mt-4">
                            <Plus className="w-4 h-4" /> Add a new address
                          </button>
                        </div>
                      )}

                      {/* New Address Form */}
                      {(showNewAddressForm || savedAddresses.length === 0) && (
                        <div className="bg-[#1a1a1a] p-6 rounded-lg">
                          <h3 className="text-white font-bold mb-4">{savedAddresses.length > 0 ? 'Add a new address' : 'Enter Delivery Address'}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">First Name</label>
                              <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-[#222] border border-gray-700 rounded p-2.5 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Last Name</label>
                              <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-[#222] border border-gray-700 rounded p-2.5 text-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-400 mb-1">Mobile Number</label>
                              <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-[#222] border border-gray-700 rounded p-2.5 text-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-400 mb-1">Flat, House no., Building, Company, Apartment</label>
                              <input type="text" value={formData.addressLine1} onChange={e => setFormData({...formData, addressLine1: e.target.value})} className="w-full bg-[#222] border border-gray-700 rounded p-2.5 text-white" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-400 mb-1">Area, Street, Sector, Village (Optional)</label>
                              <input type="text" value={formData.addressLine2} onChange={e => setFormData({...formData, addressLine2: e.target.value})} className="w-full bg-[#222] border border-gray-700 rounded p-2.5 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Town/City</label>
                              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-[#222] border border-gray-700 rounded p-2.5 text-white" />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">State</label>
                              <select value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-[#222] border border-gray-700 rounded p-2.5 text-white">
                                <option value="">Select State</option>
                                {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-400 mb-1">Pincode</label>
                              <input type="text" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="w-full bg-[#222] border border-gray-700 rounded p-2.5 text-white" />
                            </div>
                          </div>
                          
                          {savedAddresses.length > 0 && (
                            <button onClick={() => setShowNewAddressForm(false)} className="text-gray-400 hover:text-white mt-4 text-sm font-medium mr-4">
                              Cancel
                            </button>
                          )}
                        </div>
                      )}

                      {formErrors.general && <p className="text-red-500 text-sm font-medium mt-2">{formErrors.general}</p>}

                      <div className="mt-6 bg-[#1a1a1a] p-4 rounded-lg flex items-center justify-between">
                        <button onClick={handleAddressSubmit} className="bg-[var(--color-primary)] hover:bg-[#b08d20] text-black font-bold py-3 px-8 rounded-lg transition-colors">
                          Use this address
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Completed State Summary for Address */}
            {activeStep > 1 && getSelectedAddress() && (
              <div className="bg-[#111] px-14 pb-6 -mt-2">
                <div className="text-gray-300 text-sm">
                  <span className="font-bold text-white">{getSelectedAddress().first_name} {getSelectedAddress().last_name}</span> &nbsp;
                  {getSelectedAddress().address_line1}, {getSelectedAddress().city}, {getSelectedAddress().state} {getSelectedAddress().pincode}
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: PAYMENT METHOD */}
          <div className={`border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 ${activeStep === 2 ? 'ring-2 ring-[var(--color-primary)] ring-opacity-50' : ''}`}>
            <StepHeader step={2} title="Payment Method" isActive={activeStep === 2} isCompleted={activeStep > 2} />
            
            <AnimatePresence>
              {activeStep === 2 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#111] p-6 border-t border-gray-800">
                  <div className="space-y-3">
                    
                    {/* Razorpay Online */}
                    <div className={`p-4 border rounded-lg cursor-pointer flex items-start gap-4 transition-colors ${
                          paymentMethod === 'ONLINE' ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-10' : 'border-gray-800 hover:border-gray-600'
                        }`}
                        onClick={() => setPaymentMethod('ONLINE')}>
                      <div className="mt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'ONLINE' ? 'border-[var(--color-primary)]' : 'border-gray-500'}`}>
                          {paymentMethod === 'ONLINE' && <div className="w-2.5 h-2.5 bg-[var(--color-primary)] rounded-full"></div>}
                        </div>
                      </div>
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white text-lg">Razorpay Secure</p>
                          <span className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase">Recommended</span>
                        </div>
                        <p className="text-gray-400 text-sm mt-1 mb-3">Pay using UPI, Credit/Debit Card, Netbanking, or Wallets.</p>
                        <div className="flex gap-2">
                           <img src="https://razorpay.com/assets/razorpay-glyph.svg" alt="Razorpay" className="h-6 opacity-70" />
                        </div>
                      </div>
                    </div>

                    {/* Cash on Delivery */}
                    <div className={`p-4 border rounded-lg cursor-pointer flex items-start gap-4 transition-colors ${
                          paymentMethod === 'COD' ? 'border-[var(--color-primary)] bg-[var(--color-primary)] bg-opacity-10' : 'border-gray-800 hover:border-gray-600'
                        }`}
                        onClick={() => setPaymentMethod('COD')}>
                      <div className="mt-1">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-[var(--color-primary)]' : 'border-gray-500'}`}>
                          {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-[var(--color-primary)] rounded-full"></div>}
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">Cash on Delivery (COD)</p>
                        <p className="text-gray-400 text-sm mt-1">Pay at your doorstep. Note: An additional ₹50 handling fee may apply.</p>
                      </div>
                    </div>

                  </div>

                  <div className="mt-6 bg-[#1a1a1a] p-4 rounded-lg flex items-center justify-between">
                    <button onClick={() => setActiveStep(3)} className="bg-[var(--color-primary)] hover:bg-[#b08d20] text-black font-bold py-3 px-8 rounded-lg transition-colors">
                      Use this payment method
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Completed State Summary for Payment */}
            {activeStep > 2 && (
              <div className="bg-[#111] px-14 pb-6 -mt-2">
                <div className="text-gray-300 text-sm font-bold">
                  {paymentMethod === 'ONLINE' ? 'Razorpay Secure (UPI, Cards, Netbanking)' : 'Cash on Delivery (COD)'}
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: ITEMS AND DELIVERY */}
          <div className={`border border-gray-800 rounded-lg overflow-hidden transition-all duration-300 ${activeStep === 3 ? 'ring-2 ring-[var(--color-primary)] ring-opacity-50' : ''}`}>
            <StepHeader step={3} title="Review items and delivery" isActive={activeStep === 3} isCompleted={false} />
            
            <AnimatePresence>
              {activeStep === 3 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-[#111] p-6 border-t border-gray-800">
                  
                  <div className="border border-gray-700 rounded-lg p-4 mb-6">
                    <h3 className="text-lg font-bold text-white mb-4">Delivery estimate: 3-5 Business Days</h3>
                    <div className="space-y-4">
                      {items.map(item => (
                        <div key={item.id} className="flex gap-4">
                          <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded bg-gray-800" />
                          <div>
                            <p className="font-bold text-white line-clamp-1">{item.name}</p>
                            <p className="text-xl font-bold text-[#B12704] mt-1">₹{item.price.toLocaleString('en-IN')}</p>
                            <p className="text-sm text-gray-400 mt-1">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#1a1a1a] p-6 rounded-lg flex flex-col md:flex-row items-center justify-between gap-6 border-t-4 border-[var(--color-primary)]">
                    <div>
                      <button 
                        onClick={handlePlaceOrder}
                        disabled={isProcessing}
                        className="bg-[var(--color-primary)] hover:bg-[#b08d20] disabled:opacity-50 text-black font-bold py-3 px-8 rounded-lg transition-colors w-full md:w-auto shadow-lg"
                      >
                        {isProcessing ? 'Processing securely...' : paymentMethod === 'ONLINE' ? 'Place your order and pay' : 'Place your order'}
                      </button>
                      <p className="text-xs text-gray-400 mt-3 text-center md:text-left">
                        By placing your order, you agree to Vastrini's privacy notice and conditions of use.
                      </p>
                    </div>
                    
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-bold text-[#B12704]">Order Total: ₹{grandTotal.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Column: Order Summary Box (Amazon style side panel) */}
        <div className="w-full lg:w-1/3">
          <div className="bg-[#111] border border-gray-800 rounded-lg p-6 sticky top-24">
            <button 
              onClick={() => { if (activeStep === 3) handlePlaceOrder(); else setActiveStep(3); }}
              disabled={activeStep < 3 || isProcessing}
              className="w-full bg-[var(--color-primary)] hover:bg-[#b08d20] disabled:opacity-50 text-black font-bold py-3 rounded-lg transition-colors mb-4 shadow-lg text-sm"
            >
              {isProcessing ? 'Processing...' : activeStep < 3 ? 'Use this address to continue' : 'Place your order and pay'}
            </button>
            <p className="text-xs text-gray-400 text-center mb-6">Choose a shipping address and payment method to calculate shipping, handling, and tax.</p>
            
            {/* Coupon Code section (Moved above Order Summary) */}
            <div className="mb-8 border-b border-gray-800 pb-6">
              <h4 className="text-sm font-bold text-white mb-2">Gift Cards & Promotional Codes</h4>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Enter Code"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  className="w-full bg-[#222] border border-gray-700 rounded p-2 text-white text-sm focus:ring-[var(--color-primary)]" 
                />
                <button 
                  onClick={handleApplyCoupon}
                  disabled={isApplyingCoupon || !couponCode}
                  className="bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded text-sm transition-colors border border-gray-600 font-medium"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
              {appliedCoupon && <p className="text-green-500 text-xs mt-1">Coupon '{appliedCoupon.code}' applied!</p>}
            </div>
            
            <h3 className="font-bold text-lg text-white mb-4">Order Summary</h3>
            
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Total:</span>
                <span>₹{(Number(total) + Number(shipping)).toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-500">
                  <span>Promotion Applied:</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-800 mt-4 pt-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#B12704] text-xl">Order Total:</span>
                <span className="font-bold text-[#B12704] text-xl">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
      
      {/* Include Razorpay script statically */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
    </div>
  );
}
