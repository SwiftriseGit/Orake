'use server';

import { razorpay } from '@/lib/razorpay';

export async function createRazorpayOrder(amount: number, currency: string = 'INR') {
  try {
    // Validate amount (in rupees)
    if (amount < 1) {
      throw new Error('Amount must be at least ₹1');
    }

    // Create order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paisa (smallest currency unit)
      currency: currency,
      receipt: `receipt_${Date.now()}`,
      notes: {
        // Add custom metadata
        created_at: new Date().toISOString(),
      },
    });

    return {
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (error) {
    console.error('Order creation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Order creation failed',
    };
  }
}

import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { updateTag, revalidatePath } from "next/cache";

export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string,
  dbOrderId: string
) {
  try {
    const text = razorpay_order_id + "|" + razorpay_payment_id;
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      await connectDB();
      // Payment is successful, update DB order
      await Order.findByIdAndUpdate(dbOrderId, {
        isPaid: true,
        paidAt: new Date(),
        status: "Processing",
      });
      updateTag("orders");
      revalidatePath("/account");
      revalidatePath("/cart");
      return { success: true };
    } else {
      return { success: false, error: "Invalid signature" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}