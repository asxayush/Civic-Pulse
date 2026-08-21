import app from "../src/app.js";
import ConnectDB from "../src/db/schema.js";

let connectionPromise;

const handler = async (req, res) => {
    try {
        if (!connectionPromise) {
            connectionPromise = ConnectDB();
        }
        await connectionPromise;
        return app(req, res);
    } catch (error) {
        connectionPromise = undefined;
        console.error("[DATABASE] Serverless request could not connect:", error);
        return res.status(503).json({
            success: false,
            message: "Database temporarily unavailable"
        });
    }
};

export default handler;
