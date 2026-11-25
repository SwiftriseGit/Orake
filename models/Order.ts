import mongoose, { Schema } from "mongoose";
import { OrderItemSchema, IOrderItem } from "./OrderItem";
import { Counter } from "./Counter";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

export interface IOrder {
    orderNumber?: string;
    customerEmail?: string;
    userId?: mongoose.Schema.Types.ObjectId;
    guestEmail?: string;
    orderItems: IOrderItem[];
    shippingAddress: {
        fullName: string;
        phone: string;
        email?: string;
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    paymentMethod: string;
    paymentResult?: {
        id: string;
        status: string;
        update_time: string;
        email_address: string;
    };
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: Date;
    isDelivered: boolean;
    deliveredAt?: Date;
    status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
    trackingLink?: string;
}

const OrderSchema = new Schema<IOrder>({
    orderNumber: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    customerEmail: {
        type: String,
        required: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false,
        ref: "User"
    },
    guestEmail: {
        type: String,
        required: false
    },
    orderItems: [OrderItemSchema],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    },
    paymentMethod: { type: String, required: true },
    paymentResult: {
        id: String,
        status: String,
        update_time: String,
        email_address: String,
    },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    status: {
        type: String,
        enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    trackingLink: {
        type: String,
        required: false
    }
}, { timestamps: true });

OrderSchema.pre("save", async function () {
    // 1. Generate sequential orderNumber if this is a new order
    if (!this.orderNumber) {
        const now = new Date();
        const istDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        const yy = String(istDate.getFullYear()).slice(-2);
        const mm = String(istDate.getMonth() + 1).padStart(2, "0");
        const dd = String(istDate.getDate()).padStart(2, "0");
        const prefix = `${yy}${mm}${dd}`;

        const counter = await Counter.findByIdAndUpdate(
            `order_${prefix}`,
            { $inc: { seq: 1 } },
            { returnDocument: "after", upsert: true }
        );
        this.orderNumber = `${prefix}-${String(counter.seq).padStart(4, "0")}`;
    }

    // 2. Track whether this document is new for post('save') email hook
    if (this.isNew) {
        (this as any)._wasNew = true;
    }

    // 3. Status sync for Delivered
    if (this.status === "Delivered") {
        this.isDelivered = true;
        if (!this.deliveredAt) {
            this.deliveredAt = new Date();
        }
        if (!this.isPaid) {
            this.isPaid = true;
            if (!this.paidAt) {
                this.paidAt = new Date();
            }
        }
    } else {
        this.isDelivered = false;
    }
});

OrderSchema.post("save", async function (doc) {
    if ((this as any)._wasNew) {
        (this as any)._wasNew = false;
        const targetEmail = doc.customerEmail || doc.guestEmail || doc.shippingAddress?.email;
        if (targetEmail) {
            try {
                await sendOrderConfirmationEmail({
                    to: targetEmail,
                    orderNumber: doc.orderNumber || doc._id.toString(),
                    customerName: doc.shippingAddress?.fullName || "Valued Customer",
                    totalPrice: doc.totalPrice,
                    paymentMethod: doc.paymentMethod,
                    shippingAddress: doc.shippingAddress,
                    orderItems: doc.orderItems,
                });
            } catch (err) {
                console.error("Order confirmation email failed via Mongoose middleware:", err);
            }
        }
    }
});

OrderSchema.pre(["findOneAndUpdate", "updateOne", "updateMany"], function () {
    const update = this.getUpdate() as any;
    if (!update) return;

    const status = update.status ?? (update.$set && update.$set.status);
    if (status !== undefined) {
        if (status === "Delivered") {
            if (update.$set) {
                update.$set.isDelivered = true;
                if (!update.$set.deliveredAt) update.$set.deliveredAt = new Date();
                if (update.$set.isPaid === undefined) {
                    update.$set.isPaid = true;
                    if (!update.$set.paidAt) update.$set.paidAt = new Date();
                }
            } else {
                update.isDelivered = true;
                if (!update.deliveredAt) update.deliveredAt = new Date();
                if (update.isPaid === undefined) {
                    update.isPaid = true;
                    if (!update.paidAt) update.paidAt = new Date();
                }
            }
        } else {
            if (update.$set) {
                update.$set.isDelivered = false;
            } else {
                update.isDelivered = false;
            }
        }
    }
});

if (process.env.NODE_ENV !== "production") {
    delete (mongoose.models as any).Order;
}

export const Order = mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);
