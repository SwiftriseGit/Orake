"use client";
import Image from "next/image";
import Link from "next/link";
import { Trash2, ShoppingBag } from "lucide-react";
import { textFont } from "@/lib/fonts";

import { addToCart } from "@/actions/cart";
import { toast } from "sonner";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useCartWishlistStore } from "@/store/useCartWishlistStore";
import { ProductType } from "@/models/Product"

interface WishlistCardProps {
  item: ProductType,
  onRemove: (id: string) => void;
  isFirstOrder?: boolean;
  isLoggedIn?: boolean;
}

export default function WishlistCard({ item, onRemove, isFirstOrder = false, isLoggedIn = false }: WishlistCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const { incrementCart } = useCartWishlistStore();

  const handleAddToCart = async () => {
    setIsAdding(true);
    const res = await addToCart(item._id, 1);
    setIsAdding(false);

    if (res.success) {
      if (res.isNewItem) incrementCart();
    } else {
      toast.error(res.error || "Failed to add to cart");
    }
  };

  const displayPrice = !isLoggedIn ? item.oldPrice : (isFirstOrder && item.oldPrice ? Math.round(item.oldPrice * 0.8) : item.price);

  return (
    <div className="group bg-white border border-gray-100 rounded-[1.5rem] overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all relative">
      {/* Remove */}
      <button onClick={() => onRemove(item._id)} className="absolute top-3 right-3 z-20 w-8 h-8 bg-red-50 rounded-full flex items-center justify-center text-[#de3e4f] hover:bg-[#de3e4f] hover:text-white transition-all shadow-sm border border-red-100">
        <Trash2 size={14} />
      </button>

      {/* Stock badge */}
      {!item.stock && (
        <div className={`${textFont.className} absolute top-4 left-4 z-20 bg-gray-400 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest`}>
          Sold Out
        </div>
      )}

      {/* Clickable area — image + product info → redirects to product page */}
      <Link href={`/products/${item.slug}`} className="block">
        {/* Image */}
        <div className={`relative h-52 sm:h-56 flex items-center justify-center bg-gray-50 ${!item.stock ? "opacity-40" : ""}`}>
          <Image src={typeof item.image === 'string' ? item.image : (item.image as any)?.url || ''} alt={item.name} width={200} height={350}
            className="h-[125%] w-auto object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500"
            style={{ width: 'auto', height: 'auto' }}
          />
        </div>

        {/* Info */}
        <div className="p-5 pb-2 border-t border-gray-100">
          <p className={`${textFont.className} text-gray-400 text-xs uppercase tracking-widest mb-1`}>{item.size}</p>
          <h3 className={`${textFont.className} text-[#15161b] text-base font-bold uppercase tracking-wide mb-3 leading-tight group-hover:text-[#c25b5e] transition-colors`}>{item.name}</h3>

          <div className="flex items-center gap-2">
            <span className={`${textFont.className} text-[#15161b] text-xl font-black`}>Rs. {displayPrice.toFixed(2)}</span>
            {item.oldPrice > displayPrice && (
              <span className={`${textFont.className} text-gray-400 text-sm line-through`}>Rs. {item.oldPrice.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Add to Cart — outside the link so it doesn't navigate */}
      <div className="px-5 pb-5 pt-3">
        <button
          onClick={handleAddToCart}
          disabled={!item.stock || isAdding}
          className={`${textFont.className} w-full flex items-center justify-center gap-2 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 ${item.stock
            ? "bg-[#15161b] text-white hover:bg-[#c25b5e] hover:shadow-[0_8px_20px_rgba(194,91,94,0.2)] active:scale-[0.98]"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
        >
          {isAdding ? <Loader2 size={16} className="animate-spin" /> : <ShoppingBag size={16} />}
          {isAdding ? "Adding..." : (item.stock ? "Add to Cart" : "Unavailable")}
        </button>
      </div>
    </div>
  );
}
