import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { Complaint } from "../models/complaint.models.js";

const createStaff = asyncHandler(async (req, res) => {
    const { name, email, password, department } = req.body;

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    const staff = await User.create({
        name,
        email,
        password,
        role: "staff",
        department,
        isVerified: true
    });

    const safeStaff = await User.findById(staff._id).select("-password");

    return res.status(201).json(
        new ApiResponse(201, safeStaff, "Department staff created successfully")
    );
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, users, "Users fetched successfully")
    );
});

const toggleBanUser = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.role === "admin") {
        throw new ApiError(403, "Cannot ban an admin user");
    }

    user.isBanned = !user.isBanned;
    await user.save();

    const safeUser = await User.findById(user._id).select("-password");

    return res.status(200).json(
        new ApiResponse(
            200,
            safeUser,
            `User ${safeUser.isBanned ? "banned" : "unbanned"} successfully`
        )
    );
});

const getEscalatedComplaints = asyncHandler(async (req, res) => {
    // 24-hour idle triage check: mark unresolved complaints idle > 24 hours as escalated
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    await Complaint.updateMany(
        {
            status: { $ne: "resolved" },
            lastUpdatedAt: { $lt: twentyFourHoursAgo },
            escalated: false
        },
        {
            $set: { escalated: true }
        }
    );

    const escalatedComplaints = await Complaint.find({ escalated: true })
        .populate("filedBy", "name email role")
        .populate("assignedTo", "name email department")
        .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, escalatedComplaints, "Escalated complaints fetched successfully")
    );
});

const getAllComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find()
        .populate("filedBy", "name email role")
        .populate("assignedTo", "name email department")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, complaints, "All complaints fetched successfully")
    );
});

export {
    createStaff,
    getAllUsers,
    toggleBanUser,
    getEscalatedComplaints,
    getAllComplaints
};
