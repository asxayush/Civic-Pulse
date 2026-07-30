import mongoose, {Schema} from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new Schema (
    {
            name: {
                type: String,
                required: true,
                
            },
            email: {
                type: String,
                required: true,
                unique: true,
                
            },
            password: {
                type: String,
                required: [true, "Password is required"],
            },
            
            role: {
                    type: String,
                    default: "student", 
                    enum: ["student", "staff", "admin"]
                },
            department: {
                type: String,
                enum: ["electricity", "water", "food", "miscellaneous"],
                required: function () {
                    return this.role === "staff"
                }
            },
            invalidComplaintCount: {
                type: Number,
                default: 0
            },
            isBanned: {
                type: Boolean,
                default: false
            },
                  
    },
     { timestamps: true }
)

userSchema.pre('save', async function () {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
})

export const User = mongoose.model("User", userSchema)
