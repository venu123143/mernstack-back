export interface Constants {
    VALIDATION_ERROR: number,
    UNAUTHORIZED_ERROR: number,
    FORBIDDEN: number,
    NOT_FOUND: number,
    SERVER_ERROR: number
}
export const constants: Constants = {
    VALIDATION_ERROR: 400,
    UNAUTHORIZED_ERROR: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    SERVER_ERROR: 500
}