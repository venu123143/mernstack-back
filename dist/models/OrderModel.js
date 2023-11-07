import mongoose, { Schema } from 'mongoose';
const orderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shippingInfo: {
        name: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: false
        },
        state: {
            type: String,
            required: true
        },
        landmark: {
            type: String,
            required: false
        },
        pincode: {
            type: Number,
            required: true
        },
        mobile: {
            type: String,
            required: true
        }
    },
    paymentInfo: {
        razorPayOrderId: {
            type: String,
            required: true
        },
        razorPayPaymentId: {
            type: String,
            required: true
        },
        paidWith: {
            type: String,
            required: true
        }
    },
    orderItems: [{
            product: {
                type: Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: {
                type: Number,
                required: true,
            },
            color: {
                type: String,
                required: true
            },
            orderStatus: {
                type: String,
                required: true,
                default: "Ordered"
            },
        }],
    totalPrice: {
        type: Number,
        required: true,
    },
}, { timestamps: true, collection: 'orders' });
export default mongoose.model('Order', orderSchema);
