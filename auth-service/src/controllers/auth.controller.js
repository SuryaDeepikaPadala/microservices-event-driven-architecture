const RefreshToken = require("../models/refreshToken.model")
const User = require("../models/user.model")
const logger = require("../utils/logger")

const generateToken = require("../utils/token")
const { registerSchemavalidation, loginSchemaValidation } = require("../utils/validation")


const registerUser=async(req,res)=>{
  const {username,email,password}=req.body
  try {
    logger.info("Register end point hit")
    const {error}=await registerSchemavalidation(req.body)
    if(error)
    {
      logger.warn(error.details[0].message)
      return res.status(400).json({
        success:false,
        message:error.details[0].message
      })
    }
    let user=await User.findOne({email:email})
    if(user)
    {
      logger.warn("Email already registered")
      return res.status(400).json({
        success:false,
        message:"Email already registered"
      })
    }
    user=await User.create({
      username,
      email,
      password
    })
    const {accessToken,refreshToken,}=await generateToken(user)
    logger.info("Account created successfully")
    res.status(201).json({
      success:true,
      message:"Account Created Successfully",
      accessToken,
      refreshToken
    })
  } catch (error) {
    
    logger.error("Error occured at registeration",error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
const loginUser=async(req,res)=>{
  logger.info("login end point hit ")
  const {email,password}=req.body
  try {
    const {error}=await loginSchemaValidation({email,password})
    if(error)
      {
        logger.warn(error.details[0].message)
        return res.status(400).json({
          success:false,
          message:error.details[0].message
        })
      }
      const user=await User.findOne({email})
      if(!user)
      {
        logger.warn("Invalid Credentials")
        return res.status(403).json({
          success:false,
          message:"Invalid Credentials"
        })
      }
      if(!await user.comparePassword(password))
      {
        logger.warn("Invalid Credentials")
         return res.status(403).json({
          success:false,
          message:"Invalid Credentials"
        })
      }
      const {accessToken,refreshToken}=await generateToken(user)
      logger.info("User Logged In Successfully")
      res.status(201).json({
        success:true,
        message:"User LoggedIn Successfully",
        accessToken,
        refreshToken
      })
  } catch (error) {
    logger.error("Error occured at login",error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
const refreshTokenHandler=async(req,res)=>{
  logger.info("Refresh endpoint hit")
  const {token}=req.body
  if(!token)
  {
    logger.warn("Token Not Found")
    res.status(400).json({
      success:false,
      message:"Token Not Found"
    })
  }
  try {
    const findToken=await RefreshToken.findOne({token})
    if(!findToken)
    {
      logger.warn("Invalid Refresh Token")
      res.status(401).json({
        success:false,
        message:"Invalid Refresh Token"
      })
    }
    if(findToken.expiresAt<new Date())
    {
      logger.warn("Refresh Token Expired")
      res.status(401).json({
        success:false,
        message:"Refresh Token Expired.Login again"
      })
      await findToken.deleteOne()
    }
    const user=await User.findById(findToken.user)
    if(!user)
    {
      logger.warn("User Not Found")
      res.status(404).json({
        success:false,
        message:"User not found"
      })
    }
    await findToken.deleteOne()
    const {accessToken,refreshToken}=await generateToken(user)
    res.json({
      success:true,
      accessToken,
      refreshToken
    })
  } catch (error) {
     logger.error("Error occured at refresh token",error)
    res.status(500).json({
      success:false,
      message:"Internal server error"
    })
  }
}
module.exports={registerUser,loginUser,refreshTokenHandler}