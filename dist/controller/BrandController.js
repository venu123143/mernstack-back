var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Brand from "../models/BrandModel.js";
import FancyError from "../utils/FancyError.js";
import asyncHandler from "express-async-handler";
export const createBrand = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    if (!title) {
        throw new FancyError("title field is mandetory to create the Brand", 400);
    }
    try {
        const newBrand = yield Brand.create(req.body);
        res.json(newBrand);
    }
    catch (error) {
        throw new FancyError("cannot be able to create Brand", 401);
    }
}));
export const updateBrand = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) {
        throw new FancyError("title field is mandetory to update the Brand", 400);
    }
    try {
        const updatedBrand = yield Brand.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedBrand);
    }
    catch (error) {
        throw new FancyError("cannot be able to create Brand", 401);
    }
}));
export const deleteBrand = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleteBrand = yield Brand.findByIdAndDelete(id);
        res.json(deleteBrand);
    }
    catch (error) {
        throw new FancyError("cannot be able to delete Brand", 404);
    }
}));
export const getBrand = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const getBrand = yield Brand.findById(id);
        res.json(getBrand);
    }
    catch (error) {
        throw new FancyError("cannot be able to get the Brand by this id", 404);
    }
}));
export const getAllBrands = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleteBrand = yield Brand.find();
        res.json(deleteBrand);
    }
    catch (error) {
        throw new FancyError("cannot be able to get all Brand", 404);
    }
}));
