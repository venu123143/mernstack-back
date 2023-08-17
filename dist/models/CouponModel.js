import mongoose from 'mongoose';
const couponSchema = new mongoose.Schema({
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
const CouponModel = mongoose.model('Coupon', couponSchema);
export default CouponModel;
