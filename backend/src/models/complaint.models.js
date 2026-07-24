import mongoose, {Schema} from "mongoose"

const complaintSchema = new Schema(
    {
        ticketId: {
            type: String,
            unique: true
        },
        title: {
            type: String,
            required: true
        }
    }
)
