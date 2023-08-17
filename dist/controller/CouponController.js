var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Coupon from "../models/CouponModel.js";
import asyncHandler from "express-async-handler";
import FancyError from "../utils/FancyError.js";
export const createCoupon = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, expiry, discount } = req.body;
    if (!name || !expiry || !discount) {
        throw new FancyError("all fields are mandatory", 400);
    }
    try {
        const coupon = yield Coupon.create(req.body);
        res.json(coupon);
    }
    catch (error) {
        throw new FancyError("coupon should be unique and max discount be 100%", 500);
    }
}));
export const getAllCoupons = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coupons = yield Coupon.find();
        res.json(coupons);
    }
    catch (error) {
        throw new FancyError("cannot get all products", 400);
    }
}));
export const updateCoupon = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, expiry, discount } = req.body;
    try {
        const update_coupon = yield Coupon.findByIdAndUpdate(id, req.body, { new: true });
        res.json(update_coupon);
    }
    catch (error) {
        throw new FancyError("cannot update the coupon ", 500);
    }
}));
export const deleteCoupon = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const delete_coupon = yield Coupon.findByIdAndDelete(id);
        res.json(delete_coupon);
    }
    catch (error) {
        throw new FancyError("cannot delete the coupon ", 500);
    }
}));
export const getSingleCoupon = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const get_coupon = yield Coupon.findById(id);
        res.json(get_coupon);
    }
    catch (error) {
        throw new FancyError("cannot delete the coupon ", 500);
    }
}));
