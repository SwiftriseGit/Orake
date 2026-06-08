'use server';

import { connectDB } from "@/lib/db";
import { Wishlist } from "@/models/Wishlist";
import { Product } from "@/models/Product";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  getWishlistCount as _getWishlistCount
} from "@/lib/data/wishlist";


export async function getWishlistCount(): Promise<number> {
  return _getWishlistCount();
}

async function getSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({ headers: reqHeaders });
}

export async function toggleWishlist(productId: string) {
  try {
    const session = await getSession();
    if (!session?.user) throw new Error("Unauthorized");

    await connectDB();

    const existing = await Wishlist.findOne({
      userId: session.user.id,
      productId: productId
    });

    if (existing) {
      await Wishlist.deleteOne({ _id: existing._id });
    } else {
      await Wishlist.create({
        userId: session.user.id,
        productId: productId
      });
    }

    // Revalidate with "layout" type to bust the entire route cache tree,
    // including the client-side router cache for these paths
    revalidatePath("/wishlist");
    revalidatePath("/products");

    return { success: true, added: !existing };
  } catch (error: any) {
    console.error("Toggle wishlist error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Syncs guest wishlist (from localStorage slugs) to DB on login.
 * Resolves slugs → productIds, then merges without duplicates.
 */
export async function syncGuestWishlist(slugs: string[]) {
  try {
    const session = await getSession();
    if (!session?.user) return { success: false, error: "Unauthorized" };
    if (!slugs.length) return { success: true, synced: 0 };

    await connectDB();

    // Resolve slugs to product IDs
    const products = await Product.find({ slug: { $in: slugs } })
      .select("_id")
      .lean();
    const productIds = products.map((p: any) => p._id.toString());

    if (!productIds.length) return { success: true, synced: 0 };

    // Fetch existing wishlist items for this user
    const existing = await Wishlist.find({ userId: session.user.id }).lean();
    const existingIds = new Set(existing.map((w: any) => w.productId.toString()));

    // Only add items that don't already exist
    const newItems = productIds
      .filter(id => !existingIds.has(id))
      .map(productId => ({
        userId: session.user.id,
        productId,
      }));

    if (newItems.length > 0) {
      await Wishlist.insertMany(newItems);
    }

    revalidatePath("/wishlist");
    revalidatePath("/products");

    return { success: true, synced: newItems.length };
  } catch (error: any) {
    console.error("Sync guest wishlist error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches product details for an array of product slugs.
 * Used by the wishlist page to display guest wishlist items.
 */
export async function getProductsBySlugs(slugs: string[]) {
  try {
    if (!slugs.length) return { success: true, products: [] };

    await connectDB();

    const products = await Product.find({ slug: { $in: slugs } })
      .select("_id name slug price oldPrice size image stock discount numReviews")
      .lean();

    return {
      success: true,
      products: JSON.parse(JSON.stringify(products)),
    };
  } catch (error: any) {
    console.error("Get products by slugs error:", error);
    return { success: false, products: [], error: error.message };
  }
}

