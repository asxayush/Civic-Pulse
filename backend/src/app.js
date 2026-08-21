import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import adminRouter from "./routes/admin.routes.js";
import complaintRouter from "./routes/complaint.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Basic Express server setup
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// CORS Configuration
app.use(
    cors({
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
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

// Centralized Error Handling Middleware (must be attached after routes)
app.use(errorHandler);

export default app;