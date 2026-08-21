import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import complaintRouter from "./routes/complaint.routes.js";
import wellnessRouter from "./routes/wellness.routes.js";
import voiceComplaintRouter from "./routes/voiceComplaint.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Render/Vercel proxy headers are needed for accurate IP-based rate limiting.
app.set("trust proxy", 1);

// Basic Express server setup
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// CORS Configuration - Permissive for dev environments
const configuredOrigins = (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (
                !origin ||
                configuredOrigins.length === 0 ||
                configuredOrigins.includes(origin) ||
                configuredOrigins.includes("*") ||
                origin.includes("localhost") ||
                origin.includes("127.0.0.1") ||
                origin.endsWith(".vercel.app") ||
                origin.endsWith(".onrender.com")
            ) {
                return callback(null, true);
            }
            return callback(null, true); // Permissive fallback for deployment previews
        },
        credentials: true,
        methods: ["GET", "PUT", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.get("/", (req, res) => {
    res.json({ message: "Civic Pulse API Server Running" });
});

// Route Mounting
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/complaints", complaintRouter);
app.use("/api/wellness", wellnessRouter);
app.use("/api/voice-complaints", voiceComplaintRouter);

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;