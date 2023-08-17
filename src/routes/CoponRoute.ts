import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { createCoupon, deleteCoupon, getAllCoupons, getSingleCoupon, updateCoupon } from "../controller/CouponController.js";
import express from "express"
const router = express.Router();

router.post('/', authMiddleware, isAdmin, createCoupon)
router.put('/:id', authMiddleware, isAdmin, updateCoupon)
router.get('/', authMiddleware, isAdmin, getAllCoupons)
router.get('/:id', authMiddleware, isAdmin, getSingleCoupon)
router.delete('/:id', authMiddleware, isAdmin, deleteCoupon)

router.get('/', authMiddleware, isAdmin, getAllCoupons)

export default router