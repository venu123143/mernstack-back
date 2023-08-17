import mongoose from "mongoose";
var categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        index: true,
    }
}, { timestamps: true, collection: 'category' });
export default mongoose.model('Category', categorySchema);
