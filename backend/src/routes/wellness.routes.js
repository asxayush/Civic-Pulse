import { Router } from "express";
import { createReflection, getMyReflections } from "../controllers/wellness.controllers.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import { body } from "express-validator";
import { validate } from "../middleware/validator.middleware.js";

const router = Router();

router.use(verifyJWT, authorizeRoles("student"));

router
    .route("/reflect")
    .post(
        body("content").trim().notEmpty().withMessage("Thoughts are required").isLength({ min: 2, max: 4000 }),
        validate,
        createReflection
    );

router.route("/my").get(getMyReflections);

export default router;
