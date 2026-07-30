import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandlers.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import {User} from "../models/user.models.js"

const registerUser = asyncHandler(async (req, res) => {
    const {name, email, password} = req.body

    if(!email || !password){
        throw new ApiError(400, "email and password are required")
    }

    const existedUser = await User.findOne({
        email
    })

    if(existedUser){
        throw new ApiError (409, "email already registered to our platform")
    }

    const user = await User.create(
        {   name,
            email,
            password,
            role: "student"
        }
    )

    User.findById(user._id).select("-password") // exclude password from the response 

    return res
    .status(201)
    .json(
        new ApiResponse(201,
            user,
            "user registered successfully"
        )
    )
})

const loginUser = asyncHandler(async(req, res) => {
    const {email, password} = req.body

    if(!email || !password){
        throw new ApiError(400, "email and password are required")
    }

    const existedUser = await User.findOne({email})
    if(!existedUser){
        throw new ApiError (409, "your email is not registered with our platform")
    }

    
})

export{
    registerUser
}