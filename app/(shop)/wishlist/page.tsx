import type { Metadata } from "next";
import WishlistHero from "@/components/Wishlist/WishlistHero";
import WishlistList from "@/components/Wishlist/WishlistList";
import WishlistSkeleton from "@/components/Wishlist/WishlistSkeleton";
import { getWishlist } from "@/lib/data/wishlist";
import { Suspense } from "react";
import { headers } from "next/headers";
import { getOrders } from "@/lib/data/order";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Wishlist — Orake",
  description: "Your saved Orake favorites. Save products and add them to cart when ready.",
};

async function getSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({ headers: reqHeaders });
}

async function WishlistContent() {
  await headers();
  const session = await getSession();
  const isLoggedIn = !!session?.user;

  const data = await getWishlist();
  const ordersData = await getOrders();
  const pastOrdersCount = ordersData.total || 0;

  return (
    <>
      <WishlistHero itemCount={isLoggedIn ? data.items.length : -1} />
      <WishlistList 
        initialItems={data.items} 
        pastOrdersCount={pastOrdersCount} 
        isLoggedIn={isLoggedIn}
      />
    </>
  );
}

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={<WishlistSkeleton />}>
        <WishlistContent />
      </Suspense>
    </div>
  );
}
