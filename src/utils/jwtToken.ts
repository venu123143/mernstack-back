import { IUser } from "../models/UserModel.js"
import { Response } from "express";

const jwtToken = async (user: IUser, statusCode: number, res: Response) => {    
    const token = await user.generateAuthToken()
    // console.log(token);

    if (token !== undefined) {
        // expiresIn:"3d",
        // maxAge = 24 * 60 * 60 * 1000 = 1 day
        const options = {
            maxAge: 24 * 60 * 60 * 1000,
            secure: false,
            httpOnly: false,
        }
        res.status(statusCode).cookie('loginToken', token, options).json({
            user,
            sucess: true,
            message: "user logged in sucessfully"
        })
    } else {
        console.log('token is undefined');

    }
}

export default jwtToken