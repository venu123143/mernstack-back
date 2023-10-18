import mongoose, { Types } from "mongoose";
import { Category } from "./ProdcategoryModel.js";

var colorSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        index: true,
        uppercase: true,
        
    }
}, { timestamps: true, collection: 'color' })


export default mongoose.model<Category>('Color', colorSchema)
