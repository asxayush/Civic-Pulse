import { body } from "express-validator";

const userRegisterValidator = () =>
{
    return [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("email required")
    .isEmail()
    .withMessage("email invalid"),
    body("name")
    .trim()
    .notEmpty()
    .withMessage("name is required")
    .isLength({min: 3})
    .withMessage("name must be at least 3 char long"),
    body("password")
    .trim()
    .notEmpty()
    .withMessage("password is required"),
    
    
]

}


const userLoginValidator = () => {
    return [
        body("email")
        .optional()
        .isEmail()
        .withMessage("email is invalid"),
        body("password")
        .notEmpty()
        .withMessage("password is required")
    ]
}

export {
    userRegisterValidator,
    userLoginValidator
}