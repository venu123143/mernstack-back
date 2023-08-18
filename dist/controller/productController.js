var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import asyncHandler from "express-async-handler";
import slugify from "slugify";
import fs from 'fs';
import Product from "../models/ProductModel.js";
import FancyError from "../utils/FancyError.js";
import User from "../models/UserModel.js";
import { uploadImage, deleteImage } from "../utils/Cloudinary.js";
export const createProduct = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.body.title) {
            req.body.slug = slugify.default(req.body.title);
        }
        const product = yield Product.create(req.body);
        res.json(product);
    }
    catch (error) {
        console.log(error);
        throw new FancyError(" can't be able to create product, enter all required fields..!", 400);
    }
}));
export const updateProduct = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify.default(req.body.title);
        }
        const updateProd = yield Product.findOneAndUpdate({ _id: id }, req.body, { new: true }).populate(['category', 'brand', 'color']);
        res.json(updateProd);
    }
    catch (error) {
        throw new FancyError(" can't be able to update product, Try Again..!", 400);
    }
}));
export const deleteProduct = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deleteProd = yield Product.findByIdAndDelete(id);
        if (deleteProd !== null) {
            res.json({ deleteProd, message: "item deleted sucessfully" });
        }
        else {
            res.json({ message: "no item  with this id or already deleted..!" });
        }
    }
    catch (error) {
        throw new FancyError(" can't be able to delete the product, Try Again..!", 400);
    }
}));
export const getProduct = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const findProduct = yield Product.findById({ _id: id }).populate(['category', 'brand', 'color']);
        if (findProduct !== null) {
            res.json(findProduct);
        }
        else {
            res.json({ message: "no item  with this id..!" });
        }
    }
    catch (error) {
        throw new FancyError("cant able to fetch the product", 404);
    }
}));
export const getAllProducts = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const queryObj = Object.assign({}, req.query);
        const excludeFields = ["page", "sort", "limit", "fields"];
        excludeFields.forEach(el => delete queryObj[el]);
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        var query = Product.find(JSON.parse(queryStr));
        if (req.query.sort) {
            var s = req.query.sort;
            const sortBy = s.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else {
            query = query.sort('-createdAt');
        }
        if (req.query.fields) {
            const fields = req.query.fields;
            query = query.select(fields.split(',').join(' '));
        }
        else {
            query = query.select('-__v');
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit);
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        const countDocuments = yield Product.countDocuments();
        if (req.query.page) {
            if (skip >= countDocuments) {
                return res.status(404).json({ message: "this page doesnot exist", statusCode: 404 });
            }
        }
        const products = yield query.populate(['category', 'brand', 'color']);
        return res.json(products);
    }
    catch (error) {
        throw new FancyError("cannot be able to fetch products", 400);
    }
}));
export const addToWishlist = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = yield User.findById(_id);
        let alreadyAdded;
        if ((user === null || user === void 0 ? void 0 : user.wishlist) !== undefined && (user === null || user === void 0 ? void 0 : user.wishlist) !== null) {
            alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
        }
        if (alreadyAdded) {
            let user = yield User.findByIdAndUpdate(_id, {
                $pull: { wishlist: prodId }
            }, { new: true });
            res.json(user);
        }
        else {
            let user = yield User.findByIdAndUpdate(_id, {
                $push: { wishlist: prodId }
            }, { new: true });
            res.json(user);
        }
    }
    catch (error) {
        throw new FancyError("can't add the items to wishlist", 500);
    }
}));
export const rating = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
        const product = yield Product.findById(prodId);
        let alreadyRated = (_a = product === null || product === void 0 ? void 0 : product.ratings) === null || _a === void 0 ? void 0 : _a.find((rating) => rating.postedBy.toString() === _id.toString());
        if (alreadyRated) {
            const updateRating = yield Product.updateOne({ ratings: { $elemMatch: alreadyRated } }, { $set: { "ratings.$.star": star, "ratings.$.comment": comment } }, { news: true });
        }
        else {
            const rateProduct = yield Product.findByIdAndUpdate(prodId, {
                $push: { ratings: { star: star, postedBy: _id } }
            }, { new: true });
        }
        const AllRatings = yield Product.findById(prodId);
        let totalRatings = (_b = AllRatings === null || AllRatings === void 0 ? void 0 : AllRatings.ratings) === null || _b === void 0 ? void 0 : _b.length;
        if ((AllRatings === null || AllRatings === void 0 ? void 0 : AllRatings.ratings) !== undefined && totalRatings !== undefined) {
            let ratingSum = AllRatings.ratings.map((item) => item.star).reduce((prev, cur) => prev + cur, 0);
            let actualRating = Math.round(ratingSum / totalRatings);
            const finalProd = yield Product.findByIdAndUpdate(prodId, { totalRating: actualRating }, { new: true });
            res.json(finalProd);
        }
    }
    catch (error) {
        throw new FancyError("can't able to rate the product", 500);
    }
}));
export const uploadImages = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const uploader = (path) => uploadImage(path);
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newpath = yield uploader(path);
            urls.push(newpath);
            fs.unlinkSync(path);
        }
        const findProduct = yield Product.findByIdAndUpdate(id, { images: urls.map((file) => file) }, { new: true });
        res.json(findProduct);
    }
    catch (error) {
        throw new FancyError("cannot upload images", 400);
    }
}));
export const deleteImages = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { path } = req.params;
    try {
        const deleted = deleteImage(path);
        res.json({ message: "deleted sucessfully", });
    }
    catch (error) {
        throw new FancyError("cannot delete images", 400);
    }
}));
