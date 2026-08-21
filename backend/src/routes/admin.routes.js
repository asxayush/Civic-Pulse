import { Router } from "express";
import {
    createStaff,
    getAllUsers,
    toggleBanUser,
    getEscalatedComplaints,
    getAllComplaints
} from "../controllers/admin.controllers.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import { createStaffValidator } from "../validators/index.js";
import { validate } from "../middleware/validator.middleware.js";

const router = Router();

// Protect all admin routes
router.use(verifyJWT);
router.use(authorizeRoles("admin"));

router.route("/create-staff").post(createStaffValidator(), validate, createStaff);
router.route("/users").get(getAllUsers);
router.route("/users/:id/ban").patch(toggleBanUser);
router.route("/complaints/escalated").get(getEscalatedComplaints);
router.route("/complaints/all").get(getAllComplaints);

export default router;
