import mongoose, { Document } from 'mongoose';

interface Coupon extends Document {
    name: string;
    expiry: Date;
    discount: number;
}

const couponSchema = new mongoose.Schema<Coupon>({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    expiry: {
        type: Date,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
        max: 100
    },
}, { collection: 'coupon' });

const CouponModel = mongoose.model<Coupon>('Coupon', couponSchema);

export default CouponModel;
