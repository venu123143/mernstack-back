var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import Enquiry from "../models/EnqModel.js";
import FancyError from "../utils/FancyError.js";
import asyncHandler from "express-async-handler";
export const createEnquiry = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    if (!title) {
        throw new FancyError("title field is mandetory to create the Enquiry", 400);
    }
    try {
        const newEnquiry = yield Enquiry.create(req.body);
        res.json(newEnquiry);
    }
    catch (error) {
        throw new FancyError("no duplicate Enquirys allowed", 404);
    }
}));
export const updateEnquiry = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) {
        throw new FancyError("title field is mandetory to update the Enquiry", 400);
    }
    try {
        const updatedEnquiry = yield Enquiry.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedEnquiry);
    }
    catch (error) {
        throw new FancyError("cannot be able to create Enquiry", 401);
    }
}));
export const deleteEnquiry = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleteEnquiry = yield Enquiry.findByIdAndDelete(id);
        res.json(deleteEnquiry);
    }
    catch (error) {
        throw new FancyError("cannot be able to delete Enquiry", 404);
    }
}));
export const getEnquiry = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const getEnquiry = yield Enquiry.findById(id);
        res.json(getEnquiry);
    }
    catch (error) {
        throw new FancyError("cannot be able to get the Enquiry by this id", 404);
    }
}));
export const getAllEnquirys = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deleteEnquiry = yield Enquiry.find();
        res.json(deleteEnquiry);
    }
    catch (error) {
        throw new FancyError("cannot be able to get all Enquiry", 404);
    }
}));
