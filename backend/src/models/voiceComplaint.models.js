import mongoose, { Schema } from "mongoose";

const voiceComplaintSchema = new Schema(
    {
        audioUrl: { type: String, required: true },
        transcript: { type: String, default: "" },
        category: {
            type: String,
            enum: ["Electricity", "Water", "Sanitation", "Road", "Safety", "Miscellaneous"],
            default: "Miscellaneous"
        },
        urgencyLevel: {
            type: String,
            enum: ["normal", "urgent", "emergency"],
            default: "normal"
        },
        isEmergency: { type: Boolean, default: false },
        emergencyType: {
            type: String,
            enum: ["fire", "short_circuit", "injury", "flooding", "other", null],
            default: null
        },
        confidence: { type: Number, default: 0 },
        summary: { type: String, default: "" },
        location: {
            block: { type: String, default: "" },
            room: { type: String, default: "" }
        },
        needsManualReview: { type: Boolean, default: false },
        status: {
            type: String,
            enum: ["pending", "reviewed", "actioned"],
            default: "pending"
        }
    },
    { timestamps: true, collection: "voicecomplaints" }
);

export const VoiceComplaint = mongoose.model("VoiceComplaint", voiceComplaintSchema);
