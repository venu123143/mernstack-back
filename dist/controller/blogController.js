var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from "fs";
import Blog from "../models/BlogModel.js";
import asyncHandler from "express-async-handler";
import FancyError from "../utils/FancyError.js";
import { uploadImage } from "../utils/Cloudinary.js";
export const createBlog = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newBlog = yield Blog.create(req.body);
        res.json({ newBlog, sucess: true });
    }
    catch (error) {
        console.log(error);
        throw new FancyError("Cannot be able to create a blog, Give all mandetory fields", 401);
    }
}));
export const updateBlog = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const updatedBlog = yield Blog.findByIdAndUpdate(id, req.body, { new: true });
        if (updateBlog === null) {
            res.json({ message: "no blog present with this id", statusCode: 404 });
        }
        else
            res.json({ updatedBlog, sucess: true });
    }
    catch (error) {
        throw new FancyError("Unable to update the blog. Please provide all mandatory fields.", 401);
    }
}));
export const getBlog = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const updatedBlog = yield Blog.findByIdAndUpdate(id, { $inc: { numViews: 1 } }, { new: true });
        if (updatedBlog) {
            res.json({ updatedBlog, success: true });
        }
        else {
            res.status(404).json({ message: "Blog not found", success: false });
        }
    }
    catch (error) {
        throw new FancyError("Cannot be able get the blog or wrong id", 401);
    }
}));
export const getAllBlogs = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const blogs = yield Blog.find();
        res.json(blogs);
    }
    catch (error) {
        throw new FancyError("cannot fetch the blogs", 400);
    }
}));
export const deleteBlog = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const deletedBlog = yield Blog.findByIdAndDelete(id);
        res.json({ deletedBlog, sucess: true });
    }
    catch (error) {
        throw new FancyError("Unable to update the blog. Please provide all mandatory fields.", 401);
    }
}));
export const likeBlog = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { blogId } = req.body;
    const user = req.user;
    try {
        let blog = yield Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found", success: false });
        }
        if (blog.likes.includes(user._id)) {
            blog = yield Blog.findByIdAndUpdate(blogId, {
                $pull: { likes: user._id },
                isLiked: false,
            }, { new: true });
        }
        else {
            blog = yield Blog.findByIdAndUpdate(blogId, {
                $push: { likes: user._id },
                isLiked: true,
            }, { new: true });
        }
        if (blog === null || blog === void 0 ? void 0 : blog.dislikes.includes(user._id)) {
            blog = yield Blog.findByIdAndUpdate(blogId, {
                $pull: { dislikes: user._id },
                isDisliked: false,
            }, { new: true });
        }
        res.json({ updatedBlog: blog, success: true });
    }
    catch (error) {
        throw new FancyError("Unable to like the blog.", 401);
    }
}));
export const dislikeBlog = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { blogId } = req.body;
    const user = req.user;
    try {
        let blog = yield Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: "Blog not found", success: false });
        }
        if (blog.dislikes.includes(user._id)) {
            blog = yield Blog.findByIdAndUpdate(blogId, {
                $pull: { dislikes: user._id },
                isDisliked: false,
            }, { new: true });
        }
        else {
            blog = yield Blog.findByIdAndUpdate(blogId, {
                $push: { dislikes: user._id },
                isDisliked: true,
            }, { new: true });
        }
        if (blog === null || blog === void 0 ? void 0 : blog.likes.includes(user._id)) {
            blog = yield Blog.findByIdAndUpdate(blogId, {
                $pull: { likes: user._id },
                isLiked: false,
            }, { new: true });
        }
        res.json({ updatedBlog: blog, success: true });
    }
    catch (error) {
        throw new FancyError("Unable to dislike the blog.", 401);
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
        const findBlog = yield Blog.findByIdAndUpdate(id, { images: urls.map((file) => file) }, { new: true });
        res.json(findBlog);
    }
    catch (error) {
        throw new FancyError("cannot upload images", 400);
    }
}));
