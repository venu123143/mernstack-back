import Twilio from 'twilio';
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import crypto from "crypto"
import { validationResult } from "express-validator"
import session, { CookieOptions } from 'express-session'
import uniqueId from "uniqid"
// import { GET_ASYNC, SET_ASYNC } from "../utils/processes/services.js"
import User, { IUser } from "../models/UserModel.js"
import Product, { IProduct } from "../models/ProductModel.js";
import Cart, { ICart, ICartItem } from "../models/CartModel.js";
import Order from "../models/OrderModel.js";
import Coupon from "../models/CouponModel.js";
import jwt from "jsonwebtoken"
// import { getGoogleOauthTokens, getGoogleUser } from "../utils/GoogleAuth.js";
import FancyError from "../utils/FancyError.js";
import jwtToken from "../utils/jwtToken.js";
import { validateMogodbId } from '../utils/validateMongodbId.js'
import NodeMailer from "../utils/NodeMailer.js"
import { razorpay } from './productController.js';
import fs from "fs"
import ejs from "ejs"
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// const client = Twilio(process.env.ACCOUNT_SID, process.env.ACCOUNT_TOKEN);

declare module 'express-session' {
    interface Session {
        user?: IUser;
    }
}

// register
export const createUser = asyncHandler(async (req: Request, res: Response): Promise<any> => {
    const { firstname, lastname, email, password, mobile } = req.body;

    // Check if fields are missing or empty strings
    const requiredFields = { firstname, lastname, email, password, mobile };
    const missingFields = Object.entries(requiredFields).filter(([_, val]) => !val || val === "");
    if (missingFields.length > 0) {
        throw new FancyError(`Missing or empty fields: ${missingFields.map(([key]) => key).join(", ")}`, 400);
    }

    // Validate using express-validator (you should have middleware for it)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Check for existing user by email or mobile
    const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { mobile }]
    });

    if (existingUser) {
        throw new FancyError("User already exists with given email or mobile", 409);
    }

    // Create the new user (password will be hashed in pre-save hook)
    const newUser = new User({
        firstname,
        lastname,
        email: email.toLowerCase(),
        password,
        mobile,
        provider: "userRegistration"
    });

    await newUser.save();


    res.status(201).json({
        message: "User created successfully",
        user: {
            _id: newUser._id,
            firstname: newUser.firstname,
            lastname: newUser.lastname,
            email: newUser.email,
            mobile: newUser.mobile,
            role: newUser.role,
            createdAt: newUser.createdAt,
        },
    });
});

// User login
export const loginUser = asyncHandler(async (req, res): Promise<any> => {
    const { email, password } = req.body;

    // check user exists or not
    const findUser = await User.findOne({ email });
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json(errors)
    }
    if (findUser && findUser.role !== 'user') throw new FancyError("you are not an user..!", 400)
    if (findUser && findUser.isBlocked === true) throw new FancyError("you are blocked, please contact administrator to unblock.", 400)
    if (findUser && await findUser.isPasswordMatched(password)) {
        return jwtToken(findUser, 201, res)
    } else {
        throw new FancyError('Invalid Credentials or User Doesnot Exist', 403)
    }
})
// Admin login
export const loginAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const findAdmin = await User.findOne({ email })

    if (findAdmin && findAdmin.role !== 'admin') throw new FancyError("you are not an admin..!", 400)
    // console.log(findAdmin && await findAdmin.isPasswordMatched(password));
    if (findAdmin && findAdmin.isBlocked === true) throw new FancyError("you are blocked, please contact administrator to unblock.", 400)
    if (findAdmin && await findAdmin.isPasswordMatched(password)) {
        return jwtToken(findAdmin, 201, res)
    } else {
        throw new FancyError('Invalid Credentials or User Doesnot Exist', 400)
    }
})
// handle refresh token
export const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = await req.cookies
    if (!cookie.loginToken) {
        throw new FancyError(' No Refresh Token in cookies', 404)
    }
    const refreshToken = cookie.loginToken
    const user = await User.findOne({ refreshToken })
    if (!user) {
        throw new FancyError("no refresh token present in db or not matched", 404)
    }
    //    jwt.verify(refreshToken, process.env.SECRET_KEY as jwt.Secret)
    res.json(user)
})

