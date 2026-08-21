import { Router } from "express";
import {
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
} from "../controllers/complaint.controllers.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import { complaintRateLimiter } from "../middleware/rateLimiter.js";
import { upload } from "../utils/cloudinary.js";
import { complaintValidator, complaintStatusValidator, resolutionOtpValidator } from "../validators/index.js";
import { validate } from "../middleware/validator.middleware.js";

const router = Router();

// ─── Public routes ───
router.route("/public").get(getPublicFeed);
router.route("/track/:ticketId").get(getComplaintByTicketId);

// ─── Student routes ───
router.route("/analyze")
    .post(
        verifyJWT,
        authorizeRoles("student"),
        upload.single("image"),
        analyzeComplaintPreview
    );

router.route("/")
    .post(
        verifyJWT,
        authorizeRoles("student"),
        complaintRateLimiter,
        upload.single("image"),
        complaintValidator(),
        validate,
        createComplaint
    );

router.route("/my").get(verifyJWT, authorizeRoles("student"), getMyComplaints);
router.route("/:id/upvote").post(verifyJWT, authorizeRoles("student"), upvoteComplaint);

// ─── Resolution Verification (student) ───
router.route("/:id/verify-resolution")
    .post(
        verifyJWT,
        authorizeRoles("student"),
        resolutionOtpValidator(),
        validate,
        verifyResolutionOTP
    );

router.route("/:id/reject-resolution")
    .post(
        verifyJWT,
        authorizeRoles("student"),
        rejectResolution
    );

// ─── Staff routes ───
router.route("/assigned").get(verifyJWT, authorizeRoles("staff"), getAssignedComplaints);
router.route("/:id/request-invalid").patch(verifyJWT, authorizeRoles("staff"), requestInvalid);

// ─── Staff & Admin status transitions ───
router.route("/:id/status")
    .patch(
        verifyJWT,
        authorizeRoles("staff", "admin"),
        upload.single("afterImage"),
        complaintStatusValidator(),
        validate,
        updateComplaintStatus
    );

export default router;
