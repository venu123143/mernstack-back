import asyncHandler from "express-async-handler";
import slugify from "slugify";
import fs from "fs";
import Stripe from "stripe";
import Razorpay from "razorpay";
import Product, { IProduct } from "../models/ProductModel.js";
import FancyError from "../utils/FancyError.js";
import User, { IUser } from "../models/UserModel.js";
import { uploadImage, deleteImage } from "../utils/Cloudinary.js";
import { upload } from "../utils/Amazon_s3.js";
import { Request, Response } from "express";
import NodeMailer from "../utils/NodeMailer.js"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2023-08-16",
});



export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_TEST as string,
  key_secret: process.env.RAZORPAY_SECRET as string,
});
export const createProduct = asyncHandler(async (req, res) => {
  const { title, description, category, brand, quantity, color, tags, price, images } = req.body
  try {
    if (req.body.title) {
      req.body.slug = slugify.default(req.body.title);
    }
    if (req.user) {
      const product = await Product.create({
        title, description,
        images,
        category, brand,
        seller: req.user._id,
        slug: req.body.slug,
        price: price,
        tags: tags,
        quantity: quantity,
        color: color
      });
      res.status(200).json(product);
    }
  } catch (error) {
    throw new FancyError(" can't be able to create product, enter all required fields..!", 400);
  }
});
export const updateProduct = asyncHandler(async (req, res) => {
  try {
    if (req.body.title) {
      req.body.slug = slugify.default(req.body.title);
    }
    const { title, description, category, brand, quantity, color, tags, price, images } = req.body

    // if (formData?.existingImg?.length !== 0) {
    //   urls.unshift(...formData.existingImg)
    // }

    const { id } = req.params;
    if (req.user) {
      const updateProd = await Product.findOneAndUpdate({ _id: id },
        {
          title, description,
          category, brand,
          slug: req.body.slug,
          price, tags, quantity,
          color, images
        }, {
        new: true,
      }).populate(["category", "brand", "color"]);
      res.json(updateProd);
    }
  } catch (error) {

    throw new FancyError(" can't be able to update product, Try Again..!", 400);
  }
});
export const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const deleteProd = await Product.findByIdAndDelete(id);
    if (deleteProd !== null) {
      res.json({ deleteProd, message: "item deleted sucessfully" });
    } else {
      res.json({ message: "no item  with this id or already deleted..!" });
    }
  } catch (error) {
    throw new FancyError(
      " can't be able to delete the product, Try Again..!",
      400
    );
  }
});
export const getProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const findProduct = await Product.findById({ _id: id }).populate([
      "category",
      "brand",
      "color",
      "ratings.postedBy",
      "seller"
    ]);
    const resoponse = await NodeMailer({ to: 'knsrinivasareddy@outlook.com', subject: 'sent from node js', html: `<h1> hello world Yahoo</h1>` }, 'google')
    // const resoponse = await NodeMailer({ to: 'venu123reddy123@gmail.com', subject: 'sent from node js', html: `<h1> hello world</h1>` })
    console.log(resoponse);

    if (findProduct !== null) {
      res.json(findProduct);
    } else {
      res.json({ message: "no item  with this id..!" });
    }
  } catch (error) {
    throw new FancyError("cant able to fetch the product", 404);
  }
});

