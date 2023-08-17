import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import FancyError from "../utils/FancyError.js";
export const validateMogodbId = asyncHandler((req, res) => {
    const { _id } = req.user;
    const id = req.params.id || _id;
    const isValid = mongoose.Types.ObjectId.isValid(id);
    if (!isValid) {
        throw new FancyError('This id is not valid or not found', 404);
    }
});
