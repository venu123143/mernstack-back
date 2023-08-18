import mongoose from "mongoose";
var colorSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        index: true,
    }
}, { timestamps: true, collection: 'color' });
export default mongoose.model('Color', colorSchema);
