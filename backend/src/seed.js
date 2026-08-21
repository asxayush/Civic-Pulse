import dotenv from "dotenv";
dotenv.config();
import ConnectDB from "./db/schema.js";
import { User } from "./models/user.models.js";
import { Complaint } from "./models/complaint.models.js";

async function seedDatabase() {
    console.log("=== Seeding Civic Pulse Database ===");
    await ConnectDB();

    try {
        await User.deleteMany({});
        await Complaint.deleteMany({});
        console.log("-> Cleared stale collections.");

        // 1. Create Default Admin
        const adminEmail = "admin@yourcollege.edu.in";
        const admin = await User.create({
            name: "Campus Chief Admin",
            email: adminEmail,
            password: "AdminPassword123!",
            role: "admin",
            isVerified: true
        });
        console.log("-> Created Admin Account:", adminEmail, "/ AdminPassword123!");

        // 2. Create Staff Accounts per department
        const departments = [
            { name: "Verma Electrician", email: "electrician@yourcollege.edu.in", dept: "electricity" },
            { name: "Ramesh Kumar Plumbing", email: "plumbing@yourcollege.edu.in", dept: "water" },
            { name: "Suresh Mess Manager", email: "mess@yourcollege.edu.in", dept: "food" },
            { name: "Campus Maintenance Officer", email: "maintenance@yourcollege.edu.in", dept: "miscellaneous" }
        ];

        for (const staffData of departments) {
            await User.create({
                name: staffData.name,
                email: staffData.email,
                password: "StaffPassword123!",
                role: "staff",
                department: staffData.dept,
                isVerified: true
            });
            console.log(`-> Created Staff (${staffData.dept}):`, staffData.email, "/ StaffPassword123!");
        }

        // 3. Create Sample Student Account
        const studentEmail = "student@yourcollege.edu.in";
        const student = await User.create({
            name: "Aarav Sharma",
            email: studentEmail,
            password: "StudentPassword123!",
            role: "student",
            isVerified: true
        });
        console.log("-> Created Verified Student:", studentEmail, "/ StudentPassword123!");

        // 4. Create Sample Grievances
        const electricityStaff = await User.findOne({ role: "staff", department: "electricity" });
        const waterStaff = await User.findOne({ role: "staff", department: "water" });

        await Complaint.create({
            ticketId: "CP-2026-00001",
            title: "Hostel Block B - Power Outage on Floor 3",
            description: "Main circuit breaker tripped in Block B 3rd floor corridor. All lights and sockets are dead since 2 PM.",
            category: "electricity",
            hostelBlock: "Block B - Floor 3",
            imageProof: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
            isAnonymous: false,
            filedBy: student._id,
            assignedTo: electricityStaff?._id || null,
            status: "PENDING",
            priority: "normal",
            aiAnalysis: {
                predictedCategory: "electricity",
                confidenceScore: 0.95,
                suggestedPriority: "normal",
                aiSummary: "AI verified electrical power trip in Block B Floor 3.",
                detectedObjects: ["electrical circuit", "circuit breaker"]
            },
            filedAt: new Date(),
            lastUpdatedAt: new Date(),
            statusHistory: [{
                from: null,
                to: "PENDING",
                changedBy: student._id,
                changedAt: new Date(),
                note: "Initial grievance filed & auto-routed to Electricity staff."
            }]
        });

        await Complaint.create({
            ticketId: "CP-2026-00002",
            title: "Block C Floor 2 - High Water Pressure Pipe Leakage",
            description: "Overhead supply pipe leaking continuously in washroom near room 204. Water splashing onto floor.",
            category: "water",
            hostelBlock: "Block C - Floor 2",
            imageProof: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
            isAnonymous: true,
            filedBy: student._id,
            assignedTo: waterStaff?._id || null,
            status: "IN_PROGRESS",
            priority: "high",
            aiAnalysis: {
                predictedCategory: "water",
                confidenceScore: 0.92,
                suggestedPriority: "high",
                aiSummary: "AI verified active plumbing pipe leak in Block C Floor 2.",
                detectedObjects: ["plumbing pipe", "water leakage"]
            },
            upvotes: [student._id],
            filedAt: new Date(Date.now() - 3 * 3600 * 1000),
            lastUpdatedAt: new Date(Date.now() - 1 * 3600 * 1000),
            statusHistory: [{
                from: "PENDING",
                to: "IN_PROGRESS",
                changedBy: waterStaff?._id,
                changedAt: new Date(),
                note: "Plumbing team dispatched."
            }]
        });

        console.log("-> Created sample initial grievances for demonstration!");
        console.log("\n✅ Database Seeding Complete!");
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding Error:", err.message);
        process.exit(1);
    }
}

seedDatabase();
