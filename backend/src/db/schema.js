import mongoose from "mongoose";

const ConnectDB = async () => {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/civic_pulse";
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log(`[DATABASE] Connected successfully to MongoDB: ${uri}`);
    } catch (error) {
        console.warn(`[DATABASE WARNING] Primary connection to ${uri} failed: ${error.message}`);
        console.log("[DATABASE] Attempting fallback to local MongoDB (mongodb://127.0.0.1:27017/civic_pulse)...");
        try {
            await mongoose.connect("mongodb://127.0.0.1:27017/civic_pulse", { serverSelectionTimeoutMS: 5000 });
            console.log("[DATABASE] Successfully connected to fallback local MongoDB!");
        } catch (fallbackError) {
            console.error("[DATABASE CRITICAL] Could not connect to any MongoDB instance:", fallbackError.message);
            throw fallbackError;
        }
    }
};

export default ConnectDB;