// logout
export const logout = asyncHandler(async (req, res) => {
    const cookies = req.cookies

    if (!cookies.loginToken) {
        throw new FancyError('no refresh token in cookies', 404)
    }

    await User.findOneAndUpdate({ refreshToken: cookies?.loginToken }, { refreshToken: "" })
    res.clearCookie('loginToken', { path: '/' }).json({ message: 'user logged out successfully', success: true });
})

export const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const getusers = await User.find()
        res.json(getusers)
    } catch (error) {
        throw new FancyError('No users Present', 404)
    }
})

export const getUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params

    validateMogodbId(req, res, next)
    try {
        const user = await User.findById(id)
        res.json(user)
    } catch (error) {
        throw new FancyError('no User Exist with this id ', 404)
    }
})

export const updateUser = asyncHandler(async (req, res, next) => {
    const { _id } = req.user as IUser;

    validateMogodbId(req, res, next)
    try {
        const updateUser = await User.findByIdAndUpdate(_id, req.body, { new: true })
        res.json(updateUser)
    } catch (error) {
        throw new FancyError('cant be able to delete the user ', 404)
    }
})
export const deleteUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    validateMogodbId(req, res, next)
    try {
        const user = await User.findByIdAndDelete(id)
        res.json(user)
    } catch (error) {
        throw new FancyError('no User Exist with this id ', 404)

    }

})

export const blockUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    validateMogodbId(req, res, next)
    try {
        const findUser = await User.findById(id) as any
        let message;
        if (findUser.isBlocked) {
            findUser.isBlocked = false
            message = "user un blocked sucessfully..!"
        } else {
            findUser.isBlocked = true
            message = "user Blocked sucessfully..!"
        }
        findUser.save()
        res.json({ message, findUser })
    } catch (error) {
        throw new FancyError('unable to block user', 403)
    }
})
export const unblockUser = asyncHandler(async (req, res, next) => {
    const { id } = req.params
    validateMogodbId(req, res, next)
    try {
        const block = await User.findByIdAndUpdate(id, { isBlocked: false }, { new: true })
        res.json({ message: "user Un-Blocked sucessfully..!" })
    } catch (error) {
        throw new FancyError('unable to un-block user', 403)
    }

})

export const updatePassword = asyncHandler(async (req, res, next) => {
    const { _id } = req.user as IUser
    const { password } = req.body

    validateMogodbId(req, res, next)

    const user = await User.findById(_id)
    if (password && user) {
        user.password = password
        const updatePassword = await user.save();
        res.json(updatePassword)
    } else {
        res.json(user)
    }
})

// Email interface
interface Attachments {
    filename: string;
    path: string;
}
export interface Email {
    to: string,
    text?: string,
    subject: string;
    html: string;
    attachments?: Attachments[]
}
// console.log(path.join(__dirname, '../../src/public/images'));

export const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body as IUser
    const user = await User.findOne({ email })

    if (!user) throw new FancyError('user not found with this email', 404)
    try {
        const token = await user.createPasswordResetToken();
        const url = `${process.env.CLIENT_ORIGIN}/reset/${token}`;

        // const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);

        const tempPath = path.join(__dirname, '../../src/templates/ForgotPassword.ejs')

        const template = fs.readFileSync(tempPath, 'utf-8')
        const compiledTemplate = ejs.compile(template);

        const data: Email = {
            to: email,
            text: `Hey ${user.firstname}, how are you :-)`,
            subject: "Forgot Password Link",
            html: compiledTemplate({ name: user.firstname, resetUrl: url })
        }
        let transport = 'google' as 'google' | 'yahoo' | 'outlook'
        if (email.includes('@yahoo')) {
            transport = 'yahoo'
        }
        if (email.includes('@outlook')) {
            transport = 'outlook'
        }
        await NodeMailer(data, transport).then(() => {
            res.json(token)
        }).catch((err) => {
            res.status(401).json({ message: "unable to send email" })
        })

    } catch (error: any) {
        console.log(error.message);

        throw new FancyError("can't be able to send Email.", 500)
    }
})

