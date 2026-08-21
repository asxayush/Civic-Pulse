import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { Complaint } from "../models/complaint.models.js";
import { User } from "../models/user.models.js";
import { generateTicketId } from "../utils/ticketGenerator.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { sendOTPEmail, sendNotificationEmail } from "../utils/mailer.js";
import { analyzeComplaintImage, compareResolutionProof } from "../utils/aiService.js";

// ─── Valid state transitions (state machine) ───
// VERIFIED_CLOSED / REOPENED from RESOLVED_BY_STAFF are student-only (OTP / reject endpoints)
const VALID_TRANSITIONS = {
    "PENDING": ["IN_PROGRESS"],
    "IN_PROGRESS": ["RESOLVED_BY_STAFF"],
    "RESOLVED_BY_STAFF": [], // closed via verify-resolution or reject-resolution only
    "REOPENED": ["IN_PROGRESS"],
    "VERIFIED_CLOSED": []  // terminal state
};

/** Load image bytes from Cloudinary URL or data-URI for AI compare */
const loadImageBuffer = async (imageRef) => {
    if (!imageRef || typeof imageRef !== "string") return null;
    try {
        if (imageRef.startsWith("data:")) {
            const base64 = imageRef.split(",")[1];
            if (!base64) return null;
            return Buffer.from(base64, "base64");
        }
        const response = await fetch(imageRef);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    } catch {
        return null;
    }
};

