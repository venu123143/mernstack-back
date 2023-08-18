import mongoose from "mongoose";

// Declare the Schema of the Mongo model
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

//Export the model
export default mongoose.model('Enquiry', enqSchema);