import mongoose, { Schema } from "mongoose";
import { OrderItemSchema, IOrderItem } from "./OrderItem";

export interface IOrder {
    userId?: mongoose.Schema.Types.ObjectId;
    guestEmail?: string;
    orderItems: IOrderItem[];
    shippingAddress: {
        fullName: string;
        phone: string;
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
}

const OrderSchema = new Schema<IOrder>({
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
    }
}, { timestamps: true });

OrderSchema.pre("save", function () {
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
