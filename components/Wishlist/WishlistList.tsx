"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { textFont } from "@/lib/fonts";
import WishlistCard from "./WishlistCard";
import EmptyWishlist from "./EmptyWishlist";
import { toggleWishlist, getProductsBySlugs } from "@/actions/wishlist";
import { toast } from "sonner";
import { useCartWishlistStore } from "@/store/useCartWishlistStore";
import { useGuestWishlistStore } from "@/store/useGuestWishlistStore";
import { ProductType } from "@/models/Product";
import { useState, useEffect } from "react";

interface WishlistListProps {
  initialItems: ProductType[];
  pastOrdersCount?: number;
  isLoggedIn?: boolean;
}

export default function WishlistList({ initialItems, pastOrdersCount = 0, isLoggedIn = false }: WishlistListProps) {
  const { decrementWishlist, setWishlistCount } = useCartWishlistStore();
  const guestWishlist = useGuestWishlistStore();
  
  // For guests: client-fetched product data
  const [guestItems, setGuestItems] = useState<ProductType[]>([]);
  const [guestLoading, setGuestLoading] = useState(!isLoggedIn);

  // Hydrate guest wishlist & fetch products for guest
  useEffect(() => {
    if (isLoggedIn) return;

    guestWishlist.hydrate();
    const slugs = guestWishlist.getSlugs();

    if (slugs.length === 0) {
      setGuestLoading(false);
      return;
    }

    setGuestLoading(true);
    getProductsBySlugs(slugs).then((res) => {
      if (res.success && res.products) {
        setGuestItems(res.products);
      }
      setGuestLoading(false);
    });
  }, [isLoggedIn, guestWishlist.slugs.length]);

  // Determine which items to show
  const items = isLoggedIn ? initialItems : guestItems;
  const isFirstOrder = pastOrdersCount === 0;

  const removeItem = async (productId: string, slug: string) => {
    if (isLoggedIn) {
      // Logged-in: toggle via server action (removes from DB)
      decrementWishlist();
      const res = await toggleWishlist(productId);
      
      // Defensively remove from guest storage too
      if (guestWishlist.has(slug)) {
        guestWishlist.toggle(slug);
      }
      
      if (!res.success) {
        toast.error("Failed to remove item");
      }
    } else {
      // Guest: remove from localStorage & update local state
      guestWishlist.toggle(slug);
      setGuestItems(prev => prev.filter(i => i._id !== productId));
      decrementWishlist();
    }
  };

  if (guestLoading) {
    return (
      <div className="px-6 sm:px-12 lg:px-20 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-[1.5rem] h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 sm:px-12 lg:px-20 py-12 md:py-20">
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        {items.length > 0 && (
          <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-200">
            <p className={`${textFont.className} text-gray-400 text-sm tracking-widest uppercase`}>{items.length} Products</p>
            <Link href="/products" className={`${textFont.className} inline-flex items-center gap-2 text-[#c25b5e] hover:text-[#15161b] text-sm font-bold uppercase tracking-widest transition-colors`}>
              Continue Shopping <ArrowRight size={16} />
            </Link>
          </div>
        )}

        {items.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <WishlistCard key={item._id} item={item} onRemove={() => removeItem(item._id, item.slug)} isFirstOrder={isFirstOrder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
