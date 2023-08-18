import mongoose from "mongoose";
var brandSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true,
    }
}, { timestamps: true, collection: 'brand' });
export default mongoose.model('Brand', brandSchema);
