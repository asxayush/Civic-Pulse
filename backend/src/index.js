import dotenv from "dotenv"
import ConnectDB from "./db/schema.js";
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import app from "./app.js"

dotenv.config({
    path: "./.env"
})

const port = process.env.PORT || 3000

ConnectDB()
.then(() => {
    app.listen(port, () => {
        console.log(`CIVIC PULSE IS CONNECTED TO http://localhost:${port}`);
        
    })
})

.catch((err) => {
    console.error("MONGODB CONNECTION ERR", err)
    process.exit(1)
})
