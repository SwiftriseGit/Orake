'use server';

import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { updateTag } from "next/cache";
import type { OrderStatus } from "@/lib/data/admin-orders";

export async function updateOrderStatus(id: string, status: OrderStatus, trackingLink?: string) {
  await connectDB();

  const updateData: any = { status };

  if (trackingLink !== undefined) {
    updateData.trackingLink = trackingLink.trim();
  }

  if (status === "Delivered") {
    updateData.isDelivered = true;
    updateData.deliveredAt = new Date();
    updateData.isPaid = true;
    updateData.paidAt = new Date();
  } else {
    updateData.isDelivered = false;
  }

  await Order.findByIdAndUpdate(id, updateData, { new: true });
  updateTag("admin-orders");
  updateTag("admin-stats");
  updateTag("orders");
  return { success: true };
}

export async function updateOrderTrackingLink(id: string, trackingLink: string) {
  await connectDB();
  await Order.findByIdAndUpdate(id, { trackingLink: trackingLink.trim() }, { new: true });
  updateTag("admin-orders");
  updateTag("admin-stats");
  updateTag("orders");
  return { success: true };
}

export async function updateOrderPaymentStatus(id: string, isPaid: boolean) {
  await connectDB();
  const updateData: any = {
    isPaid,
    paidAt: isPaid ? new Date() : null,
  };
  await Order.findByIdAndUpdate(id, updateData, { new: true });
  updateTag("admin-orders");
  updateTag("admin-stats");
  updateTag("orders");
  return { success: true };
}
