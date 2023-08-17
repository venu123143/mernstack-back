import { constants } from "./constants.js";
const ErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    switch (err.statusCode) {
        case constants.VALIDATION_ERROR:
            res.status(err.statusCode).json({
                title: "Validation Error",
                message: err.message,
                statckTrace: err.stack,
                statusCode: err.statusCode
            });
            break;
        case constants.NOT_FOUND:
            res.status(err.statusCode).json({
                title: "Not Found Error",
                message: err.message,
                statckTrace: err.stack,
                statusCode: err.statusCode
            });
            break;
        case constants.UNAUTHORIZED_ERROR:
            res.status(err.statusCode).json({
                title: "UNAUTHORIZED_ERROR",
                message: err.message,
                statckTrace: err.stack,
                statusCode: err.statusCode
            });
            break;
        case constants.FORBIDDEN:
            res.status(err.statusCode).json({
                title: "FORBIDDEN",
                message: err.message,
                statckTrace: err.stack,
                statusCode: err.statusCode
            });
            break;
        case constants.SERVER_ERROR:
            res.status(err.statusCode).json({
                title: "SERVER_ERROR",
                message: err.message,
                statckTrace: err.stack,
                statusCode: err.statusCode
            });
            break;
        default:
            console.log("no error or unknown error.");
            break;
    }
};
export default ErrorHandler;
