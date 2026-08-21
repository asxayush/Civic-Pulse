import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/api-error.js";
import { User } from "../models/user.models.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.cookies?.accessToken;

    if (!token) {
        throw new ApiError(401, "Unauthorized access: Token missing");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decodedToken?._id).select("-password");

        if (!user) {
            throw new ApiError(401, "Invalid access token: User not found");
        }

        if (user.isBanned) {
            throw new ApiError(403, "Your account has been banned due to policy violations");
        }

        req.user = user;
        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token");
    }
});

export const authorizeRoles = (...allowedRoles) => {
    return asyncHandler(async (req, res, next) => {
        if (!req.user) {
            throw new ApiError(401, "Unauthorized request");
        }

        if (!allowedRoles.includes(req.user.role)) {
            throw new ApiError(403, "You do not have permission to perform this action");
        }

        next();
    });
};

// Export alias for backward compatibility
export const authorizedRoles = authorizeRoles;