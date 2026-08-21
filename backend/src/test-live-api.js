import mongoose from "mongoose";
import { User } from "./models/user.models.js";
import { OTP } from "./models/otp.models.js";

async function selfTestAuthAPI() {
    console.log("\n==========================================");
    console.log("   SELF-TESTING LIVE BACKEND AUTH & OTP   ");
    console.log("==========================================\n");

    const BASE_URL = "http://localhost:8000/api/auth";
    const testEmail = "authtester@yourcollege.edu.in";
    const testPassword = "Password123!";
    const testName = "API Tester";

    // Step 0: Connect DB for verification
    await mongoose.connect("mongodb://127.0.0.1:27017/civic_pulse");
    await User.deleteMany({ email: testEmail });
    await OTP.deleteMany({ email: testEmail });

    // Step 1: Register User
    console.log("[TEST 1] Registering user:", testEmail);
    const regRes = await fetch(`${BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: testName, email: testEmail, password: testPassword })
    });
    const regData = await regRes.json();
    console.log("Register Response Status:", regRes.status, regData.message);

    if (regRes.status !== 201) {
        throw new Error("Registration failed: " + JSON.stringify(regData));
    }

    // Step 2: Fetch Generated OTP from DB
    const otpDoc = await OTP.findOne({ email: testEmail });
    if (!otpDoc) {
        throw new Error("OTP document not generated in MongoDB!");
    }
    console.log("[TEST 2] Generated OTP from DB:", otpDoc.otp);

    // Step 3: Verify OTP
    console.log("[TEST 3] Verifying OTP via /verify-otp API...");
    const verifyRes = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, otp: otpDoc.otp })
    });
    const verifyData = await verifyRes.json();
    console.log("Verify OTP Response Status:", verifyRes.status, verifyData.message);

    if (verifyRes.status !== 200 || !verifyData.data?.token) {
        throw new Error("Verify OTP failed: " + JSON.stringify(verifyData));
    }
    const token = verifyData.data.token;
    console.log("JWT Token received successfully!");

    // Step 4: Login User
    console.log("[TEST 4] Logging in via /login API...");
    const loginRes = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const loginData = await loginRes.json();
    console.log("Login Response Status:", loginRes.status, loginData.message);

    if (loginRes.status !== 200) {
        throw new Error("Login failed: " + JSON.stringify(loginData));
    }

    // Step 5: Test Google SSO
    console.log("[TEST 5] Testing Google SSO via /google API...");
    const googleRes = await fetch(`${BASE_URL}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "google.tester@yourcollege.edu.in", name: "Google Tester" })
    });
    const googleData = await googleRes.json();
    console.log("Google SSO Response Status:", googleRes.status, googleData.message);

    if (googleRes.status !== 200) {
        throw new Error("Google SSO failed: " + JSON.stringify(googleData));
    }

    // Step 6: Test /me endpoint
    console.log("[TEST 6] Fetching current user via /me API...");
    const meRes = await fetch(`${BASE_URL}/me`, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const meData = await meRes.json();
    console.log("Me Response Status:", meRes.status, "User Name:", meData.data?.name);

    console.log("\n==========================================");
    console.log("   ALL BACKEND AUTH & OTP TESTS PASSED!   ");
    console.log("==========================================\n");

    process.exit(0);
}

selfTestAuthAPI().catch((err) => {
    console.error("\n[SELF-TEST FAILED]:", err.message);
    process.exit(1);
});
