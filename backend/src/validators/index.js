import { body } from "express-validator";

const userRegisterValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Name is required")
            .isLength({ min: 2 })
            .withMessage("Name must be at least 2 characters long"),
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
            .isNumeric()
            .withMessage("OTP must contain only digits")
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
        body("hostelBlock")
            .trim()
            .notEmpty()
            .withMessage("Hostel block location is required"),
        body("isAnonymous")
            .optional()
            .customSanitizer(val => val === "true" || val === true)
    ];
};

const complaintStatusValidator = () => {
    return [
        body("status")
            .trim()
            .notEmpty()
            .withMessage("Status is required")
            .isIn(["PENDING", "IN_PROGRESS", "RESOLVED_BY_STAFF", "VERIFIED_CLOSED", "REOPENED"])
            .withMessage("Invalid status value. Must be one of: PENDING, IN_PROGRESS, RESOLVED_BY_STAFF, VERIFIED_CLOSED, REOPENED")
    ];
};

const resolutionOtpValidator = () => {
    return [
        body("otp")
            .trim()
            .notEmpty()
            .withMessage("Resolution verification OTP is required")
            .isLength({ min: 4, max: 4 })
            .withMessage("Resolution OTP must be 4 digits")
    ];
};

export {
    userRegisterValidator,
    userLoginValidator,
    otpVerifyValidator,
    createStaffValidator,
    complaintValidator,
    complaintStatusValidator,
    resolutionOtpValidator
};