import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

dns.setServers(["8.8.8.8", "1.1.1.1"]);

console.log("Testing Mongoose connect with Google DNS 8.8.8.8...");

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 8000
})
.then(() => {
    console.log("SUCCESSFULLY CONNECTED TO MONGODB ATLAS WITH GOOGLE DNS!");
    process.exit(0);
})
.catch((err) => {
    console.error("MONGODB ATLAS ERROR:", err.message);
    process.exit(1);
});
