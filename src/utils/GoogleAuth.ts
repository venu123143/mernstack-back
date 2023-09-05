import axios from "axios"
import qs from 'qs'

interface GoogletTokensResult {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    id_token: string;
    token_type: string;

}
export const getGoogleOauthTokens = async ({ code }: { code: string }): Promise<GoogletTokensResult> => {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code,
        client_id: process.env.CLIENT_ID as string,
        client_secret: process.env.CLIENT_SECRET as string,
        redirect_uri: process.env.GOOGLE_OAUTH_REDIRECT_URL as string,
        grant_type: "authorization_code",
    };

    try {
        const res = await axios.post(url, qs.stringify(values), {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        return res.data;
    } catch (error: any) {
        console.log(error, 'failed to Google Oauth');
        throw error; // You can rethrow the error if needed, or handle it differently.
    }
};

interface GoogleUserResult {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
}
export const getGoogleUser = async ({ id_token, access_token }: { id_token: string, access_token: string }): Promise<GoogleUserResult> => {
    try {
        const res = await axios.get<GoogleUserResult>(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`
            , { headers: { Authorization: `Bearer ${id_token}` } })
        return res.data
    } catch (error) {
        throw error
    }
}

