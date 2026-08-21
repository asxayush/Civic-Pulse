import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
    // Fallback if SMTP environment variables are not configured in local development
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log(`\n==========================================`);
        console.log(`[LOCAL DEV MODE] Email OTP for ${email}: ${otp}`);
        console.log(`==========================================\n`);
        return true;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: `"Civic Pulse Admin" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Civic Pulse — Verification Code (OTP)",
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>Welcome to Civic Pulse!</h2>
                <p>Your one-time email verification OTP code is:</p>
                <h1 style="color: #2563eb; letter-spacing: 4px;">${otp}</h1>
                <p>This code is valid for <strong>5 minutes</strong>. Do not share it with anyone.</p>
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
    return true;
};

export const sendNotificationEmail = async ({ to, subject, title, message }) => {
    if (!to) return false;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log(`[LOCAL DEV MODE] Notification for ${to}: ${subject} — ${message}`);
        return true;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transporter.sendMail({
        from: `"Civic Pulse" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: `<div style="font-family:Arial,sans-serif;color:#222"><h2>${title}</h2><p>${message}</p></div>`
    });
    return true;
};
