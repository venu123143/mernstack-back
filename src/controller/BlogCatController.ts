import FancyError from "../utils/FancyError.js"
import asyncHandler from "express-async-handler"
import Category from "../models/BlogCatModel.js"

export const createCategory = asyncHandler(async (req, res) => {
    const { title } = req.body
    if (!title) {
        throw new FancyError("title field is mandetory to create the category", 400)
    }
    try {
        const newCategory = await Category.create(req.body)
        res.json(newCategory)
    } catch (error) {
        throw new FancyError("cannot be able to create Category", 401)

    }
})

export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { title } = req.body
    if (!title) {
        throw new FancyError("title field is mandetory to update the category", 400)
    }
    try {
        const updatedCategory = await Category.findByIdAndUpdate(id, req.body, { new: true })
        res.json(updatedCategory)
    } catch (error) {
        throw new FancyError("cannot be able to create Category", 401)

    }
})
export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const deleteCategory = await Category.findByIdAndDelete(id)
        res.json(deleteCategory)
    } catch (error) {
        throw new FancyError("cannot be able to delete Category", 404)

    }
})
export const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const getCategory = await Category.findById(id)
        res.json(getCategory)
    } catch (error) {
        throw new FancyError("cannot be able to get the Category by this id", 404)
    }
})

export const getAllCategories = asyncHandler(async (req, res) => {
    try {
        const deleteCategory = await Category.find()
        res.json(deleteCategory)
    } catch (error) {
        throw new FancyError("cannot be able to get all Categories", 404)

    }
})
