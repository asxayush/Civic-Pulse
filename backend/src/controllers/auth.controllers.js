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

    const findUser = await User.findById(user._id).select("-password") // exclude password from the response 

    return res
    .status(201)
    .json(
        new ApiResponse(201,
            findUser,
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

    const isPasswordvalid = await bcrypt.compare(password, existedUser.password)
    if(!isPasswordvalid) {
        throw new ApiError(404, "password is not correct")
    }

    const token = jwt.sign (
        {
            _id: existedUser._id,
            role: existedUser.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_SECRET_EXPIRY
        }
    )

    const user = await User.findById(existedUser._id).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {user,token},
            "user logged in successfully"
        )
    )
})

export{
    registerUser,
    loginUser
}