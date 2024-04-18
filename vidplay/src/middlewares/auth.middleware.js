import { asyncHandler } from "../utils/asyncHandler";
import { apiError } from "../utils/apiError"; 
import jwt from 'jsonwebtoken'
import {User} from '../models/user.model'

export const verifyjwt =asyncHandler(async (req, res, next)=> {
  try {
      req.cookies?.accessToken || req.header(authorization)?.replace('Bearer ', '') || req.query?.accessToken  
      if(!token) {
          throw new apiError(401,'Unauthorized')
      }
      const decodedToken=jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      const user= await User.findById(decodedToken?._id).select("-password -refreshToken")
  
      if(!user) {
          throw new apiError(401,'Unauthorized')
      }
  
      req.user=user
  } catch (error) {
    throw new apiError(401,error.message||"Invalid token")  
  }
    next()

}) 

 