import fs from "fs"

import Blog from "../models/BlogModel.js"
import { IUser } from "../models/UserModel.js"
import asyncHandler from "express-async-handler"
import FancyError from "../utils/FancyError.js"
import {uploadImage} from "../utils/Cloudinary.js"
// import { validateMogodbId } from "../utils/validateMongodbId.js"



export const createBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json({ newBlog, sucess: true })
    } catch (error) {
        console.log(error);
        throw new FancyError("Cannot be able to create a blog, Give all mandetory fields", 401)
    }
})

export const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
        if (updateBlog === null) {
            res.json({ message: "no blog present with this id", statusCode: 404 })
        } else res.json({ updatedBlog, sucess: true })
    } catch (error) {
        throw new FancyError("Unable to update the blog. Please provide all mandatory fields.", 401)

    }
})
export const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, { $inc: { numViews: 1 } }, { new: true });
        if (updatedBlog) {
            res.json({ updatedBlog, success: true });
        } else {
            res.status(404).json({ message: "Blog not found", success: false });
        }
    } catch (error) {
        throw new FancyError("Cannot be able get the blog or wrong id", 401)

    }
})

export const getAllBlogs = asyncHandler(async (req, res) => {
    try {
        const blogs = await Blog.find()
        res.json(blogs)
    } catch (error) {
        throw new FancyError("cannot fetch the blogs", 400)
    }
})

export const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const deletedBlog = await Blog.findByIdAndDelete(id)
        res.json({ deletedBlog, sucess: true })
    } catch (error) {
        throw new FancyError("Unable to update the blog. Please provide all mandatory fields.", 401)
    }
})

// dislike the blog
export const likeBlog = asyncHandler(async (req, res): Promise<any> => {
    const { blogId } = req.body;
    // find the user
    const user = req.user as IUser
    try {
        // find the blog
        let blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found", success: false });
        }
        //  check user is already liked the blog or not
        if (blog.likes.includes(user._id)) {
            blog = await Blog.findByIdAndUpdate(
                blogId,
                {
                    $pull: { likes: user._id },
                    isLiked: false,
                },
                { new: true })
        } else {
            blog = await Blog.findByIdAndUpdate(
                blogId,
                {
                    $push: { likes: user._id },
                    isLiked: true,
                },
                { new: true }
            );
        }

        // check user is already disliked the blog or not
        if (blog?.dislikes.includes(user._id)) {
            // Remove the user from the dislikes array
            blog = await Blog.findByIdAndUpdate(
                blogId,
                {
                    $pull: { dislikes: user._id },
                    isDisliked: false,
                },
                { new: true }
            );
        }

        // await blog.save();

        res.json({ updatedBlog: blog, success: true });
    } catch (error) {
        throw new FancyError("Unable to like the blog.", 401);
    }
});

// dislike the blog
export const dislikeBlog = asyncHandler(async (req, res): Promise<any> => {
    const { blogId } = req.body;
    // find the user
    const user = req.user as IUser
    try {
        // find the blog
        let blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: "Blog not found", success: false });
        }

        // check user is already disliked the blog or not
        if (blog.dislikes.includes(user._id)) {
            // Remove the user from the dislikes array
            blog = await Blog.findByIdAndUpdate(
                blogId,
                {
                    $pull: { dislikes: user._id },
                    isDisliked: false,
                },
                { new: true }
            );
        } else {
            blog = await Blog.findByIdAndUpdate(
                blogId,
                {
                    $push: { dislikes: user._id },
                    isDisliked: true,
                },
                { new: true }
            );
        }

        //  check user is already liked the blog or not
        if (blog?.likes.includes(user._id)) {
            blog = await Blog.findByIdAndUpdate(
                blogId,
                {
                    $pull: { likes: user._id },
                    isLiked: false,
                },
                { new: true }
            );
        }

        // await blog.save();

        res.json({ updatedBlog: blog, success: true });
    } catch (error) {
        throw new FancyError("Unable to dislike the blog.", 401);
    }
});


export const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const uploader = (path: string) => uploadImage(path)
        const urls = []
        const files = req.files as Express.Multer.File[];
        for (const file of files) {
            const { path } = file
            const newpath = await uploader(path)
            urls.push(newpath)
            fs.unlinkSync(path)
        }
        const findBlog = await Blog.findByIdAndUpdate(id, { images: urls.map((file) => file) }, { new: true })
        res.json(findBlog)
    } catch (error) {
        throw new FancyError("cannot upload images", 400)
    }

})
