import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { ApiError } from "./api-error.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new ApiError(400, "Only image files are allowed"), false);
        }
    }
});

export const uploadAudio = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ["audio/webm", "audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp3", "audio/ogg"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new ApiError(400, "Only WEBM, MP3, WAV, or OGG audio is allowed"), false);
        }
    }
});

export const uploadToCloudinary = async (buffer, mimetype = "image/jpeg") => {
    // If Cloudinary API credentials are dummy or default in dev mode, convert buffer to Data URI
    if (!process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET === "your_api_secret" || process.env.CLOUDINARY_CLOUD_NAME === "demo") {
        console.log("[STORAGE] Cloudinary in dev fallback mode. Converting image buffer to Data URI.");
        const base64 = buffer.toString("base64");
        return `data:${mimetype};base64,${base64}`;
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "civic_pulse_complaints" },
            (error, result) => {
                if (error) {
                    console.warn("[STORAGE WARNING] Cloudinary upload failed, using Data URI fallback:", error.message);
                    const base64 = buffer.toString("base64");
                    return resolve(`data:${mimetype};base64,${base64}`);
                }
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};

export const uploadAudioToCloudinary = async (buffer, mimetype = "audio/webm") => {
    if (!process.env.CLOUDINARY_API_SECRET || process.env.CLOUDINARY_API_SECRET === "your_api_secret" || process.env.CLOUDINARY_CLOUD_NAME === "demo") {
        const base64 = buffer.toString("base64");
        return `data:${mimetype};base64,${base64}`;
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "civic_pulse_voice_complaints", resource_type: "video" },
            (error, result) => {
                if (error) {
                    console.warn("[STORAGE WARNING] Audio upload failed, using Data URI fallback:", error.message);
                    const base64 = buffer.toString("base64");
                    return resolve(`data:${mimetype};base64,${base64}`);
                }
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};
