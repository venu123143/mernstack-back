import express from "express"
import {
    googleOauthHandler,
    createUser, loginUser, getAllUsers,
    getUser, deleteUser, updateUser,
    blockUser, unblockUser, handleRefreshToken,
    logout, updatePassword, forgotPasswordToken,
    resetpassword, loginAdmin, GetWishlist,
    saveAddress, getUserCart, emptyCart,
    applyCoupon, createOrder, getOrders,
    updateCartItems, deleteCartItems, updateOrderStatus,
    deleteFromWishlist, addToWishlist, addToCart, SendOtpViaSms, verifyOtp
} from '../controller/userController.js'

import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js'
import { loginValidator, passwordValidator, registerValidator } from "../middleware/ValidateMiddleware.js";

const router = express.Router();


router.post('/register', registerValidator, createUser)
router.post('/login', loginValidator, loginUser)
router.post('/req-otp', SendOtpViaSms)
router.post('/verify-otp', verifyOtp)
router.post('/forgot-password-token', loginValidator, forgotPasswordToken)
router.post('/admin-login', loginValidator, loginAdmin)

router.put('/resetpassword/:token', passwordValidator, resetpassword)
router.put('/password', passwordValidator, authMiddleware, updatePassword)
router.get('/allusers', getAllUsers)
router.get('/sessions/oauth/google', googleOauthHandler)
router.get('/refresh', handleRefreshToken)
router.get('/logout', logout)
router.post('/wishlist', authMiddleware, addToWishlist)

// router.post('/sendEmailToUsers', sendEmailToUsers)

router.post('/addtocart', authMiddleware, addToCart)
// router.post('/cart', authMiddleware, updateCartItems)
router.post('/cart/applycoupon', authMiddleware, applyCoupon)
router.post('/cart/cash-order', authMiddleware, createOrder)
router.get('/wishlist', authMiddleware, GetWishlist)
router.get('/cart', authMiddleware, getUserCart)
router.get('/orders', authMiddleware, getOrders)
router.delete('/cart', authMiddleware, deleteCartItems)
router.put('/updateorder/:id', authMiddleware, isAdmin, updateOrderStatus)

router.delete('/empty-cart', authMiddleware, emptyCart)
router.put('/update-user', authMiddleware, updateUser)
router.put('/save-address', authMiddleware, saveAddress)
router.delete('/:id', authMiddleware, deleteUser)
router.delete('/wishlist/:id', authMiddleware, deleteFromWishlist)
router.get('/:id', authMiddleware, isAdmin, getUser)
router.put('/block-user/:id', authMiddleware, isAdmin, blockUser)
router.put('/unblock-user/:id', authMiddleware, isAdmin, unblockUser)


export default router