var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import User from "../models/UserModel.js";
import FancyError from "../utils/FancyError.js";
export const authMiddleware = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { loginToken } = req.cookies;
    try {
        const decode = jwt.verify(loginToken, process.env.SECRET_KEY);
        const user = yield User.findById(decode._id);
        if (user !== null) {
            req.user = user;
            next();
        }
    }
    catch (error) {
        console.log(error);
        throw new FancyError('not Authorized..!, please login again', 401);
    }
}));
export const isAdmin = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.user;
    const adminUser = yield User.findOne({ email });
    if ((adminUser === null || adminUser === void 0 ? void 0 : adminUser.role) !== "admin") {
        throw new FancyError("You are not an admin", 401);
    }
    else {
        next();
    }
}));
