import { asyncHandler } from "../utils/asyncHandlers.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { WellnessEntry } from "../models/wellness.models.js";
import { reflectOnStudentThoughts } from "../utils/aiService.js";

const HELPLINES = {
    title: "You are not alone",
    campus: "Campus Counseling Desk — visit Student Welfare / ask your warden",
    india: "Tele-MANAS (India): 14416 · iCall: 9152987821",
    note: "This AI companion is supportive only — not therapy, diagnosis, or emergency care."
};

const createReflection = asyncHandler(async (req, res) => {
    const { content } = req.body;
    if (!content || !String(content).trim()) {
        throw new ApiError(400, "Please share a few thoughts to continue");
    }
    if (String(content).trim().length < 2) {
        throw new ApiError(400, "Write a bit more so the companion can respond meaningfully");
    }

    const prior = await WellnessEntry.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("content aiResponse")
        .lean();

    const historyAsc = [...prior].reverse();
    const ai = await reflectOnStudentThoughts(content, historyAsc);

    const entry = await WellnessEntry.create({
        user: req.user._id,
        content: String(content).trim(),
        mood: ai.mood,
        aiResponse: ai.aiResponse,
        suggestedExercises: ai.suggestedExercises,
        crisisFlag: ai.crisisFlag,
        isPrivate: true
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            {
                entry,
                helplines: HELPLINES,
                showCrisisBanner: Boolean(ai.crisisFlag)
            },
            ai.crisisFlag
                ? "Please reach out to a helpline — human support is available now"
                : "Message saved to your chat history."
        )
    );
});

const getMyReflections = asyncHandler(async (req, res) => {
    const entriesDesc = await WellnessEntry.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(200)
        .lean();

    // Chronological chat order (oldest → newest)
    const entries = [...entriesDesc].reverse();

    const messages = entries.flatMap((e) => [
        {
            id: `${e._id}-user`,
            role: "user",
            text: e.content,
            createdAt: e.createdAt,
            mood: e.mood,
            crisisFlag: e.crisisFlag
        },
        {
            id: `${e._id}-ai`,
            role: "assistant",
            text: e.aiResponse,
            createdAt: e.createdAt,
            mood: e.mood,
            exercises: e.suggestedExercises || [],
            crisisFlag: e.crisisFlag,
            entryId: e._id
        }
    ]);

    return res.status(200).json(
        new ApiResponse(
            200,
            { entries, messages, helplines: HELPLINES, totalTurns: entries.length },
            "Wellness chat history loaded"
        )
    );
});

export { createReflection, getMyReflections, HELPLINES };
