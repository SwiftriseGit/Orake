import mongoose, { Schema, Types } from "mongoose";

export interface ICartItem {
    productId: Types.ObjectId;
    quantity: number;
}

export interface ICart {
    userId?: Types.ObjectId;
    guestId?: string;
    items: ICartItem[];
}

const CartSchema = new Schema<ICart>({
    userId: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "User"
    },
    guestId: {
        type: String,
        required: false
    },
    items: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: "Product"
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ]
});

export const Cart =
    mongoose.models.Cart || mongoose.model<ICart>("Cart", CartSchema);