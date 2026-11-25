import mongoose, { Schema } from "mongoose";

export interface IOrderItem {
    productId: mongoose.Schema.Types.ObjectId;
    name: string;
    quantity: number;
    price: number;
    image: string;
}

export const OrderItemSchema = new Schema<IOrderItem>({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product"
    },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: { 
        type: String, 
        required: true,
        set: (val: any) => (typeof val === 'string' ? val : val?.url || '')
    },
});