// ─── Helper: push audit trail entry ───
const pushStatusHistory = (complaint, from, to, userId, note = "") => {
    complaint.statusHistory.push({
        from,
        to,
        changedBy: userId,
        changedAt: new Date(),
        note
    });
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/complaints — File a new complaint with AI Analysis
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const createComplaint = asyncHandler(async (req, res) => {
    const { title, description, category, hostelBlock, isAnonymous } = req.body;

    if (!req.file) {
        throw new ApiError(400, "Image proof is required to submit a complaint");
    }

    // 1. Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer);

    // 2. Generate unique Ticket ID
    const ticketId = await generateTicketId();

    // 3. AI Multimodal Analysis (Gemini 1.5 Flash)
    const aiResults = await analyzeComplaintImage(
        req.file.buffer,
        req.file.mimetype,
        title,
        description,
        hostelBlock,
        category
    );

    // 4. Auto-route: prefer AI department whenever vision/heuristic produced a category
    const useAiCategory = Boolean(aiResults.predictedCategory) && (aiResults.confidenceScore || 0) >= 0.5;
    const finalCategory = useAiCategory && !(aiResults.predictedCategory === "miscellaneous" && category && category !== "miscellaneous")
        ? aiResults.predictedCategory
        : (category || aiResults.predictedCategory || "miscellaneous");
    const finalTitle = (title && String(title).trim()) || aiResults.suggestedTitle || "Campus issue";
    const finalDescription =
        (description && String(description).trim()) ||
        aiResults.suggestedDescription ||
        aiResults.aiSummary ||
        "Issue reported with photo proof.";

    const assignedStaff = await User.findOne({
        role: "staff",
        department: finalCategory,
        isBanned: false
    });

    const now = new Date();

    // 5. Duplicate Detection — check for active tickets in same block + category
    const existingParent = await Complaint.findOne({
        hostelBlock: hostelBlock,
        category: finalCategory,
        status: { $in: ["PENDING", "IN_PROGRESS", "REOPENED"] },
        isParent: true
    }).sort({ createdAt: -1 });

    let isChild = false;
    let parentTicketRef = null;

    if (existingParent) {
        isChild = true;
        parentTicketRef = existingParent._id;
    }

    // Determine priority (escalate to high if AI suggested high or user selected)
    const finalPriority = aiResults.suggestedPriority === "high" ? "high" : "normal";

    // 6. Create Complaint document with AI analysis
    const complaint = await Complaint.create({
        ticketId,
        title: finalTitle,
        description: finalDescription,
        category: finalCategory,
        hostelBlock,
        imageProof: imageUrl,
        isAnonymous: isAnonymous === "true" || isAnonymous === true,
        filedBy: req.user._id,
        assignedTo: assignedStaff?._id || null,
        status: "PENDING",
        priority: finalPriority,
        aiAnalysis: {
            predictedCategory: aiResults.predictedCategory,
            confidenceScore: aiResults.confidenceScore,
            suggestedPriority: aiResults.suggestedPriority,
            aiSummary: aiResults.aiSummary,
            detectedObjects: aiResults.detectedObjects,
            triageNotes: aiResults.triageNotes
        },
        filedAt: now,
        lastUpdatedAt: now,
        // Parent-child linking
        isParent: !isChild,
        parentTicket: parentTicketRef,
        statusHistory: [{
            from: null,
            to: "PENDING",
            changedBy: req.user._id,
            changedAt: now,
            note: isChild
                ? `Linked as child to existing ticket ${existingParent.ticketId}. AI: ${aiResults.aiSummary}`
                : `Filed & auto-routed to ${finalCategory} (${Math.round((aiResults.confidenceScore || 0) * 100)}% AI). ${aiResults.triageNotes || ""}`
        }]
    });

    // 7. If child, update parent's childTickets array and linkedCount
    if (isChild && existingParent) {
        existingParent.childTickets.push(complaint._id);
        existingParent.linkedCount = existingParent.childTickets.length;
        await existingParent.save();
    }

    const populatedComplaint = await Complaint.findById(complaint._id)
        .populate("filedBy", "name email")
        .populate("assignedTo", "name email department")
        .populate("parentTicket", "ticketId title");

    const recipientQuery = assignedStaff
        ? { $or: [{ role: "admin" }, { _id: assignedStaff._id }], isBanned: false }
        : { role: "admin", isBanned: false };
    const recipients = await User.find(recipientQuery).select("email");
    await Promise.allSettled(
        recipients.map((recipient) =>
            sendNotificationEmail({
                to: recipient.email,
                subject: `New Civic Pulse ticket ${ticketId}`,
                title: "New complaint requires attention",
                message: `${finalTitle} was filed for ${hostelBlock} and routed to ${finalCategory}. Ticket: ${ticketId}`
            })
        )
    );

    const responseMessage = isChild
        ? `Similar issue active (${existingParent.ticketId}). Linked automatically! AI Verified: ${aiResults.aiSummary}`
        : `Complaint filed successfully. Ticket ${ticketId} auto-routed to ${finalCategory} department. AI Analysis: ${aiResults.aiSummary}`;

    return res.status(201).json(
        new ApiResponse(201, populatedComplaint, responseMessage)
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATCH /api/complaints/:id/status — State machine status transitions + AI Resolution Matching
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const updateComplaintStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status: newStatus } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        throw new ApiError(404, "Complaint not found");
    }

    // Staff may only update tickets assigned to them (admin can override)
    if (req.user.role === "staff") {
        if (!complaint.assignedTo || complaint.assignedTo.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You can only update complaints assigned to you");
        }
    }

    if (newStatus === "VERIFIED_CLOSED" || (complaint.status === "RESOLVED_BY_STAFF" && newStatus === "REOPENED")) {
        throw new ApiError(400, "Use student verify-resolution or reject-resolution endpoints for this transition");
    }

    const currentStatus = complaint.status;

    // Validate state transition
    const allowed = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
        throw new ApiError(400, `Invalid transition: ${currentStatus} → ${newStatus}. Allowed: [${allowed.join(", ")}]`);
    }

    const now = new Date();
    const previousStatus = complaint.status;
    complaint.status = newStatus;
    complaint.lastUpdatedAt = now;

    // ─── Handle RESOLVED_BY_STAFF: generate resolution verification OTP & AI photo comparison ───
    if (newStatus === "RESOLVED_BY_STAFF") {
        if (req.file) {
            complaint.afterImage = await uploadToCloudinary(req.file.buffer);

            const beforeBuffer = await loadImageBuffer(complaint.imageProof);
            const aiCompare = await compareResolutionProof(
                beforeBuffer,
                beforeBuffer ? "image/jpeg" : null,
                req.file.buffer,
                req.file.mimetype
            );
            if (aiCompare) {
                if (!complaint.aiAnalysis) complaint.aiAnalysis = {};
                complaint.aiAnalysis.resolutionMatchScore = aiCompare.matchConfidence || 90;
                complaint.aiAnalysis.aiResolutionNotes = aiCompare.aiResolutionNotes || "Resolution proof verified.";
            }
        }

        complaint.resolvedAt = now;

        // Generate 4-digit resolution verification OTP
        const resOTP = Math.floor(1000 + Math.random() * 9000).toString();
        complaint.verificationOTP = resOTP;
        complaint.otpExpiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours

        // Send OTP to the student who filed the complaint
        const student = await User.findById(complaint.filedBy);
        if (student) {
            await sendOTPEmail(student.email, resOTP);
        }

        pushStatusHistory(complaint, previousStatus, newStatus, req.user._id, "Staff marked resolved. Verification OTP sent to student.");
    } else {
        pushStatusHistory(complaint, previousStatus, newStatus, req.user._id);
    }

    await complaint.save();

    // If parent ticket is resolved, cascade status to child tickets
    if (newStatus === "RESOLVED_BY_STAFF" && complaint.isParent && complaint.childTickets.length > 0) {
        await Complaint.updateMany(
            { _id: { $in: complaint.childTickets } },
            {
                $set: {
                    status: "RESOLVED_BY_STAFF",
                    resolvedAt: now,
                    lastUpdatedAt: now
                },
                $push: {
                    statusHistory: {
                        from: "PENDING",
                        to: "RESOLVED_BY_STAFF",
                        changedBy: req.user._id,
                        changedAt: now,
                        note: `Cascaded from parent ticket ${complaint.ticketId}`
                    }
                }
            }
        );
    }

    const updatedComplaint = await Complaint.findById(complaint._id)
        .populate("filedBy", "name email")
        .populate("assignedTo", "name email department");

    return res.status(200).json(
        new ApiResponse(200, updatedComplaint, `Status transitioned: ${previousStatus} → ${newStatus}`)
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/complaints/:id/verify-resolution — Student confirms fix via OTP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const verifyResolutionOTP = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { otp } = req.body;

    const complaint = await Complaint.findById(id).select("+verificationOTP");
    if (!complaint) {
        throw new ApiError(404, "Complaint not found");
    }

    if (complaint.filedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the student who filed this complaint can verify the resolution");
    }

    if (complaint.status !== "RESOLVED_BY_STAFF") {
        throw new ApiError(400, "This ticket is not awaiting resolution verification");
    }

    // Check OTP expiry
    if (complaint.otpExpiresAt && new Date() > complaint.otpExpiresAt) {
        throw new ApiError(400, "Resolution verification OTP has expired. Contact admin.");
    }

    if (complaint.verificationOTP !== otp) {
        throw new ApiError(400, "Invalid resolution verification OTP");
    }

    const now = new Date();
    complaint.status = "VERIFIED_CLOSED";
    complaint.closedAt = now;
    complaint.lastUpdatedAt = now;
    complaint.verificationOTP = undefined;
    complaint.otpExpiresAt = undefined;

    pushStatusHistory(complaint, "RESOLVED_BY_STAFF", "VERIFIED_CLOSED", req.user._id, "Student confirmed resolution via OTP");

    await complaint.save();

    // Cascade close child tickets
    if (complaint.isParent && complaint.childTickets.length > 0) {
        await Complaint.updateMany(
            { _id: { $in: complaint.childTickets } },
            {
                $set: { status: "VERIFIED_CLOSED", closedAt: now, lastUpdatedAt: now },
                $push: {
                    statusHistory: {
                        from: "RESOLVED_BY_STAFF",
                        to: "VERIFIED_CLOSED",
                        changedBy: req.user._id,
                        changedAt: now,
                        note: `Cascaded verification from parent ${complaint.ticketId}`
                    }
                }
            }
        );
    }

    const updated = await Complaint.findById(id)
        .populate("filedBy", "name email")
        .populate("assignedTo", "name email department");

    return res.status(200).json(
        new ApiResponse(200, updated, "Resolution verified! Ticket closed successfully.")
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/complaints/:id/reject-resolution — Student rejects, reopens ticket
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const rejectResolution = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        throw new ApiError(404, "Complaint not found");
    }

    if (complaint.filedBy.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only the student who filed this complaint can reject the resolution");
    }

    if (complaint.status !== "RESOLVED_BY_STAFF") {
        throw new ApiError(400, "This ticket is not awaiting resolution verification");
    }

    const now = new Date();
    complaint.status = "REOPENED";
    complaint.reopenCount = (complaint.reopenCount || 0) + 1;
    complaint.lastUpdatedAt = now;
    complaint.verificationOTP = undefined;
    complaint.otpExpiresAt = undefined;
    complaint.resolvedAt = undefined;

    // If reopened multiple times, auto-escalate
    if (complaint.reopenCount >= 2) {
        complaint.escalated = true;
    }

    pushStatusHistory(complaint, "RESOLVED_BY_STAFF", "REOPENED", req.user._id, reason || "Student rejected resolution — issue not fixed");

    await complaint.save();

    const updated = await Complaint.findById(id)
        .populate("filedBy", "name email")
        .populate("assignedTo", "name email department");

    return res.status(200).json(
        new ApiResponse(200, updated, "Resolution rejected. Ticket reopened for staff action.")
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PATCH /api/complaints/:id/request-invalid — Staff requests invalid review
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const requestInvalid = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
        throw new ApiError(404, "Complaint not found");
    }

    if (complaint.invalidStatus !== "none") {
        throw new ApiError(400, `Invalid request already in status: ${complaint.invalidStatus}`);
    }

    complaint.invalidStatus = "REQUESTED_BY_STAFF";
    complaint.invalidRequestedBy = req.user._id;
    complaint.lastUpdatedAt = new Date();

    pushStatusHistory(complaint, complaint.status, complaint.status, req.user._id, "Staff flagged complaint for admin invalid review");

    await complaint.save();

    return res.status(200).json(
        new ApiResponse(200, complaint, "Complaint flagged for admin review. Awaiting admin confirmation before strike is applied.")
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/complaints/my — Student's own complaints
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getMyComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ filedBy: req.user._id })
        .populate("assignedTo", "name email department")
        .populate("parentTicket", "ticketId title")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, complaints, "Your complaints fetched successfully")
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/complaints/public — Public feed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getPublicFeed = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ isParent: true })
        .populate("filedBy", "name email")
        .populate("assignedTo", "name email department")
        .sort({ createdAt: -1 });

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/complaints/track/:ticketId — Track by ticket ID
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getComplaintByTicketId = asyncHandler(async (req, res) => {
    const { ticketId } = req.params;

    const complaint = await Complaint.findOne({ ticketId })
        .populate("filedBy", "name email")
        .populate("assignedTo", "name email department")
        .populate("parentTicket", "ticketId title")
        .populate("childTickets", "ticketId title status");

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/complaints/assigned — Staff's assigned complaints
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const getAssignedComplaints = asyncHandler(async (req, res) => {
    const complaints = await Complaint.find({ assignedTo: req.user._id })
        .populate("filedBy", "name email role")
        .populate("childTickets", "ticketId title status")
        .sort({ updatedAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, complaints, "Assigned complaints fetched successfully")
    );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/complaints/:id/upvote — Toggle upvote
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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
        complaint.upvotes.splice(upvoteIndex, 1);
    } else {
        complaint.upvotes.push(userId);
    }

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/complaints/analyze — Preview AI triage from photo (before filing)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const analyzeComplaintPreview = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Image is required for AI analysis");
    }

    const { title = "", description = "", hostelBlock = "", category = "" } = req.body;
    const aiResults = await analyzeComplaintImage(
        req.file.buffer,
        req.file.mimetype,
        title,
        description,
        hostelBlock,
        category
    );

    return res.status(200).json(
        new ApiResponse(200, aiResults, "AI photo triage complete")
    );
});

export {
    createComplaint,
    analyzeComplaintPreview,
    getMyComplaints,
    getPublicFeed,
    getComplaintByTicketId,
    getAssignedComplaints,
    updateComplaintStatus,
    verifyResolutionOTP,
    rejectResolution,
    requestInvalid,
    upvoteComplaint
};
