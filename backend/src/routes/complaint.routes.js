import { Router } from "express";
import {
    createComplaint,
    getMyComplaints,
    getPublicFeed,
    getComplaintByTicketId,
    getAssignedComplaints,
    updateComplaintStatus,
    markComplaintInvalid,
    upvoteComplaint
} from "../controllers/complaint.controllers.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import { complaintRateLimiter } from "../middleware/rateLimiter.js";
import { upload } from "../utils/cloudinary.js";
import { complaintValidator, complaintStatusValidator } from "../validators/index.js";
import { validate } from "../middleware/validator.middleware.js";

const router = Router();

// Public routes
router.route("/public").get(getPublicFeed);
router.route("/track/:ticketId").get(getComplaintByTicketId);

// Student routes
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

// Staff routes
router.route("/assigned").get(verifyJWT, authorizeRoles("staff"), getAssignedComplaints);
router.route("/:id/mark-invalid").patch(verifyJWT, authorizeRoles("staff"), markComplaintInvalid);

// Staff & Admin status update route
router.route("/:id/status")
    .patch(
        verifyJWT,
        authorizeRoles("staff", "admin"),
        complaintStatusValidator(),
        validate,
        updateComplaintStatus
    );

export default router;