export const resetpassword = asyncHandler(async (req, res) => {
    const { password } = req.body
    const { token } = req.params
    if (!password) {
        throw new FancyError("Must Enter some strong password..!", 404)
    }

    const hashed = crypto.createHash("sha256").update(token).digest('hex')
    const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } })
    if (!user) throw new FancyError("Token Expired, Try again later", 401)
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user)
})

export const deleteFromWishlist = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user as IUser
        const { prodId } = req.params
        const wish = await User.findByIdAndUpdate(_id, { $pull: { wishlist: prodId } })
        res.json({ message: "product removed from wishlist sucessfully.", sucess: true })
    } catch (error) {
        throw new FancyError('cannot delete from the wishlist ', 400)
    }
})

export const addToWishlist = asyncHandler(async (req, res) => {
    try {
        const { _id } = req.user as IUser
        const { prodId } = req.body
        const user = await User.findById(_id).select('wishlist')
        const wishlist = user?.wishlist?.find((id) => id.toString() === prodId)
        const wish = await User.findByIdAndUpdate(_id, { $push: { wishlist: prodId } }, { new: true })
        res.json({ message: "product added to wishlist sucessfully.", sucess: true })
    } catch (error) {
        throw new FancyError('cannot add to wishlist ', 400)
    }
})
export const GetWishlist = asyncHandler(async (req, res, next) => {
    try {
        const { _id } = req.user as IUser
        validateMogodbId(req, res, next)

        const user = await User.findById(_id)
            .populate({
                path: 'wishlist',
                populate: [{ path: 'brand' }, { path: 'category' }, { path: 'seller', select: 'firstname' }, { path: 'color' }]
            })

        res.json(user)
    } catch (error) {
        console.log(error);
        throw new FancyError('no User Exist with this id ', 404)
    }
})

