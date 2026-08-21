import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import complaintRouter from "./routes/complaint.routes.js";
import wellnessRouter from "./routes/wellness.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Basic Express server setup
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// CORS Configuration - Permissive for dev environments
app.use(
    cors({
        origin: (origin, callback) => {
            // Allow all localhost ports or non-browser requests
            if (!origin || origin.includes("localhost") || origin.includes("127.0.0.1")) {
                return callback(null, true);
            }
            return callback(null, true);
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

// Centralized Error Handling Middleware
app.use(errorHandler);

export default app;