"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { titleFont, textFont } from "@/lib/fonts";
import { clearCart } from "@/actions/cart";
import { placeOrder, deleteAbandonedOrder } from "@/actions/order";
import { verifyPayment } from "@/actions/payment";
import { toast } from "sonner";
import { Loader2, X, MapPin } from "lucide-react";
import OrderSuccessModal from "../Cart/OrderSuccessModal";
import { addAddress } from "@/actions/address";
import { useCartWishlistStore } from "@/store/useCartWishlistStore";

export default function CheckoutForm({ initialCartItems, user, initialAddresses = [], pastOrdersCount = 0 }: { initialCartItems: any[], user: any, initialAddresses?: any[], pastOrdersCount?: number }) {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [cartItems] = useState<any[]>(initialCartItems);
  const { setCartCount } = useCartWishlistStore();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successOrderId, setSuccessOrderId] = useState<string>();

  const [addresses, setAddresses] = useState<any[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    initialAddresses.find((a: any) => a.isDefault)?._id || initialAddresses[0]?._id || "new"
  );
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(!user && initialAddresses.length === 0);

  // Form state for new address
  const [newAddressForm, setNewAddressForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India"
  });

  const [paymentMethod, setPaymentMethod] = useState("COD"); // 'COD' or 'Razorpay'

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    if (!user) {
      // For guests, we don't save the address to the database
      const tempId = "guest_" + Date.now();
      const newAddr = { ...newAddressForm, _id: tempId };
      setAddresses(prev => [...prev, newAddr]);
      setSelectedAddressId(tempId);
      setIsAddressModalOpen(false);
      setNewAddressForm({ fullName: "", email: "", phone: "", street: "", city: "", state: "", postalCode: "", country: "India" });
      setProcessing(false);
      return;
    }

    try {
      const res = await addAddress({ ...newAddressForm, isDefault: addresses.length === 0 });
      if (res.success) {
        setAddresses(prev => [...prev, res.address]);
        setSelectedAddressId(res.address._id);
        toast.success("Address added");
        setIsAddressModalOpen(false);
        setNewAddressForm({ fullName: user?.name || "", email: user?.email || "", phone: "", street: "", city: "", state: "", postalCode: "", country: "India" });
      } else {
        toast.error(res.error || "Failed to add address");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewAddressForm({ ...newAddressForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!selectedAddressId || selectedAddressId === "new") {
      toast.error("Please select a shipping address");
      return;
    }

    setProcessing(true);

    try {
      const selectedAddress = addresses.find(a => a._id === selectedAddressId);
      if (!selectedAddress) {
        toast.error("Invalid address selected");
        setProcessing(false);
        return;
      }

      // 1. Create order in Database (Pending or Processing based on method)
      const res = await placeOrder(selectedAddress, paymentMethod);

      if (!res.success || !res.orderId) {
        toast.error(res.error || "Failed to create order");
        setProcessing(false);
        return;
      }

      // 2. If COD, we are done! (cart already cleared on server by placeOrder)
      if (paymentMethod === "COD") {
        setCartCount(0);
        setSuccessOrderId(res.orderId);
        setIsSuccessModalOpen(true);
        setProcessing(false);
        return;
      }

      // 3. If Razorpay, open the modal
      if (paymentMethod === "Razorpay") {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error("Failed to load Razorpay SDK");
          setProcessing(false);
          return;
        }

        const options: any = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: (res.totalPrice || 0) * 100, // paise
          currency: "INR",
          name: "Orake",
          description: "Order Payment",
          order_id: res.razorpayOrderId, 
          handler: async function (response: any) {
            // Verify payment signature on the server
            const verifyRes = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              res.orderId
            );

            if (verifyRes.success) {
              await clearCart();
              setCartCount(0);
              setSuccessOrderId(res.orderId); // Show our DB order ID
              setIsSuccessModalOpen(true);
            } else {
              toast.error(verifyRes.error || "Payment verification failed");
            }
            setProcessing(false);
          },
          prefill: {
            name: selectedAddress.fullName,
            email: selectedAddress.email || user?.email || "",
            contact: selectedAddress.phone
          },
          theme: {
            color: "#c25b5e",
          },
          modal: {
            ondismiss: async function() {
              // Delete the abandoned order from DB
              await deleteAbandonedOrder(res.orderId);
              toast.error("Payment cancelled. Please try again.");
              setProcessing(false);
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        
        rzp.on("payment.failed", async function (response: any) {
          toast.error(response.error.description || "Payment failed");
          // Optionally delete the order if payment completely failed
          await deleteAbandonedOrder(res.orderId);
          setProcessing(false);
        });

        rzp.open();
      }

    } catch (error) {
      console.error(error);
      toast.error("An error occurred during checkout");
      setProcessing(false);
    }
  };

  const isFirstTime = pastOrdersCount === 0;

  const displayItems = cartItems.map(i => {
    if (isFirstTime && i.oldPrice) {
      return {
        ...i,
        price: Math.round(i.oldPrice * 0.8)
      };
    }
    return i;
  });

  const subtotal = displayItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const originalSubtotal = displayItems.reduce((sum, item) => sum + (item.oldPrice || item.price) * item.qty, 0);
  
  const autoDiscount = 0; // Removed, now factored into item price

  const shipping = subtotal > 999 ? 0 : 99;
  const total = subtotal + shipping;

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-20 py-12 md:py-20">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Form Column */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Shipping Address */}
            <div className="bg-gray-50 p-6 md:p-8 rounded-[1.5rem] border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <h2 className={`${textFont.className} text-xl font-bold uppercase tracking-wide`}>Shipping Address</h2>
                <button type="button" onClick={() => setIsAddressModalOpen(true)} className={`${textFont.className} flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-[#15161b] hover:bg-[#c25b5e] text-white shrink-0`}>
                  + Add New
                </button>
              </div>
              
              {addresses.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {addresses.map((addr: any) => (
                    <label key={addr._id} className={`relative flex flex-col p-5 rounded-2xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-[#c25b5e] bg-red-50/20' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                      <input type="radio" name="selectedAddressId" value={addr._id} checked={selectedAddressId === addr._id} onChange={(e) => setSelectedAddressId(e.target.value)} className="sr-only" />
                      
                      <div className="flex items-start justify-between mb-2">
                        <h4 className={`${textFont.className} text-sm font-bold text-[#15161b]`}>{addr.fullName}</h4>
                        {selectedAddressId === addr._id && (
                          <div className="w-4 h-4 rounded-full bg-[#c25b5e] flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                      <p className={`${textFont.className} text-xs text-gray-500 mb-2`}>{addr.phone}</p>
                      <p className={`${textFont.className} text-xs text-gray-600 leading-relaxed`}>
                        {addr.street}<br/>
                        {addr.city}, {addr.state} {addr.postalCode}<br/>
                        {addr.country}
                      </p>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-2xl border border-gray-200">
                  <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
                  <p className={`${textFont.className} text-gray-400 text-xs uppercase tracking-wider mb-4`}>No saved addresses</p>
                  <button type="button" onClick={() => setIsAddressModalOpen(true)} className={`${textFont.className} px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all bg-[#15161b] hover:bg-[#c25b5e] text-white`}>
                    + Add New Address
                  </button>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-gray-50 p-6 md:p-8 rounded-[1.5rem] border border-gray-100">
              <h2 className={`${textFont.className} text-xl font-bold uppercase tracking-wide mb-6`}>Payment Method</h2>
              
              <div className="space-y-4">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'Razorpay' ? 'border-[#c25b5e] bg-white shadow-sm' : 'border-gray-200 bg-transparent'}`}>
                  <input type="radio" name="payment" value="Razorpay" checked={paymentMethod === 'Razorpay'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-[#c25b5e] border-gray-300 focus:ring-[#c25b5e]" />
                  <div className="ml-4 flex-1 flex items-center justify-between">
                    <span className={`${textFont.className} font-bold text-gray-800`}>Pay Online (Card, UPI, NetBanking)</span>
                    <span className="text-xs bg-[#c25b5e] text-white px-2 py-1 rounded">Recommended</span>
                  </div>
                </label>

                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-[#15161b] bg-white shadow-sm' : 'border-gray-200 bg-transparent'}`}>
                  <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={(e) => setPaymentMethod(e.target.value)} className="w-5 h-5 text-[#15161b] border-gray-300 focus:ring-[#15161b]" />
                  <div className="ml-4">
                    <span className={`${textFont.className} font-bold text-gray-800`}>Cash on Delivery (COD)</span>
                    <p className="text-xs text-gray-500 mt-1">Pay when your order arrives at your door.</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing || cartItems.length === 0 || !selectedAddressId || selectedAddressId === "new"}
              className={`${textFont.className} w-full bg-[#15161b] text-white rounded-xl py-4 font-bold text-lg uppercase tracking-widest hover:bg-[#c25b5e] hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              {processing && <Loader2 size={20} className="animate-spin" />}
              {processing ? "Processing..." : `Place Order (Rs. ${total.toFixed(2)})`}
            </button>
          </form>
        </div>

        {/* Order Summary Column */}
        <div className="lg:w-[400px] shrink-0">
          <div className="bg-[#15161b] rounded-[2rem] p-8 text-white sticky top-28">
            <h2 className={`${textFont.className} text-xl font-bold uppercase tracking-widest mb-6 border-b border-white/10 pb-4`}>
              Order Summary
            </h2>
            
            <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#c25b5e transparent' }}>
              {displayItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center p-1 shrink-0">
                      <img src={typeof item.image === 'string' ? item.image : (item.image as any)?.url || ''} alt={item.name} className="h-full object-contain drop-shadow-md" />
                    </div>
                    <div>
                      <p className={`${textFont.className} font-bold`}>{item.name}</p>
                      <p className="text-gray-400 text-xs mt-0.5">Qty: {item.qty}</p>
                    </div>
                  </div>
                  <p className="font-medium shrink-0">Rs. {(item.price * item.qty).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-sm border-t border-white/10 pt-6">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Shipping</span>
                <span>{shipping === 0 ? "FREE" : `Rs. ${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-xl font-bold border-t border-white/10 pt-4 mt-2">
                <span>Total</span>
                <span className="text-[#c25b5e]">Rs. {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OrderSuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => router.push(user ? "/account" : "/")}
        orderId={successOrderId || "unknown"}
        paymentMethod={paymentMethod}
      />

      {isAddressModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setIsAddressModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`${titleFont.className} text-2xl uppercase tracking-wide text-[#15161b]`}>
                Add New Address
              </h3>
              <button type="button" onClick={() => setIsAddressModalOpen(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 hover:text-[#15161b] transition-colors">
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={handleAddNewAddress} className="space-y-4">
              <div>
                <label className={`${textFont.className} block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2`}>Full Name</label>
                <input required type="text" name="fullName" value={newAddressForm.fullName} onChange={handleInputChange} className={`${textFont.className} w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`${textFont.className} block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2`}>Email Address</label>
                  <input required type="email" name="email" value={newAddressForm.email} onChange={handleInputChange} className={`${textFont.className} w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
                </div>
                <div>
                  <label className={`${textFont.className} block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2`}>Phone Number</label>
                  <input required type="tel" name="phone" value={newAddressForm.phone} onChange={handleInputChange} className={`${textFont.className} w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
                </div>
              </div>
              
              <div>
                <label className={`${textFont.className} block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2`}>Street Address</label>
                <input required type="text" name="street" value={newAddressForm.street} onChange={handleInputChange} className={`${textFont.className} w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`${textFont.className} block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2`}>City</label>
                  <input required type="text" name="city" value={newAddressForm.city} onChange={handleInputChange} className={`${textFont.className} w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
                </div>
                <div>
                  <label className={`${textFont.className} block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2`}>State</label>
                  <input required type="text" name="state" value={newAddressForm.state} onChange={handleInputChange} className={`${textFont.className} w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`${textFont.className} block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2`}>Postal Code</label>
                  <input required type="text" name="postalCode" value={newAddressForm.postalCode} onChange={handleInputChange} className={`${textFont.className} w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
                </div>
                <div>
                  <label className={`${textFont.className} block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-2`}>Country</label>
                  <input required type="text" name="country" value={newAddressForm.country} onChange={handleInputChange} className={`${textFont.className} w-full border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-[#15161b] focus:border-[#c25b5e] focus:bg-white focus:outline-none transition-all rounded-xl`} />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={processing} className={`${textFont.className} w-full bg-[#15161b] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#c25b5e] transition-colors shadow-lg shadow-[#15161b]/20 disabled:opacity-50 flex items-center justify-center gap-2`}>
                  {processing && <Loader2 size={14} className="animate-spin" />}
                  Save Address & Use
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
