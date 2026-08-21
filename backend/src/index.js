import "dotenv/config";
import dns from "dns";
import ConnectDB from "./db/schema.js";
import app from "./app.js";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

const port = process.env.PORT || 8000;

if (process.env.GEMINI_API_KEY) {
    console.log("[ENV] GEMINI_API_KEY loaded");
} else {
    console.log("[ENV] GEMINI_API_KEY missing — AI will use heuristics");
}

ConnectDB()
    .then(() => {
        app.listen(port, () => {
            console.log(`[SERVER] Civic Pulse API connected & listening at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.error("MONGODB CONNECTION ERROR:", err);
        process.exit(1);
    });
