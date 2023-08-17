import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import crypto from "crypto"
// interface for the schema model.
export interface IUser extends Document {
    _id: Schema.Types.ObjectId,
    firstname: string,
    lastname: string,
    email: string,
    phone: string,
    password: string,
    role: string,
    isBlocked: boolean,
    cart?: Schema.Types.ObjectId[],
    address?: string,
    wishlist?: mongoose.Types.ObjectId[],
    efreshToken?: string;
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    generateAuthToken: () => string,
    isPasswordMatched: (password: string) => boolean
    createPasswordResetToken: () => string
}

// user schema.
const userSchema: Schema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        lowercase: true,
        required: true,
        unique: true,
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "user"
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    cart: [{
        // type: Array,
        // default: []
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cart'
    }],
    address: {
        type: String,
    },
    wishlist: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
    refreshToken: {
        type: String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

}, { collection: 'users', timestamps: true });

// hashing password
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 12) // password, salt
    }
    next();
})

// we are generating token
userSchema.methods.generateAuthToken = async function () {
    try {
        let cur_token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY as jwt.Secret, { expiresIn: '1d' });
        this.refreshToken = cur_token
        await this.save();
        return cur_token;
    } catch (error) {
        console.log(error);
    }
}
userSchema.methods.isPasswordMatched = async function (password: string) {
    return await bcrypt.compare(password, this.password)

}
userSchema.methods.createPasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(32).toString('hex')
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000
    await this.save();

    return resetToken
}

//Export the model
export default mongoose.model<IUser>('User', userSchema);