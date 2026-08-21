import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { OTP } from "../models/otp.models.js";
import { sendOTPEmail } from "../utils/mailer.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    const requiredDomain = process.env.COLLEGE_EMAIL_DOMAIN || "@yourcollege.edu.in";
    if (requiredDomain && !email.toLowerCase().endsWith(requiredDomain.toLowerCase())) {
        throw new ApiError(400, `Registration restricted. Email must end with ${requiredDomain}`);
    }

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
    await OTP.create({
        email,
        otp: generatedOTP
    });

    await sendOTPEmail(email, generatedOTP);

    const safeUser = await User.findById(user._id).select("-password");

    return res.status(201).json(
        new ApiResponse(201, { user: safeUser }, "User registered successfully. Verification OTP has been sent to your email.")
    );
});

const verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    const otpRecord = await OTP.findOne({ email });
    if (!otpRecord) {
        throw new ApiError(400, "Expired or invalid OTP. Please request a new verification code.");
    }

    if (otpRecord.otp !== otp) {
        throw new ApiError(400, "Invalid OTP code");
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    const user = await User.findOne({ email });
    if (!user) {
        throw new ApiError(404, "User profile not found");
    }

    user.isVerified = true;
    await user.save();

    const token = jwt.sign(
        {
            _id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET || "default_jwt_secret",
        {
            expiresIn: process.env.JWT_SECRET_EXPIRY || "1d"
        }
    );

    const safeUser = await User.findById(user._id).select("-password");

    return res.status(200).json(
        new ApiResponse(200, { user: safeUser, token }, "Email verified successfully. Welcome to Civic Pulse!")
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const existedUser = await User.findOne({ email });
    if (!existedUser) {
        throw new ApiError(404, "Your email is not registered with our platform");
    }

    const isPasswordValid = await bcrypt.compare(password, existedUser.password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials");
    }

    if (!existedUser.isVerified) {
        throw new ApiError(403, "Please verify your email before logging in");
    }

    if (existedUser.isBanned) {
        throw new ApiError(403, "Your account has been banned due to repeated policy violations");
    }

    const token = jwt.sign(
        {
            _id: existedUser._id,
            role: existedUser.role
        },
        process.env.JWT_SECRET || "default_jwt_secret",
        {
            expiresIn: process.env.JWT_SECRET_EXPIRY || "1d"
        }
    );

    const safeUser = await User.findById(existedUser._id).select("-password");

    return res.status(200).json(
        new ApiResponse(200, { user: safeUser, token }, "User logged in successfully")
    );
});

const googleAuth = asyncHandler(async (req, res) => {
    const { idToken, email: bodyEmail, name: bodyName } = req.body;
    let email = bodyEmail;
    let name = bodyName;

    // Optional Google ID Token verification if GOOGLE_CLIENT_ID is provided
    if (idToken && process.env.GOOGLE_CLIENT_ID) {
        try {
            const ticket = await googleClient.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            email = payload.email;
            name = payload.name;
        } catch (err) {
            throw new ApiError(400, "Google authentication verification failed");
        }
    }

    if (!email) {
        throw new ApiError(400, "Google authentication email required");
    }

    // Domain check
    const requiredDomain = process.env.COLLEGE_EMAIL_DOMAIN || "@yourcollege.edu.in";
    if (requiredDomain && !email.toLowerCase().endsWith(requiredDomain.toLowerCase())) {
        throw new ApiError(400, `Google login restricted. Email must end with ${requiredDomain}`);
    }

    let user = await User.findOne({ email });

    if (!user) {
        // Create user with verified status for Google SSO
        const randomPassword = Math.random().toString(36).slice(-10) + Date.now();
        user = await User.create({
            name: name || email.split("@")[0],
            email,
            password: randomPassword,
            role: "student",
            isVerified: true
        });
    } else {
        if (user.isBanned) {
            throw new ApiError(403, "Your account has been banned due to repeated policy violations");
        }
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }
    }

    const token = jwt.sign(
        {
            _id: user._id,
            role: user.role
        },
        process.env.JWT_SECRET || "default_jwt_secret",
        {
            expiresIn: process.env.JWT_SECRET_EXPIRY || "1d"
        }
    );

    const safeUser = await User.findById(user._id).select("-password");

    return res.status(200).json(
        new ApiResponse(200, { user: safeUser, token }, "Authenticated successfully via Google SSO!")
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(
        new ApiResponse(200, req.user, "User profile fetched successfully")
    );
});

export {
    registerUser,
    verifyOTP,
    loginUser,
    googleAuth,
    getCurrentUser
};