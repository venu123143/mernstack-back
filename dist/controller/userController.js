var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import asyncHandler from "express-async-handler";
import crypto from "crypto";
import { validationResult } from "express-validator";
import uniqueId from "uniqid";
import User from "../models/UserModel.js";
import Product from "../models/ProductModel.js";
import Cart from "../models/CartModel.js";
import Order from "../models/OrderModel.js";
import Coupon from "../models/CouponModel.js";
import FancyError from "../utils/FancyError.js";
import jwtToken from "../utils/jwtToken.js";
import { validateMogodbId } from '../utils/validateMongodbId.js';
import NodeMailer from "../utils/NodeMailer.js";
export const createUser = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstname, lastname, email, password, mobile } = req.body;
    if (!firstname || !lastname || !email || !password || !mobile) {
        throw new FancyError('All fields are important..!', 403);
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }
    const findUser = yield User.findOne({ email });
    if (!findUser) {
        const newUser = yield User.create(req.body);
        res.json(newUser);
    }
    else {
        throw new FancyError('user already exists', 403);
    }
}));
export const loginUser = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const findUser = yield User.findOne({ email });
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json(errors);
    }
    if (findUser && findUser.role !== 'user')
        throw new FancyError("you are not an user..!", 400);
    if (findUser && (yield findUser.isPasswordMatched(password))) {
        return jwtToken(findUser, 201, res);
    }
    else {
        throw new FancyError('Invalid Credentials or User Doesnot Exist', 403);
    }
}));
export const loginAdmin = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const findAdmin = yield User.findOne({ email });
    if (findAdmin && findAdmin.role !== 'admin')
        throw new FancyError("you are not an admin..!", 400);
    if (findAdmin && (yield findAdmin.isPasswordMatched(password))) {
        return jwtToken(findAdmin, 201, res);
    }
    else {
        throw new FancyError('Invalid Credentials or User Doesnot Exist', 403);
    }
}));
export const handleRefreshToken = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookie = yield req.cookies;
    console.log(cookie);
    if (!cookie.loginToken) {
        throw new FancyError(' No Refresh Token in cookies', 404);
    }
    const refreshToken = cookie.loginToken;
    const user = yield User.findOne({ refreshToken });
    if (!user) {
        throw new FancyError("no refresh token present in db or not matched", 404);
    }
    res.json(user);
}));
export const logout = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cookies = req.cookies;
    if (!cookies.loginToken) {
        throw new FancyError('no refresh token in cookies', 404);
    }
    yield User.findOneAndUpdate({ refreshToken: cookies.loginToken }, { refreshToken: "" });
    res.clearCookie(cookies.loginToken).status(204)
        .json({ message: 'user logged out sucessfully', sucess: true });
}));
export const getAllUsers = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const getusers = yield User.find();
        res.json(getusers);
    }
    catch (error) {
        throw new FancyError('No users Present', 404);
    }
}));
export const getUser = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    validateMogodbId(req, res, next);
    try {
        const user = yield User.findById(id);
        res.json(user);
    }
    catch (error) {
        throw new FancyError('no User Exist with this id ', 404);
    }
}));
export const updateUser = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    validateMogodbId(req, res, next);
    try {
        const updateUser = yield User.findByIdAndUpdate(_id, req.body, { new: true });
        res.json(updateUser);
    }
    catch (error) {
        throw new FancyError('cant be able to delete the user ', 404);
    }
}));
export const deleteUser = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    validateMogodbId(req, res, next);
    try {
        const user = yield User.findByIdAndDelete(id);
        res.json(user);
    }
    catch (error) {
        throw new FancyError('no User Exist with this id ', 404);
    }
}));
export const blockUser = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    validateMogodbId(req, res, next);
    try {
        const block = yield User.findByIdAndUpdate(id, { isBlocked: true }, { new: true });
        res.json({ message: "user Blocked sucessfully..!" });
    }
    catch (error) {
        throw new FancyError('unable to block user', 403);
    }
}));
export const unblockUser = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    validateMogodbId(req, res, next);
    try {
        const block = yield User.findByIdAndUpdate(id, { isBlocked: false }, { new: true });
        res.json({ message: "user Un-Blocked sucessfully..!" });
    }
    catch (error) {
        throw new FancyError('unable to un-block user', 403);
    }
}));
export const updatePassword = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const { password } = req.body;
    validateMogodbId(req, res, next);
    const user = yield User.findById(_id);
    if (password && user) {
        user.password = password;
        const updatePassword = yield user.save();
        res.json(updatePassword);
    }
    else {
        res.json(user);
    }
}));
export const forgotPasswordToken = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield User.findOne({ email });
    if (!user)
        throw new FancyError('user not found with this email', 404);
    try {
        const token = yield user.createPasswordResetToken();
        const ResetUrl = `<p>Hey, ${user.firstname} how are you :-)</p> Please follow this link to reset your Password. This Link will valid for next 10 minutes.
         <a href='${process.env.BACKEND_HOST}/api/users/resetpassword/${token}'>Click Here</a>`;
        const data = {
            to: email,
            text: `Hey ${user.firstname}, how are you :-)`,
            subject: "Forgot Password Link",
            html: ResetUrl
        };
        NodeMailer(data);
        res.json(token);
    }
    catch (error) {
        throw new FancyError("can't be able to send Email.", 500);
    }
}));
export const resetpassword = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password } = req.body;
    const { token } = req.params;
    if (!password) {
        throw new FancyError("Must Enter some password..!", 404);
    }
    const hashed = crypto.createHash("sha256").update(token).digest('hex');
    const user = yield User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } });
    if (!user)
        throw new FancyError("Token Expired, Try again later", 401);
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    yield user.save();
    res.json(user);
}));
export const deleteFromWishlist = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const { prodId } = req.params;
    try {
        const wish = yield User.findByIdAndUpdate(_id, { $pull: { wishlist: prodId } });
        res.json({ message: "product removed from wishlist sucessfully.", sucess: true });
    }
    catch (error) {
        throw new FancyError('cannot delete from the wishlist ', 400);
    }
}));
export const addToWishlist = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const user = yield User.findById(_id).select('wishlist');
        const wishlist = (_a = user === null || user === void 0 ? void 0 : user.wishlist) === null || _a === void 0 ? void 0 : _a.find((id) => id.toString() === prodId);
        const wish = yield User.findByIdAndUpdate(_id, { $push: { wishlist: prodId } }, { new: true });
        res.json({ message: "product added to wishlist sucessfully.", sucess: true });
    }
    catch (error) {
        throw new FancyError('cannot add to wishlist ', 400);
    }
}));
export const GetWishlist = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    validateMogodbId(req, res, next);
    try {
        const user = yield User.findById(_id).populate('wishlist');
        res.json(user);
    }
    catch (error) {
        console.log(error);
        throw new FancyError('no User Exist with this id ', 404);
    }
}));
export const saveAddress = asyncHandler((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const { _id } = req.user;
    validateMogodbId(req, res, next);
    try {
        const address = User.findByIdAndUpdate(_id, { address: (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.address }, { new: true });
    }
    catch (error) {
        throw new FancyError('not able to update address', 400);
    }
}));
export const addToCart = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const { prodId, color, tipAmount } = req.body;
    try {
        let cart = yield Cart.findOne({ orderBy: _id });
        let prod = yield Product.findById(prodId);
        if (!prod && (prod === null || prod === void 0 ? void 0 : prod.quantity) < 1) {
            return res.status(404).json({ message: "No Product or Product not available currently..." });
        }
        if (!cart) {
            cart = new Cart();
        }
        const basicAmount = 199;
        let deliveryCharge = cart.total < basicAmount ? 30 : 0;
        let tip = tipAmount ? tipAmount : 0;
        const handlingCharge = 2;
        let cartTotal = deliveryCharge + tip + handlingCharge + cart.total + prod.price;
        let total = cart.total + prod.price;
        const existingProductIndex = cart.products.findIndex((product) => product._id.toString() === prodId);
        if (existingProductIndex !== -1) {
            cart.products[existingProductIndex].count += 1;
            cart.products[existingProductIndex].color = color;
            cart.cartTotal = cartTotal;
            cart.total = total;
            cart.tip = tip;
            cart.deliveryCharge = deliveryCharge;
            cart.handlingCharge = handlingCharge;
        }
        else {
            cart.orderBy = _id;
            cart.total = total;
            cart.cartTotal = cartTotal;
            cart.deliveryCharge = deliveryCharge;
            cart.handlingCharge = handlingCharge;
            cart.products.push({ _id: prodId, count: 1, color: color });
        }
        yield cart.save();
        res.status(200).json({ message: 'Item(s) added/updated in the cart', cart });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
export const updateCartItems = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const { prodId, tipAmount, color } = req.body;
    try {
        const product = yield Product.findById(prodId);
        if (!product) {
            return res.json({ message: "product id is must", sucess: "false" });
        }
        const cart = yield Cart.findOne({ orderBy: _id });
        const basicAmount = 199;
        let deliveryCharge = (product === null || product === void 0 ? void 0 : product.price) * 1 < basicAmount ? 30 : 0;
        let tip = tipAmount ? tipAmount : 0;
        const handlingCharge = 2;
        let cartTotal = deliveryCharge + tip + handlingCharge + product.price * 1;
        let total = product.price;
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
            yield newCart.save();
            res.json({ message: "product saved to cart", sucess: "true" });
            return newCart;
        }
        const existingProduct = cart === null || cart === void 0 ? void 0 : cart.products.find(product => product._id.toString() === prodId);
        const existingCart = yield Cart.findById(cart === null || cart === void 0 ? void 0 : cart._id);
        const products = existingCart === null || existingCart === void 0 ? void 0 : existingCart.products;
        total = 0;
        if (products !== undefined) {
            for (let i = 0; i < (products === null || products === void 0 ? void 0 : products.length); i++) {
                const cost = yield Product.findById(products[i]._id).select('price');
                const count = products[i].count;
                total = total + cost.price * count;
            }
        }
        deliveryCharge = total > basicAmount ? 0 : 30;
        if (existingProduct && cart !== null && product.quantity && product.quantity >= 1) {
            existingProduct.count += 1;
            cartTotal = deliveryCharge + tip + handlingCharge + total + product.price * 1;
            cart.total = total + product.price * 1;
            cart.cartTotal = cartTotal;
            cart.tip = tipAmount;
            cart.deliveryCharge = deliveryCharge;
            yield cart.save();
            res.json({ message: "product updated to cart", sucess: "true" });
            return cart;
        }
        if (product.quantity && product.quantity >= 1) {
            deliveryCharge = total > basicAmount ? 0 : 30;
            cartTotal = deliveryCharge + tip + handlingCharge + total + product.price * 1;
            total = total + product.price * 1;
            let updatedCart = yield Cart.findByIdAndUpdate(cart === null || cart === void 0 ? void 0 : cart._id, {
                $push: { products: { _id: prodId, count: 1, color: color } },
                cartTotal, total, deliveryCharge, tip, handlingCharge
            }, { new: true });
            return res.json(updatedCart);
        }
    }
    catch (error) {
        console.log(error);
        throw new FancyError("cannot update items to the cart", 400);
    }
}));
export const deleteCartItems = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    const { prodId } = req.body;
    try {
        const prod = yield Product.findById(prodId);
        if (!prod) {
            return res.json({ message: "Product id is must", sucess: "False" });
        }
        let cart = yield Cart.findOne({ orderBy: _id });
        if (cart === null) {
            return res.json({ message: "No produts in the cart", sucess: "False" });
        }
        let basicAmount = 199;
        let total = cart.total - prod.price;
        let deliveryCharge = total < basicAmount ? 30 : 0;
        let tip = cart.tip > 0 ? cart.tip : 0;
        const handlingCharge = 2;
        let cartTotal = deliveryCharge + tip + handlingCharge + cart.total - prod.price;
        const existingProduct = cart.products.find(product => product._id.toString() === prodId);
        if (existingProduct !== undefined) {
            if (existingProduct.count > 1) {
                existingProduct.count -= 1;
                cart.total = total;
                cart.deliveryCharge = deliveryCharge;
                cart.cartTotal = cartTotal;
                cart.handlingCharge = handlingCharge;
                cart.tip = tip;
            }
            else {
                cart.products = cart.products.filter((item) => item._id.toString() !== prodId);
                cart.total = total;
                cart.deliveryCharge = deliveryCharge;
                cart.cartTotal = cartTotal;
            }
            yield cart.save();
            if (cart.products.length === 0) {
                cart = yield Cart.findOneAndRemove({ orderBy: _id }, { new: true });
            }
            res.json({ message: "cart items decreased or item itself delted.", sucess: true, cart });
        }
        else {
            res.json({ message: "product you are trying to delete is already deleted.", sucess: true });
        }
    }
    catch (error) {
        throw new FancyError("cannot delete items from the cart", 400);
    }
}));
export const getUserCart = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    try {
        const cart = yield Cart.findOne({ orderBy: _id }).populate('products._id');
        res.json({ cart });
    }
    catch (error) {
        console.log(error);
        throw new FancyError("cant be able to get the cart", 400);
    }
}));
export const emptyCart = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    console.log(_id);
    try {
        const user = yield User.findOne({ _id });
        const cart = yield Cart.findOneAndRemove({ orderBy: user === null || user === void 0 ? void 0 : user._id }, { new: true });
        res.json({ cart });
    }
    catch (error) {
        console.log(error);
        throw new FancyError("cant be able to get the cart", 400);
    }
}));
export const applyCoupon = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coupon } = req.body;
    const { _id } = req.user;
    const validCoupon = yield Coupon.findOne({ name: coupon });
    if (validCoupon === null) {
        throw new FancyError("invalid coupon", 400);
    }
    const user = yield User.findOne({ _id });
    let { cartTotal } = yield Cart.findOne({ orderBy: user === null || user === void 0 ? void 0 : user._id }).populate("products");
    let totalAfterDiscount = (cartTotal - (cartTotal * validCoupon.discount) / 100).toFixed(2);
    const cart = yield Cart.findOneAndUpdate({ orderBy: user === null || user === void 0 ? void 0 : user._id }, { totalAfterDiscount }, { new: true });
    res.json(cart);
}));
export const createOrder = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { COD, couponApplied } = req.body;
    const { _id } = req.user;
    if (!COD)
        throw new FancyError("Create Cash Order Failed", 500);
    try {
        const user = yield User.findById(_id);
        const userCart = yield Cart.findOne({ orderBy: user === null || user === void 0 ? void 0 : user._id });
        let finalAmount = 0;
        if (couponApplied && (userCart === null || userCart === void 0 ? void 0 : userCart.totalAfterDiscount)) {
            finalAmount = userCart.totalAfterDiscount;
        }
        else {
            finalAmount = userCart ? userCart.cartTotal : 0;
        }
        if (userCart !== null && (userCart === null || userCart === void 0 ? void 0 : userCart.products) !== undefined) {
            const newOrder = yield new Order({
                products: userCart === null || userCart === void 0 ? void 0 : userCart.products,
                paymentIntent: {
                    order_id: uniqueId("ORD"),
                    method: "COD",
                    amount: finalAmount,
                    status: "Cash On Delivery",
                    created: Date.now(),
                    currency: "USD",
                },
                orderBy: user === null || user === void 0 ? void 0 : user._id,
                paymentMethod: "Cash on Delivery",
            }).save();
            for (const item of userCart.products) {
                yield Product.updateOne({ _id: item === null || item === void 0 ? void 0 : item._id }, { $inc: { quantity: -item.count, sold: item.count } });
            }
            res.json({ message: "sucess", sucess: true });
        }
        else {
            res.json({ message: "Cart is Empty", sucess: false });
        }
        const cart = yield Cart.findOneAndRemove({ orderBy: user === null || user === void 0 ? void 0 : user._id });
    }
    catch (error) {
        throw new FancyError(error, 500);
    }
}));
export const getOrders = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id } = req.user;
    try {
        const userOrders = yield Order.findOne({ orderBy: _id }).populate("products");
        res.json(userOrders);
    }
    catch (error) {
        throw new FancyError("not getting the orders", 500);
    }
}));
export const updateOrderStatus = asyncHandler((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { Status } = req.body;
    const { id } = req.params;
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
        const findOrder = yield Order.findByIdAndUpdate(id, {
            orderStatus: orderStatus,
            paymentIntent: {
                status: Status
            },
        }, { new: true });
        res.json(findOrder);
    }
    catch (error) {
        throw new FancyError("not able to update status", 400);
    }
}));
