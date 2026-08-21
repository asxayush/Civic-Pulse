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

export const uploadToCloudinary = async (buffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "civic_pulse_complaints" },
            (error, result) => {
                if (error) {
                    return reject(new ApiError(500, "Cloudinary upload failed: " + error.message));
                }
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
};
