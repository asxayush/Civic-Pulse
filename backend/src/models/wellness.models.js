import mongoose from "mongoose";

const wellnessEntrySchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 4000
        },
        mood: {
            type: String,
            enum: ["calm", "anxious", "overwhelmed", "sad", "frustrated", "hopeful"],
            default: "calm"
        },
        aiResponse: {
            type: String,
            required: true
        },
        suggestedExercises: {
            type: [String],
            default: []
        },
        crisisFlag: {
            type: Boolean,
            default: false
        },
        isPrivate: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

export const WellnessEntry = mongoose.model("WellnessEntry", wellnessEntrySchema);