export const saveAddress = asyncHandler(async (req, res, next) => {
    const { _id } = req.user as IUser
    validateMogodbId(req, res, next)
    try {
        const address = User.findByIdAndUpdate(_id, { address: req?.body?.address }, { new: true })
    } catch (error) {
        throw new FancyError('not able to update address', 400)

    }
})
export const addToCart = asyncHandler(async (req, res): Promise<any> => {
    const { _id } = req.user as IUser
    const { prodId, color, tipAmount } = req.body;

    try {
        let cart = await Cart.findOne({ orderBy: _id })
        let prod = await Product.findById(prodId) as any

        if (!prod || prod?.quantity < 1) {
            return res.status(404).json({ message: "No Product or Product not available currently..." })
        }
        if (!cart) {
            // Create a new cart if not found
            cart = new Cart();
        }
        const basicAmount = 199
        let deliveryCharge = cart.total <= basicAmount ? 30 : 0
        let tip = tipAmount > 0 ? tipAmount : 0
        const handlingCharge = 2
        let cartTotal = deliveryCharge + tip + handlingCharge + cart.total + prod.price
        let total = cart.total + prod.price
        // Check if the product already exists in the cart
        const existingProductIndex = cart.products.findIndex(
            (product) => product._id.toString() === prodId
        );
        if (existingProductIndex !== -1) {
            // Update existing product
            cart.products[existingProductIndex].count += 1;
            cart.products[existingProductIndex].color = color;
            cart.cartTotal = cartTotal
            cart.total = total
            cart.tip = tip
            cart.deliveryCharge = deliveryCharge
            cart.handlingCharge = handlingCharge

        } else {
            // Add new product to cart
            cart.orderBy = _id
            cart.total = total
            cart.cartTotal = cartTotal
            cart.deliveryCharge = deliveryCharge
            cart.handlingCharge = handlingCharge
            cart.tip = tip
            cart.products.push({ _id: prodId, count: 1, color: color });
        }
        await cart.save();

        res.status(200).json({ message: 'Item(s) added/updated in the cart', cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

export const updateCartItems = asyncHandler(async (req, res): Promise<any> => {
    const { _id } = req.user as IUser
    const { prodId, tipAmount, color } = req.body

    try {
        const product = await Product.findById(prodId) as IProduct
        if (!product) {
            return res.json({ message: "product id is must", sucess: "false" })
        }

        const cart = await Cart.findOne({ orderBy: _id });
        const basicAmount = 199
        let deliveryCharge = product?.price * 1 < basicAmount ? 30 : 0
        let tip = tipAmount ? tipAmount : 0
        const handlingCharge = 2
        let cartTotal = deliveryCharge + tip + handlingCharge + product.price * 1
        let total = product.price
        if (!cart && product.quantity && product.quantity >= 1) {
            const newCart = new Cart({
                products: [{ _id: prodId, count: 1, color }],
                orderBy: _id,
                deliveryCharge: deliveryCharge,
                tip: tip,
                cartTotal: cartTotal,
                total: total,
                handlingCharge: handlingCharge
            });
            await newCart.save();
            res.json({ message: "product saved to cart", sucess: "true" })
            return newCart;
        }

        const existingProduct = cart?.products.find(product => product._id.toString() === prodId);
        const existingCart = await Cart.findById(cart?._id);
        const products = existingCart?.products;

        total = 0;
        if (products !== undefined) {
            for (let i = 0; i < products?.length; i++) {
                const cost = await Product.findById(products[i]._id).select('price') as any
                const count = products[i].count
                total = total + cost.price * count
            }
        }
        deliveryCharge = total > basicAmount ? 0 : 30
        if (existingProduct && cart !== null && product.quantity && product.quantity >= 1) {
            existingProduct.count += 1;
            cartTotal = deliveryCharge + tip + handlingCharge + total + product.price * 1;
            cart.total = total + product.price * 1;
            cart.cartTotal = cartTotal
            cart.tip = tipAmount
            cart.deliveryCharge = deliveryCharge
            await cart.save();
            res.json({ message: "product updated to cart", sucess: "true" })
            return cart;
        }
        if (product.quantity && product.quantity >= 1) {
            deliveryCharge = total > basicAmount ? 0 : 30
            cartTotal = deliveryCharge + tip + handlingCharge + total + product.price * 1;
            total = total + product.price * 1;
            let updatedCart = await Cart.findByIdAndUpdate(cart?._id, {
                $push: { products: { _id: prodId, count: 1, color: color } },
                cartTotal, total, deliveryCharge, tip, handlingCharge
            }, { new: true })
            return res.json(updatedCart)
        }

    } catch (error) {
        console.log(error);
        throw new FancyError("cannot update items to the cart", 400)

    }
})
export const deleteCartItems = asyncHandler(async (req, res): Promise<any> => {
    const { _id } = req.user as IUser
    const { prodId } = req.body
    try {
        const prod = await Product.findById(prodId)
        if (!prod) {
            return res.json({ message: "Product id is must", sucess: "False" })
        }
        let cart = await Cart.findOne({ orderBy: _id });
        if (cart === null) {
            return res.json({ message: "No produts in the cart", sucess: "False" })
        }
        let basicAmount = 199
        let total = cart.total - prod.price
        let deliveryCharge = total < basicAmount ? 30 : 0
        let tip = cart.tip > 0 ? cart.tip : 0
        const handlingCharge = 2
        let cartTotal = deliveryCharge + tip + handlingCharge + cart.total - prod.price

        const existingProduct = cart.products.find(product => product._id.toString() === prodId);

        if (existingProduct !== undefined) {
            if (existingProduct.count > 1) {
                existingProduct.count -= 1;
                cart.total = total
                cart.deliveryCharge = deliveryCharge
                cart.cartTotal = cartTotal
                cart.handlingCharge = handlingCharge
                cart.tip = tip
            } else {
                cart.products = cart.products.filter((item) => item._id.toString() !== prodId)
                cart.total = total
                cart.deliveryCharge = deliveryCharge
                cart.cartTotal = cartTotal
            }
            await cart.save();
            if (cart.products.length === 0) {
                cart = await Cart.findOneAndRemove({ orderBy: _id }, { new: true })
            }
            res.json({ message: "cart items decreased or item itself delted.", sucess: true, cart })

        } else {
            res.json({ message: "product you are trying to delete is already deleted.", sucess: true })
        }
    } catch (error) {
        throw new FancyError("cannot delete items from the cart", 400)

    }
})
export const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user as IUser;
    try {
        const cart = await Cart.findOne({ orderBy: _id }).populate('products._id')
        // .populate(['category', 'brand', 'color'])
        res.json({ cart })
    } catch (error) {
        console.log(error);
        throw new FancyError("cant be able to get the cart", 400)
    }
})

export const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user as IUser;
    console.log(_id);

    try {
        const user = await User.findOne({ _id })
        const cart = await Cart.findOneAndRemove({ orderBy: user?._id }, { new: true })

        res.json({ cart })
    } catch (error) {
        console.log(error);
        throw new FancyError("cant be able to get the cart", 400)
    }
})

export const applyCoupon = asyncHandler(async (req, res) => {
    const { coupon } = req.body;
    const { _id } = req.user as IUser;
    const validCoupon = await Coupon.findOne({ name: coupon })
    if (validCoupon === null) {
        throw new FancyError("invalid coupon", 400)
    }
    const user = await User.findOne({ _id })
    let { cartTotal } = await Cart.findOne({ orderBy: user?._id }).populate("products") as ICart

    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2)
    const cart = await Cart.findOneAndUpdate({ orderBy: user?._id }, { totalAfterDiscount }, { new: true })
    res.json(cart)

})

