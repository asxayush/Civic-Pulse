import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Complaint } from "../models/complaint.models.js";
import { User } from "../models/user.models.js";
import { generateTicketId } from "../utils/ticketGenerator.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

const createComplaint = asyncHandler(async (req, res) => {
    const { title, description, category, isAnonymous } = req.body;

    if (!req.file) {
        throw new ApiError(400, "Image proof is required to submit a complaint");
    }

    // 1. Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer);

    // 2. Generate unique Ticket ID (e.g. CP-2026-00001)
    const ticketId = await generateTicketId();

    // 3. Auto-route to active staff matching department/category
    const assignedStaff = await User.findOne({
        role: "staff",
        department: category,
        isBanned: false
    });

    const now = new Date();

    // 4. Create Complaint document
    const complaint = await Complaint.create({
        ticketId,
        title,
        description,
        category,
        imageProof: imageUrl,
        isAnonymous: isAnonymous === "true" || isAnonymous === true,
        filedBy: req.user._id,
        assignedTo: assignedStaff?._id || null,
        status: "pending",
        priority: "normal",
        filedAt: now,
        lastUpdatedAt: now
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
        .populate("filedBy", "name email")
        .populate("assignedTo", "name email department");

    return res.status(201).json(
        new ApiResponse(201, populatedComplaint, "Complaint filed successfully")
    );
});

const getMyComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ filedBy: req.user._id })
        .populate("assignedTo", "name email department")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, complaints, "Your complaints fetched successfully")
    );
});

const getPublicFeed = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find()
        .populate("filedBy", "name email")
        .populate("assignedTo", "name email department")
        .sort({ createdAt: -1 });

    // Feed level masking: replace real identity with "Anonymous Student" if isAnonymous is true
    const maskedComplaints = complaints.map((complaint) => {
        const obj = complaint.toObject();
        if (obj.isAnonymous) {
            obj.filedBy = { name: "Anonymous Student", _id: null };
        }
        return obj;
    });

    return res.status(200).json(
        new ApiResponse(200, maskedComplaints, "Public feed fetched successfully")
    );
});

const getComplaintByTicketId = asyncHandler(async (req, res) => {
    const { ticketId } = req.params;

    const complaint = await Complaint.findOne({ ticketId })
        .populate("filedBy", "name email")
        .populate("assignedTo", "name email department");

    if (!complaint) {
        throw new ApiError(404, `Complaint with Ticket ID '${ticketId}' not found`);
    }

    const obj = complaint.toObject();
    if (obj.isAnonymous) {
        obj.filedBy = { name: "Anonymous Student", _id: null };
    }

    return res.status(200).json(
        new ApiResponse(200, obj, "Complaint details fetched successfully")
    );
});

const getAssignedComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ assignedTo: req.user._id })
        .populate("filedBy", "name email role")
        .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, complaints, "Assigned complaints fetched successfully")
    );
});

const updateComplaintStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        throw new ApiError(404, "Complaint not found");
    }

    const now = new Date();
    complaint.status = status;
    complaint.lastUpdatedAt = now;

    if (status === "resolved") {
        complaint.resolvedAt = now;
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
        .populate("filedBy", "name email")
        .populate("assignedTo", "name email department");

    return res.status(200).json(
        new ApiResponse(200, updatedComplaint, `Complaint status updated to '${status}'`)
    );
});

const markComplaintInvalid = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        throw new ApiError(404, "Complaint not found");
    }

    complaint.isInvalid = true;
    complaint.lastUpdatedAt = new Date();
    await complaint.save();

    // Increment user's invalidComplaintCount and auto-ban if threshold crossed
    const user = await User.findById(complaint.filedBy);
    if (user) {
        user.invalidComplaintCount = (user.invalidComplaintCount || 0) + 1;
        if (user.invalidComplaintCount >= 3) {
            user.isBanned = true;
        }
        await user.save();
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { complaint, userBanned: user?.isBanned || false },
            "Complaint marked as invalid/spam. Student account strike recorded."
        )
    );
});

const upvoteComplaint = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        throw new ApiError(404, "Complaint not found");
    }

    const upvoteIndex = complaint.upvotes.findIndex(
        (uid) => uid.toString() === userId.toString()
    );

    if (upvoteIndex > -1) {
        // Toggle off upvote
        complaint.upvotes.splice(upvoteIndex, 1);
    } else {
        // Toggle on upvote
        complaint.upvotes.push(userId);
    }

    // Auto-priority check: if upvotes >= 10, set priority = "high"
    if (complaint.upvotes.length >= 10) {
        complaint.priority = "high";
    }

    await complaint.save();

    return res.status(200).json(
        new ApiResponse(
            200,
            { upvoteCount: complaint.upvotes.length, priority: complaint.priority },
            upvoteIndex > -1 ? "Upvote removed" : "Upvote added"
        )
    );
});

export {
    createComplaint,
    getMyComplaints,
    getPublicFeed,
    getComplaintByTicketId,
    getAssignedComplaints,
    updateComplaintStatus,
    markComplaintInvalid,
    upvoteComplaint
};
