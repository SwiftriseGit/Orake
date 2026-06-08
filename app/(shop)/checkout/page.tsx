import CheckoutForm from "@/components/Checkout/CheckoutForm";
import type { Metadata } from "next";
import { getCart } from "@/lib/data/cart";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserAddresses } from "@/actions/address";
import { Suspense } from "react";

import { titleFont } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Checkout | Orake",
  description: "Securely complete your purchase.",
};

import { getOrders } from "@/lib/data/order";

async function CheckoutContent() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  const cartData = await getCart();
  const addressRes = await getUserAddresses();
  const addresses = addressRes.success ? addressRes.addresses : [];
  
  let pastOrdersCount = 0;
  if (session?.user) {
    const ordersData = await getOrders();
    pastOrdersCount = ordersData.total;
  }

  // Pass down session status to the client
  return (
    <CheckoutForm 
        initialCartItems={cartData?.items || []} 
        user={session?.user || null} 
        initialAddresses={addresses} 
        pastOrdersCount={pastOrdersCount} 
    />
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="relative bg-gradient-to-b from-[#15161b] via-[#1a1b22] to-[#15161b] pt-24 pb-10 sm:pt-32 sm:pb-14 md:pt-40 md:pb-20 px-4 sm:px-6 text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-[#c25b5e]/10 rounded-full blur-[120px] -top-20 -right-20" />
        </div>
        <div className="relative z-10">
          <h1 className={`${titleFont.className} text-3xl sm:text-5xl md:text-7xl text-white tracking-tight uppercase leading-none`}>
            CHECKOUT
          </h1>
        </div>
      </div>
      <Suspense fallback={<div className="max-w-4xl mx-auto py-12 px-4 text-center text-gray-500 font-bold uppercase tracking-wider">Loading secure checkout...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
