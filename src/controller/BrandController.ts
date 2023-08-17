import Brand from "../models/BrandModel.js"
import FancyError from "../utils/FancyError.js"
import asyncHandler from "express-async-handler"

export const createBrand = asyncHandler(async (req, res) => {
    const { title } = req.body
    if (!title) {
        throw new FancyError("title field is mandetory to create the Brand", 400)
    }
    try {
        const newBrand = await Brand.create(req.body)
        res.json(newBrand)
    } catch (error) {
        throw new FancyError("cannot be able to create Brand", 401)

    }
})

export const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { title } = req.body
    if (!title) {
        throw new FancyError("title field is mandetory to update the Brand", 400)
    }
    try {
        const updatedBrand = await Brand.findByIdAndUpdate(id, req.body, { new: true })
        res.json(updatedBrand)
    } catch (error) {
        throw new FancyError("cannot be able to create Brand", 401)

    }
})
export const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const deleteBrand = await Brand.findByIdAndDelete(id)
        res.json(deleteBrand)
    } catch (error) {
        throw new FancyError("cannot be able to delete Brand", 404)

    }
})
export const getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const getBrand = await Brand.findById(id)
        res.json(getBrand)
    } catch (error) {
        throw new FancyError("cannot be able to get the Brand by this id", 404)
    }
})

export const getAllBrands = asyncHandler(async (req, res) => {
    try {
        const deleteBrand = await Brand.find()
        res.json(deleteBrand)
    } catch (error) {
        throw new FancyError("cannot be able to get all Brand", 404)

    }
})
