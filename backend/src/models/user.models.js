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

userSchema.pre('save', async function(next) {

    if(!this.isModified("password")) return next()
    this.password =  await bcrypt.hash(this.password, 10)
    next()
})

export const User = mongoose.model("User", userSchema)
