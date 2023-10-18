import express from "express"

import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { productImgResize, uploadPhoto } from "../middleware/uploadImages.js";

import {
    createProduct, getProduct,
    getAllProducts, updateProduct,
    deleteProduct, addToWishlist,
    rating, uploadImages, deleteImages,
    createCheckoutSession, createRaziropayOrder,
    uploadFilesToS3
} from "../controller/productController.js";


const router = express.Router();


router.post('/', authMiddleware, isAdmin, createProduct)
router.post('/create-checkout-session', createCheckoutSession)
router.post('/create-raziropay-session', createRaziropayOrder)
router.put('/upload/:id', authMiddleware, isAdmin,
    uploadPhoto.array('images', 10),
    productImgResize, uploadImages)
router.post('/upload-to-s3', uploadPhoto.array('images', 10), uploadFilesToS3)
router.get('/:id', getProduct);
router.put('/wishlist', authMiddleware, addToWishlist)
router.put('/rating', authMiddleware, rating)
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
router.delete('/delete-img/:id', authMiddleware, isAdmin, deleteImages);
router.get('/', getAllProducts)



export default router;