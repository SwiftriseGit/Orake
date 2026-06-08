'use server';

import { connectDB } from "@/lib/db";
import { Order } from "@/models/Order";
import { clearCart } from "@/actions/cart";
import { getCart } from "@/lib/data/cart";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { updateTag, revalidatePath } from "next/cache";
import { razorpay } from "@/lib/razorpay";

async function getSession() {
  const reqHeaders = await headers();
  return auth.api.getSession({ headers: reqHeaders });
}

interface ShippingAddress {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
}

export async function placeOrder(shippingAddress: ShippingAddress & { email?: string }, paymentMethod: string) {
  try {
    const session = await getSession();
    // We no longer throw Unauthorized. We allow guests.

    // Get the user's cart (which now correctly uses session or guest cookie)
    const cartRes = await getCart();
    const items = cartRes?.items;

    if (!items || items.length === 0) {
        throw new Error("Cart is empty");
    }

    await connectDB();

    // Determine past orders count for discount
    let pastOrdersCount = 0;
    
    if (session?.user) {
      const orderCountQuery = {
        userId: session.user.id,
        $nor: [
          { paymentMethod: 'Razorpay', isPaid: false, status: 'Pending' }
        ]
      };
      pastOrdersCount = await Order.countDocuments(orderCountQuery);
    } else if (shippingAddress.email) {
      // If guest, use their email to check past orders
      const orderCountQuery = {
        guestEmail: shippingAddress.email,
        $nor: [
          { paymentMethod: 'Razorpay', isPaid: false, status: 'Pending' }
        ]
      };
      pastOrdersCount = await Order.countDocuments(orderCountQuery);
    }

    const isFirstTime = pastOrdersCount === 0;
    const targetRate = isFirstTime ? 0.80 : 0.85;

    // Calculate totals
    const itemsPrice = items.reduce((acc: number, item: any) => acc + (item.price * (item.qty || item.quantity)), 0);
    const originalItemsPrice = items.reduce((acc: number, item: any) => acc + ((item.oldPrice || item.price) * (item.qty || item.quantity)), 0);
    
    const targetTotal = Math.round(originalItemsPrice * targetRate);
    const discountAmount = Math.max(0, itemsPrice - targetTotal);

    const subtotalAfterDiscount = Math.max(0, itemsPrice - discountAmount);

    const shippingPrice = subtotalAfterDiscount > 999 ? 0 : 99; // Standard rule
    const taxPrice = 0; // Or whatever calculation
    const totalPrice = subtotalAfterDiscount + shippingPrice + taxPrice;

    // Format items for DB
    const orderItems = items.map((item: any) => ({
        name: item.name,
        quantity: item.qty || item.quantity,
        image: item.image,
        price: item.price,
        productId: item.id || item.productId || item._id
    }));

    // Create the order in MongoDB
    const order = new Order({
        userId: session?.user?.id,
        guestEmail: !session?.user ? shippingAddress.email : undefined,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        isPaid: false,
        status: paymentMethod === 'COD' ? 'Processing' : 'Pending', // COD starts Processing, Online starts Pending
    });

    // If Razorpay, we also need to generate the razorpay order
    if (paymentMethod === 'Razorpay') {
        const rzpOrder = await razorpay.orders.create({
            amount: totalPrice * 100, // paise
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        });

        order.paymentResult = {
            id: rzpOrder.id, // We store the Razorpay Order ID here
            status: rzpOrder.status,
            update_time: new Date().toISOString(),
            email_address: session?.user?.email || shippingAddress.email || ""
        };
    }

    await order.save();

    // If COD, clear the cart immediately since order is placed
    if (paymentMethod === 'COD') {
        await clearCart();
    }

    // Return the required info to the frontend
    if (session?.user) {
      revalidatePath("/account");
    }
    revalidatePath("/cart");

    return {
        success: true,
        orderId: order._id.toString(),
        totalPrice,
        razorpayOrderId: order.paymentResult?.id
    };

  } catch (error: any) {
    console.error("Place order error:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserOrders(page: number = 1, limit: number = 3) {
  // Dynamic via getSession() -> headers() — no opt-out needed
  try {
    const session = await getSession();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    await connectDB();
    
    const skip = (page - 1) * limit;
    
    const query = {
      userId: session.user.id,
      $nor: [
        // Hide abandoned checkouts (Razorpay unpaid orders still in Pending status)
        { paymentMethod: 'Razorpay', isPaid: false, status: 'Pending' }
      ]
    };
    
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
      
    return { 
      success: true, 
      orders: JSON.parse(JSON.stringify(orders)),
      total,
      totalPages: Math.ceil(total / limit),
      page
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}



export async function cancelOrder(id: string) {
  try {
    const session = await getSession();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    await connectDB();
    
    const order = await Order.findOne({ _id: id, userId: session.user.id });
    if (!order) return { success: false, error: "Order not found" };
    
    if (order.status !== "Pending" && order.status !== "Processing") {
       return { success: false, error: "Cannot cancel order at this stage" };
    }
    
    order.status = "Cancelled";
    await order.save();
    
    updateTag("orders");
    
    return { success: true, order: JSON.parse(JSON.stringify(order)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAbandonedOrder(id: string) {
  try {
    await connectDB();
    
    const order = await Order.findById(id);
    if (!order) return { success: false, error: "Order not found" };
    
    // Only allow deleting if it's a pending Razorpay order that was never paid
    if (order.paymentMethod === "Razorpay" && order.status === "Pending" && !order.isPaid) {
      await Order.findByIdAndDelete(id);
      return { success: true };
    }
    
    return { success: false, error: "Cannot delete this order" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
