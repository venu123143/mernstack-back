import mongoose, { Types } from "mongoose";


// product interface
export interface IProduct {
    _id: Types.ObjectId;
    title: string;
    slug: string;
    description: string;
    price: number;
    category: Types.ObjectId;
    brand: Types.ObjectId;
    tags: string[];
    quantity?: number;
    sold?: number;
    images?: string[];
    color: string[];
    ratings?: Rating[];
    totalRating: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Rating {
    _id: Types.ObjectId;
    star: number;
    comment: string;
    postedBy: mongoose.Types.ObjectId;
}
// Declare the Schema of the Mongo model
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
        select: false
    },
    images: {
        type: Array,
    },
    color: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Color"
    }],
    ratings: [{
        star: Number,
        comment: String,
        postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }],
    totalRating: {
        type: Number,
        default: true
    }
}, { collection: 'products', timestamps: true });
//Export the model


export default mongoose.model<IProduct & mongoose.Document>('Product', productSchema);