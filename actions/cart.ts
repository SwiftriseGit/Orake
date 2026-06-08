'use server';

import { connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { auth } from "@/lib/auth";
import { headers, cookies } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { getCartCount as _getCartCount } from "@/lib/data/cart";

export async function getCartCount(): Promise<number> {
  return _getCartCount();
}

async function getSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({ headers: reqHeaders });
}

async function getIdentifier() {
  const session = await getSession();
  if (session?.user) return { userId: session.user.id };

  const cookieStore = await cookies();
  let guestId = cookieStore.get("guestId")?.value;
  
  if (!guestId) {
    guestId = crypto.randomUUID();
    cookieStore.set("guestId", guestId, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/"
    });
  }
  return { guestId };
}

export async function addToCart(productId: string, quantity: number = 1) {
  try {
    const identifier = await getIdentifier();
    await connectDB();

    let cart = await Cart.findOne(identifier);

    if (!cart) {
      cart = new Cart({ ...identifier, items: [] });
    }

    let isNewItem = false;
    const existingItemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId);

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
      isNewItem = true;
    }

    await cart.save();
    revalidatePath("/cart");
    return { success: true, isNewItem };
  } catch (error: any) {
    console.error("Add to cart error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCartItemQty(productId: string, quantity: number) {
  try {
    const identifier = await getIdentifier();
    await connectDB();
    const cart = await Cart.findOne(identifier);
    if (!cart) throw new Error("Cart not found");

    const existingItemIndex = cart.items.findIndex((item: any) => item.productId.toString() === productId);
    if (existingItemIndex > -1) {
      if (quantity <= 0) {
        cart.items.splice(existingItemIndex, 1);
      } else {
        cart.items[existingItemIndex].quantity = quantity;
      }
      await cart.save();
      revalidatePath("/cart");
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeFromCart(productId: string) {
  try {
    const session = await getSession();
    const cookieStore = await cookies();
    let guestId = cookieStore.get("guestId")?.value;

    await connectDB();

    if (session?.user) {
      // Logged in: remove from user cart
      const userCart = await Cart.findOne({ userId: session.user.id });
      if (userCart) {
        userCart.items = userCart.items.filter((item: any) => item.productId.toString() !== productId);
        await userCart.save();
      }

      // Defensively remove from guest cart too, if cookie exists
      if (guestId) {
        const guestCart = await Cart.findOne({ guestId });
        if (guestCart) {
          guestCart.items = guestCart.items.filter((item: any) => item.productId.toString() !== productId);
          await guestCart.save();
        }
      }
    } else {
      // Guest: remove from guest cart
      const identifier = await getIdentifier();
      const cart = await Cart.findOne(identifier);
      if (cart) {
        cart.items = cart.items.filter((item: any) => item.productId.toString() !== productId);
        await cart.save();
      }
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function clearCart() {
  try {
    const identifier = await getIdentifier();
    await connectDB();
    await Cart.findOneAndUpdate(identifier, { items: [] });
    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Merges guest cart → user cart on login, then deletes the guest cart.
 * Called from LoginForm / VerifyOTPForm after successful auth.
 */
export async function syncGuestCartToUser() {
  try {
    const session = await getSession();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const cookieStore = await cookies();
    const guestId = cookieStore.get("guestId")?.value;
    if (!guestId) return { success: true, synced: 0 };

    await connectDB();

    const guestCart = await Cart.findOne({ guestId });
    if (!guestCart || guestCart.items.length === 0) return { success: true, synced: 0 };

    // Find or create user cart
    let userCart = await Cart.findOne({ userId: session.user.id });
    if (!userCart) {
      userCart = new Cart({ userId: session.user.id, items: [] });
    }

    // Merge: for each guest item, add or increment in user cart
    for (const guestItem of guestCart.items) {
      const existingIdx = userCart.items.findIndex(
        (item: any) => item.productId.toString() === guestItem.productId.toString()
      );

      if (existingIdx > -1) {
        // Item exists in both — keep the higher quantity
        userCart.items[existingIdx].quantity = Math.max(
          userCart.items[existingIdx].quantity,
          guestItem.quantity
        );
      } else {
        // New item — add to user cart
        userCart.items.push({
          productId: guestItem.productId,
          quantity: guestItem.quantity,
        });
      }
    }

    await userCart.save();

    // Delete guest cart & clear cookie
    await Cart.deleteOne({ guestId });
    cookieStore.delete("guestId");

    revalidatePath("/cart");
    return { success: true, synced: guestCart.items.length };
  } catch (error: any) {
    console.error("Sync guest cart error:", error);
    return { success: false, error: error.message };
  }
}
