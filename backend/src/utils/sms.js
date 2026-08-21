import twilio from "twilio";

let twilioClient;

const getTwilioClient = () => {
    if (twilioClient) return twilioClient;

    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return null;

    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    return twilioClient;
};

export const sendEmergencySms = async ({ summary, category, location, audioUrl }) => {
    const client = getTwilioClient();
    const to = process.env.ADMIN_PHONE_NUMBER;
    const from = process.env.TWILIO_FROM_NUMBER;

    if (!client || !to || !from) {
        console.log("[SMS] Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, and ADMIN_PHONE_NUMBER.");
        return false;
    }

    const message = [
        "CIVIC PULSE EMERGENCY",
        `${category || "Safety"}: ${summary || "Immediate review required."}`,
        location ? `Location: ${location}` : "",
        audioUrl ? `Audio: ${audioUrl}` : ""
    ].filter(Boolean).join("\n").slice(0, 1500);

    await client.messages.create({ body: message, from, to });
    return true;
};
