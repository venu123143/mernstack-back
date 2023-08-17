import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import FancyError from "../utils/FancyError.js";
import { IUser } from "../models/UserModel.js";


export const validateMogodbId = asyncHandler((req, res) => {
    const { _id } = req.user as IUser;
    const id = req.params.id || _id as any
    const isValid = mongoose.Types.ObjectId.isValid(id)
    if (!isValid) {
        throw new FancyError('This id is not valid or not found', 404);
    }
})
