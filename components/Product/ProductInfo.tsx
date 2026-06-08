"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Heart, Share2, Plus, Minus, ChevronDown, Check, Loader2, Star, StarHalf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { headingFont, bodyFont } from "@/lib/fonts";
import { StarRating } from "./StarRating";
import { useCartWishlistStore } from "@/store/useCartWishlistStore";
import { useGuestWishlistStore } from "@/store/useGuestWishlistStore";
import { toggleWishlist } from "@/actions/wishlist";
import { addToCart } from "@/actions/cart";
import { authClient } from "@/lib/auth-client";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface ProductInfoProps {
  product: {
    _id: string;
    slug: string;
    name: string;
    price: number;
    oldPrice: number;
    discount: number;
    size: string;
    image: { publicId?: string; url: string } | string;
    numReviews?: number;
    rating?: number;
    description: string;
  };
  relatedProduct: {
    _id: string;
    slug: string;
    name: string;
    image: { publicId?: string; url: string } | string;
  };
  initialIsWishlisted?: boolean;
  isFirstOrder?: boolean;
}

export default function ProductInfo({ product, relatedProduct, initialIsWishlisted = false, isFirstOrder = false }: ProductInfoProps) {
  const session = authClient.useSession();
  const isAuthenticated = !!session.data?.user;
  const { openAuthModal } = useAuthStore();
  
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [shippingOpen, setShippingOpen] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isBuyNowLoading, setIsBuyNowLoading] = useState(false);

  const { setWishlistCount, setCartCount, incrementWishlist, decrementWishlist, incrementCart } = useCartWishlistStore();
  const guestWishlist = useGuestWishlistStore();
  
  const [isWishlisted, setIsWishlisted] = useState(initialIsWishlisted);

  useEffect(() => {
    if (!isAuthenticated) {
      guestWishlist.hydrate();
      setIsWishlisted(guestWishlist.has(product.slug));
    } else {
      setIsWishlisted(initialIsWishlisted);
    }
  }, [initialIsWishlisted, isAuthenticated, product.slug, guestWishlist.slugs]);

  const handleToggleWishlist = async () => {
    // Guest user → localStorage wishlist
    if (!isAuthenticated) {
      const added = guestWishlist.toggle(product.slug);
      setIsWishlisted(added);
      if (added) {
        incrementWishlist();
      } else {
        decrementWishlist();
      }
      return;
    }

    // Logged-in user → server DB wishlist
    try {
      setIsWishlistLoading(true);
      const prevState = isWishlisted;
      setIsWishlisted(!prevState);

      const result = await toggleWishlist(product._id);
      
      // Defensively remove from guest storage just in case
      if (guestWishlist.has(product.slug)) {
          guestWishlist.toggle(product.slug);
      }

      if (result.success) {
        if (result.added) {
            incrementWishlist();
        } else {
            decrementWishlist();
        }
      } else {
        setIsWishlisted(prevState);
        toast.error(result.error || "Failed to update wishlist");
      }
    } catch (error) {
      console.error(error);
      setIsWishlisted(!isWishlisted);
      toast.error("An error occurred");
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const handleAddToCart = async () => {

    try {
      setIsCartLoading(true);
      const result = await addToCart(product._id, quantity);
      if (result.success) {
        if (result.isNewItem) incrementCart();
      } else {
        toast.error(result.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleBuyNow = async () => {

    try {
      setIsBuyNowLoading(true);
      const result = await addToCart(product._id, quantity);
      if (result.success) {
        if (result.isNewItem) incrementCart();
        router.push('/cart');
      } else {
        toast.error(result.error || "Failed to add to cart");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setIsBuyNowLoading(false);
    }
  };

  const displayDiscount = isFirstOrder ? 20 : product.discount;
  const displayPrice = isFirstOrder && product.oldPrice ? Math.round(product.oldPrice * 0.80) : product.price;

  return (
    <div className="flex flex-col pt-4 sm:pt-8">
      {/* Title */}
      <h1 className={`${headingFont.className} text-4xl sm:text-5xl lg:text-6xl text-[#15161b] uppercase leading-[1.05] tracking-wide mb-3`}>
        {product.name}
      </h1>
      <h2 className={`${bodyFont.className} text-lg sm:text-xl text-[#c25b5e] font-bold uppercase tracking-[0.2em] mb-6`}>
        Prebiotic Fiber Soda
      </h2>

      {/* Reviews & Stock */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="flex gap-0.5 text-[#dbba53]">
            <StarRating rating={product.rating || 0} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <span className={`${bodyFont.className} text-sm font-bold text-gray-400 hover:text-[#15161b] uppercase tracking-widest ml-2 transition-colors`}>
            {product.numReviews || 0} Reviews
          </span>
        </div>
      </div>

      {/* Price */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-3 mb-6">
        <span className={`${headingFont.className} text-4xl sm:text-5xl text-[#15161b] leading-none whitespace-nowrap`}>
          Rs. {displayPrice.toFixed(2)}
        </span>
        
        <div className="flex items-center gap-3 sm:mb-1">
          {product.oldPrice > 0 && (
            <span className={`${bodyFont.className} text-lg sm:text-xl text-gray-400 line-through decoration-[#c25b5e] decoration-2`}>
              Rs. {product.oldPrice.toFixed(2)}
            </span>
          )}
          {displayDiscount > 0 && (
            <span className={`${bodyFont.className} bg-[#c25b5e] text-white text-[10px] sm:text-xs font-bold px-3 py-1 sm:py-1.5 rounded-full uppercase tracking-widest shadow-sm`}>
              Save {displayDiscount}%
            </span>
          )}
        </div>
      </div>

      {/* Short Description */}
      <p className={`${bodyFont.className} text-gray-500 text-[15px] sm:text-base leading-relaxed mb-10 max-w-[90%]`}>
        {product.description.substring(0, 180)}...
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-5">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Quantity */}
          <div className="flex-1 sm:flex-none flex items-center justify-between sm:justify-center border-2 border-gray-100 rounded-full bg-white h-[60px] px-2 sm:px-0 sm:w-[140px] shadow-sm">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-[#15161b] transition-colors rounded-l-full">
              <Minus size={18} strokeWidth={2.5} />
            </button>
            <span className={`${bodyFont.className} w-10 text-center font-black text-xl text-[#15161b]`}>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-full flex items-center justify-center text-gray-400 hover:text-[#15161b] transition-colors rounded-r-full">
              <Plus size={18} strokeWidth={2.5} />
            </button>
          </div>

          {/* Wishlist */}
          <button
            onClick={handleToggleWishlist}
            disabled={isWishlistLoading}
            className={`h-[60px] w-[60px] shrink-0 rounded-full border-2 flex items-center justify-center transition-all disabled:opacity-50 shadow-sm ${isWishlisted ? 'border-[#c25b5e] bg-[#c25b5e] text-white' : 'border-gray-100 text-gray-400 hover:border-gray-200 hover:text-[#c25b5e] bg-white'
              }`}
          >
            {isWishlistLoading ? <Loader2 size={22} className="animate-spin" /> : <Heart size={22} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2} />}
          </button>
        </div>

        {/* Add to Cart */}
        <button 
          onClick={handleAddToCart}
          disabled={isCartLoading}
          className={`${bodyFont.className} flex items-center justify-center gap-3 w-full sm:flex-1 h-[60px] bg-[#15161b] hover:bg-[#c25b5e] text-white text-sm sm:text-base font-bold uppercase tracking-widest whitespace-nowrap rounded-full transition-all shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(194,91,94,0.3)] hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none`}
        >
          {isCartLoading ? <Loader2 size={20} className="animate-spin" /> : <ShoppingCart size={20} />}
          Add To Cart
        </button>
      </div>

      {/* Buy Now */}
      <button 
        onClick={handleBuyNow}
        disabled={isBuyNowLoading || isCartLoading}
        className={`${bodyFont.className} flex items-center justify-center gap-2 w-full h-[60px] bg-transparent border-2 border-[#15161b] text-[#15161b] hover:bg-[#15161b] hover:text-white text-sm sm:text-base font-bold uppercase tracking-widest rounded-full transition-all mb-12 shadow-sm hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100 disabled:hover:bg-transparent disabled:hover:text-[#15161b]`}
      >
        {isBuyNowLoading && <Loader2 size={20} className="animate-spin" />}
        Buy It Now
      </button>

      {/* Utilities Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Other Flavours */}
        <div className="bg-gray-50/80 p-5 rounded-[24px] border border-gray-100 flex flex-col justify-center relative overflow-hidden group/flavor">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white rounded-full opacity-50 blur-2xl group-hover/flavor:bg-[#c25b5e]/10 transition-colors duration-500"></div>
          <p className={`${bodyFont.className} text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4`}>Try Other Flavours</p>
          <Link href={`/products/${relatedProduct.slug}`} className="w-full">
            <div className="flex items-center gap-4 px-4 py-3 bg-white border border-gray-100 rounded-full shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(194,91,94,0.08)] hover:border-[#c25b5e]/20 transition-all duration-300 group cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center p-1.5 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-50/50">
                <img src={typeof relatedProduct.image === 'string' ? relatedProduct.image : (relatedProduct.image as any)?.url || ''} className="w-full h-full object-contain drop-shadow-sm" />
              </div>
              <span className={`${bodyFont.className} text-xs font-bold uppercase tracking-widest group-hover:text-[#c25b5e] transition-colors truncate`}>
                {relatedProduct.name}
              </span>
            </div>
          </Link>
        </div>

        {/* Shipping & Share Box */}
        <div className="bg-gray-50/80 p-5 rounded-[24px] border border-gray-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className={`${bodyFont.className} text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em]`}>Share Product</span>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#c25b5e] hover:border-[#c25b5e]/20 hover:shadow-[0_8px_20px_rgba(194,91,94,0.08)] transition-all duration-300 hover:-translate-y-0.5">
                <Share2 size={16} />
              </button>
            </div>
          </div>
          
          <div className="w-full h-[1px] bg-gray-200/60 mb-4 rounded-full"></div>
          
          <button 
            onClick={() => setShippingOpen(!shippingOpen)}
            className="flex items-center justify-between group w-full py-1"
          >
            <span className={`${bodyFont.className} text-[11px] font-bold text-[#15161b] uppercase tracking-[0.2em] group-hover:text-[#c25b5e] transition-colors`}>
              Shipping Info
            </span>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-300 ${shippingOpen ? 'bg-[#15161b] text-white' : 'bg-white border border-gray-200 text-gray-400 group-hover:border-[#c25b5e] group-hover:text-[#c25b5e]'}`}>
              <ChevronDown size={14} className={`transition-transform duration-300 ${shippingOpen ? 'rotate-180' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Shipping Details Dropdown */}
      <AnimatePresence>
        {shippingOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, y: -10 }}
            animate={{ height: "auto", opacity: 1, y: 0 }}
            exit={{ height: 0, opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-[#15161b] text-white p-6 rounded-[24px] border border-gray-800 shadow-xl">
              <p className={`${bodyFont.className} text-[13px] sm:text-sm text-gray-300 leading-relaxed font-medium`}>
                Orders are processed within <span className="text-white font-bold">1-2 business days</span>. Standard shipping typically takes <span className="text-white font-bold">3-5 business days</span>. Free shipping on all orders over <span className="text-[#c25b5e] font-bold">Rs. 1500</span>.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
