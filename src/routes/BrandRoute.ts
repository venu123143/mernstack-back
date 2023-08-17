import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { createBrand, deleteBrand, getAllBrands, getBrand, updateBrand } from "../controller/BrandController.js"
import express from "express"

const router = express.Router();

router.post('/', authMiddleware, isAdmin, createBrand)
router.put('/:id', authMiddleware, isAdmin, updateBrand)
router.delete('/:id', authMiddleware, isAdmin, deleteBrand)
router.get('/:id', authMiddleware, isAdmin, getBrand)
router.get('/', authMiddleware, isAdmin, getAllBrands)


export default router