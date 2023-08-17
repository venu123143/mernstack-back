import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBlog extends Document {
    _id: Types.ObjectId;
    title: string;
    description: string;
    category: string;
    numViews: number;
    isLiked: boolean;
    isDisliked: boolean;
    likes: Schema.Types.ObjectId[];
    dislikes: Schema.Types.ObjectId[];
    image: string;
    auther: string;
    createdAt: Date;
    updatedAt: Date;
}

// Declare the Schema of the Mongo model
var blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        unique: false,
    },
    category: {
        type: String,
        required: true,
        unique: false,
    },
    numViews: {
        type: Number,
        default: 0
    },
    isLiked: {
        type: Boolean,
        default: false
    },
    isDisliked: {
        type: Boolean,
        default: false
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    image: {
        type: String,
        default: "https://images.pexels.com/photos/262508/pexels-photo-262508.jpeg"
    },
    auther: {
        type: String,
        default: "Admin"
    },
    images: {
        type: Array
    }

}, { timeStamps: true, collection: 'blogs' })

//Export the model
export default mongoose.model<IBlog>('Blog', blogSchema);