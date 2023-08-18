import Enquiry from "../models/EnqModel.js"
import FancyError from "../utils/FancyError.js"
import asyncHandler from "express-async-handler"

export const createEnquiry = asyncHandler(async (req, res) => {
    const { title } = req.body
    if (!title) {
        throw new FancyError("title field is mandetory to create the Enquiry", 400)
    }
    try {
        const newEnquiry = await Enquiry.create(req.body)
        res.json(newEnquiry)
    } catch (error) {
        throw new FancyError("no duplicate Enquirys allowed", 404)

    }
})

export const updateEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { title } = req.body
    if (!title) {
        throw new FancyError("title field is mandetory to update the Enquiry", 400)
    }
    try {
        const updatedEnquiry = await Enquiry.findByIdAndUpdate(id, req.body, { new: true })
        res.json(updatedEnquiry)
    } catch (error) {
        throw new FancyError("cannot be able to create Enquiry", 401)

    }
})
export const deleteEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const deleteEnquiry = await Enquiry.findByIdAndDelete(id)
        res.json(deleteEnquiry)
    } catch (error) {
        throw new FancyError("cannot be able to delete Enquiry", 404)

    }
})
export const getEnquiry = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const getEnquiry = await Enquiry.findById(id)
        res.json(getEnquiry)
    } catch (error) {
        throw new FancyError("cannot be able to get the Enquiry by this id", 404)
    }
})

export const getAllEnquirys = asyncHandler(async (req, res) => {
    try {
        const deleteEnquiry = await Enquiry.find()
        res.json(deleteEnquiry)
    } catch (error) {
        throw new FancyError("cannot be able to get all Enquiry", 404)

    }
})
