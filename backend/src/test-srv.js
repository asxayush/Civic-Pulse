import dns from "dns";

dns.resolveSrv("_mongodb._tcp.cluster0.zasiq7c.mongodb.net", (err, addresses) => {
    if (err) {
        console.error("DNS SRV Lookup Error:", err.code, err.message);
    } else {
        console.log("SRV Addresses found:", addresses);
    }
});