export const createOrder = asyncHandler(async (req, res) => {
    var { paymentInfo, shippingInfo, orderItems, totalPrice, } = req.body

    const { _id } = req.user as IUser
    const orderDetails = await razorpay.payments.fetch(paymentInfo?.razorPayPaymentId)
    paymentInfo = { ...paymentInfo, paidWith: orderDetails.method }

    try {
        const order = await Order.create({
            paymentInfo,
            shippingInfo, orderItems,
            totalPrice,
            user: _id
        })
        res.json(order)
    } catch (error: any) {

        throw new FancyError("unable to create An Order.", 500)
    }
})

export const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user as IUser
    try {
        const userOrders = await Order.find({ user: _id })
            .populate({
                path: 'user', select: ['firstname', 'lastname']
            }).populate({
                path: 'orderItems.product', select: ['title', 'price', 'images'],
                populate: {
                    path: 'color',
                }
            })
        res.json(userOrders)

    } catch (error) {
        throw new FancyError("not getting the   ", 500)
    }
})
export const getAllOrders = asyncHandler(async (req, res) => {
    try {
        const orders = await Order.find().populate(["orderItems", "user"]).populate("orderItems.color")
        res.json(orders)
    } catch (error: any) {
        throw new FancyError("not getting the orders", 500)

    }
})
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { Status, index } = req.body
    const { id } = req.params

    let orderStatus = Status as string;

    try {
        const order = await Order.findOne({ _id: id });
        if (!order) {
            res.status(404).json({ message: "Order not found" });
            return
        }
        if (index < 0 || index >= order.orderItems.length) {
            res.status(400).json({ message: "Invalid item index" });
            return
        }
        const originalItem = order.orderItems[index];

        order.orderItems[index] = {
            ...originalItem,
            color: originalItem.color,
            quantity: originalItem.quantity,
            orderStatus: orderStatus as string,
            product: originalItem.product
        };

        await order.save();
        res.json(order)

    } catch (error) {
        console.log(error);

        throw new FancyError("not able to update status", 400)

    }
})
export const deleteOrder = asyncHandler(async (req, res) => {
    try {
        const { id } = req.params
        const findOrder = await Order.findByIdAndDelete(id, { new: true })
        res.json(findOrder)
    } catch (error) {
        throw new FancyError("not able to delete Order", 400)

    }
})


export const sucessPage = async (req: Request, res: Response) => {
    // GET THE CODE FROM QS
    try {
        if (!req.user) {
            throw new Error("user not found")
        }
        if (req.user.isBlocked) {
            return res.redirect(`${process.env.FAILURE_URL}?error=you are blocked, please contact administrator`)
        }
        console.log(req.user.role);

        if (req.user.role == 'admin') {
            return res.redirect(`${process.env.FAILURE_URL}?error=you are not an user`)
        }

        // CREATE ACCESS, REFRESH TOKENS AND SETUP COOKIES
        let token = jwt.sign({ _id: req.user._id }, process.env.SECRET_KEY as jwt.Secret, { expiresIn: "1d" });

        const options: any = {
            maxAge: 24 * 60 * 60 * 1000,
            secure: true,
            httpOnly: true,
            sameSite: 'none'
        }
        //  AND REDIRECT BACK TO CLIENT
        res.status(200).cookie('loginToken', token, options)
            .redirect(`${process.env.SUCCESS_URL}?user=${encodeURIComponent(JSON.stringify(req.user))}`)
    } catch (error) {
        console.log("error", error);

        return res.redirect(process.env.FAILURE_URL as string)
    }
}
export const failurePage = async (req: Request, res: Response) => {
    try {
        //  AND REDIRECT BACK TO CLIENT
        res.status(401).redirect(process.env.FAILURE_URL as string)
    } catch (error) {
        return res.redirect(process.env.FAILURE_URL as string)
    }
}

