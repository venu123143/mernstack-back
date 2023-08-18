import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { createEnquiry, deleteEnquiry, getAllEnquirys, getEnquiry, updateEnquiry } from "../controller/EnqController.js"
import express from "express"

const router = express.Router();

router.post('/', authMiddleware, createEnquiry)
router.put('/:id', authMiddleware, isAdmin, updateEnquiry)
router.delete('/:id', authMiddleware, isAdmin, deleteEnquiry)
router.get('/:id', authMiddleware, isAdmin, getEnquiry)
router.get('/', authMiddleware, isAdmin, getAllEnquirys)


export default router