import "server-only";
// lib/data/admin-orders.ts
// NO 'use server' — plain async data function (server-only)
// Mutations (updateOrderStatus) stay in actions/admin-orders.ts

import { getDb } from "@/lib/db";

export const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];

export interface OrderFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface AdminOrder {
  _id: string;
  orderNumber?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  orderItems: { name: string; price: number; quantity: number; image?: string }[];
  totalPrice: number;
  paymentMethod?: string;
  isPaid: boolean;
  isDelivered?: boolean;
  deliveredAt?: string;
  paidAt?: string;
  status: OrderStatus;
  trackingLink?: string;
  shippingAddress: { street?: string; city?: string; state?: string; postalCode?: string };
  createdAt: string;
}

// Orders are NOT cached — live financial data
export async function getAdminOrders(filters: OrderFilters = {}): Promise<{ orders: AdminOrder[]; total: number; totalPages: number; page: number }> {
  const { search = "", status = "All", page = 1, limit = 8 } = filters;
  const db = await getDb();

  const orderMatch: Record<string, any> = {};
  if (status !== "All") orderMatch.status = status;

  const skip = (page - 1) * limit;

  const [results] = await db.collection("orders").aggregate([
    { $match: orderMatch },
    { $lookup: { from: "user", localField: "userId", foreignField: "_id", as: "userDoc" } },
    {
      $addFields: {
        customerName:  { $arrayElemAt: ["$userDoc.name", 0] },
        customerEmail: { $arrayElemAt: ["$userDoc.email", 0] },
        customerPhone: { $arrayElemAt: ["$userDoc.phone", 0] },
      }
    },
    ...(search.trim() ? [{
      $match: {
        $or: [
          { customerName:  { $regex: search.trim(), $options: "i" } },
          { customerEmail: { $regex: search.trim(), $options: "i" } },
        ]
      }
    }] : []),
    { $project: { userDoc: 0 } },
    {
      $facet: {
        total: [{ $count: "count" }],
        data: [{ $sort: { createdAt: -1 } }, { $skip: skip }, { $limit: limit }]
      }
    }
  ]).toArray();

  const total = results?.total?.[0]?.count ?? 0;

  return {
    orders: JSON.parse(JSON.stringify(results?.data ?? [])),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
