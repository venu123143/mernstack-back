import mongoose from "mongoose";
var enqSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    mobile: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
}, { collection: 'enquiry', timestamps: true });
export default mongoose.model('Enquiry', enqSchema);
