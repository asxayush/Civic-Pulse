import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required")
            .isLength({ min: 3 })
            .withMessage("Name must be at least 3 characters long"),
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long")
    ];
};

const userLoginValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .notEmpty()
            .withMessage("Password is required")
    ];
};

const otpVerifyValidator = () => {
    return [
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("otp")
            .trim()
            .notEmpty()
            .withMessage("OTP is required")
            .isLength({ min: 6, max: 6 })
            .withMessage("OTP must be 6 digits")
    ];
};

const createStaffValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required"),
        body("email")
            .trim()
            .notEmpty()
            .withMessage("Email is required")
            .isEmail()
            .withMessage("Email is invalid"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
        body("department")
            .trim()
            .notEmpty()
            .withMessage("Department is required")
            .isIn(["electricity", "water", "food", "miscellaneous"])
            .withMessage("Invalid department enum value")
    ];
};

const complaintValidator = () => {
    return [
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Title is required"),
        body("description")
            .trim()
            .notEmpty()
            .withMessage("Description is required"),
        body("category")
            .trim()
            .notEmpty()
            .withMessage("Category is required")
            .isIn(["electricity", "water", "food", "miscellaneous"])
            .withMessage("Invalid category enum value"),
        body("isAnonymous")
            .optional()
            .isBoolean()
            .withMessage("isAnonymous must be a boolean value")
    ];
};

const complaintStatusValidator = () => {
    return [
        body("status")
            .trim()
            .notEmpty()
            .withMessage("Status is required")
            .isIn(["pending", "in-progress", "resolved"])
            .withMessage("Invalid status value")
    ];
};

export {
    userRegisterValidator,
    userLoginValidator,
    otpVerifyValidator,
    createStaffValidator,
    complaintValidator,
    complaintStatusValidator
};