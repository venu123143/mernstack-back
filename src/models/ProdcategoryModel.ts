import mongoose, { Types } from "mongoose";
export interface Category extends Document {
    _id: Types.ObjectId;
    title: string;
}
var categorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        index: true,
    }
}, { timestamps: true, collection: 'category' })


export default mongoose.model<Category>('Category', categorySchema)
