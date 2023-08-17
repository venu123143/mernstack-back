import mongoose, { Schema } from 'mongoose';
const orderSchema = new Schema({
    products: [
        {
            product: {
                type: Schema.Types.ObjectId,
                ref: 'Product'
            },
            count: Number,
            color: String
        }
    ],
    paymentIntent: {},
    orderStatus: {
        type: String,
        default: 'Not Processed',
        enum: ['Not Processed', 'Processing', 'Dispatched', 'Cancelled', 'Delivered']
    },
    paymentMethod: {
        type: String,
        enum: ["Cash on Delivery", "UPI", "Debit Card", "GiftCard", "Credit Card EMI", "CreditCard NO-Cost Emi"]
    },
    orderBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true, collection: 'orders' });
export default mongoose.model('Order', orderSchema);
