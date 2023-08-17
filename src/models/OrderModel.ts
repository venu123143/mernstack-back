import mongoose, { Document, Model, Schema, model } from 'mongoose';

interface IOrderItem {
    product: Schema.Types.ObjectId;
    count: number;
    color: string;
}

interface IOrder extends Document {
    products: IOrderItem[];
    paymentIntent: any;
    orderStatus: 'Not Processed' | 'Processing' | 'Dispatched' | 'Cancelled' | 'DeliveredF';
    paymentMethod: 'Cash on Delivery' | "UPI" | "Online Payment" | "GiftCard" | "Credit Card EMI" | "CreditCard NO-Cost Emi"
    orderBy: Schema.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}


const orderSchema: Schema = new Schema<IOrder>({
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

export default mongoose.model<IOrder>('Order', orderSchema);

