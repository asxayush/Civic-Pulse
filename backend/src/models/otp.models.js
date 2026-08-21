import mongoose, { Schema } from "mongoose";

const otpSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            index: true
        },
        otp: {
            type: String,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300 // TTL index: auto-deletes after 5 minutes (300 seconds)
        }
    }
);

export const OTP = mongoose.model("OTP", otpSchema);
