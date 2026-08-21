import { Router } from "express";
import { registerUser, verifyOTP, loginUser, googleAuth, getCurrentUser } from "../controllers/auth.controllers.js";
import { userRegisterValidator, userLoginValidator, otpVerifyValidator } from "../validators/index.js";
import { validate } from "../middleware/validator.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/register").post(userRegisterValidator(), validate, registerUser);
router.route("/verify-otp").post(otpVerifyValidator(), validate, verifyOTP);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/google").post(googleAuth);
router.route("/me").get(verifyJWT, getCurrentUser);

export default router;