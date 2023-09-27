import cookieParser from "cookie-parser"
import express, { Application } from "express"
import cors from "cors"
import morgan from "morgan"
import session from 'express-session'


// Handle uncaught Exception
process.on("uncaughtException", (err) => {
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server for handling uncaught Exception`);
})

// config env and database connection.
import 'dotenv/config'
import "./config/db.js"



const app: Application = express();

import ErrorHandler from "./middleware/Error.js"
import UserRouter from './routes/UserRoute.js'
import ProductRouter from "./routes/productRoute.js"
import BlogRouter from "./routes/BlogRoutes.js"
import Category from "./routes/ProdCategoryRoutes.js"
import BlogCategory from "./routes/BlogCatRoute.js"
import BrandRouter from "./routes/BrandRoute.js"
import ColorRouter from "./routes/ColorRoute.js"
import CouponRouter from "./routes/CoponRoute.js"
import EnquiryRouter from "./routes/EnqRoute.js"

// cors, json and cookie-parser
export interface Options {
    origin: string[],
    credentials: boolean,
    withCredentials: boolean,
    optionSuccessStatus: number
}
const options: Options = {
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
    withCredentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(options));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'))
app.use(session({ resave: true, saveUninitialized: true, secret: process.env.SESSION_KEY as string }))

// controllers
app.get('/', (req, res) => {
    res.send('backend home route sucessful')
})

app.use("/api/users", UserRouter)
app.use("/api/product", ProductRouter)
app.use("/api/blog", BlogRouter)
app.use("/api/category", Category)
app.use("/api/blogcategory", BlogCategory)
app.use("/api/brand", BrandRouter)
app.use("/api/coupon", CouponRouter)
app.use("/api/color", ColorRouter)
app.use("/api/enq", EnquiryRouter)



// Error handler and server port
app.use(ErrorHandler)

const port = process.env.PORT || 5000
const server = app.listen(port, () => {
    console.log(`server is running on port number ${port}`);
})
// unhandled promise rejection
process.on("unhandledRejection", (err: Error) => {
    console.log(`Shutting down the server for ${err.message}`);
    console.log(`Shutting down the server for unhandle promise rejection`);
    server.close(() => {
        process.exit(1)
    })

})
