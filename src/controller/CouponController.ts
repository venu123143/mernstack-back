import Coupon from "../models/CouponModel.js"
import asyncHandler from "express-async-handler"
import FancyError from "../utils/FancyError.js"

export const createCoupon = asyncHandler(async (req, res) => {
    const { name, expiry, discount } = req.body
    if (!name || !expiry || !discount) {
        throw new FancyError("all fields are mandatory", 400)
    }
    try {
        const coupon = await Coupon.create(req.body)
        res.json(coupon)
    } catch (error) {
        throw new FancyError("coupon should be unique and max discount be 100%", 500)

    }
})

export const getAllCoupons = asyncHandler(async (req, res) => {
    try {
        const coupons = await Coupon.find()
        res.json(coupons)
    } catch (error) {
        throw new FancyError("cannot get all products", 400)

    }
})
export const updateCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params
    const { name, expiry, discount } = req.body
    try {
        const update_coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true })
        res.json(update_coupon)
    } catch (error) {
        throw new FancyError("cannot update the coupon ", 500)
    }
})
export const deleteCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const delete_coupon = await Coupon.findByIdAndDelete(id)
        res.json(delete_coupon)
    } catch (error) {
        throw new FancyError("cannot delete the coupon ", 500)

    }
})
export const getSingleCoupon = asyncHandler(async (req, res) => {
    const { id } = req.params
    try {
        const get_coupon = await Coupon.findById(id)
        res.json(get_coupon)
    } catch (error) {
        throw new FancyError("cannot delete the coupon ", 500)

    }
})