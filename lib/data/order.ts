import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

async function getSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({ headers: reqHeaders });
}

export async function getOrders() {
  // No 'use cache' — per-user data, always fresh
  // Dynamic via getSession() -> headers()
  const session = await getSession();
  try {
    if (!session?.user) return { orders: [], total: 0 };

    await connectDB();

    const query = {
      userId: session.user.id,
      // Exclude abandoned Razorpay checkouts (unpaid + still Pending)
      $nor: [
        { paymentMethod: 'Razorpay', isPaid: false, status: 'Pending' }
      ]
    };

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return {
      orders: JSON.parse(JSON.stringify(orders)),
      total,
    };
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return { orders: [], total: 0 };
  }
}

