import mongoose, { Document, Model, Schema, model } from 'mongoose';

export interface ICartItem {
    _id: Schema.Types.ObjectId;
    count: number;
    color?: string;
    price?: number;
}

export interface ICart extends Document {
    products: ICartItem[];
    total: number;
    cartTotal: number;
    deliveryCharge: number;
    tip: number;
    handlingCharge: number;
    totalAfterDiscount: number;
    orderBy: Schema.Types.ObjectId; // Assuming you have a User model
    createdAt: Date;
    updatedAt: Date;
}

const cartSchema: Schema = new Schema<ICart>({
    products: [
        {
            _id: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            count: Number,
            color: String
        }
    ],
    deliveryCharge: {
        type: Number,
        default: 0
    },
    tip: {
        type: Number,
        default: 0
    },
    handlingCharge: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        default: 0
    },
    cartTotal: {
        type: Number,
        default: 0
    },
    totalAfterDiscount: Number,
    orderBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true, collection: 'cart' })

export default mongoose.model<ICart>('Cart', cartSchema)