import mongoose, { Document, Model, Schema, model } from 'mongoose';
import { IUser } from "./UserModel.js"

//     orderStatus: 'Not Processed' | 'Processing' | 'Dispatched' | 'Cancelled' | 'DeliveredF';
//     paymentMethod: 'Cash on Delivery' | "UPI" | "Online Payment" | "GiftCard" | "Credit Card EMI" | "CreditCard NO-Cost Emi"


interface IShippingInfo {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    landmark?: string;
    pincode: number;
    mobile: string;
}

interface IPaymentInfo {
    razorPayOrderId: string;
    razorPayPaymentId: string;
}

interface IOrderItem {
    product: string; // Reference to a Product
    color: string;   // Reference to a Color
    quantity: number;
    price: number;
}

interface IOrder extends Document {
    user: IUser;
    shippingInfo: IShippingInfo;
    paymentInfo: IPaymentInfo;
    orderItems: IOrderItem[];
    paidAt: Date;
    totalPrice: number;
    orderStatus: string;
}

const orderSchema: Schema = new Schema<IOrder>({
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
    },
    orderItems: [{
        type: Schema.Types.ObjectId,
        ref: "Product",
    }],
    totalPrice: {
        type: Number,
        required: true,
    },
    orderStatus: {
        type: String,
        default: "Ordered"
    }

}, { timestamps: true, collection: 'orders' });

export default mongoose.model<IOrder>('Order', orderSchema);

