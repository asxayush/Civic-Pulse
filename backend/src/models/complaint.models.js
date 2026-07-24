import mongoose, {Schema} from "mongoose"

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
        imageProof: {
            type: String,
            required: true
        },
        isAnonymous: {
            type: Boolean,
            default: false
        },
        filedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved"],
            default: "pending"
        },
        priority: {
            type: String,
            enum: ["normal", "high"],
            default: "normal"
        },
        upvotes:[
             {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
        ],
        escalated: {
            type: Boolean,
            default: false
        },
        isInvalid: {
            type: Boolean,
            default: false
        },
        filedAt: {
            type: Date
        },
        lastUpdatedAt: {
            type: Date,
        },
        resolvedAt: {
            type: Date
        },
    },
    {timestamps: true}
)

export const Complaint = mongoose.model("Complaint", complaintSchema)