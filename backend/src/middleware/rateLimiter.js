import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/api-error.js";

// Only used on authenticated student complaint routes — key by user id, never raw IP
export const complaintRateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    keyGenerator: (req) => req.user?._id?.toString() || "unauthenticated",
    validate: {
        xForwardedForHeader: false,
        keyGeneratorIpFallback: false
    },
    handler: (req, res, next) => {
        next(
            new ApiError(
                429,
                "Too many complaints filed from this account. Please wait 1 hour before submitting another complaint."
            )
        );
    },
    standardHeaders: true,
    legacyHeaders: false
});

export const voiceComplaintRateLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
        next(new ApiError(429, "Too many emergency complaints from this network. Please wait 10 minutes."));
    }
});
