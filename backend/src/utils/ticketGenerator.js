import { Complaint } from "../models/complaint.models.js";

export const generateTicketId = async () => {
    const count = await Complaint.countDocuments();
    const currentYear = new Date().getFullYear();
    const formattedCount = String(count + 1).padStart(5, '0');
    return `CP-${currentYear}-${formattedCount}`;
};
