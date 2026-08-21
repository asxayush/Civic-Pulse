import mongoose from "mongoose";

console.log("Testing local MongoDB connection at mongodb://127.0.0.1:27017/civic_pulse...");

mongoose.connect("mongodb://127.0.0.1:27017/civic_pulse", {
    serverSelectionTimeoutMS: 3000
})
.then(() => {
    console.log("SUCCESSFULLY CONNECTED TO LOCAL MONGODB!");
    process.exit(0);
})
.catch((err) => {
    console.error("LOCAL MONGODB ERROR:", err.message);
    process.exit(1);
});
