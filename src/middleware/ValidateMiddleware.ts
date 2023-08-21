
import { check } from "express-validator"

export const loginValidator = [
    // check('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minSymbols: 1, minNumbers: 1 }),
    check('email', 'Enter the valid email id').normalizeEmail().isEmail()
]

export const passwordValidator = [
    check('password').isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minSymbols: 1, minNumbers: 1 }),
]
export const registerValidator = [
    check('firstname', 'firstname should not be an empty').isLength({ min: 3 }),
    check('lastname', 'lastname should not be an empty').isLength({ min: 3 }),
    check('email', 'Enter the valid email id').normalizeEmail().isEmail(),
    check('mobile', 'Enter the valid mobile number').isMobilePhone('en-IN'),
    check('password', 'password contain altleast {1} uppercase, lowecase, one number, one symbol and mininum 8 chars long.')
        .isStrongPassword({ minLength: 8, minLowercase: 1, minUppercase: 1, minSymbols: 1, minNumbers: 1 })
]