var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Color from "../models/ColorModel.js";
import FancyError from "../utils/FancyError.js";
import asyncHandler from "express-async-handler";
export const createColor = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    if (!title) {
        throw new FancyError("title field is mandetory to create the Color", 400);
    }
    try {
        const newColor = yield Color.create(req.body);
        res.json(newColor);
    }
    catch (error) {
        throw new FancyError("no duplicate colors allowed", 404);
    }
}));
export const updateColor = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) {
        throw new FancyError("title field is mandetory to update the Color", 400);
    }
    try {
        const updatedColor = yield Color.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedColor);
    }
    catch (error) {
        throw new FancyError("cannot be able to create Color", 401);
    }
}));
export const deleteColor = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleteColor = yield Color.findByIdAndDelete(id);
        res.json(deleteColor);
    }
    catch (error) {
        throw new FancyError("cannot be able to delete Color", 404);
    }
}));
export const getColor = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const getColor = yield Color.findById(id);
        res.json(getColor);
    }
    catch (error) {
        throw new FancyError("cannot be able to get the Color by this id", 404);
    }
}));
export const getAllColors = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleteColor = yield Color.find();
        res.json(deleteColor);
    }
    catch (error) {
        throw new FancyError("cannot be able to get all Color", 404);
    }
}));
