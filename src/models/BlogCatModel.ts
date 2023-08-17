import mongoose, { Types } from "mongoose";
import { Category } from "./ProdcategoryModel.js";
// export interface Category extends Document {
//     _id: Types.ObjectId;
//     title: string;
// }

var blogcategorySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        index: true,
    }
}, { timestamps: true, collection: 'blogcategory' })


export default mongoose.model<Category>('BlogCategory', blogcategorySchema)
