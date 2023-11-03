import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { createCategory, deleteCategory, getAllCategories, getCategory, updateCategory } from "../controller/ProdcategoryController.js";
import express from "express"

const router = express.Router();

router.post('/', authMiddleware, isAdmin, createCategory)
router.put('/:id', authMiddleware, isAdmin, updateCategory)
router.delete('/:id', authMiddleware, isAdmin, deleteCategory)
router.get('/:id', authMiddleware, isAdmin, getCategory)
router.get('/', getAllCategories)


export default router