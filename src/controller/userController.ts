import Twilio from 'twilio';
import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import crypto from "crypto"
import { validationResult } from "express-validator"
import session from 'express-session'
import uniqueId from "uniqid"
import { Queue } from "bullmq"

import User, { IUser } from "../models/UserModel.js"
import Product, { IProduct } from "../models/ProductModel.js";
import Cart, { ICart, ICartItem } from "../models/CartModel.js";
import Order from "../models/OrderModel.js";
import Coupon from "../models/CouponModel.js";

import { getGoogleOauthTokens, getGoogleUser } from "../utils/GoogleAuth.js";
import FancyError from "../utils/FancyError.js";
import jwtToken from "../utils/jwtToken.js";
import { validateMogodbId } from '../utils/validateMongodbId.js'
import NodeMailer from "../utils/NodeMailer.js"

const client = Twilio(process.env.ACCOUNT_SID, process.env.ACCOUNT_TOKEN);

declare module 'express-session' {
    interface Session {
        user?: IUser;
    }
}

// register
export const createUser = asyncHandler(async (req, res): Promise<any> => {
    const { firstname, lastname, email, password, mobile } = req.body;

    if (!firstname || !lastname || !email || !password || !mobile) {
        throw new FancyError('All fields are important..!', 403)
    }
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json(errors)
    }
    const findUser = await User.findOne({ email })
    if (!findUser) {
        // creating new user
        const newUser = await User.create(req.body);
        res.json(newUser)
    } else {
        throw new FancyError('user already exists', 403)
    }
})

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

    if (findAdmin && await findAdmin.isPasswordMatched(password)) {
        return jwtToken(findAdmin, 201, res)
    } else {

        throw new FancyError('Invalid Credentials or User Doesnot Exist', 403)
    }
})
// handle refresh token
export const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = await req.cookies
    console.log(cookie);
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
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
        }
        res.send('Logged out successfully');
    });

    await User.findOneAndUpdate({ refreshToken: cookies?.loginToken }, { refreshToken: "" })
    res.clearCookie(cookies?.loginToken).status(204)
        .json({ message: 'user logged out sucessfully', sucess: true })
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
        const block = await User.findByIdAndUpdate(id, { isBlocked: true }, { new: true })
        res.json({ message: "user Blocked sucessfully..!" })
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
export interface Email {
    to: string,
    text: string,
    subject: string;
    html: string;
}

export const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body as IUser
    const user = await User.findOne({ email })

    if (!user) throw new FancyError('user not found with this email', 404)
    try {
        const token = await user.createPasswordResetToken();
        const ResetUrl = `<p>Hey, ${user.firstname} how are you :-)</p> Please follow this link to reset your Password. This Link will valid for next 10 minutes.
         <a href='${process.env.BACKEND_HOST}/api/users/resetpassword/${token}'>Click Here</a>`

        const data: Email = {
            to: email,
            text: `Hey ${user.firstname}, how are you :-)`,
            subject: "Forgot Password Link",
            html: ResetUrl
        }
        NodeMailer(data)
        res.json(token)
    } catch (error) {
        throw new FancyError("can't be able to send Email.", 500)
    }
})