export const getAllProducts = asyncHandler(async (req, res): Promise<any> => {
  try {
    // filtering
    const queryObj: Record<string, any> = { ...req.query };
    console.log(queryObj);
    const excludeFields = ["page", "sort", "limit", "fields"];
    excludeFields.forEach((el) => delete queryObj[el]);

    for (const key in queryObj) {
      if (queryObj[key] !== undefined && typeof queryObj[key] === 'string') {
        if (queryObj[key].includes(',')) {
          queryObj[key] = queryObj[key].split(',');
        } else {
          if (['title'].includes(key)) {
            queryObj[key] = { $regex: queryObj[key], $options: 'i' };

          } else {
            queryObj[key] = [queryObj[key]];
          }
        }
      }
    }

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    var query = Product.find(JSON.parse(queryStr))

    // sorting,ejs, sorting ejs
    if (req.query.sort) {
      var s = req.query.sort as string;
      const sortBy = s.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // limiting fields
    if (req.query.fields) {
      const fields = req.query.fields as string;
      query = query.select(fields.split(",").join(" "));
    } else {
      query = query.select("-__v");
    }

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit);
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);
    const countDocuments = await Product.countDocuments();
    if (req.query.page) {
      if (skip >= countDocuments) {
        return res
          .status(404)
          .json({ message: "this page doesnot exist", statusCode: 404 });
      }
    }
    const products = await query.populate(["category", "brand", "color", "seller"]);

    return res.json(products);
  } catch (error) {
    console.log(error);

    throw new FancyError("cannot be able to fetch products", 400);
  }
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user as IUser;
  const { prodId } = req.body;
  try {
    const user = await User.findById(_id);
    let alreadyAdded;
    if (user?.wishlist !== undefined && user?.wishlist !== null) {
      alreadyAdded = user.wishlist.find((id) => id.toString() === prodId);
    }
    if (alreadyAdded) {
      const user = await User.findByIdAndUpdate(_id, { $pull: { wishlist: prodId } }, { new: true })
        .populate({
          path: 'wishlist',
          populate: [{ path: 'brand' }, { path: 'category' }, { path: 'seller', select: 'firstname' }]
        })
      res.json(user);
    } else {
      const user = await User.findByIdAndUpdate(_id, { $push: { wishlist: prodId } }, { new: true })
        .populate({
          path: 'wishlist',
          populate: [{ path: 'brand' }, { path: 'category' }, { path: 'seller', select: 'firstname' }]
        })

      res.json(user);
    }
  } catch (error) {
    console.log(error);

    throw new FancyError("can't add the items to wishlist", 500);
  }
});
export const rating = asyncHandler(async (req, res) => {
  const { _id } = req.user as IUser;
  const { star, prodId, comment, title } = req.body;
  try {
    // products before update or add the rating
    if (!prodId || !star) {
      res.status(400).json({ message: "product id and rating is mandetory to add review" })
      return
    }
    const product = await Product.findById(prodId);
    let alreadyRated = product?.ratings?.find(
      (rating) => rating.postedBy.toString() === _id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        { ratings: { $elemMatch: alreadyRated } },
        { $set: { "ratings.$.star": star, "ratings.$.comment": comment, "ratings.$.title": title } },
        { news: true }
      );
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        prodId,
        {
          $push: { ratings: { star: star, postedBy: _id, title, comment } },
        },
        { new: true }
      );
    }

    // products after update or add the rating
    // finding the avg rating.
    const AllRatings = await Product.findById(prodId);
    let totalRatings = AllRatings?.ratings?.length;
    if (AllRatings?.ratings !== undefined && totalRatings !== undefined) {
      let ratingSum = AllRatings.ratings
        .map((item) => item.star)
        .reduce((prev, cur) => prev + cur, 0);
      let actualRating = Math.round(ratingSum / totalRatings);
      const finalProd = await Product.findByIdAndUpdate(
        prodId,
        { totalRating: actualRating },
        { new: true }
      ).populate(["category", "brand", "color", "seller"])
        .populate({ path: 'ratings', populate: [{ path: 'postedBy', select: 'firstname' }] })
      console.log(finalProd);

      res.json(finalProd);
    }
  } catch (error) {
    throw new FancyError("can't able to rate the product", 500);
  }
});
export const deleteReview = asyncHandler(async (req, res) => {
  const { _id } = req.user as IUser;
  const { id } = req.params;
  try {
    // products before update or add the rating
    if (!id) {
      res.status(400).json({ message: "id is mandetory to add review" })
      return
    }
    const review = await Product.find({ ratings: { _id: id } })
    const del = Product.findByIdAndUpdate(id, { $pull: { ratings: { _id: id } } }, { new: true })
    res.json(del)

  } catch (error) {
    throw new FancyError("can't able to delete the review", 500);
  }
});

export const uploadImages = asyncHandler(async (req, res) => {
  try {
    const uploader = (path: string) => uploadImage(path);
    const urls = [];
    const files = req.files as Express.Multer.File[];

    for (const file of files) {
      const { path } = file;
      const newpath = await uploader(path);
      urls.push(newpath);
      fs.unlinkSync(path);
    }

    res.json({ images: urls, message: 'images uploaded successfully' });
  } catch (error) {
    throw new FancyError("cannot upload images", 400);
  }
}) as any;
export const deleteImages = asyncHandler(async (req, res) => {
  const { path } = req.params;
  try {
    const deleted = deleteImage(path);
    res.json({ message: "deleted sucessfully" });
  } catch (error) {
    throw new FancyError("cannot delete images", 400);
  }
});

export const createCheckoutSession = asyncHandler(async (req, res) => {
  const products = req.body;
  try {
    const line_items = products?.cartItems?.map((product: any) => ({
      price_data: {
        currency: "inr", // Change the currency code as needed
        product_data: {
          name: product.name,
          description: product.desc,
        },
        unit_amount: product.price * 100, // Stripe expects the amount in cents
      },
      quantity: product.cartQuantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: line_items,
      mode: "payment",
      success_url: "http://localhost:5173/sucess",
      cancel_url: "http://localhost:5173/cancel",
    });
    res.json({ id: session.id });
  } catch (error: any) {
    throw new FancyError("Payment Failed, due to technical issue", 400);
  }
});

export const createRaziropayOrder = asyncHandler(async (req, res) => {
  const options = {
    amount: req.body?.cartTotalAmount * 100,
    currency: "INR",
    receipt: "order_reciept_id"
  }
  try {

    razorpay.orders.create(options, function (err, order) {
      if (err) {
        console.log(err)
        res.status(400).json({ message: err.error?.description })
        return
      }
      res.status(200).json(order)
    })

  } catch (error: any) {
    throw new FancyError("Unable to create order, Try again after some time.", 400);
  }

});

export const getOrderById = async (req: Request, res: Response) => {
  const { id } = req.params
  const orderDetails = await razorpay.payments.fetch(id)
  // razorpay.payments.all(option)
  res.json(orderDetails)

}
export const uploadFilesToS3 = asyncHandler(async (req, res) => {
  const files = req.files as Express.Multer.File[];
  const urls = []
  for (const file of files) {
    const result = await upload(file)
    urls.push({ url: result })
  }

  res.json({ urls })
})

export const uploadCkImage = asyncHandler(async (req, res) => {
  // const token = req.body.ckCsrfToken;
  // const fileUrl = `${req.protocol}://${req.get('host')}/images/${req.file?.filename}`;
  const response = {
    url: req?.file?.path
  };
  res.json(response);
});