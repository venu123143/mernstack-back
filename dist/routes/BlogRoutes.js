import { createBlog, deleteBlog, dislikeBlog, getAllBlogs, getBlog, likeBlog, updateBlog, uploadImages } from "../controller/blogController.js";
import express from "express";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { blogImgResize, uploadPhoto } from "../middleware/uploadImages.js";
const router = express.Router();
router.post('/new', authMiddleware, isAdmin, uploadPhoto.array('images', 2), createBlog);
router.put('/upload/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 2), blogImgResize, uploadImages);
router.put('/likes', authMiddleware, likeBlog);
router.put('/dislikes', authMiddleware, dislikeBlog);
router.put('/:id', authMiddleware, isAdmin, uploadPhoto.array('images', 2), updateBlog);
router.get('/:id', getBlog);
router.delete('/:id', authMiddleware, isAdmin, deleteBlog);
router.get('/', getAllBlogs);
export default router;
