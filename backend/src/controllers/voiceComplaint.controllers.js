import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { VoiceComplaint } from "../models/voiceComplaint.models.js";
import { User } from "../models/user.models.js";
import { uploadAudioToCloudinary } from "../utils/cloudinary.js";
import { analyzeVoiceComplaint } from "../utils/aiService.js";
import { sendNotificationEmail } from "../utils/mailer.js";
import { sendEmergencySms } from "../utils/sms.js";

const createVoiceComplaint = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new ApiError(400, "Audio recording is required");
    }

    const durationSeconds = Number(req.body.durationSeconds || 0);
    if (durationSeconds > 60) {
        throw new ApiError(400, "Voice complaints are limited to 60 seconds");
    }

    const block = String(req.body.block || "").trim().slice(0, 120);
    const room = String(req.body.room || "").trim().slice(0, 40);
    const audioUrl = await uploadAudioToCloudinary(req.file.buffer, req.file.mimetype);

    let analysis;
    try {
        analysis = await analyzeVoiceComplaint(req.file.buffer, req.file.mimetype);
    } catch (error) {
        console.warn("[VOICE AI] Analysis failed:", error.message);
        analysis = null;
    }

    const safeAnalysis = analysis || {
        transcript: "",
        category: "Miscellaneous",
        urgencyLevel: "normal",
        isEmergency: false,
        emergencyType: null,
        confidence: 0,
        summary: "Audio requires manual review.",
        needsManualReview: true
    };

    const voiceComplaint = await VoiceComplaint.create({
        audioUrl,
        transcript: safeAnalysis.transcript,
        category: safeAnalysis.category,
        urgencyLevel: safeAnalysis.urgencyLevel,
        isEmergency: safeAnalysis.isEmergency,
        emergencyType: safeAnalysis.emergencyType,
        confidence: safeAnalysis.confidence,
        summary: safeAnalysis.summary,
        location: { block, room },
        needsManualReview: safeAnalysis.needsManualReview
    });

    if (voiceComplaint.isEmergency && voiceComplaint.confidence > 0.7) {
        const admins = await User.find({ role: "admin", isBanned: false }).select("email");
        const location = [block, room && `Room ${room}`].filter(Boolean).join(", ");
        await Promise.allSettled(
            admins.map((admin) =>
                sendNotificationEmail({
                    to: admin.email,
                    subject: `EMERGENCY voice complaint: ${voiceComplaint.category}`,
                    title: "Emergency voice complaint requires immediate review",
                    message: `${voiceComplaint.summary || "An emergency was reported."} ${block ? `Location: ${block}${room ? `, room ${room}` : ""}.` : ""} Listen in the admin Voice Complaints queue.`
                })
            )
        );
        await sendEmergencySms({
            summary: voiceComplaint.summary,
            category: voiceComplaint.category,
            location,
            audioUrl: voiceComplaint.audioUrl
        }).catch((error) => console.warn("[SMS] Emergency notification failed:", error.message));
    }

    return res.status(201).json(
        new ApiResponse(
            201,
            { isEmergency: voiceComplaint.isEmergency },
            "Your complaint has been recorded and forwarded to the admin"
        )
    );
});

const getVoiceComplaints = asyncHandler(async (req, res) => {
    const urgencyOrder = { emergency: 0, urgent: 1, normal: 2 };
    const complaints = await VoiceComplaint.find().sort({ createdAt: -1 });
    complaints.sort((left, right) => {
        const emergencyRank = Number(Boolean(right.isEmergency)) - Number(Boolean(left.isEmergency));
        const leftUrgency = urgencyOrder[left.urgencyLevel] ?? 2;
        const rightUrgency = urgencyOrder[right.urgencyLevel] ?? 2;
        const urgencyRank = leftUrgency - rightUrgency;
        const timeRank = (new Date(right.createdAt).getTime() || 0) - (new Date(left.createdAt).getTime() || 0);
        return emergencyRank || urgencyRank || timeRank;
    });

    return res.status(200).json(new ApiResponse(200, complaints, "Voice complaints fetched successfully"));
});

export { createVoiceComplaint, getVoiceComplaints };
