import Color from "../models/ColorModel.js"
import FancyError from "../utils/FancyError.js"
import asyncHandler from "express-async-handler"

export const createColor = asyncHandler(async (req, res) => {
    const { title } = req.body
    if (!title) {
        throw new FancyError("title field is mandetory to create the Color", 400)
    }
    try {
        const newColor = await Color.create(req.body)
        res.json(newColor)
    } catch (error) {
        throw new FancyError("no duplicate colors allowed", 404)

    }
})

export const updateColor = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { title } = req.body
    if (!title) {
        throw new FancyError("title field is mandetory to update the Color", 400)
    }
    try {
        const updatedColor = await Color.findByIdAndUpdate(id, req.body, { new: true })
        res.json(updatedColor)
    } catch (error) {
        throw new FancyError("cannot be able to create Color", 401)

    }
})
export const deleteColor = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const deleteColor = await Color.findByIdAndDelete(id)
        res.json(deleteColor)
    } catch (error) {
        throw new FancyError("cannot be able to delete Color", 404)

    }
})
export const getColor = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const getColor = await Color.findById(id)
        res.json(getColor)
    } catch (error) {
        throw new FancyError("cannot be able to get the Color by this id", 404)
    }
})

export const getAllColors = asyncHandler(async (req, res) => {
    try {
        const deleteColor = await Color.find()
        res.json(deleteColor)
    } catch (error) {
        throw new FancyError("cannot be able to get all Color", 404)

    }
})
