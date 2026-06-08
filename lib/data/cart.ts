import "server-only";
import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import "@/models/Product";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";

async function getSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({ headers: reqHeaders });
}

export async function getCart() {
  // No 'use cache' — per-user data must always be fresh
  await headers();
  try {
    const session = await getSession();
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guestId")?.value;

    if (!session?.user && !guestId) return { items: [] };

    await connectDB();
    const query = session?.user ? { userId: session.user.id } : { guestId };
    const cart = await Cart.findOne(query).populate('items.productId').lean();
    
    if (!cart) return { items: [] };

    // Map to the shape expected by the frontend
    const mappedItems = cart.items.map((item: any) => {
       const product = item.productId;
       return {
         id: product._id.toString(),
         name: product.name,
         flavor: product.slug, // using slug as flavor for now based on mockup
         price: product.price,
         oldPrice: product.oldPrice,
         qty: item.quantity,
         image: product.image,
       };
    });

    return { items: mappedItems };
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    return { items: [] };
  }
}

export async function getCartCount(): Promise<number> {
  await headers();
  try {
    const session = await getSession();
    const cookieStore = await cookies();
    const guestId = cookieStore.get("guestId")?.value;

    if (!session?.user && !guestId) return 0;
    await connectDB();
    const query = session?.user ? { userId: session.user.id } : { guestId };
    const cart = await Cart.findOne(query);
    if (!cart) return 0;
    return cart.items.length;
  } catch {
    return 0;
  }
}