// const sendTextMessage = async (mobile: string, otp: string) => {
//     try {
//         const msg = await client.messages
//             .create({
//                 body: `Your Otp is ${otp} , valid for next 10-min.`,
//                 to: `+91${mobile}`,
//                 from: '+16562188441', // From a valid Twilio number
//             })
//         return msg
//     } catch (error) {
//         return error
//     }

// };
export const SendOtpViaSms = async (req: Request, res: Response) => {
    const mobile = req.body?.mobile
    let otp = Math.floor(100000 + Math.random() * 900000).toString();
    if (otp.length !== 6) {
        otp = Math.floor(100000 + Math.random() * 900000).toString();
    }

    try {
        const user = await User.findOneAndUpdate(
            { mobile },
            { mobile, otp },
            { upsert: true, new: true }
        );
        // const msg = sendTextMessage(mobile, otp)
        res.status(200).json({
            user,
            success: true,
            message: `Verification code: ${otp} sent to ${mobile} `,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: `Incorrect Number or Invalid Number.` });

    }

}

export const verifyOtp = async (req: Request, res: Response) => {
    const curOTP = req.body?.otp;
    const mobile = req.body?.mobile;
    const enterOtp = curOTP?.toString().replaceAll(",", "");

    const user = await User.findOne({ mobile });
    const time = user?.updatedAt?.getTime();
    const currentTime = new Date().getTime();
    const otpValidityDuration = 10 * 60 * 1000;
    const isValid = time ? currentTime - time : 13;
    try {
        if (user && user.otp == enterOtp && time && isValid <= otpValidityDuration) {
            // CREATE ACCESS, REFRESH TOKENS AND SETUP COOKIES
            return jwtToken(user, 201, res)
        } else {
            res.status(401).json({ success: false, message: "otp incorrect or timeout, Try again..!" });
        }
    } catch (error: any) {
        throw new Error(error);
    }
}


// const emailQueue = new Queue('emailQueue')
// producer and to complete this added task you need worker.
// export const sendEmailToUsers = async (req: Request, res: Response) => {
//     try {
//         // const users = await User.find({})
//         const res1 = await emailQueue.add('addEmail', { name: 'venu gopal ', email: 'venugopal.v@ahex.co.in', message: 'hi this is the message for you. dont tell to anyone' })
//         const res2 = await emailQueue.add('addEmail', { name: 'ram prakash ', email: 'ram.v@ahex.co.in', message: 'hi this is the message for you. dont tell to anyone' })
//         const res3 = await emailQueue.add('addEmail', { name: 'srinivas ', email: 'srinivas.s@ahex.co.in', message: 'hi this is the message for you. dont tell to anyone' })
//         const res4 = await emailQueue.add('addEmail', { name: 'zuber', email: 'zuber.sk@ahex.co.in', message: 'hi this is the message for you. dont tell to anyone' })
//         const res5 = await emailQueue.add('addEmail', { name: 'shubam ', email: 'shubam.s@ahex.co.in', message: 'hi this is the message for you. dont tell to anyone' })
//         const res6 = await emailQueue.add('addEmail', { name: 'lakshman', email: 'lakshman.ls@ahex.co.in', message: 'hi this is the message for you. dont tell to anyone' })
//         console.log(res1.id, res2.id, res3.id, res4.id, res5.id, res6.id, ' is added to queue.')

//         res.status(201).json({ message: 'task is added and started processing to the queue' })
//     } catch (error) {
//         console.log(error);
//         res.status(400).json(error)
//     }
// }
