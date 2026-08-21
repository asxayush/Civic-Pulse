import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { User } from "../models/user.models.js";
import { Complaint } from "../models/complaint.models.js";

// ─── POST /api/admin/create-staff ───
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

// ─── GET /api/admin/users ───
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, users, "Users fetched successfully")
    );
});

// ─── PATCH /api/admin/users/:id/ban ───
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

// ─── GET /api/admin/complaints/escalated ───
const getEscalatedComplaints = asyncHandler(async (req, res) => {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Auto-escalate unresolved tickets idle > 24 hours
    await Complaint.updateMany(
        {
            status: { $in: ["PENDING", "IN_PROGRESS", "REOPENED"] },
            lastUpdatedAt: { $lt: twentyFourHoursAgo },
            escalated: false
        },
        { $set: { escalated: true } }
    );

    const escalatedComplaints = await Complaint.find({ escalated: true })
        .populate("filedBy", "name email role")
        .populate("assignedTo", "name email department")
        .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, escalatedComplaints, "Escalated complaints fetched successfully")
    );
});

// ─── GET /api/admin/complaints/all ───
const getAllComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find()
        .populate("filedBy", "name email role")
        .populate("assignedTo", "name email department")
        .populate("parentTicket", "ticketId")
        .populate("childTickets", "ticketId status")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, complaints, "All complaints fetched successfully")
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TWO-TIER INVALID/STRIKE SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ─── GET /api/admin/complaints/invalid-review ───
const getInvalidReviewQueue = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ invalidStatus: "REQUESTED_BY_STAFF" })
        .populate("filedBy", "name email invalidComplaintCount")
        .populate("assignedTo", "name email department")
        .populate("invalidRequestedBy", "name email")
        .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, complaints, "Invalid review queue fetched successfully")
    );
});

// ─── PATCH /api/admin/complaints/:id/confirm-invalid ───
const confirmInvalidComplaint = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        throw new ApiError(404, "Complaint not found");
    }

    if (complaint.invalidStatus !== "REQUESTED_BY_STAFF") {
        throw new ApiError(400, "This complaint is not pending invalid review");
    }

    complaint.invalidStatus = "CONFIRMED_BY_ADMIN";
    complaint.isInvalid = true;
    complaint.lastUpdatedAt = new Date();

    complaint.statusHistory.push({
        from: complaint.status,
        to: complaint.status,
        changedBy: req.user._id,
        changedAt: new Date(),
        note: "Admin confirmed: complaint marked invalid. Strike applied to student."
    });

    await complaint.save();

    // Apply strike to student
    const student = await User.findById(complaint.filedBy);
    if (student) {
        student.invalidComplaintCount = (student.invalidComplaintCount || 0) + 1;
        if (student.invalidComplaintCount >= 3) {
            student.isBanned = true;
        }
        await student.save();
    }

    return res.status(200).json(
        new ApiResponse(200, {
            complaint,
            studentStrikeCount: student?.invalidComplaintCount || 0,
            studentBanned: student?.isBanned || false
        }, "Invalid complaint confirmed. Strike applied to student.")
    );
});

// ─── PATCH /api/admin/complaints/:id/reject-invalid ───
const rejectInvalidRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        throw new ApiError(404, "Complaint not found");
    }

    if (complaint.invalidStatus !== "REQUESTED_BY_STAFF") {
        throw new ApiError(400, "This complaint is not pending invalid review");
    }

    complaint.invalidStatus = "REJECTED_BY_ADMIN";
    complaint.lastUpdatedAt = new Date();

    complaint.statusHistory.push({
        from: complaint.status,
        to: complaint.status,
        changedBy: req.user._id,
        changedAt: new Date(),
        note: "Admin rejected invalid flag. Complaint is legitimate."
    });

    await complaint.save();

    return res.status(200).json(
        new ApiResponse(200, complaint, "Invalid request rejected. Complaint reinstated as legitimate.")
    );
});

export {
    createStaff,
    getAllUsers,
    toggleBanUser,
    getEscalatedComplaints,
    getAllComplaints,
    getInvalidReviewQueue,
    confirmInvalidComplaint,
    rejectInvalidRequest
};
