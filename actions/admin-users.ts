'use server';
// MUTATIONS ONLY. In Next.js App Router, Server Actions must ONLY be used for mutations (POST).
// Data fetching (GET) belongs in lib/data/ (Server Components) or Route Handlers (app/api/...).

import { getDb, connectDB } from "@/lib/db";
import { Cart } from "@/models/Cart";
import { Wishlist } from "@/models/Wishlist";
import { Address } from "@/models/Address";
import { ObjectId } from "mongodb";
import { updateTag } from "next/cache";

export async function softDeleteUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDb();

    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isDelete: true, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) return { success: false, message: "User not found" };

    // Immediately invalidate all active sessions
    await db.collection("session").deleteMany({ userId: new ObjectId(userId) });

    // Hard-delete ephemeral data (cart, wishlist, addresses)
    await connectDB();
    await Promise.all([
      Cart.deleteOne({ userId }),
      Wishlist.deleteMany({ userId }),
      Address.deleteMany({ userId }),
    ]);

    // Orders are intentionally kept for financial records
    updateTag("admin-users");
    updateTag("admin-stats");

    return { success: true, message: "User deleted successfully" };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to delete user" };
  }
}

export async function restoreUser(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const db = await getDb();
    const result = await db.collection("user").updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isDelete: false, updatedAt: new Date() } }
    );
    if (result.matchedCount === 0) return { success: false, message: "User not found" };
    updateTag("admin-users");
    updateTag("admin-stats");
    return { success: true, message: "User restored successfully" };
  } catch (error: any) {
    return { success: false, message: error.message || "Failed to restore user" };
  }
}
