'use server';

import { getCart } from "@/lib/data/cart";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { sendWaitlistEmail } from "@/lib/mailer";

async function getSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({ headers: reqHeaders });
}

export async function processWaitlistCheckout(total: number) {
  try {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    // Get the user's cart
    const cartRes = await getCart();
    const items = cartRes?.items;

    if (!items || items.length === 0) {
        throw new Error("Cart is empty");
    }

    // Send email to admin
    await sendWaitlistEmail({
      name: session.user.name,
      email: session.user.email,
      phone: (session.user as any).phone,
      cartItems: items,
      total: total
    });

    return { success: true };
  } catch (error: any) {
    console.error("Waitlist checkout error:", error);
    return { success: false, error: error.message };
  }
}

export async function processGuestWaitlistCheckout(data: {
  name: string;
  email: string;
  phone: string;
  total: number;
}) {
  try {
    // Get the guest's cart
    const cartRes = await getCart();
    const items = cartRes?.items;

    if (!items || items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Send email to admin
    await sendWaitlistEmail({
      name: data.name,
      email: data.email,
      phone: data.phone,
      cartItems: items,
      total: data.total
    });

    return { success: true };
  } catch (error: any) {
    console.error("Guest waitlist checkout error:", error);
    return { success: false, error: error.message };
  }
}
