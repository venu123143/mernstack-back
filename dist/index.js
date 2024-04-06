import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import responceTime from "response-time";
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server for handling uncaught Exception`);
});
import 'dotenv/config';
import "./config/db.js";
const app = express();
import ErrorHandler from "./middleware/Error.js";
import UserRouter from './routes/UserRoute.js';
import ProductRouter from "./routes/productRoute.js";
import BlogRouter from "./routes/BlogRoutes.js";
import Category from "./routes/ProdCategoryRoutes.js";
import BlogCategory from "./routes/BlogCatRoute.js";
import BrandRouter from "./routes/BrandRoute.js";
import ColorRouter from "./routes/ColorRoute.js";
import CouponRouter from "./routes/CoponRoute.js";
import EnquiryRouter from "./routes/EnqRoute.js";
const options = {
    origin: ['https://amazonadmin-app.netlify.app', 'https://amazon-clone-wtj7.onrender.com', 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
};
app.use(cors(options));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('./dist/public/images'));
app.use(morgan('dev'));
app.use(responceTime());
app.get('/', (req, res) => {
    res.send('backend home route sucessful');
});
app.use("/api/users", UserRouter);
app.use("/api/product", ProductRouter);
app.use("/api/blog", BlogRouter);
app.use("/api/category", Category);
app.use("/api/blogcategory", BlogCategory);
app.use("/api/brand", BrandRouter);
app.use("/api/coupon", CouponRouter);
app.use("/api/color", ColorRouter);
app.use("/api/enq", EnquiryRouter);
app.use(ErrorHandler);
const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
    console.log(`server is running on port number ${port}`);
});
process.on("unhandledRejection", (err) => {
    console.log(`Shutting down the server for ${err.message}`);
    console.log(`Shutting down the server for unhandle promise rejection`);
    server.close(() => {
        process.exit(1);
    });
});
