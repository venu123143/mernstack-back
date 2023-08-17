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
    deliveryCharge: Number,
    tip: Number,
    handlingCharge: Number,
    total: Number,
    cartTotal: Number,
    totalAfterDiscount: Number,
    orderBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true, collection: 'cart' });
export default mongoose.model('Cart', cartSchema);
