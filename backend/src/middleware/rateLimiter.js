import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/api-error.js";

export const complaintRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each user to 3 complaints per hour window
    keyGenerator: (req) => {
        return req.user?._id?.toString() || req.ip || "unknown";
    },
    validate: { xForwardedForHeader: false },
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many complaints filed from this account. Please wait 1 hour before submitting another complaint."));
    },
    standardHeaders: true,
    legacyHeaders: false
});
