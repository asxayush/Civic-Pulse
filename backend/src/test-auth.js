import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import ConnectDB from "./db/schema.js";
import { User } from "./models/user.models.js";
import { OTP } from "./models/otp.models.js";
import app from "./app.js";

async function testBackend() {
    console.log("Connecting to MongoDB Atlas...");
    try {
        await ConnectDB();
        console.log("MongoDB connection SUCCESS!");

        const testEmail = "teststudent@yourcollege.edu.in";
        await User.deleteMany({ email: testEmail });
        await OTP.deleteMany({ email: testEmail });

        console.log("Database query SUCCESS! Cleaned up test email.");
        process.exit(0);
    } catch (err) {
        console.error("Test failed with error:", err);
        process.exit(1);
    }
}

testBackend();
