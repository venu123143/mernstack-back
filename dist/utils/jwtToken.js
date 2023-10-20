var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const jwtToken = (user, statusCode, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = yield user.generateAuthToken();
    if (token !== undefined) {
        const options = {
            maxAge: 24 * 60 * 60 * 1000,
            secure: false,
            httpOnly: true,
        };
        res.status(statusCode).cookie('loginToken', token, options).json({
            user,
            sucess: true,
            message: "user logged in sucessfully"
        });
    }
    else {
        console.log('token is undefined');
    }
});
export default jwtToken;
