import mongoose, { Schema } from "mongoose";

const complaintSchema = new Schema(
    {
        ticketId: {
            type: String,
            unique: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        category: {
            type: String,
            enum: ["electricity", "water", "food", "miscellaneous"],
            required: true
        },
        hostelBlock: {
            type: String,
            required: true
        },
        // ─── Images ───
        imageProof: {
            type: String,
            required: true
        },
        afterImage: {
            type: String,
            default: null
        },
        isAnonymous: {
            type: Boolean,
            default: false
        },
        // ─── Assignment ───
        filedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        // ─── 5-State Lifecycle ───
        status: {
            type: String,
            enum: ["PENDING", "IN_PROGRESS", "RESOLVED_BY_STAFF", "VERIFIED_CLOSED", "REOPENED"],
            default: "PENDING"
        },
        priority: {
            type: String,
            enum: ["normal", "high"],
            default: "normal"
        },
        // ─── AI Multimodal Vision & Smart Metadata ───
        aiAnalysis: {
            predictedCategory: { type: String },
            confidenceScore: { type: Number, default: 0 },
            suggestedPriority: { type: String, enum: ["normal", "high"], default: "normal" },
            aiSummary: { type: String },
            detectedObjects: [{ type: String }],
            triageNotes: { type: String },
            resolutionMatchScore: { type: Number, default: null },
            aiResolutionNotes: { type: String, default: null }
        },
        // ─── Resolution Verification OTP ───
        verificationOTP: {
            type: String,
            select: false
        },
        otpExpiresAt: {
            type: Date
        },
        reopenCount: {
            type: Number,
            default: 0
        },
        // ─── Community ───
        upvotes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        escalated: {
            type: Boolean,
            default: false
        },
        // ─── Two-Tier Invalid/Strike System ───
        invalidStatus: {
            type: String,
            enum: ["none", "REQUESTED_BY_STAFF", "CONFIRMED_BY_ADMIN", "REJECTED_BY_ADMIN"],
            default: "none"
        },
        invalidRequestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null
        },
        isInvalid: {
            type: Boolean,
            default: false
        },
        // ─── Parent-Child Ticket Aggregation ───
        isParent: {
            type: Boolean,
            default: true
        },
        parentTicket: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Complaint",
            default: null
        },
        childTickets: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Complaint"
            }
        ],
        linkedCount: {
            type: Number,
            default: 0
        },
        // ─── Timestamps ───
        filedAt: {
            type: Date
        },
        lastUpdatedAt: {
            type: Date
        },
        resolvedAt: {
            type: Date
        },
        closedAt: {
            type: Date
        },
        // ─── Audit Trail ───
        statusHistory: [
            {
                from: String,
                to: String,
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                changedAt: {
                    type: Date,
                    default: Date.now
                },
                note: String
            }
        ]
    },
    { timestamps: true }
);

export const Complaint = mongoose.model("Complaint", complaintSchema);