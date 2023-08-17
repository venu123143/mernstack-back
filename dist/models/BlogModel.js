import mongoose from 'mongoose';
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
}, { timeStamps: true, collection: 'blogs' });
export default mongoose.model('Blog', blogSchema);
