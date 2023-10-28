import mongoose from "mongoose";
var productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Brand"
    },
    tags: [],
    quantity: {
        type: Number,
        required: true
    },
    sold: {
        type: Number,
        default: 0,
    },
    images: {
        type: Array,
    },
    color: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Color"
        }],
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    ratings: [{
            star: Number,
            comment: String,
            title: String,
            postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
        }],
    totalRating: {
        type: Number,
        default: true
    }
}, { collection: 'products', timestamps: true });
export default mongoose.model('Product', productSchema);
