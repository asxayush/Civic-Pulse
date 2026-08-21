import { Router } from "express";
import { createVoiceComplaint } from "../controllers/voiceComplaint.controllers.js";
import { voiceComplaintRateLimiter } from "../middleware/rateLimiter.js";
import { uploadAudio } from "../utils/cloudinary.js";

const router = Router();

router.post(
    "/",
    voiceComplaintRateLimiter,
    uploadAudio.single("audio"),
    createVoiceComplaint
);

export default router;
