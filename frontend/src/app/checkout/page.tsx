'use client';
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Wallet, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { items, subtotal: total, clearCart } = useCart();
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', pincode: '',
    paymentMethod: 'ONLINE'
  });
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem('akhila_store_settings');
    if (saved) {
      try {
        setStoreSettings(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const deliveryCharge = storeSettings?.deliveryCharge !== undefined ? storeSettings.deliveryCharge : 150;
  const freeShippingThreshold = storeSettings?.freeShippingThreshold !== undefined ? storeSettings.freeShippingThreshold : 5000;
  
  const shipping = (freeShippingThreshold > 0 && total >= freeShippingThreshold) ? 0 : deliveryCharge;
  const grandTotal = total + shipping;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (e.target.name === 'paymentMethod') {
      setFormData({ ...formData, paymentMethod: e.target.value });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handlePayment = async () => {
    // Mocking the payment logic for demonstration
    setStep(3); // Success step
    clearCart();
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {isOnline ? 'Order Pending Verification' : 'Order Confirmed!'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg">
          {isOnline 
            ? 'We have received your order details. Our team will manually verify your UPI payment and send you a confirmation message once verified. Order ID: #ORD-98234'
            : 'Thank you for your purchase. Your elegant sarees will reach you soon. Order ID: #ORD-98234'
          }
        </p>
        <button onClick={() => router.push('/shop')} className="bg-[var(--color-primary)] text-white px-8 py-3 rounded-md font-medium">
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Checkout</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Forms */}
        <div className="w-full lg:w-2/3 space-y-8">
          
          {/* Address Step */}
          <div className={`bg-white dark:bg-[#121212] p-6 rounded-xl border ${step === 1 ? 'border-[var(--color-primary)] shadow-md' : 'border-gray-200 dark:border-gray-800 opacity-60'}`}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span> 
              Shipping Address
            </h2>
            
            {step === 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900" />
                  <input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900" />
                  <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900" />
                </div>
                <input name="address" placeholder="Complete Address" value={formData.address} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900" />
                <div className="grid grid-cols-3 gap-4">
                  <input name="city" placeholder="City" value={formData.city} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900" />
                  <input name="state" placeholder="State" value={formData.state} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900" />
                  <input name="pincode" placeholder="PIN Code" value={formData.pincode} onChange={handleInputChange} className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 dark:bg-gray-900" />
                </div>
                <button 
                  onClick={() => setStep(2)} 
                  disabled={!isAddressValid}
                  className={`px-6 py-3 rounded-md font-medium mt-4 transition-colors ${
                    !isAddressValid 
                      ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 cursor-not-allowed' 
                      : 'bg-[var(--color-primary)] text-white hover:bg-[#600000]'
                  }`}
                >
                  Proceed to Payment
                </button>
              </motion.div>
            )}
          </div>

          {/* Payment Step */}
          <div className={`bg-white dark:bg-[#121212] p-6 rounded-xl border ${step === 2 ? 'border-[var(--color-primary)] shadow-md' : 'border-gray-200 dark:border-gray-800 opacity-60'}`}>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-[var(--color-primary)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span> 
              Payment Method
            </h2>
            
            {step === 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <label className="flex items-center p-4 border border-gray-200 dark:border-gray-800 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                  <input type="radio" name="paymentMethod" value="ONLINE" checked={formData.paymentMethod === 'ONLINE'} onChange={handleInputChange} className="text-[var(--color-primary)]" />
                  <CreditCard className="w-6 h-6 ml-4 mr-4 text-[var(--color-primary)]" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Pay Online (UPI / Bank Transfer)</div>
                    <div className="text-sm text-gray-500">Google Pay, PhonePe, Paytm, Navi</div>
                  </div>
                </label>
                
                {formData.paymentMethod === 'ONLINE' && (
                  <div className="ml-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Select your preferred UPI app below to make a secure payment of <strong>₹{grandTotal.toLocaleString('en-IN')}</strong>, then click Place Order.
                    </p>
                    
                    <div className="bg-white dark:bg-black p-4 rounded border border-gray-200 dark:border-gray-700">
                      <div className="text-xs text-gray-500 mb-1">Pay via UPI</div>
                      <div className="font-bold text-lg select-all">{storeSettings?.upiId || 'akhilasarees@okhdfcbank'}</div>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button onClick={() => { window.location.href = `upi://pay?pa=${storeSettings?.upiId || 'akhilasarees@okhdfcbank'}&pn=AkhilaSarees&am=${grandTotal}&cu=INR`; handlePayment(); }} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded text-xs font-medium transition-colors">Google Pay</button>
                        <button onClick={() => { window.location.href = `upi://pay?pa=${storeSettings?.upiId || 'akhilasarees@okhdfcbank'}&pn=AkhilaSarees&am=${grandTotal}&cu=INR`; handlePayment(); }} className="px-3 py-1.5 bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 rounded text-xs font-medium transition-colors">PhonePe</button>
                        <button onClick={() => { window.location.href = `upi://pay?pa=${storeSettings?.upiId || 'akhilasarees@okhdfcbank'}&pn=AkhilaSarees&am=${grandTotal}&cu=INR`; handlePayment(); }} className="px-3 py-1.5 bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs font-medium transition-colors">Paytm</button>
                        <button onClick={() => { window.location.href = `upi://pay?pa=${storeSettings?.upiId || 'akhilasarees@okhdfcbank'}&pn=AkhilaSarees&am=${grandTotal}&cu=INR`; handlePayment(); }} className="px-3 py-1.5 bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 rounded text-xs font-medium transition-colors">Navi</button>
                      </div>
                    </div>

                    {storeSettings?.accountNumber && (
                      <div className="bg-white dark:bg-black p-4 rounded border border-gray-200 dark:border-gray-700 text-sm">
                        <div className="text-xs text-gray-500 mb-2">Direct Bank Transfer</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-gray-500">Bank Name:</div><div className="font-medium">{storeSettings.bankName}</div>
                          <div className="text-gray-500">Account No:</div><div className="font-medium select-all">{storeSettings.accountNumber}</div>
                          <div className="text-gray-500">IFSC Code:</div><div className="font-medium select-all">{storeSettings.ifscCode}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <label className="flex items-center p-4 border border-gray-200 dark:border-gray-800 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900">
                  <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInputChange} className="text-[var(--color-primary)]" />
                  <Wallet className="w-6 h-6 ml-4 mr-4 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Cash on Delivery</div>
                    <div className="text-sm text-gray-500">Pay when you receive the order</div>
                  </div>
                </label>
                
                <div className="flex gap-4 mt-6">
                  <button onClick={() => setStep(1)} className="border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-md font-medium">
                    Back
                  </button>
                  {formData.paymentMethod === 'ONLINE' ? (
                    <button 
                      onClick={handlePayment} 
                      className="px-6 py-3 rounded-md font-bold flex-grow shadow-md flex items-center justify-center gap-2 transition-colors bg-orange-500 text-white hover:bg-orange-600"
                    >
                      <ShieldCheck className="w-5 h-5" /> I have completed the payment
                    </button>
                  ) : (
                    <button 
                      onClick={handlePayment} 
                      className="px-6 py-3 rounded-md font-bold flex-grow shadow-md flex items-center justify-center gap-2 transition-colors bg-[var(--color-indian-gold)] text-gray-900 hover:bg-[#E6C200]"
                    >
                      <ShieldCheck className="w-5 h-5" /> Place Order
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
          
        </div>

        {/* Order Summary (Sidebar) */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-800 p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-20 rounded bg-gray-200 shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded" />
                  </div>
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">{item.name}</div>
                    <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    <div className="font-medium text-[var(--color-primary)]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `₹${shipping}`}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-800 pt-4 flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-white">You Pay</span>
              <span className="text-2xl font-bold text-[var(--color-primary)]">₹{grandTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
