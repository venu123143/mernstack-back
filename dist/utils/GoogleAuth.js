var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
import qs from 'qs';
export const getGoogleOauthTokens = ({ code }) => __awaiter(void 0, void 0, void 0, function* () {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL,
        grant_type: "authorization_code",
    };
    try {
        const res = yield axios.post(url, qs.stringify(values), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });
        return res.data;
    }
    catch (error) {
        console.log(error, 'failed to Google Oauth');
        throw error;
    }
});
export const getGoogleUser = ({ id_token, access_token }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, { headers: { Authorization: `Bearer ${id_token}` } });
        return res.data;
    }
    catch (error) {
        throw error;
    }
});
