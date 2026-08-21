import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { OTP } from "../models/otp.models.js";
import { sendOTPEmail } from "../utils/mailer.js";

// ─── Helper: Generate JWT Token ───
const generateToken = (user) => {
    return jwt.sign(
        { _id: user._id, role: user.role },
        process.env.JWT_SECRET || "default_jwt_secret",
        { expiresIn: process.env.JWT_SECRET_EXPIRY || "7d" }
    );
};

// ─── POST /api/auth/register ───
const registerUser = asyncHandler(async (req, res) => {
    const { name, password } = req.body;
    const email = String(req.body.email || "").toLowerCase().trim();

    // MVP: any valid email is allowed (domain lock disabled).

    const existedUser = await User.findOne({ email });

    if (existedUser && existedUser.isVerified) {
        throw new ApiError(409, "Email is already registered and verified");
    }

    let user = existedUser;
    if (existedUser && !existedUser.isVerified) {
        user.name = name;
        user.password = password;
        await user.save();
    } else {
        user = await User.create({
            name,
            email,
            password,
            role: "student",
            isVerified: false
        });
    }

    // Generate 6-digit OTP
    const generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: generatedOTP });

    // Send email asynchronously in background so response returns instantly
    sendOTPEmail(email, generatedOTP).catch((err) => console.warn("[MAIL WARNING] Background OTP dispatch failed:", err.message));

    const safeUser = await User.findById(user._id).select("-password");

    const isMailtrap = (process.env.SMTP_HOST || "").includes("mailtrap");
    const isLiveSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && !isMailtrap;

    const payload = { user: safeUser };
    if (!isLiveSmtp) {
        payload.devOTP = generatedOTP;
        console.log(`\n[OTP] ${email} → ${generatedOTP}\n`);
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            payload,
            !isLiveSmtp
                ? `Registered. Dev OTP: ${generatedOTP} (auto-filled for instant verification)`
                : "User registered successfully. Verification OTP has been sent to your email."
        )
    );
});

// ─── POST /api/auth/verify-otp ───
const verifyOTP = asyncHandler(async (req, res) => {
    const email = String(req.body.email || "").toLowerCase().trim();
    const otp = String(req.body.otp || "").trim();

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
        throw new ApiError(400, "Expired or invalid OTP. Please request a new verification code.");
    }

    if (String(otpRecord.otp) !== otp) {
        throw new ApiError(400, "Invalid OTP code");
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User profile not found");
    }

    user.isVerified = true;
    await user.save();

    const token = generateToken(user);
    const safeUser = await User.findById(user._id).select("-password");

    return res.status(200).json(
        new ApiResponse(200, { user: safeUser, token }, "Email verified successfully. Welcome to Civic Pulse!")
    );
});

// ─── POST /api/auth/login ───
const loginUser = asyncHandler(async (req, res) => {
    const email = String(req.body.email || "").toLowerCase().trim();
    const { password, adminPin } = req.body;

    const existedUser = await User.findOne({ email });
    if (!existedUser) {
        throw new ApiError(404, "Your email is not registered with our platform");
    }

    const isPasswordValid = await bcrypt.compare(password, existedUser.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    if (!existedUser.isVerified) {
        throw new ApiError(403, "Please verify your email with the OTP before logging in");
    }

    if (existedUser.role === "admin" && String(adminPin || "") !== String(process.env.ADMIN_LOGIN_PIN || "1234")) {
        throw new ApiError(401, "A valid admin PIN is required");
    }

    if (existedUser.isBanned) {
        throw new ApiError(403, "Your account has been banned due to repeated policy violations");
    }

    const token = generateToken(existedUser);
    const safeUser = await User.findById(existedUser._id).select("-password");

    return res.status(200).json(
        new ApiResponse(200, { user: safeUser, token }, "User logged in successfully")
    );
});

// ─── GET /api/auth/me ───
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "User profile fetched successfully")
    );
});

export {
    registerUser,
    verifyOTP,
    loginUser,
    getCurrentUser
};