import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asyncHandlers.js"
import { ApiError } from "../utils/api-error.js"
import { ApiResponse } from "../utils/api-response.js"
import {User} from "mongoose"

// jwt decode code to be written 

export const verifyJWT = asyncHandler (async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ","")

    if(!token) {
        throw new ApiError (401, "Unauthorized access")
    }

        try {
       const decodedToken  =  jwt.verify(token, process.env.JWT_SECRET)
       console.log("DECODED:", decodedToken)
      const user =  await User.findById(decodedToken?._id).select( "-password")
      console.log("USER:", user)


      if(!user){
        console.log("JWT ERROR:", error.message) 
        throw new ApiError(401, "invalid access token")
      }
      req.user = user
      next()
    } catch (error) {
        throw new ApiError(401, "invalid access token")
    }
}
)
