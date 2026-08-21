import "dotenv/config";
import dns from "dns";
import mongoose from "mongoose";
import ConnectDB from "./db/schema.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);
import { User } from "./models/user.models.js";

const accounts = [
    {
        name: "Campus Chief Admin",
        email: "admin@yourcollege.edu.in",
        password: "AdminPassword123!",
        role: "admin"
    },
    {
        name: "Verma Electrician",
        email: "electrician@yourcollege.edu.in",
        password: "StaffPassword123!",
        role: "staff",
        department: "electricity"
    },
    {
        name: "Ramesh Kumar Plumbing",
        email: "plumbing@yourcollege.edu.in",
        password: "StaffPassword123!",
        role: "staff",
        department: "water"
    },
    {
        name: "Suresh Mess Manager",
        email: "mess@yourcollege.edu.in",
        password: "StaffPassword123!",
        role: "staff",
        department: "food"
    },
    {
        name: "Campus Maintenance Officer",
        email: "maintenance@yourcollege.edu.in",
        password: "StaffPassword123!",
        role: "staff",
        department: "miscellaneous"
    },
    {
        name: "Aarav Sharma",
        email: "student@yourcollege.edu.in",
        password: "StudentPassword123!",
        role: "student"
    }
];

const ensureDemoUsers = async () => {
    await ConnectDB();

    for (const account of accounts) {
        const existing = await User.findOne({ email: account.email });
        if (existing) {
            console.log(`Already exists: ${account.email}`);
            continue;
        }

        await User.create({ ...account, isVerified: true });
        console.log(`Created: ${account.email}`);
    }

    await mongoose.connection.close();
    console.log("Demo account setup complete. Existing data was not deleted.");
};

ensureDemoUsers().catch(async (error) => {
    console.error("Demo account setup failed:", error.message);
    await mongoose.connection.close().catch(() => { });
    process.exitCode = 1;
});
