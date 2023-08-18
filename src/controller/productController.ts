import asyncHandler from "express-async-handler"
import slugify from "slugify"
import fs from 'fs'

import Product, { IProduct } from "../models/ProductModel.js"
import FancyError from "../utils/FancyError.js"
import User, { IUser } from "../models/UserModel.js"
import { uploadImage, deleteImage } from "../utils/Cloudinary.js"


export const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify.default(req.body.title)
        }
        const product = await Product.create(req.body)
        res.json(product)
    } catch (error) {
        console.log(error);

        throw new FancyError(" can't be able to create product, enter all required fields..!", 400)
    }
})
export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        if (req.body.title) {
            req.body.slug = slugify.default(req.body.title)
        }
        const updateProd = await Product.findOneAndUpdate({ _id: id }, req.body, { new: true }).populate(['category', 'brand', 'color'])
        res.json(updateProd)
    } catch (error) {
        throw new FancyError(" can't be able to update product, Try Again..!", 400)
    }
})
export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const deleteProd = await Product.findByIdAndDelete(id)
        if (deleteProd !== null) {
            res.json({ deleteProd, message: "item deleted sucessfully" })
        } else {
            res.json({ message: "no item  with this id or already deleted..!" })
        }
    } catch (error) {
        throw new FancyError(" can't be able to delete the product, Try Again..!", 400)
    }
})
export const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const findProduct = await Product.findById({ _id: id }).populate(['category', 'brand', 'color'])

        if (findProduct !== null) {
            res.json(findProduct)
        } else {
            res.json({ message: "no item  with this id..!" })
        }

    } catch (error) {
        throw new FancyError("cant able to fetch the product", 404)

    }
})

export const getAllProducts = asyncHandler(async (req, res): Promise<any> => {
    try {
        // filtering
        const queryObj = { ...req.query }
        const excludeFields = ["page", "sort", "limit", "fields"]
        excludeFields.forEach(el => delete queryObj[el])
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
        var query = Product.find(JSON.parse(queryStr))

        // sorting
        if (req.query.sort) {
            var s = req.query.sort as string
            const sortBy = s.split(',').join(' ')
            query = query.sort(sortBy)
        } else {
            query = query.sort('-createdAt')
        }

        // limiting fields
        if (req.query.fields) {
            const fields = req.query.fields as string
            query = query.select(fields.split(',').join(' '))
        } else {
            query = query.select('-__v')
        }

        // pagination
        const page = Number(req.query.page) || 1
        const limit = Number(req.query.limit)
        const skip = (page - 1) * limit

        query = query.skip(skip).limit(limit)
        const countDocuments = await Product.countDocuments();
        if (req.query.page) {
            if (skip >= countDocuments) {
                return res.status(404).json({ message: "this page doesnot exist", statusCode: 404 })
            }
        }
        const products = await query.populate(['category', 'brand', 'color'])
        return res.json(products)
    } catch (error) {
        throw new FancyError("cannot be able to fetch products", 400)
    }
})

export const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user as IUser
    const { prodId } = req.body
    try {
        const user = await User.findById(_id)
        let alreadyAdded;
        if (user?.wishlist !== undefined && user?.wishlist !== null) {
            alreadyAdded = user.wishlist.find((id) => id.toString() === prodId)
        }
        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(_id, {
                $pull: { wishlist: prodId }
            }, { new: true })
            res.json(user)
        } else {
            let user = await User.findByIdAndUpdate(_id, {
                $push: { wishlist: prodId }
            }, { new: true })
            res.json(user)
        }
    } catch (error) {
        throw new FancyError("can't add the items to wishlist", 500)

    }

})
export const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user as IUser
    const { star, prodId, comment } = req.body
    try {
        // products before update or add the rating
        const product = await Product.findById(prodId)
        let alreadyRated = product?.ratings?.find((rating) => rating.postedBy.toString() === _id.toString())
        if (alreadyRated) {
            const updateRating = await Product.updateOne(
                { ratings: { $elemMatch: alreadyRated } }
                , { $set: { "ratings.$.star": star, "ratings.$.comment": comment } }, { news: true })
        } else {
            const rateProduct = await Product.findByIdAndUpdate(prodId, {
                $push: { ratings: { star: star, postedBy: _id } }
            }, { new: true });
        }

        // products after update or add the rating
        // finding the avg rating.
        const AllRatings = await Product.findById(prodId)
        let totalRatings = AllRatings?.ratings?.length;
        if (AllRatings?.ratings !== undefined && totalRatings !== undefined) {
            let ratingSum = AllRatings.ratings.map((item) => item.star).reduce((prev, cur) => prev + cur, 0)
            let actualRating = Math.round(ratingSum / totalRatings)
            const finalProd = await Product.findByIdAndUpdate(prodId, { totalRating: actualRating }, { new: true })
            res.json(finalProd)
        }

    } catch (error) {
        throw new FancyError("can't able to rate the product", 500)
    }
})


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
        const findProduct = await Product.findByIdAndUpdate(id, { images: urls.map((file) => file) }, { new: true })
        res.json(findProduct)
    } catch (error) {
        throw new FancyError("cannot upload images", 400)
    }

})
export const deleteImages = asyncHandler(async (req, res) => {
    const { path } = req.params
    try {
        const deleted = deleteImage(path);
        res.json({ message: "deleted sucessfully", })
    } catch (error) {
        throw new FancyError("cannot delete images", 400)

    }

})