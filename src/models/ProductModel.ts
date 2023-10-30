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
    details: any;
    quantity?: number;
    sold?: number;
    images?: string[];
    color: string[];
    seller: Types.ObjectId;
    ratings?: Rating[];
    totalRating: number;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Rating {
    _id: Types.ObjectId;
    star: number;
    comment?: string;
    title?: string;
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
    details: {
        type: mongoose.Schema.Types.Mixed,
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
//Export the model


export default mongoose.model<IProduct & mongoose.Document>('Product', productSchema);