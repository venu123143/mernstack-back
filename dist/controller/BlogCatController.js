var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import FancyError from "../utils/FancyError.js";
import asyncHandler from "express-async-handler";
import Category from "../models/BlogCatModel.js";
export const createCategory = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    if (!title) {
        throw new FancyError("title field is mandetory to create the category", 400);
    }
    try {
        const newCategory = yield Category.create(req.body);
        res.json(newCategory);
    }
    catch (error) {
        throw new FancyError("cannot be able to create Category", 401);
    }
}));
export const updateCategory = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) {
        throw new FancyError("title field is mandetory to update the category", 400);
    }
    try {
        const updatedCategory = yield Category.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedCategory);
    }
    catch (error) {
        throw new FancyError("cannot be able to create Category", 401);
    }
}));
export const deleteCategory = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleteCategory = yield Category.findByIdAndDelete(id);
        res.json(deleteCategory);
    }
    catch (error) {
        throw new FancyError("cannot be able to delete Category", 404);
    }
}));
export const getCategory = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const getCategory = yield Category.findById(id);
        res.json(getCategory);
    }
    catch (error) {
        throw new FancyError("cannot be able to get the Category by this id", 404);
    }
}));
export const getAllCategories = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleteCategory = yield Category.find();
        res.json(deleteCategory);
    }
    catch (error) {
        throw new FancyError("cannot be able to get all Categories", 404);
    }
}));
