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
import fs from "fs";
import Stripe from "stripe";
import Razorpay from "razorpay";
import Product from "../models/ProductModel.js";
import FancyError from "../utils/FancyError.js";
import User from "../models/UserModel.js";
import { uploadImage, deleteImage } from "../utils/Cloudinary.js";
import { upload } from "../utils/Amazon_s3.js";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-08-16",
});
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_TEST,
    key_secret: process.env.RAZORPAY_SECRET,
});
export const createProduct = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, description, category, brand } = req.body;
    const formData = req.body;
    formData.quantity = JSON.parse(formData.quantity);
    formData.price = JSON.parse(formData.price);
    formData.color = JSON.parse(formData.color);
    formData.tags = JSON.parse(formData.tags);
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
        if (req.body.title) {
            req.body.slug = slugify.default(req.body.title);
        }
        if (req.user) {
            const product = yield Product.create({
                title, description,
                images: urls,
                category, brand,
                seller: req.user._id,
                slug: req.body.slug,
                price: formData.price,
                tags: formData.tags,
                quantity: formData.quantity,
                color: formData.color
            });
            res.json(product);
        }
    }
    catch (error) {
        throw new FancyError(" can't be able to create product, enter all required fields..!", 400);
    }
}));
export const updateProduct = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const uploader = (path) => uploadImage(path);
        let urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newpath = yield uploader(path);
            urls.push(newpath);
            fs.unlinkSync(path);
        }
        if (req.body.title) {
            req.body.slug = slugify.default(req.body.title);
        }
        const { title, description, category, brand } = req.body;
        const formData = req.body;
        formData.quantity = JSON.parse(formData.quantity);
        formData.price = JSON.parse(formData.price);
        formData.color = JSON.parse(formData.color);
        formData.tags = JSON.parse(formData.tags);
        formData.existingImg = (_a = formData === null || formData === void 0 ? void 0 : formData.existingImg) === null || _a === void 0 ? void 0 : _a.map((item) => JSON.parse(item));
        console.log(formData.existingImg);
        if (((_b = formData === null || formData === void 0 ? void 0 : formData.existingImg) === null || _b === void 0 ? void 0 : _b.length) !== 0) {
            urls.unshift(...formData.existingImg);
        }
        console.log(urls);
        const { id } = req.params;
        if (req.user) {
            const updateProd = yield Product.findOneAndUpdate({ _id: id }, {
                title, description,
                category, brand,
                slug: req.body.slug,
                price: formData.price,
                tags: formData.tags,
                quantity: formData.quantity,
                color: formData.color,
                images: urls
            }, {
                new: true,
            }).populate(["category", "brand", "color"]);
            res.json(updateProd);
        }
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
        const findProduct = yield Product.findById({ _id: id }).populate([
            "category",
            "brand",
            "color",
            "ratings.postedBy",
            "seller"
        ]);
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
        excludeFields.forEach((el) => delete queryObj[el]);
        for (const key in queryObj) {
            if (queryObj[key] !== undefined && typeof queryObj[key] === 'string') {
                if (queryObj[key].includes(',')) {
                    queryObj[key] = queryObj[key].split(',');
                }
                else {
                    queryObj[key] = [queryObj[key]];
                }
            }
        }
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
        var query = Product.find(JSON.parse(queryStr));
        if (req.query.sort) {
            var s = req.query.sort;
            const sortBy = s.split(",").join(" ");
            query = query.sort(sortBy);
        }
        else {
            query = query.sort("-createdAt");
        }
        if (req.query.fields) {
            const fields = req.query.fields;
            query = query.select(fields.split(",").join(" "));
        }
        else {
            query = query.select("-__v");
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit);
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        const countDocuments = yield Product.countDocuments();
        if (req.query.page) {
            if (skip >= countDocuments) {
                return res
                    .status(404)
                    .json({ message: "this page doesnot exist", statusCode: 404 });
            }
        }
        const products = yield query.populate(["category", "brand", "color", "seller"]);
        return res.json(products);
    }
    catch (error) {
        console.log(error);
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
            const user = yield User.findByIdAndUpdate(_id, { $pull: { wishlist: prodId } }, { new: true })
                .populate({
                path: 'wishlist',
                populate: [{ path: 'brand' }, { path: 'category' }, { path: 'seller', select: 'firstname' }]
            });
            res.json(user);
        }
        else {
            const user = yield User.findByIdAndUpdate(_id, { $push: { wishlist: prodId } }, { new: true })
                .populate({
                path: 'wishlist',
                populate: [{ path: 'brand' }, { path: 'category' }, { path: 'seller', select: 'firstname' }]
            });
            res.json(user);
        }
    }
    catch (error) {
        console.log(error);
        throw new FancyError("can't add the items to wishlist", 500);
    }
}));
export const rating = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { _id } = req.user;
    const { star, prodId, comment, title } = req.body;
    try {
        if (!prodId || !star) {
            res.status(400).json({ message: "product id and rating is mandetory to add review" });
            return;
        }
        const product = yield Product.findById(prodId);
        let alreadyRated = (_c = product === null || product === void 0 ? void 0 : product.ratings) === null || _c === void 0 ? void 0 : _c.find((rating) => rating.postedBy.toString() === _id.toString());
        if (alreadyRated) {
            const updateRating = yield Product.updateOne({ ratings: { $elemMatch: alreadyRated } }, { $set: { "ratings.$.star": star, "ratings.$.comment": comment, "ratings.$.title": title } }, { news: true });
        }
        else {
            const rateProduct = yield Product.findByIdAndUpdate(prodId, {
                $push: { ratings: { star: star, postedBy: _id, title, comment } },
            }, { new: true });
        }
        const AllRatings = yield Product.findById(prodId);
        let totalRatings = (_d = AllRatings === null || AllRatings === void 0 ? void 0 : AllRatings.ratings) === null || _d === void 0 ? void 0 : _d.length;
        if ((AllRatings === null || AllRatings === void 0 ? void 0 : AllRatings.ratings) !== undefined && totalRatings !== undefined) {
            let ratingSum = AllRatings.ratings
                .map((item) => item.star)
                .reduce((prev, cur) => prev + cur, 0);
            let actualRating = Math.round(ratingSum / totalRatings);
            const finalProd = yield Product.findByIdAndUpdate(prodId, { totalRating: actualRating }, { new: true }).populate(["category", "brand", "color", "seller"])
                .populate({ path: 'ratings', populate: [{ path: 'postedBy', select: 'firstname' }] });
            console.log(finalProd);
            res.json(finalProd);
        }
    }
    catch (error) {
        throw new FancyError("can't able to rate the product", 500);
    }
}));
export const deleteReview = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const { id } = req.params;
    try {
        if (!id) {
            res.status(400).json({ message: "id is mandetory to add review" });
            return;
        }
        const review = yield Product.find({ ratings: { _id: id } });
        const del = Product.findByIdAndUpdate(id, { $pull: { ratings: { _id: id } } }, { new: true });
        res.json(del);
    }
    catch (error) {
        throw new FancyError("can't able to delete the review", 500);
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
        res.json({ message: "deleted sucessfully" });
    }
    catch (error) {
        throw new FancyError("cannot delete images", 400);
    }
}));
export const createCheckoutSession = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    const products = req.body;
    try {
        const line_items = (_e = products === null || products === void 0 ? void 0 : products.cartItems) === null || _e === void 0 ? void 0 : _e.map((product) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: product.name,
                    description: product.desc,
                },
                unit_amount: product.price * 100,
            },
            quantity: product.cartQuantity,
        }));
        const session = yield stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: line_items,
            mode: "payment",
            success_url: "http://localhost:5173/sucess",
            cancel_url: "http://localhost:5173/cancel",
        });
        res.json({ id: session.id });
    }
    catch (error) {
        throw new FancyError("Payment Failed, due to technical issue", 400);
    }
}));
export const createRaziropayOrder = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    const options = {
        amount: ((_f = req.body) === null || _f === void 0 ? void 0 : _f.cartTotalAmount) * 100,
        currency: "INR",
        receipt: "order_reciept_id"
    };
    try {
        console.log("calling");
        razorpay.orders.create(options, function (err, order) {
            var _a;
            if (err) {
                console.log(err);
                res.status(400).json({ message: (_a = err.error) === null || _a === void 0 ? void 0 : _a.description });
                return;
            }
            res.status(200).json(order);
        });
    }
    catch (error) {
        throw new FancyError("Unable to create order, Try again after some time.", 400);
    }
}));
export const uploadFilesToS3 = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const files = req.files;
    const urls = [];
    for (const file of files) {
        const result = yield upload(file);
        urls.push({ url: result });
    }
    res.json({ urls });
}));
