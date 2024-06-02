var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import passport from "passport";
import User from "../models/UserModel.js";
import { Strategy as GoogleStrategy } from 'passport-google-oauth2';
const verifyCallback = (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let user = yield User.findOne({ email: (_a = profile === null || profile === void 0 ? void 0 : profile.emails) === null || _a === void 0 ? void 0 : _a[0].value });
        if (!user) {
            const email = ((_b = profile === null || profile === void 0 ? void 0 : profile.emails) === null || _b === void 0 ? void 0 : _b[0].value) || '';
            const firstName = (profile === null || profile === void 0 ? void 0 : profile.given_name) || '';
            const lastName = (profile === null || profile === void 0 ? void 0 : profile.family_name) || '';
            const picture = (profile === null || profile === void 0 ? void 0 : profile.picture) || '';
            user = yield User.create({
                firstname: firstName,
                lastname: lastName,
                email: email,
                profile: picture,
                provider: 'google',
                role: 'user'
            });
        }
        return done(null, user);
    }
    catch (error) {
        console.log("error", error);
        return done(error, null);
    }
});
const googleStrategyOptions = {
    clientID: process.env.CLIENT_ID || '',
    clientSecret: process.env.CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_OAUTH_REDIRECT_URL || '',
};
passport.use(new GoogleStrategy(googleStrategyOptions, verifyCallback));
passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((user, done) => {
    done(null, user);
});
