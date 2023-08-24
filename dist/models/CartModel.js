import mongoose, { Schema } from 'mongoose';
const cartSchema = new Schema({
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
}, { timestamps: true, collection: 'cart' });
export default mongoose.model('Cart', cartSchema);
