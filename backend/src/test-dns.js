import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

console.log("URI:", process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log("SUCCESSFULLY CONNECTED TO MONGODB ATLAS!");
    process.exit(0);
})
.catch((err) => {
    console.error("MONGODB ATLAS ERROR:", err.message);
    process.exit(1);
});