export const resetpassword = asyncHandler(async (req, res) => {
    const { password } = req.body
    const { token } = req.params
    if (!password) {
        throw new FancyError("Must Enter some password..!", 404)
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
    const { _id } = req.user as IUser
    const { prodId } = req.params

    try {
        const wish = await User.findByIdAndUpdate(_id, { $pull: { wishlist: prodId } })
        res.json({ message: "product removed from wishlist sucessfully.", sucess: true })
    } catch (error) {
        throw new FancyError('cannot delete from the wishlist ', 400)
    }
})

export const addToWishlist = asyncHandler(async (req, res) => {
    const { _id } = req.user as IUser
    const { prodId } = req.body
    try {
        const user = await User.findById(_id).select('wishlist')
        const wishlist = user?.wishlist?.find((id) => id.toString() === prodId)
        const wish = await User.findByIdAndUpdate(_id, { $push: { wishlist: prodId } }, { new: true })
        res.json({ message: "product added to wishlist sucessfully.", sucess: true })
    } catch (error) {
        throw new FancyError('cannot add to wishlist ', 400)
    }
})
export const GetWishlist = asyncHandler(async (req, res, next) => {
    const { _id } = req.user as IUser
    validateMogodbId(req, res, next)
    try {
        const user = await User.findById(_id).populate('wishlist')
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
    const { COD, couponApplied } = req.body
    const { _id } = req.user as IUser
    if (!COD) throw new FancyError("Create Cash Order Failed", 500)
    try {
        const user = await User.findById(_id)
        const userCart = await Cart.findOne({ orderBy: user?._id })

        let finalAmount = 0
        if (couponApplied && userCart?.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount
        }
        else {
            finalAmount = userCart ? userCart.cartTotal : 0
        }
        if (userCart !== null && userCart?.products !== undefined) {
            const newOrder = await new Order({
                products: userCart?.products,
                paymentIntent: {
                    order_id: uniqueId("ORD"),
                    method: "COD",
                    amount: finalAmount,
                    status: "Cash On Delivery",
                    created: Date.now(),
                    currency: "USD",
                },
                orderBy: user?._id,
                paymentMethod: "Cash on Delivery",

            }).save()
            for (const item of userCart.products) {
                await Product.updateOne(
                    { _id: item?._id },
                    { $inc: { quantity: -item.count, sold: item.count } }
                );
            }
            res.json({ message: "sucess", sucess: true })
        } else {
            res.json({ message: "Cart is Empty", sucess: false })
        }
        const cart = await Cart.findOneAndRemove({ orderBy: user?._id })

    } catch (error: any) {
        throw new FancyError(error, 500)
    }
})
export const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user as IUser
    try {
        const userOrders = await Order.findOne({ orderBy: _id }).populate("products")
        res.json(userOrders)

    } catch (error) {
        throw new FancyError("not getting the orders", 500)

    }
})
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { Status } = req.body
    const { id } = req.params

    let orderStatus;
    if (["process", "processing", "procesed", "processed"].includes(Status.toLowerCase())) {
        orderStatus = "Processing";
    }
    if (["dispatch", "dispatched", "send", "parcelled", "order started"].includes(Status.toLowerCase())) {
        orderStatus = "Dispatched";
    }
    if (["cancel", "cancelled", "order cancelled", "order failed", "order cacellation"].includes(Status.toLowerCase())) {
        orderStatus = "Cancelled";
    }
    if (["delivered", "order sucessful", "delevered", "order completed", "order delivered"].includes(Status.toLowerCase())) {
        orderStatus = "Delivered";
    }

    try {
        const findOrder = await Order.findByIdAndUpdate(id,
            {
                orderStatus: orderStatus,
                paymentIntent: {
                    status: Status
                },

            }, { new: true })
        res.json(findOrder)
    } catch (error) {
        throw new FancyError("not able to update status", 400)

    }
})


export const googleOauthHandler = async (req: Request, res: Response) => {
    // GET THE CODE FROM QS
    const code = req.query.code as string

    try {
        // GET THE ID AND ACCESSTOKE WITH THE CODE
        const { id_token, access_token } = await getGoogleOauthTokens({ code })
        const googleUser = await getGoogleUser({ id_token, access_token })
        // jwt.decode(id_token)
        if (!googleUser.verified_email) {
            return res.status(403).send('Google acoount is not verified')
        }
        // GET THE USER WITH TOKENS and UPSERT THE USER
        const user = await User.findOneAndUpdate({ email: googleUser.email },
            {
                email: googleUser.email,
                firstname: googleUser.given_name,
                lastname: googleUser.family_name,
                profile: googleUser.picture,
            }, { upsert: true, new: true })

        // CREATE SESSION
        req.session.user = user as IUser
        req.session.save();

        // CREATE ACCESS, REFRESH TOKENS AND SETUP COOKIES
        const token = await user.generateAuthToken()
        const options = {
            maxAge: 24 * 60 * 60 * 1000,
            secure: false,
            httpOnly: false,
        }
        res.cookie('loginToken', token, options)

        //  AND REDIRECT BACK TO CLIENT
        res.status(201).redirect(process.env.CLIENT_ORIGIN as string)


    } catch (error) {
        return res.redirect(process.env.CLIENT_ORIGIN as string)
    }
}

var otp: string;
const sendTextMessage = async (mobile: string, otp: string) => {
    try {
        const msg = await client.messages
            .create({
                body: `Your Otp is ${otp} , valid for next 10-min.`,
                to: `+91${mobile}`,
                from: '+16562188441', // From a valid Twilio number
            })
        return msg
    } catch (error) {
        return error
    }

};
export const SendOtpViaSms = async (req: Request, res: Response) => {
    const mobile = req.body?.mobile
    otp = Math.round(Math.random() * 1000000).toString();
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
            message: `Verification code sent to ${mobile} `,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: `Incorrect Number or Invalid Number.` });

    }

}

export const verifyOtp = async (req: Request, res: Response) => {
    const curOTP = req.body?.otp;
    const mobile = req.body?.mobile;
    const enterOtp = curOTP.toString().replaceAll(",", "");

    const user = await User.findOne({ mobile });
    const time = user?.updatedAt?.getTime();
    const currentTime = new Date().getTime();
    const otpValidityDuration = 10 * 60 * 1000;
    const isValid = time ? currentTime - time : 13;
    try {
        if (
            user &&
            user.otp == enterOtp &&
            time &&
            isValid <= otpValidityDuration
        ) {
            // CREATE ACCESS, REFRESH TOKENS AND SETUP COOKIES
            const token = await user.generateAuthToken();
            const options = {
                maxAge: 24 * 60 * 60 * 1000,
                secure: false,
                httpOnly: true,
            };
            res
                .status(201)
                .cookie("loginToken", token, options)
                .json({ user, success: true, message: "user logged in sucessfully." });
        } else {
            res
                .status(403)
                .json({ success: false, message: "otp incorrect or timeout." });
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
